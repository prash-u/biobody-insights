import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Index from '@/pages/Index';

describe('Body Pulse Atlas interactions', () => {
  it('switches top-level workspaces to distinct content', () => {
    render(<Index />);

    fireEvent.click(screen.getByRole('button', { name: 'Pathways' }));
    expect(screen.getByText('Full metabolic pathway workspace with flux, stoichiometry, organ projection, and reference-vs-current moles.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Interventions' }));
    expect(screen.getByText('Broad translational catalog with select/deselect modeling and visible opposing pathway effects.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Reports' }));
    expect(screen.getByText('Generated Systems Biology Report')).toBeInTheDocument();
  });

  it('selecting and deselecting interventions changes selected count', () => {
    render(<Index />);

    fireEvent.click(screen.getByRole('button', { name: 'Interventions' }));
    expect(screen.getAllByText(/1 selected/i).length).toBeGreaterThan(0);

    const semaglutide = screen.getByText('Semaglutide').closest('button');
    expect(semaglutide).not.toBeNull();
    fireEvent.click(semaglutide!);

    expect(screen.getAllByText(/2 selected/i).length).toBeGreaterThan(0);
  });

  it('run simulation opens updated scenario output', () => {
    render(<Index />);

    fireEvent.click(screen.getAllByRole('button', { name: /run simulation/i })[0]);
    expect(screen.getByText('Baseline vs Perturbed Time-Series')).toBeInTheDocument();
    expect(screen.getByText(/Simulation projects/)).toBeInTheDocument();
  });

  it('pathway selection updates the reference pathway detail', () => {
    render(<Index />);

    fireEvent.click(screen.getByRole('button', { name: 'Pathways' }));
    const layerPanel = screen.getByText('Metabolic Layers').closest('section');
    expect(layerPanel).not.toBeNull();
    fireEvent.click(within(layerPanel!).getByText('Gluconeogenesis').closest('button')!);

    const referencePanel = screen.getByText('Healthy Reference Pathway').closest('.pathway-flow-panel');
    expect(referencePanel).not.toBeNull();
    expect(within(referencePanel as HTMLElement).getByText('Gluconeogenesis')).toBeInTheDocument();
  });
});
