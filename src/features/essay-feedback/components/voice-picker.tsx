import {
  Avatar,
  CloseButton,
  Combobox,
  Group,
  Highlight,
  Indicator,
  InputBase,
  Stack,
  Text,
  useCombobox,
} from "@mantine/core";
import { useEffect, useState } from "react";

import {
  getSlotAccentMeta,
  getVoiceAvatarUrl,
  getVoiceInitial,
  getVoiceMeta,
  type TtsLangCode,
} from "~/features/essay-feedback/utils/tts-voice";

type VoicePickerProps = {
  disabled?: boolean;
  onChange: (uri: string) => void;
  onClear?: () => void;
  selectedVoiceURI: string | null;
  voices: SpeechSynthesisVoice[];
  voiceLabelJaByUri?: Record<string, string>;
  voiceSlotAccentByUri?: Record<string, TtsLangCode>;
};

type VoiceRowProps = {
  curatedLabelJa?: string;
  highlight?: string;
  slotAccent?: TtsLangCode;
  voice: SpeechSynthesisVoice;
};

function VoiceRow({ curatedLabelJa, highlight, slotAccent, voice }: VoiceRowProps) {
  const meta = slotAccent ? getSlotAccentMeta(slotAccent) : getVoiceMeta(voice);

  return (
    <Group gap="sm" wrap="nowrap">
      <Indicator
        color="transparent"
        inline
        label={
          <span aria-label={meta.label} className="text-base leading-none">
            {meta.flag}
          </span>
        }
        offset={4}
        position="bottom-end"
        size={18}
      >
        <Avatar
          alt={voice.name}
          color={meta.color}
          radius="xl"
          size="md"
          src={getVoiceAvatarUrl(voice)}
        >
          {getVoiceInitial(voice.name)}
        </Avatar>
      </Indicator>
      <Stack gap={2}>
        <Highlight fw={500} highlight={highlight ?? ""} lh={1.2} size="sm">
          {voice.name}
        </Highlight>
        <Highlight c="dimmed" highlight={highlight ?? ""} lh={1.2} size="xs">
          {curatedLabelJa ?? `${meta.label} · ${voice.localService ? "local" : "cloud"}`}
        </Highlight>
      </Stack>
    </Group>
  );
}

export function VoicePicker({
  disabled = false,
  onChange,
  onClear,
  selectedVoiceURI,
  voiceLabelJaByUri,
  voiceSlotAccentByUri,
  voices,
}: VoicePickerProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [search, setSearch] = useState("");

  const selectedVoice = voices.find((v) => v.voiceURI === selectedVoiceURI) ?? null;
  const selectedSlotAccent =
    selectedVoice && selectedVoiceURI ? voiceSlotAccentByUri?.[selectedVoiceURI] : undefined;
  const selectedMeta = selectedVoice
    ? selectedSlotAccent
      ? getSlotAccentMeta(selectedSlotAccent)
      : getVoiceMeta(selectedVoice)
    : null;
  const isEmpty = voices.length === 0;
  const canClear = Boolean(selectedVoiceURI && onClear);

  useEffect(() => {
    if (selectedVoice && !combobox.dropdownOpened) {
      setSearch(selectedVoice.name);
    }
  }, [selectedVoice?.voiceURI, combobox.dropdownOpened, selectedVoice]);

  const shouldFilterOptions = voices.every((v) => v.name !== search);
  const filteredVoices = shouldFilterOptions
    ? voices.filter((v) => {
        const q = search.toLowerCase().trim();
        if (!q) return true;
        const slot = voiceSlotAccentByUri?.[v.voiceURI];
        const meta = slot ? getSlotAccentMeta(slot) : getVoiceMeta(v);
        const labelJa = voiceLabelJaByUri?.[v.voiceURI];
        return (
          v.name.toLowerCase().includes(q) ||
          meta.label.toLowerCase().includes(q) ||
          (labelJa?.toLowerCase().includes(q) ?? false)
        );
      })
    : voices;

  return (
    <Combobox
      onOptionSubmit={(uri) => {
        const v = voices.find((voice) => voice.voiceURI === uri);
        onChange(uri);
        setSearch(v?.name ?? "");
        combobox.closeDropdown();
      }}
      store={combobox}
    >
      <Combobox.Target>
        <InputBase
          disabled={disabled || isEmpty}
          label="読み上げ音声"
          leftSection={
            selectedMeta ? (
              <Text aria-hidden size="md">
                {selectedMeta.flag}
              </Text>
            ) : null
          }
          onBlur={() => {
            combobox.closeDropdown();
            setSearch(selectedVoice?.name ?? "");
          }}
          onChange={(e) => {
            combobox.updateSelectedOptionIndex();
            setSearch(e.currentTarget.value);
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          placeholder={isEmpty ? "対応音声がありません" : "音声を検索..."}
          rightSection={
            canClear ? (
              <CloseButton
                aria-label="音声の選択を解除"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  onClear?.();
                  setSearch("");
                }}
                size="sm"
              />
            ) : (
              <Combobox.Chevron />
            )
          }
          rightSectionPointerEvents={canClear ? "all" : "none"}
          size="sm"
          value={search}
          w="100%"
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options mah={240} style={{ overflowY: "auto" }}>
          {filteredVoices.length > 0 ? (
            filteredVoices.map((v) => (
              <Combobox.Option key={v.voiceURI} value={v.voiceURI}>
                <VoiceRow
                  curatedLabelJa={voiceLabelJaByUri?.[v.voiceURI]}
                  highlight={shouldFilterOptions ? search.trim() : ""}
                  slotAccent={voiceSlotAccentByUri?.[v.voiceURI]}
                  voice={v}
                />
              </Combobox.Option>
            ))
          ) : (
            <Combobox.Empty>一致する音声が見つかりません</Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
