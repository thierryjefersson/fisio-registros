import { Client } from "pg";
import { GenericContainer, type StartedTestContainer } from "testcontainers";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("PostgreSQL 16", () => {
  let container: StartedTestContainer;
  let client: Client;

  beforeAll(async () => {
    container = await new GenericContainer("postgres:16-alpine")
      .withEnvironment({
        POSTGRES_DB: "fisio_test",
        POSTGRES_USER: "fisio",
        POSTGRES_PASSWORD: "fisio_test",
      })
      .withExposedPorts(5432)
      .start();

    client = new Client({
      host: container.getHost(),
      port: container.getMappedPort(5432),
      database: "fisio_test",
      user: "fisio",
      password: "fisio_test",
    });
    await client.connect();
  });

  afterAll(async () => {
    await client?.end();
    await container?.stop();
  });

  it("conecta a um banco PostgreSQL 16 vazio", async () => {
    const version = await client.query<{ server_version: string }>(
      "SHOW server_version",
    );
    const tables = await client.query<{ count: string }>(
      "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'",
    );

    expect(version.rows[0]?.server_version).toMatch(/^16\./);
    expect(tables.rows[0]?.count).toBe("0");
  });
});
