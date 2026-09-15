'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { BrainPhase, LobeAnchors } from '@/lib/brain/scene';
import type { BrainIntro } from '@/lib/brain/intro';
import { isBrainLook, type BrainLookName } from '@/lib/brain/looks';
import { brainRegions } from '@/lib/brain/regions';
import { lobeForMesh, LOBE_MOTION } from '@/lib/brain/lobes';
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
  const { scene, setAvailable, active, setHovered,  setSelected, zoom, setZoom, setFollowScroll, reset } = useExplorer();
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
  // Where each navigable lobe's three destinations hang from, reported per frame.
  const [lobeAnchors, setLobeAnchors] = useState<LobeAnchors[]>([]);
  // The lobe whose destinations are showing, and the destination being travelled into.
  const [openLobe, setOpenLobe] = useState<string | null>(null);
  const [travelling, setTravelling] = useState(false);
  const [stage, setStage] = useState({ w: 0, h: 0 });
  const overLinks = useRef(false);
  // The hover handler reaches the scene through a ref: naming it as an effect
  // dependency would rebuild the WebGL scene every time a travel starts.
  const hoverHandler = useRef<(mesh: string | null) => void>(() => {});
  const closeTimer = useRef(0);
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
      hover: mesh => { setHovered(mesh); hoverHandler.current(mesh); }, select: setSelected, move: () => setHovered(null), zoom: setZoom, failed: fail, lobeAnchors: setLobeAnchors,
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
      if (progress > .02 && playing.current) finish();
      else if (progress > .02) skipRequested.current = true;
      paint(progress > .02 ? 12 : time.current);
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true }); window.addEventListener('resize', schedule); preference.addEventListener('change', schedule);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); preference.removeEventListener('change', schedule); };
  }, [scene, paint, finish, pose]);

  // The stage's pixel box, so 0-1 anchors can be drawn as real coordinates.
  useEffect(() => {
    const element = root.current?.querySelector('[data-startup-stage]');
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setStage({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const scheduleLobeClose = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      if (!overLinks.current) setOpenLobe(null);
    }, 220);
  }, []);

  // Hovering a navigable lobe opens it. A lobe is a large piece of mesh rather
  // than a projected dot, so this cannot misfire as the model turns.
  const onHoverMesh = useCallback((mesh: string | null) => {
    if (travelling) return;
    if (mesh && lobeForMesh(mesh)) { window.clearTimeout(closeTimer.current); setOpenLobe(mesh); }
    else scheduleLobeClose();
  }, [travelling, scheduleLobeClose]);

  useEffect(() => { hoverHandler.current = onHoverMesh; }, [onHoverMesh]);

  useEffect(() => { scene.current?.setLitLobe(openLobe); }, [openLobe, scene]);

  // Geometry for the open lobe: where each filament leaves the surface, and where
  // its destination sits. Bubbles fan away from the brain so none is pushed off
  // the top of the stage, and each is clamped inside the frame.
  const reveal = (() => {
    const lobe = lobeForMesh(openLobe);
    const anchorSet = lobeAnchors.find(item => item.mesh === openLobe);
    if (!lobe || !anchorSet || !anchorSet.points.length || !stage.w) return [];
    const centre = lobeAnchors.reduce((sum, item) => {
      const mid = item.points[Math.floor(item.points.length / 2)];
      return mid ? { x: sum.x + mid.x, y: sum.y + mid.y, n: sum.n + 1 } : sum;
    }, { x: 0, y: 0, n: 0 });
    const cx = (centre.n ? centre.x / centre.n : .5) * stage.w;
    const cy = (centre.n ? centre.y / centre.n : .5) * stage.h;

    // Three anchors are reported per region; take them evenly for however many
    // destinations this one carries, so a single destination hangs off the
    // middle of the region rather than an arbitrary edge.
    const count = lobe.links.length;
    const picked = count >= anchorSet.points.length
      ? anchorSet.points
      : count === 1
        ? [anchorSet.points[Math.floor(anchorSet.points.length / 2)]]
        : [anchorSet.points[0], anchorSet.points[anchorSet.points.length - 1]];

    return picked.slice(0, count).map((point, index) => {
      const link = lobe.links[index];
      const ax = point.x * stage.w;
      const ay = point.y * stage.h;
      const outward = Math.atan2(ay - cy, ax - cx);
      const angle = outward + (index - (count - 1) / 2) * (26 * Math.PI / 180);
      const bx = Math.min(stage.w - 96, Math.max(96, ax + Math.cos(angle) * LOBE_MOTION.spread));
      const by = Math.min(stage.h - 34, Math.max(34, ay + Math.sin(angle) * LOBE_MOTION.spread));
      const mx = (ax + bx) / 2 - Math.sin(angle) * LOBE_MOTION.curve;
      const my = (ay + by) / 2 + Math.cos(angle) * LOBE_MOTION.curve;
      return {
        key: `${lobe.id}-${link.href}`,
        mesh: lobe.mesh, href: link.href, name: link.name,
        ax, ay, bx, by,
        path: `M ${ax} ${ay} Q ${mx} ${my} ${bx} ${by}`,
        delay: index * LOBE_MOTION.stagger,
      };
    });
  })();

  // One gesture, one meaning: the camera rides into the lobe and the shell burns
  // off, and what is revealed underneath is a section of this page or another
  // route without the visitor being able to tell which.
  const travelTo = useCallback((mesh: string, href: string) => {
    setTravelling(true);
    setOpenLobe(null);
    const engine = scene.current;
    if (!engine) { router.push(href); return; }
    engine.setLitLobe(mesh);
    engine.diveIntoLobe(mesh, () => {
      router.push(href);
      // A destination on this page never unmounts the hero, so the camera and the
      // shell have to be put back by hand once the handoff is done.
      window.setTimeout(() => {
        engine.endDive();
        setTravelling(false);
      }, LOBE_MOTION.handoff);
    });
  }, [router, scene]);

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
      <div className={styles.lobes} aria-hidden={!ready} data-brain-navigation data-visible={ready && (phase === 'still' || exploring)} data-travelling={travelling}>
        {/* Filaments are drawn in stage pixels, so a bowed line keeps an even stroke. */}
        <svg className={styles.filaments} viewBox={`0 0 ${Math.max(1, stage.w)} ${Math.max(1, stage.h)}`} aria-hidden="true">
          {reveal.map(item => <g key={item.key}>
            <path d={item.path} pathLength={1} className={styles.filament} style={{ '--delay': `${item.delay}ms` } as CSSProperties} />
            <circle cx={item.ax} cy={item.ay} r={4.6} className={styles.origin} style={{ '--delay': `${item.delay}ms` } as CSSProperties} />
          </g>)}
        </svg>
        {/* At rest a line of copy, rather than markers on the model, says the brain is the navigation. */}
        {!openLobe && !travelling && !activeRegion && <p className={styles.prompt} aria-hidden="true">
          <i /><span data-pointer>Hover over the brain to explore</span><span data-touch>Tap the brain to explore</span>
        </p>}
        <nav aria-label="Explore Scholars Opportunity Fund">
          {reveal.map(item => <Link key={item.key} href={item.href} className={styles.destination}
            style={{ left: `${item.bx}px`, top: `${item.by}px`, '--delay': `${item.delay}ms` } as CSSProperties}
            onPointerEnter={() => { overLinks.current = true; window.clearTimeout(closeTimer.current); }}
            onPointerLeave={() => { overLinks.current = false; scheduleLobeClose(); }}
            onClick={event => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || travelling) return;
              if (item.href.startsWith('mailto:')) return;
              event.preventDefault();
              travelTo(item.mesh, item.href);
            }}>
            <i aria-hidden="true" />{item.name}
          </Link>)}
        </nav>
      </div>
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
