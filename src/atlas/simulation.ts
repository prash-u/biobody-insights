import { METABOLIC_PATHWAY_LAYERS, PATHWAY_BY_ID, TISSUE_BY_ID } from './data';
import { INTERVENTION_BY_ID, INTERVENTIONS } from './interventions';
import {
  ActivationState,
  Intervention,
  ObservableSeries,
  ParameterControlDefinition,
  ProgramEffect,
  SimulationResult,
} from './types';

export const PARAMETER_CONTROLS: ParameterControlDefinition[] = [
  { id: 'inflammation', label: 'Inflammation', value: 0.18, low: 'Low', high: 'High' },
  { id: 'insulin', label: 'Insulin Sensitivity', value: 0.82, low: 'Low', high: 'High', inverse: true },
  { id: 'oxidative', label: 'Oxidative Stress', value: 0.22, low: 'Low', high: 'High' },
  { id: 'mitochondrial', label: 'Mitochondrial Function', value: 0.78, low: 'Low', high: 'High', inverse: true },
  { id: 'adiposity', label: 'Adiposity', value: 0.26, low: 'Low', high: 'Elevated' },
  { id: 'burden', label: 'Tumor Burden', value: 0.1, low: 'Low', high: 'High' },
];

export const DEFAULT_PARAMETERS = Object.fromEntries(PARAMETER_CONTROLS.map((control) => [control.id, control.value]));

const OBSERVABLE_BASELINES = {
  inflammation: { label: 'Inflammation', unit: 'a.u.', baseline: 0.18 },
  glucose: { label: 'Glucose Output', unit: 'a.u.', baseline: 0.22 },
  insulinSensitivity: { label: 'Insulin Sensitivity', unit: 'a.u.', baseline: 0.82 },
  liverFat: { label: 'Liver Fat', unit: 'a.u.', baseline: 0.24 },
  oxidativeStress: { label: 'Oxidative Stress', unit: 'a.u.', baseline: 0.22 },
  mitochondrialFunction: { label: 'Mitochondrial Function', unit: 'a.u.', baseline: 0.78 },
  tumorBurden: { label: 'Tumor Burden', unit: 'a.u.', baseline: 0.1 },
  neuroinflammation: { label: 'Neuroinflammation', unit: 'a.u.', baseline: 0.16 },
  viralLoad: { label: 'Viral Load', unit: 'a.u.', baseline: 0.08 },
  stability: { label: 'System Stability', unit: 'a.u.', baseline: 0.86 },
} as const;

export type ObservableId = keyof typeof OBSERVABLE_BASELINES;

export function selectedInterventions(ids: Iterable<string>): Intervention[] {
  return Array.from(ids)
    .map((id) => INTERVENTION_BY_ID[id])
    .filter(Boolean);
}

export function blendControlPressure(
  base: Map<string, ProgramEffect>,
  controls: Record<string, number>,
  selectedIds: Set<string>,
) {
  const next = new Map(base);
  const selected = selectedInterventions(selectedIds);
  const pressure = systemPressure(controls);

  const overlays: Record<string, number> = {
    liver: controls.inflammation * 0.22 + controls.adiposity * 0.3 + (1 - controls.insulin) * 0.2 + controls.oxidative * 0.08,
    adipose: controls.adiposity * 0.42 + controls.inflammation * 0.18,
    muscle: (1 - controls.insulin) * 0.3 + (1 - controls.mitochondrial) * 0.24,
    pancreas: (1 - controls.insulin) * 0.24 + controls.oxidative * 0.18,
    heart: controls.oxidative * 0.18 + (1 - controls.mitochondrial) * 0.28,
    brain: controls.inflammation * 0.18 + controls.oxidative * 0.16,
    lungs: controls.inflammation * 0.16 + controls.oxidative * 0.08,
    spleen: controls.inflammation * 0.24,
    breast: controls.burden * 0.45 + controls.inflammation * 0.08,
    kidney: controls.oxidative * 0.12 + (1 - controls.insulin) * 0.08,
  };

  Object.entries(overlays).forEach(([ref, value]) => {
    const original = next.get(ref);
    const relief = selected.reduce((sum, intervention) => {
      const tissueEffect = intervention.tissueEffects.find((effect) => effect.ref === ref);
      if (!tissueEffect) return sum;
      return sum + (tissueEffect.direction === 'increase' ? -tissueEffect.magnitude * 0.18 : tissueEffect.magnitude);
    }, 0);
    const weight = clamp(value + pressure * 0.3 - relief, original?.weight ?? 0.1, 1);
    const state: ActivationState = weight > 0.68 ? 'dysregulated' : weight > 0.42 ? 'up' : 'baseline';
    next.set(ref, { ref, state, weight, note: original?.note ?? TISSUE_BY_ID[ref]?.description });
  });

  selected.forEach((intervention) => {
    intervention.tissueEffects.forEach((effect) => {
      const original = next.get(effect.ref);
      if (effect.direction === 'increase') {
        const weight = clamp((original?.weight ?? 0.2) + effect.magnitude * 0.7, 0, 1);
        next.set(effect.ref, { ref: effect.ref, state: weight > 0.55 ? 'up' : 'baseline', weight, note: effect.note });
      } else {
        const weight = clamp((original?.weight ?? 0.2) - effect.magnitude * 0.55, 0, 1);
        next.set(effect.ref, { ref: effect.ref, state: weight > 0.52 ? 'up' : 'baseline', weight, note: effect.note });
      }
    });
  });

  return next;
}

