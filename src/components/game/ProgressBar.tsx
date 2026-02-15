interface ProgressBarProps {
  found: number;
  total: number;
}

export function ProgressBar({ found, total }: ProgressBarProps) {
  const pct = total > 0 ? (found / total) * 100 : 0;

  return (
    <div className="w-full h-1.5 bg-brand-dark/20 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{
          width: `${pct}%`,
          background: 'linear-gradient(90deg, #D4AF37, #22C55E)',
          animation: pct > 80 ? 'progressPulse 1.5s ease-in-out infinite' : undefined,
        }}
      />
    </div>
  );
}
