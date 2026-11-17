export interface LegendDotProps {
  className: string;
  label: string;
}

export default function LegendDot({ className, label }: LegendDotProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block w-3 h-3 rounded-sm ring-1 ${className}`} />
      {label}
    </span>
  );
}
