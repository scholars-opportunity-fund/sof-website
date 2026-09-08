'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { BrainPhase, RegionAnchor } from '@/lib/brain/scene';
import type { BrainIntro } from '@/lib/brain/intro';
import { isBrainLook, type BrainLookName } from '@/lib/brain/looks';
import { brainRegions } from '@/lib/brain/regions';
import { useExplorer } from './BrainContext';
import SignalField from '@/components/signal/SignalField';
import styles from './BrainExperience.module.css';

const smooth = (value: number) => { const p = Math.max(0, Math.min(1, value)); return p * p * (3 - 2 * p); };
const SPEED = .85;
// The 2D synapse intro carries the formation until the model has loaded, then dissolves into it.
const HOLD_AT = 5;
// The synapse trace owns the stage until it starts dissolving; the model is revealed under the fade.
const REVEAL_AT = 8.2;
// The cinematic intro. The clip is handed over while its brain is still a glowing lattice, so the live
// model performs the last beat itself: the metal skins over on screen and always matches exactly.
// 0.80 is where the clip's market storm has begun to collapse inward. The drawn trace takes it from there
// and builds the brain itself, so the network that flew past you is the thing that forms.
const CLIP = { src: '/brain/intro-market-16x9.mp4', handoff: .8 };
// Page seconds at the moment the clip gives way to the trace, and at the moment the trace gives way to the model.
const TRACE_AT = 6.4;
// The trace is densest just before 8 s of its own build, so the model takes over there rather than later,
// when the drawn network has begun to thin out again.
const HANDOFF_AT = 7.9;
// Act two runs the trace clock slower than real time, to dwell on the formation.
const TRACE_SPEED = .6;
// How long the clip and the trace overlap while one fades into the other.
const TRACE_FADE = 1.1;
const SETTLE = 3.2;
// The trace lingers over the arriving model and dissolves across this long, so neither one pops.
const TRACE_OUT = 2;
const START_BUDGET = 2500;
const STALL_BUDGET = 1500;

