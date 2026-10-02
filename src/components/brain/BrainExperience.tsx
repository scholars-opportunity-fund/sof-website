'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { BrainPhase, LobeAnchors } from '@/lib/brain/scene';
import type { BrainIntro } from '@/lib/brain/intro';
import type { ClipStrip } from '@/lib/brain/clip';
import { clipPreferred } from '@/lib/brain/clip-mode';
import { isBrainLook, type BrainLookName } from '@/lib/brain/looks';
import { brainRegions } from '@/lib/brain/regions';
import { lobeForMesh, LOBE_MOTION } from '@/lib/brain/lobes';
import { useExplorer } from './BrainContext';
import SignalField from '@/components/signal/SignalField';
import styles from './BrainExperience.module.css';

const smooth = (value: number) => { const p = Math.max(0, Math.min(1, value)); return p * p * (3 - 2 * p); };
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
// The whole intro, in timeline seconds. Nothing plays on its own: scroll position is the only clock.
const INTRO_LENGTH = 12;
// Where the band begins, per stage. Both intros open on an empty frame — the clip on nearly three seconds
// of black, the drawn trace on an unlit field — which read as a fade-up while they played and as a blank
// stage now that they do not. The band starts where each one has something on screen.
const CLIP_START = 2.4, TRACE_START = 3.6;
// The synapse trace owns the stage until it starts dissolving; the model is revealed under the fade.
const REVEAL_AT = 8.2;
// The cinematic intro, exported as still frames covering exactly the stretch the band scrubs — from the
// market storm at CLIP_START to the moment it collapses inward at TRACE_AT, where the drawn trace picks the
// brain up and builds it, so the network that flew past you is the thing that forms. A video cannot be
// scrubbed: see src/lib/brain/clip.ts. The first frame is preloaded, since it is the landing image.
const FIRST_FRAME = '/brain/intro/f00.webp';
// Timeline seconds at the moment the clip gives way to the trace, and at the moment the trace gives way to the model.
const TRACE_AT = 6.4;
// The trace is densest just before 8 s of its own build, so the model takes over there rather than later,
// when the drawn network has begun to thin out again.
const HANDOFF_AT = 7.9;
// How long the clip and the trace overlap while one fades into the other.
const TRACE_FADE = 1.1;
const SETTLE = 3.2;
// The trace lingers over the arriving model and dissolves across this long, so neither one pops.
const TRACE_OUT = 2;
// The intro is scrubbed by the scroll: this many viewport heights carry the whole timeline. Much less than
// this and a single trackpad flick, which is most of a screen in one gesture, throws the whole intro past.
const INTRO_BAND = 1.8;
// The hero above this one ends by throwing its particle field outward, and this section is pulled up
// behind that burst (the margin in BrainExperience.module.css, matched to the hero's band). Its own
// timeline still starts where it always did — the moment this section reaches the header — which by
// then is the moment the burst opens onto it.
// The rendered time chases the scrolled time by this much each frame, so a wheel notch reads as
// motion through the formation rather than a jump, and so a video seek is never asked for twice a frame.
const CHASE = .18;

