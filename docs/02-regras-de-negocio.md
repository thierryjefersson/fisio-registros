# Regras de negócio

## Paciente e tratamento

- Cada `Paciente` representa exatamente um tratamento.
- Um retorno futuro do mesmo paciente gera outro cadastro, com novo UUID.
- `nome` não possui restrição de unicidade.
- A frequência semanal é derivada da quantidade de dias habituais selecionados e não é armazenada separadamente.
- Os dias habituais não criam agenda nem sessões futuras.
- A previsão de sessões deve ser um inteiro positivo, mas é apenas informativa.
- O valor por sessão deve ser maior que zero e ter no máximo duas casas decimais.
- O status inicial é `EM_TRATAMENTO` e não há data de alta.
- Em `ALTA`, a data de alta é obrigatória.
- Ao reabrir um tratamento, se essa ação vier a ser exposta, o status volta a `EM_TRATAMENTO` e a data de alta é removida. A UI de reabertura não faz parte do MVP.
- A exclusão do paciente exige confirmação explícita com texto que deixe claro que documentos, evoluções e cobranças também serão removidos.

## Campos e validações

| Campo               | Regra                                                    |
| ------------------- | -------------------------------------------------------- |
| Nome                | Obrigatório, após remover espaços nas pontas             |
| Data de nascimento  | Obrigatória; não pode estar no futuro                    |
| Sexo                | Obrigatório: Feminino, Masculino, Outro ou Não informado |
| Telefone            | Obrigatório; armazenado como texto                       |
| Endereço            | Obrigatório; campo único de texto                        |
| Responsável         | Opcional; vazio é persistido como `null`                 |
| Patologia           | Obrigatória; texto livre                                 |
| Queixa principal    | Obrigatória; texto livre                                 |
| Valor por sessão    | Obrigatório, maior que zero, BRL                         |
| Data de início      | Obrigatória                                              |
| Previsão de sessões | Inteiro positivo obrigatório                             |
| Dias habituais      | Pelo menos um dia                                        |

Máscaras são apenas de apresentação. Telefone e endereço não devem ser decompostos no banco nesta versão.

## Avaliação e plano terapêutico

- O conteúdo canônico é Markdown, armazenado como texto.
- A avaliação inicial pode ser criada e editada livremente.
- O banco permite múltiplas avaliações com tipo e data para suportar reavaliações no futuro.
- No MVP, a aplicação cria no máximo uma avaliação do tipo `INICIAL` por paciente.
- Reavaliações não são implementadas na interface inicial.
- O plano terapêutico é único por paciente e contém dois campos independentes: objetivos e condutas.
- Conteúdo vazio é permitido enquanto o documento ainda não foi preenchido.
- Não existe histórico de versões.

## Evoluções

- Cada evolução representa uma sessão já realizada.
- A data inicia preenchida com a data local atual e pode ser ajustada.
- O horário é obrigatório e digitado manualmente.
- O conteúdo Markdown é obrigatório.
- A listagem é ordenada por data decrescente, horário decrescente e criação decrescente como desempate.
- Não há limite de evoluções baseado na previsão inicial.
- Excluir requer confirmação.
- Uma evolução já associada a uma cobrança não pode ser excluída diretamente, pois isso quebraria o histórico financeiro. A interface orienta a excluir primeiro a cobrança correspondente; depois disso a evolução volta a estar livre e pode ser excluída.
- Editar data ou horário de uma evolução já cobrada é permitido, mas a mensagem da cobrança será recalculada a partir das sessões relacionadas. A interface deve alertar que os dias exibidos na mensagem podem mudar. O valor da cobrança não muda.

## Cópia de conteúdo

- `Copiar Markdown` envia ao clipboard o texto Markdown original como `text/plain`.
- `Copiar formatado` envia simultaneamente `text/html` e uma alternativa `text/plain` usando a Clipboard API.
- O HTML vem de uma renderização controlada do Markdown; HTML bruto contido no Markdown não é executado.
- Os dois modos estão disponíveis na avaliação, objetivos, condutas e evoluções.
- Falhas de permissão do navegador devem produzir mensagem de erro clara, sem apagar ou modificar conteúdo.

## Contexto para IA externa

O contexto é somente copiado; o sistema não transmite dados para serviços externos.

A ordem do documento gerado é:

1. Patologia.
2. Queixa principal.
3. Avaliação inicial.
4. Objetivos.
5. Condutas.
6. Evoluções, da mais recente para a mais antiga.

`Copiar contexto` limita a seção de evoluções às cinco mais recentes. `Copiar contexto completo` inclui todas. Se uma seção estiver vazia, ela permanece no Markdown com o texto `Não informado.` para deixar a ausência explícita.

## Alta

- Dar alta solicita apenas a data.
- Antes de concluir, o sistema conta as sessões não cobradas.
- Se a contagem for zero, a alta pode ser confirmada imediatamente.
- Se houver sessões não cobradas, o diálogo oferece `Gerar cobrança` e `Dar alta mesmo assim`.
- Gerar cobrança não dá alta automaticamente; após a cobrança ser criada, o usuário confirma a alta.
- A existência de cobranças pendentes não impede a alta, desde que as sessões já estejam vinculadas a uma cobrança.

## Datas e horário

- Datas clínicas são tratadas como datas civis (`YYYY-MM-DD`), sem conversão de fuso na apresentação.
- Horário de evolução é armazenado separadamente (`HH:mm:ss`).
- Instantes técnicos (`createdAt`, `updatedAt`, exportação) usam UTC no banco e ISO 8601 no JSON.
- Toda exibição usa locale `pt-BR` e fuso `America/Fortaleza`.
