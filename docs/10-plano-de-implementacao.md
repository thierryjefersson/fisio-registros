# Plano de implementação

## Como usar este plano

O desenvolvimento é dividido em nove etapas ordenadas. Cada etapa entrega um incremento verificável e inclui os testes automatizados das regras introduzidas nela.

Uma etapa só pode ser marcada como concluída quando:

- todo o seu escopo funcional estiver implementado;
- migrations da etapa estiverem criadas, revisadas e versionadas;
- testes unitários, de componente e/ou integração previstos na etapa estiverem implementados e verdes;
- testes das etapas anteriores continuarem verdes;
- lint, typecheck e build passarem;
- os critérios de aceite manual da etapa forem verificados;
- não existirem `skip`, `todo` ou testes comentados referentes ao escopo entregue.

Não existe uma etapa final para “escrever os testes que faltaram”. A etapa final serve para revisão do conjunto, não para pagar dívida acumulada.

## Rotina de cada etapa

Dentro de cada etapa, seguir esta ordem:

1. Confirmar regras e casos de teste da etapa.
2. Implementar funções de domínio e seus testes unitários.
3. Alterar o schema e criar a migration, quando necessário.
4. Implementar queries, serviços e Server Actions.
5. Implementar a interface.
6. Completar testes de integração e componentes.
7. Executar o gate completo e fazer o aceite manual.
8. Atualizar a documentação se a implementação exigir uma decisão diferente.

## Comandos do gate

