import { useId, useMemo, useRef, useState } from 'react';
import { Maximize2, Minus, Plus, RotateCcw, ScanLine } from 'lucide-react';
import { TISSUE_BY_ID } from '@/atlas/data';
import { ActivationState, ProgramEffect } from '@/atlas/types';

interface BodyModelProps {
  tissueEffects: Map<string, ProgramEffect>;
  hoveredTissue: string | null;
  selectedTissue: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}

type AtlasView = { zoom: number; panX: number; panY: number };
type Point = { x: number; y: number };
const VIEW_BOX = { x: 0, y: 0, width: 106.00675, height: 195.36273 };
const DEFAULT_VIEW: AtlasView = { zoom: 1.18, panX: 0, panY: 0 };

export function BodyModel({ tissueEffects, hoveredTissue, selectedTissue, onHover, onSelect }: BodyModelProps) {
  const regions = useMemo(() => ORGAN_REGIONS, []);
  const uid = useId().replace(/:/g, '');
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [view, setView] = useState<AtlasView>(DEFAULT_VIEW);
  const [drag, setDrag] = useState<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [showFlows, setShowFlows] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const [showCalibration, setShowCalibration] = useState(false);

  const selectedRegion = regions.find((region) => region.id === selectedTissue || region.id === hoveredTissue);
  const selectedEffect = selectedRegion ? tissueEffects.get(selectedRegion.id) : undefined;
  const transform = `translate(${VIEW_BOX.width / 2 + view.panX} ${VIEW_BOX.height / 2 + view.panY}) scale(${view.zoom}) translate(${-VIEW_BOX.width / 2} ${-VIEW_BOX.height / 2})`;

  const zoomBy = (delta: number) => setView((current) => ({ ...current, zoom: clamp(round(current.zoom + delta), 0.86, 2.7) }));
  const focusSelected = () => selectedRegion && setView({ zoom: 2.05, panX: clamp((VIEW_BOX.width / 2 - selectedRegion.cx) * 1.2, -34, 34), panY: clamp((VIEW_BOX.height / 2 - selectedRegion.cy) * 1.2, -52, 52) });
  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const point = svgPoint(svgRef.current, event.clientX, event.clientY);
    if (point) setCursor(toAtlasPoint(point, view));
    if (!drag) return;
    const sensitivity = 0.16 / view.zoom;
    setView((current) => ({ ...current, panX: clamp(drag.panX + (event.clientX - drag.x) * sensitivity, -38, 38), panY: clamp(drag.panY + (event.clientY - drag.y) * sensitivity, -56, 56) }));
  };

  return (
    <div className="body-stage anatomical-stage relative flex h-full min-h-[320px] w-full select-none flex-col overflow-hidden rounded-b-2xl bg-[#03101f]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(190_100%_62%/0.16),transparent_48%)]" />
      <div className="relative z-20 flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] bg-[#041426]/80 px-3 py-2 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <AtlasButton label="Zoom out" onClick={() => zoomBy(-0.16)}><Minus className="h-3.5 w-3.5" /></AtlasButton>
          <div className="mono min-w-[52px] rounded-md border border-white/10 bg-white/[0.035] px-2 py-1 text-center text-[10px] text-primary">{(view.zoom * 100).toFixed(0)}%</div>
          <AtlasButton label="Zoom in" onClick={() => zoomBy(0.16)}><Plus className="h-3.5 w-3.5" /></AtlasButton>
          <AtlasButton label="Reset atlas view" onClick={() => setView(DEFAULT_VIEW)}><RotateCcw className="h-3.5 w-3.5" /></AtlasButton>
          <AtlasButton label="Focus selected tissue" onClick={focusSelected} disabled={!selectedRegion}><Maximize2 className="h-3.5 w-3.5" /></AtlasButton>
        </div>
        <div className="flex items-center gap-2">
          <ToggleChip active={showFlows} onClick={() => setShowFlows((v) => !v)} label="flows" />
          <ToggleChip active={showLabels} onClick={() => setShowLabels((v) => !v)} label="labels" />
          <ToggleChip active={showCalibration} onClick={() => setShowCalibration((v) => !v)} label="calibrate"><ScanLine className="h-3 w-3" /></ToggleChip>
        </div>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`${VIEW_BOX.x} ${VIEW_BOX.y} ${VIEW_BOX.width} ${VIEW_BOX.height}`}
          className="relative z-10 h-full w-full cursor-grab touch-none drop-shadow-[0_30px_70px_hsl(188_100%_60%/0.18)] active:cursor-grabbing"
          role="img"
          aria-label="Translucent whole-body systems biology atlas"
          preserveAspectRatio="xMidYMid meet"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => { setCursor(null); setDrag(null); }}
          onPointerUp={() => setDrag(null)}
          onPointerDown={(event) => {
            if ((event.target as Element).closest('[data-hotspot="true"]')) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            setDrag({ x: event.clientX, y: event.clientY, panX: view.panX, panY: view.panY });
          }}
          onWheel={(event) => {
            event.preventDefault();
            zoomBy(event.deltaY > 0 ? -0.08 : 0.08);
          }}
        >
          <defs>
            <radialGradient id={`${uid}-core`} cx="50%" cy="46%" r="58%"><stop offset="0%" stopColor="hsl(188 100% 76%)" stopOpacity="0.58" /><stop offset="42%" stopColor="hsl(210 100% 62%)" stopOpacity="0.2" /><stop offset="100%" stopColor="hsl(216 70% 8%)" stopOpacity="0.02" /></radialGradient>
            <linearGradient id={`${uid}-vessel`} x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stopColor="hsl(188 100% 72%)" stopOpacity="0.82" /><stop offset="100%" stopColor="hsl(218 100% 72%)" stopOpacity="0.2" /></linearGradient>
            <filter id={`${uid}-blurGlow`} x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="14" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            <filter id={`${uid}-hotspotGlow`} x="-160%" y="-160%" width="420%" height="420%"><feGaussianBlur stdDeviation="10" /></filter>
            <pattern id={`${uid}-microgrid`} width="4" height="4" patternUnits="userSpaceOnUse"><path d="M4 0H0V4" fill="none" stroke="hsl(190 100% 72% / 0.055)" strokeWidth="0.18" /></pattern>
          </defs>
          <rect x="0" y="0" width={VIEW_BOX.width} height={VIEW_BOX.height} fill={`url(#${uid}-microgrid)`} opacity="0.3" />
          <g transform={transform}>
            <ellipse cx="53" cy="96" rx="28" ry="84" fill={`url(#${uid}-core)`} opacity="0.7" />
            <g opacity="0.96"><image href="/anatomogram-human.svg" x="0" y="0" width={VIEW_BOX.width} height={VIEW_BOX.height} opacity="0.86" preserveAspectRatio="xMidYMid meet" filter={`url(#${uid}-blurGlow)`} /><NeurovascularOverlay uid={uid} /></g>
            {showFlows && <NetworkEdges regions={regions} tissueEffects={tissueEffects} uid={uid} />}
            <g>{regions.map((region) => <AnatomyHotspot key={region.id} uid={uid} region={region} effect={tissueEffects.get(region.id)} selected={selectedTissue === region.id} hovered={hoveredTissue === region.id} showLabel={showLabels} onHover={onHover} onSelect={onSelect} />)}</g>
            {selectedRegion && <SelectedCallout region={selectedRegion} effect={selectedEffect} />}
            {showCalibration && <CalibrationOverlay regions={regions} cursor={cursor} />}
          </g>
        </svg>
        {showCalibration && cursor && <div className="mono pointer-events-none absolute bottom-3 left-3 z-30 rounded-lg border border-cyan-200/20 bg-[#041426]/90 px-3 py-2 text-[10px] text-cyan-100 shadow-lg">x {cursor.x.toFixed(1)} · y {cursor.y.toFixed(1)}</div>}
      </div>
    </div>
  );
}

