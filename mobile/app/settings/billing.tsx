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

  if (!value) {
    return "0 MB";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(value) / Math.log(1024)),
    units.length - 1,
  );

  return `${(value / Math.pow(1024, index)).toFixed(
    index > 1 ? 1 : 0,
  )} ${units[index]}`;
}

function formatStatus(status?: string) {
  if (!status) {
    return "Free";
  }

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function UsageRow({
  color,
  label,
  value,
  last = false,
}: {
  color: string;
  label: string;
  value: string;
  last?: boolean;
}) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.usageRow,
        !last && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.divider,
        },
      ]}
    >
      <View style={[styles.usageDot, { backgroundColor: color }]} />

      <AppText variant="caption" tone="muted" style={styles.usageLabel}>
        {label}
      </AppText>

      <AppText variant="bodyStrong">{value}</AppText>
    </View>
  );
}

function PlanFeature({ children }: { children: string }) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.feature}>
      <Check color={colors.success} size={16} />

      <AppText variant="caption" tone="muted">
        {children}
      </AppText>
    </View>
  );
}

export default function BillingSettingsScreen() {
  const { colors } = useAppTheme();

  const [plans, setPlans] = React.useState<BillingPlan[]>([]);
  const [subscription, setSubscription] =
    React.useState<BillingSubscription | null>(null);
  const [usage, setUsage] = React.useState<BillingUsage | null>(null);

  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [actionPlan, setActionPlan] =
    React.useState<BillingPlanCode | null>(null);
  const [isOpeningPortal, setIsOpeningPortal] = React.useState(false);

  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  const loadBilling = React.useCallback(
    async (refresh = false) => {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
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
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [],
  );

  React.useEffect(() => {
    void loadBilling();
  }, [loadBilling]);

  async function openCheckout(planCode: BillingPlanCode) {
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
  }

  async function openPortal() {
    setIsOpeningPortal(true);
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
      setIsOpeningPortal(false);
    }
  }

  const limits = subscription?.limits;

  return (
    <AppScreen
      tone="aurora"
      contentStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => void loadBilling(true)}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <AppHeader
        eyebrow="SUBSCRIPTION"
        title="Plan and billing"
        subtitle="Manage your Telefya plan, meeting capacity, recordings, and storage."
        size="page"
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
              backgroundColor: `${colors.danger}10`,
              borderColor: `${colors.danger}35`,
            },
          ]}
        >
          <AppText
            variant="caption"
            style={{ color: colors.danger, fontWeight: "700" }}
          >
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
              borderColor: `${colors.primary}30`,
            },
          ]}
        >
          <AppText
            variant="caption"
            style={{ color: colors.primary, fontWeight: "700" }}
          >
            {notice}
          </AppText>
        </View>
      ) : null}

      <AppCard elevated style={styles.currentPlanCard}>
        <View style={styles.currentPlanHeader}>
          <View
            style={[
              styles.planIcon,
              { backgroundColor: colors.primarySoft },
            ]}
          >
            <Crown color={colors.primary} size={23} />
          </View>

          <View style={styles.currentPlanCopy}>
            <AppText variant="caption" tone="muted">
              CURRENT PLAN
            </AppText>

            <AppText variant="sectionTitle">
              {isLoading
                ? "Loading plan…"
                : subscription?.plan_name ?? "Free"}
            </AppText>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: `${colors.success}14`,
                borderColor: `${colors.success}30`,
              },
            ]}
          >
            <AppText
              variant="caption"
              style={{ color: colors.success, fontWeight: "800" }}
            >
              {formatStatus(subscription?.status)}
            </AppText>
          </View>
        </View>

        <View
          style={[
            styles.limitGrid,
            { borderTopColor: colors.divider },
          ]}
        >
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
            isOpeningPortal ? "Opening billing..." : "Manage billing"
          }
          variant="outline"
          loading={isOpeningPortal}
          disabled={isOpeningPortal}
          leftIcon={<ExternalLink color={colors.text} size={18} />}
          onPress={() => void openPortal()}
        />
      </AppCard>

      <View style={styles.sectionHeader}>
        <AppText variant="sectionTitle">Current usage</AppText>

        <AppText variant="caption" tone="muted">
          Usage refreshes each billing period.
        </AppText>
      </View>

      <AppCard compact style={styles.usageCard}>
        <UsageRow
          color={colors.primary}
          label="Meeting minutes"
          value={`${usage?.meeting_minutes_used ?? 0} min`}
        />

        <UsageRow
          color={colors.secondary}
          label="Recording minutes"
          value={`${usage?.recording_minutes_used ?? 0} min`}
        />

        <UsageRow
          color={colors.accent}
          label="Storage used"
          value={formatBytes(usage?.storage_bytes_used)}
          last
        />
      </AppCard>

      <View style={styles.sectionHeader}>
        <AppText variant="sectionTitle">Available plans</AppText>

        <AppText variant="caption" tone="muted">
          Upgrades open a secure billing flow.
        </AppText>
      </View>

      <View style={styles.planList}>
        {plans.map((plan) => {
          const isCurrent = plan.code === subscription?.plan_code;
          const isBusy = actionPlan === plan.code;
          const price = formatPrice(plan);
          const isHighlighted = plan.code === "pro";

          return (
            <AppCard
              key={plan.code}
              elevated={isHighlighted}
              style={[
                styles.planCard,
                isCurrent && {
                  backgroundColor: colors.primarySoft,
                  borderColor: colors.primary,
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

                <View style={styles.price}>
                  <AppText variant="sectionTitle">{price}</AppText>

                  {price !== "Custom" ? (
                    <AppText variant="caption" tone="muted">
                      / month
                    </AppText>
                  ) : null}
                </View>
              </View>

              <View style={styles.featureList}>
                <PlanFeature>
                  {`${plan.max_meeting_minutes} minute meetings`}
                </PlanFeature>

                <PlanFeature>
                  {`Up to ${plan.max_participants} participants`}
                </PlanFeature>

                <PlanFeature>
                  {plan.recording_enabled
                    ? `${plan.monthly_recording_minutes} recording minutes`
                    : "No meeting recording"}
                </PlanFeature>

                <PlanFeature>
                  {`${plan.storage_gb} GB storage`}
                </PlanFeature>
              </View>

              <AppButton
                title={
                  isCurrent
                    ? "Current plan"
                    : isBusy
                      ? "Opening checkout..."
                      : plan.code === "enterprise"
                        ? "Contact sales"
                        : `Choose ${plan.name}`
                }
                variant={isCurrent ? "outline" : "primary"}
                loading={isBusy}
                disabled={isCurrent || isBusy}
                onPress={() => void openCheckout(plan.code)}
              />
            </AppCard>
          );
        })}
      </View>
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

        <AppText variant="bodyStrong" numberOfLines={1}>
          {value}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.four,
    paddingBottom: Spacing.five,
  },
  notice: {
    borderWidth: 1,
    borderRadius: Radius.medium,
    padding: Spacing.three,
  },
  currentPlanCard: {
    gap: Spacing.four,
  },
  currentPlanHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.large,
    alignItems: "center",
    justifyContent: "center",
  },
  currentPlanCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: 5,
  },
  limitGrid: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.three,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
  },
  limit: {
    width: "46%",
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  limitCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  sectionHeader: {
    gap: 3,
    marginTop: Spacing.one,
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
  planList: {
    gap: Spacing.three,
  },
  planCard: {
    gap: Spacing.four,
  },
  planTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.three,
  },
  planCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  price: {
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