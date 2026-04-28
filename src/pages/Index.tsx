import { useMemo, useState } from 'react';
import {
  Activity,
  Atom,
  Bell,
  CircleDot,
  Droplet,
  Flame,
  Gauge,
  Network,
  Pill,
  Play,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Zap,
} from 'lucide-react';
import { BodyModel } from '@/components/BodyModel';
import { GENE_BY_ID, METABOLIC_PATHWAY_LAYERS, PATHWAY_BY_ID, PROGRAMS, TISSUE_BY_ID } from '@/atlas/data';
import { ActivationState, ProgramEffect } from '@/atlas/types';
import { stateColor, stateLabel, useAtlas } from '@/atlas/useAtlas';

const PARAMETER_CONTROLS = [
  { id: 'inflammation', label: 'Inflammation', icon: Flame, value: 0.68, low: 'Low', high: 'High' },
  { id: 'insulin', label: 'Insulin Sensitivity', icon: Droplet, value: 0.32, low: 'Low', high: 'High', inverse: true },
  { id: 'oxidative', label: 'Oxidative Stress', icon: CircleDot, value: 0.71, low: 'Low', high: 'High' },
  { id: 'mitochondrial', label: 'Mitochondrial Function', icon: Atom, value: 0.44, low: 'Low', high: 'High', inverse: true },
  { id: 'adiposity', label: 'Adiposity', icon: Gauge, value: 0.62, low: 'Low', high: 'Elevated' },
  { id: 'burden', label: 'Tumor Burden', icon: Network, value: 0.18, low: 'Low', high: 'High' },
];

const INTERVENTIONS = [
  {
    name: 'Metformin',
    subtitle: 'Biguanide',
    targets: ['Liver', 'AMPK'],
    mechanisms: ['AMPK activation', 'Hepatic gluconeogenesis down'],
    impact: ['Glucose output ↓', 'Insulin sensitivity ↑'],
    score: 0.72,
  },
  {
    name: 'Resmetirom',
    subtitle: 'THR-β agonist',
    targets: ['Liver', 'THR-β'],
    mechanisms: ['Lipid oxidation ↑', 'Hepatic fat ↓'],
    impact: ['Liver fat ↓', 'Inflammation ↓'],
    score: 0.68,
  },
  {
    name: 'Empagliflozin',
    subtitle: 'SGLT2 inhibitor',
    targets: ['Kidney', 'SGLT2'],
    mechanisms: ['Glucosuria ↑', 'Plasma glucose ↓'],
    impact: ['Glucose ↓', 'CV risk ↓'],
    score: 0.61,
  },
];

const RESPONSE_SERIES = [
  { label: 'Inflammation', delta: -0.36, trend: [80, 76, 72, 68, 59, 54, 47, 42, 38] },
  { label: 'Liver Fat', delta: -0.27, trend: [78, 77, 75, 72, 69, 62, 56, 52, 49] },
  { label: 'Insulin Sensitivity', delta: 0.41, trend: [28, 31, 36, 42, 50, 57, 66, 74, 82] },
  { label: 'Oxidative Stress', delta: -0.29, trend: [82, 79, 73, 68, 60, 55, 47, 42, 37] },
];

