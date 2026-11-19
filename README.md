# EduScience

<p align="center">
  <strong>Plataforma de comércio eletrônico de kits educacionais</strong>
</p>

<p align="center">
  Comercialização e gestão de kits práticos de experimentos de Química e Física para professores e instituições de ensino.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-MVP%20Conclu%C3%ADdo-brightgreen" alt="Status do projeto">
  <img src="https://img.shields.io/badge/Node.js-Backend-green?logo=nodedotjs" alt="Node.js">
  <img src="https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JavaScript-orange" alt="Front-end">
  <img src="https://img.shields.io/badge/MariaDB-Database-blue?logo=mariadb" alt="MariaDB">
</p>

<p align="center">
  <a href="#sobre-o-projeto">Sobre</a> •
  <a href="#funcionalidades">Funcionalidades</a> •
  <a href="#tecnologias">Tecnologias</a> •
  <a href="#rotas-da-api">Rotas da API</a> •
  <a href="#como-executar">Instalação</a> •
  <a href="#contribuição">Contribuição</a> •
  <a href="#versionamento">Versionamento</a>
</p>

---

## Sobre o projeto

O **EduScience** é uma plataforma de comércio eletrônico voltada à comercialização e à gestão de kits práticos de experimentos de Química e Física.

O sistema atende professores e instituições de ensino que desejam incorporar atividades experimentais ao processo de aprendizagem, conectando conceitos teóricos à prática científica.

A aplicação contempla a jornada completa de compra: navegação inicial e catálogo de kits, cadastro institucional e autenticação via JWT, gerenciamento de carrinho sincronizado entre `localStorage` e API, checkout com cálculo de frete e validação de campos, processamento transacional de pedidos no banco e geração/consulta de comprovante com dados de NF-e (DANFE simplificado).

O projeto é desenvolvido com front-end web (HTML5, CSS3 com Design System e Vanilla JS em ES Modules), API REST (Node.js/Express) e banco de dados relacional (MariaDB), aplicando arquitetura MVC, validação de entradas e integração segura via JWT.

---

## Funcionalidades

### Catálogo e interface

- [x] Landing page institucional.
- [x] Catálogo de kits experimentais.
- [x] Carrossel dinâmico de produtos (com suporte a navegação por teclado e `aria-*`).
- [x] Interface responsiva e acessível (WCAG AA / skip links / landmarks).
- [x] Padronização visual com variáveis CSS (`:root`).
- [x] Animações e interações visuais.

### Usuários e autenticação

- [x] Cadastro institucional de escolas/usuários.
- [x] Login integrado à API (com persistência JWT).
- [x] Validação dos dados cadastrais (máscaras e validação inline).
- [x] Gerenciamento de usuários.
- [x] Proteção de operações restritas (`checkoutGuard` e middleware JWT).

### Carrinho e compras

- [x] Adição de produtos ao carrinho.
- [x] Alteração da quantidade de itens.
- [x] Remoção de produtos.
- [x] Atualização dinâmica dos valores e cálculo de frete.
- [x] Registro e consulta de compras (transação SQL).
- [x] Registro das operações de venda e limpeza automática do carrinho após compra.

### Suporte pedagógico

- [ ] Registro de solicitações de atendimento.
- [ ] Acompanhamento das solicitações.
- [ ] Suporte a professores e instituições de ensino.

### Gestão fiscal e financeira

- [x] Armazenamento de informações de vendas.
- [x] Registro de informações fiscais.
- [x] Geração e consulta de comprovante / NF-e (DANFE simplificado, tributos e chave de acesso) com suporte a impressão.

### API REST

- [x] Endpoints CRUD e rotas de checkout/nota fiscal.
- [x] Integração com MariaDB.
- [x] Arquitetura MVC.
- [x] Pool de conexões com o banco de dados.
- [x] Tratamento de erros e validação de entradas.

---

## Tecnologias

| Tecnologia | Finalidade |
|---|---|
| HTML5 | Estrutura semântica e acessível das páginas |
| CSS3 | Estilização, variáveis CSS (`:root`), flexbox, grid responsivo e `@media print` |
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

O EduScience é organizado em três camadas principais:

