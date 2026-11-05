# EduScience

<p align="center">
  <strong>Plataforma de comércio eletrônico de kits educacionais</strong>
</p>

<p align="center">
  Comercialização e gestão de kits práticos de experimentos de Química e Física para professores e instituições de ensino.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow" alt="Status do projeto">
  <img src="https://img.shields.io/badge/Node.js-Backend-green?logo=nodedotjs" alt="Node.js">
  <img src="https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JavaScript-orange" alt="Front-end">
  <img src="https://img.shields.io/badge/MariaDB-Database-blue?logo=mariadb" alt="MariaDB">
</p>

<p align="center">
  <a href="#sobre-o-projeto">Sobre</a> •
  <a href="#funcionalidades">Funcionalidades</a> •
  <a href="#tecnologias">Tecnologias</a> •
  <a href="#como-executar">Instalação</a> •
  <a href="#contribuição">Contribuição</a> •
  <a href="#versionamento">Versionamento</a>
</p>

---

## Sobre o projeto

O **EduScience** é uma plataforma de comércio eletrônico voltada à comercialização e à gestão de kits práticos de experimentos de Química e Física.

O sistema tem como público-alvo professores e instituições de ensino que desejam incorporar atividades experimentais ao processo de aprendizagem, aproximando os conceitos teóricos da prática científica.

A proposta contempla uma jornada integrada de compra, desde a apresentação dos produtos até o gerenciamento do carrinho, registro das operações comerciais, acompanhamento de suporte pedagógico e organização de informações fiscais e financeiras.

O projeto é desenvolvido com front-end web (Vanilla JS em ES Modules), API REST (Node.js/Express) e banco de dados relacional (MariaDB), aplicando arquitetura MVC, Clean Code e integração segura via JWT.

## Funcionalidades

### Catálogo e interface

- [ ] Landing page institucional.
- [ ] Catálogo de kits experimentais.
- [ ] Carrossel dinâmico de produtos.
- [x] Interface responsiva.
- [x] Padronização visual com variáveis CSS.
- [x] Animações e interações visuais.

### Usuários e autenticação

- [ ] Cadastro de usuários.
- [x] Login integrado à API (com persistência JWT).
- [ ] Validação dos dados cadastrais.
- [ ] Gerenciamento de usuários.
- [ ] Proteção de operações restritas.

### Carrinho e compras

- [ ] Adição de produtos ao carrinho.
- [ ] Alteração da quantidade de itens.
- [ ] Remoção de produtos.
- [ ] Atualização dinâmica dos valores.
- [ ] Registro e consulta de compras.
- [ ] Registro das operações de venda.

### Suporte pedagógico

- [ ] Registro de solicitações de atendimento.
- [ ] Acompanhamento das solicitações.
- [ ] Suporte a professores e instituições de ensino.

### Gestão fiscal e financeira

- [ ] Armazenamento de informações de vendas.
- [ ] Registro de informações fiscais.
- [ ] Geração ou integração para emissão de notas fiscais, conforme os requisitos definidos.

### API REST

- [x] Endpoints CRUD.
- [x] Integração com MariaDB.
- [x] Arquitetura MVC.
- [x] Pool de conexões com o banco de dados.
- [x] Tratamento de erros e validação de entradas.

---

## Tecnologias

| Tecnologia | Finalidade |
|---|---|
| HTML5 | Estrutura semântica e acessível das páginas |
| CSS3 | Estilização, variáveis CSS (`:root`), flexbox e grid responsivo |
| JavaScript (ES6+) | Módulos (`type="module"`), Fetch API e manipulação assíncrona do DOM |
| Node.js | Ambiente de execução do back-end |
| Express | Framework para desenvolvimento da API REST |
| MariaDB | Banco de dados relacional |
| `mariadb` | Driver oficial de conexão com pool do banco |
| `cors` | Gerenciamento de segurança de acesso entre origens |
| `dotenv` | Isolamento de credenciais e variáveis de ambiente |
| Git & GitHub | Controle de versão, code review e regras de branch protection |

---

## Arquitetura e estrutura

O EduScience é organizado em três componentes desacoplados:

```text
eduscience/
├── frontend/
│   ├── pages/
│   │   ├── landing.html
│   │   └── login.html                # Formulário com suporte a a11y (aria-pressed)
│   ├── css/
│   │   ├── global.css                # Variáveis de cor, tipografia e reset
│   │   └── login.css
│   └── js/
│       ├── api.js                    # Wrapper de Fetch, interceptador de erros HTTP/JSON
│       └── login.js                  # Manipulador de eventos de auth e localStorage (@EduScience)
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js           # Pool de conexões MariaDB
│   │   ├── controllers/
│   │   │   └── authController.js     # Geração e validação de JWT / Login
│   │   ├── routes/
│   │   │   └── authRoutes.js
│   │   └── app.js
│   ├── .env.example
│   └── package.json
│
├── database/
│   └── scripts/
│       ├── schema.sql
│       └── seeds.sql                 # Dados iniciais para validação e testes
│
└── README.md
```

### Banco de dados

O banco de dados será denominado `projeto_integrador` e utilizará MariaDB.

A modelagem inicial contempla oito entidades principais:

- `cliente`
- `cadastro`
- `login`
- `consulta`
- `carrinho_de_compra`
- `compra`
- `venda`
- `nota_fiscal`

A estrutura deverá utilizar chaves primárias (PK), chaves estrangeiras (FK), restrições de integridade e consultas relacionais, incluindo `INNER JOIN`.

## Pré-requisitos

Para executar o projeto, serão necessárias as seguintes ferramentas:

