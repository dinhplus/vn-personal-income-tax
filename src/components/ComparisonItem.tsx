import { formatVND } from '@/lib/tax/utils';

interface ComparisonItemProps {
  label: string;
  value: number;
}

export default function ComparisonItem({ label, value }: ComparisonItemProps) {
  const isPositive = value > 0;
  const isZero = value === 0;
  
  return (
    <div className="text-center">
      <div className="text-sm text-accent-foreground">{label}</div>
      <div className={`mt-1 text-lg font-bold ${
        isZero ? 'text-accent-foreground' : isPositive ? 'text-success' : 'text-error'
      }`}>
        {isPositive && '+'}{formatVND(value)}
      </div>
    </div>
  );
}
