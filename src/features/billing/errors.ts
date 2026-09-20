export type BillingErrorCode =
  | "COBRANCA_NAO_ENCONTRADA"
  | "CONFLITO_SESSOES"
  | "PACIENTE_NAO_ENCONTRADO"
  | "SEM_SESSOES_LIVRES";

export class BillingError extends Error {
  constructor(
    public readonly code: BillingErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "BillingError";
  }
}