export default function BrainExperience({ fallback }: { fallback: ReactNode }) {
  const { scene, setAvailable, active, setHovered,  setSelected, zoom, setZoom, setFollowScroll, reset } = useExplorer();
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const introCanvas = useRef<HTMLCanvasElement>(null);
  const clipCanvas = useRef<HTMLCanvasElement>(null);
  const strip = useRef<ClipStrip | null>(null);
  const intro = useRef<BrainIntro | null>(null);
  const word = useRef<HTMLParagraphElement>(null);
  const letters = useRef<HTMLSpanElement>(null);
  const navigation = useRef(0);
  const time = useRef(0);
  const navWord = useRef<HTMLElement | null>(null);
  // True once the intro has been given up on — reduced motion, a failed scene, or a click on the stage.
  // The timeline is then pinned at its end and the scroll no longer scrubs it.
  const skipRequested = useRef(false);
  const failedRef = useRef(false);
  // The timeline second the scroll position asks for, and the one currently rendered, which chases it.
  const scrollTarget = useRef(0);
  const rendered = useRef(0);
  // Where navigation starts along the page. Normally the far end of the intro band; a skip fixes it at
  // whatever was scrolled then, so nothing jumps and no dead band is left behind.
  const navStart = useRef<number | null>(null);
  // The timeline second the head of the band sits at, which the clip and the trace answer differently.
  const introStart = useRef(CLIP_START);
  // False until the scroll has been read once. A page restored partway down starts at the second it is
  // already scrolled to rather than racing the formation from the top to catch up.
  const armed = useRef(false);
  // Mirror the transition states the timeline drives, so each is set once rather than every frame.
  const clipOutRef = useRef(false);
  const revealedRef = useRef(false);
  const formingRef = useRef(false);
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
  // True once this section is within a screen of the viewport. Everything expensive here waits on it,
  // so the homepage above can load without a 3D scene and a particle trace competing for the main thread.
  const [near, setNear] = useState(false);
  const [failed, setFailed] = useState(false);
  const [exploring, setExploring] = useState(false);
  const [lightVisible, setLightVisible] = useState(false);
  // True on phones, where a still of the brain holds the stage until the 3D scene is started and ready.
  const [poster, setPoster] = useState(false);
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
    // The cue also stands at the head of the timeline: since nothing moves until the page is scrolled,
    // the stage has to say so before it is scrolled.
    element.style.setProperty('--cue-opacity', (seconds > 11.3 || seconds < introStart.current + .35) && nav < .05 ? '1' : '0');
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

  // Give up on the intro and pin the timeline at its end. The clip keeps its source, so a Replay can
  // scrub it again without downloading it twice.
  const finish = useCallback(() => {
    skipRequested.current = true;
    // Navigation takes over from wherever the page is standing, so giving up on the intro leaves no
    // stretch of band behind that scrolls past nothing.
    const box = root.current?.getBoundingClientRect();
    if (box) navStart.current = Math.max(0, Math.min(innerHeight * INTRO_BAND, 72 - box.top));
    rendered.current = INTRO_LENGTH; scrollTarget.current = INTRO_LENGTH;
    clipOutRef.current = true; revealedRef.current = true; formingRef.current = false;
    setClipOut(true); setRevealed(true); setPhase('still'); paint(INTRO_LENGTH); intro.current?.clear(); scene.current?.setArrival(0);
  }, [paint, scene]);
  const fail = useCallback(() => { scene.current?.dispose(); scene.current = null; failedRef.current = true; setFailed(true); setReady(false); setAvailable(false); finish(); }, [scene, setAvailable, finish]);

  // Decide on mount which intro the stage is scrubbing, and arm it at its first frame.
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
    // The clip is landscape only and heavy, so portrait stages and metered connections take the drawn
    // trace. The hero above asks the same question, to decide whether to resolve into the clip's first
    // frame or to throw its field past the camera instead.
    setClipMode(previous => previous ?? clipPreferred());
    revealedRef.current = false; clipOutRef.current = false; formingRef.current = true;
    setRevealed(false); setClipOut(false);
    rendered.current = introStart.current; scrollTarget.current = introStart.current; navStart.current = null;
    paint(introStart.current);
    setPhase('forming');
  }, [finish, paint]);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const abort = new AbortController();
    setFollowScroll(false);
    // This stage is a screen below the hero, so nothing here may touch the main thread during the page's
    // load: the WebGL boot and the model parse wait until the section is within a screen of the viewport.
    // A visitor scrolling normally meets a model that has been ready since before they arrived.
    const boot = () => import('@/lib/brain/scene').then(module => module.createBrainScene(element, {
      hover: mesh => { setHovered(mesh); hoverHandler.current(mesh); }, select: setSelected, move: () => setHovered(null), zoom: setZoom, failed: fail, lobeAnchors: setLobeAnchors,
    }, abort.signal)).then(engine => {
      if (abort.signal.aborted) { engine.dispose(); return; }
      scene.current = engine; engine.setNavigation(navigation.current);
      setReady(true); setAvailable(true);
    }).catch(() => { if (!abort.signal.aborted) fail(); });
    // Phones keep the still of the brain until the scene is up, since the parse is slowest there.
    setPoster(innerWidth < innerHeight && (innerWidth < 768 || matchMedia('(pointer: coarse)').matches));
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      removeEventListener('scroll', watch);
      setNear(true);
      boot();
    };
    // Not visibility: this section is pulled up behind the hero, so it is on screen — under an opaque
    // one — from the first paint, and an observer would fire during the load. The signal is the visitor
    // setting off down the page, which still leaves a screen of scrolling before the brain is uncovered.
    const watch = () => { if (scrollY > innerHeight * .3) start(); };
    addEventListener('scroll', watch, { passive: true });
    watch();
    return () => {
      removeEventListener('scroll', watch);
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
  // Deciding on the clip, or falling back from it mid-scroll, moves the head of the band with it.
  useEffect(() => {
    if (clipMode === null || pose) return;
    const from = clipMode ? CLIP_START : TRACE_START;
    introStart.current = from;
    if (rendered.current < from) rendered.current = from;
    if (scrollTarget.current < from) scrollTarget.current = from;
  }, [clipMode, pose]);

  // The one intro clock, and it is the scroll bar. Nothing plays: the rendered second chases the second
  // the scroll asks for, the clip is seeked to it, the trace is drawn at it, and the model is posed at it.
  // Scrolling back up runs the whole formation in reverse, since every act is a pure function of the time.
  useEffect(() => {
    if (pose || clipMode === null || !near) return;
    const canvasElement = introCanvas.current;
    if (!canvasElement) return;
    let cancelled = false, frame = 0;
    let engine = intro.current;
    if (!engine) import('@/lib/brain/intro').then(module => { if (!cancelled) engine = intro.current = module.createBrainIntro(canvasElement); }).catch(() => finish());
    // The clip's frames start loading with the stage, nearest-first, and a strip that cannot be fetched
    // hands the whole intro to the drawn trace rather than leaving the stage bare.
    const clipElement = clipMode ? clipCanvas.current : null;
    if (clipElement && !strip.current) import('@/lib/brain/clip').then(module => {
      if (!cancelled) strip.current = module.createClipStrip(clipElement);
    }).catch(() => { if (!cancelled) setClipMode(false); });
    function tick() {
      frame = 0;
      if (cancelled) return;
      frame = requestAnimationFrame(tick);
      if (skipRequested.current) return;
      const target = scrollTarget.current;
      let seconds = rendered.current;
      const moving = seconds !== target;
      if (moving) {
        seconds += (target - seconds) * CHASE;
        if (Math.abs(target - seconds) < .015) seconds = target;
        rendered.current = seconds;
      } else if (!formingRef.current) return;
      if (moving) {
        paint(seconds);
        scene.current?.setTime(seconds);
      }
      // Act one is the clip, drawn frame by frame; act two the trace; act three the model arriving and settling.
      if (clipElement && seconds < TRACE_AT) {
        strip.current?.draw((seconds - CLIP_START) / (TRACE_AT - CLIP_START));
        if (strip.current?.broken()) { setClipMode(false); return; }
      }
      const fadeIn = clipElement ? smooth((seconds - (TRACE_AT - TRACE_FADE)) / TRACE_FADE) : 1;
      const revealAt = clipElement ? HANDOFF_AT : REVEAL_AT;
      const fadeOut = 1 - smooth((seconds - revealAt) / (clipElement ? TRACE_OUT : 1.4));
      // The formation is frozen where the scroll left it, but the network it is drawn from still fires:
      // the second argument is a live clock, so a stage at rest breathes without advancing.
      engine?.draw(seconds, performance.now() / 1000, Math.min(fadeIn, fadeOut));
      scene.current?.setArrival(seconds < revealAt ? 1 : Math.max(0, 1 - (seconds - revealAt) / SETTLE));
      // A hair short of the end still counts as finished: the band's last pixel lands a rounding error
      // below the full length, and the brain is already at rest by then.
      const clipOver = seconds >= TRACE_AT, shown = seconds >= revealAt, forming = seconds < INTRO_LENGTH - .02;
      if (clipOver !== clipOutRef.current) { clipOutRef.current = clipOver; setClipOut(clipOver); }
      if (shown !== revealedRef.current) { revealedRef.current = shown; setRevealed(shown); }
      if (forming !== formingRef.current) {
        formingRef.current = forming;
        if (!forming) { engine?.clear(); scene.current?.setArrival(0); }
        setPhase(forming ? 'forming' : 'still');
      }
    }
    frame = requestAnimationFrame(tick);
    return () => {
      cancelled = true; cancelAnimationFrame(frame);
      strip.current?.dispose(); strip.current = null;
    };
  }, [pose, clipMode, scene, paint, finish, near]);

  useEffect(() => {
    let frame = 0;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    function update() {
      frame = 0;
      const element = root.current;
      if (!element) return;
      const box = element.getBoundingClientRect();
      const band = innerHeight * INTRO_BAND, scrolled = 72 - box.top;
      // The band is the intro's scroll bar: where it is scrolled to is the second the stage renders.
      const from = introStart.current;
      if (!pose && !skipRequested.current) {
        scrollTarget.current = from + clamp01(scrolled / band) * (INTRO_LENGTH - from);
        if (!armed.current) { armed.current = true; rendered.current = scrollTarget.current; }
      }
      // Navigation begins where the intro ends, so the two never fight over the same stretch of page.
      const start = navStart.current ?? band;
      const progress = clamp01((scrolled - start) / Math.max(1, box.height - (innerHeight - 72) - band));
      navigation.current = preference.matches ? (progress > .2 ? 1 : 0) : smooth(progress / .4);
      setExploring(navigation.current > .6);
      scene.current?.setNavigation(navigation.current);
      // Past the band the timeline no longer moves, but the wordmark still travels with the scroll,
      // so the stage is repainted at whatever second it is resting on.
      if (!pose) paint(skipRequested.current ? INTRO_LENGTH : rendered.current);
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

  // Replaying is simply going back to the head of the band; the timeline follows the scroll from there.
  function replay() {
    reset(); skipRequested.current = false; scene.current?.setArrival(1);
    rendered.current = introStart.current; scrollTarget.current = introStart.current; navStart.current = null; armed.current = false;
    window.scrollTo({ top: root.current ? window.scrollY + root.current.getBoundingClientRect().top - 72 : 0, behavior: 'instant' });
    navigation.current = 0; scene.current?.setNavigation(0); setExploring(false);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); return; }
    revealedRef.current = false; clipOutRef.current = false; formingRef.current = true;
    setRevealed(false); setClipOut(false);
    paint(introStart.current); scene.current?.setTime(introStart.current); setPhase('forming');
  }
  // Skipping means scrolling to the far end of the band: the state on screen and the scroll position
  // always agree, so the intro stays where the scroll left it rather than jumping out from under the page.
  function skip() {
    const box = root.current?.getBoundingClientRect();
    if (!box) { finish(); return; }
    window.scrollTo({ top: window.scrollY + box.top - 72 + innerHeight * INTRO_BAND, behavior: 'smooth' });
  }
  const controlsVisible = exploring || failed;
  const forming = phase === 'forming';
  return <section ref={root} id="sof-brain" className={styles.home} aria-label="Scholars Opportunity Fund — connected intelligence" data-brain data-brain-home data-brain-phase={phase} data-brain-ready={ready} data-brain-failed={failed} data-exploring={exploring} data-brain-reveal={revealed} data-brain-pose={pose ?? undefined}>
    <div className={styles.stage} data-startup-stage>
      <div className={styles.field}><SignalField active={lightVisible} /></div>
      <div className={styles.fallback} data-brain-fallback hidden={!failed}>{fallback}</div>
      {poster && !failed && <div className={styles.poster} data-ready={ready} aria-hidden="true"><Image src="/brain/poster-portrait.webp" alt="" fill sizes="80vw" /></div>}
      <canvas ref={canvas} className={styles.canvas} data-brain-canvas data-ready={ready} tabIndex={ready && phase === 'still' ? 0 : -1}
        aria-label="3D brain. Drag to rotate. Pinch or Shift and scroll to zoom. Arrow keys rotate; plus and minus zoom. Select a region to explore it." />
      {clipMode === true && <link rel="preload" as="image" href={FIRST_FRAME} />}
      <canvas ref={clipCanvas} className={styles.clip} data-brain-clip data-fading={clipOut || revealed} hidden={!forming || clipMode !== true || Boolean(pose)} aria-hidden="true" />
      <canvas ref={introCanvas} className={styles.intro} data-brain-intro hidden={!forming} aria-hidden="true" />
      <div className={styles.wordmark} aria-hidden="true"><div className={styles.wordInner}>
        <p ref={word} className={styles.word}><span ref={letters} /><span className={styles.cursor} /></p>
        <p className={styles.subtitle}>Scholars Opportunity Fund · Salt Lake City</p>
      </div></div>
      <div className={styles.lobes} aria-hidden={!ready} data-brain-navigation data-visible={(ready || (poster && !failed)) && (phase === 'still' || exploring)} data-travelling={travelling}>
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
        {!exploring && forming && <button type="button" onClick={skip}>Skip intro</button>}
        <button type="button" disabled={failed} onClick={replay}>Replay</button>
        {controlsVisible && <a href="/brain/attribution.txt">Model credits</a>}
      </div>
      {failed && <p className={styles.status}>3D view unavailable. Explore the fund through the section links.</p>}
      <noscript><style>{`[data-brain-home]{height:auto!important;--stage-color:#F3F5F8}[data-brain-navigation]{visibility:visible!important;opacity:1!important}[data-brain-canvas],[data-brain-intro],[data-brain-clip]{display:none!important}[data-brain-fallback]{display:block!important}`}</style></noscript>
    </div>
  </section>;
}