```text
eduscience/
├── frontend/
│   ├── pages/
│   │   ├── landing.html
│   │   ├── cadastro.html
│   │   ├── login.html
│   │   ├── carrinho.html
│   │   ├── checkout.html
│   │   └── sucesso.html
│   ├── css/
│   │   ├── global.css                # Tokens (:root), navbar, botões, alertas e a11y
│   │   ├── validacoes.css            # Feedback visual de campos válidos/inválidos
│   │   ├── landing.css
│   │   ├── cadastro.css
│   │   ├── login.css
│   │   ├── carrinho.css
│   │   ├── checkout.css
│   │   └── sucesso.css
│   └── js/
│       ├── api.js                    # Wrapper de Fetch e tratamento de erros HTTP/JWT
│       ├── landing.js
│       ├── cadastro.js
│       ├── login.js
│       ├── carrinho.js
│       ├── checkoutGuard.js
│       ├── checkout.js
│       ├── sucesso.js
│       └── validacoes.js             # Máscaras e validações de campos
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js           # Pool de conexões MariaDB
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── app.js
│   ├── .env.example
│   └── package.json
│
├── database/
│   └── scripts/
│       ├── schema.sql                # Criação das tabelas e relacionamentos
│       └── seeds.sql                 # Dados iniciais de kits e registros de teste
│
└── README.md
```

### Banco de dados

O banco de dados relacional é executado no **MariaDB** (`projeto_integrador`), utilizando chaves primárias (PK), chaves estrangeiras (FK), transações SQL para consistência de pedidos/estoque e consultas relacionais.

Os scripts de criação de estrutura e carga inicial encontram-se em:

- `database/scripts/schema.sql`
- `database/scripts/seeds.sql`

---

## Rotas da API

Base URL local: `http://localhost:3000/api`

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| `GET` | `/produtos` | Pública | Lista os kits educacionais disponíveis |
| `GET` | `/produtos/:id` | Pública | Retorna os detalhes de um kit específico |
| `POST` | `/auth/cadastro` | Pública | Cadastra nova escola/usuário |
| `POST` | `/auth/login` | Pública | Autentica o usuário e retorna o token JWT |
| `GET` | `/carrinho` | JWT (`Bearer`) | Consulta os itens do carrinho do usuário autenticado |
| `POST` | `/carrinho/adicionar` | JWT (`Bearer`) | Adiciona item ao carrinho |
| `PUT` | `/carrinho/:id` | JWT (`Bearer`) | Atualiza a quantidade de um item no carrinho |
| `DELETE` | `/carrinho/:id` | JWT (`Bearer`) | Remove um item do carrinho |
| `POST` | `/pedidos` | JWT (`Bearer`) | Finaliza o pedido em transação SQL, atualiza estoque e gera NF-e |
| `GET` | `/pedidos/:id/nota-fiscal` | JWT (`Bearer`) | Consulta os dados do pedido e da Nota Fiscal / DANFE |

---

## Pré-requisitos

Para executar o projeto localmente, instale e configure:

- **Node.js** (versão LTS recomendada, compatível com ES Modules no front-end e dependências do back-end).
- **npm** (instalado junto com o Node.js).
- **MariaDB** (serviço em execução, padrão na porta `3306`).
- **Git** (para clonar e versionar o repositório).
- Servidor HTTP estático para o front-end (ex.: extensão **Live Server** no VS Code em `http://127.0.0.1:5500` ou `npx serve`).

---

## Como executar

### 1. Clone o repositório

```bash
git clone https://github.com/ArthurTardin/EduScience.git
cd eduscience
```

### 2. Instale as dependências do back-end

```bash
cd backend
npm install
```

### 3. Configure as variáveis de ambiente (`.env`)

Na pasta `backend/`, copie o arquivo de exemplo e preencha suas credenciais:

```bash
cp .env.example .env
```

*(No PowerShell: `Copy-Item .env.example .env`)*

Edite o `.env` conforme o seu ambiente local (ver tabela de variáveis na seção **Configuração**).

### 4. Crie o banco e execute os scripts SQL no MariaDB

Acesse o cliente do MariaDB e execute os scripts de estrutura e carga inicial a partir da raiz do projeto:

```bash
mariadb -u root -p -e "CREATE DATABASE IF NOT EXISTS projeto_integrador CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mariadb -u root -p projeto_integrador < database/scripts/schema.sql
mariadb -u root -p projeto_integrador < database/scripts/seeds.sql
```

### 5. Inicie o back-end

Dentro de `backend/`:

```bash
npm run dev
```

A API ficará disponível em `http://localhost:3000`.

### 6. Inicie e acesse o front-end

Sirva a pasta `frontend/` via servidor HTTP local (não abra os arquivos diretamente via `file://`, para evitar bloqueios de CORS e ES Modules):

- Usando **Live Server** no VS Code: abra `frontend/pages/landing.html` com o Live Server (`http://127.0.0.1:5500/frontend/pages/landing.html`).
- Ou via terminal na pasta `frontend/`:

```bash
npx serve .
```

---

## Configuração

As configurações do back-end são carregadas via `dotenv` a partir de `backend/.env`:

