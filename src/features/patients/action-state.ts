export type PatientActionState = {
  fieldErrors?: Record<string, string[]>;
  formError?: string;
};

export const initialPatientActionState: PatientActionState = {};