function NetworkEdges({ regions, tissueEffects, uid }: { regions: OrganRegion[]; tissueEffects: Map<string, ProgramEffect>; uid: string }) {
  return <g>{NETWORK_EDGES.map((edge) => {
    const source = regions.find((r) => r.id === edge.source);
    const target = regions.find((r) => r.id === edge.target);
    if (!source || !target) return null;
    const sourceEffect = tissueEffects.get(source.id);
    const targetEffect = tissueEffects.get(target.id);
    const active = Boolean(sourceEffect || targetEffect);
    const color = active ? atlasStateColor(targetEffect?.state ?? sourceEffect?.state) : 'hsl(190 100% 72% / 0.55)';
    const path = curvedPath(source, target, edge.curve);
    return <g key={edge.id} opacity={active ? 0.78 : 0.18}><path d={path} fill="none" stroke={color} strokeWidth={active ? 0.5 : 0.22} strokeDasharray={edge.kind === 'feedback' ? '1.8 2.2' : edge.kind === 'crosstalk' ? '0.7 1.4' : undefined} strokeLinecap="round" vectorEffect="non-scaling-stroke" filter={active ? `url(#${uid}-blurGlow)` : undefined} /><circle r={active ? 0.78 : 0.42} fill={color}><animateMotion dur={`${edge.speed}s`} repeatCount="indefinite" path={path} /></circle></g>;
  })}</g>;
}

