export const debugLogoTapTarget = 10;
export const debugLogoTapWindowMs = 5000;

export type DebugLogoTapState = {
  count: number;
  firstTapAt: number | null;
};

export const initialDebugLogoTapState: DebugLogoTapState = {
  count: 0,
  firstTapAt: null,
};

export function getNextDebugLogoTapState(
  state: DebugLogoTapState,
  tappedAt: number,
): DebugLogoTapState & { isUnlocked: boolean } {
  const firstTapAt = state.firstTapAt ?? tappedAt;
  const isExpired = tappedAt - firstTapAt > debugLogoTapWindowMs;
  const nextFirstTapAt = isExpired ? tappedAt : firstTapAt;
  const nextCount = isExpired ? 1 : state.count + 1;

  return {
    count: nextCount,
    firstTapAt: nextFirstTapAt,
    isUnlocked: nextCount >= debugLogoTapTarget,
  };
}
