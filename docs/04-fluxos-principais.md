# Fluxos principais

## 1. Cadastrar paciente/tratamento

1. Abrir `Pacientes` e selecionar `Novo paciente` para acessar `/pacientes/novo`.
2. Preencher os dados cadastrais e clínicos.
3. Selecionar os dias habituais; a frequência é atualizada na tela.
4. Salvar após validação Zod no cliente e novamente no servidor.
5. Criar o paciente e um plano terapêutico vazio na mesma transação.
6. Redirecionar para a aba `Resumo`.

## 2. Manter avaliação e plano

1. Abrir a aba correspondente.
2. Editar no editor visual Markdown.
3. Salvar explicitamente.
4. Exibir confirmação de sucesso e manter o Markdown como fonte canônica.
5. Permitir copiar Markdown ou conteúdo formatado no modo de leitura/edição.

Não haverá autosave no MVP. O botão de salvar reduz ambiguidades e complexidade.

## 3. Registrar evolução

1. Abrir `Evoluções` e selecionar `Nova evolução`.
2. Preencher horário; a data já vem com o dia atual.
3. Escrever o conteúdo no editor visual.
4. Salvar e retornar à lista.
5. Inserir a nova evolução na ordenação mais recente primeiro.

Editar reutiliza o mesmo formulário. Excluir abre confirmação; se a evolução estiver cobrada, a exclusão é recusada com link/indicação da cobrança a remover primeiro.

## 4. Copiar contexto

1. Abrir o menu `Copiar contexto` na página do paciente.
2. Escolher `Últimas 5 evoluções` ou `Contexto completo`.
3. Buscar os documentos e evoluções necessários no servidor.
4. Montar Markdown determinístico com títulos e separadores.
5. Copiar como texto e exibir feedback.

Nenhum dado sai do navegador além da ação manual de colar feita pelo usuário.

## 5. Gerar cobrança

1. Abrir a aba `Financeiro`.
2. Consultar evoluções sem registro em `CobrancaSessao`.
3. Exibir datas, quantidade, preço atual e total calculado.
4. Ao selecionar `Gerar cobrança`, reconsultar as sessões no servidor.
5. Se não houver sessões livres, não criar cobrança.
6. Em uma transação, criar a cobrança com snapshots e associar todas as sessões livres.
7. Tratar violação de unicidade como conflito e atualizar a tela, sem gerar cobrança parcial.
8. Exibir a cobrança Pendente e sua mensagem.

## 6. Pagar, reabrir e excluir cobrança

### Marcar como paga

1. Solicitar a data do pagamento, preenchida inicialmente com a data atual.
2. Alterar status para `PAGA` e registrar a data na mesma operação.

### Voltar para pendente

1. Confirmar a ação.
2. Alterar status para `PENDENTE` e limpar `dataPagamento` atomicamente.

### Excluir

1. Confirmar explicitamente.
2. Excluir a cobrança.
3. A cascade remove `CobrancaSessao`; as evoluções continuam intactas e tornam-se cobraveis novamente.

## 7. Dar alta

1. Abrir a ação `Dar alta`.
2. Informar a data.
3. Contar sessões não cobradas no servidor.
4. Sem sessões livres: confirmar e salvar status/data.
5. Com sessões livres: alertar e oferecer gerar cobrança antes.
6. O usuário ainda pode escolher `Dar alta mesmo assim`.

## 8. Excluir paciente

1. Abrir ação destrutiva no cadastro.
2. Exibir o nome e informar que todo o histórico será excluído.
3. Exigir confirmação explícita no diálogo.
4. Em uma transação, excluir primeiro as cobranças do paciente (liberando os vínculos) e depois o paciente; as cascades removem avaliações, plano e evoluções sem violar a proteção de evoluções cobradas.
5. Voltar à listagem com feedback.

## 9. Exportar dados

1. Abrir `Configurações` e selecionar `Exportar dados`.
2. Buscar os pacientes e relações em ordem determinística.
3. Serializar datas, horários e decimais explicitamente.
4. Gerar resposta JSON para download.
5. Nomear como `fisio-backup-AAAA-MM-DD-HHmmss.json` no fuso local.

Falhas não devem produzir arquivo parcial.
