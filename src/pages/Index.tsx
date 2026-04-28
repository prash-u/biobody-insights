import { useMemo, useState } from 'react';
import {
  Activity,
  Atom,
  Bell,
  CircleDot,
  Dna,
  Droplet,
  FileText,
  Flame,
  Gauge,
  LayoutDashboard,
  Microscope,
  Network,
  Pill,
  Play,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Zap,
} from 'lucide-react';
import { BodyModel } from '@/components/BodyModel';
import { GENE_BY_ID, METABOLIC_PATHWAY_LAYERS, PATHWAY_BY_ID, TISSUE_BY_ID } from '@/atlas/data';
import { INTERVENTION_CATEGORIES, INTERVENTIONS } from '@/atlas/interventions';
import {
  blendControlPressure,
  buildSimulationResult,
  DEFAULT_PARAMETERS,
  DEFAULT_SIMULATION_RESULT,
  PARAMETER_CONTROLS,
  pathwayOrganProjection,
  rankInterventionEffects,
  rankPathwaysFromResult,
  rankTissuesFromResult,
} from '@/atlas/simulation';
import { ActivationState, Intervention, MetabolicPathwayLayer, ObservableSeries, ProgramEffect, SimulationResult } from '@/atlas/types';
import { stateColor, stateLabel, useAtlas } from '@/atlas/useAtlas';

const CONTROL_ICONS: Record<string, typeof Flame> = {
  inflammation: Flame,
  insulin: Droplet,
  oxidative: CircleDot,
  mitochondrial: Atom,
  adiposity: Gauge,
  burden: Network,
};

const TABS = ['Dashboard', 'Explorer', 'Pathways', 'Interventions', 'Simulations', 'Reports'] as const;
type Tab = typeof TABS[number];

