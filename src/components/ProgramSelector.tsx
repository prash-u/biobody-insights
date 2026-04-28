import { DiseaseProgram } from '@/atlas/types';
import { cn } from '@/lib/utils';

interface ProgramSelectorProps {
  programs: DiseaseProgram[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function ProgramSelector({ programs, activeId, onSelect }: ProgramSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {programs.map(p => {
        const active = p.id === activeId;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={cn(
              'group relative text-left p-4 rounded-2xl border transition-smooth overflow-hidden',
              'hover:border-primary/50 hover:-translate-y-0.5',
              active
                ? 'border-primary/70 bg-primary/[0.06] shadow-glow'
                : 'border-white/[0.08] bg-white/[0.02]',
            )}
          >
            {active && (
              <div className="absolute inset-0 bg-gradient-glow opacity-40 pointer-events-none" />
            )}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="eyebrow">{p.systemFocus}</span>
                <span className={cn(
                  'h-1.5 w-1.5 rounded-full transition-smooth',
                  active ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary))]' : 'bg-muted-foreground/40',
                )} />
              </div>
              <div className="font-display text-base text-foreground leading-tight mb-1">
                {p.name}
              </div>
              <div className="text-[11px] text-muted-foreground leading-snug">
                {p.tagline}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
