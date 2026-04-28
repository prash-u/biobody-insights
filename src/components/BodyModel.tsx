import { useId, useMemo } from 'react';
import { TISSUE_BY_ID } from '@/atlas/data';
import { ProgramEffect } from '@/atlas/types';
import { stateColor } from '@/atlas/useAtlas';

interface BodyModelProps {
  tissueEffects: Map<string, ProgramEffect>;
  hoveredTissue: string | null;
  selectedTissue: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}

export function BodyModel({
  tissueEffects,
  hoveredTissue,
  selectedTissue,
  onHover,
  onSelect,
}: BodyModelProps) {
  const regions = useMemo(() => ORGAN_REGIONS, []);
  const uid = useId().replace(/:/g, '');

  return (
    <div className="body-stage relative flex h-full w-full select-none items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-glow opacity-40" />
      <div className="pointer-events-none absolute inset-x-[16%] bottom-[4%] top-[4%] rounded-[42%] border border-primary/10 bg-primary/[0.018] blur-[1px]" />
      <div
        className="pointer-events-none absolute left-0 right-0 h-24 animate-scan"
        style={{ background: 'linear-gradient(180deg, transparent, hsl(var(--primary)/0.16), transparent)' }}
      />

      <svg
        viewBox="0 0 420 760"
        className="relative h-full w-full max-h-[690px] drop-shadow-[0_26px_55px_hsl(188_100%_50%/0.18)]"
        role="img"
        aria-label="Interactive human metabolic body atlas"
      >
        <defs>
          <linearGradient id={`${uid}-bodyFill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(213 58% 15%)" stopOpacity="0.9" />
            <stop offset="54%" stopColor="hsl(217 58% 8%)" stopOpacity="0.82" />
            <stop offset="100%" stopColor="hsl(222 68% 4%)" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id={`${uid}-bodyStroke`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(188 100% 76%)" stopOpacity="0.64" />
            <stop offset="100%" stopColor="hsl(215 100% 68%)" stopOpacity="0.34" />
          </linearGradient>
          <radialGradient id={`${uid}-nodeGloss`}>
            <stop offset="0%" stopColor="white" stopOpacity="0.34" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <filter id={`${uid}-soft`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <filter id={`${uid}-wideGlow`} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="15" />
          </filter>
        </defs>

        <g opacity="0.95">
          <path d={FIGURE_PATH} fill={`url(#${uid}-bodyFill)`} stroke={`url(#${uid}-bodyStroke)`} strokeWidth="1.25" />
          <path d={RIBCAGE_PATH} fill="none" stroke="hsl(188 100% 72% / 0.14)" strokeWidth="1.1" />
          <path d={PELVIS_PATH} fill="none" stroke="hsl(215 100% 70% / 0.14)" strokeWidth="1.1" />
          <path d={SPINE_PATH} fill="none" stroke="hsl(188 100% 72% / 0.14)" strokeDasharray="3 8" strokeWidth="1" />
        </g>

        <g opacity="0.28">
          <path d="M210 142 C190 194 190 252 203 310 C214 360 218 410 210 462" fill="none" stroke="hsl(188 100% 70% / 0.42)" strokeWidth="1.1" />
          <path d="M210 142 C230 194 230 252 217 310 C206 360 202 410 210 462" fill="none" stroke="hsl(320 85% 72% / 0.28)" strokeWidth="1.1" />
          <path d="M210 462 C190 528 183 618 178 716" fill="none" stroke="hsl(188 100% 70% / 0.22)" strokeWidth="1" />
          <path d="M210 462 C230 528 237 618 242 716" fill="none" stroke="hsl(188 100% 70% / 0.22)" strokeWidth="1" />
        </g>

        <g>
          {regions.map((region) => {
            const effect = tissueEffects.get(region.id);
            const active = Boolean(effect);
            const isHover = hoveredTissue === region.id;
            const isSelected = selectedTissue === region.id;
            const color = active ? stateColor(effect?.state) : 'hsl(215 30% 62%)';
            const intensity = active ? effect?.weight ?? 0.68 : 0;
            const pulseSeconds = Math.max(1.05, 3.35 - intensity * 1.65);
            const radius = region.r + (isSelected ? 2 : isHover ? 1 : 0);

            return (
              <g
                key={region.id}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => onHover(region.id)}
                onMouseLeave={() => onHover(null)}
                onClick={() => onSelect(region.id)}
              >
                <line
                  x1={region.cx}
                  y1={region.cy}
                  x2={region.anchorX}
                  y2={region.anchorY}
                  stroke={active ? color : 'hsl(188 100% 70% / 0.16)'}
                  strokeWidth={active ? 1.25 : 0.8}
                  strokeDasharray={active ? '0' : '2 5'}
                  opacity={active ? 0.58 : 0.38}
                />
                {active && (
                  <circle
                    cx={region.cx}
                    cy={region.cy}
                    r={region.halo}
                    fill={color}
                    opacity={0.12 + intensity * 0.28}
                    filter={`url(#${uid}-wideGlow)`}
                    className="animate-pulse-soft"
                    style={{ animationDuration: `${pulseSeconds}s` }}
                  />
                )}
                <circle
                  cx={region.cx}
                  cy={region.cy}
                  r={radius}
                  fill="hsl(214 68% 7% / 0.82)"
                  stroke={color}
                  strokeWidth={isSelected ? 2.4 : active || isHover ? 1.7 : 1}
                  strokeOpacity={active ? 0.95 : 0.45}
                  className="transition-smooth"
                />
                <circle
                  cx={region.cx}
                  cy={region.cy}
                  r={Math.max(3, radius - 6)}
                  fill={active ? color : 'hsl(215 30% 62% / 0.45)'}
                  fillOpacity={active ? 0.28 + intensity * 0.42 : 0.12}
                  className={active ? 'animate-pulse-glow' : ''}
                  filter={active ? `url(#${uid}-soft)` : undefined}
                  style={active ? { animationDuration: `${pulseSeconds * 0.85}s` } : undefined}
                />
                <path
                  d={region.icon}
                  transform={`translate(${region.cx - 10} ${region.cy - 10}) scale(0.83)`}
                  fill="none"
                  stroke={active ? color : 'hsl(215 30% 72% / 0.7)'}
                  strokeWidth="1.35"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={active || isHover || isSelected ? 1 : 0.62}
                />
                <circle
                  cx={region.cx - radius * 0.35}
                  cy={region.cy - radius * 0.35}
                  r={Math.max(4, radius * 0.32)}
                  fill={`url(#${uid}-nodeGloss)`}
                  opacity={active || isHover || isSelected ? 1 : 0.5}
                />
                <text
                  x={region.labelX}
                  y={region.labelY}
                  textAnchor={region.labelAnchor}
                  fill={isHover || isSelected ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))'}
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                  letterSpacing="0.08em"
                  className="transition-smooth"
                >
                  {TISSUE_BY_ID[region.id]?.name?.toUpperCase() ?? region.id.toUpperCase()}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

const FIGURE_PATH = `
  M210 36
  C234 36 250 55 250 82
  C250 105 239 124 222 134
  L222 153
  C246 157 269 168 286 189
  C295 201 300 219 304 242
  L324 373
  C327 391 333 414 338 439
  C341 456 332 468 318 467
  C307 466 301 457 298 442
  L275 302
  C272 350 271 405 266 461
  C264 487 255 507 239 515
  C242 552 250 600 258 704
  C260 724 250 736 235 736
  C224 736 217 728 215 711
  L204 536
  C202 522 198 522 196 536
  L185 711
  C183 728 176 736 165 736
  C150 736 140 724 142 704
  C150 600 158 552 181 515
  C165 507 156 487 154 461
  C149 405 148 350 145 302
  L122 442
  C119 457 113 466 102 467
  C88 468 79 456 82 439
  C87 414 93 391 96 373
  L116 242
  C120 219 125 201 134 189
  C151 168 174 157 198 153
  L198 134
  C181 124 170 105 170 82
  C170 55 186 36 210 36 Z
`;

const RIBCAGE_PATH = `
  M167 171
  C154 214 156 279 171 334
  C181 372 195 397 210 410
  C225 397 239 372 249 334
  C264 279 266 214 253 171
  M174 209 C194 197 226 197 246 209
  M169 255 C193 242 227 242 251 255
  M175 303 C196 294 224 294 245 303
`;

const PELVIS_PATH = `
  M168 438
  C181 459 239 459 252 438
  C249 487 232 519 210 534
  C188 519 171 487 168 438
  M182 463 C194 474 226 474 238 463
`;

const SPINE_PATH = 'M210 134 C207 214 207 322 210 438 C213 322 213 214 210 134';

interface OrganRegion {
  id: string;
  cx: number;
  cy: number;
  anchorX: number;
  anchorY: number;
  r: number;
  halo: number;
  icon: string;
  labelX: number;
  labelY: number;
  labelAnchor: 'start' | 'end' | 'middle';
}

const ICONS = {
  brain: 'M5 10 C3 6 6 3 10 4 C13 1 18 4 17 9 C21 11 20 17 15 17 C13 20 7 19 7 16 C3 16 2 12 5 10 Z M10 5 C10 9 8 11 5 12 M14 5 C13 8 15 11 18 12',
  endocrine: 'M10 3 C14 7 17 8 20 10 C17 12 14 13 10 17 C6 13 3 12 0 10 C3 8 6 7 10 3 Z M10 3 L10 17',
  lungs: 'M9 5 C5 6 3 12 4 18 C8 19 10 14 10 8 M11 8 C11 14 13 19 17 18 C18 12 16 6 12 5 M10.5 4 L10.5 9',
  heart: 'M10 18 C3 12 1 9 3 5 C5 2 9 3 10 6 C11 3 15 2 17 5 C20 9 17 13 10 18 Z',
  liver: 'M3 9 C9 4 18 5 20 10 C17 16 9 18 2 15 C1 12 1 10 3 9 Z',
  stomach: 'M9 3 C14 4 15 9 12 12 C9 16 12 19 7 20 C2 19 4 13 7 10 C10 7 6 5 9 3 Z',
  spleen: 'M10 2 C16 5 17 14 12 19 C7 20 4 14 5 9 C6 5 7 3 10 2 Z',
  pancreas: 'M2 11 C7 7 15 8 20 12 C15 15 7 15 2 11 Z',
  kidney: 'M7 3 C11 2 14 6 13 11 C13 17 7 21 4 16 C1 11 2 4 7 3 Z M15 3 C11 2 8 6 9 11 C9 17 15 21 18 16 C21 11 20 4 15 3 Z',
  adipose: 'M4 8 C7 4 13 4 16 8 C19 12 16 18 10 18 C4 18 1 12 4 8 Z M7 9 C7 12 9 14 12 14',
  intestine: 'M5 5 C10 2 17 5 17 11 C17 17 9 20 4 15 C0 11 1 6 5 5 Z M5 9 C10 7 15 8 15 12 M15 14 C11 16 6 15 5 12',
  breast: 'M5 10 C5 6 8 4 11 5 C15 6 17 10 15 14 C13 18 7 18 5 14 C4 12 4 11 5 10 Z',
  marrow: 'M7 2 L13 2 L13 20 L7 20 Z M5 6 L15 6 M5 16 L15 16',
  muscle: 'M5 2 C12 6 14 14 10 20 C5 17 3 9 5 2 Z M12 3 C17 8 18 15 14 20',
  skin: 'M4 5 C8 2 14 2 18 5 M3 10 C8 7 14 7 19 10 M4 15 C8 18 14 18 18 15',
};

const ORGAN_REGIONS: OrganRegion[] = [
  { id: 'brain', cx: 210, cy: 82, anchorX: 210, anchorY: 82, r: 25, halo: 54, icon: ICONS.brain, labelX: 210, labelY: 28, labelAnchor: 'middle' },
  { id: 'thyroid', cx: 210, cy: 151, anchorX: 210, anchorY: 151, r: 14, halo: 27, icon: ICONS.endocrine, labelX: 247, labelY: 154, labelAnchor: 'start' },
  { id: 'lungs', cx: 211, cy: 225, anchorX: 211, anchorY: 225, r: 34, halo: 76, icon: ICONS.lungs, labelX: 306, labelY: 218, labelAnchor: 'start' },
  { id: 'heart', cx: 188, cy: 252, anchorX: 190, anchorY: 252, r: 18, halo: 40, icon: ICONS.heart, labelX: 107, labelY: 246, labelAnchor: 'end' },
  { id: 'breast', cx: 239, cy: 257, anchorX: 235, anchorY: 254, r: 14, halo: 30, icon: ICONS.breast, labelX: 307, labelY: 260, labelAnchor: 'start' },
  { id: 'liver', cx: 237, cy: 321, anchorX: 226, anchorY: 315, r: 22, halo: 52, icon: ICONS.liver, labelX: 312, labelY: 322, labelAnchor: 'start' },
  { id: 'stomach', cx: 180, cy: 322, anchorX: 191, anchorY: 317, r: 18, halo: 38, icon: ICONS.stomach, labelX: 108, labelY: 323, labelAnchor: 'end' },
  { id: 'spleen', cx: 145, cy: 343, anchorX: 177, anchorY: 332, r: 14, halo: 30, icon: ICONS.spleen, labelX: 105, labelY: 347, labelAnchor: 'end' },
  { id: 'pancreas', cx: 210, cy: 363, anchorX: 210, anchorY: 352, r: 16, halo: 34, icon: ICONS.pancreas, labelX: 274, labelY: 369, labelAnchor: 'start' },
  { id: 'kidney', cx: 170, cy: 399, anchorX: 190, anchorY: 389, r: 18, halo: 42, icon: ICONS.kidney, labelX: 104, labelY: 403, labelAnchor: 'end' },
  { id: 'intestine', cx: 210, cy: 419, anchorX: 210, anchorY: 419, r: 27, halo: 56, icon: ICONS.intestine, labelX: 300, labelY: 423, labelAnchor: 'start' },
  { id: 'adipose', cx: 252, cy: 471, anchorX: 232, anchorY: 454, r: 19, halo: 47, icon: ICONS.adipose, labelX: 314, labelY: 475, labelAnchor: 'start' },
  { id: 'bone_marrow', cx: 154, cy: 542, anchorX: 181, anchorY: 548, r: 17, halo: 38, icon: ICONS.marrow, labelX: 99, labelY: 546, labelAnchor: 'end' },
  { id: 'muscle', cx: 210, cy: 604, anchorX: 210, anchorY: 604, r: 25, halo: 58, icon: ICONS.muscle, labelX: 295, labelY: 608, labelAnchor: 'start' },
  { id: 'skin', cx: 104, cy: 454, anchorX: 121, anchorY: 431, r: 16, halo: 34, icon: ICONS.skin, labelX: 72, labelY: 459, labelAnchor: 'end' },
];
