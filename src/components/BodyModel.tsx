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
    <div className="body-stage anatomical-stage relative flex h-full min-h-[430px] w-full select-none items-center justify-center overflow-hidden">
      <svg
        viewBox="0 0 620 1160"
        className="relative z-10 h-[min(100%,640px)] w-auto max-w-[78%] drop-shadow-[0_38px_90px_hsl(188_100%_60%/0.22)]"
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
          <pattern id={`${uid}-microgrid`} width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M22 0H0V22" fill="none" stroke="hsl(190 100% 72% / 0.08)" strokeWidth="1" />
          </pattern>
        </defs>

        <rect x="0" y="0" width="620" height="1160" fill={`url(#${uid}-microgrid)`} opacity="0.45" />
        <ellipse cx="310" cy="560" rx="214" ry="506" fill={`url(#${uid}-core)`} opacity="0.75" />

        <g opacity="0.96">
          <image
            href="/anatomogram-human.svg"
            x="44"
            y="46"
            width="532"
            height="981"
            opacity="0.78"
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
                  strokeWidth={active ? 2.8 : 1.1}
                  strokeDasharray={edge.kind === 'feedback' ? '8 10' : edge.kind === 'crosstalk' ? '3 8' : undefined}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  filter={active ? `url(#${uid}-blurGlow)` : undefined}
                />
                <circle r={active ? 4.5 : 2.5} fill={color}>
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
              d={`M ${selectedRegion.cx} ${selectedRegion.cy} C ${selectedRegion.cx + 40} ${selectedRegion.cy - 30}, ${selectedRegion.calloutX - 36} ${selectedRegion.calloutY - 18}, ${selectedRegion.calloutX} ${selectedRegion.calloutY}`}
              fill="none"
              stroke={atlasStateColor(selectedEffect?.state)}
              strokeWidth="1.4"
              strokeDasharray="5 8"
              opacity="0.9"
            />
            <rect
              x={selectedRegion.calloutX}
              y={selectedRegion.calloutY - 42}
              width="190"
              height="82"
              rx="14"
              fill="hsl(214 68% 7% / 0.82)"
              stroke={atlasStateColor(selectedEffect?.state)}
              strokeOpacity="0.55"
            />
            <text x={selectedRegion.calloutX + 16} y={selectedRegion.calloutY - 15} fill="hsl(213 45% 97%)" fontSize="18" fontWeight="700">
              {TISSUE_BY_ID[selectedRegion.id]?.name ?? selectedRegion.id}
            </text>
            <text x={selectedRegion.calloutX + 16} y={selectedRegion.calloutY + 10} fill="hsl(215 30% 72%)" fontSize="12">
              {selectedEffect?.state ? stateCopy(selectedEffect.state) : 'Reference region'}
            </text>
            <text x={selectedRegion.calloutX + 16} y={selectedRegion.calloutY + 31} fill={atlasStateColor(selectedEffect?.state)} fontSize="13" fontFamily="JetBrains Mono, monospace">
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
      <path d="M310 207C286 270 271 324 274 411c2 78 18 155 36 245 18-90 34-167 36-245 3-87-12-141-36-204z" fill="none" stroke={`url(#${uid}-vessel)`} strokeWidth="1.6" />
      <path d="M310 311C250 362 223 430 221 535M310 311c60 51 87 119 89 224M310 500c-42 57-65 133-69 230M310 500c42 57 65 133 69 230M310 722c-28 72-43 155-47 268M310 722c28 72 43 155 47 268" fill="none" stroke="hsl(188 100% 72% / 0.3)" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M223 450c40 19 66 46 87 86 21-40 47-67 87-86M208 575c50 27 84 62 102 113 18-51 52-86 102-113" fill="none" stroke="hsl(216 100% 72% / 0.24)" strokeWidth="1.2" strokeDasharray="5 10" />
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
  const radius = region.r + (selected ? 5 : hovered ? 3 : 0);

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
        strokeWidth={selected ? 3.4 : hovered || active ? 2.4 : 1.2}
        strokeOpacity={selected || hovered || active ? 0.95 : 0.45}
      />
      <circle
        cx={region.cx}
        cy={region.cy}
        r={Math.max(6, radius - 10)}
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
          fontSize="14"
          fontWeight="700"
          letterSpacing="0.08em"
          paintOrder="stroke"
          stroke="hsl(214 68% 7% / 0.9)"
          strokeWidth="5"
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

