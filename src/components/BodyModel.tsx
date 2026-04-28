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
    <div className="body-stage anatomical-stage relative flex h-full min-h-[640px] w-full select-none items-center justify-center overflow-hidden">
      <svg
        viewBox="0 0 620 1160"
        className="relative z-10 h-full w-full max-h-[940px] drop-shadow-[0_38px_90px_hsl(188_100%_60%/0.22)]"
        role="img"
        aria-label="Translucent whole-body systems biology atlas"
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
          <HumanSilhouette uid={uid} />
          <AnatomyOrgans uid={uid} />
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

function HumanSilhouette({ uid }: { uid: string }) {
  return (
    <g>
      <path
        d="M310 38c42 0 73 33 73 81 0 39-19 71-49 87v45c71 11 122 49 151 109 20 90 27 184 37 284l42 205c6 31-13 56-41 56-20 0-34-15-40-39l-61-279c-8 106-17 199-36 280 22 92 48 204 72 323 6 31-15 56-46 56-24 0-39-16-45-42l-58-271-58 271c-6 26-21 42-45 42-31 0-52-25-46-56 24-119 50-231 72-323-19-81-28-174-36-280l-61 279c-6 24-20 39-40 39-28 0-47-25-41-56l42-205c10-100 17-194 37-284 29-60 80-98 151-109v-45c-30-16-49-48-49-87 0-48 31-81 73-81z"
        fill={`url(#${uid}-body)`}
        stroke="hsl(193 100% 86% / 0.5)"
        strokeWidth="2.8"
      />
      <path
        d="M254 256c-42 54-62 119-61 194 1 112 31 184 117 239 86-55 116-127 117-239 1-75-19-140-61-194"
        fill="none"
        stroke="hsl(190 100% 86% / 0.16)"
        strokeWidth="3"
      />
      <path d="M310 217v710" fill="none" stroke="hsl(190 100% 86% / 0.24)" strokeWidth="2" strokeDasharray="8 17" />
      <path d="M216 392c56-42 132-42 188 0M219 474c52-32 130-32 182 0M235 572c45-25 105-25 150 0" fill="none" stroke="hsl(190 100% 86% / 0.14)" strokeWidth="3" />
    </g>
  );
}