export default function Index() {
  const atlas = useAtlas('healthy_baseline');
  const { program, view, focus } = atlas;
  const [hoveredTissue, setHoveredTissue] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedInterventions, setSelectedInterventions] = useState<Set<string>>(() => new Set(['Metformin']));
  const [controlValues, setControlValues] = useState<Record<string, number>>(
    Object.fromEntries(PARAMETER_CONTROLS.map((control) => [control.id, control.value])),
  );

  const selectedTissueId = focus.kind === 'tissue' ? focus.id : null;
  const sortedTissues = [...view.tissueEffects.values()].sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
  const sortedPathways = [...view.pathwayEffects.values()].sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
  const sortedGenes = [...view.geneEffects.values()].sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
  const activePathwayIds = useMemo(() => new Set(sortedPathways.map((pathway) => pathway.ref)), [sortedPathways]);
  const selectedMetabolicLayer = useMemo(
    () => (focus.kind === 'pathway' && focus.id ? METABOLIC_PATHWAY_LAYERS.find((layer) => layer.id === focus.id) : null),
    [focus],
  );
  const inspectedMetabolicLayer = selectedMetabolicLayer ?? METABOLIC_PATHWAY_LAYERS.find((layer) => activePathwayIds.has(layer.id)) ?? METABOLIC_PATHWAY_LAYERS[0];
  const inspectedPathwayEffect = inspectedMetabolicLayer ? view.pathwayEffects.get(inspectedMetabolicLayer.id) : undefined;
  const dashboardTissueEffects = useMemo(
    () => blendControlPressure(view.tissueEffects, controlValues, selectedInterventions),
    [view.tissueEffects, controlValues, selectedInterventions],
  );

  return (
    <main className="min-h-screen overflow-hidden bg-[#03101f] text-foreground">
      <div className="fixed inset-0 -z-10 bg-gradient-mesh opacity-80" />
      <div className="fixed inset-0 -z-10 grid-bg opacity-[0.055]" />

      <header className="h-[66px] border-b border-cyan-200/10 bg-[#041426]/92 backdrop-blur-xl">
        <div className="flex h-full items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-primary/35 bg-primary/[0.08] shadow-glow">
              <Atom className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-display text-xl leading-none text-foreground">BioNexus</div>
              <div className="mono mt-1 text-[9px] uppercase tracking-[0.28em] text-muted-foreground">systems biology platform</div>
            </div>
          </div>

          <nav className="hidden items-center gap-8 lg:flex">
            {['Dashboard', 'Explorer', 'Pathways', 'Interventions', 'Simulations', 'Reports'].map((item) => (
              <button
                key={item}
                className={activeTab === item ? 'dashboard-nav-item is-active' : 'dashboard-nav-item'}
                type="button"
                onClick={() => setActiveTab(item)}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden h-10 min-w-[330px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 text-xs text-muted-foreground md:flex">
              <Search className="h-4 w-4" />
              Search genes, pathways, tissues...
            </div>
            <button className="rounded-full p-2 text-muted-foreground transition-smooth hover:bg-white/[0.05] hover:text-foreground" type="button">
              <Bell className="h-5 w-5" />
            </button>
            <button className="h-9 w-9 rounded-full border border-primary/35 bg-primary/10 font-mono text-xs text-primary" type="button">DR</button>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-66px)] gap-3 p-3 xl:grid-cols-[420px_minmax(680px,1fr)_520px]">
        <aside className="grid min-h-0 gap-3 xl:grid-rows-[auto_minmax(0,1fr)]">
          <section className="dashboard-panel p-4">
            <PanelChrome icon={SlidersHorizontal} title="Parameter Controls" action="Reset" onAction={() => setControlValues(Object.fromEntries(PARAMETER_CONTROLS.map((control) => [control.id, control.value])))} />
            <div className="mt-4 space-y-4">
              {PARAMETER_CONTROLS.map((control) => (
                <ParameterControl
                  key={control.id}
                  control={control}
                  value={controlValues[control.id]}
                  onChange={(value) => setControlValues((current) => ({ ...current, [control.id]: value }))}
                />
              ))}
            </div>
          </section>

          <section className="dashboard-panel min-h-0 p-4">
            <PanelChrome title="Affected Tissues" action="Ranked" />
            <div className="mt-4 max-h-[calc(100vh-560px)] min-h-[340px] space-y-2 overflow-y-auto pr-1">
              {sortedTissues.map((effect, index) => {
                const tissue = TISSUE_BY_ID[effect.ref];
                if (!tissue) return null;
                return (
                  <RankedTissueRow
                    key={effect.ref}
                    rank={index + 1}
                    effect={effect}
                    name={tissue.name}
                    system={tissue.system}
                    active={selectedTissueId === effect.ref}
                    onSelect={() => atlas.focusTissue(effect.ref)}
                    onHover={(hover) => setHoveredTissue(hover ? effect.ref : null)}
                  />
                );
              })}
            </div>
          </section>
        </aside>

        <section className="dashboard-panel relative min-h-[780px] overflow-hidden">
          <div className="flex h-12 items-center justify-between border-b border-white/[0.07] px-4">
            <div className="flex items-center gap-2">
              <span className="eyebrow">Body Atlas</span>
              <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{activeTab} module</span>
            </div>
            <Legend />
          </div>

          <div className="relative mx-auto h-[calc(100%-140px)] max-h-[780px] min-h-[590px] w-full">
            <BodyModel
              tissueEffects={dashboardTissueEffects}
              hoveredTissue={hoveredTissue}
              selectedTissue={selectedTissueId}
              onHover={setHoveredTissue}
              onSelect={atlas.focusTissue}
            />
          </div>

          <div className="absolute bottom-3 left-3 right-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_390px]">
            <section className="rounded-2xl border border-white/[0.08] bg-[#06182a]/88 p-4 backdrop-blur-xl">
              <div className="eyebrow">System Insight</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {program.narrative} Parameters modulate tissue pressure and pathway flux against a healthy baseline before interventions are simulated.
              </p>
            </section>
            <section className="grid grid-cols-4 gap-2">
              <ScoreCard label="Network Entropy" value="+18%" tone="danger" />
              <ScoreCard label="Inflammatory Tone" value="+0.42" tone="cyan" />
              <ScoreCard label="Metabolic Flexibility" value="-0.31" tone="warning" />
              <ScoreCard label="System Stability" value="-12%" tone="danger" />
            </section>
          </div>
        </section>

        <aside className="grid min-h-0 gap-3 xl:grid-rows-[minmax(260px,0.86fr)_minmax(210px,0.62fr)_minmax(210px,0.62fr)]">
          <section className="dashboard-panel min-h-0 p-4">
            <PanelChrome title={`Pathways`} action={`${sortedPathways.length} active`} />
            <div className="mt-4 space-y-2 overflow-y-auto pr-1">
              {sortedPathways.slice(0, 8).map((effect) => {
                const pathway = PATHWAY_BY_ID[effect.ref];
                if (!pathway) return null;
                return (
                  <PathwayRow
                    key={effect.ref}
                    effect={effect}
                    name={pathway.name}
                    category={pathway.category}
                    active={focus.kind === 'pathway' && focus.id === effect.ref}
                    onSelect={() => atlas.focusPathway(effect.ref)}
                  />
                );
              })}
            </div>
          </section>

          <section className="dashboard-panel min-h-0 p-4">
            <PanelChrome title="Drug Interventions" action={`${selectedInterventions.size} selected`} />
            <div className="mt-4 space-y-2 overflow-y-auto pr-1">
              {INTERVENTIONS.map((intervention) => (
                <InterventionCard
                  key={intervention.name}
                  intervention={intervention}
                  selected={selectedInterventions.has(intervention.name)}
                  onToggle={() => {
                    setActiveTab('Interventions');
                    setSelectedInterventions((current) => {
                      const next = new Set(current);
                      if (next.has(intervention.name)) next.delete(intervention.name);
                      else next.add(intervention.name);
                      return next;
                    });
                  }}
                />
              ))}
            </div>
          </section>

          <section className="dashboard-panel min-h-0 p-4">
            <PanelChrome title="System Response" action="Predicted vs baseline" />
            <div className="mt-4 grid grid-cols-2 gap-2">
              {RESPONSE_SERIES.map((series) => (
                <ResponseCard key={series.label} series={series} />
              ))}
            </div>
          </section>
        </aside>
      </div>

      <section className="border-t border-cyan-200/10 bg-[#041426]/92 px-4 py-3">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="mono text-[11px] leading-5 text-muted-foreground">
            Model: Human Whole-Body v2.3<br />
            Data: Multi-Omics · 28,541 Samples
          </div>
          <div className="flex items-center justify-center gap-8 text-xs text-muted-foreground">
            <span>Active module: <span className="text-primary">{activeTab}</span></span>
            <span>Active program: <span className="text-primary">{program.name}</span></span>
            <span>Genes: <span className="text-foreground">{sortedGenes.length}</span></span>
            <span>Confidence: <span className="text-emerald-300">High</span></span>
          </div>
          <div className="flex items-center justify-end gap-4">
            <span className="text-xs text-muted-foreground">Simulation Mode</span>
            <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary/35 bg-primary/15 px-5 text-sm font-semibold text-primary transition-smooth hover:bg-primary/20" type="button">
              <Play className="h-4 w-4 fill-current" />
              Run Simulation
            </button>
          </div>
        </div>
      </section>

      <section className="px-3 pb-3">
        {inspectedMetabolicLayer && (
          <PathwayFlowPanel layer={inspectedMetabolicLayer} effect={inspectedPathwayEffect} />
        )}
      </section>
    </main>
  );
}

function PanelChrome({ icon: Icon, title, action, onAction }: { icon?: typeof Activity; title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        <div className="eyebrow">{title}</div>
      </div>
      {action && (
        <button type="button" onClick={onAction} className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground transition-smooth hover:text-foreground">
          {onAction && <RotateCcw className="h-3 w-3" />}
          {action}
        </button>
      )}
    </div>
  );
}

function ParameterControl({
  control,
  value,
  onChange,
}: {
  control: (typeof PARAMETER_CONTROLS)[number];
  value: number;
  onChange: (value: number) => void;
}) {
  const severity = control.inverse ? 1 - value : value;
  const label = severity > 0.66 ? control.high : severity > 0.38 ? 'Moderate' : control.low;
  const color = severity > 0.66 ? 'text-rose-300' : severity > 0.38 ? 'text-amber-300' : 'text-emerald-300';

  return (
    <div className="grid grid-cols-[34px_1fr_58px_68px] items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/15 bg-primary/[0.07] text-primary">
        <control.icon className="h-4 w-4" />
      </div>
      <label className="min-w-0">
        <div className="truncate text-xs font-medium text-foreground">{control.label}</div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="atlas-slider mt-2 w-full"
        />
      </label>
      <div className="rounded-lg border border-white/10 bg-white/[0.035] px-2 py-1 text-center font-mono text-xs text-foreground">
        {value.toFixed(2)}
      </div>
      <div className={`text-xs font-medium ${color}`}>{label}</div>
    </div>
  );
}

function RankedTissueRow({
  rank,
  name,
  system,
  effect,
  active,
  onSelect,
  onHover,
}: {
  rank: number;
  name: string;
  system: string;
  effect: ProgramEffect;
  active: boolean;
  onSelect: () => void;
  onHover: (hover: boolean) => void;
}) {
  const color = stateColor(effect.state);
  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={`dashboard-row w-full text-left ${active ? 'is-active' : ''}`}
    >
      <div className="w-7 text-center font-mono text-sm" style={{ color }}>{rank}</div>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-white/[0.035]" style={{ borderColor: color, color }}>
        <Activity className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-foreground">{name}</div>
        <div className="truncate text-[10px] text-muted-foreground">{system}</div>
      </div>
      <span className="rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.12em]" style={{ borderColor: color, color }}>
        {stateLabel(effect.state)}
      </span>
      <div className="w-10 text-right font-mono text-xs" style={{ color }}>{(effect.weight ?? 0).toFixed(2)}</div>
    </button>
  );
}

