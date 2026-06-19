export function utilisationPercent(plannedHours: number, capacityHours: number): number {
  if (capacityHours <= 0) return 0;
  return Math.round((plannedHours / capacityHours) * 100);
}

export function isOverAllocated(plannedHours: number, capacityHours: number): boolean {
  return capacityHours > 0 && plannedHours > capacityHours;
}