function SelectedCallout({ region, effect }: { region: OrganRegion; effect?: ProgramEffect }) {
  return <g pointerEvents="none"><path d={`M ${region.cx} ${region.cy} C ${region.cx + region.calloutBend} ${region.cy - 5}, ${region.calloutX - 5} ${region.calloutY - 3}, ${region.calloutX} ${region.calloutY}`} fill="none" stroke={atlasStateColor(effect?.state)} strokeWidth="0.42" strokeDasharray="1.4 1.8" opacity="0.88" vectorEffect="non-scaling-stroke" /><rect x={region.calloutX} y={region.calloutY - 7} width="37" height="16" rx="2.8" fill="hsl(214 68% 7% / 0.88)" stroke={atlasStateColor(effect?.state)} strokeOpacity="0.58" vectorEffect="non-scaling-stroke" /><text x={region.calloutX + 3} y={region.calloutY - 2.2} fill="hsl(213 45% 97%)" fontSize="3.1" fontWeight="700">{TISSUE_BY_ID[region.id]?.name ?? region.id}</text><text x={region.calloutX + 3} y={region.calloutY + 2.7} fill="hsl(215 30% 72%)" fontSize="2.1">{effect?.state ? stateCopy(effect.state) : 'Reference region'}</text><text x={region.calloutX + 3} y={region.calloutY + 6.2} fill={atlasStateColor(effect?.state)} fontSize="2.2" fontFamily="JetBrains Mono, monospace">pulse {(Math.max(0.08, effect?.weight ?? 0.18) * 100).toFixed(0)}%</text></g>;
}

function AtlasButton({ children, label, onClick, disabled }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return <button type="button" aria-label={label} disabled={disabled} onClick={onClick} className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-cyan-100 transition-smooth hover:border-primary/40 hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-35">{children}</button>;
}

