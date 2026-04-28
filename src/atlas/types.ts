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

export type ActivationState = 'up' | 'down' | 'dysregulated' | 'neutral';

export interface Tissue {
  id: string;          // canonical id, e.g. "brain"
  name: string;        // display name, e.g. "Brain"
  system: string;      // e.g. "Nervous", "Endocrine", "Immune"
  description: string;
}

export interface Pathway {
  id: string;          // e.g. "neuroinflammation"
  name: string;
  category: string;    // e.g. "Immune signaling"
  description: string;
}

export interface Gene {
  id: string;          // HGNC symbol
  name: string;        // long name
  proteinClass?: string; // e.g. "Cytokine", "Kinase"
  description: string;
}

// Effect of a program on a specific entity
export interface ProgramEffect<RefId extends string = string> {
  ref: RefId;
  state: ActivationState;
  weight?: number; // 0..1 strength / magnitude for visual intensity
  note?: string;
}

export interface DiseaseProgram {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  narrative: string;          // 1-2 sentence systems-biology story
  systemFocus: string;        // e.g. "Neuro-immune"
  tissues: ProgramEffect[];   // tissue ids
  pathways: ProgramEffect[];  // pathway ids
  genes: ProgramEffect[];     // gene ids
}
