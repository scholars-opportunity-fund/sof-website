import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import BrainVisual from '@/components/brain/BrainVisual';
import { brainRegions } from '@/lib/brain/regions';

export const metadata: Metadata = {
  title: 'Glass Connectome — Visual review',
  robots: { index: false, follow: false },
};

export default function BrainReview() {
  if (process.env.NODE_ENV !== 'development') notFound();
  return (
    <div className="bg-ink text-cloud px-6 py-12 sm:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs tracking-[.2em] uppercase text-signal">SOF / Design review / Selected concept B</p>
        <h1 className="mt-5 text-4xl sm:text-5xl">Glass Connectome</h1>
        <p className="mt-5 max-w-2xl text-sm text-slate">The selected brain, rendered with its proposed section silhouettes. These are fixed visual states for approval. Scroll, zoom, and region navigation follow visual acceptance.</p>
        <Link className="mt-6 inline-block border-b border-copper pb-1 text-sm" href="/">View the actual homepage →</Link>
        <section className="mt-12">
          <h2 className="text-2xl">Complete color study</h2>
          <BrainVisual region="all" />
          <ul className="flex flex-wrap gap-x-8 gap-y-3 text-xs">
            {brainRegions.map(region => <li key={region.id} style={{ color: region.color }}>{region.name} / {region.anatomy}</li>)}
          </ul>
        </section>
        <div className="mt-16 grid gap-12 md:grid-cols-2">
          {brainRegions.map((region, index) => (
            <section key={region.id}>
              <h2 className="text-xl" style={{ color: region.color }}>0{index + 1} / {region.name}</h2>
              <BrainVisual region={region.id} />
            </section>
          ))}
        </div>
        <section className="mt-16">
          <h2 className="text-2xl">Overview → closer view</h2>
          <p className="mt-3 text-sm text-slate">Composition endpoints for future scroll and zoom.</p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="overflow-hidden border border-gunmetal"><BrainVisual /></div>
            <div className="overflow-hidden border border-gunmetal"><div className="scale-150 origin-[45%_40%]"><BrainVisual region="process" /></div></div>
          </div>
        </section>
      </div>
    </div>
  );
}
