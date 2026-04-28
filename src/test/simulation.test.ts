import { describe, expect, it } from 'vitest';
import { INTERVENTIONS } from '@/atlas/interventions';
import {
  buildSimulationResult,
  DEFAULT_PARAMETERS,
  pathwayOrganProjection,
  rankPathwaysFromResult,
  rankTissuesFromResult,
} from '@/atlas/simulation';

describe('simulation engine', () => {
  it('keeps a healthy reference as the deterministic starting point', () => {
    const result = buildSimulationResult({ controls: DEFAULT_PARAMETERS, selectedIds: new Set() });
    const inflammation = result.observables.find((observable) => observable.id === 'inflammation');
    const insulin = result.observables.find((observable) => observable.id === 'insulinSensitivity');

    expect(inflammation?.baseline).toBeCloseTo(0.18);
    expect(inflammation?.current).toBeCloseTo(DEFAULT_PARAMETERS.inflammation);
    expect(insulin?.current).toBeCloseTo(DEFAULT_PARAMETERS.insulin);
    expect(result.summary).toContain('healthy adult reference');
  });

  it('selection of interventions changes modeled outputs', () => {
    const perturbed = {
      ...DEFAULT_PARAMETERS,
      inflammation: 0.68,
      insulin: 0.32,
      adiposity: 0.72,
      oxidative: 0.62,
      mitochondrial: 0.42,
    };

    const noIntervention = buildSimulationResult({ controls: perturbed, selectedIds: new Set() });
    const withInterventions = buildSimulationResult({
      controls: perturbed,
      selectedIds: new Set(['metformin', 'semaglutide', 'resmetirom']),
    });

    const noGlucose = noIntervention.observables.find((observable) => observable.id === 'glucose')?.current ?? 0;
    const treatedGlucose = withInterventions.observables.find((observable) => observable.id === 'glucose')?.current ?? 0;
    const treatedLiverFat = withInterventions.observables.find((observable) => observable.id === 'liverFat')?.current ?? 1;

    expect(treatedGlucose).toBeLessThan(noGlucose);
    expect(treatedLiverFat).toBeLessThan(noIntervention.observables.find((observable) => observable.id === 'liverFat')?.current ?? 0);
    expect(withInterventions.selectedInterventionEffects.length).toBeGreaterThan(noIntervention.selectedInterventionEffects.length);
  });

  it('ranks pathway and tissue deltas from baseline comparison', () => {
    const result = buildSimulationResult({
      controls: { ...DEFAULT_PARAMETERS, burden: 0.82, inflammation: 0.66 },
      selectedIds: new Set(['trastuzumab', 'tamoxifen']),
    });

    expect(rankTissuesFromResult(result)[0].tissue.name).toBeTruthy();
    expect(rankPathwaysFromResult(result)[0].pathway.name).toBeTruthy();
  });

  it('projects pathway flux onto organs and exposes a broad catalog', () => {
    const projection = pathwayOrganProjection('gluconeogenesis');

    expect(projection.some((flux) => flux.ref === 'liver')).toBe(true);
    expect(INTERVENTIONS.length).toBeGreaterThanOrEqual(18);
  });
});
