export const FILTROS_PACIENTES = ["em-tratamento", "alta", "todos"] as const;

export type FiltroPacientes = (typeof FILTROS_PACIENTES)[number];

export type PatientListParams = {
  busca: string;
  filtro: FiltroPacientes;
};

type RawSearchParams = Record<string, string | string[] | undefined>;

function primeiroValor(valor: string | string[] | undefined) {
  return Array.isArray(valor) ? valor[0] : valor;
}

export function parsePatientListParams(
  searchParams: RawSearchParams,
): PatientListParams {
  const busca = primeiroValor(searchParams.busca)?.trim() ?? "";
  const filtroRecebido = primeiroValor(searchParams.filtro);
  const filtro = FILTROS_PACIENTES.includes(filtroRecebido as FiltroPacientes)
    ? (filtroRecebido as FiltroPacientes)
    : "em-tratamento";

  return { busca, filtro };
}

export function patientListUrl({ busca, filtro }: PatientListParams) {
  const params = new URLSearchParams();
  if (busca) params.set("busca", busca);
  if (filtro !== "em-tratamento") params.set("filtro", filtro);
  const query = params.toString();
  return query ? `/pacientes?${query}` : "/pacientes";
}
