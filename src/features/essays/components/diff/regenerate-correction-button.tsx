import type { InstaQLEntity } from "@instantdb/react";
import { Button, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconRefresh } from "@tabler/icons-react";

import type { AppSchema } from "~/db/instant-schema";
import { useAuthUser } from "~/features/auth/hooks/use-auth-user";
import { useRegenerateCorrection } from "~/features/essays/hooks/diff/use-regenerate-correction";
import { useEssayDetail } from "~/features/essays/hooks/use-essay-detail";

export function RegenerateCorrectionButton({
  essayId,
}: Record<"essayId", InstaQLEntity<AppSchema, "essays">["id"]>) {
  const { user } = useAuthUser();
  const { essay } = useEssayDetail(essayId);
  const { error, isPending, regenerate } = useRegenerateCorrection();

  if (!essay?.bodyBefore || !user?.id) {
    return null;
  }

  const userId = user.id;

  function handleRegenerateRequest() {
    modals.openConfirmModal({
      children: (
        <Text size="sm">
          AI添削をやり直しますか？既存のAIコメントは削除されます（自分のコメントは残ります）。
        </Text>
      ),
      labels: { cancel: "キャンセル", confirm: "再実行する" },
      onConfirm: () => {
        if (essay) {
          regenerate(essay, userId);
        }
      },
      title: "AI添削を再実行",
    });
  }

  return (
    <Stack align="flex-end" gap={4}>
      <Button
        leftSection={<IconRefresh size={16} />}
        loading={isPending}
        onClick={handleRegenerateRequest}
        size="sm"
        variant="light"
      >
        AI添削を再実行
      </Button>
      {error != null && (
        <Text c="red" size="xs">
          {error}
        </Text>
      )}
    </Stack>
  );
}
