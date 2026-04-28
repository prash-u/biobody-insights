import { useMemo, useState } from 'react';
import {
  GENE_BY_ID, METABOLIC_PATHWAY_LAYERS, PATHWAY_BY_ID, PROGRAMS, PROGRAM_BY_ID, TISSUE_BY_ID,
} from './data';
import { ActivationState, DiseaseProgram, ProgramEffect } from './types';

export type FocusKind = 'tissue' | 'pathway' | 'gene' | null;
export interface Focus {
  kind: FocusKind;
  id: string | null;
}

export interface DerivedView {
  program: DiseaseProgram;
  focus: Focus;
  // effective effect maps after focus filter
  tissueEffects: Map<string, ProgramEffect>;   // tissue id -> effect
  pathwayEffects: Map<string, ProgramEffect>;
  geneEffects: Map<string, ProgramEffect>;
}

const toMap = (effects: ProgramEffect[]) =>
  new Map(effects.map(e => [e.ref, e]));

export function useAtlas(initialProgramId = PROGRAMS[0].id) {
  const [programId, setProgramId] = useState<string>(initialProgramId);
  const [focus, setFocus] = useState<Focus>({ kind: null, id: null });

  const program = PROGRAM_BY_ID[programId] ?? PROGRAMS[0];

  const view: DerivedView = useMemo(() => {
    const baseTissue  = toMap(program.tissues);
    const basePathway = toMap(program.pathways);
    const baseGene    = toMap(program.genes);

    if (!focus.kind || !focus.id) {
      return {
        program, focus,
        tissueEffects: baseTissue,
        pathwayEffects: basePathway,
        geneEffects: baseGene,
      };
    }

    if (focus.kind === 'pathway') {
      const pathwayLayer = METABOLIC_PATHWAY_LAYERS.find((layer) => layer.id === focus.id);

      if (pathwayLayer) {
        return {
          program,
          focus,
          tissueEffects: toMap(pathwayLayer.tissueFlux.map((flux) => ({
            ref: flux.ref,
            state: flux.state,
            weight: Math.max(flux.weight ?? 0, flux.synthesisRate),
            note: `${flux.role} · synthesis ${(flux.synthesisRate * 100).toFixed(0)}%`,
          }))),
          pathwayEffects: basePathway,
          geneEffects: toMap(pathwayLayer.enzymes.map((enzyme, index) => ({
            ref: enzyme,
            state: index === 0 ? 'up' : 'dysregulated',
            weight: Math.max(0.44, 0.78 - index * 0.07),
          }))),
        };
      }
    }

    // Filter by focus — keep entities co-implicated in the program.
    // For MVP, focus narrows visual emphasis; we still surface program members.
    return {
      program, focus,
      tissueEffects: baseTissue,
      pathwayEffects: basePathway,
      geneEffects: baseGene,
    };
  }, [program, focus]);

  const selectProgram = (id: string) => {
    setProgramId(id);
    setFocus({ kind: null, id: null });
  };

  const focusTissue  = (id: string | null) =>
    setFocus(f => (f.kind === 'tissue' && f.id === id) ? { kind: null, id: null } : { kind: 'tissue', id });
  const focusPathway = (id: string | null) =>
    setFocus(f => (f.kind === 'pathway' && f.id === id) ? { kind: null, id: null } : { kind: 'pathway', id });
  const focusGene    = (id: string | null) =>
    setFocus(f => (f.kind === 'gene' && f.id === id) ? { kind: null, id: null } : { kind: 'gene', id });
  const clearFocus   = () => setFocus({ kind: null, id: null });

  return {
    programId, program, focus, view,
    selectProgram, focusTissue, focusPathway, focusGene, clearFocus,
    helpers: { TISSUE_BY_ID, PATHWAY_BY_ID, GENE_BY_ID },
  };
}

export function stateColor(state: ActivationState | undefined): string {
  switch (state) {
    case 'up':            return 'hsl(var(--primary))';        // cyan
    case 'down':          return 'hsl(var(--violet))';
    case 'dysregulated':  return 'hsl(var(--magenta))';
    case 'baseline':      return 'hsl(var(--success))';
    case 'neutral':       return 'hsl(var(--muted-foreground))';
    default:              return 'hsl(var(--muted-foreground))';
  }
}

export function stateLabel(state: ActivationState | undefined): string {
  switch (state) {
    case 'up':           return 'Activated';
    case 'down':         return 'Suppressed';
    case 'dysregulated': return 'Dysregulated';
    case 'baseline':     return 'Healthy';
    default:             return 'Neutral';
  }
}