function ToggleChip({ active, label, children, onClick }: { active: boolean; label: string; children?: React.ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[10px] uppercase tracking-[0.12em] transition-smooth ${active ? 'border-primary/50 bg-primary/15 text-primary' : 'border-white/10 bg-white/[0.035] text-muted-foreground hover:text-foreground'}`}>{children}{label}</button>;
}

function NeurovascularOverlay({ uid }: { uid: string }) {
  return <g opacity="0.72"><path d="M53 29C49 43 48 57 49 72c0.5 14 2.4 29 4 45 1.6-16 3.5-31 4-45 1-15-0.8-29-4-43z" fill="none" stroke={`url(#${uid}-vessel)`} strokeWidth="0.38" /><path d="M53 47C43 58 39 70 38.5 89M53 47c10 11 14 23 14.5 42M53 83c-7 10-11 25-12 43M53 83c7 10 11 25 12 43M53 121c-5 13-7 29-8 50M53 121c5 13 7 29 8 50" fill="none" stroke="hsl(188 100% 72% / 0.3)" strokeWidth="0.34" strokeLinecap="round" /><path d="M39 75c7 4 11 8 14 15 3-7 7-11 14-15M36 97c9 5 14 11 17 20 3-9 8-15 17-20" fill="none" stroke="hsl(216 100% 72% / 0.24)" strokeWidth="0.28" strokeDasharray="1 2" /></g>;
}

function AnatomyHotspot({ uid, region, effect, selected, hovered, showLabel, onHover, onSelect }: { uid: string; region: OrganRegion; effect?: ProgramEffect; selected: boolean; hovered: boolean; showLabel: boolean; onHover: (id: string | null) => void; onSelect: (id: string) => void }) {
  const active = Boolean(effect);
  const color = atlasStateColor(effect?.state);
  const intensity = Math.max(0.12, effect?.weight ?? 0.12);
  const radius = region.r + (selected ? 0.55 : hovered ? 0.32 : 0);
  const showText = showLabel || selected || hovered;
  return <g data-hotspot="true" role="button" tabIndex={0} style={{ cursor: 'pointer' }} onMouseEnter={() => onHover(region.id)} onMouseLeave={() => onHover(null)} onClick={() => onSelect(region.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onSelect(region.id); }} aria-label={`Select ${TISSUE_BY_ID[region.id]?.name ?? region.id}`}><ellipse cx={region.cx} cy={region.cy} rx={region.haloX} ry={region.haloY} fill={color} opacity={active ? 0.1 + intensity * 0.2 : selected || hovered ? 0.08 : 0.02} filter={`url(#${uid}-hotspotGlow)`} className={active ? 'animate-pulse-soft' : undefined} /><circle cx={region.cx} cy={region.cy} r={region.hitR} fill="transparent" /><circle cx={region.cx} cy={region.cy} r={radius} fill="hsl(214 68% 7% / 0.8)" stroke={color} strokeWidth={selected ? 0.58 : hovered || active ? 0.36 : 0.22} strokeOpacity={selected || hovered || active ? 0.95 : 0.48} vectorEffect="non-scaling-stroke" /><circle cx={region.cx} cy={region.cy} r={Math.max(0.72, radius - 1.4)} fill={color} fillOpacity={active ? 0.24 + intensity * 0.46 : 0.12} className={active ? 'animate-pulse-glow' : undefined} />{showText && <text x={region.labelX} y={region.labelY} textAnchor={region.labelAnchor} fill="hsl(213 45% 97%)" fontSize="2.8" fontWeight="700" letterSpacing="0.08em" paintOrder="stroke" stroke="hsl(214 68% 7% / 0.9)" strokeWidth="1.1">{TISSUE_BY_ID[region.id]?.name.toUpperCase() ?? region.id.toUpperCase()}</text>}</g>;
}

function CalibrationOverlay({ regions, cursor }: { regions: OrganRegion[]; cursor: Point | null }) {
  return <g pointerEvents="none" opacity="0.72">{Array.from({ length: 11 }, (_, i) => i * 10).map((x) => <g key={`x-${x}`}><path d={`M ${x} 0 V ${VIEW_BOX.height}`} stroke="hsl(190 100% 72% / 0.22)" strokeWidth="0.12" vectorEffect="non-scaling-stroke" /><text x={x + 0.6} y="5" fill="hsl(190 100% 82% / 0.72)" fontSize="2.1">{x}</text></g>)}{Array.from({ length: 20 }, (_, i) => i * 10).map((y) => <g key={`y-${y}`}><path d={`M 0 ${y} H ${VIEW_BOX.width}`} stroke="hsl(190 100% 72% / 0.22)" strokeWidth="0.12" vectorEffect="non-scaling-stroke" /><text x="1" y={y - 0.8} fill="hsl(190 100% 82% / 0.72)" fontSize="2.1">{y}</text></g>)}{regions.map((r) => <g key={`cal-${r.id}`}><path d={`M ${r.cx - 2} ${r.cy} H ${r.cx + 2} M ${r.cx} ${r.cy - 2} V ${r.cy + 2}`} stroke="white" strokeWidth="0.18" vectorEffect="non-scaling-stroke" /><text x={r.cx + 2.4} y={r.cy - 1.2} fill="white" fontSize="2.1">{r.id}</text></g>)}{cursor && <path d={`M ${cursor.x} 0 V ${VIEW_BOX.height} M 0 ${cursor.y} H ${VIEW_BOX.width}`} stroke="hsl(55 100% 70% / 0.85)" strokeWidth="0.16" strokeDasharray="1 1" vectorEffect="non-scaling-stroke" />}</g>;
}

interface OrganRegion { id: string; cx: number; cy: number; r: number; hitR: number; haloX: number; haloY: number; labelX: number; labelY: number; labelAnchor: 'start' | 'end' | 'middle'; calloutX: number; calloutY: number; calloutBend: number }
function organRegion(id: string, cx: number, cy: number, r: number, hitR: number, haloX: number, haloY: number, labelAnchor: OrganRegion['labelAnchor'], calloutDx: number, calloutDy: number): OrganRegion {
  const labelOffset = labelAnchor === 'start' ? 7 : labelAnchor === 'end' ? -7 : 0;
  const calloutX = clamp(cx + calloutDx, 5, 66);
  return { id, cx: round(cx), cy: round(cy), r, hitR, haloX, haloY, labelX: round(cx + labelOffset), labelY: round(cy + (labelAnchor === 'middle' ? -5 : 1)), labelAnchor, calloutX: round(calloutX), calloutY: round(clamp(cy + calloutDy, 12, 184)), calloutBend: calloutX >= cx ? 6 : -6 };
}

const ORGAN_REGIONS: OrganRegion[] = [
  organRegion('brain', 53.1, 18.7, 2.4, 6.4, 8.5, 6.8, 'middle', 9, -8),
  organRegion('thyroid', 53.1, 42.0, 1.55, 4.6, 4.8, 3.6, 'start', 8, -2),
  organRegion('lungs', 52.4, 61.0, 2.5, 8.8, 12.0, 9.4, 'end', -20, -3),
  organRegion('heart', 49.8, 70.1, 2.35, 6.2, 6.8, 5.5, 'end', -18, 1),
  organRegion('breast', 59.2, 61.6, 1.75, 5.4, 5.6, 4.5, 'start', 10, -2),
  organRegion('liver', 45.4, 82.4, 2.95, 7.6, 10.8, 6.1, 'end', -20, 0),
  organRegion('stomach', 58.0, 83.6, 2.2, 6.2, 6.8, 5.4, 'start', 9, -1),
  organRegion('spleen', 63.6, 85.6, 1.55, 4.8, 4.6, 3.8, 'start', 8, 1),
  organRegion('pancreas', 53.8, 91.0, 1.9, 6.8, 8.2, 3.6, 'start', 9, 1),
  organRegion('kidney', 42.8, 100.4, 2.15, 6.2, 6.2, 7.4, 'end', -17, 2),
  organRegion('intestine', 52.8, 111.7, 3.25, 8.4, 10.6, 9.6, 'start', 11, 3),
  organRegion('skin', 21.8, 116.0, 1.45, 6.6, 5.4, 5.6, 'end', -10, 1),
  organRegion('adipose', 56.2, 127.8, 2.65, 7.8, 10.4, 8.2, 'start', 12, 3),
  organRegion('bone_marrow', 43.5, 147.6, 2.1, 6.2, 5.8, 9.0, 'end', -17, 4),
  organRegion('muscle', 52.5, 166.8, 2.85, 8.6, 11.6, 9.2, 'start', 12, 4),
];

const NETWORK_EDGES = [
  { id: 'gut-liver', source: 'intestine', target: 'liver', kind: 'activation', curve: -10, speed: 4.8 },
  { id: 'liver-pancreas', source: 'liver', target: 'pancreas', kind: 'feedback', curve: 8, speed: 5.5 },
  { id: 'pancreas-muscle', source: 'pancreas', target: 'muscle', kind: 'activation', curve: -8, speed: 5.1 },
  { id: 'adipose-liver', source: 'adipose', target: 'liver', kind: 'activation', curve: -15, speed: 4.2 },
  { id: 'adipose-heart', source: 'adipose', target: 'heart', kind: 'crosstalk', curve: -12, speed: 6.0 },
  { id: 'lungs-heart', source: 'lungs', target: 'heart', kind: 'activation', curve: 5, speed: 4.6 },
  { id: 'brain-liver', source: 'brain', target: 'liver', kind: 'feedback', curve: -18, speed: 7.1 },
  { id: 'liver-kidney', source: 'liver', target: 'kidney', kind: 'crosstalk', curve: 8, speed: 5.8 },
  { id: 'marrow-spleen', source: 'bone_marrow', target: 'spleen', kind: 'activation', curve: 16, speed: 5.3 },
  { id: 'muscle-liver', source: 'muscle', target: 'liver', kind: 'feedback', curve: 17, speed: 6.4 },
] as const;

function curvedPath(source: OrganRegion, target: OrganRegion, curve: number) { const midX = (source.cx + target.cx) / 2; const midY = (source.cy + target.cy) / 2; const dx = target.cx - source.cx; const dy = target.cy - source.cy; const length = Math.max(1, Math.hypot(dx, dy)); return `M ${source.cx} ${source.cy} Q ${(midX + (-dy / length) * curve).toFixed(1)} ${(midY + (dx / length) * curve).toFixed(1)} ${target.cx} ${target.cy}`; }
function svgPoint(svg: SVGSVGElement | null, clientX: number, clientY: number): Point | null { if (!svg) return null; const point = svg.createSVGPoint(); point.x = clientX; point.y = clientY; const matrix = svg.getScreenCTM(); if (!matrix) return null; const converted = point.matrixTransform(matrix.inverse()); return { x: converted.x, y: converted.y }; }
function toAtlasPoint(point: Point, view: AtlasView): Point {
  return {
    x: (point.x - VIEW_BOX.width / 2 - view.panX) / view.zoom + VIEW_BOX.width / 2,
    y: (point.y - VIEW_BOX.height / 2 - view.panY) / view.zoom + VIEW_BOX.height / 2,
  };
}
function clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)); }
function round(value: number) { return Math.round(value * 10) / 10; }
function atlasStateColor(state: ActivationState | undefined): string { switch (state) { case 'up': return 'hsl(26 100% 68%)'; case 'dysregulated': return 'hsl(350 92% 70%)'; case 'down': return 'hsl(202 100% 70%)'; case 'baseline': return 'hsl(152 70% 62%)'; case 'neutral': default: return 'hsl(188 100% 74%)'; } }
function stateCopy(state: ActivationState) { switch (state) { case 'up': return 'Activated pathway pressure'; case 'down': return 'Suppressed system signal'; case 'dysregulated': return 'Dysregulated tissue state'; case 'baseline': return 'Stabilised reference state'; default: return 'Contextual biology signal'; } }
