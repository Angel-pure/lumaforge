export const PLAN_LIMITS = {
  FREE: { generations: 3 },
  CREATOR: { generations: 100 },
  TEAM: { generations: 500 },
  SCALE: { generations: Number.MAX_SAFE_INTEGER },
} as const;

export type Plan = keyof typeof PLAN_LIMITS;

export function canGenerate(plan: Plan, used: number) {
  return used < PLAN_LIMITS[plan].generations;
}
