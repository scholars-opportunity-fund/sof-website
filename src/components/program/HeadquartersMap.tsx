/**
 * A light map of Utah with a pin on Salt Lake City, drawn as inline SVG so it
 * needs no tiles, keys, or network. Coordinates are real longitude/latitude,
 * projected equirectangularly with the longitude squeezed by cos(39.5°).
 */

const W = 384;
const H = 460;
const SCALE = 56; // px per degree of latitude
const LON_SCALE = SCALE * Math.cos((39.5 * Math.PI) / 180);
// Utah spans 114.05°W–109.05°W and 37°N–42°N; centre it horizontally, leave room for the heading above.
const X0 = (W - 5 * LON_SCALE) / 2;
const Y0 = 118;

type LonLat = [number, number];

const project = ([lon, lat]: LonLat) =>
  `${(X0 + (lon + 114.05) * LON_SCALE).toFixed(1)} ${(Y0 + (42 - lat) * SCALE).toFixed(1)}`;
const line = (points: LonLat[]) => `M ${points.map(project).join(" L ")}`;
const shape = (points: LonLat[]) => `${line(points)} Z`;

const UTAH: LonLat[] = [[-114.05, 42], [-111.05, 42], [-111.05, 41], [-109.05, 41], [-109.05, 37], [-114.05, 37]];
const GREAT_SALT_LAKE: LonLat[] = [
  [-112.65, 41.72], [-112.35, 41.62], [-112.15, 41.55], [-112.05, 41.35], [-111.98, 41.1], [-112.05, 40.9],
  [-112.2, 40.75], [-112.45, 40.7], [-112.7, 40.8], [-112.9, 40.95], [-113.05, 41.2], [-113, 41.45], [-112.85, 41.65],
];
const UTAH_LAKE: LonLat[] = [[-111.87, 40.36], [-111.75, 40.33], [-111.72, 40.2], [-111.78, 40.07], [-111.88, 40.1], [-111.9, 40.25]];
const I15: LonLat[] = [
  [-112.03, 42], [-112.1, 41.7], [-111.97, 41.2], [-111.9, 40.76], [-111.85, 40.4], [-111.66, 40.23], [-111.85, 39.7],
  [-112.1, 39.3], [-112.4, 38.7], [-112.7, 38], [-113.1, 37.6], [-113.58, 37.1], [-113.85, 37],
];
const I80: LonLat[] = [[-114.05, 40.74], [-113.3, 40.72], [-112.5, 40.7], [-111.9, 40.76], [-111.6, 40.73], [-111.4, 40.95], [-111.05, 41.22]];
const I70: LonLat[] = [[-112.55, 38.57], [-111.9, 38.75], [-111.2, 38.9], [-110.16, 38.99], [-109.05, 39.12]];
const SLC: LonLat = [-111.89, 40.76];

export default function HeadquartersMap() {
  const [pinX, pinY] = project(SLC).split(" ").map(Number);
  const graticule = [];
  for (let lon = -115; lon <= -108; lon++) graticule.push(line([[lon, 43.5], [lon, 35.5]]));
  for (let lat = 36; lat <= 43; lat++) graticule.push(line([[-116.5, lat], [-106.5, lat]]));

  return (
    <div className="relative w-full max-w-sm overflow-hidden border border-border bg-white">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full"
        role="img"
        aria-label="Map of Utah with a pin marking Salt Lake City"
      >
        <path d={graticule.join(" ")} fill="none" stroke="var(--border)" strokeWidth={0.75} />
        <path d={shape(UTAH)} fill="var(--cloud)" stroke="var(--slate)" strokeOpacity={0.45} strokeWidth={1.25} strokeLinejoin="round" />
        <g fill="none" stroke="var(--slate)" strokeOpacity={0.3} strokeWidth={1} strokeLinecap="round" strokeLinejoin="round">
          <path d={line(I15)} />
          <path d={line(I80)} />
          <path d={line(I70)} />
        </g>
        <g fill="var(--signal)" fillOpacity={0.28} stroke="var(--signal)" strokeOpacity={0.5} strokeWidth={0.75} strokeLinejoin="round">
          <path d={shape(GREAT_SALT_LAKE)} />
          <path d={shape(UTAH_LAKE)} />
        </g>
        <g transform={`translate(${pinX} ${pinY})`}>
          <circle r={6} fill="var(--copper)" opacity={0.25}>
            <animate attributeName="r" values="6;18" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.35;0" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <path d="M0 0 C -2 -6 -9 -10 -9 -18 A 9 9 0 1 1 9 -18 C 9 -10 2 -6 0 0 Z" fill="var(--copper)" />
          <circle cy={-18} r={3.4} fill="#fff" />
          <text x={14} y={-14} fill="var(--ink)" fontSize={12} fontWeight={500} stroke="#fff" strokeWidth={4} strokeLinejoin="round" paintOrder="stroke">Salt Lake City</text>
        </g>
      </svg>
      {/* The white washes keep the graticule from running through the lettering. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-white from-70% to-transparent p-8 pb-10">
        <p className="text-[11px] font-medium tracking-[0.2em] text-copper uppercase">Headquarters</p>
        <p className="mt-3 font-heading text-2xl text-ink">Salt Lake City, UT</p>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-white from-60% to-transparent p-8 pt-10 text-[12px] font-medium tracking-[0.15em] uppercase">
        <span className="flex items-center gap-2 text-copper">
          <span aria-hidden="true" className="inline-block h-2 w-2 animate-pulse rounded-full bg-copper" />
          Active Cohort
        </span>
        <span className="hidden text-[10px] tracking-[0.12em] text-foreground-muted sm:inline">40.76° N, 111.89° W</span>
      </div>
    </div>
  );
}