| Variável | Descrição | Exemplo |
|---|---|---|
| `PORT` | Porta em que o servidor Express será iniciado | `3000` |
| `DB_HOST` | Host do servidor MariaDB | `localhost` |
| `DB_PORT` | Porta do MariaDB | `3306` |
| `DB_USER` | Usuário do banco de dados | `root` |
| `DB_PASSWORD` | Senha do usuário do banco | `sua_senha` |
| `DB_NAME` | Nome do banco de dados | `projeto_integrador` |
| `JWT_SECRET` | Chave secreta para assinatura e verificação de tokens JWT | `sua_chave_secreta_forte` |

Nunca versione o arquivo `.env` nem exponha segredos reais no repositório; mantenha apenas valores fictícios em `backend/.env.example`.

---

## Uso

Fluxo principal da plataforma:

1. Acesse `frontend/pages/landing.html` para explorar os kits educacionais e o carrossel em destaque.
2. Adicione os kits desejados ao carrinho diretamente pela landing page.
3. Acesse `frontend/pages/cadastro.html` para registrar a escola ou `frontend/pages/login.html` para autenticar-se e obter o JWT.
4. Na página `frontend/pages/carrinho.html`, ajuste quantidades, remova itens ou clique em **Finalizar Compra** (protegido pela guarda de sessão).
5. Em `frontend/pages/checkout.html`, informe os dados do destinatário, CEP e UF (com cálculo dinâmico de frete), escolha a forma de pagamento (PIX, Cartão ou Boleto) e confirme o pedido.
6. Na página `frontend/pages/sucesso.html`, visualize o comprovante e os dados da NF-e (itens, tributos e chave de acesso), com opção de impressão (`@media print`).

---

## Testes

- [x] Validação manual de endpoints da API REST e autenticação JWT.
- [x] Validação da integração com MariaDB e transações de pedido/NF-e.
- [x] Testes de validação de formulários, cálculo de frete, carrinho e fluxo End-to-End.
- [x] Verificação de acessibilidade (navegação por teclado, atributos `aria-*`, contraste e Lighthouse).
- [ ] Suíte automatizada de testes unitários e de integração.

---

## Roadmap

- [x] Finalizar os requisitos do sistema.
- [x] Definir o catálogo inicial de kits.
- [x] Finalizar o DER/MER e os scripts SQL (`schema.sql` e `seeds.sql`).
- [x] Implementar a estrutura da API REST (MVC + pool MariaDB).
- [x] Desenvolver cadastro e autenticação JWT.
- [x] Implementar o catálogo de produtos.
- [x] Desenvolver o carrinho de compras e sincronização.
- [x] Integrar front-end, back-end e banco de dados.
- [x] Implementar os registros de compras, vendas e transação SQL.
- [x] Implementar os recursos fiscais previstos (NF-e / DANFE simplificado).
- [x] Padronizar Design System e acessibilidade (a11y).
- [x] Executar e documentar testes integrados / E2E.
- [ ] Desenvolver o módulo de suporte pedagógico.
- [ ] Finalizar documentação e entrega final.

---

## Contribuição

O EduScience é desenvolvido de forma colaborativa com organização em sprints e quadro Kanban.

Para contribuir:

1. Consulte as tarefas e prioridades definidas no board/issues da sprint.
2. Crie uma branch específica a partir da branch de desenvolvimento (`feat/...`, `fix/...`, `docs/...`).
3. Implemente, valide localmente e revise as alterações.
4. Abra um Pull Request (PR) para revisão e integração conforme o fluxo acordado.

### Equipe

| Responsabilidade | Integrante |
|---|---|
| Scrum Master | [Arthur Tardin](https://github.com/ArthurTardin) |
| Desenvolvimento do banco de dados | Equipe EduScience |
| Desenvolvimento do back-end | Equipe EduScience |
| Desenvolvimento do front-end | Equipe EduScience |

---

## Versionamento

O repositório adota controle de versão com Git e GitHub:

- **Branches de trabalho:** alterações organizadas por feature/correção/documentação (`feat/...`, `fix/...`, `docs/...`).
- **Pull Requests & Code Review:** revisão das alterações antes da integração na branch principal.
- **Conventional Commits:** mensagens padronizadas (ex.: `feat(frontend): ...`, `fix(backend): ...`, `docs(readme): ...`).

---

## Licença

A licença do EduScience segue as definições da equipe e do projeto acadêmico/institucional. A distribuição e a reutilização do código devem respeitar os termos estabelecidos no repositório.

---

## Autor

**Equipe EduScience**

- GitHub: [ArthurTardin/EduScience](https://github.com/ArthurTardin/EduScience.git)

---

<p align="center">
  Desenvolvido como projeto de integração entre tecnologia, comércio eletrônico e educação científica.
</p>