// utils/sort.ts
export function sortBy<T>(
    arr: T[] | undefined,
    getOrder: (item: T, index: number) => number | null | undefined
  ): T[] {
    if (!arr?.length) return [];
    // do not mutate caller's array
    return [...arr].sort((a, b) => {
      const ao = getOrder(a, 0);
      const bo = getOrder(b, 0);
      const an = ao ?? Number.MAX_SAFE_INTEGER;
      const bn = bo ?? Number.MAX_SAFE_INTEGER;
      return an - bn;
    });
  }