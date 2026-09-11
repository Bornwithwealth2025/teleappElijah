import React from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Check, Sparkles, X } from "lucide-react-native";

import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import {
  VIDEO_EFFECT_OPTIONS,
  type VideoEffectId,
} from "@/services/video-effects.service";

type Props = {
  visible: boolean;
  selectedEffect: VideoEffectId;
  busy?: boolean;
  onClose: () => void;
  onSelect: (effectId: VideoEffectId) => void;
};

function getEffectDescription(effectId: VideoEffectId) {
  switch (effectId) {
    case "none":
      return "Use your regular camera background.";
    case "blur-light":
      return "A subtle blur behind you.";
    case "blur-medium":
      return "Balance privacy and a natural look.";
    case "blur-heavy":
      return "Hide your surroundings more strongly.";
    case "ocean":
      return "A calm ocean scene.";
    case "office":
      return "A professional workspace.";
    case "mountains":
      return "A scenic mountain view.";
  }
}

export function VideoEffectsSheet({
  visible,
  selectedEffect,
  busy = false,
  onClose,
  onSelect,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable
          style={[styles.backdrop, { backgroundColor: colors.overlay }]}
          onPress={onClose}
        />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.handleWrap}>
            <View
              style={[
                styles.handle,
                { backgroundColor: colors.borderStrong },
              ]}
            />
          </View>

          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: colors.primarySoft },
                ]}
              >
                <Sparkles color={colors.primary} size={18} />
              </View>

              <View style={styles.titleCopy}>
                <AppText variant="bodyStrong">Camera effects</AppText>

                <AppText variant="caption" tone="muted">
                  Blur your surroundings or choose a virtual background.
                </AppText>
              </View>
            </View>

            <IconButton
              icon={<X color={colors.text} size={20} />}
              variant="surface"
              size={38}
              accessibilityLabel="Close camera effects"
              onPress={onClose}
            />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.options}
          >
            {VIDEO_EFFECT_OPTIONS.map((effect) => {
              const selected = effect.id === selectedEffect;

              return (
                <Pressable
                  key={effect.id}
                  disabled={busy}
                  onPress={() => onSelect(effect.id)}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      backgroundColor: selected
                        ? colors.primarySoft
                        : colors.card,
                      borderColor: selected
                        ? colors.primary
                        : colors.border,
                      opacity: pressed || busy ? 0.76 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.preview,
                      {
                        backgroundColor:
                          effect.kind === "none"
                            ? colors.surfaceStrong
                            : colors.secondarySoft,
                      },
                    ]}
                  >
                    {effect.kind === "image" && effect.imageUrl ? (
                      <Image
                        source={{ uri: effect.imageUrl }}
                        style={styles.previewImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Sparkles
                        color={
                          effect.kind === "none"
                            ? colors.textMuted
                            : colors.secondary
                        }
                        size={24}
                      />
                    )}
                  </View>

                  <View style={styles.optionCopy}>
                    <AppText variant="bodyStrong">{effect.label}</AppText>

                    <AppText variant="caption" tone="muted">
                      {getEffectDescription(effect.id)}
                    </AppText>
                  </View>

                  <View
                    style={[
                      styles.check,
                      {
                        backgroundColor: selected
                          ? colors.primary
                          : "transparent",
                        borderColor: selected
                          ? colors.primary
                          : colors.borderStrong,
                      },
                    ]}
                  >
                    {selected ? (
                      <Check color="#FFFFFF" size={14} strokeWidth={3} />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },

  backdrop: {
    ...StyleSheet.absoluteFill,
  },

  sheet: {
    maxHeight: "78%",
    borderTopWidth: 1,
    borderTopLeftRadius: Radius.large,
    borderTopRightRadius: Radius.large,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
  },

  handleWrap: {
    alignItems: "center",
    paddingVertical: Spacing.three,
  },

  handle: {
    width: 42,
    height: 4,
    borderRadius: 999,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },

  headerCopy: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  titleCopy: {
    flex: 1,
    gap: 3,
  },

  options: {
    gap: Spacing.two,
  },

  option: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.medium,
  },

  preview: {
    width: 58,
    height: 58,
    borderRadius: Radius.small,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  previewImage: {
    width: "100%",
    height: "100%",
  },

  optionCopy: {
    flex: 1,
    gap: 3,
  },

  check: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
});