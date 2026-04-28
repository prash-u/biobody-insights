import { DiseaseProgram, Gene, Pathway, Tissue } from './types';

// ============================================================
// TISSUES — anchors on the body model. ids match SVG region ids.
// ============================================================
export const TISSUES: Tissue[] = [
  { id: 'brain',     name: 'Brain',     system: 'Nervous',    description: 'CNS — cortex, microglia, BBB interface.' },
  { id: 'thyroid',   name: 'Thyroid',   system: 'Endocrine',  description: 'T3/T4 hormone synthesis, metabolic set-point.' },
  { id: 'lungs',     name: 'Lungs',     system: 'Respiratory',description: 'Alveolar epithelium, resident immune cells.' },
  { id: 'heart',     name: 'Heart',     system: 'Cardiovascular', description: 'Cardiomyocytes, vascular endothelium.' },
  { id: 'liver',     name: 'Liver',     system: 'Hepatic',    description: 'Hepatocytes, glucose & lipid metabolism, acute phase.' },
  { id: 'pancreas',  name: 'Pancreas',  system: 'Endocrine',  description: 'β-cell insulin secretion, exocrine enzymes.' },
  { id: 'stomach',   name: 'Stomach',   system: 'Digestive',  description: 'Gastric mucosa, secretory epithelium.' },
  { id: 'intestine', name: 'Intestine', system: 'Digestive',  description: 'Gut epithelium, microbiota interface, GLP-1.' },
  { id: 'kidney',    name: 'Kidneys',   system: 'Renal',      description: 'Nephron filtration, RAAS signaling.' },
  { id: 'spleen',    name: 'Spleen',    system: 'Immune',     description: 'Lymphocyte reservoir, antigen filtration.' },
  { id: 'adipose',   name: 'Adipose',   system: 'Metabolic',  description: 'Adipocytes, adipokine secretion (leptin, adiponectin).' },
  { id: 'muscle',    name: 'Skeletal Muscle', system: 'Musculoskeletal', description: 'Insulin-stimulated glucose uptake, GLUT4.' },
  { id: 'breast',    name: 'Breast',    system: 'Glandular',  description: 'Mammary epithelium, ductal & lobular tissue.' },
  { id: 'bone_marrow', name: 'Bone Marrow', system: 'Immune', description: 'Hematopoiesis, myeloid & lymphoid lineages.' },
  { id: 'skin',      name: 'Skin',      system: 'Integumentary', description: 'Keratinocytes, Langerhans cells, barrier immunity.' },
];

// ============================================================
// PATHWAYS
// ============================================================
export const PATHWAYS: Pathway[] = [
  { id: 'nfkb',          name: 'NF-κB Signaling',           category: 'Immune signaling',    description: 'Master inflammatory transcription program.' },
  { id: 'jak_stat',      name: 'JAK-STAT',                  category: 'Cytokine signaling',  description: 'Type I/II cytokine receptor → STAT transcription.' },
  { id: 'ifn_response',  name: 'Interferon Response',       category: 'Antiviral immunity',  description: 'ISG-driven antiviral and antiproliferative state.' },
  { id: 'insulin',       name: 'Insulin / PI3K-AKT',        category: 'Metabolic signaling', description: 'Glucose uptake, glycogenesis, anabolic growth.' },
  { id: 'mtor',          name: 'mTOR',                      category: 'Growth & metabolism', description: 'Nutrient sensing, protein synthesis, autophagy gate.' },
  { id: 'ampk',          name: 'AMPK Energy Sensing',       category: 'Metabolic signaling', description: 'Low energy → catabolism, fatty acid oxidation.' },
  { id: 'glycolysis',    name: 'Glycolysis',                category: 'Core metabolism',     description: 'Glucose → pyruvate, ATP and biosynthetic precursors.' },
  { id: 'oxphos',        name: 'Oxidative Phosphorylation', category: 'Core metabolism',     description: 'ETC-driven ATP production at the mitochondria.' },
  { id: 'apoptosis',     name: 'Intrinsic Apoptosis',       category: 'Cell fate',           description: 'BAX/BAK pore → cytochrome c → caspase cascade.' },
  { id: 'er_stress',     name: 'ER Stress / UPR',           category: 'Proteostasis',        description: 'Unfolded protein response, IRE1/PERK/ATF6 arms.' },
  { id: 'estrogen',      name: 'Estrogen Receptor',         category: 'Nuclear receptor',    description: 'ERα-driven proliferation in hormone-sensitive tissues.' },
  { id: 'pi3k_her2',     name: 'HER2 / PI3K-AKT-MTOR',      category: 'Oncogenic signaling', description: 'ERBB2 amplification → AKT/mTOR proliferation drive.' },
  { id: 'complement',    name: 'Complement Cascade',        category: 'Innate immunity',     description: 'C3/C5 opsonization and MAC formation.' },
  { id: 'tnf',           name: 'TNF Signaling',             category: 'Cytokine signaling',  description: 'TNFR → NF-κB / apoptosis bifurcation.' },
  { id: 'microglia',     name: 'Microglial Activation',     category: 'Neuro-immune',        description: 'CNS-resident macrophage priming and cytokine release.' },
];

