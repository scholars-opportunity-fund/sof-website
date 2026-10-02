import Frontier from '@/components/hero/Frontier';
import BrainHero from '@/components/brain/BrainHero';
import SignalContent from '@/components/signal/SignalContent';
import MicrocapCallout from '@/components/competition/MicrocapCallout';
import { FUND } from "@/lib/constants";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: `${FUND.name} | Event-Driven Public Equities`,
  description: FUND.description,
  path: "",
});

export default function Home() {
  return <><Frontier /><BrainHero /><MicrocapCallout className="border-t" /><SignalContent /></>;
}
