// Body Pulse Atlas — core domain types
// Designed to extend later with Molecule / Drug / Metabolite entities.

export type EntityKind =
  | 'tissue'
  | 'pathway'
  | 'gene'
  | 'protein'
  | 'disease'
  | 'metabolite'
  | 'drug';

export type ActivationState = 'up' | 'down' | 'dysregulated' | 'neutral' | 'baseline';

export interface Tissue {
  id: string;
  name: string;
  system: string;
  description: string;
}

export interface Pathway {
  id: string;
  name: string;
  category: string;
  description: string;
  compartment?: string;
}

export interface Gene {
  id: string;
  name: string;
  proteinClass?: string;
  description: string;
}

export interface ProgramEffect<RefId extends string = string> {
  ref: RefId;
  state: ActivationState;
  weight?: number;
  note?: string;
}

export interface TissueFlux extends ProgramEffect {
  role: string;
  synthesisRate: number;
}

export interface MetabolicReaction {
  id: string;
  from: string[];
  to: string[];
  enzyme: string;
  stoichiometry: string;
  healthyMoles: number;
  currentFactor: number;
  unit: string;
  note: string;
}

export interface MetabolicPathwayLayer {
  id: string;
  name: string;
  category: string;
  compartment: string;
  summary: string;
  metabolites: string[];
  enzymes: string[];
  tissueFlux: TissueFlux[];
  baselineFlux?: {
    value: number;
    unit: string;
    context: string;
  };
  reactions?: MetabolicReaction[];
}

export interface MetabolicRoute {
  id: string;
  name: string;
  tissue: string;
  steps: string[];
  enzymes: string[];
  pathways: string[];
}

export interface DiseaseProgram {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  narrative: string;
  systemFocus: string;
  tissues: ProgramEffect[];
  pathways: ProgramEffect[];
  genes: ProgramEffect[];
}
