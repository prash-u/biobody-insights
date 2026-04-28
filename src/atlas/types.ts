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

export type InterventionCategory =
  | 'Metabolic / MASLD'
  | 'Diabetes / insulin resistance'
  | 'Inflammatory / immune'
  | 'Oncology signaling'
  | 'Neuroinflammation'
  | 'Antiviral / host response'
  | 'Mitochondrial / redox';

export interface InterventionTarget {
  label: string;
  kind: 'tissue' | 'pathway' | 'gene' | 'protein' | 'enzyme' | 'receptor';
  ref?: string;
}

export interface InterventionEffect {
  ref: string;
  direction: 'increase' | 'decrease' | 'stabilize';
  magnitude: number;
  note: string;
}

export interface Intervention {
  id: string;
  name: string;
  subtitle: string;
  category: InterventionCategory;
  targets: InterventionTarget[];
  mechanisms: string[];
  impact: string[];
  tissueEffects: InterventionEffect[];
  pathwayEffects: InterventionEffect[];
  observableEffects: Record<string, number>;
  score: number;
  contraindicationNote: string;
}

export interface ParameterControlDefinition {
  id: string;
  label: string;
  value: number;
  low: string;
  high: string;
  inverse?: boolean;
}

export interface ObservableSeries {
  id: string;
  label: string;
  unit: string;
  baseline: number;
  current: number;
  delta: number;
  trend: number[];
}

export interface SimulationScenario {
  id: string;
  label: string;
  createdAt: string;
  parameters: Record<string, number>;
  selectedInterventionIds: string[];
  focusPathwayId?: string | null;
}

export interface SimulationResult {
  scenario: SimulationScenario;
  observables: ObservableSeries[];
  tissueDeltas: Record<string, number>;
  pathwayDeltas: Record<string, number>;
  selectedInterventionEffects: InterventionEffect[];
  summary: string;
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
