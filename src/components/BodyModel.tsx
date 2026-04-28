import { useMemo } from 'react';
import { ProgramEffect } from '@/atlas/types';
import { stateColor } from '@/atlas/useAtlas';
import { TISSUE_BY_ID } from '@/atlas/data';

interface BodyModelProps {
  tissueEffects: Map<string, ProgramEffect>;
  hoveredTissue: string | null;
  selectedTissue: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}

/**
 * Stylized full-body silhouette with clickable organ regions.
 * Coordinates are tuned for a 360x720 viewBox centered male-neutral figure.
 */
export function BodyModel({
  tissueEffects,
  hoveredTissue,
  selectedTissue,
  onHover,
  onSelect,
}: BodyModelProps) {
  const regions = useMemo(() => ORGAN_REGIONS, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      {/* Ambient glow + scan */}
      <div className="absolute inset-0 bg-gradient-glow opacity-60 pointer-events-none" />
      <div
        className="absolute left-0 right-0 h-24 pointer-events-none animate-scan"
        style={{
          background:
            'linear-gradient(180deg, transparent, hsl(var(--primary)/0.18), transparent)',
        }}
      />

      <svg
        viewBox="0 0 360 720"
        className="relative w-full h-full max-h-[680px] drop-shadow-[0_20px_40px_hsl(188_100%_50%/0.15)]"
        role="img"
        aria-label="Interactive human body atlas"
      >
        <defs>
          <linearGradient id="bodyFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="hsl(214 60% 14%)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="hsl(220 60% 7%)" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="bodyEdge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(188 100% 70%)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(215 100% 68%)" stopOpacity="0.4" />
          </linearGradient>
          <radialGradient id="organGlow">
            <stop offset="0%" stopColor="white" stopOpacity="0.35" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* Anatomical silhouette */}
        <g>
          <path d={BODY_PATH} fill="url(#bodyFill)" stroke="url(#bodyEdge)" strokeWidth="1.2" />
          {/* Subtle midline */}
          <line x1="180" y1="120" x2="180" y2="560" stroke="hsl(188 100% 70% / 0.08)" strokeDasharray="2 6" />
        </g>

        {/* Organ regions */}
        <g>
          {regions.map(r => {
            const effect = tissueEffects.get(r.id);
            const active = !!effect;
            const isHover = hoveredTissue === r.id;
            const isSelected = selectedTissue === r.id;
            const color = active ? stateColor(effect!.state) : 'hsl(215 30% 60%)';
            const intensity = active ? (effect!.weight ?? 0.7) : 0.0;
            const baseOpacity = active ? 0.45 + 0.5 * intensity : 0.12;

            return (
              <g
                key={r.id}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => onHover(r.id)}
                onMouseLeave={() => onHover(null)}
                onClick={() => onSelect(r.id)}
              >
                {/* Glow halo when active */}
                {active && (
                  <circle
                    cx={r.cx} cy={r.cy} r={r.r * 2.4}
                    fill={color} opacity={0.18 + 0.25 * intensity}
                    filter="url(#soft)"
                    className="animate-pulse-soft"
                  />
                )}
                {/* Organ shape (circle for MVP — clean & scientific) */}
                <circle
                  cx={r.cx} cy={r.cy} r={r.r}
                  fill={color}
                  fillOpacity={baseOpacity}
                  stroke={color}
                  strokeOpacity={active ? 0.9 : 0.35}
                  strokeWidth={isSelected ? 2.4 : isHover ? 1.6 : 1}
                  className="transition-smooth"
                />
                {/* Inner highlight */}
                <circle cx={r.cx - r.r * 0.35} cy={r.cy - r.r * 0.35} r={r.r * 0.5} fill="url(#organGlow)" />

                {/* Label on hover/select/active */}
                {(isHover || isSelected) && (
                  <g pointerEvents="none">
                    <line
                      x1={r.cx} y1={r.cy}
                      x2={r.labelX} y2={r.labelY}
                      stroke="hsl(188 100% 70% / 0.5)" strokeWidth="0.8"
                    />
                    <rect
                      x={r.labelX - (r.labelAnchor === 'end' ? 96 : 0)}
                      y={r.labelY - 12}
                      width="96" height="22" rx="6"
                      fill="hsl(214 68% 7% / 0.92)"
                      stroke="hsl(188 100% 70% / 0.4)"
                    />
                    <text
                      x={r.labelX + (r.labelAnchor === 'end' ? -6 : 6)}
                      y={r.labelY + 3}
                      fill="hsl(var(--foreground))"
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                      textAnchor={r.labelAnchor}
                      letterSpacing="0.05em"
                    >
                      {TISSUE_BY_ID[r.id]?.name?.toUpperCase() ?? r.id.toUpperCase()}
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

// ------------------------------------------------------------
// Stylized humanoid silhouette (front view) on a 360x720 canvas
// ------------------------------------------------------------
const BODY_PATH = `
  M 180 40
  C 205 40, 220 60, 220 88
  C 220 110, 208 128, 195 134
  L 200 152
  C 232 158, 252 168, 262 188
  L 268 240
  L 290 360
  L 280 380
  L 268 312
  L 262 360
  L 256 470
  C 256 478, 252 484, 246 484
  L 242 484
  L 236 386
  L 226 470
  L 222 560
  L 240 690
  C 242 700, 234 706, 224 706
  L 214 706
  C 208 706, 204 702, 202 694
  L 196 580
  L 190 480
  L 180 470
  L 170 480
  L 164 580
  L 158 694
  C 156 702, 152 706, 146 706
  L 136 706
  C 126 706, 118 700, 120 690
  L 138 560
  L 134 470
  L 124 386
  L 118 484
  L 114 484
  C 108 484, 104 478, 104 470
  L 98 360
  L 92 312
  L 80 380
  L 70 360
  L 92 240
  L 98 188
  C 108 168, 128 158, 160 152
  L 165 134
  C 152 128, 140 110, 140 88
  C 140 60, 155 40, 180 40 Z
`;

interface OrganRegion {
  id: string;
  cx: number;
  cy: number;
  r: number;
  labelX: number;
  labelY: number;
  labelAnchor: 'start' | 'end';
}

const ORGAN_REGIONS: OrganRegion[] = [
  { id: 'brain',       cx: 180, cy: 78,  r: 16, labelX: 300, labelY: 78,  labelAnchor: 'end' },
  { id: 'thyroid',     cx: 180, cy: 138, r: 6,  labelX: 60,  labelY: 138, labelAnchor: 'start' },
  { id: 'lungs',       cx: 180, cy: 210, r: 26, labelX: 320, labelY: 200, labelAnchor: 'end' },
  { id: 'heart',       cx: 168, cy: 220, r: 11, labelX: 60,  labelY: 220, labelAnchor: 'start' },
  { id: 'liver',       cx: 200, cy: 270, r: 16, labelX: 320, labelY: 270, labelAnchor: 'end' },
  { id: 'stomach',     cx: 162, cy: 268, r: 10, labelX: 60,  labelY: 260, labelAnchor: 'start' },
  { id: 'spleen',      cx: 150, cy: 282, r: 7,  labelX: 60,  labelY: 290, labelAnchor: 'start' },
  { id: 'pancreas',    cx: 178, cy: 296, r: 7,  labelX: 320, labelY: 308, labelAnchor: 'end' },
  { id: 'kidney',      cx: 156, cy: 312, r: 7,  labelX: 60,  labelY: 320, labelAnchor: 'start' },
  { id: 'adipose',     cx: 200, cy: 332, r: 9,  labelX: 320, labelY: 340, labelAnchor: 'end' },
  { id: 'intestine',   cx: 180, cy: 348, r: 14, labelX: 60,  labelY: 360, labelAnchor: 'start' },
  { id: 'breast',      cx: 200, cy: 200, r: 7,  labelX: 320, labelY: 168, labelAnchor: 'end' },
  { id: 'bone_marrow', cx: 124, cy: 386, r: 7,  labelX: 60,  labelY: 386, labelAnchor: 'start' },
  { id: 'muscle',      cx: 152, cy: 560, r: 10, labelX: 60,  labelY: 560, labelAnchor: 'start' },
  { id: 'skin',        cx: 232, cy: 470, r: 6,  labelX: 320, labelY: 470, labelAnchor: 'end' },
];
