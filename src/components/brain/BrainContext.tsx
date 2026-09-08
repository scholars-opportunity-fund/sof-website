'use client';

import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import type { BrainRegion } from '@/lib/brain/regions';
import type { BrainScene } from '@/lib/brain/scene';

function useExplorerState() {
  const scene = useRef<BrainScene | null>(null);
  const [available, setAvailable] = useState(false);
  const [hovered, setHovered] = useState<BrainRegion | null>(null);
  const [focused, setFocused] = useState<BrainRegion | null>(null);
  const [selected, setSelected] = useState<BrainRegion | null>(null);
  const [zoom, setZoom] = useState(1);
  const [followScroll, setFollowScroll] = useState(true);
  const active = focused ?? hovered ?? selected;
  function reset() { scene.current?.resetView(); setZoom(1); setFollowScroll(false); setSelected(null); setHovered(null); }
  return { scene, available, setAvailable, active, selected, setSelected, setHovered, setFocused, zoom, setZoom, followScroll, setFollowScroll, reset };
}

const ExplorerContext = createContext<ReturnType<typeof useExplorerState> | null>(null);
export function useExplorer() {
  const context = useContext(ExplorerContext);
  if (!context) throw new Error('Brain controls require BrainExplorerProvider');
  return context;
}

const subscribeToHydration = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function BrainExplorerProvider({ children }: { children: ReactNode }) {
  const state = useExplorerState();
  const ready = useSyncExternalStore(subscribeToHydration, clientReady, serverReady);
  const root = useRef<HTMLDivElement>(null);
  const { followScroll, setZoom } = state;
  useEffect(() => {
    if (!followScroll) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    function update() {
      frame = 0;
      const bounds = root.current?.getBoundingClientRect();
      if (!bounds) return;
      const progress = Math.min(1, Math.max(0, -bounds.top / (bounds.height * .55)));
      setZoom(preference.matches ? 1 : 1 + progress * .2);
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(update); }
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    preference.addEventListener('change', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      preference.removeEventListener('change', schedule);
    };
  }, [followScroll, setZoom]);
  return <ExplorerContext.Provider value={state}><div ref={root} data-brain-explorer data-brain-ready={ready} data-active-region={state.active ?? 'none'}>{children}</div></ExplorerContext.Provider>;
}

