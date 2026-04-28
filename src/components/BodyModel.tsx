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
    <div className="body-stage relative flex h-full w-full select-none items-center justify-center">
      <div className="absolute inset-0 bg-gradient-glow opacity-50 pointer-events-none" />
      <div className="absolute inset-x-[18%] bottom-[5%] top-[7%] rounded-[45%] border border-primary/10 bg-primary/[0.015] blur-[1px]" />
      <div
        className="absolute left-0 right-0 h-24 pointer-events-none animate-scan"
        style={{ background: 'linear-gradient(180deg, transparent, hsl(var(--primary)/0.18), transparent)' }}
      />

      <svg
        viewBox="0 0 360 720"
        className="relative h-full w-full max-h-[680px] drop-shadow-[0_26px_55px_hsl(188_100%_50%/0.18)]"
        role="img"
        aria-label="Interactive human body atlas"
      >
        <defs>
          <linearGradient id={`${uid}-bodyFill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(214 60% 14%)" stopOpacity="0.95" />
            <stop offset="45%" stopColor="hsl(217 58% 8%)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="hsl(220 65% 4%)" stopOpacity="0.96" />
          </linearGradient>
          <linearGradient id={`${uid}-bodyEdge`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(188 100% 70%)" stopOpacity="0.62" />
            <stop offset="100%" stopColor="hsl(215 100% 68%)" stopOpacity="0.42" />
          </linearGradient>
          <radialGradient id={`${uid}-organGlow`}>
            <stop offset="0%" stopColor="white" stopOpacity="0.35" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <filter id={`${uid}-soft`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id={`${uid}-strongSoft`} x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>

        <g>
          <path d={BODY_PATH} fill={`url(#${uid}-bodyFill)`} stroke={`url(#${uid}-bodyEdge)`} strokeWidth="1.15" />
          <path d={TORSO_PATH} fill="none" stroke="hsl(188 100% 70% / 0.13)" strokeWidth="1" />
          <path d={PELVIS_PATH} fill="none" stroke="hsl(215 100% 68% / 0.12)" strokeWidth="1" />
          <line x1="180" y1="120" x2="180" y2="560" stroke="hsl(188 100% 70% / 0.08)" strokeDasharray="2 6" />
          <path d="M180 150 C172 190 172 238 180 300 C188 238 188 190 180 150 Z" fill="hsl(188 100% 70% / 0.035)" />
        </g>

        <g opacity="0.34">
          <path d="M178 170 C148 210 146 276 170 328 C185 362 194 406 184 456" fill="none" stroke="hsl(350 80% 62% / 0.35)" strokeWidth="1.1" />
          <path d="M184 170 C214 210 214 276 190 328 C175 362 166 406 176 456" fill="none" stroke="hsl(188 100% 70% / 0.28)" strokeWidth="1.1" />
          <path d="M180 460 C160 505 148 575 146 672" fill="none" stroke="hsl(188 100% 70% / 0.16)" strokeWidth="1" />
          <path d="M180 460 C200 505 212 575 214 672" fill="none" stroke="hsl(188 100% 70% / 0.16)" strokeWidth="1" />
        </g>

        <g>
          {regions.map((region) => {
            const effect = tissueEffects.get(region.id);
            const active = Boolean(effect);
            const isHover = hoveredTissue === region.id;
            const isSelected = selectedTissue === region.id;
            const color = active ? stateColor(effect?.state) : 'hsl(215 30% 60%)';
            const intensity = active ? effect?.weight ?? 0.7 : 0;
            const opacity = active ? 0.34 + 0.46 * intensity : 0.1;
            const strokeWidth = isSelected ? 2.5 : isHover ? 1.8 : 1;
            const pulseSeconds = Math.max(1.05, 3.2 - intensity * 1.55);

            return (
              <g
                key={region.id}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => onHover(region.id)}
                onMouseLeave={() => onHover(null)}
                onClick={() => onSelect(region.id)}
              >
                {active && (
                  <circle
                    cx={region.cx}
                    cy={region.cy}
                    r={region.halo}
                    fill={color}
                    opacity={0.18 + 0.25 * intensity}
                    filter={`url(#${uid}-strongSoft)`}
                    className="animate-pulse-soft"
                    style={{ animationDuration: `${pulseSeconds}s` }}
                  />
                )}
                <RegionShape
                  region={region}
                  color={color}
                  opacity={opacity}
                  strokeOpacity={active ? 0.92 : 0.34}
                  strokeWidth={strokeWidth}
                />
                <circle
                  cx={region.cx - region.highlight}
                  cy={region.cy - region.highlight}
                  r={Math.max(3.5, region.highlight * 1.7)}
                  fill={`url(#${uid}-organGlow)`}
                  opacity={active || isHover || isSelected ? 1 : 0.45}
                />
                {active && (
                  <circle
                    cx={region.cx}
                    cy={region.cy}
                    r={2.2 + intensity * 2.2}
                    fill={color}
                    filter={`url(#${uid}-soft)`}
                    className="animate-pulse-glow"
                    style={{ animationDuration: `${pulseSeconds * 0.85}s` }}
                  />
                )}

                {(isHover || isSelected) && (
                  <g pointerEvents="none">
                    <line
                      x1={region.cx}
                      y1={region.cy}
                      x2={region.labelX}
                      y2={region.labelY}
                      stroke="hsl(188 100% 70% / 0.5)"
                      strokeWidth="0.8"
                    />
                    <rect
                      x={region.labelX - (region.labelAnchor === 'end' ? 108 : 0)}
                      y={region.labelY - 12}
                      width="108"
                      height="22"
                      rx="6"
                      fill="hsl(214 68% 7% / 0.92)"
                      stroke="hsl(188 100% 70% / 0.4)"
                    />
                    <text
                      x={region.labelX + (region.labelAnchor === 'end' ? -6 : 6)}
                      y={region.labelY + 3}
                      fill="hsl(var(--foreground))"
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                      textAnchor={region.labelAnchor}
                      letterSpacing="0.05em"
                    >
                      {TISSUE_BY_ID[region.id]?.name?.toUpperCase() ?? region.id.toUpperCase()}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

const BODY_PATH = `
  M 180 40
  C 204 40, 219 60, 219 86
  C 219 111, 205 129, 192 136
  C 194 145, 197 152, 205 156
  C 231 162, 250 174, 260 193
  C 267 230, 273 268, 278 307
  C 282 337, 289 366, 292 393
  C 293 407, 286 417, 275 417
  C 267 417, 263 410, 262 399
  C 257 360, 252 319, 246 276
  C 244 330, 244 392, 238 452
  C 237 465, 229 473, 219 472
  C 213 471, 210 466, 210 457
  C 210 420, 206 388, 198 361
  C 191 385, 190 426, 194 478
  C 198 536, 207 603, 221 677
  C 224 694, 216 704, 201 704
  C 190 704, 185 698, 183 686
  C 180 642, 177 594, 174 543
  C 172 595, 169 642, 166 686
  C 164 698, 159 704, 148 704
  C 133 704, 125 694, 128 677
  C 142 603, 151 536, 155 478
  C 159 426, 158 385, 151 361
  C 143 388, 139 420, 139 457
  C 139 466, 136 471, 130 472
  C 120 473, 112 465, 111 452
  C 105 392, 105 330, 102 276
  C 97 319, 92 360, 87 399
  C 86 410, 82 417, 74 417
  C 63 417, 56 407, 58 393
  C 62 365, 68 337, 72 307
  C 77 268, 83 230, 90 193
  C 100 174, 119 162, 155 156
  C 163 152, 166 145, 168 136
  C 155 129, 141 111, 141 86
  C 141 60, 156 40, 180 40 Z
`;

const TORSO_PATH = `
  M 144 162
  C 133 199, 132 255, 142 316
  C 150 362, 163 393, 180 408
  C 197 393, 210 362, 218 316
  C 228 255, 227 199, 216 162
`;

const PELVIS_PATH = `
  M 145 392
  C 160 420, 200 420, 215 392
  C 209 444, 197 474, 180 488
  C 163 474, 151 444, 145 392
`;

interface OrganRegion {
  id: string;
  cx: number;
  cy: number;
  halo: number;
  highlight: number;
  shape: 'circle' | 'ellipse' | 'path';
  r?: number;
  rx?: number;
  ry?: number;
  path?: string;
  labelX: number;
  labelY: number;
  labelAnchor: 'start' | 'end';
}

const ORGAN_REGIONS: OrganRegion[] = [
  { id: 'brain', cx: 180, cy: 82, halo: 44, highlight: 8, shape: 'path', path: 'M158 78 C158 59 170 52 181 52 C196 52 207 64 204 82 C209 100 197 114 180 112 C162 113 151 98 158 78 Z', labelX: 306, labelY: 76, labelAnchor: 'end' },
  { id: 'thyroid', cx: 180, cy: 142, halo: 17, highlight: 3, shape: 'path', path: 'M169 139 C174 132 178 134 180 140 C183 134 187 132 192 139 C190 149 184 151 180 146 C176 151 170 149 169 139 Z', labelX: 52, labelY: 142, labelAnchor: 'start' },
  { id: 'lungs', cx: 180, cy: 218, halo: 72, highlight: 12, shape: 'path', path: 'M144 180 C121 197 121 248 139 273 C154 276 167 256 170 224 C172 198 164 184 144 180 Z M216 180 C239 197 239 248 221 273 C206 276 193 256 190 224 C188 198 196 184 216 180 Z', labelX: 322, labelY: 204, labelAnchor: 'end' },
  { id: 'heart', cx: 171, cy: 232, halo: 30, highlight: 5, shape: 'path', path: 'M171 215 C181 205 199 213 198 231 C197 248 181 256 170 268 C159 256 144 248 143 231 C142 214 161 205 171 215 Z', labelX: 54, labelY: 222, labelAnchor: 'start' },
  { id: 'liver', cx: 200, cy: 283, halo: 43, highlight: 7, shape: 'path', path: 'M171 265 C200 253 230 262 240 278 C230 299 202 309 169 301 C161 286 162 274 171 265 Z', labelX: 320, labelY: 274, labelAnchor: 'end' },
  { id: 'stomach', cx: 162, cy: 286, halo: 30, highlight: 5, shape: 'path', path: 'M154 264 C175 263 179 282 168 295 C158 307 145 299 147 285 C148 275 154 274 154 264 Z', labelX: 56, labelY: 270, labelAnchor: 'start' },
  { id: 'spleen', cx: 139, cy: 297, halo: 21, highlight: 3, shape: 'ellipse', rx: 9, ry: 17, labelX: 54, labelY: 300, labelAnchor: 'start' },
  { id: 'pancreas', cx: 180, cy: 315, halo: 25, highlight: 4, shape: 'path', path: 'M151 312 C167 304 198 305 214 317 C198 324 164 324 151 312 Z', labelX: 320, labelY: 314, labelAnchor: 'end' },
  { id: 'kidney', cx: 160, cy: 334, halo: 30, highlight: 4, shape: 'path', path: 'M148 315 C161 312 170 323 169 337 C168 354 153 362 144 350 C134 337 136 319 148 315 Z M212 315 C199 312 190 323 191 337 C192 354 207 362 216 350 C226 337 224 319 212 315 Z', labelX: 56, labelY: 334, labelAnchor: 'start' },
  { id: 'adipose', cx: 199, cy: 365, halo: 40, highlight: 6, shape: 'path', path: 'M137 353 C154 332 207 330 224 353 C218 382 199 397 180 397 C161 397 142 382 137 353 Z', labelX: 320, labelY: 362, labelAnchor: 'end' },
  { id: 'intestine', cx: 180, cy: 376, halo: 42, highlight: 7, shape: 'path', path: 'M153 349 C169 339 192 339 207 350 C221 360 218 390 203 400 C188 411 166 410 153 398 C139 385 139 359 153 349 Z M159 362 C174 355 193 357 203 368 M202 384 C188 391 169 390 158 381', labelX: 56, labelY: 374, labelAnchor: 'start' },
  { id: 'breast', cx: 200, cy: 203, halo: 22, highlight: 4, shape: 'ellipse', rx: 10, ry: 8, labelX: 320, labelY: 168, labelAnchor: 'end' },
  { id: 'bone_marrow', cx: 124, cy: 418, halo: 30, highlight: 4, shape: 'path', path: 'M117 380 L129 380 L129 456 L117 456 Z M231 380 L243 380 L243 456 L231 456 Z', labelX: 56, labelY: 418, labelAnchor: 'start' },
  { id: 'muscle', cx: 154, cy: 568, halo: 54, highlight: 7, shape: 'path', path: 'M146 477 C158 532 158 608 150 674 C138 620 135 536 146 477 Z M214 477 C202 532 202 608 210 674 C222 620 225 536 214 477 Z', labelX: 56, labelY: 568, labelAnchor: 'start' },
  { id: 'skin', cx: 234, cy: 458, halo: 26, highlight: 4, shape: 'path', path: 'M251 250 C259 298 263 352 269 407 M109 250 C101 298 97 352 91 407', labelX: 320, labelY: 458, labelAnchor: 'end' },
];

function RegionShape({
  region,
  color,
  opacity,
  strokeOpacity,
  strokeWidth,
}: {
  region: OrganRegion;
  color: string;
  opacity: number;
  strokeOpacity: number;
  strokeWidth: number;
}) {
  const common = {
    fill: color,
    fillOpacity: opacity,
    stroke: color,
    strokeOpacity,
    strokeWidth,
    className: 'transition-smooth',
  };

  if (region.shape === 'circle') {
    return <circle cx={region.cx} cy={region.cy} r={region.r ?? 8} {...common} />;
  }

  if (region.shape === 'ellipse') {
    return <ellipse cx={region.cx} cy={region.cy} rx={region.rx ?? 10} ry={region.ry ?? 10} {...common} />;
  }

  return (
    <path
      d={region.path}
      {...common}
      fillRule="evenodd"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}