export function buildSimulationResult({
  controls,
  selectedIds,
  focusPathwayId,
  pathwayTuning = {},
}: {
  controls: Record<string, number>;
  selectedIds: Set<string>;
  focusPathwayId?: string | null;
  pathwayTuning?: Record<string, number>;
}): SimulationResult {
  const selected = selectedInterventions(selectedIds);
  const observableTargets = deriveObservableTargets(controls, selected);
  const observables = Object.entries(observableTargets).map(([id, current]) => {
    const definition = OBSERVABLE_BASELINES[id as ObservableId];
    return buildSeries(id as ObservableId, definition.label, definition.unit, definition.baseline, current);
  });

  const tissueDeltas = applyPathwayTuningToTissues(deriveTissueDeltas(controls, selected), pathwayTuning);
  const pathwayDeltas = applyPathwayTuningToPathways(derivePathwayDeltas(controls, selected), pathwayTuning);
  const topTissue = Object.entries(tissueDeltas).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
  const topPathway = Object.entries(pathwayDeltas).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];

  return {
    scenario: {
      id: `scenario-${Date.now()}`,
      label: `${selected.length || 'No'} intervention${selected.length === 1 ? '' : 's'} vs healthy reference`,
      createdAt: new Date().toISOString(),
      parameters: { ...controls },
      selectedInterventionIds: Array.from(selectedIds),
      focusPathwayId,
    },
    observables,
    tissueDeltas,
    pathwayDeltas,
    selectedInterventionEffects: selected.flatMap((intervention) => intervention.tissueEffects.concat(intervention.pathwayEffects)),
    summary: `Simulation projects ${selected.length || 'no'} selected intervention${selected.length === 1 ? '' : 's'} against a healthy adult reference. Strongest tissue shift: ${TISSUE_BY_ID[topTissue?.[0]]?.name ?? 'none'} (${formatDelta(topTissue?.[1] ?? 0)}). Strongest pathway shift: ${PATHWAY_BY_ID[topPathway?.[0]]?.name ?? 'none'} (${formatDelta(topPathway?.[1] ?? 0)}). Values are deterministic demo outputs, not patient-specific clinical predictions.`,
  };
}

export function rankInterventionEffects(selectedIds: Set<string>) {
  return selectedInterventions(selectedIds)
    .flatMap((intervention) => intervention.pathwayEffects.map((effect) => ({ intervention, effect })))
    .sort((a, b) => b.effect.magnitude - a.effect.magnitude);
}