- Node.js em versão compatível com as dependências.
- npm.
- MariaDB.
- Git.

As versões e configurações definitivas serão documentadas após a preparação do ambiente de desenvolvimento.

## Como executar

### 1. Clone o repositório

```bash
git clone https://github.com/ArthurTardin/EduScience.git
cd eduscience
```

### 2. Instale as dependências

```bash
cd backend
npm install
```

### 3. Configure o ambiente

Crie um arquivo `.env` no diretório do back-end, utilizando `.env.example` como referência.

Exemplo ilustrativo:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=projeto_integrador
```

Os nomes das variáveis deverão corresponder à implementação real da aplicação.

### 4. Configure o banco de dados

Crie o banco `projeto_integrador` no MariaDB e execute os scripts SQL de criação das tabelas.

### 5. Inicie o back-end

```bash
npm run dev
```

O comando pressupõe que exista um script `dev` configurado no `package.json`. O comando definitivo dependerá da configuração adotada.

### 6. Acesse o front-end

Abra a página inicial do projeto conforme a configuração de execução definida pela equipe.

## Configuração

As configurações do projeto serão realizadas por meio de variáveis de ambiente.

| Variável | Descrição |
|---|---|
| `PORT` | Porta da API |
| `DB_HOST` | Endereço do servidor MariaDB |
| `DB_PORT` | Porta do banco de dados |
| `DB_USER` | Usuário do banco |
| `DB_PASSWORD` | Senha do banco |
| `DB_NAME` | Nome do banco de dados |

Credenciais, tokens e outros dados sensíveis não devem ser enviados ao GitHub. O arquivo `.env` deverá ser ignorado pelo Git, enquanto o `.env.example` deverá conter apenas valores de exemplo.

## Uso

A plataforma deverá permitir que professores e instituições de ensino consultem os kits disponíveis e realizem o fluxo de compra pela interface web.

O fluxo principal previsto será:

1. Acessar a página inicial.
2. Consultar o catálogo de kits educacionais.
3. Selecionar os produtos desejados.
4. Adicionar produtos ao carrinho.
5. Ajustar quantidades ou remover itens.
6. Autenticar-se para utilizar as operações que exigem identificação.
7. Prosseguir com a compra conforme as regras implementadas.
8. Consultar os registros comerciais e os recursos de suporte disponíveis.

Os fluxos finais dependerão dos requisitos definidos para autenticação, pagamentos, vendas e emissão fiscal.

## Testes

A estratégia de testes deverá contemplar:

- [ ] Testes unitários dos componentes do back-end.
- [ ] Testes dos endpoints da API REST.
- [ ] Testes de integração com o MariaDB.
- [ ] Testes de validação e autenticação.
- [ ] Testes do fluxo do carrinho de compras.
- [ ] Testes integrados do processo de compra.

Os comandos de execução dos testes serão documentados após a configuração das ferramentas correspondentes.

## Roadmap

- [x] Finalizar os requisitos do sistema.
- [x] Definir o catálogo inicial de kits.
- [x] Finalizar o DER/MER e os scripts SQL.
- [ ] Implementar a estrutura da API REST.
- [ ] Desenvolver cadastro e autenticação.
- [ ] Implementar o catálogo de produtos.
- [ ] Desenvolver o carrinho de compras.
- [ ] Integrar front-end, back-end e banco de dados.
- [ ] Implementar os registros de compras e vendas.
- [ ] Desenvolver o suporte pedagógico.
- [ ] Implementar os recursos fiscais previstos.
- [ ] Executar testes integrados.
- [ ] Preparar a entrega final.

## Contribuição

O EduScience será desenvolvido em equipe, com responsabilidades distribuídas e acompanhamento das atividades por meio de um quadro Kanban.

Para contribuir:

1. Consulte as tarefas e prioridades definidas pela equipe.
2. Crie uma branch específica para a alteração.
3. Implemente e teste as mudanças.
4. Abra um pull request para revisão, conforme o fluxo de trabalho adotado.

### Equipe

| Responsabilidade | Integrante |
|---|---|
| Scrum Master | [Arthur Tardin](https://github.com/ArthurTardin) |
| Desenvolvimento do banco de dados | Equipe EduScience |
| Desenvolvimento do back-end | Equipe EduScience |
| Desenvolvimento do front-end | Equipe EduScience |

## Versionamento

O projeto utilizará Git para controle de versão e GitHub para hospedagem do repositório, revisão de alterações e organização das entregas.

O repositório adota um fluxo de desenvolvimento rigoroso para garantir a estabilidade da branch main:

- Branch Protection: Commits diretos na branch main são estritamente bloqueados.

- Branches de Feature: Todas as alterações devem ser desenvolvidas em branches separadas seguindo a convenção feat/nome-da-feature ou fix/nome-do-bug.

- Pull Requests & Code Review: Toda alteração exige abertura de Pull Request (PR) com revisão de código obrigatória e aprovação do líder técnico/peer reviewer.

- Conventional Commits: Títulos de PRs e commits seguem o padrão (ex: feat(frontend): integra tela de login).

- Squash and Merge: Todo o histórico de branches é condensado em um único commit atômico e limpo ao integrar na main

## Licença

A licença do EduScience ainda será definida pela equipe.

A distribuição e a reutilização do código deverão respeitar os termos da licença escolhida.

## Autor

**Equipe EduScience**

- GitHub: [Link do repositório](https://github.com/ArthurTardin/EduScience.git)

---

<p align="center">
  Desenvolvido como projeto de integração entre tecnologia, comércio eletrônico e educação científica.
</p>
