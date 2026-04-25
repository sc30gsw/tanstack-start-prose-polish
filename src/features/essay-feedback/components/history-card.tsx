import { ActionIcon, Badge, Card, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconBook2, IconCalendar, IconTrash } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

type HistoryCardProps = {
  bodyBefore: string;
  cefr?: null | string;
  createdAt: Date;
  id: string;
  mode: string;
  onDelete: (id: string) => void;
  prompt?: null | string;
  score?: null | number;
  status: string;
  toeicMax?: null | number;
  toeicMin?: null | number;
};

const MODE_LABELS = {
  diverse: "多様なお題",
  free: "自由作文",
  /** 旧 `mode` 文字列。InstantDB 上の既存レコード用 */
  philosophy: "多様なお題",
  topic: "トピック選択",
} as const satisfies Record<string, string>;

const MODE_COLORS = {
  diverse: "orange",
  free: "violet",
  philosophy: "orange",
  topic: "blue",
} as const satisfies Record<string, string>;

const STATUS_COLORS = {
  draft: "gray",
  reviewed: "green",
  scoring: "yellow",
} as const satisfies Record<string, string>;

const STATUS_LABELS = {
  draft: "下書き",
  reviewed: "添削済み",
  scoring: "採点中",
} as const satisfies Record<string, string>;

function deriveTitle(mode: string, bodyBefore: string, prompt?: null | string): string {
  if (
    (mode === "topic" || mode === "diverse" || mode === "philosophy") &&
    prompt != null &&
    prompt.trim().length > 0
  ) {
    return prompt.length > 60 ? `${prompt.slice(0, 60)}…` : prompt;
  }
  const first = bodyBefore.trim();
  return first.length > 50 ? `${first.slice(0, 50)}…` : first || "（無題）";
}

function derivePreview(mode: string, bodyBefore: string, prompt?: null | string): string | null {
  if (
    (mode === "topic" || mode === "diverse" || mode === "philosophy") &&
    prompt != null &&
    prompt.trim().length > 0
  ) {
    const firstLine = bodyBefore.trim().split("\n")[0] ?? "";
    return firstLine.length > 80 ? `${firstLine.slice(0, 80)}…` : firstLine || null;
  }
  return null;
}

export function HistoryCard({
  id,
  mode,
  status,
  createdAt,
  score,
  cefr,
  toeicMin,
  toeicMax,
  bodyBefore,
  prompt,
  onDelete,
}: HistoryCardProps) {
  const modeLabel = MODE_LABELS[mode as keyof typeof MODE_LABELS] ?? mode;
  const modeColor = MODE_COLORS[mode as keyof typeof MODE_COLORS] ?? "gray";
  const statusLabel = STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status;
  const statusColor = STATUS_COLORS[status as keyof typeof STATUS_COLORS] ?? "gray";
  const title = deriveTitle(mode, bodyBefore, prompt);
  const preview = derivePreview(mode, bodyBefore, prompt);

  return (
    <Card padding="lg" radius="md" shadow="sm" withBorder>
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap">
          <Link
            params={{ essayId: id }}
            search={{ tab: "before", view: "split" }}
            style={{ flex: 1, minWidth: 0, textDecoration: "none" }}
            to="/essays/$essayId/history"
          >
            <Group gap="sm" wrap="nowrap">
              <ThemeIcon color={modeColor} radius="md" size="lg" variant="light">
                <IconBook2 size={18} />
              </ThemeIcon>
              <Stack gap={2} style={{ minWidth: 0 }}>
                <Text c="dark" fw={600} lineClamp={1} size="sm">
                  {title}
                </Text>
                {preview != null && preview.length > 0 && (
                  <Text c="dimmed" lineClamp={1} size="xs">
                    {preview}
                  </Text>
                )}
              </Stack>
            </Group>
          </Link>
          <ActionIcon
            aria-label="履歴を削除"
            color="red"
            onClick={() => onDelete(id)}
            size="sm"
            style={{ flexShrink: 0 }}
            variant="subtle"
          >
            <IconTrash size={14} />
          </ActionIcon>
        </Group>

        <Group gap="xs" justify="space-between" wrap="wrap">
          <Group gap="xs">
            <Badge color={modeColor} size="sm" variant="light">
              {modeLabel}
            </Badge>
            <Badge color={statusColor} size="sm" variant="dot">
              {statusLabel}
            </Badge>
            {score != null && (
              <Badge color="blue" size="sm" variant="outline">
                {score}点
              </Badge>
            )}
            {cefr != null && (
              <Badge color="teal" size="sm" variant="outline">
                CEFR {cefr}
              </Badge>
            )}
            {toeicMin != null && toeicMax != null && (
              <Badge color="grape" size="sm" variant="outline">
                TOEIC {toeicMin}〜{toeicMax}
              </Badge>
            )}
          </Group>
          <Group c="dimmed" gap={4}>
            <IconCalendar size={12} />
            <Text size="xs">
              {new Date(createdAt).toLocaleString("ja-JP", {
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                month: "numeric",
                year: "numeric",
              })}
            </Text>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
}