Estes scripts devem existir desde a Etapa 0:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm build
```

Durante o ciclo curto pode-se usar `pnpm test:watch`. Antes de concluir cada etapa, executar os comandos sem modo watch. `test:integration` pode inicialmente não ter casos, mas deve existir e passar; a partir da primeira migration ele executa os testes com PostgreSQL 16 via Testcontainers.

Os scripts devem executar de forma não interativa no gate: `test` usa `vitest run`, `test:watch` usa `vitest` e `test:integration` usa uma configuração Vitest separada para Testcontainers. `typecheck` usa `tsc --noEmit`.

## Etapa 0 — Fundação executável

### Objetivo

Criar uma base mínima que roda localmente, compila e já possui o ciclo de qualidade automatizado.

### Implementação

- Inicializar Next.js com App Router, TypeScript, `src/`, Tailwind e pnpm.
- Configurar shadcn/ui com Base UI, Emerald, variáveis CSS e tema somente claro.
- Criar o layout principal com navegação vazia para Dashboard, Pacientes, Financeiro e Configurações.
- Criar `compose.yaml` com PostgreSQL 16, healthcheck e volume persistente.
- Configurar Prisma, adapter `pg`, `.env.example` e singleton do client.
- Configurar Vitest, Testing Library, ambientes Node/jsdom e o harness separado de Testcontainers.
- Configurar ESLint, Prettier e os scripts do gate.
- Criar utilitários iniciais de formatação BRL e datas pt-BR, que serão usados nas telas seguintes.
- Manter a página inicial como estado vazio; não implementar dashboard ainda.

### Testes automatizados da etapa

- Formatação BRL para zero, centavos e milhares.
- Formatação de data civil sem deslocamento de fuso.
- Renderização básica do layout e dos nomes da navegação.
- Smoke test da conexão Testcontainers com PostgreSQL 16 e da preparação de um banco vazio.

### Aceite manual

- `docker compose up -d` deixa o PostgreSQL saudável e preserva o volume após reinício.
- `pnpm dev` abre a aplicação sem erros no console.
- A navegação é visível em desktop e acessível em viewport mobile.

### Gate de conclusão

- Todos os comandos do gate passam.
- O repositório contém lockfile e `.env.example`, mas não contém `.env` versionado.
- Ainda não existe regra de negócio não testada.

## Etapa 1 — Cadastro e edição de paciente

### Objetivo

Persistir o primeiro agregado do sistema e permitir cadastrar e editar um tratamento.

### Implementação

- Adicionar enums e modelo `Paciente` ao Prisma.
- Criar a migration `init_patient`.
- Criar schemas Zod para criação e edição.
- Implementar normalização do valor monetário como string decimal.
- Implementar cálculo derivado da frequência semanal.
- Criar formulário com React Hook Form, componentes shadcn/ui/Base UI, calendário, campo monetário com `R$`, máscara de telefone e checkboxes de dias.
- Disponibilizar o cadastro na página `/pacientes/novo`, mantendo a edição na rota do paciente.
- Implementar Server Actions de criar e editar com validação no servidor.
- Após criar, redirecionar para o resumo do paciente.
- Confirmar criações e edições com Toast/Sonner.
- Criar uma versão inicial do resumo com os dados cadastrais, zero sessões e nenhuma última sessão.

### Testes automatizados da etapa

#### Unidade

- Nome, nascimento, telefone, endereço, patologia e queixa obrigatórios.
- Data de nascimento futura rejeitada.
- Previsão de sessões zero, negativa ou fracionária rejeitada.
- Valor zero, negativo ou com formato inválido rejeitado.
- Responsável vazio normalizado para `null`.
- Dias vazios rejeitados.
- Frequência igual à quantidade de dias únicos selecionados.
- Entrada monetária pt-BR normalizada corretamente para Decimal.

#### Componentes

- Marcar/desmarcar dias atualiza a frequência exibida.
- Campo monetário entrega valor normalizado ao formulário.
- Mensagens Zod aparecem associadas aos campos inválidos.

#### Integração

- Migration aplica em PostgreSQL 16 limpo.
- Paciente é criado com status `EM_TRATAMENTO` e sem data de alta.
- Dois pacientes com o mesmo nome podem ser criados.
- Decimal, data civil e array de dias persistem sem perda.
- Edição altera somente o paciente indicado pelo UUID.

### Aceite manual

- Cadastrar dois tratamentos com o mesmo nome funciona.
- Editar um deles não altera o outro.
- Moeda, datas, labels e mensagens aparecem em pt-BR.

### Gate de conclusão

- Cadastro, edição e resumo inicial funcionam.
- Todos os testes acima existem e passam antes da Etapa 2.

## Etapa 2 — Listagem, busca, filtros e exclusão inicial

### Objetivo

Completar o fluxo básico de localização e administração dos tratamentos.

### Implementação

- Criar listagem com nome, patologia, frequência, valor e status.
- Implementar busca case-insensitive por nome.
- Implementar filtros `Em tratamento`, `Alta` e `Todos`, com `Em tratamento` como padrão.
- Preservar busca e filtro na URL.
- Criar estados de carregamento, vazio e erro.
- Implementar exclusão com Alert Dialog e confirmação explícita.
- Redirecionar corretamente se um UUID não existir.

### Testes automatizados da etapa

#### Unidade

- Parser de parâmetros aceita somente filtros conhecidos e aplica o padrão correto.
- View model formata frequência, valor e status corretamente.

#### Componentes

- Alteração do filtro atualiza o estado/URL esperado.
- Busca envia o termo informado.
- Diálogo de exclusão descreve a ação destrutiva e só confirma pela ação explícita.

#### Integração

- Busca encontra variações de maiúsculas/minúsculas.
- Cada filtro retorna apenas os registros corretos.
- Busca e filtro funcionam em conjunto.
- Exclusão remove somente o UUID selecionado.
- UUID inexistente retorna resultado `not found` sem erro interno.

### Aceite manual

- Busca e filtros funcionam juntos e sobrevivem ao refresh.
- A exclusão não ocorre ao simplesmente fechar o diálogo.
- A tabela permanece utilizável em tablet/mobile.

### Gate de conclusão

- O gerenciamento básico de pacientes está utilizável.
- A exclusão em cascata será ampliada nas etapas que adicionarem relações; o teste correspondente deve ser ampliado na mesma etapa da nova relação.

## Etapa 3 — Avaliação e plano terapêutico

### Objetivo

Entregar os documentos clínicos principais com edição Markdown visual e cópia segura.

### Implementação

- Adicionar `Avaliacao` e `PlanoTerapeutico` ao schema.
- Criar migration `add_clinical_documents`.
- Criar as abas/rotas Resumo, Avaliação e Plano terapêutico.
- Integrar `@mdxeditor/editor` como componente client-only.
- Habilitar apenas parágrafo, H1, H2, negrito, itálico, lista e lista numerada.
- Implementar salvar explicitamente, sem autosave.
- Criar avaliação inicial sob demanda e garantir uma única inicial pelo serviço.
- Manter objetivos e condutas independentes em um plano único.
- Implementar `MarkdownViewer`, `Copiar Markdown` e `Copiar formatado`.
- Ignorar HTML bruto na renderização.

### Testes automatizados da etapa

#### Unidade

- Schema aceita Markdown vazio para documentos ainda não preenchidos.
- Serviço impede uma segunda avaliação `INICIAL` para o mesmo paciente.
- Geração de payload de cópia mantém o Markdown original.
- Geração rica produz `text/html` e fallback `text/plain`.

#### Componentes

- Toolbar oferece exatamente as capacidades previstas no MVP.
- Salvar envia o conteúdo atual do editor.
- Copiar Markdown usa texto puro.
- Copiar formatado usa HTML e texto e apresenta sucesso/erro.

#### Integração

- Avaliação inicial é criada e editada sem duplicação.
- Objetivos e condutas são salvos e atualizados independentemente.
- Excluir paciente remove avaliação e plano.
- Migration aplica do zero e sobre o schema da Etapa 2.

### Aceite manual

- Títulos, listas, negrito e itálico sobrevivem ao salvar/reabrir.
- Colar o modo formatado no Word/Google Docs preserva a estrutura básica.
- Colar o modo Markdown preserva o texto fonte.

### Gate de conclusão

- Não avançar enquanto edição e ambos os modos de cópia não estiverem cobertos e funcionando.

## Etapa 4 — Evoluções e contexto externo

### Objetivo

Registrar atendimentos realizados e gerar o contexto clínico copiável.

### Implementação

- Adicionar `Evolucao` ao schema e migration `add_evolutions`.
- Criar aba, listagem, formulário de criação e edição.
- Preencher a data inicial com o dia local atual; horário permanece manual.
- Ordenar por data, horário e criação, sempre da mais recente para a mais antiga.
- Exigir confirmação para excluir.
- Reutilizar cópia Markdown/formatada em cada evolução.
- Implementar `Copiar contexto` com as últimas cinco evoluções.
- Implementar `Copiar contexto completo` com todas as evoluções.
- Atualizar o resumo com total de sessões e última sessão.

### Testes automatizados da etapa

#### Unidade

- Data padrão respeita `America/Fortaleza` com relógio controlado.
- Ordenação resolve datas, horários e empates corretamente.
- Contexto mantém a ordem das seções definida na documentação.
- Contexto resumido inclui no máximo as cinco evoluções mais recentes.
- Contexto completo inclui todas.
- Seções vazias geram `Não informado.`.

#### Componentes

- Formulário exige horário e conteúdo.
- Data começa preenchida e continua editável.
- Ações de copiar operam sobre a evolução correta.
- Exclusão só ocorre depois da confirmação.

#### Integração

- Criar, editar e excluir evolução persiste corretamente.
- Listagem retorna ordem decrescente correta.
- Resumo calcula quantidade e última sessão.
- Excluir paciente remove suas evoluções.
- Pacientes diferentes não compartilham evoluções ou contexto.

### Aceite manual

- Uma evolução nova aparece primeiro.
- A previsão inicial não impede registrar sessões adicionais.
- Os dois contextos podem ser colados como Markdown em outra aplicação.

### Gate de conclusão

- Fluxo clínico completo funciona antes de introduzir cobranças.
- Nenhum teste de contexto ou evolução fica pendente para a etapa financeira.

## Etapa 5 — Domínio financeiro e garantias transacionais

### Objetivo

Implementar e provar as regras financeiras antes de construir sua interface completa.

### Implementação

- Adicionar `Cobranca`, `CobrancaSessao` e enums ao schema.
- Criar migration `add_billing` com unicidade de `evolucaoId`.
- Implementar funções puras de total, quantidade, lista de datas e mensagem.
- Implementar transação de geração usando todas as sessões livres.
- Persistir snapshots unitário e total.
- Implementar transições Pendente/Paga e data de pagamento.
- Implementar exclusão de cobrança liberando sessões.
- Bloquear exclusão de evolução cobrada.
- Ajustar exclusão de paciente para remover cobranças primeiro, na mesma transação.
- Configurar suíte de integração com PostgreSQL 16/Testcontainers caso ainda não exista.

### Testes automatizados da etapa

#### Unidade — obrigatórios

- Total e quantidade para uma e várias sessões.
- Valores com centavos sem erro de ponto flutuante.
- Zero sessões rejeitado.
- Mensagem para uma, duas e três ou mais datas.
- Singular e plural corretos.
- Datas ordenadas e repetições preservadas.
- BRL formatado corretamente.
- Nome do paciente nunca aparece na mensagem.
- Pendente → Paga registra a data.
- Paga → Pendente remove a data.

#### Serviço — obrigatórios

- Todas as sessões livres entram na cobrança.
- Sessões já cobradas são ignoradas/recusadas conforme a operação.
- Cobrança vazia não é criada.
- Snapshot usa o preço atual no instante da cobrança.
- Alterar depois o preço do paciente não altera o snapshot.
- Falha ao vincular uma sessão desfaz toda a transação.

#### Integração com Testcontainers — obrigatórios

- Migration aplica sobre o banco da Etapa 4 e em banco limpo.
- Sessões são associadas à cobrança correta.
- Restrição única impede dupla cobrança.
- Duas tentativas concorrentes não criam cobrança parcial ou duplicada.
- Excluir cobrança remove vínculos e libera as sessões.
- Marcar Paga/Pendente mantém status e data consistentes.
- Evolução cobrada não pode ser excluída.
- Após excluir a cobrança, a evolução pode ser excluída.
- Excluir paciente com cobranças remove todo o agregado na ordem correta.

### Aceite técnico

- Inspecionar o SQL da migration, especialmente FK, `ON DELETE` e índice único.
- Confirmar que nenhum cálculo financeiro usa `number` para valores monetários.
- Confirmar rollback integral em conflito de associação.

### Gate de conclusão

- Esta etapa é bloqueadora: não construir a UI financeira se qualquer cenário acima falhar.
- A matriz financeira de [Estratégia de testes](./07-estrategia-de-testes.md) deve estar coberta.

## Etapa 6 — Financeiro do paciente e financeiro geral

### Objetivo

Expor as regras financeiras já validadas em fluxos de uso completos.

### Implementação

- Criar aba Financeiro do paciente.
- Mostrar automaticamente sessões não cobradas, quantidade, valor e total.
- Desabilitar geração quando não houver sessões livres.
- Implementar gerar cobrança, copiar mensagem, marcar como paga, voltar para pendente e excluir.
- Solicitar data ao marcar como paga.
- Exibir snapshots e datas das sessões em cada cobrança.
- Criar Financeiro geral com total a receber, recebido no mês, pendências e histórico pago.
- Revalidar apenas páginas afetadas após cada mutação.

### Testes automatizados da etapa

#### Unidade

- Agregação de `A receber` soma apenas Pendentes.
- `Recebido no mês` usa `dataPagamento`, incluindo corretamente os limites do mês.
- View models financeiros usam snapshots, não o preço atual do paciente.

#### Componentes

- Prévia lista datas, quantidade, valor e total corretos.
- Botão de gerar fica indisponível sem sessões.
- Diálogo de pagamento exige data.
- Reabrir cobrança pede confirmação e remove a data na interface.
- Excluir cobrança pede confirmação.
- Copiar mensagem envia exatamente o texto exibido.

#### Integração

- Server Actions chamam as transações e retornam erros de conflito legíveis.
- Financeiro geral separa pendentes e pagas.
- Totais atualizam após pagar, reabrir e excluir.
- Cobrança criada em um paciente nunca aparece em outro.

### Aceite manual

- Executar o ciclo: gerar → pagar → voltar para pendente → excluir → gerar novamente.
- Conferir a mensagem do exemplo da documentação.
- Alterar o valor do paciente e confirmar que cobrança antiga não muda.

### Gate de conclusão

- Fluxos financeiros por paciente e gerais estão completos.
- Testes da Etapa 5 continuam verdes sem flexibilizar constraints.

## Etapa 7 — Alta e dashboard

### Objetivo

Fechar o ciclo do tratamento e entregar a visão operacional inicial.

### Implementação

- Criar diálogo de alta com data.
- Verificar sessões não cobradas no servidor imediatamente antes de concluir.
- Oferecer `Gerar cobrança` e `Dar alta mesmo assim` quando necessário.
- Manter pacientes com alta disponíveis nos filtros.
- Exibir data da alta no resumo.
- Implementar os quatro indicadores do dashboard.
- Implementar cinco atendimentos mais recentes.

### Testes automatizados da etapa

#### Unidade

- Estado `ALTA` exige data; `EM_TRATAMENTO` não mantém data de alta.
- Decisão do fluxo diferencia zero e uma ou mais sessões livres.
- Limites do mês são calculados no fuso configurado.

#### Componentes

- Sem sessões livres, o diálogo permite concluir diretamente.
- Com sessões livres, o alerta e as duas opções aparecem.
- Gerar cobrança não conclui a alta automaticamente.

#### Integração

- Alta persiste status e data juntos.
- Alta mesmo com sessão livre é possível após confirmação.
- Cobrança pode ser criada antes da alta e preserva as sessões.
- Dashboard conta pacientes em tratamento.
- Dashboard conta atendimentos do mês e limita recentes a cinco.
- Dashboard calcula a receber e recebido no mês com as mesmas regras do financeiro.

### Aceite manual

- Dar alta com e sem sessões livres.
- Localizar o paciente depois usando o filtro `Alta`.
- Conferir indicadores contra dados conhecidos criados manualmente.

### Gate de conclusão

- O fluxo Paciente → Avaliação → Plano → Evoluções → Financeiro → Alta está completo e coberto.

## Etapa 8 — Exportação, responsividade e fechamento do MVP

### Objetivo

Entregar a saída de segurança manual e revisar a aplicação como um produto único.

### Implementação

- Criar tela mínima de Configurações.
- Implementar Route Handler de exportação JSON com envelope versionado.
- Exportar pacientes, avaliações, plano, evoluções, cobranças e vínculos.
- Serializar Decimal como string, datas/horários civis nos formatos documentados e timestamps em ISO 8601.
- Gerar nome `fisio-backup-AAAA-MM-DD-HHmmss.json` no fuso local.
- Revisar layout em desktop, tablet e mobile.
- Revisar foco, labels, contraste, teclado, estados de loading/erro/vazio e ações destrutivas.
- Revisar textos para pt-BR e remover código/abstrações sem uso.
- Atualizar README de execução local.

### Testes automatizados da etapa

#### Unidade

- Serialização correta de todos os tipos especiais.
- Nome do arquivo contém data e timestamp no formato esperado.
- Exportação vazia ainda produz JSON válido.
- Ordem do conteúdo é determinística.

#### Integração

- Exportação inclui todas as entidades e relações de um cenário completo.
- Registros de pacientes diferentes não são misturados.
- Cobranças Paga/Pendente e data de pagamento são preservadas.
- Resposta contém `Content-Type` e `Content-Disposition` corretos.
- Falha de leitura não retorna arquivo parcial.

#### Componentes

- Ação `Exportar dados` inicia o download.
- Navegação mobile abre, fecha e devolve foco adequadamente.
- Estados vazios principais renderizam suas mensagens e ações corretas.

### Aceite manual final

Executar um cenário completo com dados descartáveis:

1. Cadastrar dois tratamentos com o mesmo nome.
2. Preencher avaliação, objetivos e condutas.
3. Criar mais evoluções que a previsão inicial.
4. Copiar Markdown, conteúdo formatado e os dois contextos.
5. Gerar uma cobrança, pagar, voltar para pendente e pagar novamente.
6. Criar outra evolução, dar alta mesmo com sessão livre e depois gerar sua cobrança.
7. Conferir dashboard, financeiro geral e filtros.
8. Exportar JSON e inspecionar o conteúdo.
9. Excluir uma cobrança e confirmar que sua sessão volta a ser cobrável.
10. Excluir um paciente e confirmar a remoção de todo o histórico.

### Gate final

- Todos os comandos do gate passam a partir de uma instalação limpa.
- Todas as migrations aplicam em PostgreSQL 16 vazio.
- Nenhum requisito do MVP está marcado para “teste posterior”.
- Não existem funcionalidades fora do escopo inicial.
- O aplicativo pode ser iniciado seguindo apenas o README.

## Mapa resumido de testes por etapa

| Etapa                      | Unidade | Componentes | Integração/PostgreSQL |
| -------------------------- | :-----: | :---------: | :-------------------: |
| 0. Fundação                |    ✓    |      ✓      |   smoke obrigatório   |
| 1. Cadastro                |    ✓    |      ✓      |           ✓           |
| 2. Listagem                |    ✓    |      ✓      |           ✓           |
| 3. Documentos              |    ✓    |      ✓      |           ✓           |
| 4. Evoluções               |    ✓    |      ✓      |           ✓           |
| 5. Domínio financeiro      |    ✓    |             |     ✓ obrigatório     |
| 6. Interfaces financeiras  |    ✓    |      ✓      |           ✓           |
| 7. Alta e dashboard        |    ✓    |      ✓      |           ✓           |
| 8. Exportação e fechamento |    ✓    |      ✓      |           ✓           |

## Controle de progresso

Usar esta checklist no andamento do projeto:

- [x] Etapa 0 — Fundação executável
- [x] Etapa 1 — Cadastro e edição de paciente
- [x] Etapa 2 — Listagem, busca, filtros e exclusão inicial
- [x] Etapa 3 — Avaliação e plano terapêutico
- [x] Etapa 4 — Evoluções e contexto externo
- [x] Etapa 5 — Domínio financeiro e garantias transacionais
- [x] Etapa 6 — Financeiro do paciente e financeiro geral
- [ ] Etapa 7 — Alta e dashboard
- [ ] Etapa 8 — Exportação, responsividade e fechamento do MVP
