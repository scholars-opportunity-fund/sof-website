'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import type { BrainPhase } from '@/lib/brain/scene';
import { brainRegions } from '@/lib/brain/regions';
import { useExplorer } from './BrainContext';
import SignalField from '@/components/signal/SignalField';
import styles from './BrainExperience.module.css';

const smooth = (value: number) => { const p = Math.max(0, Math.min(1, value)); return p * p * (3 - 2 * p); };
// The rendered clip carries the stage timeline up to the formed moment (9.4 of 12); the code carries the rest.
const FORMED = 9.4;
const START_BUDGET = 2500;
const STALL_BUDGET = 1500;
const SWAP_FADE = 250;
const CLIPS = { landscape: { src: '/brain/intro-16x9.mp4', aspect: 16 / 9 }, portrait: { src: '/brain/intro-9x16.mp4', aspect: 9 / 16 } };

export default function BrainExperience({ fallback }: { fallback: ReactNode }) {
  const { scene, setAvailable, active, setHovered, setFocused, setSelected, zoom, setZoom, setFollowScroll, reset } = useExplorer();
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const word = useRef<HTMLParagraphElement>(null);
  const letters = useRef<HTMLSpanElement>(null);
  const navigation = useRef(0);
  const time = useRef(0);
  const navWord = useRef<HTMLElement | null>(null);
  const skipRequested = useRef(false);
  // Read by the clip loop so a frame already queued cannot repaint after Skip, scroll, or failure.
  const playing = useRef(false);
  const failedRef = useRef(false);
  const attempts = useRef(0);
  const swapStartedAt = useRef(0);
  const [phase, setPhase] = useState<BrainPhase>('loading');
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [exploring, setExploring] = useState(false);
  const [lightVisible, setLightVisible] = useState(false);
  const [clip, setClip] = useState<{ src: string; aspect: number } | null>(null);
  const [swapping, setSwapping] = useState(false);
  // Development-only capture mode for the clip's keyframes: `?pose=formed` shows the model at its formed pose, `?pose=empty` the bare stage.
  const [pose, setPose] = useState<'formed' | 'empty' | null>(null);
  const activeRegion = brainRegions.find(region => region.id === active);

  const paint = useCallback((seconds: number) => {
    time.current = seconds;
    setLightVisible(seconds >= 9.6);
    const element = root.current;
    if (!element) return;
    const nav = navigation.current;
    const light = smooth(seconds - 9.6);
    element.style.setProperty('--light', String(light));
    element.style.setProperty('--stage-color', `rgb(${11 + 232 * light},${18 + 227 * light},${33 + 215 * light})`);
    element.style.setProperty('--word-color', `rgb(${243 - 232 * light},${245 - 227 * light},${248 - 215 * light})`);
    element.style.setProperty('--word-opacity', String(seconds < 8 ? 0 : 1 - smooth((nav - .78) / .2)));
    element.style.setProperty('--subtitle-opacity', seconds > 9.9 && nav < .05 ? '1' : '0');
    element.style.setProperty('--cue-opacity', seconds > 10.4 && nav < .05 ? '1' : '0');
    if (letters.current) letters.current.textContent = 'SOF'.slice(0, Math.min(3, Math.floor(Math.max(0, (seconds - 8.1) / 1.1) * 3.999)));
    const destination = navWord.current;
    if (word.current && destination) {
      word.current.style.transform = 'none';
      if (nav > 0 && nav < 1) {
        const from = word.current.getBoundingClientRect(), to = destination.getBoundingClientRect();
        const k = smooth(nav / .9);
        word.current.style.transform = `translate(${(to.left - from.left) * k}px,${(to.top - from.top) * k}px) scale(${1 + (to.height / from.height - 1) * k})`;
      }
      destination.style.opacity = String(failedRef.current ? 1 : smooth((nav - .78) / .2));
    }
  }, []);

  const finish = useCallback(() => {
    skipRequested.current = true; playing.current = false; swapStartedAt.current = 0;
    const element = video.current;
    if (element) { element.pause(); element.removeAttribute('src'); element.load(); }
    setSwapping(false); setPhase('still'); paint(12);
  }, [paint]);
  const fail = useCallback(() => { scene.current?.dispose(); scene.current = null; failedRef.current = true; setFailed(true); setReady(false); setAvailable(false); finish(); }, [scene, setAvailable, finish]);

  // Start the clip as soon as the page mounts, while the model loads in the background. A second failure stops retrying.
  const start = useCallback(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
    if (preference || saveData || attempts.current >= 2) { finish(); return; }
    attempts.current += 1;
    playing.current = true;
    setSwapping(false);
    setClip(innerWidth < innerHeight ? CLIPS.portrait : CLIPS.landscape);
    setPhase('forming');
    paint(0);
  }, [finish, paint]);

  useEffect(() => {
    navWord.current = document.querySelector<HTMLElement>('[data-nav-word]');
    if (process.env.NODE_ENV === 'development') {
      const requested = new URLSearchParams(window.location.search).get('pose');
      if (requested === 'formed' || requested === 'empty') { setPose(requested); setPhase('forming'); return; }
    }
    if (skipRequested.current || navigation.current > .02) { finish(); return; }
    start();
  }, [finish, start]);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const abort = new AbortController();
    setFollowScroll(false);
    import('@/lib/brain/scene').then(module => module.createBrainScene(element, {
      hover: setHovered, select: setSelected, move: () => setHovered(null), zoom: setZoom, failed: fail,
    }, abort.signal)).then(engine => {
      if (abort.signal.aborted) { engine.dispose(); return; }
      scene.current = engine; engine.setNavigation(navigation.current);
      setReady(true); setAvailable(true);
    }).catch(() => { if (!abort.signal.aborted) fail(); });
    return () => {
      abort.abort(); scene.current?.dispose(); scene.current = null;
      const destination = navWord.current;
      if (destination) destination.style.removeProperty('opacity');
    };
  }, [scene, setAvailable, setHovered, setSelected, setFollowScroll, setZoom, fail]);
  useEffect(() => { scene.current?.setRegion(active); }, [active, ready, scene]);
  useEffect(() => { scene.current?.setZoom(zoom); }, [zoom, ready, scene]);
  useEffect(() => { scene.current?.setPhase(phase); if (phase === 'forming') scene.current?.setTime(pose ? FORMED : time.current); }, [phase, ready, scene, pose]);
  useEffect(() => { scene.current?.setClipAspect(pose ? (innerWidth < innerHeight ? 9 / 16 : 16 / 9) : clip?.aspect ?? null); }, [ready, scene, clip, pose]);

  // The clip drives the timeline until it ends; then the model takes over and the code clock runs 9.4 to 12.
  useEffect(() => {
    if (phase !== 'forming' || pose || !clip) return;
    const element = video.current;
    if (!element) return;
    let cancelled = false, frame = 0, startTimer = 0, startedAt = 0;
    const bail = () => { if (!cancelled && playing.current && !swapStartedAt.current) finish(); };
    element.src = clip.src;
    element.currentTime = 0;
    startTimer = window.setTimeout(() => { if (element.paused || element.currentTime === 0) bail(); }, START_BUDGET);
    const onPlaying = () => { clearTimeout(startTimer); if (!startedAt) startedAt = performance.now(); };
    element.addEventListener('playing', onPlaying);
    element.addEventListener('error', bail);
    element.play().catch(bail);
    function tick() {
      frame = 0;
      if (cancelled || !playing.current || !element) return;
      if (swapStartedAt.current) {
        // The clock holds at the formed moment while the clip fades, so the model does not start moving under the crossfade.
        const seconds = Math.min(12, FORMED + Math.max(0, performance.now() - swapStartedAt.current - SWAP_FADE) / 1000);
        paint(seconds); scene.current?.setTime(seconds);
        if (seconds >= 12) { playing.current = false; swapStartedAt.current = 0; setPhase('still'); return; }
      } else if (element.ended) {
        // Hold on the last frame until the model is ready (R10), then reveal it under the clip and fade the clip away.
        if (scene.current) { swapStartedAt.current = performance.now(); setSwapping(true); paint(FORMED); scene.current.setTime(FORMED); }
      } else if (element.duration) {
        // Stall watchdog: once the clip has fallen a budget's worth behind the wall clock, whether in one buffering pause or many stutters, it is cut for the still.
        if (startedAt && performance.now() - startedAt - element.currentTime * 1000 > STALL_BUDGET) { bail(); return; }
        const seconds = FORMED * Math.min(1, element.currentTime / element.duration);
        paint(seconds); scene.current?.setTime(seconds);
      }
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => {
      cancelled = true; cancelAnimationFrame(frame); clearTimeout(startTimer);
      element.removeEventListener('playing', onPlaying); element.removeEventListener('error', bail);
    };
  }, [phase, clip, pose, scene, paint, finish]);

  useEffect(() => {
    let frame = 0;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    function update() {
      frame = 0;
      const element = root.current;
      if (!element) return;
      const box = element.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (72 - box.top) / Math.max(1, box.height - (innerHeight - 72))));
      navigation.current = preference.matches ? (progress > .2 ? 1 : 0) : smooth(progress / .4);
      setExploring(navigation.current > .6);
      scene.current?.setNavigation(navigation.current);
      if (pose) return;
      if (progress > .02 && playing.current) finish();
      else if (progress > .02) skipRequested.current = true;
      paint(progress > .02 ? 12 : time.current);
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true }); window.addEventListener('resize', schedule); preference.addEventListener('change', schedule);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); preference.removeEventListener('change', schedule); };
  }, [scene, paint, finish, pose]);

  function replay() {
    reset(); skipRequested.current = false; swapStartedAt.current = 0;
    window.scrollTo({ top: root.current ? window.scrollY + root.current.getBoundingClientRect().top - 72 : 0, behavior: 'instant' });
    navigation.current = 0; scene.current?.setNavigation(0); setExploring(false);
    setPhase('loading');
    scene.current?.setTime(0);
    start();
  }
  const controlsVisible = exploring || failed;
  const forming = phase === 'forming';
  return <section ref={root} className={styles.home} aria-label="Scholars Opportunity Fund — connected intelligence" data-brain data-brain-home data-brain-phase={phase} data-brain-ready={ready} data-brain-failed={failed} data-exploring={exploring} data-swap={swapping} data-brain-pose={pose ?? undefined}>
    <div className={styles.stage} data-startup-stage>
      <div className={styles.field}><SignalField active={lightVisible} /></div>
      <div className={styles.fallback} data-brain-fallback hidden={!failed}>{fallback}</div>
      <canvas ref={canvas} className={styles.canvas} data-brain-canvas data-ready={ready} tabIndex={ready && phase === 'still' ? 0 : -1}
        aria-label="3D brain. Drag to rotate. Pinch or Shift and scroll to zoom. Arrow keys rotate; plus and minus zoom. Select a region to explore it." />
      <video ref={video} className={styles.clip} data-brain-clip data-fading={swapping} hidden={!forming || Boolean(pose) || !clip} muted playsInline preload="auto" aria-hidden="true"
        onPointerUp={event => { if (event.pointerType === 'mouse' && event.button === 0 && !swapping) finish(); }} />
      <div className={styles.wordmark} data-brain-word aria-hidden="true"><div className={styles.wordInner}>
        <p ref={word} className={styles.word}><span ref={letters} /><span className={styles.cursor} /></p>
        <p className={styles.subtitle}>Scholars Opportunity Fund · Salt Lake City</p>
      </div></div>
      <nav className={styles.pins} aria-label="Explore the five areas of SOF" data-brain-navigation data-visible={controlsVisible}>
        {brainRegions.map((region, index) => <Link key={region.id} href={region.href} className={styles.pin} data-pin={region.id} data-active={active === region.id}
          style={{ '--region-color': region.color } as CSSProperties}
          onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(region.id); }} onPointerLeave={() => setHovered(null)}
          onFocus={() => setFocused(region.id)} onBlur={() => setFocused(null)}>
          <span className={styles.pinTitle}><i /><small>0{index + 1}</small>{region.anatomy}</span>
          <span className={styles.plate}><span>{region.description}</span><strong>{region.name} →</strong></span>
        </Link>)}
      </nav>
      {activeRegion && controlsVisible && <div className={styles.selection} data-brain-detail><span>{activeRegion.name}</span><Link href={activeRegion.href}>Explore →</Link><button type="button" aria-label="Clear selected region" onClick={() => { setSelected(null); setHovered(null); }}>×</button></div>}
      <div className={styles.hint} hidden={!controlsVisible}>Drag to orbit <span>Pinch or Shift + scroll to zoom</span><a href="#sof-overview">Explore the fund &darr;</a></div>
      <div className={styles.tools} hidden={!controlsVisible} data-brain-tools data-available={ready} role="group" aria-label="Brain view">
        <button type="button" aria-label="Zoom out" disabled={!ready || zoom <= 1} onClick={() => setZoom(value => Math.max(1, value - .1))}>−</button>
        <button type="button" aria-label="Zoom in" disabled={!ready || zoom >= 1.6} onClick={() => setZoom(value => Math.min(1.6, value + .1))}>+</button>
        <button type="button" disabled={!ready} onClick={reset}>Reset</button><output className="sr-only" aria-label="Brain zoom">{Math.round(zoom * 100)}%</output>
      </div>
      <a href="#sof-overview" className={styles.scrollCue} tabIndex={exploring ? -1 : 0}><span><i /></span>Scroll</a>
      <div className={styles.introControls}>
        {!exploring && forming && !swapping && <button type="button" onClick={finish}>Skip intro</button>}
        <button type="button" disabled={failed} onClick={replay}>Replay</button>
        {controlsVisible && <a href="/brain/attribution.txt">Model credits</a>}
      </div>
      {failed && <p className={styles.status}>3D view unavailable. Explore the fund through the section links.</p>}
      <noscript><style>{`[data-brain-home]{height:auto!important;--stage-color:#F3F5F8}[data-brain-navigation]{visibility:visible!important;opacity:1!important}[data-brain-canvas],[data-brain-clip]{display:none!important}[data-brain-fallback]{display:block!important}`}</style></noscript>
    </div>
  </section>;
}
