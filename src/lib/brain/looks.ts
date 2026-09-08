// Alternate finishes for the 3D brain. The intro clip ends on a glowing lattice, so the live model
// can meet it anywhere between solid metal and an open graph. Each look drives the same four layers:
// the surface shell, the wireframe over it, the connection lines, and the junction points.

export type BrainLookName = 'metal' | 'glass' | 'lattice' | 'core';

export type BrainLook = {
  label: string;
  note: string;
  surface: { color: string; emissive: string; emissiveIntensity: number; metalness: number; roughness: number; clearcoat: number; opacity: number; transmission: number; thickness: number; ior: number; envMapIntensity: number; depthWrite: boolean; attenuationColor: string; attenuationDistance: number };
  wireOpacity: number;
  network: { strength: number; base: [number, number, number]; pulse: [number, number, number] };
  junction: { size: number; strength: number };
};

export const BRAIN_LOOKS: Record<BrainLookName, BrainLook> = {
  // What ships today: an opaque cast-metal brain. Reads as an object, not as a network.
  metal: {
    label: 'Metal',
    note: 'The current finish. Solid navy metal with a clearcoat, network barely visible.',
    surface: { color: '#18364d', emissive: '#183044', emissiveIntensity: .16, metalness: .7, roughness: .28, clearcoat: 1, opacity: .94, transmission: 0, thickness: 0, ior: 1.5, envMapIntensity: .65, depthWrite: true, attenuationColor: '#ffffff', attenuationDistance: Infinity },
    wireOpacity: .035,
    network: { strength: 1, base: [.22, .52, .72], pulse: [.8, .93, 1] },
    junction: { size: 3, strength: .5 },
  },
  // A glass shell you can see the firing through, which is the closest match to the clip's last second.
  glass: {
    label: 'Glass',
    note: 'Transmissive shell. The anatomy still reads, and the network fires visibly inside it.',
    surface: { color: '#0d2334', emissive: '#12384f', emissiveIntensity: .14, metalness: .05, roughness: .06, clearcoat: 1, opacity: 1, transmission: .92, thickness: 2.4, ior: 1.42, envMapIntensity: 1.3, depthWrite: false, attenuationColor: '#1d5f86', attenuationDistance: .55 },
    wireOpacity: .006,
    network: { strength: 3, base: [.3, .66, .9], pulse: [.95, .99, 1] },
    junction: { size: 4.5, strength: 1.6 },
  },
  // The brain as a graph: the shell is a hint, the connections carry the form.
  lattice: {
    label: 'Lattice',
    note: 'Barely-there shell. The brain is drawn by its connections, like the clip mid-formation.',
    surface: { color: '#0c1b28', emissive: '#17415c', emissiveIntensity: .26, metalness: .2, roughness: .55, clearcoat: 0, opacity: .05, transmission: 0, thickness: 0, ior: 1.2, envMapIntensity: .4, depthWrite: false, attenuationColor: '#ffffff', attenuationDistance: Infinity },
    wireOpacity: .03,
    network: { strength: 4.2, base: [.36, .7, .92], pulse: [1, 1, 1] },
    junction: { size: 6, strength: 2.6 },
  },
  // A dark body with hot copper traffic inside, so the trades in the clip carry into the live model.
  core: {
    label: 'Core',
    note: 'Dark smoky body, copper pulses running inside. Carries the trade colour from the clip.',
    surface: { color: '#0d1d29', emissive: '#0b1c27', emissiveIntensity: .1, metalness: .45, roughness: .5, clearcoat: .5, opacity: 1, transmission: .55, thickness: 3.2, ior: 1.45, envMapIntensity: .55, depthWrite: false, attenuationColor: '#0a2331', attenuationDistance: .35 },
    wireOpacity: .006,
    network: { strength: 2.2, base: [.32, .5, .62], pulse: [1, .68, .36] },
    junction: { size: 4, strength: 1.4 },
  },
};

export const DEFAULT_LOOK: BrainLookName = 'metal';

export function isBrainLook(value: string | null): value is BrainLookName {
  return value === 'metal' || value === 'glass' || value === 'lattice' || value === 'core';
}
