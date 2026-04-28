import { ProgramEffect } from '@/atlas/types';
import { stateColor, stateLabel } from '@/atlas/useAtlas';
import { cn } from '@/lib/utils';

interface EntityRowProps {
  id: string;
  name: string;
  meta?: string;
  effect?: ProgramEffect;
  active?: boolean;
  onClick?: () => void;
  onHover?: (hover: boolean) => void;
}

export function EntityRow({ id, name, meta, effect, active, onClick, onHover }: EntityRowProps) {
  const color = stateColor(effect?.state);
  const intensity = effect?.weight ?? 0.5;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      className={cn(
        'group w-full text-left px-3 py-2.5 rounded-xl border transition-smooth',
        'flex items-center gap-3',
        'hover:bg-white/[0.04] hover:border-primary/40',
        active
          ? 'bg-white/[0.06] border-primary/60 shadow-[0_0_0_1px_hsl(var(--primary)/0.4)]'
          : 'bg-white/[0.015] border-white/[0.06]',
      )}
    >
      {/* state pill */}
      <span
        className="relative flex-shrink-0 h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
      >
        {effect && (
          <span
            className="absolute inset-0 rounded-full animate-pulse-soft"
            style={{ backgroundColor: color, opacity: 0.4 + 0.4 * intensity }}
          />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[12px] text-foreground truncate">{name}</span>
          {meta && (
            <span className="text-[10px] text-muted-foreground truncate">{meta}</span>
          )}
        </div>
      </div>

      {effect && (
        <span
          className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
          style={{
            color,
            borderColor: color,
            backgroundColor: 'hsl(0 0% 100% / 0.045)',
          }}
        >
          {stateLabel(effect.state)}
        </span>
      )}
    </button>
  );
}
