import {
  Box,
  Button,
  Card,
  Container,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  type MantineColor,
} from "@mantine/core";
import {
  IconChevronRight,
  IconHeadphones,
  IconLayoutGrid,
  IconPencilPlus,
  IconSparkles,
  IconTargetArrow,
} from "@tabler/icons-react";
import { ClientOnly, Link, createFileRoute } from "@tanstack/react-router";

import { RecentHistoryList } from "~/features/essays/components/recent-history-list";

export const Route = createFileRoute("/_authenticated/")({
  component: HomePage,
});

const FEATURES = [
  {
    color: "indigo",
    description: "書いた英文を AI が自動添削。変更箇所を Diff で確認しながら学習できます。",
    Icon: IconSparkles,
    title: "AI 自動添削",
  },
  {
    color: "teal",
    description: "CEFR・TOEIC 相当スコアをストリーミング採点でリアルタイムに算出します。",
    Icon: IconTargetArrow,
    title: "CEFR / TOEIC 推定",
  },
  {
    color: "orange",
    description: "自由作文・トピック選択・多様なお題の 3 モードから自分に合った方法で書けます。",
    Icon: IconLayoutGrid,
    title: "3 つの作文モード",
  },
  {
    color: "grape",
    description: "AI コメントに返信して深掘り。ネイティブ音声での読み上げでリスニングも鍛えます。",
    Icon: IconHeadphones,
    title: "TTS & AI コメント",
  },
] as const satisfies readonly {
  color: MantineColor;
  description: string;
  Icon: React.FC<Partial<Record<"size", number>>>;
  title: string;
}[];

function HomePage() {
  return (
    <Container py={{ base: "md", md: "xl" }} size="lg">
      <Stack
        align="center"
        gap="lg"
        maw={720}
        mx="auto"
        pb={{ base: "lg", md: "xl" }}
        pt="md"
        ta="center"
      >
        <Title order={1} className="text-[clamp(1.9rem,4.5vw,2.75rem)] leading-1.25">
          あなたの英文を、磨き上げる。
        </Title>
        <Text c="dimmed" maw={560} size="lg" className="leading-1.65">
          書いた英文を AI が添削し、CEFR・TOEIC 相当のスコアを即時に推定。Diff 上で AI
          コメントに返信したり、ネイティブ読み上げで発音も確認できます。
        </Text>
        <Button
          leftSection={<IconPencilPlus size={20} />}
          renderRoot={(props) => <Link to="/essays/new" {...props} />}
          size="lg"
        >
          新しい作文を始める
        </Button>
      </Stack>

      <SimpleGrid
        cols={{ base: 1, sm: 2 }}
        mt={{ base: "xl", md: 48 }}
        spacing="lg"
        verticalSpacing="lg"
      >
        {FEATURES.map(({ color, description, Icon, title }) => (
          <Card key={title} padding="lg" radius="md" shadow="sm" withBorder>
            <ThemeIcon color={color} mb="md" radius="md" size="xl" variant="light">
              <Icon size={26} />
            </ThemeIcon>
            <Text fw={600} mb="xs" size="md">
              {title}
            </Text>
            <Text c="dimmed" size="sm" className="leading-1.6">
              {description}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      <Paper
        mt={{ base: 36, md: 48 }}
        p={{ base: "md", sm: "xl" }}
        radius="md"
        shadow="sm"
        withBorder
      >
        <Group align="flex-end" justify="space-between" mb="lg" wrap="wrap">
          <Box>
            <Title order={2} size="h3">
              学習履歴
            </Title>
            <Text c="dimmed" mt={6} size="sm">
              直近 5 件
            </Text>
          </Box>
          <Button
            rightSection={<IconChevronRight size={18} />}
            size="sm"
            variant="light"
            renderRoot={(props) => <Link to="/essays" {...props} />}
          >
            履歴一覧
          </Button>
        </Group>
        <ClientOnly
          fallback={
            <Stack align="center" py="xl">
              <Loader aria-label="履歴を読み込み中" />
            </Stack>
          }
        >
          <RecentHistoryList />
        </ClientOnly>
      </Paper>
    </Container>
  );
}
