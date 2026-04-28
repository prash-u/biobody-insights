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
      <svg
        viewBox="0 0 560 1120"
        className="relative h-full w-full max-h-[900px] drop-shadow-[0_30px_70px_hsl(188_100%_50%/0.18)]"
        role="img"
        aria-label="Interactive human metabolic body atlas"
      >
        <defs>
          <filter id={`${uid}-nodeGlow`} x="-90%" y="-90%" width="280%" height="280%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
          <radialGradient id={`${uid}-nodeGloss`}>
            <stop offset="0%" stopColor="white" stopOpacity="0.38" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        <image href="/anatomical-body.svg" x="0" y="0" width="560" height="1120" preserveAspectRatio="xMidYMid meet" opacity="0.9" />

        <g>
          {NETWORK_EDGES.map((edge) => {
            const source = regions.find((region) => region.id === edge.source);
            const target = regions.find((region) => region.id === edge.target);
            if (!source || !target) return null;

            const sourceEffect = tissueEffects.get(source.id);
            const targetEffect = tissueEffects.get(target.id);
            const active = Boolean(sourceEffect || targetEffect);
            const color = active ? stateColor(targetEffect?.state ?? sourceEffect?.state) : edge.kind === 'inhibition' ? 'hsl(205 100% 68%)' : 'hsl(152 70% 62%)';
            const path = curvedPath(source, target, edge.curve);

            return (
              <g key={edge.id} opacity={active ? 0.72 : 0.26}>
                <path
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeWidth={active ? 2.2 : 1.25}
                  strokeDasharray={edge.kind === 'feedback' ? '8 10' : edge.kind === 'crosstalk' ? '3 8' : undefined}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
                <circle r={active ? 4 : 2.6} fill={color} opacity={active ? 0.9 : 0.55}>
                  <animateMotion dur={`${edge.speed}s`} repeatCount="indefinite" path={path} />
                </circle>
              </g>
            );
          })}
        </g>

        <g>
          {regions.map((region) => {
            const effect = tissueEffects.get(region.id);
            const active = Boolean(effect);
            const isHover = hoveredTissue === region.id;
            const isSelected = selectedTissue === region.id;
            const color = active ? stateColor(effect?.state) : 'hsl(215 30% 70%)';
            const intensity = active ? effect?.weight ?? 0.68 : 0;
            const pulseSeconds = Math.max(1.05, 3.35 - intensity * 1.65);
            const radius = region.r + (isSelected ? 4 : isHover ? 2 : 0);

            return (
              <g
                key={region.id}
                role="button"
                tabIndex={0}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => onHover(region.id)}
                onMouseLeave={() => onHover(null)}
                onClick={() => onSelect(region.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') onSelect(region.id);
                }}
              >
                {active && (
                  <circle
                    cx={region.cx}
                    cy={region.cy}
                    r={region.halo}
                    fill={color}
                    opacity={0.16 + intensity * 0.28}
                    filter={`url(#${uid}-nodeGlow)`}
                    className="animate-pulse-soft"
                    style={{ animationDuration: `${pulseSeconds}s` }}
                  />
                )}
                <line
                  x1={region.cx}
                  y1={region.cy}
                  x2={region.labelX}
                  y2={region.labelY - 5}
                  stroke={active || isHover || isSelected ? color : 'hsl(200 30% 70% / 0.22)'}
                  strokeWidth={active ? 1.35 : 0.8}
                  strokeDasharray={active ? undefined : '3 6'}
                />
                <circle
                  cx={region.cx}
                  cy={region.cy}
                  r={radius}
                  fill="hsl(214 68% 7% / 0.86)"
                  stroke={color}
                  strokeWidth={isSelected ? 3.2 : active || isHover ? 2.25 : 1.2}
                  strokeOpacity={active ? 0.98 : 0.58}
                  className="transition-smooth"
                />
                <circle
                  cx={region.cx}
                  cy={region.cy}
                  r={Math.max(5, radius - 9)}
                  fill={active ? color : 'hsl(215 30% 62% / 0.38)'}
                  fillOpacity={active ? 0.28 + intensity * 0.48 : 0.12}
                  className={active ? 'animate-pulse-glow' : ''}
                  style={active ? { animationDuration: `${pulseSeconds * 0.85}s` } : undefined}
                />
                <circle
                  cx={region.cx - radius * 0.32}
                  cy={region.cy - radius * 0.32}
                  r={Math.max(5, radius * 0.32)}
                  fill={`url(#${uid}-nodeGloss)`}
                  opacity={active || isHover || isSelected ? 1 : 0.5}
                />
                <text
                  x={region.labelX}
                  y={region.labelY}
                  textAnchor={region.labelAnchor}
                  fill={isHover || isSelected ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))'}
                  fontSize="17"
                  fontFamily="JetBrains Mono, monospace"
                  letterSpacing="0.14em"
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

interface OrganRegion {
  id: string;
  cx: number;
  cy: number;
  r: number;
  halo: number;
  labelX: number;
  labelY: number;
  labelAnchor: 'start' | 'end' | 'middle';
}

const ORGAN_REGIONS: OrganRegion[] = [
  { id: 'brain', cx: 280, cy: 160, r: 34, halo: 92, labelX: 280, labelY: 88, labelAnchor: 'middle' },
  { id: 'thyroid', cx: 280, cy: 280, r: 24, halo: 55, labelX: 340, labelY: 282, labelAnchor: 'start' },
  { id: 'lungs', cx: 205, cy: 405, r: 31, halo: 70, labelX: 118, labelY: 388, labelAnchor: 'end' },
  { id: 'heart', cx: 278, cy: 430, r: 28, halo: 66, labelX: 185, labelY: 438, labelAnchor: 'end' },
  { id: 'liver', cx: 198, cy: 545, r: 34, halo: 78, labelX: 95, labelY: 545, labelAnchor: 'end' },
  { id: 'stomach', cx: 352, cy: 552, r: 30, halo: 65, labelX: 452, labelY: 545, labelAnchor: 'start' },
  { id: 'spleen', cx: 428, cy: 570, r: 22, halo: 48, labelX: 507, labelY: 575, labelAnchor: 'start' },
  { id: 'pancreas', cx: 282, cy: 612, r: 25, halo: 55, labelX: 365, labelY: 630, labelAnchor: 'start' },
  { id: 'kidney', cx: 207, cy: 675, r: 27, halo: 60, labelX: 120, labelY: 685, labelAnchor: 'end' },
  { id: 'intestine', cx: 283, cy: 760, r: 38, halo: 82, labelX: 385, labelY: 770, labelAnchor: 'start' },
  { id: 'adipose', cx: 333, cy: 888, r: 31, halo: 74, labelX: 432, labelY: 900, labelAnchor: 'start' },
  { id: 'bone_marrow', cx: 205, cy: 890, r: 25, halo: 58, labelX: 118, labelY: 900, labelAnchor: 'end' },
  { id: 'muscle', cx: 280, cy: 1010, r: 34, halo: 82, labelX: 390, labelY: 1020, labelAnchor: 'start' },
  { id: 'skin', cx: 110, cy: 760, r: 24, halo: 52, labelX: 73, labelY: 770, labelAnchor: 'end' },
  { id: 'breast', cx: 356, cy: 410, r: 23, halo: 52, labelX: 445, labelY: 420, labelAnchor: 'start' },
];

const NETWORK_EDGES = [
  { id: 'gut-liver', source: 'intestine', target: 'liver', kind: 'activation', curve: -70, speed: 4.8 },
  { id: 'liver-pancreas', source: 'liver', target: 'pancreas', kind: 'feedback', curve: 50, speed: 5.5 },
  { id: 'pancreas-muscle', source: 'pancreas', target: 'muscle', kind: 'activation', curve: -70, speed: 5.1 },
  { id: 'adipose-liver', source: 'adipose', target: 'liver', kind: 'activation', curve: -115, speed: 4.2 },
  { id: 'adipose-heart', source: 'adipose', target: 'heart', kind: 'crosstalk', curve: -92, speed: 6.0 },
  { id: 'lungs-heart', source: 'lungs', target: 'heart', kind: 'activation', curve: 34, speed: 4.6 },
  { id: 'brain-liver', source: 'brain', target: 'liver', kind: 'feedback', curve: -155, speed: 7.1 },
  { id: 'liver-kidney', source: 'liver', target: 'kidney', kind: 'crosstalk', curve: 72, speed: 5.8 },
  { id: 'marrow-spleen', source: 'bone_marrow', target: 'spleen', kind: 'activation', curve: 128, speed: 5.3 },
  { id: 'muscle-liver', source: 'muscle', target: 'liver', kind: 'feedback', curve: 155, speed: 6.4 },
] as const;

function curvedPath(source: OrganRegion, target: OrganRegion, curve: number) {
  const midX = (source.cx + target.cx) / 2;
  const midY = (source.cy + target.cy) / 2;
  const dx = target.cx - source.cx;
  const dy = target.cy - source.cy;
  const length = Math.max(1, Math.hypot(dx, dy));
  const controlX = midX + (-dy / length) * curve;
  const controlY = midY + (dx / length) * curve;

  return `M ${source.cx} ${source.cy} Q ${controlX.toFixed(1)} ${controlY.toFixed(1)} ${target.cx} ${target.cy}`;
}
