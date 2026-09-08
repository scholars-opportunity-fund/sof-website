import contours from './contours.json';

type Point = { x: number; y: number; born: number };
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

// Sample the selected brain's real contours so the network settles into the
// same anatomy as the material. Stable indices survive the build ordering.
const nodes: Point[] = [];
for (const { d } of contours) {
  for (const match of d.matchAll(/[ML]([\d.]+),([\d.]+)/g)) {
    const point = { x: Number(match[1]), y: Number(match[2]), born: 0 };
    if (nodes.every(node => distance(node, point) > 55)) nodes.push(point);
  }
}

const seed = nodes.reduce((best, node, index) =>
  distance(node, { x: 540, y: 460, born: 0 }) < distance(nodes[best], { x: 540, y: 460, born: 0 }) ? index : best, 0);
const reached = new Set([seed]);
const links: { a: number; b: number }[] = [];
// Grow a connected tree from one ignition point, then add local cross-links.
const nearest = nodes.map((node) => ({ a: seed, length: distance(node, nodes[seed]) }));
while (reached.size < nodes.length) {
  let next = -1;
  for (let i = 0; i < nodes.length; i++) {
    if (!reached.has(i) && (next < 0 || nearest[i].length < nearest[next].length)) next = i;
  }
  links.push({ a: nearest[next].a, b: next });
  reached.add(next);
  for (let i = 0; i < nodes.length; i++) {
    const length = distance(nodes[i], nodes[next]);
    if (length < nearest[i].length) nearest[i] = { a: next, length };
  }
}
const birth = (index: number) => .25 + 7.7 * Math.log(1 + index / links.length * (Math.exp(4) - 1)) / 4;
nodes[seed].born = .1;
links.forEach((link, index) => { nodes[link.b].born = birth(index); });
const pairs = new Set(links.map(({ a, b }) => [a, b].sort((x, y) => x - y).join(':')));
for (let a = 0; a < nodes.length; a++) {
  if (a % 2 !== 0) continue;
  let extra = -1, shortest = 105;
  for (let b = a + 1; b < nodes.length; b++) {
    const length = distance(nodes[a], nodes[b]);
    if (length < shortest && !pairs.has(`${a}:${b}`)) { shortest = length; extra = b; }
  }
  if (extra >= 0) links.push({ a, b: extra });
}

export const synapseNodes: ReadonlyArray<Readonly<Point>> = nodes;
export const synapseLinks = links.map(({ a, b }, index) => {
  const start = nodes[a], end = nodes[b];
  const bend = index % 2 ? .15 : -.15;
  const dx = end.x - start.x, dy = end.y - start.y;
  return {
    d: `M${start.x},${start.y} Q${((start.x + end.x) / 2 - dy * bend).toFixed(1)},${((start.y + end.y) / 2 + dx * bend).toFixed(1)} ${end.x},${end.y}`,
    born: Math.max(start.born, end.born),
    copper: index % 5 === 0,
  };
});
