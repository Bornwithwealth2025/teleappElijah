export type BillingPlanCode =
  | "free"
  | "pro"
  | "business"
  | "enterprise";

export type BillingLimits = {
  max_meeting_minutes: number;
  max_participants: number;
  monthly_recording_minutes: number;
  storage_gb: number;
  recording_enabled: boolean;
  analytics_enabled: boolean;
  priority_support: boolean;
};

export type BillingPlan = {
  code: BillingPlanCode;
  name: string;
  description?: string | null;
  price_cents_monthly: number | null;
  currency: string;
  interval?: "month" | "year";
  max_meeting_minutes: number;
  max_participants: number;
  monthly_recording_minutes: number;
  storage_gb: number;
  recording_enabled: boolean;
  analytics_enabled: boolean;
  priority_support: boolean;
  sort_order?: number;
};

export type BillingSubscription = {
  user_id: string;
  plan_code: BillingPlanCode;
  plan_name: string;
  status:
    | "free"
    | "incomplete"
    | "trialing"
    | "active"
    | "past_due"
    | "unpaid"
    | "cancelled"
    | "expired";
  provider: "system" | "manual" | "stripe" | string;
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean;
  limits: BillingLimits;
};

export type BillingUsage = {
  user_id: string;
  period_start: string;
  period_end: string;
  meeting_minutes_used: number;
  recording_minutes_used: number;
  storage_bytes_used: number;
};

export type BillingCheckoutSession = {
  url?: string;
  sessionId?: string;
  setupRequired?: boolean;
  message?: string;
  subscription?: BillingSubscription;
};

export type BillingPortalSession = {
  url?: string;
  setupRequired?: boolean;
  message?: string;
};