export type EditSegment = "hours" | "minutes" | "seconds";

const baseMultipliers: Record<EditSegment, number> = {
  hours: 3600,
  minutes: 60,
  seconds: 1,
};

export function stepForSegment(segment: EditSegment): number {
  return baseMultipliers[segment];
}

export function computeAdjustment(
  segment: EditSegment,
  direction: 1 | -1,
  opts?: { shiftKey?: boolean }
): number {
  const factor = opts?.shiftKey ? 10 : 1;
  return direction * stepForSegment(segment) * factor;
}

