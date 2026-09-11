import React from "react";
import {
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  ArrowLeft,
  Check,
  Crown,
  ExternalLink,
  HardDrive,
  ShieldCheck,
  UsersRound,
  Video,
} from "lucide-react-native";

import BillingService from "@/api/billing.service";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { IconButton } from "@/components/ui/IconButton";
import { Radius, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-themes";
import type {
  BillingPlan,
  BillingPlanCode,
  BillingSubscription,
  BillingUsage,
} from "@/types/billing.types";

function formatPrice(plan: BillingPlan) {
  if (
    plan.code === "enterprise" ||
    plan.price_cents_monthly === null
  ) {
    return "Custom";
  }

  if (!plan.price_cents_monthly) {
    return "$0";
  }

  return `$${(plan.price_cents_monthly / 100).toFixed(0)}`;
}

function formatBytes(bytes?: number) {
  const value = Number(bytes ?? 0);

  if (!value) return "0 MB";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(value) / Math.log(1024)),
    units.length - 1,
  );

  return `${(value / Math.pow(1024, index)).toFixed(
    index > 1 ? 1 : 0,
  )} ${units[index]}`;
}

function statusLabel(status?: string) {
  if (!status) return "Free";

  return status.replace(/_/g, " ");
}

export default function BillingSettingsScreen() {
  const { colors } = useAppTheme();

  const [plans, setPlans] = React.useState<BillingPlan[]>([]);
  const [subscription, setSubscription] =
    React.useState<BillingSubscription | null>(null);
  const [usage, setUsage] = React.useState<BillingUsage | null>(
    null,
  );
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [actionPlan, setActionPlan] =
    React.useState<BillingPlanCode | null>(null);
  const [openingPortal, setOpeningPortal] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  const loadBilling = React.useCallback(
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const [nextPlans, nextSubscription, nextUsage] =
          await Promise.all([
            BillingService.listPlans(),
            BillingService.getCurrentSubscription(),
            BillingService.getUsage(),
          ]);

        setPlans(
          [...nextPlans].sort(
            (first, second) =>
              Number(first.sort_order ?? 0) -
              Number(second.sort_order ?? 0),
          ),
        );
        setSubscription(nextSubscription);
        setUsage(nextUsage);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load billing right now.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  React.useEffect(() => {
    void loadBilling();
  }, [loadBilling]);

  const openCheckout = async (planCode: BillingPlanCode) => {
    setActionPlan(planCode);
    setError(null);
    setNotice(null);

    try {
      const session = await BillingService.createCheckout(planCode);

      if (session.url) {
        await WebBrowser.openBrowserAsync(session.url);
        await loadBilling(true);
        return;
      }

      setNotice(
        session.message ||
          "Checkout is not configured yet. Your plan selection was received.",
      );
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Unable to open secure checkout.",
      );
    } finally {
      setActionPlan(null);
    }
  };

  const openPortal = async () => {
    setOpeningPortal(true);
    setError(null);
    setNotice(null);

    try {
      const session = await BillingService.createPortal();

      if (session.url) {
        await WebBrowser.openBrowserAsync(session.url);
        await loadBilling(true);
        return;
      }

      setNotice(
        session.message ||
          "The billing portal is not configured yet.",
      );
    } catch (portalError) {
      setError(
        portalError instanceof Error
          ? portalError.message
          : "Unable to open billing management.",
      );
    } finally {
      setOpeningPortal(false);
    }
  };

  const limits = subscription?.limits;

  return (
    <AppScreen
      tone="aurora"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void loadBilling(true)}
          tintColor={colors.primary}
        />
      }
      contentStyle={styles.content}
    >
      <AppHeader
        size="page"
        eyebrow="Account"
        title="Plan and billing"
        subtitle="Manage meeting limits, recordings, storage, and your Telefya subscription."
        leftSlot={
          <IconButton
            icon={<ArrowLeft color={colors.text} size={20} />}
            variant="soft"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
          />
        }
      />

      {error ? (
        <View
          style={[
            styles.notice,
            {
              backgroundColor: `${colors.danger}12`,
              borderColor: `${colors.danger}45`,
            },
          ]}
        >
          <AppText style={{ color: colors.danger }}>
            {error}
          </AppText>
        </View>
      ) : null}

      {notice ? (
        <View
          style={[
            styles.notice,
            {
              backgroundColor: colors.primarySoft,
              borderColor: `${colors.primary}38`,
            },
          ]}
        >
          <AppText style={{ color: colors.primary }}>
            {notice}
          </AppText>
        </View>
      ) : null}

      <AppCard elevated style={styles.currentPlan}>
        <View style={styles.planHeader}>
          <View
            style={[
              styles.planIcon,
              { backgroundColor: colors.primarySoft },
            ]}
          >
            <Crown color={colors.primary} size={22} />
          </View>

          <View style={styles.planCopy}>
            <AppText variant="caption" tone="muted">
              Current plan
            </AppText>

            <AppText variant="sectionTitle">
              {loading ? "Loading..." : subscription?.plan_name ?? "Free"}
            </AppText>
          </View>

          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: colors.success + "1F",
                borderColor: colors.success + "45",
              },
            ]}
          >
            <AppText
              variant="caption"
              style={{ color: colors.success, fontWeight: "800" }}
            >
              {statusLabel(subscription?.status)}
            </AppText>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.divider }]} />

        <View style={styles.limitGrid}>
          <Limit
            icon={<Video color={colors.primary} size={18} />}
            label="Meeting length"
            value={`${limits?.max_meeting_minutes ?? 40} min`}
          />
          <Limit
            icon={<UsersRound color={colors.secondary} size={18} />}
            label="Participants"
            value={String(limits?.max_participants ?? 4)}
          />
          <Limit
            icon={<HardDrive color={colors.accent} size={18} />}
            label="Storage"
            value={`${limits?.storage_gb ?? 0} GB`}
          />
          <Limit
            icon={<ShieldCheck color={colors.success} size={18} />}
            label="Recording"
            value={
              limits?.recording_enabled ? "Included" : "Not included"
            }
          />
        </View>

        <AppButton
          title={
            openingPortal ? "Opening billing..." : "Manage billing"
          }
          variant="outline"
          loading={openingPortal}
          disabled={openingPortal}
          leftIcon={<ExternalLink color={colors.text} size={18} />}
          onPress={() => void openPortal()}
        />
      </AppCard>

      <View style={styles.sectionHeader}>
        <AppText variant="sectionTitle">This month</AppText>
        <AppText variant="caption" tone="muted">
          Usage resets each billing period.
        </AppText>
      </View>

      <AppCard style={styles.usageCard}>
        <UsageRow
          label="Meeting minutes"
          value={`${usage?.meeting_minutes_used ?? 0} min`}
          color={colors.primary}
        />
        <UsageRow
          label="Recording minutes"
          value={`${usage?.recording_minutes_used ?? 0} min`}
          color={colors.secondary}
        />
        <UsageRow
          label="Storage used"
          value={formatBytes(usage?.storage_bytes_used)}
          color={colors.accent}
          last
        />
      </AppCard>

      <View style={styles.sectionHeader}>
        <AppText variant="sectionTitle">Choose a plan</AppText>
        <AppText variant="caption" tone="muted">
          Upgrades are handled through secure checkout.
        </AppText>
      </View>

      {plans.map((plan) => {
        const isCurrent = plan.code === subscription?.plan_code;
        const busy = actionPlan === plan.code;

        return (
          <AppCard
            key={plan.code}
            elevated={plan.code === "pro"}
            style={[
              styles.planCard,
              isCurrent && {
                borderColor: colors.primary,
                backgroundColor: colors.primarySoft,
              },
            ]}
          >
            <View style={styles.planTitleRow}>
              <View style={styles.planCopy}>
                <AppText variant="sectionTitle">{plan.name}</AppText>

                <AppText variant="caption" tone="muted">
                  {plan.description || "Built for better meetings."}
                </AppText>
              </View>

              <View style={styles.priceCopy}>
                <AppText variant="sectionTitle">
                  {formatPrice(plan)}
                </AppText>

                {formatPrice(plan) !== "Custom" ? (
                  <AppText variant="caption" tone="muted">
                    / month
                  </AppText>
                ) : null}
              </View>
            </View>

            <View style={styles.featureList}>
              <Feature text={`${plan.max_meeting_minutes} minute meetings`} />
              <Feature text={`Up to ${plan.max_participants} participants`} />
              <Feature
                text={
                  plan.recording_enabled
                    ? `${plan.monthly_recording_minutes} recording minutes`
                    : "No meeting recording"
                }
              />
              <Feature text={`${plan.storage_gb} GB storage`} />
            </View>

            <AppButton
              title={
                isCurrent
                  ? "Current plan"
                  : busy
                    ? "Opening checkout..."
                    : plan.code === "enterprise"
                      ? "Contact sales"
                      : `Choose ${plan.name}`
              }
              variant={isCurrent ? "outline" : "gradient"}
              loading={busy}
              disabled={isCurrent || busy}
              onPress={() => void openCheckout(plan.code)}
            />
          </AppCard>
        );
      })}
    </AppScreen>
  );
}