export default function BrainExperience({ fallback }: { fallback: ReactNode }) {
  const { scene, setAvailable, active, selected, setHovered, setFocused, setSelected, zoom, setZoom, setFollowScroll, reset } = useExplorer();
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const introCanvas = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const handedOverAt = useRef(0);
  const intro = useRef<BrainIntro | null>(null);
  const word = useRef<HTMLParagraphElement>(null);
  const letters = useRef<HTMLSpanElement>(null);
  const navigation = useRef(0);
  const time = useRef(0);
  const startedAt = useRef(0);
  const held = useRef(0);
  const navWord = useRef<HTMLElement | null>(null);
  const skipRequested = useRef(false);
  // Read by the intro clock so a frame already queued cannot repaint after Skip, scroll, or failure.
  const playing = useRef(false);
  const failedRef = useRef(false);
  const [phase, setPhase] = useState<BrainPhase>('loading');
  const [revealed, setRevealed] = useState(false);
  // null until the mount effect decides; true runs the clip, false runs the 2D synapse trace.
  const [clipMode, setClipMode] = useState<boolean | null>(null);
  // True once the trace has taken over from the clip, which fades the video out from under it.
  const [clipOut, setClipOut] = useState(false);
  // Screen positions of the region markers, reported by the scene each frame.
  const [anchors, setAnchors] = useState<RegionAnchor[]>([]);
  // The region being travelled into, which grows its marker while the camera moves.
  const [entering, setEntering] = useState<string | null>(null);
  const router = useRouter();
  // Development-only finish switch, so the live brain can be compared against the intro clip's ending.
  const [look, setLook] = useState<BrainLookName | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [exploring, setExploring] = useState(false);
  const [lightVisible, setLightVisible] = useState(false);
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
    element.style.setProperty('--word-opacity', String(seconds < 9.5 ? 0 : 1 - smooth((nav - .78) / .2)));
    element.style.setProperty('--subtitle-opacity', seconds > 11 && nav < .05 ? '1' : '0');
    element.style.setProperty('--cue-opacity', seconds > 11.3 && nav < .05 ? '1' : '0');
    if (letters.current) letters.current.textContent = 'SOF'.slice(0, Math.min(3, Math.floor(Math.max(0, (seconds - 9.6) / 1.1) * 3.999)));
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
    skipRequested.current = true; playing.current = false; handedOverAt.current = 0;
    const element = video.current;
    if (element) { element.pause(); element.removeAttribute('src'); element.load(); }
    setRevealed(true); setPhase('still'); paint(12); intro.current?.clear(); scene.current?.setArrival(0);
  }, [paint, scene]);
  const fail = useCallback(() => { scene.current?.dispose(); scene.current = null; failedRef.current = true; setFailed(true); setReady(false); setAvailable(false); finish(); }, [scene, setAvailable, finish]);

  // Decide on mount whether the intro plays, and start it right away while the model loads.
  useEffect(() => {
    navWord.current = document.querySelector<HTMLElement>('[data-nav-word]');
    if (process.env.NODE_ENV === 'development') {
      const query = new URLSearchParams(window.location.search);
      const requestedLook = query.get('look');
      if (isBrainLook(requestedLook)) setLook(requestedLook);
      if (query.get('intro') === 'trace') setClipMode(false);
      const requested = query.get('pose');
      if (requested === 'formed' || requested === 'empty') { setPose(requested); setPhase('forming'); return; }
    }
    if (skipRequested.current || navigation.current > .02 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); return; }
    const saveData = Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
    // The clip is landscape only and heavy, so portrait stages and metered connections take the drawn trace.
    setClipMode(previous => previous ?? (!saveData && innerWidth >= innerHeight && innerWidth >= 900));
    startedAt.current = performance.now(); held.current = 0; playing.current = true; setRevealed(false); setClipOut(false);
    setPhase('forming');
  }, [finish]);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const abort = new AbortController();
    setFollowScroll(false);
    import('@/lib/brain/scene').then(module => module.createBrainScene(element, {
      hover: setHovered, select: setSelected, move: () => setHovered(null), zoom: setZoom, failed: fail, anchors: setAnchors,
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
  useEffect(() => { if (look) scene.current?.setLook(look); }, [look, ready, scene]);
  useEffect(() => { scene.current?.setRegion(active); }, [active, ready, scene]);
  useEffect(() => { scene.current?.setZoom(zoom); }, [zoom, ready, scene]);
  useEffect(() => { scene.current?.setPhase(phase); if (phase === 'forming') scene.current?.setTime(pose ? 9.4 : time.current); }, [phase, ready, scene, pose]);
  useEffect(() => { scene.current?.setClipAspect(innerWidth < innerHeight ? 9 / 16 : 16 / 9); }, [ready, scene]);

  // The clip clock. The video drives the stage to the handoff, then the code clock finishes in real time
  // while the model settles out of its arrival glow. Any failure drops to the drawn trace, never a blank stage.
  useEffect(() => {
    if (phase !== 'forming' || pose || clipMode !== true) return;
    const element = video.current, canvasElement = introCanvas.current;
    if (!element || !canvasElement) return;
    let cancelled = false, frame = 0, startTimer = 0, startedPlaying = 0, traceAt = 0;
    let engine = intro.current;
    // The trace runs from the first frame, hidden under the clip, so by the time the storm collapses it is
    // already mid-formation and can carry the brain the rest of the way.
    if (!engine) import('@/lib/brain/intro').then(module => { if (!cancelled) engine = intro.current = module.createBrainIntro(canvasElement); }).catch(() => {});
    const toTrace = () => {
      if (cancelled || !playing.current || handedOverAt.current) return;
      element.pause(); element.removeAttribute('src'); element.load();
      startedAt.current = performance.now(); held.current = 0;
      setClipMode(false);
    };
    element.src = CLIP.src;
    element.currentTime = 0;
    startTimer = window.setTimeout(() => { if (element.paused || element.currentTime === 0) toTrace(); }, START_BUDGET);
    const onPlaying = () => { clearTimeout(startTimer); if (!startedPlaying) startedPlaying = performance.now(); };
    element.addEventListener('playing', onPlaying);
    element.addEventListener('error', toTrace);
    element.play().catch(toTrace);
    function tick() {
      frame = 0;
      if (cancelled || !playing.current || !element) return;
      if (handedOverAt.current) {
        // Act three: the live model, arriving lit and skinning over to its finish.
        const elapsed = (performance.now() - handedOverAt.current) / 1000;
        const seconds = Math.min(12, HANDOFF_AT + elapsed);
        scene.current?.setArrival(Math.max(0, 1 - elapsed / SETTLE));
        paint(seconds); scene.current?.setTime(seconds);
        engine?.draw(seconds, seconds, Math.max(0, 1 - elapsed / TRACE_OUT));
        if (seconds >= 12) { playing.current = false; handedOverAt.current = 0; scene.current?.setArrival(0); engine?.clear(); setPhase('still'); return; }
      } else if (traceAt) {
        // Act two: the trace owns the stage and draws the brain out of the network.
        const seconds = Math.min(HANDOFF_AT, TRACE_AT + (performance.now() - traceAt) / 1000 * TRACE_SPEED);
        paint(seconds); scene.current?.setTime(seconds);
        engine?.draw(seconds, seconds, 1);
        if (seconds >= HANDOFF_AT && scene.current) {
          handedOverAt.current = performance.now();
          scene.current.setArrival(1); scene.current.setTime(HANDOFF_AT);
          setRevealed(true);
        }
      } else if (element.duration) {
        // Act one: the clip, from the first signal through the market storm.
        const handoff = element.duration * CLIP.handoff;
        const progress = Math.min(1, element.currentTime / handoff);
        // Cut it for the trace if the clip falls a budget's worth behind the wall clock, however it stutters.
        if (startedPlaying && !element.ended && performance.now() - startedPlaying - element.currentTime * 1000 > STALL_BUDGET) { toTrace(); return; }
        const seconds = TRACE_AT * progress;
        paint(seconds); scene.current?.setTime(seconds);
        // The trace fades up under the clip's last second so the two overlap rather than cut.
        engine?.draw(seconds, seconds, smooth((seconds - (TRACE_AT - TRACE_FADE)) / TRACE_FADE));
        if (progress >= 1 || element.ended) { traceAt = performance.now(); setClipOut(true); element.pause(); }
      }
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => {
      cancelled = true; cancelAnimationFrame(frame); clearTimeout(startTimer);
      element.removeEventListener('playing', onPlaying); element.removeEventListener('error', toTrace);
    };
  }, [phase, pose, clipMode, scene, paint]);

  // The intro clock: draws the synapse overlay, updates the stage, and feeds the model the same time.
  useEffect(() => {
    if (phase !== 'forming' || pose || clipMode !== false) return;
    const element = introCanvas.current;
    if (!element) return;
    let cancelled = false, frame = 0;
    let engine = intro.current;
    if (!engine) import('@/lib/brain/intro').then(module => { if (!cancelled) engine = intro.current = module.createBrainIntro(element); }).catch(() => finish());
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    function tick(now: number) {
      frame = 0;
      if (cancelled || !playing.current) return;
      if (preference.matches) { finish(); return; }
      const clock = (now - startedAt.current) / 1000;
      let seconds = clock * SPEED - held.current;
      if (!scene.current && seconds > HOLD_AT) { held.current += seconds - HOLD_AT; seconds = HOLD_AT; }
      paint(seconds);
      if (seconds >= REVEAL_AT) setRevealed(true);
      engine?.draw(seconds, clock, 1 - smooth((seconds - REVEAL_AT) / 1.4));
      scene.current?.setTime(seconds);
      if (seconds >= 12) { playing.current = false; setPhase('still'); engine?.clear(); return; }
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => { cancelled = true; cancelAnimationFrame(frame); };
  }, [phase, scene, paint, finish, pose, clipMode]);

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
      if (progress > .02) { setEntering(null); }
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
    reset(); skipRequested.current = false; handedOverAt.current = 0; scene.current?.setArrival(0);
    window.scrollTo({ top: root.current ? window.scrollY + root.current.getBoundingClientRect().top - 72 : 0, behavior: 'instant' });
    navigation.current = 0; scene.current?.setNavigation(0); setExploring(false);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); return; }
    startedAt.current = performance.now(); held.current = 0; playing.current = true; setRevealed(false);
    paint(0); setClipOut(false); scene.current?.setTime(0); setPhase('forming');
  }
  const controlsVisible = exploring || failed;
  const forming = phase === 'forming';
  return <section ref={root} className={styles.home} aria-label="Scholars Opportunity Fund — connected intelligence" data-brain data-brain-home data-brain-phase={phase} data-brain-ready={ready} data-brain-failed={failed} data-exploring={exploring} data-brain-reveal={revealed} data-brain-pose={pose ?? undefined}>
    <div className={styles.stage} data-startup-stage>
      <div className={styles.field}><SignalField active={lightVisible} /></div>
      <div className={styles.fallback} data-brain-fallback hidden={!failed}>{fallback}</div>
      <canvas ref={canvas} className={styles.canvas} data-brain-canvas data-ready={ready} tabIndex={ready && phase === 'still' ? 0 : -1}
        aria-label="3D brain. Drag to rotate. Pinch or Shift and scroll to zoom. Arrow keys rotate; plus and minus zoom. Select a region to explore it." />
      <video ref={video} className={styles.clip} data-brain-clip data-fading={clipOut || revealed} hidden={!forming || clipMode !== true || Boolean(pose)} muted playsInline preload="auto" aria-hidden="true"
        onPointerUp={event => { if (event.pointerType === 'mouse' && event.button === 0) finish(); }} />
      <canvas ref={introCanvas} className={styles.intro} data-brain-intro hidden={!forming} aria-hidden="true" onPointerUp={event => { if (event.pointerType === 'mouse' && event.button === 0) finish(); }} />
      <div className={styles.wordmark} aria-hidden="true"><div className={styles.wordInner}>
        <p ref={word} className={styles.word}><span ref={letters} /><span className={styles.cursor} /></p>
        <p className={styles.subtitle}>Scholars Opportunity Fund · Salt Lake City</p>
      </div></div>
      <nav className={styles.pins} aria-label="Explore the five areas of SOF" data-brain-navigation data-visible={ready && (phase === 'still' || exploring)}>
        {brainRegions.map(region => {
          const anchor = anchors.find(item => item.id === region.id);
          // Markers around the far side fade out rather than floating over the front of the model.
          const behind = !anchor || anchor.facing < -.1;
          return <Link key={region.id} href={region.href} className={styles.marker} data-pin={region.id}
            data-active={active === region.id} data-behind={behind} data-entering={entering === region.id}
            style={{ '--region-color': region.color, left: `${(anchor?.x ?? .5) * 100}%`, top: `${(anchor?.y ?? .5) * 100}%` } as CSSProperties}
            onFocus={() => setFocused(region.id)} onBlur={() => setFocused(null)}
            onClick={event => {
              // Click to name the region, click again to travel into it. Hovering does nothing, so
              // markers cannot fire as the model turns under the pointer.
              if (event.metaKey || event.ctrlKey || event.shiftKey || entering) return;
              event.preventDefault();
              if (selected !== region.id) { setSelected(region.id); return; }
              setEntering(region.id);
              scene.current?.focusRegion(region.id, 900);
              window.setTimeout(() => router.push(region.href), 820);
              // A marker pointing at a section of this page never unmounts the hero, so the swell and
              // the camera have to be put back by hand once the travel is over.
              window.setTimeout(() => {
                setEntering(null);
                if (region.href.startsWith('/#') || region.href.startsWith('#')) { setSelected(null); scene.current?.resetView(); }
              }, 1150);
            }}>
            <span className={styles.dot} aria-hidden="true" />
            <span className={styles.markerLabel}><small>{region.anatomy}</small>{region.name}</span>
          </Link>;
        })}
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
        {!exploring && forming && <button type="button" onClick={finish}>Skip intro</button>}
        <button type="button" disabled={failed} onClick={replay}>Replay</button>
        {controlsVisible && <a href="/brain/attribution.txt">Model credits</a>}
      </div>
      {failed && <p className={styles.status}>3D view unavailable. Explore the fund through the section links.</p>}
      <noscript><style>{`[data-brain-home]{height:auto!important;--stage-color:#F3F5F8}[data-brain-navigation]{visibility:visible!important;opacity:1!important}[data-brain-canvas],[data-brain-intro],[data-brain-clip]{display:none!important}[data-brain-fallback]{display:block!important}`}</style></noscript>
    </div>
  </section>;
}