function AnatomyOrgans({ uid }: { uid: string }) {
  return (
    <g filter={`url(#${uid}-blurGlow)`} opacity="0.9">
      <path d="M246 343c-42 13-70 57-71 117 0 50 23 95 60 112 36-36 53-91 49-148-2-38-15-67-38-81z" fill="hsl(191 100% 70% / 0.2)" stroke="hsl(190 100% 86% / 0.58)" strokeWidth="2" />
      <path d="M374 343c42 13 70 57 71 117 0 50-23 95-60 112-36-36-53-91-49-148 2-38 15-67 38-81z" fill="hsl(191 100% 70% / 0.2)" stroke="hsl(190 100% 86% / 0.58)" strokeWidth="2" />
      <path d="M294 418c25-31 80-12 83 33 2 45-41 69-73 105-31-36-74-60-72-105 3-45 40-64 62-33z" fill="hsl(350 92% 70% / 0.36)" stroke="hsl(350 100% 86% / 0.66)" strokeWidth="2" />
      <path d="M198 558c74-37 166-25 210 23-37 61-130 89-228 55-10-33-6-60 18-78z" fill="hsl(35 96% 60% / 0.34)" stroke="hsl(40 100% 78% / 0.64)" strokeWidth="2" />
      <path d="M373 571c49 1 69 52 40 91-28 37-87 31-101-13-14-44 15-78 61-78z" fill="hsl(42 95% 70% / 0.29)" stroke="hsl(42 95% 80% / 0.54)" strokeWidth="2" />
      <path d="M238 650c45-26 118-25 153 12-38 33-113 42-165 13 2-10 6-19 12-25z" fill="hsl(43 95% 72% / 0.28)" stroke="hsl(43 95% 82% / 0.48)" strokeWidth="2" />
      <path d="M235 721c45-37 122-36 165 5 39 37 28 120-21 156-44 32-112 29-149-6-42-41-37-121 5-155z" fill="hsl(43 95% 72% / 0.2)" stroke="hsl(43 95% 86% / 0.38)" strokeWidth="2" />
      <path d="M236 620c24-7 45 20 36 53-9 36-49 53-73 28-24-26 2-74 37-81zM384 620c-24-7-45 20-36 53 9 36 49 53 73 28 24-26-2-74-37-81z" fill="hsl(202 100% 78% / 0.18)" stroke="hsl(200 100% 88% / 0.42)" strokeWidth="2" />
      <path d="M258 172c35-22 78-21 101 2 20 21 18 61-6 85-29 29-86 27-112-3-22-25-14-63 17-84z" fill="hsl(152 70% 62% / 0.22)" stroke="hsl(152 80% 82% / 0.48)" strokeWidth="2" />
      <path d="M281 287c15-14 43-14 58 0-1 25-14 40-29 40s-28-15-29-40z" fill="hsl(152 70% 62% / 0.2)" stroke="hsl(152 80% 82% / 0.5)" strokeWidth="2" />
    </g>
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

const ORGAN_REGIONS: OrganRegion[] = [
  { id: 'brain', cx: 310, cy: 164, r: 31, haloX: 88, haloY: 70, labelX: 310, labelY: 91, labelAnchor: 'middle', calloutX: 402, calloutY: 135 },
  { id: 'thyroid', cx: 310, cy: 300, r: 21, haloX: 54, haloY: 42, labelX: 367, labelY: 296, labelAnchor: 'start', calloutX: 382, calloutY: 281 },
  { id: 'lungs', cx: 228, cy: 436, r: 29, haloX: 74, haloY: 96, labelX: 142, labelY: 420, labelAnchor: 'end', calloutX: 394, calloutY: 390 },
  { id: 'heart', cx: 307, cy: 462, r: 27, haloX: 62, haloY: 60, labelX: 215, labelY: 463, labelAnchor: 'end', calloutX: 396, calloutY: 450 },
  { id: 'breast', cx: 390, cy: 435, r: 22, haloX: 48, haloY: 48, labelX: 464, labelY: 431, labelAnchor: 'start', calloutX: 405, calloutY: 377 },
  { id: 'liver', cx: 236, cy: 595, r: 33, haloX: 96, haloY: 62, labelX: 128, labelY: 590, labelAnchor: 'end', calloutX: 399, calloutY: 560 },
  { id: 'stomach', cx: 388, cy: 595, r: 29, haloX: 62, haloY: 68, labelX: 475, labelY: 586, labelAnchor: 'start', calloutX: 398, calloutY: 586 },
  { id: 'spleen', cx: 456, cy: 618, r: 20, haloX: 46, haloY: 46, labelX: 520, labelY: 616, labelAnchor: 'start', calloutX: 395, calloutY: 617 },
  { id: 'pancreas', cx: 310, cy: 668, r: 24, haloX: 68, haloY: 42, labelX: 392, labelY: 676, labelAnchor: 'start', calloutX: 395, calloutY: 650 },
  { id: 'kidney', cx: 232, cy: 718, r: 25, haloX: 60, haloY: 62, labelX: 145, labelY: 728, labelAnchor: 'end', calloutX: 397, calloutY: 706 },
  { id: 'intestine', cx: 310, cy: 805, r: 36, haloX: 92, haloY: 98, labelX: 410, labelY: 816, labelAnchor: 'start', calloutX: 398, calloutY: 786 },
  { id: 'skin', cx: 128, cy: 784, r: 22, haloX: 52, haloY: 52, labelX: 88, labelY: 792, labelAnchor: 'end', calloutX: 384, calloutY: 756 },
  { id: 'adipose', cx: 362, cy: 924, r: 30, haloX: 86, haloY: 82, labelX: 460, labelY: 938, labelAnchor: 'start', calloutX: 397, calloutY: 908 },
  { id: 'bone_marrow', cx: 229, cy: 925, r: 24, haloX: 56, haloY: 72, labelX: 135, labelY: 938, labelAnchor: 'end', calloutX: 390, calloutY: 888 },
  { id: 'muscle', cx: 310, cy: 1050, r: 32, haloX: 96, haloY: 78, labelX: 420, labelY: 1060, labelAnchor: 'start', calloutX: 380, calloutY: 1018 },
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
