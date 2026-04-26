import { Grid, GridCol, Select, TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconFilter, IconSearch } from "@tabler/icons-react";
import { getRouteApi } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { MODE_LABELS } from "~/constants";
import type { EssaysModeFilter } from "~/features/essay-feedback/schemas/search-params/essays-search-params";

const routeApi = getRouteApi("/_authenticated/essays/");

export function EssaySearch() {
  return (
    <Grid align="flex-end" gap="md" w="100%">
      <GridCol span={{ base: 12, md: 8 }}>
        <EssaySearchTextInput />
      </GridCol>
      <GridCol span={{ base: 12, md: 4 }}>
        <EssaySearchModeSelect />
      </GridCol>
    </Grid>
  );
}

function EssaySearchTextInput() {
  const { q } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const [value, setValue] = useState(q);
  const [debouncedQ] = useDebouncedValue(value, 200);

  useEffect(() => {
    setValue(q);
  }, [q]);

  useEffect(() => {
    if (debouncedQ !== value) {
      return;
    }

    if (debouncedQ === q) {
      return;
    }

    navigate({
      replace: true,
      search: (prev) => ({ ...prev, page: 1, q: debouncedQ }),
    });
  }, [debouncedQ, navigate, q, value]);

  return (
    <TextInput
      aria-label="履歴をキーワード検索"
      leftSection={<IconSearch size={18} />}
      onChange={(e) => {
        setValue(e.currentTarget.value);
      }}
      placeholder="タイトル・本文の内容で検索"
      size="md"
      value={value}
      w="100%"
    />
  );
}

const MODE_FILTER_OPTIONS = [
  { label: "すべて", value: "all" },
  { label: MODE_LABELS.free, value: "free" },
  { label: MODE_LABELS.topic, value: "topic" },
  { label: MODE_LABELS.diverse, value: "diverse" },
] as const satisfies {
  label: "すべて" | (typeof MODE_LABELS)[keyof typeof MODE_LABELS];
  value: "all" | keyof typeof MODE_LABELS;
}[];

function EssaySearchModeSelect() {
  const { mode } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const setMode = (m: null | EssaysModeFilter) => {
    const next = m ?? "all";

    navigate({ replace: true, search: (prev) => ({ ...prev, mode: next, page: 1 }) });
  };

  return (
    <Select
      aria-label="作文モードで絞り込み"
      data={[...MODE_FILTER_OPTIONS]}
      leftSection={<IconFilter size={18} />}
      maw={{ base: "100%", md: 320 }}
      miw={{ base: 0, md: 200 }}
      onChange={(v) => {
        setMode(v);
      }}
      placeholder="モードを選択"
      size="md"
      value={mode}
      w="100%"
    />
  );
}
