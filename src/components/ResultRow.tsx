interface ResultRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

export default function ResultRow({ label, value, highlight }: ResultRowProps) {
  return (
    <div className={`flex justify-between ${highlight ? 'font-semibold' : ''}`}>
      <span className={highlight ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
      <span className={highlight ? 'text-primary' : 'text-foreground'}>{value}</span>
    </div>
  );
}