// ============================================================
// GENES / PROTEINS
// ============================================================
export const GENES: Gene[] = [
  { id: 'IL6',     name: 'Interleukin 6',                   proteinClass: 'Cytokine', description: 'Pro-inflammatory cytokine, acute phase driver.' },
  { id: 'TNF',     name: 'Tumor Necrosis Factor',           proteinClass: 'Cytokine', description: 'Master inflammatory cytokine.' },
  { id: 'IL1B',    name: 'Interleukin 1 Beta',              proteinClass: 'Cytokine', description: 'Inflammasome output, fever and recruitment.' },
  { id: 'NFKB1',   name: 'NF-κB p50 subunit',               proteinClass: 'Transcription factor', description: 'Inflammatory transcription program.' },
  { id: 'STAT1',   name: 'STAT1',                           proteinClass: 'Transcription factor', description: 'IFN-γ / antiviral transcription.' },
  { id: 'STAT3',   name: 'STAT3',                           proteinClass: 'Transcription factor', description: 'IL-6 family signaling output.' },
  { id: 'IFNG',    name: 'Interferon Gamma',                proteinClass: 'Cytokine', description: 'Type II IFN, macrophage activation.' },
  { id: 'INSR',    name: 'Insulin Receptor',                proteinClass: 'Receptor tyrosine kinase', description: 'Insulin binding → IRS/PI3K cascade.' },
  { id: 'IRS1',    name: 'Insulin Receptor Substrate 1',    proteinClass: 'Adapter', description: 'Key insulin signaling node, Ser-phosphorylated under IR.' },
  { id: 'AKT1',    name: 'AKT1 / PKB',                      proteinClass: 'Kinase', description: 'Anabolic, pro-survival kinase node.' },
  { id: 'GLUT4',   name: 'SLC2A4 / GLUT4',                  proteinClass: 'Transporter', description: 'Insulin-responsive glucose transporter.' },
  { id: 'PPARG',   name: 'PPARγ',                           proteinClass: 'Nuclear receptor', description: 'Adipocyte differentiation, insulin sensitization.' },
  { id: 'LEP',     name: 'Leptin',                          proteinClass: 'Hormone', description: 'Adipose-derived satiety signal.' },
  { id: 'TP53',    name: 'TP53',                            proteinClass: 'Tumor suppressor', description: 'Genome guardian, apoptosis under stress.' },
  { id: 'ERBB2',   name: 'HER2 / ERBB2',                    proteinClass: 'Receptor tyrosine kinase', description: 'Amplified in ~20% of breast cancers.' },
  { id: 'ESR1',    name: 'Estrogen Receptor α',             proteinClass: 'Nuclear receptor', description: 'Drives proliferation in ER+ breast cancer.' },
  { id: 'BRCA1',   name: 'BRCA1',                           proteinClass: 'DNA repair', description: 'Homologous recombination, hereditary breast cancer.' },
  { id: 'MKI67',   name: 'Ki-67',                           proteinClass: 'Proliferation marker', description: 'Cell cycle activity readout.' },
  { id: 'APOE',    name: 'Apolipoprotein E',                proteinClass: 'Lipid transport', description: 'CNS lipid handling, AD risk allele ε4.' },
  { id: 'TREM2',   name: 'TREM2',                           proteinClass: 'Receptor', description: 'Microglial sensor for damage signals.' },
  { id: 'GFAP',    name: 'GFAP',                            proteinClass: 'Cytoskeletal', description: 'Astrocyte reactivity marker.' },
  { id: 'ACE2',    name: 'ACE2',                            proteinClass: 'Receptor / peptidase', description: 'SARS-CoV-2 entry receptor; RAAS regulation.' },
  { id: 'ISG15',   name: 'ISG15',                           proteinClass: 'Ubiquitin-like', description: 'Canonical interferon-stimulated gene.' },
  { id: 'MX1',     name: 'MX1',                             proteinClass: 'GTPase', description: 'Antiviral interferon-stimulated gene.' },
  { id: 'OAS1',    name: 'OAS1',                            proteinClass: 'Synthetase', description: 'dsRNA sensor, RNase L pathway.' },
  { id: 'CRP',     name: 'C-Reactive Protein',              proteinClass: 'Acute phase', description: 'Hepatic acute phase reactant, IL-6 driven.' },
];

