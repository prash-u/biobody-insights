import { useMemo, useState } from 'react';
import {
  Activity,
  Atom,
  BrainCircuit,
  Dna,
  FlaskConical,
  GitBranch,
  Layers3,
  LineChart,
  Orbit,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { BodyModel } from '@/components/BodyModel';
import { EntityRow } from '@/components/EntityRow';
import { ProgramSelector } from '@/components/ProgramSelector';
import { GENE_BY_ID, METABOLIC_PATHWAY_LAYERS, METABOLIC_ROUTES, PATHWAY_BY_ID, PROGRAMS, TISSUE_BY_ID } from '@/atlas/data';
import { stateColor, stateLabel, useAtlas } from '@/atlas/useAtlas';

export default function Index() {
  const atlas = useAtlas();
  const { program, view, focus } = atlas;
  const [hoveredTissue, setHoveredTissue] = useState<string | null>(null);

  const selectedTissueId = focus.kind === 'tissue' ? focus.id : null;
  const sortedTissues = [...view.tissueEffects.values()].sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
  const sortedPathways = [...view.pathwayEffects.values()].sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
  const sortedGenes = [...view.geneEffects.values()].sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));

  const activePathwayIds = useMemo(() => new Set(sortedPathways.map((p) => p.ref)), [sortedPathways]);
  const selectedMetabolicLayer = useMemo(
    () => (focus.kind === 'pathway' && focus.id ? METABOLIC_PATHWAY_LAYERS.find((layer) => layer.id === focus.id) : null),
    [focus],
  );
  const inspectedMetabolicLayer = selectedMetabolicLayer ?? METABOLIC_PATHWAY_LAYERS.find((layer) => activePathwayIds.has(layer.id)) ?? METABOLIC_PATHWAY_LAYERS[0];
  const inspectedPathwayEffect = inspectedMetabolicLayer ? view.pathwayEffects.get(inspectedMetabolicLayer.id) : undefined;
  const activeRoutes = METABOLIC_ROUTES
    .map((route) => ({
      ...route,
      activeCount: route.pathways.filter((id) => activePathwayIds.has(id)).length,
    }))
    .sort((a, b) => b.activeCount - a.activeCount);

  const focusedEntity = (() => {
    if (focus.kind === 'tissue' && focus.id) return { kind: 'Tissue', ...TISSUE_BY_ID[focus.id] };
    if (focus.kind === 'pathway' && focus.id) return { kind: 'Pathway', ...PATHWAY_BY_ID[focus.id] };
    if (focus.kind === 'gene' && focus.id) return { kind: 'Gene / Protein', ...GENE_BY_ID[focus.id] };
    return null;
  })();

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <div className="fixed inset-0 -z-10 bg-gradient-mesh pointer-events-none" />
      <div className="fixed inset-0 -z-10 grid-bg opacity-[0.045] pointer-events-none" />

      <header className="relative z-10 border-b border-white/[0.06] bg-background/45 backdrop-blur-xl">
        <div className="container flex h-16 max-w-[1480px] items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Atom className="h-5 w-5 text-primary-foreground" strokeWidth={2.4} />
              <span className="absolute inset-0 rounded-xl bg-primary/20 animate-pulse-soft" />
            </div>
            <div>
              <div className="font-display text-base leading-none text-foreground">
                Body Pulse <span className="text-gradient">Atlas</span>
              </div>
              <div className="mono mt-0.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                translational systems biology
              </div>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-xs text-muted-foreground md:flex">
            <a href="#atlas" className="transition-smooth hover:text-foreground">Atlas</a>
            <a href="#programs" className="transition-smooth hover:text-foreground">Programs</a>
            <a href="#metabolism" className="transition-smooth hover:text-foreground">Metabolism</a>
            <span className="status-chip">Demo Mode</span>
          </nav>
        </div>
      </header>

      <section className="container max-w-[1480px] pt-5">
        <div className="glass-panel relative overflow-hidden p-5 md:p-7">
          <div className="absolute inset-0 bg-gradient-mesh opacity-70" />
          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)_minmax(300px,0.72fr)] lg:items-center">
            <div>
              <h1 className="max-w-3xl text-[clamp(2.7rem,6vw,5.9rem)] font-semibold leading-[0.92] text-foreground">
                Whole-body view of molecular consequence.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Project genes, proteins, enzymes, pathways and metabolic flux across tissues in one dark lab-grade atlas built for translational research and strategy.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#programs" className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-primary px-5 text-sm font-semibold text-primary-foreground shadow-glow transition-spring hover:scale-[1.02]">
                  <Sparkles className="h-4 w-4" />
                  Explore demo program
                </a>
                <a href="#atlas" className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-medium text-foreground transition-smooth hover:bg-white/[0.05]">
                  Open atlas
                </a>
              </div>

              <div className="mt-7 grid max-w-xl grid-cols-3 gap-3">
                <SignalMetric icon={Layers3} label="Tissues" value={String(Object.keys(TISSUE_BY_ID).length)} />
                <SignalMetric icon={Activity} label="Pathways" value={String(Object.keys(PATHWAY_BY_ID).length)} />
                <SignalMetric icon={FlaskConical} label="Metabolic layers" value={String(METABOLIC_PATHWAY_LAYERS.length)} />
              </div>
            </div>

            <div className="relative mx-auto aspect-[3/4] w-full max-w-[430px]">
              <BodyModel
                tissueEffects={view.tissueEffects}
                hoveredTissue={hoveredTissue}
                selectedTissue={selectedTissueId}
                onHover={setHoveredTissue}
                onSelect={atlas.focusTissue}
              />
            </div>

            <div className="grid gap-3">
              <div className="metric-block">
                <div className="eyebrow">Active program</div>
                <div className="mt-2 font-display text-2xl leading-tight text-foreground">{program.name}</div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{program.narrative}</p>
              </div>
              <div className="glass-panel-soft p-4">
                <MechanismChain program={program.name} tissues={sortedTissues.length} pathways={sortedPathways.length} genes={sortedGenes.length} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <CompactSignal icon={BrainCircuit} label="System focus" value={program.systemFocus} />
                <CompactSignal icon={LineChart} label="Projection" value="flux to organ" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="programs" className="relative py-8">
        <div className="container max-w-[1480px]">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl text-foreground">Disease programs</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Curated biological stories that project tissue pressure, pathway activity and gene/protein movement into the same anatomical workspace.
              </p>
            </div>
          </div>
          <ProgramSelector programs={PROGRAMS} activeId={program.id} onSelect={atlas.selectProgram} />
        </div>
      </section>

      <section id="atlas" className="relative pb-10">
        <div className="container max-w-[1480px]">
          <div className="grid gap-5 lg:grid-cols-[300px_minmax(420px,1fr)_350px]">
            <div className="glass-panel order-2 p-5 lg:order-1">
              <PanelHeader eyebrow="Affected tissues" title={`${sortedTissues.length} regions`} />
              <div className="-mr-1 max-h-[680px] space-y-1.5 overflow-y-auto pr-1">
                {sortedTissues.map((effect) => {
                  const tissue = TISSUE_BY_ID[effect.ref];
                  if (!tissue) return null;
                  return (
                    <EntityRow
                      key={effect.ref}
                      id={effect.ref}
                      name={tissue.name}
                      meta={tissue.system}
                      effect={effect}
                      active={selectedTissueId === effect.ref}
                      onClick={() => atlas.focusTissue(effect.ref)}
                      onHover={(hover) => setHoveredTissue(hover ? effect.ref : null)}
                    />
                  );
                })}
              </div>
            </div>

            <div className="glass-panel relative order-1 overflow-hidden p-5 lg:order-2">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <div className="eyebrow">Body atlas</div>
                  <div className="font-display text-lg text-foreground">{program.name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Legend />
                  {focus.id && <button onClick={atlas.clearFocus} className="status-chip transition-smooth hover:border-primary/50">Clear focus</button>}
                </div>
              </div>

              <div className="relative mx-auto aspect-[3/4] max-h-[680px]">
                <BodyModel
                  tissueEffects={view.tissueEffects}
                  hoveredTissue={hoveredTissue}
                  selectedTissue={selectedTissueId}
                  onHover={setHoveredTissue}
                  onSelect={atlas.focusTissue}
                />
              </div>

              <div className="mt-3 min-h-[76px] rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3">
                {focusedEntity ? (
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="eyebrow">{focusedEntity.kind}</span>
                      <span className="font-mono text-xs text-foreground">{focusedEntity.name}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">{focusedEntity.description}</p>
                    {selectedMetabolicLayer && (
                      <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto] md:items-center">
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {selectedMetabolicLayer.compartment} · organ pulse rate follows relative synthesis / throughput for this pathway.
                        </p>
                        <span className="status-chip">{selectedMetabolicLayer.tissueFlux.length} organs pulsing</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs leading-6 text-muted-foreground">
                    Hover or click an organ, pathway or gene to inspect where the signal lands in this program.
                  </p>
                )}
              </div>
            </div>

            <div className="order-3 space-y-5">
              <div className="glass-panel p-5">
                <PanelHeader eyebrow="Pathways" title={`${sortedPathways.length} active`} />
                <div className="-mr-1 max-h-[310px] space-y-1.5 overflow-y-auto pr-1">
                  {sortedPathways.map((effect) => {
                    const pathway = PATHWAY_BY_ID[effect.ref];
                    if (!pathway) return null;
                    return (
                      <EntityRow
                        key={effect.ref}
                        id={effect.ref}
                        name={pathway.name}
                        meta={pathway.category}
                        effect={effect}
                        active={focus.kind === 'pathway' && focus.id === effect.ref}
                        onClick={() => atlas.focusPathway(effect.ref)}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="glass-panel p-5">
                <PanelHeader eyebrow="Genes / enzymes" title={`${sortedGenes.length} dysregulated`} />
                <div className="-mr-1 max-h-[310px] space-y-1.5 overflow-y-auto pr-1">
                  {sortedGenes.map((effect) => {
                    const gene = GENE_BY_ID[effect.ref];
                    if (!gene) return null;
                    return (
                      <EntityRow
                        key={effect.ref}
                        id={effect.ref}
                        name={gene.id}
                        meta={gene.proteinClass}
                        effect={effect}
                        active={focus.kind === 'gene' && focus.id === effect.ref}
                        onClick={() => atlas.focusGene(effect.ref)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="metabolism" className="relative pb-14">
        <div className="container max-w-[1480px]">
          <div className="glass-panel p-5 md:p-7">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl text-foreground">Metabolic pathway layer</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  Poster-scale human metabolism coverage: carbon backbone, ATP formation, lipids, nucleotides, amino-acid nitrogen, cofactors, heme, redox and detox. Select any pathway to make the relevant organs pulse by relative synthesis / throughput.
                </p>
              </div>
              <span className="status-chip">{METABOLIC_PATHWAY_LAYERS.length} pathway layers · enzymes · metabolites · tissues</span>
            </div>
            <div className="mb-5">
              {inspectedMetabolicLayer && (
                <PathwayFlowPanel layer={inspectedMetabolicLayer} effect={inspectedPathwayEffect} />
              )}
            </div>
            <div className="mb-5">
              <PathwayPulseGrid
                layers={METABOLIC_PATHWAY_LAYERS}
                activePathwayIds={activePathwayIds}
                selectedId={focus.kind === 'pathway' ? focus.id : null}
                onSelect={atlas.focusPathway}
              />
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {activeRoutes.map((route) => (
                <MetabolicRouteCard key={route.id} route={route} activePathwayIds={activePathwayIds} onSelectPathway={atlas.focusPathway} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-white/[0.06] py-9">
        <div className="container flex max-w-[1480px] flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>Body Pulse Atlas · Pulse product family</div>
          <div className="mono uppercase tracking-widest">typed graph: tissue · pathway · gene · enzyme · metabolite-ready</div>
        </div>
      </footer>
    </main>
  );
}

function SignalMetric({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) {
  return (
    <div className="metric-block">
      <Icon className="mb-2 h-3.5 w-3.5 text-primary" />
      <div className="font-display text-2xl leading-none text-foreground">{value}</div>
      <div className="mono mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

function CompactSignal({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) {
  return (
    <div className="metric-block">
      <Icon className="mb-2 h-4 w-4 text-primary" />
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function MechanismChain({ program, tissues, pathways, genes }: { program: string; tissues: number; pathways: number; genes: number }) {
  const items = [
    { icon: Dna, label: 'genes', value: genes },
    { icon: GitBranch, label: 'pathways', value: pathways },
    { icon: Orbit, label: 'tissues', value: tissues },
    { icon: Zap, label: 'state', value: 'projected' },
  ];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="eyebrow">Mechanism chain</div>
        <div className="truncate text-xs text-muted-foreground">{program}</div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-2">
            <item.icon className="mb-2 h-3.5 w-3.5 text-primary" />
            <div className="font-mono text-[11px] text-foreground">{item.value}</div>
            <div className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PanelHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-3 border-b border-white/[0.06] pb-3">
      <div className="eyebrow mb-1">{eyebrow}</div>
      <div className="font-display text-base text-foreground">{title}</div>
    </div>
  );
}

function Legend() {
  const items: { label: string; state: 'baseline' | 'up' | 'down' | 'dysregulated' }[] = [
    { label: 'Base', state: 'baseline' },
    { label: 'Up', state: 'up' },
    { label: 'Down', state: 'down' },
    { label: 'Dys', state: 'dysregulated' },
  ];
  return (
    <div className="hidden h-7 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 md:flex">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: stateColor(item.state), boxShadow: `0 0 6px ${stateColor(item.state)}` }} />
          <span className="mono text-[9px] uppercase tracking-wider text-muted-foreground">{stateLabel(item.state)}</span>
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
  effect?: { state: 'up' | 'down' | 'dysregulated' | 'neutral' | 'baseline'; weight?: number };
}) {
  const baseline = layer.baselineFlux ?? inferBaseline(layer);
  const reactionFactor = effectToFactor(effect);
  const reactions = layer.reactions?.length ? layer.reactions : inferReactions(layer, baseline, reactionFactor);
  const currentFlux = baseline.value * reactionFactor;
  const delta = (reactionFactor - 1) * 100;

  return (
    <div className="pathway-flow-panel">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.86fr)_minmax(420px,1.14fr)]">
        <div>
          <div className="eyebrow">Healthy reference pathway</div>
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
                  <div
                    className="h-full rounded-full bg-gradient-primary"
                    style={{
                      width: `${width}%`,
                      opacity: 0.68 + Math.min(0.32, index * 0.04),
                    }}
                  />
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

function PathwayPulseGrid({
  layers,
  activePathwayIds,
  selectedId,
  onSelect,
}: {
  layers: typeof METABOLIC_PATHWAY_LAYERS;
  activePathwayIds: Set<string>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
      {layers.map((layer) => {
        const activeInProgram = activePathwayIds.has(layer.id);
        const selected = selectedId === layer.id;
        const primaryFlux = [...layer.tissueFlux].sort((a, b) => b.synthesisRate - a.synthesisRate)[0];
        const primaryTissue = primaryFlux ? TISSUE_BY_ID[primaryFlux.ref] : null;

        return (
          <button
            key={layer.id}
            type="button"
            onClick={() => onSelect(layer.id)}
            className={`pathway-pulse-row text-left transition-smooth ${selected ? 'is-selected' : ''}`}
          >
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-foreground">{layer.name}</div>
                <div className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {layer.compartment}
                </div>
              </div>
              <span className={activeInProgram ? 'status-chip !min-h-[22px] !px-2 text-primary' : 'status-chip !min-h-[22px] !px-2 text-muted-foreground'}>
                {activeInProgram ? 'active' : 'map'}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-primary shadow-glow"
                  style={{ width: `${Math.max(18, (primaryFlux?.synthesisRate ?? 0.25) * 100)}%` }}
                />
              </div>
              <div className="font-mono text-[10px] text-muted-foreground">
                {primaryTissue?.name ?? 'Systemic'} {Math.round((primaryFlux?.synthesisRate ?? 0) * 100)}%
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {layer.metabolites.slice(0, 4).map((metabolite) => (
                <span key={metabolite} className="rounded-full border border-white/[0.08] bg-white/[0.025] px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {metabolite}
                </span>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function MetabolicRouteCard({
  route,
  activePathwayIds,
  onSelectPathway,
}: {
  route: (typeof METABOLIC_ROUTES)[number] & { activeCount: number };
  activePathwayIds: Set<string>;
  onSelectPathway: (id: string) => void;
}) {
  return (
    <div className="glass-panel-soft p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="eyebrow">{route.tissue}</div>
          <div className="mt-1 font-display text-xl text-foreground">{route.name}</div>
        </div>
        <span className="status-chip">{route.activeCount} active</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {route.steps.map((step, index) => (
          <div key={step} className="flex items-center gap-2">
            <span className="rounded-full border border-primary/20 bg-primary/[0.06] px-2.5 py-1 font-mono text-[10px] text-foreground">{step}</span>
            {index < route.steps.length - 1 && <span className="h-px w-5 bg-primary/35" />}
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-2">
        {route.pathways.map((id) => {
          const pathway = PATHWAY_BY_ID[id];
          const isActive = activePathwayIds.has(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectPathway(id)}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-left transition-smooth hover:border-primary/35 hover:bg-primary/[0.04]"
            >
              <span className="text-xs text-foreground">{pathway?.name ?? id}</span>
              <span className={isActive ? 'text-[10px] uppercase tracking-widest text-primary' : 'text-[10px] uppercase tracking-widest text-muted-foreground/60'}>
                {isActive ? 'in program' : 'available'}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {route.enzymes.map((enzyme) => (
          <span key={enzyme} className="status-chip !min-h-[24px] !px-2.5">{enzyme}</span>
        ))}
      </div>
    </div>
  );
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

function effectToFactor(effect?: { state: 'up' | 'down' | 'dysregulated' | 'neutral' | 'baseline'; weight?: number }) {
  if (!effect || effect.state === 'baseline' || effect.state === 'neutral') return 1;
  const weight = effect.weight ?? 0.55;
  if (effect.state === 'up') return 1 + weight * 0.55;
  if (effect.state === 'down') return Math.max(0.22, 1 - weight * 0.55);
  return 1 + weight * 0.28;
}
