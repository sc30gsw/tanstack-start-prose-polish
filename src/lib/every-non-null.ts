type NonNullTuple<T extends readonly unknown[]> = {
  [K in keyof T]: NonNullable<T[K]>;
};

export function isEveryNonNull<const T extends readonly unknown[]>(
  values: T,
): values is NonNullTuple<T> {
  return values.every((v) => v !== null);
}
