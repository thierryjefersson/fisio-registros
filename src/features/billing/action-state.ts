export type BillingActionState = {
  fieldErrors?: Record<string, string[]>;
  formError?: string;
};

export const initialBillingActionState: BillingActionState = {};
