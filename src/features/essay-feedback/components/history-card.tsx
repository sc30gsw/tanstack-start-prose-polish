import { ActionIcon, Badge, Card, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { modals } from "@mantine/modals";
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

function trimPrompt(prompt: string, max: number): string {
  return prompt.length > max ? `${prompt.slice(0, max)}…` : prompt;
}

function deriveTitle(mode: string, bodyBefore: string, prompt?: null | string): string {
  const first = bodyBefore.trim();
  const bodyTitle = first.length > 50 ? `${first.slice(0, 50)}…` : first || "（無題）";
  const p = prompt?.trim() ?? "";

  if (mode === "free") {
    return bodyTitle;
  }

  if (mode === "diverse" || mode === "philosophy" || mode === "topic") {
    if (p.length > 0) {
      return trimPrompt(p, 60);
    }
    return bodyTitle;
  }

  return bodyTitle;
}

/** トピック選択モードのみ: 2 行目に文章の冒頭を表示。多様なお題はタイトルにお題のみ。 */
function derivePreview(mode: string, bodyBefore: string, prompt?: null | string): string | null {
  if (mode !== "topic") {
    return null;
  }
  if (prompt == null || prompt.trim().length === 0) {
    return null;
  }
  const firstLine = bodyBefore.trim().split("\n")[0] ?? "";
  if (firstLine.length === 0) {
    return null;
  }
  return firstLine.length > 80 ? `${firstLine.slice(0, 80)}…` : firstLine;
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

  function handleDeleteRequest() {
    modals.openConfirmModal({
      children: <Text size="sm">この作文を履歴から削除しますか？この操作は取り消せません。</Text>,
      confirmProps: { color: "red" },
      labels: { cancel: "キャンセル", confirm: "削除する" },
      onConfirm: () => {
        onDelete(id);
      },
      title: "履歴を削除",
    });
  }

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
            onClick={handleDeleteRequest}
            size="lg"
            style={{ flexShrink: 0 }}
            variant="subtle"
          >
            <IconTrash size={20} />
          </ActionIcon>
        </Group>

        <Group gap="sm" justify="space-between" wrap="wrap">
          <Group gap="sm" wrap="wrap">
            <Badge color={modeColor} size="md" variant="light">
              {modeLabel}
            </Badge>
            <Badge color={statusColor} size="md" variant="dot">
              {statusLabel}
            </Badge>
            {score != null && (
              <Badge color="blue" size="md" variant="outline">
                {score}点
              </Badge>
            )}
            {cefr != null && (
              <Badge color="teal" size="md" variant="outline">
                CEFR {cefr}
              </Badge>
            )}
            {toeicMin != null && toeicMax != null && (
              <Badge color="grape" size="md" variant="outline">
                TOEIC {toeicMin}〜{toeicMax}
              </Badge>
            )}
          </Group>
          <Group c="dimmed" gap={6}>
            <IconCalendar size={16} />
            <Text size="sm">
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
