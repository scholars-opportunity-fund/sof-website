// The opening synapse animation from the Signal design: a lateral hemisphere
// traced lobe by lobe, filled with particles that connect outward from a seed
// while the camera flies through, then pulls back to the whole brain. It is
// drawn on a 2D canvas above the 3D model and dissolves as the model forms.

type Node = { x: number; y: number; z: number; bright: boolean; r: number; k: number; p1: number; p2: number; f1: number; f2: number; amp: number; fp: number; inner?: boolean; rim?: boolean; born: number; X: number; Y: number; D: number; sx: number; sy: number; sz: number; A: number };
type Edge = { a: number; b: number; ph: number; sp: number; rim?: boolean; sulcus?: boolean; long?: boolean; dseed: number; tb: number };
type Point = [number, number];

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const p = clamp01(value); return p * p * (3 - 2 * p); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const BLUE: Point3 = [123, 184, 214], SKY: Point3 = [168, 214, 236], COPPER: Point3 = [160, 117, 90], GRAY: Point3 = [136, 146, 160];
type Point3 = [number, number, number];
const rgba = (color: Point3, alpha: number) => `rgba(${color[0]},${color[1]},${color[2]},${alpha})`;

export type BrainIntro = ReturnType<typeof createBrainIntro>;

export function createBrainIntro(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('2D canvas unavailable');
  const ctx = context;
  let seed = 11;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // Shared borders are the real fissures: central sulcus, Sylvian fissure, parieto-occipital line.
  const CS: Point[] = [[-0.05, -0.79], [-0.02, -0.55], [0.01, -0.32], [0.02, -0.12], [0.0, 0.02]];
  const SYL: Point[] = [[-0.62, 0.18], [-0.55, 0.17], [-0.40, 0.12], [-0.20, 0.06], [0.0, 0.02], [0.18, -0.05], [0.35, -0.10], [0.50, 0.05]];
  const PO: Point[] = [[0.62, -0.62], [0.62, -0.35], [0.58, -0.10], [0.50, 0.05]];
  const reverse = (points: Point[]) => points.slice().reverse();
  const polygons: Record<string, Point[]> = {
    frontal: ([[-1.0, -0.10], [-0.92, -0.36], [-0.77, -0.56], [-0.54, -0.69], [-0.28, -0.77]] as Point[]).concat(CS, reverse(SYL).slice(3), [[-0.66, 0.14], [-0.78, 0.14], [-0.92, 0.08], [-0.99, 0.0]]),
    parietal: ([[-0.05, -0.79], [0.25, -0.77], [0.51, -0.69]] as Point[]).concat(PO, reverse(SYL).slice(0, 4), reverse(CS).slice(1)),
    occipital: ([[0.62, -0.62], [0.74, -0.52], [0.90, -0.33], [0.98, -0.10], [0.97, 0.13], [0.90, 0.30], [0.78, 0.36], [0.62, 0.34], [0.50, 0.30]] as Point[]).concat(reverse(PO).slice(0, 3)),
    temporal: SYL.concat([[0.50, 0.30], [0.42, 0.42], [0.30, 0.50], [0.10, 0.53], [-0.14, 0.53], [-0.34, 0.49], [-0.48, 0.41], [-0.60, 0.32], [-0.66, 0.24]]),
    cerebellum: [[0.50, 0.30], [0.62, 0.34], [0.78, 0.36], [0.86, 0.42], [0.84, 0.56], [0.74, 0.66], [0.60, 0.70], [0.50, 0.68], [0.45, 0.60], [0.44, 0.48], [0.42, 0.42]],
    stem: [[0.30, 0.50], [0.42, 0.42], [0.44, 0.48], [0.45, 0.60], [0.46, 0.72], [0.46, 0.90], [0.32, 0.90], [0.30, 0.72]],
  };
  const inside = (polygon: Point[], x: number, y: number) => {
    let hit = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) hit = !hit;
    }
    return hit;
  };
  const edgeDistance = (polygon: Point[], x: number, y: number) => {
    let best = 9;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [x1, y1] = polygon[i], [x2, y2] = polygon[j];
      const dx = x2 - x1, dy = y2 - y1, length = dx * dx + dy * dy || 1e-9;
      const u = clamp01(((x - x1) * dx + (y - y1) * dy) / length);
      best = Math.min(best, Math.hypot(x - (x1 + u * dx), y - (y1 + u * dy)));
    }
    return best;
  };
  const names = Object.keys(polygons);
  const lobeAt = (x: number, y: number) => names.find(name => inside(polygons[name], x, y)) ?? null;
  const outer: Point[] = polygons.frontal.slice(0, 5).concat([[-0.05, -0.79], [0.25, -0.77], [0.51, -0.69], [0.62, -0.62], [0.74, -0.52], [0.90, -0.33], [0.98, -0.10], [0.97, 0.13], [0.90, 0.30], [0.78, 0.36], [0.86, 0.42], [0.84, 0.56], [0.74, 0.66], [0.60, 0.70], [0.50, 0.68], [0.46, 0.72], [0.46, 0.90], [0.32, 0.90], [0.30, 0.72], [0.30, 0.50], [0.10, 0.53], [-0.14, 0.53], [-0.34, 0.49], [-0.48, 0.41], [-0.60, 0.32], [-0.66, 0.24], [-0.62, 0.18], [-0.66, 0.14], [-0.78, 0.14], [-0.92, 0.08], [-0.99, 0.0]]);
  const thickness = (lobe: string, x: number, y: number) => {
    const depth = Math.sqrt(Math.min(edgeDistance(polygons[lobe], x, y), 0.3) / 0.3);
    return lobe === 'stem' ? 0.07 : lobe === 'cerebellum' ? 0.28 * depth : 0.5 * Math.sqrt(Math.min(edgeDistance(outer, x, y), 0.34) / 0.34);
  };

  const nodes: Node[] = [];
  const chains: { indices: number[]; closed: boolean; rim?: boolean }[] = [];
  const make = (x: number, y: number, z: number, extra: Partial<Node>): Node => ({ x, y, z, bright: false, r: .6, k: 2, p1: random() * 6.28, p2: random() * 6.28, f1: .4 + random() * .9, f2: .4 + random() * .9, amp: .4 + random() * .8, fp: random() * 6.28, born: 7.4, X: 0, Y: 0, D: 1, sx: 0, sy: 0, sz: 1, A: 0, ...extra });
  while (nodes.length < 300) {
    const x = random() * 2.1 - 1.05, y = random() * 1.75 - 0.82, lobe = lobeAt(x, y);
    if (!lobe) continue;
    const depth = thickness(lobe, x, y), shell = random() < .7, sign = random() < .5 ? -1 : 1, bright = random() < .16;
    nodes.push(make(x, y, shell ? sign * depth * (.9 + random() * .1) : (random() * 2 - 1) * depth, { bright, r: bright ? 1.6 + random() : .55 + random() * .6 }));
  }
  let innerCount = 0;
  while (innerCount < 240) {
    const x = random() * 2.1 - 1.05, y = random() * 1.75 - 0.82, lobe = lobeAt(x, y);
    if (!lobe) continue;
    nodes.push(make(x, y, (random() * 2 - 1) * thickness(lobe, x, y) * .9, { inner: true, k: 1, bright: random() < .3, r: .5 + random() * .7 }));
    innerCount++;
  }
  // Each lobe gets a closed outline chain, so the silhouette reads as a whole.
  for (const name of names) {
    const polygon = polygons[name], indices: number[] = [];
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [x1, y1] = polygon[j], [x2, y2] = polygon[i];
      const steps = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / .028));
      for (let q = 0; q < steps; q++) {
        const u = q / steps;
        indices.push(nodes.push(make(x1 + (x2 - x1) * u, y1 + (y2 - y1) * u, (random() - .5) * .02, { r: .7, k: 1, rim: true })) - 1);
      }
    }
    chains.push({ indices, closed: true, rim: true });
  }
  const gyri: [string, Point[]][] = [
    ['frontal', [[-0.85, -0.08], [-0.65, -0.18], [-0.45, -0.30], [-0.30, -0.46]]], ['frontal', [[-0.90, -0.30], [-0.72, -0.48], [-0.54, -0.60]]], ['frontal', [[-0.30, -0.72], [-0.25, -0.50], [-0.18, -0.28], [-0.12, -0.08]]], ['frontal', [[-0.62, 0.02], [-0.42, -0.02], [-0.22, -0.02], [-0.06, -0.06]]],
    ['parietal', [[0.15, -0.62], [0.30, -0.46], [0.45, -0.30]]], ['parietal', [[0.08, -0.40], [0.25, -0.28], [0.40, -0.18]]],
    ['occipital', [[0.70, -0.40], [0.78, -0.20], [0.82, 0.02], [0.78, 0.22]]], ['occipital', [[0.62, -0.20], [0.68, 0.0], [0.66, 0.20]]],
    ['temporal', [[-0.40, 0.34], [-0.20, 0.28], [0.0, 0.24], [0.20, 0.20], [0.35, 0.12]]], ['temporal', [[-0.50, 0.24], [-0.30, 0.18], [-0.10, 0.14], [0.10, 0.10]]], ['temporal', [[-0.20, 0.44], [0.0, 0.40], [0.20, 0.36]]],
    ['cerebellum', [[0.50, 0.42], [0.64, 0.42], [0.78, 0.44]]], ['cerebellum', [[0.50, 0.52], [0.64, 0.52], [0.78, 0.52]]], ['cerebellum', [[0.52, 0.60], [0.66, 0.61]]],
  ];
  for (const [lobe, points] of gyri) {
    const indices: number[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const [x1, y1] = points[i], [x2, y2] = points[i + 1];
      const steps = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / .035));
      for (let q = 0; q < steps; q++) {
        const u = q / steps, x = x1 + (x2 - x1) * u, y = y1 + (y2 - y1) * u;
        indices.push(nodes.push(make(x, y, thickness(lobe, x, y) * .98, { r: .75, k: 1 })) - 1);
      }
    }
    chains.push({ indices, closed: false });
  }
  // Keep chain references stable through the sort.
  const order = nodes.map((node, index) => ({ node, index })).sort((a, b) => Math.hypot(a.node.x, a.node.y) - Math.hypot(b.node.x, b.node.y));
  const remap = new Map(order.map((entry, position) => [entry.index, position]));
  nodes.splice(0, nodes.length, ...order.map(entry => entry.node));
  for (const chain of chains) chain.indices = chain.indices.map(index => remap.get(index)!);

  const edges: Edge[] = [], seen = new Set<string>();
  const link = (i: number, j: number, extra: Partial<Edge>) => {
    const key = i < j ? `${i}-${j}` : `${j}-${i}`;
    if (i !== j && !seen.has(key)) { seen.add(key); edges.push({ a: i, b: j, ph: random(), sp: .4 + random() * .6, dseed: 0, tb: 0, ...extra }); }
  };
  for (const chain of chains) for (let q = 0; q < chain.indices.length - (chain.closed ? 0 : 1); q++) link(chain.indices[q], chain.indices[(q + 1) % chain.indices.length], { rim: !!chain.rim, sulcus: !chain.rim });
  nodes.forEach((node, i) => {
    const near: [number, number][] = [];
    for (let j = 0; j < nodes.length; j++) {
      if (j === i) continue;
      const other = nodes[j], d = (other.x - node.x) ** 2 + (other.y - node.y) ** 2 + (other.z - node.z) ** 2;
      if (near.length < node.k || d < near[near.length - 1][0]) { near.push([d, j]); near.sort((p, q) => p[0] - q[0]); if (near.length > node.k) near.pop(); }
    }
    for (const [, j] of near) link(i, j, {});
  });
  for (let k = 0; k < 14; k++) {
    const a = Math.floor(random() * nodes.length), b = Math.floor(random() * nodes.length);
    if (a !== b) edges.push({ a, b, ph: random(), sp: .3 + random() * .4, long: true, dseed: 0, tb: 0 });
  }
  // Synapses form outward from a seed just ahead of the camera, accelerating over t = 0.25 → 7.4.
  const origin: Point3 = [-0.45, -0.05, 0];
  for (const edge of edges) {
    const A = nodes[edge.a], B = nodes[edge.b];
    edge.dseed = Math.hypot((A.x + B.x) / 2 - origin[0], (A.y + B.y) / 2 - origin[1], (A.z + B.z) / 2 - origin[2]) + random() * .16;
  }
  edges.sort((p, q) => p.dseed - q.dseed);
  const EA = Math.exp(8) - 1;
  edges.forEach((edge, i) => { edge.tb = .25 + 7.15 * Math.log(1 + (i / edges.length) * EA) / 8; });
  for (const edge of edges) { nodes[edge.a].born = Math.min(nodes[edge.a].born, edge.tb); nodes[edge.b].born = Math.min(nodes[edge.b].born, edge.tb); }

  const texts = ['MoM +5.01%', 'EV/EBITDA 7.2x', 'Spin-off · T−14d', '13D filed', 'Short interest 18.4%', 'Index add · R2000', 'FCF yield 11%', 'Tender @ $42', 'Net debt −$310M', 'Insider buy +2.1%', 'Activist stake 6.8%', 'Break fee 3.5%', 'YoY −3.2%', 'Arb spread 4.9%', 'Ch. 11 exit', 'Buyback +$1.2B', 'Guidance cut −7%', 'Special div $3.50', 'Rights offering', 'Coverage · 1 analyst', 'Vol 90d 38%', 'Put/call 1.4', 'EPS rev +12%', 'Pension deficit', 'Dual-class collapse', 'Hold-co discount 31%', 'Carve-out IPO', 'Lock-up expiry'];
  const labels = texts.map((text, i) => ({ text: text.toUpperCase(), node: Math.floor((i / texts.length) * nodes.length * .9) + 3, dx: 10 + random() * 16, dy: (random() < .5 ? -1 : 1) * (8 + random() * 16) }));

  let width = 0, height = 0, pixelRatio = 1;
  function resize() {
    const box = canvas.getBoundingClientRect();
    pixelRatio = Math.min(devicePixelRatio || 1, 2);
    width = Math.round(box.width); height = Math.round(box.height);
    const w = Math.round(width * pixelRatio), h = Math.round(height * pixelRatio);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  }

  // `time` is the intro clock (0 → 12); `clock` keeps running through holds so pulses never freeze.
  function draw(time: number, clock: number, alpha: number) {
    resize();
    const W = width, H = height;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (!W || !H || alpha <= .005) return;
    const t = time;
    const R = Math.min(W * .34, H * .44);
    const jitter = t < 5.2 ? smooth((t - .3) / 1) : 1 - smooth((t - 5.2) / 2.2);
    const fly = t < 5.2 ? 1 : 1 - smooth((t - 5.2) / 2.2);
    const cx = .35 * Math.sin(clock * .9) * R * fly, cy = .3 * Math.cos(clock * .7) * R * fly;
    const fire = t < .4 ? 0 : t < 1.6 ? smooth((t - .4) / 1.2) : t < 7.6 ? 1 : lerp(1, .22, smooth((t - 7.6) / 1.2));
    const labelAlpha = smooth((t - 1.2) / .8) * (1 - smooth((t - 5.2) / .9));
    const calm = smooth((t - 7.4) / 2), settle = 1 - smooth((t - 9.4) / 1.2);
    const ry = calm * Math.sin(clock * .22) * .55 * settle, rx = calm * .12 * settle;
    const cyy = Math.cos(ry), syy = Math.sin(ry), cxx = Math.cos(rx), sxx = Math.sin(rx);
    const immersive = 1 - smooth((t - 5.2) / 2.2), overview = 1 - immersive, inflate = lerp(1, 2.6, immersive);
    const u = smooth((t - .25) / 4.95);
    const camx = t < 5.2 ? lerp(-1.5, -1, u) : lerp(-1, -4.5, smooth((t - 5.2) / 2.2));
    const camy = .1 * Math.sin(clock * .6) * immersive, camz = .1 * Math.cos(clock * .45) * immersive;
    const roll = .08 * Math.sin(clock * .35) * immersive, cr = Math.cos(roll), sr = Math.sin(roll), F = H * .95;
    for (const node of nodes) {
      const x1 = node.x * cyy + node.z * syy, z1 = -node.x * syy + node.z * cyy, y1 = node.y * cxx - z1 * sxx, z2 = node.y * sxx + z1 * cxx;
      const f = 1 / (1 + z2 * .34 * calm);
      node.D = lerp(1, f, calm);
      node.X = x1 * f * R + jitter * node.amp * 22 * Math.sin(clock * node.f1 + node.p1);
      node.Y = y1 * f * R + jitter * node.amp * 22 * Math.cos(clock * node.f2 + node.p2);
      const ox = W / 2 + node.X - cx, oy = H / 2 + node.Y - cy;
      const dx = node.x - camx, dy0 = node.y - camy, dz0 = node.z * inflate - camz, dy = dy0 * cr - dz0 * sr, dz = dz0 * cr + dy0 * sr;
      let px = ox, py = oy, scale = 0, near = 0;
      if (dx > .06) { const q = F / dx; px = W / 2 + dz * q; py = H / 2 + dy * q; scale = clamp01(.9 / dx); near = clamp01((dx - .12) / .45) * clamp01((2.8 - dx) / 1.2); }
      node.sx = lerp(px, ox, overview); node.sy = lerp(py, oy, overview); node.sz = lerp(.5 + 3.5 * scale, 1, overview);
      node.A = clamp01((t - node.born) / .45) * lerp(near, 1, overview) * (node.inner ? immersive : 1) * alpha;
    }
    ctx.lineWidth = .75;
    const buckets: number[][] = Array.from({ length: 8 }, () => []), outlines: number[][] = Array.from({ length: 8 }, () => []);
    const pulses: number[] = [], tips: number[] = [];
    for (const edge of edges) {
      const g = clamp01((t - edge.tb) / .5); if (g <= 0) continue;
      const A = nodes[edge.a], B = nodes[edge.b], al = Math.min(A.A, B.A); if (al <= 0) continue;
      if (edge.long && (jitter < .05 || immersive > .5)) continue;
      const ax = A.sx, ay = A.sy, bx = lerp(A.sx, B.sx, g), by = lerp(A.sy, B.sy, g);
      const span = lerp(clamp01((W * .8 - Math.hypot(B.sx - ax, B.sy - ay)) / (W * .35)), 1, overview); if (span <= .01) continue;
      if (g < 1) tips.push(bx, by, Math.max(.6, Math.min(2.4, (A.sz + B.sz) / 2)), al);
      if ((ax < 0 || ax > W || ay < 0 || ay > H) && (bx < 0 || bx > W || by < 0 || by > H)) continue;
      const strength = span * al * (edge.long ? .14 * jitter : edge.rim ? .55 : edge.sulcus ? .38 : .11 + .09 * fire) * lerp(1, .35 + .65 * clamp01(((A.D + B.D) / 2 - .7) / .6), calm);
      (edge.rim || edge.sulcus ? outlines : buckets)[Math.min(7, Math.round(Math.min(.6, strength) / .6 * 7))].push(ax, ay, bx, by);
      if (g >= 1 && fire > .02 && edge.ph < .35) { const k = (clock * edge.sp + edge.ph) % 1; pulses.push(lerp(ax, bx, k), lerp(ay, by, k), fire * al, Math.max(.6, Math.min(2.2, (A.sz + B.sz) / 2))); }
    }
    if (tips.length) {
      ctx.fillStyle = rgba(COPPER, .28 * alpha); ctx.beginPath(); for (let j = 0; j < tips.length; j += 4) { const r = 7 * tips[j + 2]; ctx.moveTo(tips[j] + r, tips[j + 1]); ctx.arc(tips[j], tips[j + 1], r, 0, 6.283); } ctx.fill();
      ctx.fillStyle = rgba(COPPER, .95 * alpha); ctx.beginPath(); for (let j = 0; j < tips.length; j += 4) { const r = 2.2 * tips[j + 2]; ctx.moveTo(tips[j] + r, tips[j + 1]); ctx.arc(tips[j], tips[j + 1], r, 0, 6.283); } ctx.fill();
    }
    const strokeBuckets = (list: number[][], lineWidth: number) => {
      ctx.lineWidth = lineWidth;
      list.forEach((bucket, i) => { if (!bucket.length) return; ctx.strokeStyle = rgba(BLUE, (i / 7) * .6); ctx.beginPath(); for (let j = 0; j < bucket.length; j += 4) { ctx.moveTo(bucket[j], bucket[j + 1]); ctx.lineTo(bucket[j + 2], bucket[j + 3]); } ctx.stroke(); });
    };
    strokeBuckets(buckets, .75);
    strokeBuckets(outlines, 1.15);
    if (pulses.length) {
      ctx.fillStyle = rgba(COPPER, fire * .22 * alpha); ctx.beginPath(); for (let j = 0; j < pulses.length; j += 4) { const r = 6 * pulses[j + 3]; ctx.moveTo(pulses[j] + r, pulses[j + 1]); ctx.arc(pulses[j], pulses[j + 1], r, 0, 6.283); } ctx.fill();
      ctx.fillStyle = rgba(COPPER, fire * .9 * alpha); ctx.beginPath(); for (let j = 0; j < pulses.length; j += 4) { const r = 1.8 * pulses[j + 3]; ctx.moveTo(pulses[j] + r, pulses[j + 1]); ctx.arc(pulses[j], pulses[j + 1], r, 0, 6.283); } ctx.fill();
    }
    const faint: number[] = [], bright: number[] = [], halos: number[] = [];
    for (const node of nodes) {
      if (node.A <= 0) continue;
      const x = node.sx, y = node.sy; if (x < -10 || x > W + 10 || y < -10 || y > H + 10) continue;
      const depth = clamp01((node.D - .7) / .6), rr = node.r * node.sz * lerp(1, .6 + .9 * depth, calm);
      (node.bright ? bright : faint).push(x, y, rr);
      if (fire > .02 && node.bright) halos.push(x, y, node.r * 4.5 * node.sz, (.5 + .5 * Math.sin(clock * 3 + node.fp)) * node.A);
    }
    const dots = (list: number[], color: string) => { if (!list.length) return; ctx.fillStyle = color; ctx.beginPath(); for (let j = 0; j < list.length; j += 3) { ctx.moveTo(list[j] + list[j + 2], list[j + 1]); ctx.arc(list[j], list[j + 1], list[j + 2], 0, 6.283); } ctx.fill(); };
    if (halos.length) { ctx.fillStyle = rgba(SKY, fire * .22 * alpha); ctx.beginPath(); for (let j = 0; j < halos.length; j += 4) { ctx.moveTo(halos[j] + halos[j + 2], halos[j + 1]); ctx.arc(halos[j], halos[j + 1], halos[j + 2] * (.6 + .4 * halos[j + 3]), 0, 6.283); } ctx.fill(); }
    dots(faint, rgba(SKY, .5 * lerp(1, .6, calm) * alpha));
    dots(bright, rgba(SKY, .95 * alpha));
    if (labelAlpha > .01) {
      ctx.font = '500 10px Inter, system-ui, sans-serif'; ctx.textBaseline = 'middle';
      if ('letterSpacing' in ctx) ctx.letterSpacing = '1.5px';
      for (const label of labels) {
        const node = nodes[label.node]; if (!node || node.A <= 0) continue;
        const x = node.sx, y = node.sy; if (x < -50 || x > W + 50 || y < -20 || y > H + 20) continue;
        const a = labelAlpha * node.A, color = label.text.includes('+') ? COPPER : label.text.includes('−') ? BLUE : GRAY;
        ctx.strokeStyle = rgba(GRAY, a * .5); ctx.lineWidth = .75; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + label.dx, y + label.dy); ctx.stroke();
        ctx.fillStyle = rgba(color, a); ctx.fillText(label.text, x + label.dx + 4, y + label.dy);
      }
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    }
  }
  function clear() { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); }
  return { draw, clear };
}
