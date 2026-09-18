# Mapa de telas e componentes

## Navegação principal

Layout com sidebar no desktop e drawer no mobile:

- Dashboard
- Pacientes
- Financeiro
- Configurações

Tema exclusivamente claro, cor de destaque Emerald e textos em pt-BR. Conteúdo central com largura confortável; tabelas podem ganhar rolagem horizontal no tablet/mobile e cartões substituem linhas apenas quando isso melhorar a leitura.

## Rotas

| Rota                                            | Tela                   | Responsabilidade                          |
| ----------------------------------------------- | ---------------------- | ----------------------------------------- |
| `/`                                             | Dashboard              | Indicadores e cinco atendimentos recentes |
| `/pacientes`                                    | Pacientes              | Busca, filtros e listagem                 |
| `/pacientes/novo`                               | Novo paciente          | Cadastro do tratamento                    |
| `/pacientes/[id]`                               | Resumo                 | Dados e indicadores do tratamento         |
| `/pacientes/[id]/avaliacao`                     | Avaliação              | Avaliação inicial em Markdown             |
| `/pacientes/[id]/plano`                         | Plano terapêutico      | Objetivos e condutas                      |
| `/pacientes/[id]/evolucoes`                     | Evoluções              | Lista, criação e ações                    |
| `/pacientes/[id]/evolucoes/nova`                | Nova evolução          | Formulário da sessão realizada            |
| `/pacientes/[id]/evolucoes/[evolucaoId]/editar` | Editar evolução        | Alteração da sessão                       |
| `/pacientes/[id]/financeiro`                    | Financeiro do paciente | Sessões livres e cobranças                |
| `/financeiro`                                   | Financeiro geral       | Totais, pendências e histórico pago       |
| `/configuracoes`                                | Configurações          | Exportação de dados                       |

As cinco rotas sob o paciente são apresentadas visualmente como abas de uma única página. O uso de segmentos de rota mantém cada aba linkável e evita um componente monolítico.

## Conteúdo das telas

### Dashboard

Quatro cards:

- Pacientes em tratamento.
- Atendimentos realizados no mês atual.
- A receber: soma de cobranças pendentes.
- Recebido no mês: soma de cobranças pagas pela `dataPagamento` no mês atual.

Abaixo, os cinco atendimentos mais recentes com paciente, data, horário e acesso ao registro.

### Pacientes

- Campo de busca por nome, sem diferenciar maiúsculas/minúsculas.
- Filtro segmentado: `Em tratamento` (padrão), `Alta`, `Todos`.
- Tabela com nome, patologia, frequência semanal, valor e status.
- Ação primária `Novo paciente`, que navega para `/pacientes/novo`.
- Estado vazio contextual para busca/filtro.

Não há paginação inicialmente. Se o volume real justificar, ela pode ser adicionada sem mudar o modelo.

### Resumo do paciente

- Dados cadastrais.
- Sessões realizadas.
- Previsão inicial.
- Data de início.
- Frequência e dias.
- Última sessão.
- Valor da sessão.
- Status e data da alta, se aplicável.
- Ações: editar cadastro, copiar contexto, dar alta e excluir.

### Avaliação

- Editor Markdown visual.
- Salvar.
- Copiar Markdown.
- Copiar formatado.

### Plano terapêutico

Duas seções independentes, cada uma com editor e ações de cópia:

- Objetivos.
- Condutas.

Um único `Salvar plano` persiste os dois conteúdos juntos.

### Evoluções

- Botão `Nova evolução`.
- Cards/itens da mais recente para a mais antiga.
- Data, horário, conteúdo renderizado e indicador de cobrança quando aplicável.
- Ações: editar, copiar Markdown, copiar formatado e excluir.

### Financeiro do paciente

No topo, `Atendimentos não cobrados` com datas, quantidade, preço unitário, total e ação `Gerar cobrança`. Se não houver sessões, mostrar estado vazio sem botão ativo.

Depois, cobranças ordenadas da mais recente para a mais antiga, com:

- status;
- datas dos atendimentos;
- quantidade;
- valor unitário e total do snapshot;
- data do pagamento, se paga;
- mensagem gerada;
- ações de copiar mensagem, marcar como paga/pendente e excluir.

### Financeiro geral

- Cards `Total a receber` e `Recebido no mês`.
- Lista de cobranças pendentes.
- Histórico de cobranças pagas.
- Cada item oferece acesso ao financeiro do paciente.

### Configurações

Uma única seção `Dados` com explicação e botão `Exportar dados`. Não criar navegação ou preferências sem necessidade.

## Componentes principais

### Layout e navegação

- `AppSidebar`
- `MobileNavigation`
- `PageHeader`
- `PatientTabs`

### Formulários

- `PatientForm`
- `PatientForm` é usado na criação e na edição, dentro de suas respectivas páginas.
- `WeekdayCheckboxGroup`
- `CurrencyField` baseado em `react-number-format`, exibindo o prefixo `R$`.
- Campo de telefone com `PatternFormat` de `react-number-format`.
- Campos de data com `Calendar` e `Popover` shadcn/ui.
- `MarkdownEditor` client-only baseado em `@mdxeditor/editor`
- `EvolutionForm`
- `DischargeDialog`
- `PaymentDialog`

### Conteúdo

- `MarkdownViewer` baseado em `react-markdown`
- `CopyContentActions`
- `CopyContextMenu`
- `PatientSummary`
- `EvolutionList` e `EvolutionCard`

### Financeiro

- `UnbilledSessionsSummary`
- `BillingCard`
- `BillingStatusBadge`
- `BillingMessage`

### Compartilhados

- Componentes shadcn/ui/Base UI: Button, Input, Textarea, Label, Checkbox, Select, Calendar, Popover, Tabs, Table, Card, Badge, Dialog, Alert Dialog, Dropdown Menu, Sidebar, Sheet e Toast/Sonner.
- Priorizar componentes shadcn/ui existentes para novos controles; não criar equivalentes locais quando houver componente compatível.
- `EmptyState`
- `ConfirmDeleteDialog`
- `SubmitButton`

Componentes devem nascer apenas quando houver uso real. Não criar um design system paralelo ao shadcn/ui.

## Responsividade e acessibilidade

- Desktop é o alvo principal, sem larguras fixas que quebrem em telas menores.
- Alvos interativos com tamanho adequado para toque.
- Diálogos com foco inicial, Escape e retorno de foco providos pelo Base UI.
- Labels visíveis e mensagens de validação associadas aos campos.
- Status não depende apenas de cor.
- Emerald é usado para ações/destaque; vermelho fica reservado para ações destrutivas.
- Contraste mínimo WCAG AA.
