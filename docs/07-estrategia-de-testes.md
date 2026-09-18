# Estratégia de testes

## Objetivo

Cobrir primeiro regras cuja falha pode gerar valor incorreto informado ao paciente ou associação financeira inconsistente. O conjunto deve continuar pequeno e útil.

## Ferramentas

- Vitest para testes unitários e de integração.
- Testing Library apenas para componentes com comportamento relevante.
- `jsdom` para componentes; ambiente Node para domínio e serviços.
- Testcontainers para os testes reais de integração com PostgreSQL previstos no plano de implementação.
- Sem E2E no MVP.

## Pirâmide inicial

### Testes unitários — prioridade máxima

Cobrir funções financeiras puras:

- total para uma e várias sessões;
- quantidade derivada da lista de sessões;
- precisão com centavos, sem erro de ponto flutuante;
- mensagem com uma, duas e três ou mais datas;
- singular/plural da mensagem;
- ordenação das datas;
- formatação monetária pt-BR;
- ausência do nome do paciente na mensagem;
- transição Pendente → Paga com data;
- transição Paga → Pendente removendo a data.

Também cobrir:

- frequência semanal a partir dos dias selecionados;
- montagem do contexto com últimas cinco evoluções;
- montagem do contexto completo;
- serialização de Decimal, datas e horários no backup.

### Testes de serviço — prioridade alta

Com Prisma mockado apenas quando o teste verificar orquestração, cobrir:

- cobrança usa todas as sessões livres encontradas;
- cobrança vazia é recusada;
- snapshot usa o valor atual no instante da geração;
- alteração posterior do paciente não altera cobrança existente;
- pagamento e reabertura atualizam status/data atomicamente.

Mocks não validam constraints ou comportamento transacional real. Para isso, usar integração.

### Integração com PostgreSQL — conjunto enxuto

Usar PostgreSQL 16 efêmero via Testcontainers e aplicar migrations reais. Casos essenciais:

1. Associar sessões a uma cobrança.
2. Impedir que uma sessão já cobrada entre em outra cobrança.
3. Concorrência/violação de unicidade não cria cobrança parcial.
4. Excluir cobrança apaga vínculos e libera sessões.
5. Excluir paciente remove o histórico associado.
6. Impedir exclusão de evolução ligada a cobrança.

O harness de Testcontainers é configurado na fundação e passa a ser obrigatório a partir da primeira migration.

### Componentes — somente comportamento importante

- Cálculo visual da frequência ao marcar dias.
- Campo monetário entrega valor normalizado ao formulário.
- Diálogo de alta mostra alerta quando existem sessões não cobradas.
- Ação de cópia chama o formato correto e apresenta sucesso/erro.

Não testar detalhes internos do shadcn/ui/Base UI.

## Matriz financeira mínima

| Regra                    | Unitário | Serviço | Integração |
| ------------------------ | :------: | :-----: | :--------: |
| Cálculo total/quantidade |    ✓     |    ✓    |            |
| Associação das sessões   |          |    ✓    |     ✓      |
| Não cobrar duas vezes    |          |    ✓    |     ✓      |
| Exclusão libera sessões  |          |    ✓    |     ✓      |
| Pendente/Paga            |    ✓     |    ✓    |            |
| Data de pagamento        |    ✓     |    ✓    |            |
| Mensagem                 |    ✓     |         |            |
| Snapshot de valores      |    ✓     |    ✓    |     ✓      |

## Casos de exemplo

```ts
it("calcula 3 sessões de R$ 100,00", () => {
  expect(calcularTotalCobranca(3, "100.00").toFixed(2)).toBe("300.00");
});

it("remove a data ao voltar para pendente", () => {
  expect(
    voltarCobrancaParaPendente({
      status: "PAGA",
      dataPagamento: "2026-09-18",
    }),
  ).toEqual({ status: "PENDENTE", dataPagamento: null });
});
```

Os testes reais devem importar as funções de produção, não reimplementar a regra no arquivo de teste.

## Comandos esperados

```bash
pnpm test
pnpm test:watch
pnpm test:integration
```

`test:integration` pode exigir Docker e deve permanecer separado do ciclo unitário rápido.

## Critérios de qualidade

- Toda correção de bug financeiro recebe teste de regressão.
- Migrations são aplicadas em banco limpo antes de considerar uma alteração de schema concluída.
- Testes não dependem da data/hora real sem relógio controlado.
- Locale, fuso e moeda são explícitos nos testes.
- Cobertura numérica é secundária; os cenários da matriz são obrigatórios.
