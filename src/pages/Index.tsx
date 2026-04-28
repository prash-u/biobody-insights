import { useState } from 'react';
import { Activity, Atom, Dna, Layers, Sparkles } from 'lucide-react';
import { BodyModel } from '@/components/BodyModel';
import { EntityRow } from '@/components/EntityRow';
import { ProgramSelector } from '@/components/ProgramSelector';
import { GENE_BY_ID, PATHWAY_BY_ID, PROGRAMS, TISSUE_BY_ID } from '@/atlas/data';
import { stateColor, stateLabel, useAtlas } from '@/atlas/useAtlas';

export default function Index() {
  const atlas = useAtlas();
  const { program, view, focus } = atlas;
  const [hoveredTissue, setHoveredTissue] = useState<string | null>(null);

  const selectedTissueId = focus.kind === 'tissue' ? focus.id : null;
  const focusedEntity = (() => {
    if (focus.kind === 'tissue' && focus.id)  return { kind: 'Tissue',  ...TISSUE_BY_ID[focus.id]  };
    if (focus.kind === 'pathway' && focus.id) return { kind: 'Pathway', ...PATHWAY_BY_ID[focus.id] };
    if (focus.kind === 'gene' && focus.id)    return { kind: 'Gene',    ...GENE_BY_ID[focus.id]    };
    return null;
  })();

  const sortedTissues = [...view.tissueEffects.values()].sort(
    (a, b) => (b.weight ?? 0) - (a.weight ?? 0),
  );
  const sortedPathways = [...view.pathwayEffects.values()].sort(
    (a, b) => (b.weight ?? 0) - (a.weight ?? 0),
  );
  const sortedGenes = [...view.geneEffects.values()].sort(
    (a, b) => (b.weight ?? 0) - (a.weight ?? 0),
  );

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Ambient mesh */}
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none -z-10" />
      <div className="fixed inset-0 grid-bg opacity-[0.04] pointer-events-none -z-10" />

      {/* ============= NAV ============= */}
      <header className="relative z-10 border-b border-white/[0.06] backdrop-blur-xl bg-background/40">
        <div className="container max-w-[1400px] flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Atom className="h-5 w-5 text-primary-foreground" strokeWidth={2.4} />
              <span className="absolute inset-0 rounded-xl animate-pulse-soft bg-primary/20" />
            </div>
            <div>
              <div className="font-display text-base leading-none text-foreground">
                Body Pulse <span className="text-gradient">Atlas</span>
              </div>
              <div className="text-[10px] text-muted-foreground mono uppercase tracking-[0.2em] mt-0.5">
                v0.1 · systems biology
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs text-muted-foreground">
            <a href="#atlas" className="hover:text-foreground transition-smooth">Atlas</a>
            <a href="#programs" className="hover:text-foreground transition-smooth">Programs</a>
            <a href="#data" className="hover:text-foreground transition-smooth">Data Model</a>
            <span className="status-chip">Demo Mode</span>
          </nav>
        </div>
      </header>

      {/* ============= HERO ============= */}
      <section className="relative pt-16 pb-10">
        <div className="container max-w-[1400px]">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
            <div className="animate-fade-up">
              <div className="flex items-center gap-2 mb-6">
                <span className="eyebrow">Whole-body systems atlas</span>
                <span className="h-px w-12 bg-gradient-to-r from-primary/60 to-transparent" />
              </div>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.02] text-foreground mb-6">
                From <span className="text-gradient">molecular signal</span><br />
                to whole-body <em className="not-italic text-gradient">consequence</em>.
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
                A translational atlas linking genes, pathways and tissues into one
                interactive view of the human body. Built for systems biology,
                clinical interpretation and biotech strategy.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#programs" className="inline-flex items-center gap-2 px-5 h-11 rounded-full bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow hover:scale-[1.02] transition-spring">
                  <Sparkles className="h-4 w-4" />
                  Explore demo program
                </a>
                <a href="#atlas" className="inline-flex items-center gap-2 px-5 h-11 rounded-full border border-white/15 text-foreground font-medium text-sm hover:bg-white/[0.04] transition-smooth">
                  Open atlas
                </a>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-3 max-w-md">
                {[
                  { icon: Layers,  label: 'Tissues',  value: '15+' },
                  { icon: Activity, label: 'Pathways', value: '15' },
                  { icon: Dna,     label: 'Genes',    value: '26' },
                ].map(s => (
                  <div key={s.label} className="metric-block">
                    <s.icon className="h-3.5 w-3.5 text-primary mb-2" />
                    <div className="font-display text-2xl text-foreground leading-none">{s.value}</div>
                    <div className="text-[10px] mono uppercase tracking-widest text-muted-foreground mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero body preview */}
            <div className="relative animate-fade-up" style={{ animationDelay: '0.15s' }}>
              <div className="relative aspect-[3/4] max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-glow opacity-70" />
                <BodyModel
                  tissueEffects={view.tissueEffects}
                  hoveredTissue={hoveredTissue}
                  selectedTissue={selectedTissueId}
                  onHover={setHoveredTissue}
                  onSelect={atlas.focusTissue}
                />
              </div>
              <div className="mt-2 text-center">
                <div className="eyebrow mb-1">Active program</div>
                <div className="font-display text-xl text-foreground">{program.name}</div>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 leading-relaxed">
                  {program.narrative}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============= PROGRAM SELECTOR ============= */}
      <section id="programs" className="relative py-10">
        <div className="container max-w-[1400px]">
          <div className="flex items-end justify-between mb-5">
            <div>
              <div className="eyebrow mb-2">Demo programs</div>
              <h2 className="font-display text-3xl text-foreground">Select a biological story</h2>
            </div>
            <div className="hidden md:block text-xs text-muted-foreground max-w-sm text-right">
              Each program projects a curated set of pathway and gene perturbations
              onto tissues across the body.
            </div>
          </div>
          <ProgramSelector
            programs={PROGRAMS}
            activeId={program.id}
            onSelect={atlas.selectProgram}
          />
        </div>
      </section>

      {/* ============= ATLAS WORKSPACE ============= */}
      <section id="atlas" className="relative py-10">
        <div className="container max-w-[1400px]">
          <div className="grid lg:grid-cols-[280px_1fr_320px] gap-5">
            {/* Left: Tissues */}
            <div className="glass-panel p-5 order-2 lg:order-1">
              <PanelHeader
                eyebrow="Affected tissues"
                title={`${sortedTissues.length} regions`}
              />
              <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-1 -mr-1">
                {sortedTissues.map(eff => {
                  const t = TISSUE_BY_ID[eff.ref];
                  if (!t) return null;
                  return (
                    <EntityRow
                      key={eff.ref}
                      id={eff.ref}
                      name={t.name}
                      meta={t.system}
                      effect={eff}
                      active={selectedTissueId === eff.ref}
                      onClick={() => atlas.focusTissue(eff.ref)}
                      onHover={(h) => setHoveredTissue(h ? eff.ref : null)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Center: Body Model */}
            <div className="glass-panel p-5 order-1 lg:order-2 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="eyebrow">Body atlas</div>
                  <div className="font-display text-lg text-foreground">{program.name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Legend />
                  {focus.id && (
                    <button
                      onClick={atlas.clearFocus}
                      className="status-chip hover:border-primary/50 transition-smooth"
                    >
                      Clear focus
                    </button>
                  )}
                </div>
              </div>

              <div className="relative aspect-[3/4] max-h-[640px]">
                <BodyModel
                  tissueEffects={view.tissueEffects}
                  hoveredTissue={hoveredTissue}
                  selectedTissue={selectedTissueId}
                  onHover={setHoveredTissue}
                  onSelect={atlas.focusTissue}
                />
              </div>

              {/* Focus footer */}
              <div className="mt-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] min-h-[68px]">
                {focusedEntity ? (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="eyebrow">{focusedEntity.kind}</span>
                      <span className="font-mono text-xs text-foreground">{focusedEntity.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {focusedEntity.description}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Hover or click any organ, pathway or gene to inspect its role in this program.
                  </p>
                )}
              </div>
            </div>

            {/* Right: Pathways + Genes */}
            <div className="space-y-5 order-3">
              <div className="glass-panel p-5">
                <PanelHeader
                  eyebrow="Pathways"
                  title={`${sortedPathways.length} active`}
                />
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 -mr-1">
                  {sortedPathways.map(eff => {
                    const p = PATHWAY_BY_ID[eff.ref];
                    if (!p) return null;
                    return (
                      <EntityRow
                        key={eff.ref}
                        id={eff.ref}
                        name={p.name}
                        meta={p.category}
                        effect={eff}
                        active={focus.kind === 'pathway' && focus.id === eff.ref}
                        onClick={() => atlas.focusPathway(eff.ref)}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="glass-panel p-5">
                <PanelHeader
                  eyebrow="Genes / proteins"
                  title={`${sortedGenes.length} dysregulated`}
                />
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 -mr-1">
                  {sortedGenes.map(eff => {
                    const g = GENE_BY_ID[eff.ref];
                    if (!g) return null;
                    return (
                      <EntityRow
                        key={eff.ref}
                        id={eff.ref}
                        name={g.id}
                        meta={g.proteinClass}
                        effect={eff}
                        active={focus.kind === 'gene' && focus.id === eff.ref}
                        onClick={() => atlas.focusGene(eff.ref)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============= DATA MODEL TEASER ============= */}
      <section id="data" className="relative py-16">
        <div className="container max-w-[1400px]">
          <div className="glass-panel p-8 md:p-10">
            <div className="grid md:grid-cols-[1fr_1.2fr] gap-8 items-center">
              <div>
                <div className="eyebrow mb-3">Architecture</div>
                <h3 className="font-display text-3xl text-foreground mb-3">
                  Built to extend beyond genes.
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Every entity — tissue, pathway, gene, protein, disease program — is
                  a typed node. The same engine will project metabolites,
                  enzymes, drugs and DEG signatures from Network Pulse Analyzer
                  onto the body in upcoming versions.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Tissue', 'Pathway', 'Gene', 'Protein', 'Program', 'Metabolite (soon)', 'Drug (soon)'].map(t => (
                    <span key={t} className="status-chip">{t}</span>
                  ))}
                </div>
              </div>
              <div className="relative aspect-[16/10] rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-30" />
                <SchemaDiagram />
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative py-10 border-t border-white/[0.06]">
        <div className="container max-w-[1400px] flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>© Body Pulse Atlas · Pulse product family</div>
          <div className="mono uppercase tracking-widest">Translational systems biology · MVP</div>
        </div>
      </footer>
    </main>
  );
}

function PanelHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-3 pb-3 border-b border-white/[0.06]">
      <div className="eyebrow mb-1">{eyebrow}</div>
      <div className="font-display text-base text-foreground">{title}</div>
    </div>
  );
}

function Legend() {
  const items: { label: string; state: 'up' | 'down' | 'dysregulated' }[] = [
    { label: 'Up',   state: 'up' },
    { label: 'Down', state: 'down' },
    { label: 'Dys',  state: 'dysregulated' },
  ];
  return (
    <div className="hidden md:flex items-center gap-2 px-3 h-7 rounded-full border border-white/[0.08] bg-white/[0.02]">
      {items.map(i => (
        <div key={i.label} className="flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: stateColor(i.state), boxShadow: `0 0 6px ${stateColor(i.state)}` }}
          />
          <span className="text-[9px] mono uppercase tracking-wider text-muted-foreground">{stateLabel(i.state)}</span>
        </div>
      ))}
    </div>
  );
}

function SchemaDiagram() {
  const nodes = [
    { id: 'program',    x: 50,  y: 50,  label: 'Program',    color: 'primary' },
    { id: 'tissue',     x: 20,  y: 25,  label: 'Tissue',     color: 'primary' },
    { id: 'pathway',    x: 80,  y: 25,  label: 'Pathway',    color: 'accent' },
    { id: 'gene',       x: 80,  y: 75,  label: 'Gene',       color: 'magenta' },
    { id: 'protein',    x: 20,  y: 75,  label: 'Protein',    color: 'violet' },
    { id: 'metabolite', x: 50,  y: 92,  label: 'Metabolite', color: 'muted', soon: true },
  ];
  const edges = [
    ['program', 'tissue'], ['program', 'pathway'], ['program', 'gene'],
    ['pathway', 'gene'], ['gene', 'protein'], ['tissue', 'pathway'],
    ['pathway', 'metabolite'],
  ];
  const map = Object.fromEntries(nodes.map(n => [n.id, n]));
  const colorVar = (c: string) =>
    c === 'primary' ? 'hsl(var(--primary))' :
    c === 'accent'  ? 'hsl(var(--accent))'  :
    c === 'magenta' ? 'hsl(var(--magenta))' :
    c === 'violet'  ? 'hsl(var(--violet))'  : 'hsl(var(--muted-foreground))';
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
      {edges.map(([a, b], i) => {
        const A = map[a], B = map[b];
        return (
          <line
            key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y}
            stroke="hsl(188 100% 70% / 0.3)" strokeWidth="0.3" strokeDasharray="0.8 1.2"
          />
        );
      })}
      {nodes.map(n => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r={n.id === 'program' ? 5 : 3.6}
            fill={colorVar(n.color)} fillOpacity={n.soon ? 0.25 : 0.85}
            stroke={colorVar(n.color)} strokeWidth="0.3"
          />
          <text x={n.x} y={n.y + (n.id === 'program' ? 8.5 : 7)}
            fill="hsl(var(--foreground))" fontSize="2.6"
            textAnchor="middle" fontFamily="JetBrains Mono, monospace"
            opacity={n.soon ? 0.5 : 1}
          >
            {n.label}{n.soon ? ' ◦' : ''}
          </text>
        </g>
      ))}
    </svg>
  );
}