export default function Index() {
  const atlas = useAtlas('healthy_baseline');
  const { program, view, focus } = atlas;
  const [hoveredTissue, setHoveredTissue] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('Dashboard');
  const [selectedInterventions, setSelectedInterventions] = useState<Set<string>>(() => new Set(['metformin']));
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [controlValues, setControlValues] = useState<Record<string, number>>(DEFAULT_PARAMETERS);
  const [simulationResult, setSimulationResult] = useState<SimulationResult>(DEFAULT_SIMULATION_RESULT);

  const selectedTissueId = focus.kind === 'tissue' ? focus.id : null;
  const sortedTissues = [...view.tissueEffects.values()].sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
  const sortedPathways = [...view.pathwayEffects.values()].sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
  const sortedGenes = [...view.geneEffects.values()].sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
  const activePathwayIds = useMemo(() => new Set(sortedPathways.map((pathway) => pathway.ref)), [sortedPathways]);
  const selectedMetabolicLayer = useMemo(
    () => (focus.kind === 'pathway' && focus.id ? METABOLIC_PATHWAY_LAYERS.find((layer) => layer.id === focus.id) : null),
    [focus],
  );
  const inspectedMetabolicLayer =
    selectedMetabolicLayer ??
    METABOLIC_PATHWAY_LAYERS.find((layer) => activePathwayIds.has(layer.id)) ??
    METABOLIC_PATHWAY_LAYERS[0];
  const inspectedPathwayEffect = inspectedMetabolicLayer ? view.pathwayEffects.get(inspectedMetabolicLayer.id) : undefined;
  const dashboardTissueEffects = useMemo(
    () => blendControlPressure(view.tissueEffects, controlValues, selectedInterventions),
    [view.tissueEffects, controlValues, selectedInterventions],
  );

  const runSimulation = () => {
    const result = buildSimulationResult({
      controls: controlValues,
      selectedIds: selectedInterventions,
      focusPathwayId: focus.kind === 'pathway' ? focus.id : inspectedMetabolicLayer?.id,
    });
    setSimulationResult(result);
    setActiveTab('Simulations');
  };

  const resetHealthy = () => {
    setControlValues(DEFAULT_PARAMETERS);
    setSelectedInterventions(new Set(['metformin']));
    atlas.clearFocus();
    setSimulationResult(DEFAULT_SIMULATION_RESULT);
  };

  const toggleIntervention = (id: string) => {
    setSelectedInterventions((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const common = {
    atlas,
    sortedTissues,
    sortedPathways,
    sortedGenes,
    hoveredTissue,
    setHoveredTissue,
    selectedTissueId,
    dashboardTissueEffects,
    controlValues,
    setControlValues,
    selectedInterventions,
    toggleIntervention,
    selectedCategory,
    setSelectedCategory,
    simulationResult,
    inspectedMetabolicLayer,
    inspectedPathwayEffect,
    runSimulation,
    resetHealthy,
  };

  return (
    <main className="min-h-screen bg-[#03101f] text-foreground">
      <div className="fixed inset-0 -z-10 bg-gradient-mesh opacity-80" />
      <div className="fixed inset-0 -z-10 grid-bg opacity-[0.055]" />

      <header className="sticky top-0 z-30 h-[66px] border-b border-cyan-200/10 bg-[#041426]/95 backdrop-blur-xl">
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
            {TABS.map((item) => (
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
            <button className="h-9 w-9 rounded-full border border-primary/35 bg-primary/10 font-mono text-xs text-primary" type="button">
              DR
            </button>
          </div>
        </div>
      </header>

      {activeTab === 'Dashboard' && <DashboardView {...common} programNarrative={program.narrative} />}
      {activeTab === 'Explorer' && <ExplorerView {...common} />}
      {activeTab === 'Pathways' && <PathwaysView {...common} />}
      {activeTab === 'Interventions' && <InterventionsView {...common} />}
      {activeTab === 'Simulations' && <SimulationsView {...common} />}
      {activeTab === 'Reports' && <ReportsView {...common} programName={program.name} />}

      <FooterBar
        activeTab={activeTab}
        programName={program.name}
        geneCount={sortedGenes.length}
        selectedCount={selectedInterventions.size}
        runSimulation={runSimulation}
      />
    </main>
  );
}

type CommonProps = {
  atlas: ReturnType<typeof useAtlas>;
  sortedTissues: ProgramEffect[];
  sortedPathways: ProgramEffect[];
  sortedGenes: ProgramEffect[];
  hoveredTissue: string | null;
  setHoveredTissue: (id: string | null) => void;
  selectedTissueId: string | null;
  dashboardTissueEffects: Map<string, ProgramEffect>;
  controlValues: Record<string, number>;
  setControlValues: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  selectedInterventions: Set<string>;
  toggleIntervention: (id: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  simulationResult: SimulationResult;
  inspectedMetabolicLayer: MetabolicPathwayLayer;
  inspectedPathwayEffect?: ProgramEffect;
  runSimulation: () => void;
  resetHealthy: () => void;
};

function DashboardView(props: CommonProps & { programNarrative: string }) {
  return (
    <div className="grid min-h-[calc(100vh-122px)] gap-3 p-3 xl:grid-cols-[390px_minmax(660px,1fr)_500px]">
      <aside className="grid min-h-0 gap-3 xl:grid-rows-[auto_minmax(0,1fr)]">
        <ParameterPanel {...props} />
        <TissuePanel {...props} compact />
      </aside>

      <section className="dashboard-panel flex min-h-[760px] flex-col overflow-hidden">
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.07] px-4">
          <div className="flex items-center gap-2">
            <span className="eyebrow">Body Atlas</span>
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">interactive system map</span>
          </div>
          <Legend />
        </div>
        <div className="min-h-0 flex-1">
          <BodyModel
            tissueEffects={props.dashboardTissueEffects}
            hoveredTissue={props.hoveredTissue}
            selectedTissue={props.selectedTissueId}
            onHover={props.setHoveredTissue}
            onSelect={props.atlas.focusTissue}
          />
        </div>
        <div className="grid shrink-0 gap-3 border-t border-white/[0.07] bg-[#06182a]/80 p-3 lg:grid-cols-[minmax(0,1fr)_390px]">
          <section className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
            <div className="eyebrow">System Insight</div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {props.programNarrative} Parameters modulate tissue pressure and pathway flux against a healthy baseline before interventions are simulated.
            </p>
          </section>
          <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {props.simulationResult.observables.slice(0, 4).map((series) => (
              <ScoreCard key={series.id} label={series.label} value={formatSigned(series.delta)} tone={series.delta > 0 ? 'danger' : 'cyan'} />
            ))}
          </section>
        </div>
      </section>

      <aside className="grid min-h-0 gap-3 xl:grid-rows-[minmax(260px,0.9fr)_minmax(260px,0.9fr)_minmax(210px,0.64fr)]">
        <PathwayListPanel {...props} limit={9} />
        <InterventionSidePanel {...props} />
        <ResponsePanel result={props.simulationResult} />
      </aside>
    </div>
  );
}

function ExplorerView(props: CommonProps) {
  return (
    <WorkspaceLayout
      icon={Microscope}
      title="Explorer"
      subtitle="Inspect tissues, genes, enzymes, pathways, and cross-links from the selected biological program."
      side={<TissuePanel {...props} />}
      main={
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="dashboard-panel p-4">
            <PanelChrome icon={Network} title="Entity Cross-Link Explorer" action={`${props.sortedGenes.length} genes`} />
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {props.sortedGenes.slice(0, 18).map((effect) => {
                const gene = GENE_BY_ID[effect.ref];
                if (!gene) return null;
                return (
                  <button key={effect.ref} type="button" onClick={() => props.atlas.focusGene(effect.ref)} className="dashboard-row min-h-[86px] w-full text-left">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/25 bg-primary/[0.06] text-primary">
                      <Dna className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-foreground">{effect.ref}</div>
                      <div className="mt-1 text-[11px] text-muted-foreground">{gene.name} · {gene.proteinClass}</div>
                      <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{gene.description}</div>
                    </div>
                    <StateChip effect={effect} />
                  </button>
                );
              })}
            </div>
          </section>
          <section className="dashboard-panel p-4">
            <PanelChrome icon={Zap} title="Focused Biology" action={props.atlas.focus.kind ?? 'all'} />
            <div className="mt-4 space-y-3">
              {props.sortedPathways.slice(0, 8).map((effect) => {
                const pathway = PATHWAY_BY_ID[effect.ref];
                if (!pathway) return null;
                return <PathwayRow key={effect.ref} effect={effect} name={pathway.name} category={pathway.category} active={false} onSelect={() => props.atlas.focusPathway(effect.ref)} />;
              })}
            </div>
          </section>
        </div>
      }
    />
  );
}

function PathwaysView(props: CommonProps) {
  const categories = Array.from(new Set(METABOLIC_PATHWAY_LAYERS.map((layer) => layer.category)));
  return (
    <WorkspaceLayout
      icon={Zap}
      title="Pathways"
      subtitle="Full metabolic pathway workspace with flux, stoichiometry, organ projection, and reference-vs-current moles."
      side={
        <section className="dashboard-panel p-4">
          <PanelChrome icon={Zap} title="Metabolic Layers" action={`${METABOLIC_PATHWAY_LAYERS.length} pathways`} />
          <div className="mt-4 space-y-5 overflow-y-auto pr-1">
            {categories.map((category) => (
              <div key={category}>
                <div className="mono mb-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{category}</div>
                <div className="space-y-2">
                  {METABOLIC_PATHWAY_LAYERS.filter((layer) => layer.category === category).map((layer) => (
                    <button
                      key={layer.id}
                      type="button"
                      onClick={() => props.atlas.focusPathway(layer.id)}
                      className={`dashboard-row w-full text-left ${props.inspectedMetabolicLayer.id === layer.id ? 'is-active' : ''}`}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/25 bg-primary/[0.06] text-primary">
                        <Zap className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-foreground">{layer.name}</div>
                        <div className="truncate text-[10px] text-muted-foreground">{layer.compartment}</div>
                      </div>
                      <div className="font-mono text-xs text-primary">{layer.metabolites.length}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      }
      main={
        <div className="space-y-3">
          <PathwayFlowPanel layer={props.inspectedMetabolicLayer} effect={props.inspectedPathwayEffect} />
          <section className="dashboard-panel p-4">
            <PanelChrome icon={LayoutDashboard} title="Organ Projection" action="flux anchors" />
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {pathwayOrganProjection(props.inspectedMetabolicLayer.id).map((flux) => {
                const tissue = TISSUE_BY_ID[flux.ref];
                return (
                  <button key={flux.ref} type="button" onClick={() => props.atlas.focusTissue(flux.ref)} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 text-left transition-smooth hover:border-primary/30">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-foreground">{tissue?.name ?? flux.ref}</div>
                        <div className="text-[10px] text-muted-foreground">{flux.role}</div>
                      </div>
                      <div className="font-mono text-sm text-primary">{(flux.synthesisRate * 100).toFixed(0)}%</div>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${Math.max(8, flux.synthesisRate * 100)}%` }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      }
    />
  );
}

function InterventionsView(props: CommonProps) {
  const categories = ['All', ...INTERVENTION_CATEGORIES];
  const interventions = props.selectedCategory === 'All' ? INTERVENTIONS : INTERVENTIONS.filter((item) => item.category === props.selectedCategory);
  const rankedEffects = rankInterventionEffects(props.selectedInterventions);

  return (
    <WorkspaceLayout
      icon={Pill}
      title="Interventions"
      subtitle="Broad translational catalog with select/deselect modeling and visible opposing pathway effects."
      side={
        <section className="dashboard-panel p-4">
          <PanelChrome icon={Pill} title="Catalog Filters" action={`${props.selectedInterventions.size} selected`} />
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => props.setSelectedCategory(category)}
                className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.12em] transition-smooth ${props.selectedCategory === category ? 'border-primary/60 bg-primary/15 text-primary' : 'border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground'}`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="mt-5 space-y-2">
            {rankedEffects.slice(0, 8).map(({ intervention, effect }) => (
              <div key={`${intervention.id}-${effect.ref}`} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
                <div className="text-xs font-semibold text-foreground">{intervention.name}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">{PATHWAY_BY_ID[effect.ref]?.name ?? TISSUE_BY_ID[effect.ref]?.name ?? effect.ref}</div>
                <div className="mt-2 font-mono text-xs text-primary">{effect.direction} · {effect.magnitude.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </section>
      }
      main={
        <section className="dashboard-panel p-4">
          <PanelChrome icon={Pill} title="Selectable Intervention Catalog" action={`${INTERVENTIONS.length} compounds`} />
          <div className="mt-4 grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
            {interventions.map((intervention) => (
              <InterventionCard
                key={intervention.id}
                intervention={intervention}
                selected={props.selectedInterventions.has(intervention.id)}
                onToggle={() => props.toggleIntervention(intervention.id)}
                full
              />
            ))}
          </div>
        </section>
      }
    />
  );
}

function SimulationsView(props: CommonProps) {
  const tissueRanks = rankTissuesFromResult(props.simulationResult);
  const pathwayRanks = rankPathwaysFromResult(props.simulationResult);

  return (
    <WorkspaceLayout
      icon={Play}
      title="Simulations"
      subtitle="Deterministic mechanistic-lite propagation from healthy baseline to perturbed and intervention-modulated outputs."
      side={
        <div className="space-y-3">
          <ParameterPanel {...props} />
          <section className="dashboard-panel p-4">
            <PanelChrome icon={Play} title="Scenario Controls" action="baseline compare" />
            <div className="mt-4 grid gap-2">
              <button type="button" onClick={props.runSimulation} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-primary/35 bg-primary/15 px-5 text-sm font-semibold text-primary transition-smooth hover:bg-primary/20">
                <Play className="h-4 w-4 fill-current" />
                Run Simulation
              </button>
              <button type="button" onClick={props.resetHealthy} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-4 text-xs text-muted-foreground transition-smooth hover:text-foreground">
                <RotateCcw className="h-4 w-4" />
                Reset Healthy Reference
              </button>
            </div>
          </section>
        </div>
      }
      main={
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <section className="dashboard-panel p-4">
            <PanelChrome icon={Activity} title="Baseline vs Perturbed Time-Series" action={new Date(props.simulationResult.scenario.createdAt).toLocaleTimeString()} />
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {props.simulationResult.observables.map((series) => (
                <LargeResponseCard key={series.id} series={series} />
              ))}
            </div>
          </section>
          <section className="dashboard-panel p-4">
            <PanelChrome icon={Network} title="Ranked Simulation Shifts" action={props.simulationResult.scenario.label} />
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{props.simulationResult.summary}</p>
            <div className="mt-4 grid gap-3">
              <RankList title="Tissues" items={tissueRanks.slice(0, 8).map((item) => ({ id: item.id, label: item.tissue.name, value: item.delta }))} />
              <RankList title="Pathways" items={pathwayRanks.slice(0, 8).map((item) => ({ id: item.id, label: item.pathway.name, value: item.delta }))} />
            </div>
          </section>
        </div>
      }
    />
  );
}

function ReportsView(props: CommonProps & { programName: string }) {
  const tissueRanks = rankTissuesFromResult(props.simulationResult).slice(0, 5);
  const pathwayRanks = rankPathwaysFromResult(props.simulationResult).slice(0, 5);
  const selected = INTERVENTIONS.filter((intervention) => props.selectedInterventions.has(intervention.id));

  return (
    <WorkspaceLayout
      icon={FileText}
      title="Reports"
      subtitle="Export-ready translational narrative assembled from the active scenario, pathway map, and selected interventions."
      side={<ResponsePanel result={props.simulationResult} />}
      main={
        <section className="dashboard-panel p-6">
          <div className="eyebrow">Generated Systems Biology Report</div>
          <h2 className="mt-3 font-display text-3xl text-foreground">{props.programName} · Whole-body pathway interpretation</h2>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-muted-foreground">{props.simulationResult.summary}</p>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <ReportBlock title="Top Tissue Shifts" items={tissueRanks.map((item) => `${item.tissue.name}: ${formatSigned(item.delta)}`)} />
            <ReportBlock title="Top Pathway Shifts" items={pathwayRanks.map((item) => `${item.pathway.name}: ${formatSigned(item.delta)}`)} />
            <ReportBlock title="Selected Interventions" items={selected.map((item) => `${item.name}: ${item.subtitle}`)} />
          </div>
          <div className="mt-6 rounded-xl border border-amber-300/20 bg-amber-300/[0.05] p-4 text-xs leading-6 text-amber-100/80">
            Demo/reference model only. Outputs are deterministic educational product signals and should not be interpreted as patient-specific clinical predictions.
          </div>
        </section>
      }
    />
  );
}

function WorkspaceLayout({
  icon: Icon,
  title,
  subtitle,
  side,
  main,
}: {
  icon: typeof Activity;
  title: string;
  subtitle: string;
  side: React.ReactNode;
  main: React.ReactNode;
}) {
  return (
    <div className="grid min-h-[calc(100vh-122px)] gap-3 p-3 xl:grid-cols-[390px_minmax(0,1fr)]">
      <aside className="min-h-0">{side}</aside>
      <section className="min-h-0 space-y-3">
        <div className="dashboard-panel p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/[0.08] text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="eyebrow">{title}</div>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">{subtitle}</p>
            </div>
          </div>
        </div>
        {main}
      </section>
    </div>
  );
}

function ParameterPanel({ controlValues, setControlValues, resetHealthy }: CommonProps) {
  return (
    <section className="dashboard-panel p-4">
      <PanelChrome icon={SlidersHorizontal} title="Parameter Controls" action="Reset" onAction={resetHealthy} />
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
  );
}

function TissuePanel({ sortedTissues, selectedTissueId, atlas, setHoveredTissue, compact = false }: CommonProps & { compact?: boolean }) {
  return (
    <section className="dashboard-panel min-h-0 p-4">
      <PanelChrome title="Affected Tissues" action="Ranked" />
      <div className={compact ? 'mt-4 max-h-[calc(100vh-530px)] min-h-[300px] space-y-2 overflow-y-auto pr-1' : 'mt-4 space-y-2 overflow-y-auto pr-1'}>
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
  );
}

function PathwayListPanel({ sortedPathways, atlas, atlas: { focus }, limit = 99 }: CommonProps & { limit?: number }) {
  return (
    <section className="dashboard-panel min-h-0 p-4">
      <PanelChrome title="Pathways" action={`${sortedPathways.length} active`} />
      <div className="mt-4 space-y-2 overflow-y-auto pr-1">
        {sortedPathways.slice(0, limit).map((effect) => {
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
  );
}

function InterventionSidePanel({ selectedInterventions, toggleIntervention }: CommonProps) {
  return (
    <section className="dashboard-panel min-h-0 p-4">
      <PanelChrome title="Drug Interventions" action={`${selectedInterventions.size} selected`} />
      <div className="mt-4 space-y-2 overflow-y-auto pr-1">
        {INTERVENTIONS.slice(0, 7).map((intervention) => (
          <InterventionCard
            key={intervention.id}
            intervention={intervention}
            selected={selectedInterventions.has(intervention.id)}
            onToggle={() => toggleIntervention(intervention.id)}
          />
        ))}
      </div>
    </section>
  );
}

function ResponsePanel({ result }: { result: SimulationResult }) {
  return (
    <section className="dashboard-panel min-h-0 p-4">
      <PanelChrome title="System Response" action="Predicted vs baseline" />
      <div className="mt-4 grid grid-cols-2 gap-2">
        {result.observables.slice(0, 6).map((series) => (
          <ResponseCard key={series.id} series={series} />
        ))}
      </div>
    </section>
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
  control: typeof PARAMETER_CONTROLS[number];
  value: number;
  onChange: (value: number) => void;
}) {
  const severity = control.inverse ? 1 - value : value;
  const label = severity > 0.66 ? control.high : severity > 0.38 ? 'Moderate' : control.low;
  const color = severity > 0.66 ? 'text-rose-300' : severity > 0.38 ? 'text-amber-300' : 'text-emerald-300';
  const Icon = CONTROL_ICONS[control.id] ?? Gauge;

  return (
    <div className="grid grid-cols-[34px_1fr_58px_68px] items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/15 bg-primary/[0.07] text-primary">
        <Icon className="h-4 w-4" />
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
      <StateChip effect={effect} />
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
      <StateChip effect={effect} />
      <svg viewBox="0 0 78 22" className="hidden h-6 w-20 sm:block">
        <path d={spark} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <div className="w-12 text-right font-mono text-xs" style={{ color }}>{signedActivation(effect)}</div>
    </button>
  );
}

function InterventionCard({
  intervention,
  selected,
  onToggle,
  full = false,
}: {
  intervention: Intervention;
  selected: boolean;
  onToggle: () => void;
  full?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full rounded-xl border p-3 text-left transition-smooth ${selected ? 'border-primary/45 bg-primary/[0.075]' : 'border-white/[0.07] bg-white/[0.03] hover:border-primary/25 hover:bg-white/[0.045]'}`}
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
            <div>{intervention.mechanisms.slice(0, full ? 3 : 2).map((item) => <div key={item}>↓ {item}</div>)}</div>
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
          <span key={`${intervention.id}-${target.label}`} className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            {target.label}
          </span>
        ))}
      </div>
      {full && <p className="mt-3 text-xs leading-5 text-muted-foreground">{intervention.contraindicationNote}</p>}
    </button>
  );
}

function ResponseCard({ series }: { series: ObservableSeries }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs font-medium text-foreground">{series.label}</div>
          <div className={series.delta >= 0 ? 'font-mono text-xs text-emerald-300' : 'font-mono text-xs text-primary'}>
            {series.delta >= 0 ? '↑' : '↓'} {formatSigned(series.delta)}
          </div>
        </div>
        <Sparkline points={series.trend} />
      </div>
    </div>
  );
}

function LargeResponseCard({ series }: { series: ObservableSeries }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-foreground">{series.label}</div>
          <div className="mt-1 text-xs text-muted-foreground">Healthy {series.baseline.toFixed(2)} {series.unit} → current {series.current.toFixed(2)} {series.unit}</div>
        </div>
        <div className={series.delta >= 0 ? 'font-mono text-lg text-emerald-300' : 'font-mono text-lg text-primary'}>{formatSigned(series.delta)}</div>
      </div>
      <div className="mt-3 h-24">
        <Sparkline points={series.trend} large />
      </div>
    </div>
  );
}

function ScoreCard({ label, value, tone }: { label: string; value: string; tone: 'danger' | 'cyan' | 'warning' }) {
  const color = tone === 'danger' ? 'text-rose-300' : tone === 'warning' ? 'text-amber-300' : 'text-primary';
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.035] p-3">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className={`mt-1 font-mono text-lg ${color}`}>{value}</div>
      <div className="text-[10px] text-muted-foreground">vs. healthy</div>
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

function PathwayFlowPanel({ layer, effect }: { layer: MetabolicPathwayLayer; effect?: ProgramEffect }) {
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
          {reactions.map((reaction) => {
            const currentMoles = reaction.healthyMoles * reaction.currentFactor;
            const reactionDelta = (reaction.currentFactor - 1) * 100;
            const width = Math.max(12, Math.min(100, reaction.currentFactor * 58));
            return (
              <div key={reaction.id} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
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
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-xl leading-none text-foreground">{value}</div>
      <div className="mt-1 text-[10px] text-muted-foreground">{unit}</div>
    </div>
  );
}

function Sparkline({ points, large = false }: { points: number[]; large?: boolean }) {
  const d = points
    .map((point, index) => {
      const x = (index / Math.max(1, points.length - 1)) * 90;
      const y = 46 - (point / 100) * 40;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg viewBox="0 0 90 48" className={large ? 'h-full w-full' : 'h-12 w-24'}>
      <path d={d} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FooterBar({
  activeTab,
  programName,
  geneCount,
  selectedCount,
  runSimulation,
}: {
  activeTab: Tab;
  programName: string;
  geneCount: number;
  selectedCount: number;
  runSimulation: () => void;
}) {
  return (
    <section className="sticky bottom-0 z-20 border-t border-cyan-200/10 bg-[#041426]/95 px-4 py-3 backdrop-blur-xl">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="mono text-[11px] leading-5 text-muted-foreground">
          Model: Human Whole-Body v2.3<br />
          Data: Static demo multi-omics reference
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
          <span>Active module: <span className="text-primary">{activeTab}</span></span>
          <span>Active program: <span className="text-primary">{programName}</span></span>
          <span>Genes: <span className="text-foreground">{geneCount}</span></span>
          <span>Interventions: <span className="text-primary">{selectedCount}</span></span>
        </div>
        <div className="flex items-center justify-end gap-4">
          <span className="text-xs text-muted-foreground">Simulation Mode</span>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary/35 bg-primary/15 px-5 text-sm font-semibold text-primary transition-smooth hover:bg-primary/20" type="button" onClick={runSimulation}>
            <Play className="h-4 w-4 fill-current" />
            Run Simulation
          </button>
        </div>
      </div>
    </section>
  );
}

function StateChip({ effect }: { effect: ProgramEffect }) {
  const color = stateColor(effect.state);
  return (
    <span className="rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.12em]" style={{ borderColor: color, color }}>
      {stateLabel(effect.state)}
    </span>
  );
}

function RankList({ title, items }: { title: string; items: { id: string; label: string; value: number }[] }) {
  return (
    <div>
      <div className="eyebrow">{title}</div>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2">
            <span className="text-xs text-foreground">{item.label}</span>
            <span className={item.value >= 0 ? 'font-mono text-xs text-rose-300' : 'font-mono text-xs text-primary'}>{formatSigned(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
      <div className="eyebrow">{title}</div>
      <div className="mt-3 space-y-2">
        {(items.length ? items : ['No active items']).map((item) => (
          <div key={item} className="text-sm text-muted-foreground">{item}</div>
        ))}
      </div>
    </div>
  );
}

function inferBaseline(layer: MetabolicPathwayLayer) {
  const averageFlux = layer.tissueFlux.reduce((sum, flux) => sum + flux.synthesisRate, 0) / Math.max(1, layer.tissueFlux.length);
  return {
    value: Math.round((45 + averageFlux * 85) * 10) / 10,
    unit: 'nmol/min/g tissue',
    context: 'Reference range is a normalized healthy adult baseline for comparative visualization, not a patient-specific lab value.',
  };
}

function inferReactions(layer: MetabolicPathwayLayer, baseline: { value: number; unit: string; context: string }, reactionFactor: number) {
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

function formatSigned(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}`;
}
