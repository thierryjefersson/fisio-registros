# Regras financeiras

## Definições

- **Sessão realizada:** uma evolução persistida.
- **Sessão não cobrada:** evolução que não possui linha em `CobrancaSessao`.
- **Sessão cobrada:** evolução associada a exatamente uma cobrança.
- **A receber:** soma de `valorTotalSnapshot` das cobranças Pendentes.
- **Recebido no mês:** soma de `valorTotalSnapshot` das cobranças Pagas cuja `dataPagamento` pertence ao mês corrente.

## Criação de cobrança

A cobrança sempre inclui todas as sessões não cobradas do paciente no momento da confirmação. Não há seleção manual.

```text
quantidade = número de sessões não cobradas
valor unitário = valor atual por sessão do paciente
total = quantidade × valor unitário
```

Regras:

- Não criar cobrança com quantidade zero.
- Fazer os cálculos com `Prisma.Decimal`/decimal exato, nunca ponto flutuante de JavaScript.
- Arredondar/normalizar para duas casas na fronteira de entrada; multiplicar inteiros por Decimal não exige novo arredondamento.
- Persistir `valorUnitarioSnapshot` e `valorTotalSnapshot`.
- Criar cobrança e vínculos em uma única transação.
- A restrição única em `CobrancaSessao.evolucaoId` é a proteção final contra dupla cobrança.
- Se uma sessão deixar de estar livre entre a prévia e a confirmação, cancelar a operação inteira, atualizar a prévia e informar o conflito.

Exemplo:

```text
3 sessões × R$ 100,00 = R$ 300,00
```

Se o valor do paciente mudar depois para R$ 120,00, a cobrança existente continua com R$ 100,00 e R$ 300,00. Apenas cobranças futuras usam R$ 120,00.

## Estados

### Pendente

- Estado inicial.
- `dataPagamento` deve ser `null`.
- Entra em `A receber`.

### Paga

- Exige uma data de pagamento.
- Não entra em `A receber`.
- Entra em `Recebido no mês` de acordo com a data de pagamento, não com a criação da cobrança nem com a data das sessões.

### Transições

```text
PENDENTE --marcar paga(data)--> PAGA
PAGA --voltar pendente--------> PENDENTE
```

Ao voltar para Pendente, remover a data de pagamento na mesma atualização. Não manter data oculta.

## Exclusão

- Excluir exige confirmação.
- A cobrança e suas linhas `CobrancaSessao` são excluídas.
- As evoluções não são excluídas.
- Essas evoluções passam imediatamente a ser não cobradas e podem entrar em uma nova cobrança.
- A exclusão é permitida tanto para cobrança Pendente quanto Paga.

## Mensagem de cobrança

A mensagem é gerada no momento da exibição/cópia, sem IA e sem persistência própria:

```text
Olá! Referente aos atendimentos fisioterapêuticos realizados nos dias 18/09, 24/09 e 25/09, foram realizados 3 atendimentos, no valor de R$ 100,00 por sessão, totalizando R$ 300,00.
```

Regras de geração:

- Ordenar as datas em ordem crescente.
- Formatar cada data como `dd/MM`.
- Preservar repetições se houver mais de uma sessão no mesmo dia, pois cada item representa um atendimento.
- Para uma sessão, usar `foi realizado 1 atendimento`.
- Para duas ou mais, usar `foram realizados N atendimentos`.
- Separar duas datas com `e`.
- Separar três ou mais com vírgulas e `e` antes da última.
- Formatar valores com `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })`.
- Usar sempre os valores snapshot da cobrança.
- Não incluir o nome do paciente.

## Consultas principais

### Sessões não cobradas

Buscar evoluções do paciente onde `itemCobranca` é `null`, ordenadas por data/horário crescentes para a prévia financeira.

### Total a receber

Somar `valorTotalSnapshot` de todas as cobranças `PENDENTE`.

### Recebido no mês

Somar cobranças `PAGA` com `dataPagamento >= primeiro dia do mês` e `< primeiro dia do próximo mês`, usando datas civis no fuso da aplicação.

### Histórico pago

Ordenar por `dataPagamento` decrescente e `createdAt` decrescente como desempate.

## Funções de domínio sugeridas

Funções puras, sem dependência de React ou Prisma quando possível:

```ts
calcularTotalCobranca(quantidade, valorUnitario);
gerarMensagemCobranca({ datas, quantidade, valorUnitario, valorTotal });
formatarListaDeDatas(datas);
marcarCobrancaComoPaga(cobranca, dataPagamento);
voltarCobrancaParaPendente(cobranca);
```

A função de serviço que gera a cobrança coordena consulta e transação; cálculos e texto ficam nas funções puras para testes rápidos e completos.