const ANATOMOGRAM_FRAME = {
  x: 44,
  y: 46,
  width: 532,
  height: 981,
  sourceWidth: 106.00675,
  sourceHeight: 195.36273,
};

function organRegion(
  id: string,
  sourceX: number,
  sourceY: number,
  r: number,
  haloX: number,
  haloY: number,
  labelAnchor: OrganRegion['labelAnchor'],
  calloutDx: number,
  calloutDy: number,
): OrganRegion {
  const cx = ANATOMOGRAM_FRAME.x + (sourceX / ANATOMOGRAM_FRAME.sourceWidth) * ANATOMOGRAM_FRAME.width;
  const cy = ANATOMOGRAM_FRAME.y + (sourceY / ANATOMOGRAM_FRAME.sourceHeight) * ANATOMOGRAM_FRAME.height;
  const labelOffset = labelAnchor === 'start' ? 44 : labelAnchor === 'end' ? -44 : 0;

  return {
    id,
    cx: round(cx),
    cy: round(cy),
    r,
    haloX,
    haloY,
    labelX: round(cx + labelOffset),
    labelY: round(cy + (labelAnchor === 'middle' ? -34 : 5)),
    labelAnchor,
    calloutX: round(clamp(cx + calloutDx, 30, 400)),
    calloutY: round(clamp(cy + calloutDy, 74, 1070)),
  };
}

const ORGAN_REGIONS: OrganRegion[] = [
  organRegion('brain', 53, 20, 25, 60, 46, 'middle', 0, -56),
  organRegion('thyroid', 53, 43, 16, 36, 28, 'start', 42, -6),
  organRegion('lungs', 53, 59, 23, 58, 52, 'end', -94, -10),
  organRegion('heart', 53, 68, 20, 42, 34, 'end', -86, 2),
  organRegion('breast', 61, 61, 17, 36, 30, 'start', 58, -8),
  organRegion('liver', 46, 83, 23, 62, 34, 'end', -80, 2),
  organRegion('stomach', 59, 86, 20, 42, 38, 'start', 58, -4),
  organRegion('spleen', 66, 87, 15, 30, 30, 'start', 52, 2),
  organRegion('pancreas', 55, 94, 17, 46, 28, 'start', 54, 8),
  organRegion('kidney', 43, 103, 18, 38, 40, 'end', -76, 10),
  organRegion('intestine', 53, 116, 27, 58, 54, 'start', 66, 12),
  organRegion('skin', 20, 120, 17, 34, 34, 'end', -50, 8),
  organRegion('adipose', 58, 137, 22, 58, 50, 'start', 68, 16),
  organRegion('bone_marrow', 43, 147, 18, 36, 54, 'end', -76, 18),
  organRegion('muscle', 53, 170, 24, 72, 58, 'start', 70, 18),
];

const NETWORK_EDGES = [
  { id: 'gut-liver', source: 'intestine', target: 'liver', kind: 'activation', curve: -80, speed: 4.8 },
  { id: 'liver-pancreas', source: 'liver', target: 'pancreas', kind: 'feedback', curve: 58, speed: 5.5 },
  { id: 'pancreas-muscle', source: 'pancreas', target: 'muscle', kind: 'activation', curve: -74, speed: 5.1 },
  { id: 'adipose-liver', source: 'adipose', target: 'liver', kind: 'activation', curve: -130, speed: 4.2 },
  { id: 'adipose-heart', source: 'adipose', target: 'heart', kind: 'crosstalk', curve: -102, speed: 6.0 },
  { id: 'lungs-heart', source: 'lungs', target: 'heart', kind: 'activation', curve: 40, speed: 4.6 },
  { id: 'brain-liver', source: 'brain', target: 'liver', kind: 'feedback', curve: -175, speed: 7.1 },
  { id: 'liver-kidney', source: 'liver', target: 'kidney', kind: 'crosstalk', curve: 76, speed: 5.8 },
  { id: 'marrow-spleen', source: 'bone_marrow', target: 'spleen', kind: 'activation', curve: 142, speed: 5.3 },
  { id: 'muscle-liver', source: 'muscle', target: 'liver', kind: 'feedback', curve: 168, speed: 6.4 },
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
