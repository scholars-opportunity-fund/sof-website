import { SITE_SECTIONS } from '../site-map';

/**
 * The brain as navigation.
 *
 * Every region carries destinations. Hovering one reveals them; one click
 * travels. The mapping is anatomical rather than arbitrary — the frontal lobe is
 * executive function, so it carries the decisions; faces are recognised in the
 * temporal lobe, so it carries the people; the cerebellum is where practice
 * becomes competence, which is what an analyst program is; and the brainstem is
 * the channel between the brain and everything outside it, so it carries
 * contact and the fund's own structure.
 *
 * Every region of the model carries destinations: a brain with inert areas reads
 * as broken rather than as deliberately quiet. `mesh` is the node name inside
 * `anatomical-brain.glb`. Counts are uneven by design — the mapping follows what
 * each region actually does, rather than dividing nine destinations evenly.
 */
export const brainLobes = [
  {
    id: 'frontal',
    mesh: 'process',
    label: 'Frontal',
    note: 'judgment',
    links: [SITE_SECTIONS.process, SITE_SECTIONS.leadership],
  },
  {
    id: 'parietal',
    mesh: 'approach',
    label: 'Parietal / occipital',
    note: 'perception',
    links: [SITE_SECTIONS.approach],
  },
  {
    id: 'temporal',
    mesh: 'team',
    label: 'Temporal',
    note: 'people and memory',
    links: [SITE_SECTIONS.team, SITE_SECTIONS.insights],
  },
  {
    id: 'cerebellum',
    mesh: 'program',
    label: 'Cerebellum',
    note: 'practice',
    links: [SITE_SECTIONS.program, SITE_SECTIONS.apply],
  },
  {
    id: 'brainstem',
    mesh: 'structure',
    label: 'Brainstem',
    note: 'the channel',
    links: [SITE_SECTIONS.structure, SITE_SECTIONS.contact],
  },
] as const;

export type BrainLobe = (typeof brainLobes)[number];
export type BrainLobeId = BrainLobe['id'];
/** The GLB node names that carry navigation — all of them. */
export type NavMesh = BrainLobe['mesh'];

export const NAV_MESHES: readonly string[] = brainLobes.map(lobe => lobe.mesh);

export function lobeForMesh(mesh: string | null): BrainLobe | null {
  return brainLobes.find(lobe => lobe.mesh === mesh) ?? null;
}

/**
 * Motion, as settled against the prototype in
 * `.context/compound-engineering/ce-prototype/2026-09-09-brain-nav-motion/`.
 *
 * `lift` is deliberately restrained: at higher values the lobe stops reading as
 * the metal finish and looks repainted. Do not raise it without re-judging.
 */
export const LOBE_MOTION = {
  lift: .6,
  dim: .4,
  fade: 260,
  reach: .55,
  reveal: 620,
  stagger: 130,
  spread: 168,
  curve: 34,
  dive: 980,
  depth: .86,
  handoff: 620,
  overlap: .45,
} as const;
