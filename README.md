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
  <a href="#contribuição">Contribuição</a>
</p>

---

## Sobre o projeto

O **EduScience** é uma plataforma de comércio eletrônico voltada à comercialização e à gestão de kits práticos de experimentos de Química e Física.

O sistema tem como público-alvo professores e instituições de ensino que desejam incorporar atividades experimentais ao processo de aprendizagem, aproximando os conceitos teóricos da prática científica.

A proposta contempla uma jornada integrada de compra, desde a apresentação dos produtos até o gerenciamento do carrinho, registro das operações comerciais, acompanhamento de suporte pedagógico e organização de informações fiscais e financeiras.

O projeto será desenvolvido com front-end web, API REST e banco de dados relacional, aplicando conceitos de desenvolvimento de sistemas, modelagem de dados e integração entre aplicações.

## Funcionalidades

### Catálogo e interface

- [ ] Landing page institucional.
- [ ] Catálogo de kits experimentais.
- [ ] Carrossel dinâmico de produtos.
- [ ] Interface responsiva.
- [ ] Padronização visual com variáveis CSS.
- [ ] Animações e interações visuais.

### Usuários e autenticação

- [ ] Cadastro de usuários.
- [ ] Login integrado à API.
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

- [ ] Endpoints CRUD.
- [ ] Integração com MariaDB.
- [ ] Arquitetura MVC.
- [ ] Pool de conexões com o banco de dados.
- [ ] Tratamento de erros e validação de entradas.

> As funcionalidades estão planejadas e serão marcadas como concluídas somente após sua implementação e validação.

## Tecnologias

| Tecnologia | Finalidade |
|---|---|
| HTML5 | Estrutura das páginas |
| CSS3 | Estilização, responsividade e animações |
| JavaScript | Interatividade e comunicação com a API |
| Node.js | Ambiente de execução do back-end |
| Express | Desenvolvimento da API REST |
| MariaDB | Banco de dados relacional |
| `mariadb` | Driver de conexão com o banco |
| `cors` | Configuração de acesso entre origens |
| `dotenv` | Gerenciamento de variáveis de ambiente |
| Git | Controle de versão |
| GitHub | Hospedagem do repositório e colaboração |

## Arquitetura e estrutura

O EduScience será organizado em três componentes principais:

- **Front-end:** interface web desenvolvida com HTML, CSS e JavaScript.
- **Back-end:** API REST desenvolvida com Node.js e Express, organizada segundo o padrão MVC.
- **Banco de dados:** MariaDB, responsável pela persistência e integridade dos dados.

### Estrutura prevista

```text
eduscience/
├── frontend/
│   ├── index.html                    # Redireciona para /pages/landing.html
│   ├── pages/
│   │   ├── landing.html              # Landing Page com carrossel de kits
│   │   ├── login.html                # Form de login autenticado via API
│   │   └── carrinho.html             # Interface do carrinho
│   ├── css/
│   │   ├── global.css                # :root com a paleta Gestalt e estilos base
│   │   ├── landing.css
│   │   ├── login.css
│   │   └── carrinho.css
│   ├── js/
│   │   ├── api.js                    # Fetch/Axios centralizado para comunicação com a API
│   │   ├── landing.js                # Lógica do carrossel em JS puro
│   │   ├── login.js                  # Integração POST /api/login
│   │   └── carrinho.js               # Adicionar, alterar quantidade, remover itens
│   └── assets/
│       ├── images/                   # Fotos dos kits de Química e Física
│       └── icons/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js           # Pool de conexões MariaDB
│   │   ├── controllers/
│   │   │   ├── authController.js     # Login / Autenticação
│   │   │   ├── produtoController.js  # Catalogo / Kits
│   │   │   └── carrinhoController.js # Operações do carrinho
│   │   ├── models/
│   │   │   ├── clienteModel.js
│   │   │   ├── produtoModel.js
│   │   │   └── carrinhoModel.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── produtoRoutes.js
│   │   │   └── carrinhoRoutes.js
│   │   ├── middlewares/
│   │   │   └── authMiddleware.js    
│   │   └── app.js                    
│   ├── .env.example
│   ├── .env                         
│   └── package.json
│
├── database/
│   ├── scripts/
│   │   ├── schema.sql               
│   │   ├── seeds.sql                 
│   │   └── queries.sql               
│   └── diagrams/
│       ├── der_eduscience.puml
│       └── mer_eduscience.puml
│
├── docs/
├── .gitignore
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

- [ ] Finalizar os requisitos do sistema.
- [ ] Definir o catálogo inicial de kits.
- [ ] Finalizar o DER/MER e os scripts SQL.
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
| Desenvolvimento do banco de dados | A definir |
| Desenvolvimento do back-end | A definir |
| Desenvolvimento do front-end | A definir |

## Versionamento

O projeto utilizará Git para controle de versão e GitHub para hospedagem do repositório, revisão de alterações e organização das entregas.

As regras de branches, commits e pull requests serão definidas pela equipe.

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
