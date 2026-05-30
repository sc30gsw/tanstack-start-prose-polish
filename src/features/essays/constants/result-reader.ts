export const ACCENT_OPTIONS = [
  { value: "american-female", label: "Samantha" },
  { value: "british-male", label: "Daniel" },
] as const satisfies Record<string, string>[];

export const MODE_OPTIONS = [
  { value: "aloud", label: "音読" },
  { value: "shadowing", label: "シャドーイング" },
] as const satisfies Record<string, string>[];
