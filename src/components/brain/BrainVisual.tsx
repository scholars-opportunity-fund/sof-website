import Image from 'next/image';
import { useId, type ReactNode, type CSSProperties } from 'react';
import contours from '@/lib/brain/contours.json';
import { brainRegions, type BrainRegion } from '@/lib/brain/regions';
import { synapseLinks, synapseNodes } from '@/lib/brain/synapses';
import styles from './BrainVisual.module.css';

const fibers = contours.map(({ d, level }, index) => ({
  d,
  stroke: index % 13 === 0 ? '#C49A7A' : '#9DCCE2',
  strokeWidth: level === 24 ? 1.4 : 1,
  style: {
    '--arrival': `${(index % 19) * 26}ms`,
    '--drift-x': `${Math.sin(index * 2.39) * 260}px`,
    '--drift-y': `${Math.cos(index * 1.71) * 170}px`,
    '--turn': `${Math.sin(index * .73) * 18}deg`,
  } as CSSProperties,
}));

export default function BrainVisual({ region, priority = false, formation = false, interaction }: { interaction?: ReactNode; region?: BrainRegion | 'all'; priority?: boolean; formation?: boolean }) {
  const silhouetteId = useId();
  return (
    <div className={styles.visual} data-brain-visual data-fixed-region={region ?? 'none'} style={{ '--brain-outline': `url(#${silhouetteId}-shell)` } as CSSProperties}>
      <Image
        className={styles.material}
        data-brain-material
        src="/brain/glass-connectome.webp"
        alt="A translucent anatomical brain with luminous connected fibers, sculpted cortical folds, cerebellum, and brainstem."
        width={1536}
        height={1024}
        sizes="(max-width: 767px) 110vw, (max-width: 1200px) 70vw, 960px"
        preload={priority}
      />
      <svg className={styles.fibers} viewBox="0 0 1536 1024" fill="none" aria-hidden="true" data-brain-fibers>
        <defs><clipPath id={`${silhouetteId}-shell`} clipPathUnits="objectBoundingBox"><path d={contours.find(item => item.level === 24)?.d} transform="scale(0.0006510416667 0.0009765625)" /></clipPath></defs>
        {fibers.map((fiber, index) => <path key={index} {...fiber} pathLength={1} />)}
      </svg>
      {formation && <svg className={styles.synapses} viewBox="0 0 1536 1024" fill="none" aria-hidden="true" data-brain-synapses>
        <g className={styles.network} data-synapse-camera>
          {synapseLinks.map((link, index) => (
            <g key={index} style={{ '--birth': `${link.born.toFixed(3)}s`, '--signal-birth': `${(link.born + .65).toFixed(3)}s` } as CSSProperties}>
              <path className={styles.connection} d={link.d} pathLength={1} stroke={link.copper ? '#C49A7A' : '#7BB8D6'} />
              <path className={styles.signal} d={link.d} pathLength={1} stroke={link.copper ? '#E4BA91' : '#C3EAFF'} />
            </g>
          ))}
          {synapseNodes.map((node, index) => (
            <g key={index} className={styles.junction} style={{ '--birth': `${node.born.toFixed(3)}s` } as CSSProperties}>
              <circle cx={node.x} cy={node.y} r={index % 7 === 0 ? 12 : 7} fill="#7BB8D6" opacity=".12" />
              <circle cx={node.x} cy={node.y} r={index % 7 === 0 ? 2.8 : 1.5} fill={index % 7 === 0 ? '#E4BA91' : '#B6DCEC'} />
            </g>
          ))}
        </g>
      </svg>}
      {region && (
        <svg className={styles.regions} viewBox="0 0 1536 1024" aria-hidden="true">
          <defs><clipPath id={silhouetteId}><path d={contours.find(item => item.level === 24)?.d} /></clipPath></defs>
          <g clipPath={`url(#${silhouetteId})`}>
          {brainRegions.filter(item => region === 'all' || region === item.id).map(item => (
            <path key={item.id} d={item.path} fill={item.color} fillOpacity=".22"
              stroke={item.color} strokeWidth="2.2" strokeLinejoin="round"
              style={{ filter: `drop-shadow(0 0 8px ${item.color}88)` }} />
          ))}
          </g>
        </svg>
      )}
      {interaction}
    </div>
  );
}