export function rankPathwaysFromResult(result: SimulationResult | null) {
  if (!result) return [];
  return Object.entries(result.pathwayDeltas)
    .map(([id, delta]) => ({ id, delta, pathway: PATHWAY_BY_ID[id] }))
    .filter((item) => item.pathway)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

export function rankTissuesFromResult(result: SimulationResult | null) {
  if (!result) return [];
  return Object.entries(result.tissueDeltas)
    .map(([id, delta]) => ({ id, delta, tissue: TISSUE_BY_ID[id] }))
    .filter((item) => item.tissue)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

export function pathwayOrganProjection(pathwayId: string) {
  const layer = METABOLIC_PATHWAY_LAYERS.find((candidate) => candidate.id === pathwayId);
  if (!layer) return [];
  return [...layer.tissueFlux].sort((a, b) => b.synthesisRate - a.synthesisRate);
}

function applyPathwayTuningToTissues(deltas: Record<string, number>, pathwayTuning: Record<string, number>) {
  const next = { ...deltas };
  Object.entries(pathwayTuning).forEach(([pathwayId, value]) => {
    if (Math.abs(value) < 0.01) return;
    const layer = METABOLIC_PATHWAY_LAYERS.find((candidate) => candidate.id === pathwayId);
    layer?.tissueFlux.forEach((flux) => {
      next[flux.ref] = (next[flux.ref] ?? 0) + value * flux.synthesisRate * 0.22;
    });
  });
  return normalizeDeltas(next);
}

function applyPathwayTuningToPathways(deltas: Record<string, number>, pathwayTuning: Record<string, number>) {
  const next = { ...deltas };
  Object.entries(pathwayTuning).forEach(([pathwayId, value]) => {
    if (Math.abs(value) < 0.01) return;
    next[pathwayId] = (next[pathwayId] ?? 0) + value * 0.42;
  });
  return normalizeDeltas(next);
}

function deriveObservableTargets(controls: Record<string, number>, selected: Intervention[]) {
  const current: Record<ObservableId, number> = {
    inflammation: controls.inflammation,
    glucose: clamp(0.18 + (1 - controls.insulin) * 0.4 + controls.adiposity * 0.18, 0, 1),
    insulinSensitivity: controls.insulin,
    liverFat: clamp(0.18 + controls.adiposity * 0.42 + (1 - controls.mitochondrial) * 0.18, 0, 1),
    oxidativeStress: controls.oxidative,
    mitochondrialFunction: controls.mitochondrial,
    tumorBurden: controls.burden,
    neuroinflammation: clamp(controls.inflammation * 0.45 + controls.oxidative * 0.22, 0, 1),
    viralLoad: clamp(controls.inflammation * 0.12 + 0.08, 0, 1),
    stability: clamp(1 - systemPressure(controls) * 0.85, 0, 1),
  };

  selected.forEach((intervention) => {
    Object.entries(intervention.observableEffects).forEach(([id, effect]) => {
      if (id in current) current[id as ObservableId] = clamp(current[id as ObservableId] + effect, 0, 1);
    });
  });

  return current;
}

function deriveTissueDeltas(controls: Record<string, number>, selected: Intervention[]) {
  const deltas: Record<string, number> = {};
  const pressure = systemPressure(controls);

  Object.keys(TISSUE_BY_ID).forEach((id) => {
    deltas[id] = pressure * 0.16;
  });
  deltas.liver += controls.adiposity * 0.22 + (1 - controls.insulin) * 0.16;
  deltas.adipose += controls.adiposity * 0.28;
  deltas.muscle += (1 - controls.insulin) * 0.22;
  deltas.brain += controls.inflammation * 0.14 + controls.oxidative * 0.1;
  deltas.breast += controls.burden * 0.42;
  deltas.lungs += controls.inflammation * 0.12;

  selected.forEach((intervention) => {
    intervention.tissueEffects.forEach((effect) => {
      const sign = effect.direction === 'increase' ? 1 : -1;
      deltas[effect.ref] = (deltas[effect.ref] ?? 0) + sign * effect.magnitude;
    });
  });

  return normalizeDeltas(deltas);
}

function derivePathwayDeltas(controls: Record<string, number>, selected: Intervention[]) {
  const deltas: Record<string, number> = {};
  METABOLIC_PATHWAY_LAYERS.forEach((layer) => {
    const tissuePressure = layer.tissueFlux.reduce((sum, flux) => sum + flux.synthesisRate, 0) / Math.max(1, layer.tissueFlux.length);
    deltas[layer.id] = (tissuePressure - 0.5) * 0.14 + systemPressure(controls) * 0.12;
  });

  Object.assign(deltas, {
    glycolysis: (deltas.glycolysis ?? 0) + (1 - controls.insulin) * 0.16,
    gluconeogenesis: (deltas.gluconeogenesis ?? 0) + (1 - controls.insulin) * 0.26,
    lipogenesis: (deltas.lipogenesis ?? 0) + controls.adiposity * 0.2,
    triglyceride_metabolism: (deltas.triglyceride_metabolism ?? 0) + controls.adiposity * 0.22,
    oxphos: (deltas.oxphos ?? 0) - (1 - controls.mitochondrial) * 0.22,
    fatty_acid_oxidation: (deltas.fatty_acid_oxidation ?? 0) - (1 - controls.mitochondrial) * 0.16,
    glutathione_redox: (deltas.glutathione_redox ?? 0) - controls.oxidative * 0.14,
  });

  selected.forEach((intervention) => {
    intervention.pathwayEffects.forEach((effect) => {
      const sign = effect.direction === 'decrease' ? -1 : 1;
      deltas[effect.ref] = (deltas[effect.ref] ?? 0) + sign * effect.magnitude;
    });
  });

  return normalizeDeltas(deltas);
}

function buildSeries(id: ObservableId, label: string, unit: string, baseline: number, current: number): ObservableSeries {
  const delta = current - baseline;
  const trend = Array.from({ length: 9 }, (_, index) => {
    const t = index / 8;
    const eased = 1 - Math.pow(1 - t, 2);
    const wave = Math.sin(index * 1.3 + baseline * 4) * 0.015;
    return Math.round(clamp(baseline + delta * eased + wave, 0, 1) * 100);
  });
  return { id, label, unit, baseline, current, delta, trend };
}

function normalizeDeltas(deltas: Record<string, number>) {
  return Object.fromEntries(Object.entries(deltas).map(([id, value]) => [id, Math.round(clamp(value, -1, 1) * 1000) / 1000]));
}

function systemPressure(controls: Record<string, number>) {
  return (
    controls.inflammation * 0.2 +
    controls.oxidative * 0.18 +
    controls.adiposity * 0.16 +
    (1 - controls.insulin) * 0.16 +
    (1 - controls.mitochondrial) * 0.16 +
    controls.burden * 0.14
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatDelta(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}`;
}

export const DEFAULT_SIMULATION_RESULT = buildSimulationResult({
  controls: DEFAULT_PARAMETERS,
  selectedIds: new Set(INTERVENTIONS.slice(0, 1).map((intervention) => intervention.id)),
});
