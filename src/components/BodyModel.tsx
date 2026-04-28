import { useId, useMemo } from 'react';
import { TISSUE_BY_ID } from '@/atlas/data';
import { ActivationState, ProgramEffect } from '@/atlas/types';

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
  const selectedRegion = regions.find((region) => region.id === selectedTissue || region.id === hoveredTissue);
  const selectedEffect = selectedRegion ? tissueEffects.get(selectedRegion.id) : undefined;

  return (
    <div className="body-stage anatomical-stage relative flex h-full min-h-[340px] w-full select-none items-center justify-center overflow-hidden">
      <svg
        viewBox="0 0 106.00675 195.36273"
        className="relative z-10 h-[min(100%,500px)] w-auto max-w-[86%] drop-shadow-[0_30px_70px_hsl(188_100%_60%/0.18)]"
        role="img"
        aria-label="Translucent whole-body systems biology atlas"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id={`${uid}-core`} cx="50%" cy="42%" r="58%">
            <stop offset="0%" stopColor="hsl(188 100% 76%)" stopOpacity="0.5" />
            <stop offset="42%" stopColor="hsl(210 100% 62%)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="hsl(216 70% 8%)" stopOpacity="0.02" />
          </radialGradient>
          <linearGradient id={`${uid}-body`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(193 100% 86%)" stopOpacity="0.38" />
            <stop offset="48%" stopColor="hsl(202 100% 68%)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="hsl(222 100% 70%)" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id={`${uid}-vessel`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(188 100% 72%)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(218 100% 72%)" stopOpacity="0.18" />
          </linearGradient>
          <filter id={`${uid}-blurGlow`} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="18" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={`${uid}-hotspotGlow`} x="-160%" y="-160%" width="420%" height="420%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <pattern id={`${uid}-microgrid`} width="4" height="4" patternUnits="userSpaceOnUse">
            <path d="M4 0H0V4" fill="none" stroke="hsl(190 100% 72% / 0.055)" strokeWidth="0.18" />
          </pattern>
        </defs>

        <rect x="0" y="0" width="106.00675" height="195.36273" fill={`url(#${uid}-microgrid)`} opacity="0.38" />
        <ellipse cx="53" cy="92" rx="32" ry="88" fill={`url(#${uid}-core)`} opacity="0.64" />

        <g opacity="0.96">
          <image
            href="/anatomogram-human.svg"
            x="0"
            y="0"
            width="106.00675"
            height="195.36273"
            opacity="0.82"
            preserveAspectRatio="xMidYMid meet"
            filter={`url(#${uid}-blurGlow)`}
          />
          <NeurovascularOverlay uid={uid} />
        </g>

        <g>
          {NETWORK_EDGES.map((edge) => {
            const source = regions.find((region) => region.id === edge.source);
            const target = regions.find((region) => region.id === edge.target);
            if (!source || !target) return null;
            const sourceEffect = tissueEffects.get(source.id);
            const targetEffect = tissueEffects.get(target.id);
            const active = Boolean(sourceEffect || targetEffect);
            const color = active ? atlasStateColor(targetEffect?.state ?? sourceEffect?.state) : 'hsl(190 100% 72% / 0.55)';
            const path = curvedPath(source, target, edge.curve);

            return (
              <g key={edge.id} opacity={active ? 0.82 : 0.24}>
                <path
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeWidth={active ? 0.58 : 0.24}
                  strokeDasharray={edge.kind === 'feedback' ? '1.8 2.2' : edge.kind === 'crosstalk' ? '0.7 1.4' : undefined}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  filter={active ? `url(#${uid}-blurGlow)` : undefined}
                />
                <circle r={active ? 0.9 : 0.5} fill={color}>
                  <animateMotion dur={`${edge.speed}s`} repeatCount="indefinite" path={path} />
                </circle>
              </g>
            );
          })}
        </g>

        <g>
          {regions.map((region) => {
            const effect = tissueEffects.get(region.id);
            return (
              <AnatomyHotspot
                key={region.id}
                uid={uid}
                region={region}
                effect={effect}
                selected={selectedTissue === region.id}
                hovered={hoveredTissue === region.id}
                onHover={onHover}
                onSelect={onSelect}
              />
            );
          })}
        </g>

        {selectedRegion && (
          <g pointerEvents="none">
            <path
              d={`M ${selectedRegion.cx} ${selectedRegion.cy} C ${selectedRegion.cx + 6} ${selectedRegion.cy - 5}, ${selectedRegion.calloutX - 6} ${selectedRegion.calloutY - 3}, ${selectedRegion.calloutX} ${selectedRegion.calloutY}`}
              fill="none"
              stroke={atlasStateColor(selectedEffect?.state)}
              strokeWidth="0.45"
              strokeDasharray="1.4 1.8"
              opacity="0.9"
            />
            <rect
              x={selectedRegion.calloutX}
              y={selectedRegion.calloutY - 7}
              width="35"
              height="15"
              rx="2.8"
              fill="hsl(214 68% 7% / 0.82)"
              stroke={atlasStateColor(selectedEffect?.state)}
              strokeOpacity="0.55"
            />
            <text x={selectedRegion.calloutX + 3} y={selectedRegion.calloutY - 2.2} fill="hsl(213 45% 97%)" fontSize="3.1" fontWeight="700">
              {TISSUE_BY_ID[selectedRegion.id]?.name ?? selectedRegion.id}
            </text>
            <text x={selectedRegion.calloutX + 3} y={selectedRegion.calloutY + 2.7} fill="hsl(215 30% 72%)" fontSize="2.1">
              {selectedEffect?.state ? stateCopy(selectedEffect.state) : 'Reference region'}
            </text>
            <text x={selectedRegion.calloutX + 3} y={selectedRegion.calloutY + 6.2} fill={atlasStateColor(selectedEffect?.state)} fontSize="2.2" fontFamily="JetBrains Mono, monospace">
              pulse {(Math.max(0.08, selectedEffect?.weight ?? 0.18) * 100).toFixed(0)}%
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

function NeurovascularOverlay({ uid }: { uid: string }) {
  return (
    <g opacity="0.78">
      <path d="M53 32C49 45 48 57 49 71c0.5 14 2.4 28 4 43 1.6-15 3.5-29 4-43 1-14-0.8-26-4-39z" fill="none" stroke={`url(#${uid}-vessel)`} strokeWidth="0.38" />
      <path d="M53 48C43 58 39 70 38.5 88M53 48c10 10 14 22 14.5 40M53 82c-7 10-11 24-12 42M53 82c7 10 11 24 12 42M53 120c-5 13-7 28-8 50M53 120c5 13 7 28 8 50" fill="none" stroke="hsl(188 100% 72% / 0.3)" strokeWidth="0.34" strokeLinecap="round" />
      <path d="M39 75c7 4 11 8 14 15 3-7 7-11 14-15M36 96c9 5 14 11 17 20 3-9 8-15 17-20" fill="none" stroke="hsl(216 100% 72% / 0.24)" strokeWidth="0.28" strokeDasharray="1 2" />
    </g>
  );
}

function AnatomyHotspot({
  uid,
  region,
  effect,
  selected,
  hovered,
  onHover,
  onSelect,
}: {
  uid: string;
  region: OrganRegion;
  effect?: ProgramEffect;
  selected: boolean;
  hovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  const active = Boolean(effect);
  const color = atlasStateColor(effect?.state);
  const intensity = Math.max(0.12, effect?.weight ?? 0.12);
  const pulseSeconds = Math.max(1.05, 3.6 - intensity * 1.8);
  const radius = region.r + (selected ? 0.8 : hovered ? 0.45 : 0);

  return (
    <g
      role="button"
      tabIndex={0}
      style={{ cursor: 'pointer' }}
      onMouseEnter={() => onHover(region.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(region.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onSelect(region.id);
      }}
      aria-label={`Select ${TISSUE_BY_ID[region.id]?.name ?? region.id}`}
    >
      <ellipse
        cx={region.cx}
        cy={region.cy}
        rx={region.haloX}
        ry={region.haloY}
        fill={color}
        opacity={active ? 0.12 + intensity * 0.22 : 0.035}
        filter={`url(#${uid}-hotspotGlow)`}
        className={active ? 'animate-pulse-soft' : undefined}
        style={active ? { animationDuration: `${pulseSeconds}s` } : undefined}
      />
      <circle
        cx={region.cx}
        cy={region.cy}
        r={radius}
        fill="hsl(214 68% 7% / 0.76)"
        stroke={color}
        strokeWidth={selected ? 0.62 : hovered || active ? 0.42 : 0.26}
        strokeOpacity={selected || hovered || active ? 0.95 : 0.45}
      />
      <circle
        cx={region.cx}
        cy={region.cy}
        r={Math.max(1.05, radius - 1.8)}
        fill={color}
        fillOpacity={active ? 0.24 + intensity * 0.48 : 0.1}
        className={active ? 'animate-pulse-glow' : undefined}
        style={active ? { animationDuration: `${pulseSeconds * 0.8}s` } : undefined}
      />
      {(selected || hovered) && (
        <text
          x={region.labelX}
          y={region.labelY}
          textAnchor={region.labelAnchor}
          fill="hsl(213 45% 97%)"
          fontSize="3.2"
          fontWeight="700"
          letterSpacing="0.08em"
          paintOrder="stroke"
          stroke="hsl(214 68% 7% / 0.9)"
          strokeWidth="1.3"
        >
          {TISSUE_BY_ID[region.id]?.name.toUpperCase() ?? region.id.toUpperCase()}
        </text>
      )}
    </g>
  );
}

interface OrganRegion {
  id: string;
  cx: number;
  cy: number;
  r: number;
  haloX: number;
  haloY: number;
  labelX: number;
  labelY: number;
  labelAnchor: 'start' | 'end' | 'middle';
  calloutX: number;
  calloutY: number;
}

function organRegion(
  id: string,
  cx: number,
  cy: number,
  r: number,
  haloX: number,
  haloY: number,
  labelAnchor: OrganRegion['labelAnchor'],
  calloutDx: number,
  calloutDy: number,
): OrganRegion {
  const labelOffset = labelAnchor === 'start' ? 8 : labelAnchor === 'end' ? -8 : 0;

  return {
    id,
    cx: round(cx),
    cy: round(cy),
    r,
    haloX,
    haloY,
    labelX: round(cx + labelOffset),
    labelY: round(cy + (labelAnchor === 'middle' ? -6 : 1)),
    labelAnchor,
    calloutX: round(clamp(cx + calloutDx, 5, 66)),
    calloutY: round(clamp(cy + calloutDy, 12, 184)),
  };
}

const ORGAN_REGIONS: OrganRegion[] = [
  organRegion('brain', 53, 20, 3.8, 9, 7, 'middle', 8, -8),
  organRegion('thyroid', 53, 42, 2, 5, 4, 'start', 8, -2),
  organRegion('lungs', 53, 59, 3.2, 11, 9, 'end', -20, -2),
  organRegion('heart', 53, 69, 3.1, 7, 5, 'end', -18, 1),
  organRegion('breast', 60.5, 61, 2.4, 6, 5, 'start', 10, -2),
  organRegion('liver', 46, 83, 4.1, 11, 6, 'end', -20, 1),
  organRegion('stomach', 58.5, 86, 3.1, 7, 6, 'start', 9, -1),
  organRegion('spleen', 65.5, 87, 2.1, 5, 4, 'start', 8, 1),
  organRegion('pancreas', 55, 94, 2.5, 8, 4, 'start', 9, 1),
  organRegion('kidney', 43, 103, 2.8, 6, 7, 'end', -17, 2),
  organRegion('intestine', 53, 116, 4.8, 11, 10, 'start', 11, 3),
  organRegion('skin', 20, 120, 2.4, 5, 5, 'end', -10, 1),
  organRegion('adipose', 57, 137, 3.5, 10, 8, 'start', 12, 3),
  organRegion('bone_marrow', 43, 147, 2.9, 6, 9, 'end', -17, 4),
  organRegion('muscle', 53, 170, 4, 12, 9, 'start', 12, 4),
];

const NETWORK_EDGES = [
  { id: 'gut-liver', source: 'intestine', target: 'liver', kind: 'activation', curve: -12, speed: 4.8 },
  { id: 'liver-pancreas', source: 'liver', target: 'pancreas', kind: 'feedback', curve: 9, speed: 5.5 },
  { id: 'pancreas-muscle', source: 'pancreas', target: 'muscle', kind: 'activation', curve: -10, speed: 5.1 },
  { id: 'adipose-liver', source: 'adipose', target: 'liver', kind: 'activation', curve: -18, speed: 4.2 },
  { id: 'adipose-heart', source: 'adipose', target: 'heart', kind: 'crosstalk', curve: -14, speed: 6.0 },
  { id: 'lungs-heart', source: 'lungs', target: 'heart', kind: 'activation', curve: 6, speed: 4.6 },
  { id: 'brain-liver', source: 'brain', target: 'liver', kind: 'feedback', curve: -22, speed: 7.1 },
  { id: 'liver-kidney', source: 'liver', target: 'kidney', kind: 'crosstalk', curve: 10, speed: 5.8 },
  { id: 'marrow-spleen', source: 'bone_marrow', target: 'spleen', kind: 'activation', curve: 18, speed: 5.3 },
  { id: 'muscle-liver', source: 'muscle', target: 'liver', kind: 'feedback', curve: 20, speed: 6.4 },
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function atlasStateColor(state: ActivationState | undefined): string {
  switch (state) {
    case 'up':
      return 'hsl(26 100% 68%)';
    case 'dysregulated':
      return 'hsl(350 92% 70%)';
    case 'down':
      return 'hsl(202 100% 70%)';
    case 'baseline':
      return 'hsl(152 70% 62%)';
    case 'neutral':
    default:
      return 'hsl(188 100% 74%)';
  }
}

function stateCopy(state: ActivationState) {
  switch (state) {
    case 'up':
      return 'Activated pathway pressure';
    case 'down':
      return 'Suppressed system signal';
    case 'dysregulated':
      return 'Dysregulated tissue state';
    case 'baseline':
      return 'Stabilised reference state';
    default:
      return 'Contextual biology signal';
  }
}
