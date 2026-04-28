# BioBody Insights

**BioBody Insights** is an interactive whole body systems biology atlas for exploring how genes, proteins, pathways and metabolic flux can map onto tissues. It presents molecular signals as a visual, tissue anchored interface so biological narratives can be inspected at organ, pathway and gene level.

The current application ships as **Body Pulse Atlas**, a dark, lab grade React interface for translational biology demos, portfolio presentation and future decision support prototyping.

## Why this exists

Modern biological questions rarely sit in one layer. A disease mechanism can start with a gene, flow through an enzyme or pathway, alter metabolic flux and ultimately appear as tissue level consequence. BioBody Insights is built to make that chain easier to see.

The app connects:

* disease programs
* tissues and organ systems
* pathways and metabolic routes
* genes, proteins and enzymes
* directional biological states such as up, down, baseline and dysregulated
* interactive visual inspection through a body atlas

## Current capabilities

* Interactive SVG body model with selectable tissue nodes
* Disease program selector with curated biological narratives
* Tissue effect ranking by weight and biological state
* Pathway and gene panels linked to the active program
* Metabolic pathway layer view with organ level pulse mapping
* Flux style pathway panels showing healthy baseline, projected current state and relative delta
* Responsive glassmorphism interface built for demo and portfolio use
* Strong separation between biological data, state logic and visual components

## Example use cases

* Explain how a disease program affects multiple tissues
* Show how pathway activity maps to organ level consequence
* Compare gene, pathway and tissue effects in a single interface
* Prototype translational research dashboards
* Present biomedical mechanisms in a visual, executive friendly format
* Explore future product ideas around biological knowledge graphs

## Tech stack

* **React 18**
* **TypeScript**
* **Vite**
* **Tailwind CSS**
* **shadcn/ui style component system**
* **Radix UI primitives**
* **Lucide React icons**
* **TanStack Query**
* **Recharts**
* **Vitest**

## Repository structure

```text
src/
  atlas/
    data.ts          Curated tissue, gene, pathway and metabolic layer data
    types.ts         Shared biological domain types
    useAtlas.ts      Program selection, focus state and derived atlas logic
  components/
    BodyModel.tsx    Interactive anatomical SVG body atlas
    EntityRow.tsx    Reusable row for tissues, pathways and genes
    ProgramSelector.tsx
  pages/
    Index.tsx        Main application page and dashboard composition
```

## Getting started

### Prerequisites

Use a current Node.js LTS release and npm.

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

### Run tests

```bash
npm run test
```

### Run linting

```bash
npm run lint
```

## Data model

The atlas is powered by curated TypeScript data in `src/atlas/data.ts`.

Core entities include:

* `TISSUES`: body anchored regions such as brain, liver, muscle, kidney and immune tissue
* `PATHWAYS`: biological pathways such as NF κB signalling, insulin signalling, glycolysis, TCA cycle and oxidative phosphorylation
* `GENES`: genes, proteins, enzymes, receptors and cytokines connected to the biological programs
* `METABOLIC_PATHWAY_LAYERS`: metabolic layers with metabolites, enzymes, tissue flux roles and synthesis rate style weights
* `PROGRAMS`: disease or biological story modules that drive the active view

The current values are demo level, normalized and intended for comparative visualization. They should not be interpreted as patient specific measurements or clinical recommendations.

## Interaction model

The app state is managed through `useAtlas`.

The atlas tracks:

* selected disease program
* selected tissue, pathway or gene focus
* active tissue effects
* active pathway effects
* active gene effects
* derived labels and colours for biological state

The `BodyModel` component receives tissue effects and converts them into visual pulse intensity, tissue colour, hover state and selected state.

## Design principles

* Keep biology inspectable rather than hidden behind abstract charts
* Make cross tissue mechanisms visible at a glance
* Separate curated biological content from UI logic
* Preserve enough scientific detail for credibility without overwhelming the user
* Build a visual language that feels suitable for translational research, product strategy and portfolio presentation

## Roadmap

Planned directions include:

* Add richer disease programs and therapeutic mechanism examples
* Add search across genes, pathways and tissues
* Add confidence or evidence metadata for biological relationships
* Add import support for user supplied omics or assay data
* Add pathway graph visualisations for signalling and metabolism
* Add exportable reports for selected biological stories
* Add richer validation tests around atlas state derivation

## Scientific note

This project is a visualization and prototyping tool. The current biological dataset is curated for demonstration and systems thinking. It is not a diagnostic tool and does not provide medical advice.

## Project status

Active prototype. Core visual atlas, disease program selection, tissue ranking, gene and pathway panels, and metabolic flux views are implemented.