function PathwayRow({
  effect,
  name,
  category,
  active,
  onSelect,
}: {
  effect: ProgramEffect;
  name: string;
  category: string;
  active: boolean;
  onSelect: () => void;
}) {
  const color = stateColor(effect.state);
  const spark = makeSparkline(effect.weight ?? 0.5);
  return (
    <button type="button" onClick={onSelect} className={`dashboard-row w-full text-left ${active ? 'is-active' : ''}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-white/[0.035]" style={{ borderColor: color, color }}>
        <Zap className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-foreground">{name}</div>
        <div className="truncate text-[10px] text-muted-foreground">{category}</div>
      </div>
      <span className="rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.12em]" style={{ borderColor: color, color }}>
        {stateLabel(effect.state)}
      </span>
      <svg viewBox="0 0 78 22" className="h-6 w-20">
        <path d={spark} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <div className="w-12 text-right font-mono text-xs" style={{ color }}>
        {signedActivation(effect)}
      </div>
    </button>
  );
}

function InterventionCard({
  intervention,
  selected,
  onToggle,
}: {
  intervention: typeof INTERVENTIONS[number];
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full rounded-2xl border p-3 text-left transition-smooth ${selected ? 'border-primary/45 bg-primary/[0.075]' : 'border-white/[0.07] bg-white/[0.03] hover:border-primary/25 hover:bg-white/[0.045]'}`}
      aria-pressed={selected}
    >
      <div className="grid grid-cols-[34px_1fr_auto] gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Pill className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">{intervention.name}</div>
          <div className="text-[10px] text-muted-foreground">{intervention.subtitle}</div>
          <div className="mt-2 grid gap-1 text-[11px] text-muted-foreground md:grid-cols-2">
            <div>{intervention.mechanisms.map((item) => <div key={item}>↓ {item}</div>)}</div>
            <div>{intervention.impact.map((item) => <div key={item}>↳ {item}</div>)}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-muted-foreground">{selected ? 'Selected' : 'Inactive'}</div>
          <div className={selected ? 'font-mono text-lg text-emerald-300' : 'font-mono text-lg text-muted-foreground/60'}>
            +{intervention.score.toFixed(2)}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {intervention.targets.map((target) => (
          <span key={target} className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            {target}
          </span>
        ))}
      </div>
    </button>
  );
}

