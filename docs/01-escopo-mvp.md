# Escopo do MVP

## Objetivo

Permitir que uma única pessoa organize localmente tratamentos fisioterapêuticos, documentos clínicos em Markdown, atendimentos realizados e cobranças relacionadas, com foco em rapidez de uso e consistência financeira.

## Dentro do escopo

### Pacientes e tratamentos

- Criar, consultar, editar e excluir um cadastro de paciente/tratamento.
- Permitir nomes repetidos e identificar cada tratamento por UUID.
- Listar por status, buscar por nome e exibir os campos essenciais.
- Excluir o cadastro e todo o histórico associado após confirmação explícita.
- Registrar alta e manter o cadastro acessível.

### Registro clínico

- Avaliação inicial editável em Markdown.
- Modelo pronto para reavaliações futuras, sem expor esse fluxo no MVP.
- Objetivos e condutas independentes em Markdown.
- Evoluções de sessões realizadas, com data, horário e Markdown.
- Criar, editar e excluir evoluções.
- Copiar Markdown e copiar conteúdo formatado.
- Copiar contexto resumido (últimas cinco evoluções) ou completo.

### Financeiro

- Encontrar automaticamente evoluções ainda não cobradas.
- Gerar uma cobrança com todas as sessões não cobradas naquele instante.
- Preservar por snapshot o valor unitário e o total.
- Alternar entre Pendente e Paga e controlar a data de pagamento.
- Excluir uma cobrança e liberar suas sessões.
- Gerar e copiar mensagem de cobrança determinística.
- Exibir visão financeira por paciente e visão geral.

### Operação

- Dashboard sem gráficos.
- Exportação manual de todos os dados relevantes para um JSON.
- PostgreSQL 16 em Docker Compose com volume persistente.
- Aplicação Next.js executada diretamente com `pnpm dev`.
- Testes automatizados com prioridade para as regras financeiras.

## Fora do escopo

- Autenticação, usuários, perfis e permissões.
- Hospedagem, sincronização, acesso multiusuário ou uso em vários dispositivos.
- Agenda, sessões futuras, recorrência ou lembretes.
- IA integrada, envio direto para uma IA ou armazenamento de prompts.
- Integração com WhatsApp, e-mail, calendário ou meios de pagamento.
- Pagamento parcial, descontos, juros, despesas ou forma de pagamento.
- Alteração do preço por sessão dentro do mesmo tratamento.
- Seleção manual de sessões ao gerar cobrança.
- Anexos, imagens, assinatura, impressão e geração de PDF.
- Versionamento de avaliação, plano terapêutico ou evoluções.
- Busca dentro das evoluções.
- Importação/restauração de backup.
- Backup automático.
- Relatórios financeiros avançados ou gráficos.
- Testes E2E na primeira versão.

## Critérios de conclusão do MVP

O MVP está concluído quando for possível:

1. Cadastrar um tratamento e localizar o paciente na listagem.
2. Manter avaliação, objetivos, condutas e evoluções.
3. Copiar documentos e contexto em Markdown ou formato rico, conforme aplicável.
4. Gerar cobranças sem duplicar sessões e manter corretamente os estados Pendente/Paga.
5. Dar alta com alerta de sessões não cobradas.
6. Consultar dashboard e financeiro geral.
7. Exportar todos os dados para um arquivo JSON único.
8. Executar os testes financeiros prioritários com sucesso.

## Premissas

- O aplicativo opera no fuso `America/Fortaleza`.
- A moeda é BRL e todos os valores exibidos usam `pt-BR`.
- Uma evolução equivale a uma sessão realizada e faturável.
- O preço vigente do cadastro é usado somente ao criar uma nova cobrança; cobranças existentes não mudam se o preço do paciente for alterado depois.
- A previsão de sessões é informativa e nunca bloqueia evoluções adicionais.
