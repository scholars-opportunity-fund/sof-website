'use client';

import { type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import { brainRegions } from '@/lib/brain/regions';
import { useExplorer } from './BrainContext';
import BrainExperience from './BrainExperience';
import hero from './BrainHero.module.css';
import styles from './BrainExplorer.module.css';

export function BrainExplorer({ children }: { children: ReactNode }) {
  const { available, active, selected, setSelected, zoom, setZoom, followScroll, setFollowScroll, reset } = useExplorer();
  const region = brainRegions.find(item => item.id === active);
  function adjustZoom(delta: number) {
    setFollowScroll(false);
    setZoom(value => Math.min(1.6, Math.max(1, Math.round((value + delta) * 100) / 100)));
  }
  return (
    <>
      <BrainExperience fallback={children} />
      <div className={styles.tools} data-brain-tools data-available={available}>
        <span className={styles.hint}>Explore in 3D</span>
        <div className={styles.zoom} role="group" aria-label="Brain view">
          <button type="button" aria-label="Zoom out" disabled={zoom <= 1} onClick={() => adjustZoom(-.1)}>−</button>
          <output aria-label="Brain zoom">{Math.round(zoom * 100)}%</output>
          <button type="button" aria-label="Zoom in" disabled={zoom >= 1.6} onClick={() => adjustZoom(.1)}>+</button>
          <button type="button" onClick={reset}>Reset</button>
        </div>
        <label className={styles.follow}><input type="checkbox" checked={followScroll} onChange={event => setFollowScroll(event.target.checked)} /> Follow scroll</label>
      </div>
      <div className={styles.detail} style={{ '--region-color': region?.color ?? '#7BB8D6' } as CSSProperties} data-brain-detail>
        <div>
          <p className={styles.detailLabel}>{region ? region.name : 'One fund. Five connected perspectives.'}</p>
          <p className={styles.detailCopy}>{region ? region.description : 'Explore a region of the brain, or choose a section below.'}</p>
        </div>
        {region && <Link className={styles.visit} href={region.href}>Explore <span aria-hidden="true">↗</span><span className="sr-only"> {region.name}</span></Link>}
        {selected && <button type="button" className={styles.clear} aria-label="Clear selected region" onClick={() => setSelected(null)}>×</button>}
      </div>
    </>
  );
}

export function BrainNavigation() {
  const { active, setHovered, setFocused } = useExplorer();
  return <nav className={hero.mapLegend} aria-label="Explore the five areas of SOF" data-brain-navigation>
    {brainRegions.map((region, index) => (
      <Link key={region.id} href={region.href} className={`${hero.legendItem} ${styles.legendLink}`} data-active={active === region.id}
        style={{ '--region-color': region.color } as CSSProperties}
        onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(region.id); }} onPointerLeave={() => setHovered(null)}
        onFocus={() => setFocused(region.id)} onBlur={() => setFocused(null)}>
        <span className={hero.legendNumber} style={{ color: region.color }}>0{index + 1}<span aria-hidden="true" /></span>
        <span>{region.name}</span><span className={styles.linkArrow} aria-hidden="true">↗</span>
      </Link>
    ))}
  </nav>;
}
