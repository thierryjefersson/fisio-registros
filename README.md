# Fisio Registros

Aplicação local para organizar tratamentos fisioterapêuticos, registros
clínicos, evoluções e cobranças. A interface e os formatos de data e moeda são
voltados para pt-BR.

## Requisitos

- Node.js 24
- pnpm 11.24.0
- Docker com Docker Compose

## Executar localmente

1. Instale as dependências:

   ```bash
   pnpm install --frozen-lockfile
   ```

2. Crie o arquivo de ambiente:

   ```bash
   cp .env.example .env
   ```

3. Inicie o PostgreSQL 16 e aguarde o healthcheck:

   ```bash
   docker compose up -d
   docker compose ps
   ```

4. Inicie a aplicação. O script aplica as migrations antes de abrir o servidor:

   ```bash
   pnpm dev
   ```

5. Acesse [http://localhost:3000](http://localhost:3000).

Os dados do PostgreSQL ficam no volume `postgres_data` e sobrevivem ao reinício
do container.

## Verificações de qualidade

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm build
```

Os testes de integração usam Testcontainers e precisam do Docker em execução.

## Backup manual

Abra **Configurações** e selecione **Exportar dados**. O download contém um JSON
versionado com pacientes e seus documentos clínicos, evoluções, cobranças e
vínculos. O arquivo contém dados sensíveis; armazene-o em local seguro.

O MVP oferece exportação, mas não restauração/importação automática.

## Documentação

As regras funcionais, arquitetura e plano concluído estão em
[docs/README.md](docs/README.md).