function ResponseCard({ series }: { series: typeof RESPONSE_SERIES[number] }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs font-medium text-foreground">{series.label}</div>
          <div className={series.delta >= 0 ? 'font-mono text-xs text-emerald-300' : 'font-mono text-xs text-primary'}>
            {series.delta >= 0 ? '↑' : '↓'} {series.delta > 0 ? '+' : ''}{series.delta.toFixed(2)}
          </div>
        </div>
        <Sparkline points={series.trend} />
      </div>
    </div>
  );
}

function ScoreCard({ label, value, tone }: { label: string; value: string; tone: 'danger' | 'cyan' | 'warning' }) {
  const color = tone === 'danger' ? 'text-rose-300' : tone === 'warning' ? 'text-amber-300' : 'text-primary';
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className={`mt-1 font-mono text-lg ${color}`}>{value}</div>
      <div className="text-[10px] text-muted-foreground">vs. baseline</div>
    </div>
  );
}

function Legend() {
  const items: { label: string; state: ActivationState }[] = [
    { label: 'Healthy', state: 'baseline' },
    { label: 'Activated', state: 'up' },
    { label: 'Suppressed', state: 'down' },
    { label: 'Dysregulated', state: 'dysregulated' },
  ];
  return (
    <div className="hidden items-center gap-4 md:flex">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: stateColor(item.state), boxShadow: `0 0 8px ${stateColor(item.state)}` }} />
          {item.label}
        </div>
      ))}
    </div>
  );
}

