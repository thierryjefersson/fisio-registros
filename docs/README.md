# Fisio Registros — documentação do MVP

Documentação funcional e técnica do **fisio-registros**, um aplicativo pessoal para organizar tratamentos e registros fisioterapêuticos.

Esta documentação é a referência para a primeira implementação. Em caso de conflito, as regras de negócio descritas aqui têm prioridade sobre exemplos de interface. O objetivo é entregar um produto local, pequeno e confiável, sem antecipar infraestrutura ou funcionalidades que ainda não são necessárias.

## Documentos

1. [Escopo do MVP](./01-escopo-mvp.md)
2. [Regras de negócio](./02-regras-de-negocio.md)
3. [Modelo de dados e schema Prisma](./03-modelo-de-dados.md)
4. [Fluxos principais](./04-fluxos-principais.md)
5. [Mapa de telas e componentes](./05-telas-e-componentes.md)
6. [Regras financeiras](./06-regras-financeiras.md)
7. [Estratégia de testes](./07-estrategia-de-testes.md)
8. [Estrutura inicial e arquitetura](./08-estrutura-inicial.md)
9. [Stack e dependências](./09-stack-e-dependencias.md)
10. [Plano de implementação](./10-plano-de-implementacao.md)

## Princípios

- Um cadastro representa um tratamento, não uma pessoa global.
- O nome do paciente não é único; todas as relações usam um UUID interno.
- As evoluções registram apenas atendimentos que já aconteceram.
- O financeiro deriva das evoluções e preserva os valores da cobrança por snapshot.
- Conteúdo clínico rico é persistido como Markdown.
- Regras importantes ficam em funções de domínio pequenas e testáveis.
- Sem autenticação, nuvem, agenda, IA, anexos, PDF ou importação no MVP.
- A interface é em pt-BR, clara, desktop-first e responsiva.

## Implementação

O trabalho deve seguir o [plano de implementação](./10-plano-de-implementacao.md). Cada etapa inclui seus próprios testes automatizados e só é considerada concluída quando todos os gates de qualidade estiverem verdes. Testes de uma funcionalidade não são adiados para etapas futuras.
