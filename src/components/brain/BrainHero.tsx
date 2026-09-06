import BrainVisual from './BrainVisual';
import BrainExperience from './BrainExperience';
import { BrainExplorerProvider } from './BrainContext';

export default function BrainHero() {
  return <BrainExplorerProvider><BrainExperience fallback={<BrainVisual priority />} /></BrainExplorerProvider>;
}
