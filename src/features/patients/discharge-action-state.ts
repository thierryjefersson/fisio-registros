export type DischargeActionState = {
  fieldErrors?: { dataAlta?: string[] };
  formError?: string;
  unbilledSessions?: number;
};

export const initialDischargeActionState: DischargeActionState = {};
