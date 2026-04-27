import type { InstaQLEntity } from "@instantdb/react";
import {
  ActionIcon,
  Badge,
  Card,
  Group,
  Stack,
  Text,
  ThemeIcon,
  type MantineColor,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconBook2, IconCalendar, IconTrash } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useTransition } from "react";

import { MODE_LABELS } from "~/constants";
import { db } from "~/db/instant";
import type { AppSchema } from "~/db/instant-schema";
import { derivePreview, deriveTitle } from "~/features/essay-feedback/utils/histories";

const MODE_COLORS = {
  diverse: "orange",
  free: "violet",
  philosophy: "orange",
  topic: "blue",
} as const satisfies Record<string, MantineColor>;

const STATUS_COLORS = {
  draft: "gray",
  reviewed: "green",
  scoring: "yellow",
} as const satisfies Record<string, MantineColor>;

const STATUS_LABELS = {
  draft: "下書き",
  reviewed: "添削済み",
  scoring: "採点中",
} as const satisfies Record<string, string>;

export function HistoryCard({
  essay,
}: Record<"essay", InstaQLEntity<AppSchema, "essays", { scoring: {} }>>) {
  const modeLabel = MODE_LABELS[essay.mode as keyof typeof MODE_LABELS] ?? essay.mode;
  const modeColor = MODE_COLORS[essay.mode as keyof typeof MODE_COLORS] ?? "gray";
  const statusLabel = STATUS_LABELS[essay.status as keyof typeof STATUS_LABELS] ?? essay.status;
  const statusColor = STATUS_COLORS[essay.status as keyof typeof STATUS_COLORS] ?? "gray";

  const title = deriveTitle({
    mode: essay.mode,
    bodyBefore: essay.bodyBefore,
    prompt: essay.prompt,
  });
  const preview = derivePreview({
    mode: essay.mode,
    bodyBefore: essay.bodyBefore,
    prompt: essay.prompt,
  });

  return (
    <Card padding="lg" radius="md" shadow="sm" withBorder>
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap">
          <Link
            params={{ essayId: essay.id }}
            search={{ tab: "before" }}
            className="text-decoration-none min-w-0 flex-1"
            to="/essays/$essayId/history"
          >
            <Group gap="sm" wrap="nowrap">
              <ThemeIcon autoContrast color={modeColor} radius="md" size="lg" variant="light">
                <IconBook2 size={18} />
              </ThemeIcon>
              <Stack gap={2} className="min-w-0">
                <Text c="var(--mantine-color-text)" fw={600} lineClamp={1} size="sm">
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
          <HistoryCardDeleteButton id={essay.id} />
        </Group>

        <Group gap="sm" justify="space-between" wrap="wrap">
          <Group gap="sm" wrap="wrap">
            <Badge autoContrast color={modeColor} size="md" variant="light">
              {modeLabel}
            </Badge>
            <Badge autoContrast color={statusColor} size="md" variant="dot">
              {statusLabel}
            </Badge>
            {essay.scoring?.score && (
              <Badge autoContrast color="blue" size="md" variant="outline">
                {essay.scoring.score}点
              </Badge>
            )}
            {essay.scoring?.cefr && (
              <Badge autoContrast color="teal" size="md" variant="outline">
                CEFR {essay.scoring.cefr}
              </Badge>
            )}
            {essay.scoring?.toeicMin && essay.scoring?.toeicMax && (
              <Badge autoContrast color="grape" size="md" variant="outline">
                TOEIC {essay.scoring.toeicMin}〜{essay.scoring.toeicMax}
              </Badge>
            )}
          </Group>
          <Group c="dimmed" gap={6}>
            <IconCalendar size={16} />
            <Text size="sm">{dayjs(essay.createdAt).format("YYYY/M/D HH:mm")}</Text>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
}

function HistoryCardDeleteButton({ id }: Pick<InstaQLEntity<AppSchema, "essays">, "id">) {
  const [isPending, startTransition] = useTransition();

  function handleDeleteRequest() {
    modals.openConfirmModal({
      children: <Text size="sm">この作文を履歴から削除しますか？この操作は取り消せません。</Text>,
      confirmProps: { color: "red" },
      labels: { cancel: "キャンセル", confirm: "削除する" },
      onConfirm: () => {
        startTransition(async () => {
          const tx = db.tx.essays[id];

          if (!tx) {
            return;
          }

          await db.transact(tx.delete());
        });
      },
      title: "履歴を削除",
    });
  }

  return (
    <ActionIcon
      aria-label="履歴を削除"
      color="red"
      onClick={handleDeleteRequest}
      size="lg"
      className="shrink-0"
      title="履歴を削除"
      disabled={isPending}
      variant="light"
    >
      <IconTrash size={20} />
    </ActionIcon>
  );
}
