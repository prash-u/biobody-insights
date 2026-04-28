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
          <path d="M210 146 C188 196 188 265 205 318 C219 362 225 415 212 474" fill="none" stroke="hsl(188 100% 70% / 0.42)" strokeWidth="1.1" />
          <path d="M210 146 C232 196 232 265 215 318 C201 362 195 415 208 474" fill="none" stroke="hsl(320 85% 72% / 0.28)" strokeWidth="1.1" />
          <path d="M210 474 C190 535 182 626 181 706" fill="none" stroke="hsl(188 100% 70% / 0.22)" strokeWidth="1" />
          <path d="M210 474 C230 535 238 626 239 706" fill="none" stroke="hsl(188 100% 70% / 0.22)" strokeWidth="1" />
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
  M210 38
  C236 38 254 58 254 85
  C254 109 241 128 224 137
  L224 153
  C253 158 278 171 293 196
  C302 239 310 289 316 337
  C320 370 327 400 331 430
  C333 445 325 455 312 455
  C302 455 297 447 296 434
  C291 389 285 337 278 280
  C274 350 273 419 266 488
  C264 506 254 517 241 516
  C232 515 228 508 228 497
  C228 453 222 414 210 383
  C198 414 192 453 192 497
  C192 508 188 515 179 516
  C166 517 156 506 154 488
  C147 419 146 350 142 280
  C135 337 129 389 124 434
  C123 447 118 455 108 455
  C95 455 87 445 89 430
  C93 400 100 370 104 337
  C110 289 118 239 127 196
  C142 171 167 158 196 153
  L196 137
  C179 128 166 109 166 85
  C166 58 184 38 210 38 Z
`;

const RIBCAGE_PATH = `
  M168 170
  C154 218 154 290 170 354
  C180 395 194 420 210 432
  C226 420 240 395 250 354
  C266 290 266 218 252 170
  M174 210 C195 198 225 198 246 210
  M166 270 C192 255 228 255 254 270
`;

const PELVIS_PATH = `
  M170 438
  C184 461 236 461 250 438
  C246 489 231 520 210 535
  C189 520 174 489 170 438
`;

const SPINE_PATH = 'M210 138 C207 222 207 326 210 436 C213 326 213 222 210 138';

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
  { id: 'brain', cx: 210, cy: 82, anchorX: 210, anchorY: 82, r: 25, halo: 54, icon: ICONS.brain, labelX: 210, labelY: 29, labelAnchor: 'middle' },
  { id: 'thyroid', cx: 210, cy: 150, anchorX: 210, anchorY: 150, r: 15, halo: 28, icon: ICONS.endocrine, labelX: 246, labelY: 153, labelAnchor: 'start' },
  { id: 'lungs', cx: 210, cy: 226, anchorX: 210, anchorY: 226, r: 35, halo: 78, icon: ICONS.lungs, labelX: 310, labelY: 218, labelAnchor: 'start' },
  { id: 'heart', cx: 188, cy: 252, anchorX: 188, anchorY: 252, r: 18, halo: 40, icon: ICONS.heart, labelX: 105, labelY: 245, labelAnchor: 'end' },
  { id: 'breast', cx: 238, cy: 255, anchorX: 238, anchorY: 255, r: 15, halo: 30, icon: ICONS.breast, labelX: 310, labelY: 258, labelAnchor: 'start' },
  { id: 'liver', cx: 236, cy: 318, anchorX: 226, anchorY: 314, r: 22, halo: 52, icon: ICONS.liver, labelX: 314, labelY: 318, labelAnchor: 'start' },
  { id: 'stomach', cx: 178, cy: 318, anchorX: 188, anchorY: 314, r: 18, halo: 38, icon: ICONS.stomach, labelX: 105, labelY: 318, labelAnchor: 'end' },
  { id: 'spleen', cx: 144, cy: 340, anchorX: 177, anchorY: 328, r: 14, halo: 30, icon: ICONS.spleen, labelX: 102, labelY: 344, labelAnchor: 'end' },
  { id: 'pancreas', cx: 210, cy: 364, anchorX: 210, anchorY: 352, r: 16, halo: 34, icon: ICONS.pancreas, labelX: 274, labelY: 370, labelAnchor: 'start' },
  { id: 'kidney', cx: 170, cy: 398, anchorX: 190, anchorY: 388, r: 19, halo: 42, icon: ICONS.kidney, labelX: 101, labelY: 402, labelAnchor: 'end' },
  { id: 'intestine', cx: 210, cy: 420, anchorX: 210, anchorY: 420, r: 28, halo: 56, icon: ICONS.intestine, labelX: 301, labelY: 424, labelAnchor: 'start' },
  { id: 'adipose', cx: 252, cy: 472, anchorX: 232, anchorY: 455, r: 20, halo: 48, icon: ICONS.adipose, labelX: 315, labelY: 476, labelAnchor: 'start' },
  { id: 'bone_marrow', cx: 151, cy: 525, anchorX: 183, anchorY: 540, r: 17, halo: 38, icon: ICONS.marrow, labelX: 96, labelY: 529, labelAnchor: 'end' },
  { id: 'muscle', cx: 210, cy: 596, anchorX: 210, anchorY: 596, r: 26, halo: 58, icon: ICONS.muscle, labelX: 296, labelY: 600, labelAnchor: 'start' },
  { id: 'skin', cx: 108, cy: 455, anchorX: 120, anchorY: 430, r: 16, halo: 34, icon: ICONS.skin, labelX: 74, labelY: 459, labelAnchor: 'end' },
];