function Limit({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.limit}>
      {icon}
      <View style={styles.limitCopy}>
        <AppText variant="caption" tone="muted">
          {label}
        </AppText>
        <AppText variant="bodyStrong">{value}</AppText>
      </View>
    </View>
  );
}

function UsageRow({
  label,
  value,
  color,
  last = false,
}: {
  label: string;
  value: string;
  color: string;
  last?: boolean;
}) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.usageRow,
        !last && {
          borderBottomColor: colors.divider,
          borderBottomWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      <View style={[styles.usageDot, { backgroundColor: color }]} />
      <AppText style={styles.usageLabel}>{label}</AppText>
      <AppText variant="bodyStrong">{value}</AppText>
    </View>
  );
}

function Feature({ text }: { text: string }) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.feature}>
      <Check color={colors.success} size={16} />
      <AppText variant="caption" tone="muted">
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: Spacing.sixteen,
  },

  notice: {
    borderWidth: 1,
    borderRadius: Radius.medium,
    padding: Spacing.three,
  },

  currentPlan: {
    gap: Spacing.four,
  },

  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },

  planIcon: {
    width: 46,
    height: 46,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  planCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  statusPill: {
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: 5,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
  },

  limitGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
  },

  limit: {
    width: "46%",
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  limitCopy: {
    flex: 1,
    gap: 2,
  },

  sectionHeader: {
    gap: 3,
    marginTop: Spacing.two,
  },

  usageCard: {
    paddingVertical: Spacing.one,
  },

  usageRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },

  usageDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.pill,
  },

  usageLabel: {
    flex: 1,
  },

  planCard: {
    gap: Spacing.four,
  },

  planTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.three,
  },

  priceCopy: {
    alignItems: "flex-end",
    gap: 1,
  },

  featureList: {
    gap: Spacing.two,
  },

  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
});