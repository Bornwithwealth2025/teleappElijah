import React from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Constants from "expo-constants";
import {
  Check,
  CircleAlert,
  LockKeyhole,
  Sparkles,
  X,
} from "lucide-react-native";

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
      return "Keep your real camera background.";
    case "blur-light":
      return "A subtle blur behind you.";
    case "blur-medium":
      return "Privacy with a natural appearance.";
    case "blur-heavy":
      return "Hide more of your surroundings.";
    case "ocean":
      return "A calm ocean background.";
    case "office":
      return "A professional workspace.";
    case "mountains":
      return "A scenic mountain background.";
    default:
      return "Video background effect.";
  }
}

export function VideoEffectsSheet({
  visible,
  selectedEffect,
  busy = false,
  onClose,
  onSelect,
}: Props) {
  const { colors, isDark } = useAppTheme();

  // Video filters require the custom Telefya native build.
  const isExpoGo = Constants.appOwnership === "expo";

  function handleSelect(effectId: VideoEffectId) {
    if (busy || isExpoGo) {
      return;
    }

    onSelect(effectId);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable
          style={[styles.backdrop, { backgroundColor: colors.overlay }]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close camera effects"
        />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: isDark
                ? "rgba(9, 21, 45, 0.99)"
                : colors.card,
              borderColor: isDark
                ? "rgba(255,255,255,0.12)"
                : colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.topHighlight,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.12)"
                  : colors.glassHighlight,
              },
            ]}
          />

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
                <Sparkles color={colors.primary} size={19} />
              </View>

              <View style={styles.titleCopy}>
                <AppText variant="sectionTitle">
                  Video effects
                </AppText>

                <AppText variant="caption" tone="muted">
                  Blur your background or choose a virtual scene.
                </AppText>
              </View>
            </View>

            <IconButton
              icon={<X color={colors.text} size={20} />}
              variant="surface"
              size={38}
              accessibilityLabel="Close video effects"
              onPress={onClose}
            />
          </View>

          {isExpoGo ? (
            <View
              style={[
                styles.notice,
                {
                  backgroundColor: colors.secondarySoft,
                  borderColor: `${colors.secondary}40`,
                },
              ]}
            >
              <LockKeyhole color={colors.secondary} size={18} />

              <View style={styles.noticeCopy}>
                <AppText
                  variant="caption"
                  style={{ color: colors.secondary, fontWeight: "800" }}
                >
                  Requires the Telefya development build
                </AppText>

                <AppText variant="caption" tone="muted">
                  Expo Go cannot apply native video effects to your meeting
                  camera.
                </AppText>
              </View>
            </View>
          ) : (
            <View
              style={[
                styles.notice,
                {
                  backgroundColor: colors.primarySoft,
                  borderColor: `${colors.primary}32`,
                },
              ]}
            >
              <CircleAlert color={colors.primary} size={18} />

              <View style={styles.noticeCopy}>
                <AppText
                  variant="caption"
                  style={{ color: colors.primary, fontWeight: "800" }}
                >
                  Effects apply to your outgoing video
                </AppText>

                <AppText variant="caption" tone="muted">
                  Start your camera first, then select an effect.
                </AppText>
              </View>
            </View>
          )}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.options}
          >
            {VIDEO_EFFECT_OPTIONS.map((effect) => {
              const selected = effect.id === selectedEffect;
              const isNone = effect.kind === "none";

              return (
                <Pressable
                  key={effect.id}
                  disabled={busy || isExpoGo}
                  onPress={() => handleSelect(effect.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${effect.label} video effect`}
                  accessibilityState={{
                    selected,
                    disabled: busy || isExpoGo,
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      backgroundColor: selected
                        ? `${colors.primary}14`
                        : isDark
                          ? "rgba(255,255,255,0.045)"
                          : colors.surface,
                      borderColor: selected
                        ? colors.primary
                        : isDark
                          ? "rgba(255,255,255,0.1)"
                          : colors.border,
                      opacity:
                        busy || isExpoGo ? 0.5 : pressed ? 0.76 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.preview,
                      {
                        backgroundColor: isNone
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
                          isNone ? colors.textMuted : colors.secondary
                        }
                        size={24}
                      />
                    )}

                    {selected ? (
                      <View
                        style={[
                          styles.selectedOverlay,
                          { backgroundColor: `${colors.primary}55` },
                        ]}
                      >
                        <Check color="#FFFFFF" size={20} strokeWidth={3} />
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.optionCopy}>
                    <View style={styles.optionTitleRow}>
                      <AppText variant="bodyStrong">
                        {effect.label}
                      </AppText>

                      {selected ? (
                        <View
                          style={[
                            styles.activePill,
                            { backgroundColor: colors.primarySoft },
                          ]}
                        >
                          <AppText
                            variant="label"
                            style={{
                              color: colors.primary,
                              fontSize: 9,
                            }}
                          >
                            Active
                          </AppText>
                        </View>
                      ) : null}
                    </View>

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
    maxHeight: "84%",
    overflow: "hidden",
    borderTopWidth: 1,
    borderTopLeftRadius: Radius.xLarge,
    borderTopRightRadius: Radius.xLarge,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },

  topHighlight: {
    position: "absolute",
    top: 0,
    left: 28,
    right: 28,
    height: 1,
  },

  handleWrap: {
    alignItems: "center",
    paddingTop: Spacing.two,
  },

  handle: {
    width: 42,
    height: 4,
    borderRadius: Radius.pill,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },

  headerCopy: {
    flex: 1,
    minWidth: 0,
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
    minWidth: 0,
    gap: 3,
  },

  notice: {
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },

  noticeCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },

  options: {
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },

  option: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.large,
  },

  preview: {
    width: 60,
    height: 60,
    borderRadius: Radius.medium,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  previewImage: {
    width: "100%",
    height: "100%",
  },

  selectedOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },

  optionCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },

  optionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },

  activePill: {
    borderRadius: Radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },

  check: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
});