function PathwayFlowPanel({
  layer,
  effect,
}: {
  layer: typeof METABOLIC_PATHWAY_LAYERS[number];
  effect?: ProgramEffect;
}) {
  const baseline = layer.baselineFlux ?? inferBaseline(layer);
  const reactionFactor = effectToFactor(effect);
  const reactions = layer.reactions?.length ? layer.reactions : inferReactions(layer, baseline, reactionFactor);
  const currentFlux = baseline.value * reactionFactor;
  const delta = (reactionFactor - 1) * 100;

  return (
    <div className="pathway-flow-panel">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.78fr)_minmax(420px,1.22fr)]">
        <div>
          <div className="eyebrow">Healthy Reference Pathway</div>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <h3 className="font-display text-2xl text-foreground">{layer.name}</h3>
            <span className="status-chip">{layer.compartment}</span>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{layer.summary}</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <FluxMetric label="Normal" value={baseline.value.toFixed(1)} unit={baseline.unit} />
            <FluxMetric label="Current" value={currentFlux.toFixed(1)} unit={baseline.unit} />
            <FluxMetric label="Delta" value={`${delta >= 0 ? '+' : ''}${delta.toFixed(0)}%`} unit="vs healthy" />
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">{baseline.context}</p>
        </div>

        <div className="space-y-2">
          {reactions.map((reaction, index) => {
            const currentMoles = reaction.healthyMoles * reaction.currentFactor;
            const reactionDelta = (reaction.currentFactor - 1) * 100;
            const width = Math.max(12, Math.min(100, reaction.currentFactor * 58));

            return (
              <div key={reaction.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-mono text-[11px] text-foreground">
                      {reaction.from.join(' + ')} <span className="text-primary">→</span> {reaction.to.join(' + ')}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {reaction.enzyme} · {reaction.stoichiometry}
                    </div>
                  </div>
                  <div className="text-right font-mono text-[10px] text-muted-foreground">
                    <div className="text-foreground">{currentMoles.toFixed(2)} {reaction.unit}</div>
                    <div>{reactionDelta >= 0 ? '+' : ''}{reactionDelta.toFixed(0)}% flux</div>
                  </div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${width}%` }} />
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{reaction.note}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FluxMetric({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-xl leading-none text-foreground">{value}</div>
      <div className="mt-1 text-[10px] text-muted-foreground">{unit}</div>
    </div>
  );
}

function Sparkline({ points }: { points: number[] }) {
  const d = points
    .map((point, index) => {
      const x = (index / Math.max(1, points.length - 1)) * 90;
      const y = 46 - (point / 100) * 40;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg viewBox="0 0 90 48" className="h-12 w-24">
      <path d={d} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function blendControlPressure(base: Map<string, ProgramEffect>, controls: Record<string, number>, selectedInterventions: Set<string>) {
  const next = new Map(base);
  const interventionRelief =
    (selectedInterventions.has('Metformin') ? 0.12 : 0) +
    (selectedInterventions.has('Resmetirom') ? 0.1 : 0) +
    (selectedInterventions.has('Empagliflozin') ? 0.08 : 0);
  const pressure =
    controls.inflammation * 0.2 +
    controls.oxidative * 0.18 +
    controls.adiposity * 0.16 +
    (1 - controls.insulin) * 0.16 +
    (1 - controls.mitochondrial) * 0.16 +
    controls.burden * 0.14;

  const overlays: Record<string, number> = {
    liver: controls.inflammation * 0.2 + controls.adiposity * 0.26 + (1 - controls.insulin) * 0.2,
    adipose: controls.adiposity * 0.38 + controls.inflammation * 0.16,
    muscle: (1 - controls.insulin) * 0.28 + (1 - controls.mitochondrial) * 0.22,
    pancreas: (1 - controls.insulin) * 0.22 + controls.oxidative * 0.16,
    heart: controls.oxidative * 0.18 + (1 - controls.mitochondrial) * 0.24,
    brain: controls.inflammation * 0.16 + controls.oxidative * 0.14,
  };

  Object.entries(overlays).forEach(([ref, value]) => {
    const original = next.get(ref);
    const relief =
      (selectedInterventions.has('Metformin') && ['liver', 'muscle', 'pancreas'].includes(ref) ? 0.14 : 0) +
      (selectedInterventions.has('Resmetirom') && ['liver', 'adipose'].includes(ref) ? 0.13 : 0) +
      (selectedInterventions.has('Empagliflozin') && ['kidney', 'heart', 'liver'].includes(ref) ? 0.1 : 0);
    const weight = Math.min(1, Math.max(original?.weight ?? 0.18, value + pressure * 0.28 - relief - interventionRelief * 0.18));
    const state: ActivationState = weight > 0.68 ? 'dysregulated' : weight > 0.42 ? 'up' : original?.state ?? 'baseline';
    next.set(ref, { ref, state, weight, note: original?.note });
  });

  return next;
}

function inferBaseline(layer: typeof METABOLIC_PATHWAY_LAYERS[number]) {
  const averageFlux = layer.tissueFlux.reduce((sum, flux) => sum + flux.synthesisRate, 0) / Math.max(1, layer.tissueFlux.length);
  return {
    value: Math.round((45 + averageFlux * 85) * 10) / 10,
    unit: 'nmol/min/g tissue',
    context: 'Reference range is a normalized healthy adult baseline for comparative visualization, not a patient-specific lab value.',
  };
}

function inferReactions(
  layer: typeof METABOLIC_PATHWAY_LAYERS[number],
  baseline: { value: number; unit: string; context: string },
  reactionFactor: number,
) {
  const metabolites = layer.metabolites.length > 1 ? layer.metabolites : [layer.name, 'Product'];
  return metabolites.slice(0, -1).map((metabolite, index) => {
    const next = metabolites[index + 1];
    const taper = Math.max(0.52, 1 - index * 0.08);
    return {
      id: `${layer.id}-${index}`,
      from: [metabolite],
      to: [next],
      enzyme: layer.enzymes[index % Math.max(1, layer.enzymes.length)] ?? 'enzyme set',
      stoichiometry: `1 ${metabolite} -> 1 ${next}`,
      healthyMoles: baseline.value * taper,
      currentFactor: reactionFactor * (1 + Math.sin(index + 1) * 0.04),
      unit: baseline.unit,
      note: `${layer.category} step ${index + 1}; current signal is shown against the healthy reference flux.`,
    };
  });
}

function effectToFactor(effect?: ProgramEffect) {
  if (!effect || effect.state === 'baseline' || effect.state === 'neutral') return 1;
  const weight = effect.weight ?? 0.55;
  if (effect.state === 'up') return 1 + weight * 0.55;
  if (effect.state === 'down') return Math.max(0.22, 1 - weight * 0.55);
  return 1 + weight * 0.28;
}

function signedActivation(effect: ProgramEffect) {
  const magnitude = effect.weight ?? 0;
  const sign = effect.state === 'down' ? '-' : '+';
  return `${sign}${(magnitude * 2.1).toFixed(2)}`;
}

function makeSparkline(weight: number) {
  return Array.from({ length: 16 }, (_, index) => {
    const x = (index / 15) * 76;
    const y = 12 - Math.sin(index * 1.7 + weight * 4) * 4 + (1 - weight) * 5 + Math.cos(index * 0.8) * 1.5;
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${Math.max(2, Math.min(20, y)).toFixed(1)}`;
  }).join(' ');
}