// ============================================================
// DISEASE PROGRAMS — built-in systems-biology stories
// ============================================================
export const PROGRAMS: DiseaseProgram[] = [
  {
    id: 'neuroinflammation',
    name: 'Neuroinflammation',
    shortName: 'Neuro-inflammation',
    tagline: 'Microglial priming and a leaky cytokine axis',
    narrative:
      'Chronic microglial activation drives IL-6 / TNF release in the CNS, recruits peripheral immune signaling, and amplifies hepatic acute-phase response.',
    systemFocus: 'Neuro-immune',
    tissues: [
      { ref: 'brain',       state: 'dysregulated', weight: 1.0,  note: 'Microglial activation, astrogliosis' },
      { ref: 'spleen',      state: 'up',           weight: 0.65, note: 'Peripheral immune mobilization' },
      { ref: 'liver',       state: 'up',           weight: 0.7,  note: 'IL-6 driven acute phase (CRP)' },
      { ref: 'bone_marrow', state: 'up',           weight: 0.55, note: 'Myeloid output increase' },
    ],
    pathways: [
      { ref: 'microglia',    state: 'up', weight: 1.0 },
      { ref: 'nfkb',         state: 'up', weight: 0.9 },
      { ref: 'jak_stat',     state: 'up', weight: 0.7 },
      { ref: 'tnf',          state: 'up', weight: 0.85 },
      { ref: 'complement',   state: 'up', weight: 0.6 },
    ],
    genes: [
      { ref: 'IL6',   state: 'up', weight: 0.95 },
      { ref: 'TNF',   state: 'up', weight: 0.85 },
      { ref: 'IL1B',  state: 'up', weight: 0.8 },
      { ref: 'TREM2', state: 'up', weight: 0.7 },
      { ref: 'GFAP',  state: 'up', weight: 0.75 },
      { ref: 'APOE',  state: 'dysregulated', weight: 0.6 },
      { ref: 'NFKB1', state: 'up', weight: 0.8 },
      { ref: 'CRP',   state: 'up', weight: 0.7 },
    ],
  },
  {
    id: 'insulin_resistance',
    name: 'Insulin Resistance',
    shortName: 'Metabolic dysfunction',
    tagline: 'Adipose-driven inflammation breaks the insulin axis',
    narrative:
      'Expanded adipose tissue secretes IL-6, TNF and altered adipokines; muscle and liver lose insulin sensitivity, β-cells compensate then fail.',
    systemFocus: 'Metabolic-immune',
    tissues: [
      { ref: 'adipose',  state: 'up',           weight: 1.0,  note: 'Adipocyte hypertrophy, macrophage infiltration' },
      { ref: 'liver',    state: 'dysregulated', weight: 0.85, note: 'Hepatic insulin resistance, gluconeogenesis ↑' },
      { ref: 'muscle',   state: 'down',         weight: 0.8,  note: 'GLUT4 translocation impaired' },
      { ref: 'pancreas', state: 'dysregulated', weight: 0.85, note: 'β-cell hypersecretion → exhaustion' },
      { ref: 'intestine',state: 'dysregulated', weight: 0.5,  note: 'Incretin axis altered' },
      { ref: 'brain',    state: 'down',         weight: 0.4,  note: 'Hypothalamic insulin/leptin resistance' },
    ],
    pathways: [
      { ref: 'insulin',   state: 'down', weight: 0.9 },
      { ref: 'ampk',      state: 'down', weight: 0.6 },
      { ref: 'mtor',      state: 'up',   weight: 0.7 },
      { ref: 'glycolysis',state: 'dysregulated', weight: 0.55 },
      { ref: 'tnf',       state: 'up',   weight: 0.65 },
      { ref: 'er_stress', state: 'up',   weight: 0.7 },
    ],
    genes: [
      { ref: 'INSR',  state: 'down', weight: 0.85 },
      { ref: 'IRS1',  state: 'down', weight: 0.9 },
      { ref: 'AKT1',  state: 'down', weight: 0.7 },
      { ref: 'GLUT4', state: 'down', weight: 0.85 },
      { ref: 'PPARG', state: 'dysregulated', weight: 0.7 },
      { ref: 'LEP',   state: 'up',   weight: 0.8 },
      { ref: 'TNF',   state: 'up',   weight: 0.7 },
      { ref: 'IL6',   state: 'up',   weight: 0.6 },
    ],
  },
  {
    id: 'her2_breast_cancer',
    name: 'HER2+ Breast Cancer',
    shortName: 'HER2+ breast',
    tagline: 'ERBB2 amplification drives PI3K-AKT-mTOR proliferation',
    narrative:
      'HER2 amplification in mammary epithelium drives constitutive PI3K-AKT-mTOR signaling, proliferative programs, and systemic dissemination risk to liver, bone and brain.',
    systemFocus: 'Oncogenic signaling',
    tissues: [
      { ref: 'breast',      state: 'dysregulated', weight: 1.0,  note: 'Primary tumor — ERBB2 amplified' },
      { ref: 'liver',       state: 'dysregulated', weight: 0.55, note: 'Common metastatic site' },
      { ref: 'bone_marrow', state: 'dysregulated', weight: 0.5,  note: 'Bone metastasis tropism' },
      { ref: 'brain',       state: 'dysregulated', weight: 0.45, note: 'CNS metastasis risk in HER2+' },
      { ref: 'lungs',       state: 'dysregulated', weight: 0.4,  note: 'Pulmonary metastasis risk' },
    ],
    pathways: [
      { ref: 'pi3k_her2', state: 'up', weight: 1.0 },
      { ref: 'mtor',      state: 'up', weight: 0.9 },
      { ref: 'estrogen',  state: 'dysregulated', weight: 0.55 },
      { ref: 'apoptosis', state: 'down', weight: 0.7 },
      { ref: 'glycolysis',state: 'up', weight: 0.6 },
    ],
    genes: [
      { ref: 'ERBB2', state: 'up', weight: 1.0 },
      { ref: 'AKT1',  state: 'up', weight: 0.85 },
      { ref: 'MKI67', state: 'up', weight: 0.9 },
      { ref: 'TP53',  state: 'dysregulated', weight: 0.7 },
      { ref: 'ESR1',  state: 'dysregulated', weight: 0.5 },
      { ref: 'BRCA1', state: 'dysregulated', weight: 0.4 },
    ],
  },
  {
    id: 'viral_immune',
    name: 'Systemic Viral Response',
    shortName: 'Antiviral state',
    tagline: 'Type-I interferon cascade across barrier and lymphoid tissues',
    narrative:
      'Respiratory viral entry triggers a type-I IFN program in lung epithelium that propagates to spleen, marrow and liver — JAK-STAT-driven ISG expression and acute-phase response.',
    systemFocus: 'Antiviral immunity',
    tissues: [
      { ref: 'lungs',       state: 'dysregulated', weight: 1.0, note: 'Site of viral entry, ACE2+ epithelium' },
      { ref: 'spleen',      state: 'up', weight: 0.85, note: 'Lymphocyte activation' },
      { ref: 'bone_marrow', state: 'up', weight: 0.7,  note: 'Emergency myelopoiesis' },
      { ref: 'liver',       state: 'up', weight: 0.7,  note: 'Acute phase reactants ↑' },
      { ref: 'heart',       state: 'dysregulated', weight: 0.45, note: 'Cytokine-mediated myocardial stress' },
      { ref: 'brain',       state: 'dysregulated', weight: 0.4, note: 'Neuro-COVID style symptoms' },
    ],
    pathways: [
      { ref: 'ifn_response', state: 'up', weight: 1.0 },
      { ref: 'jak_stat',     state: 'up', weight: 0.95 },
      { ref: 'nfkb',         state: 'up', weight: 0.7 },
      { ref: 'complement',   state: 'up', weight: 0.65 },
      { ref: 'apoptosis',    state: 'up', weight: 0.5 },
    ],
    genes: [
      { ref: 'ISG15', state: 'up', weight: 1.0 },
      { ref: 'MX1',   state: 'up', weight: 0.95 },
      { ref: 'OAS1',  state: 'up', weight: 0.9 },
      { ref: 'STAT1', state: 'up', weight: 0.9 },
      { ref: 'IFNG',  state: 'up', weight: 0.8 },
      { ref: 'IL6',   state: 'up', weight: 0.7 },
      { ref: 'ACE2',  state: 'dysregulated', weight: 0.6 },
      { ref: 'CRP',   state: 'up', weight: 0.7 },
    ],
  },
];

// Convenience lookup maps
export const TISSUE_BY_ID  = Object.fromEntries(TISSUES.map(t => [t.id, t])) as Record<string, Tissue>;
export const PATHWAY_BY_ID = Object.fromEntries(PATHWAYS.map(p => [p.id, p])) as Record<string, Pathway>;
export const GENE_BY_ID    = Object.fromEntries(GENES.map(g => [g.id, g])) as Record<string, Gene>;
export const PROGRAM_BY_ID = Object.fromEntries(PROGRAMS.map(p => [p.id, p])) as Record<string, DiseaseProgram>;
