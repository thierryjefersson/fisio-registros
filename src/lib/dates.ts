const DATA_CIVIL = /^(\d{4})-(\d{2})-(\d{2})$/;

export function validarDataCivil(data: string): boolean {
  const partes = DATA_CIVIL.exec(data);

  if (!partes) {
    return false;
  }

  const [, ano, mes, dia] = partes;
  const instante = new Date(
    Date.UTC(Number(ano), Number(mes) - 1, Number(dia)),
  );

  return (
    instante.getUTCFullYear() === Number(ano) &&
    instante.getUTCMonth() === Number(mes) - 1 &&
    instante.getUTCDate() === Number(dia)
  );
}

export function dataCivilParaDate(data: string): Date {
  if (!validarDataCivil(data)) {
    throw new TypeError("A data civil informada é inválida.");
  }

  return new Date(`${data}T00:00:00.000Z`);
}

export function hojeCivil(): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Fortaleza",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const valores = Object.fromEntries(
    partes
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, value]),
  );

  return `${valores.year}-${valores.month}-${valores.day}`;
}

export function formatarDataCivil(data: string): string {
  if (!DATA_CIVIL.test(data)) {
    throw new TypeError("A data civil deve usar o formato YYYY-MM-DD.");
  }

  if (!validarDataCivil(data)) {
    throw new TypeError("A data civil informada é inválida.");
  }

  const partes = DATA_CIVIL.exec(data);
  if (!partes) {
    throw new TypeError("A data civil deve usar o formato YYYY-MM-DD.");
  }

  const [, ano, mes, dia] = partes;

  return `${dia}/${mes}/${ano}`;
}
