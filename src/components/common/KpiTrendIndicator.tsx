import { ArrowDownRight, ArrowUpRight, Circle } from "lucide-react";

type KpiTrendIndicatorProps = {
  value: number;
  previousValue?: number | null;
  label: string;
};

export function KpiTrendIndicator({ value, previousValue, label }: KpiTrendIndicatorProps) {
  const hasBaseline = typeof previousValue === "number";
  const direction = !hasBaseline || value === previousValue ? "neutral" : value > previousValue ? "up" : "down";
  const difference = hasBaseline ? Math.abs(value - previousValue) : 0;
  const Icon = direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Circle;
  const changeText = direction === "neutral" ? label : `${direction === "up" ? "+" : "−"}${Number.isInteger(difference) ? difference : difference.toFixed(1)} · ${label}`;

  return (
    <span className={`kpi-trend-indicator ${direction}`} title={`Previous value: ${hasBaseline ? previousValue : "No baseline yet"}`}>
      <Icon size={13} fill={direction === "neutral" ? "currentColor" : "none"} />
      <span>{changeText}</span>
    </span>
  );
}

export default KpiTrendIndicator;
