import { Alert, Button, Stack, Text, type MantineColor } from "@mantine/core";

type ErrorRetryAlertProps = {
  color?: MantineColor;
  message: string;
  onRetry: () => void;
  retryLabel?: string;
  retryLoading?: boolean;
  title: string;
};

export function ErrorRetryAlert({
  color = "red",
  message,
  onRetry,
  retryLabel = "再試行",
  retryLoading = false,
  title,
}: ErrorRetryAlertProps) {
  return (
    <Alert color={color} title={title} variant="light">
      <Stack align="flex-start" gap="sm">
        <Text size="md">{message}</Text>
        <Button loading={retryLoading} onClick={onRetry} size="sm" variant="light">
          {retryLabel}
        </Button>
      </Stack>
    </Alert>
  );
}
