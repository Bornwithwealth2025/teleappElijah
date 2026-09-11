import apiClient from "@/api/client";
import type {
  BillingCheckoutSession,
  BillingPlan,
  BillingPlanCode,
  BillingPortalSession,
  BillingSubscription,
  BillingUsage,
} from "@/types/billing.types";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
} & Partial<T>;

function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    payload.data !== undefined
  ) {
    return payload.data as T;
  }

  return payload as T;
}

const BillingService = {
  async listPlans(): Promise<BillingPlan[]> {
    const { data } = await apiClient.get<
      ApiEnvelope<BillingPlan[]>
    >("/billing/plans");

    return unwrap(data);
  },

  async getCurrentSubscription(): Promise<BillingSubscription> {
    const { data } = await apiClient.get<
      ApiEnvelope<BillingSubscription>
    >("/billing/current");

    return unwrap(data);
  },

  async getUsage(): Promise<BillingUsage> {
    const { data } = await apiClient.get<
      ApiEnvelope<BillingUsage>
    >("/billing/usage");

    return unwrap(data);
  },

  async createCheckout(
    planCode: BillingPlanCode,
  ): Promise<BillingCheckoutSession> {
    const { data } = await apiClient.post<
      ApiEnvelope<BillingCheckoutSession>
    >("/billing/checkout", {
      planCode,
    });

    return unwrap(data);
  },

  async createPortal(): Promise<BillingPortalSession> {
    const { data } = await apiClient.post<
      ApiEnvelope<BillingPortalSession>
    >("/billing/portal");

    return unwrap(data);
  },
};

export default BillingService;