import { describe, expect, it, vi } from "vitest";

import { responderExportacao } from "@/features/export/http";

describe("GET /api/exportar", () => {
  it("não devolve download parcial quando a leitura falha", async () => {
    const response = await responderExportacao(
      vi.fn().mockRejectedValue(new Error("Falha de banco")),
      () => new Date("2026-09-20T03:04:05.000Z"),
    );

    expect(response.status).toBe(500);
    expect(response.headers.get("Content-Disposition")).toBeNull();
    await expect(response.json()).resolves.toEqual({
      error: "Não foi possível exportar os dados.",
    });
  });
});
