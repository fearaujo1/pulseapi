# 🚀 Smart Production Manager (PulseAPI)

Sistema MES (Manufacturing Execution System) desenvolvido para monitoramento, controle e gestão de processos produtivos industriais em tempo real.

---

## 📌 Sobre o Projeto

O **Smart Production Manager** é uma solução voltada para o ambiente industrial, com o objetivo de:

* Gerenciar equipamentos produtivos
* Monitorar status em tempo real
* Integrar máquinas industriais (como impressoras Domino)
* Fornecer base para indicadores de produção (OEE, eficiência, etc.)

O sistema está sendo desenvolvido como um produto real, com arquitetura escalável baseada em microsserviços.

---

## 🏗️ Arquitetura

O projeto segue uma arquitetura **Full Stack** dividida em:

### 🔹 Backend

* Java 21
* Spring Boot
* Spring Data JPA
* SQL Server / H2 (dev)
* Spring Security + JWT
* Arquitetura em camadas (Controller, Service, Repository)

### 🔹 Frontend

* React (Vite)
* JavaScript
* CSS
* Componentização modular

---

## ⚙️ Funcionalidades

### 📦 Gestão de Equipamentos

* Cadastro de equipamentos
* Atualização de dados
* Exclusão
* Consulta geral e por ID
* Alteração de status (ativo, inativo, manutenção)

---

### 👤 Gestão de Usuários (Autenticação e Autorização)

* Cadastro de usuários por ADMIN
* Perfis de acesso:
  - ADMIN
  - GESTOR
  - SUPERVISOR
  - OPERADOR
* Senha criptografada com **BCrypt**
* Controle de status do usuário (ativo, inativo, bloqueado)

---

### 🔐 Autenticação e Segurança

* Login com email e senha
* Geração de **JWT (JSON Web Token)**
* Filtro de autenticação para validação do token
* Proteção de rotas com Spring Security
* Controle de acesso por perfil (`@PreAuthorize`)

---

### 🔁 Primeiro Acesso

* Usuário criado com senha temporária
* Obrigatoriedade de troca de senha no primeiro login
* Validação de senha forte:
  - mínimo 8 caracteres
  - letra maiúscula
  - letra minúscula
  - número
  - caractere especial

---

### 📊 Interface Web

* Tabela com paginação
* Filtros por tipo e status
* Busca com debounce
* Cards de resumo
* Interface moderna e responsiva

---

### 🔌 Integração Industrial

* Comunicação com impressoras Domino (AX150i)
* Leitura de status da máquina
* Parser de protocolo Codenet
* Estrutura preparada para envio de comandos de impressão

---

## 📁 Estrutura do Projeto

```bash
PulseAPI/
├── src/                # Backend (Spring Boot)
├── frontend/           # Frontend (React)
├── pom.xml
└── README.md
```

### ⚠️ Gestão de Ocorrências / Paradas

* Registro de ocorrências vinculadas a equipamentos
* Consulta geral e por ID
* Consulta por equipamento
* Atualização de ocorrência
* Exclusão de ocorrência
* Tipos de ocorrência:
  - FALHA_EQUIPAMENTO
  - PARADA_LINHA
  - MANUTENCAO
  - OUTRO

### 🔹 Paradas / Ocorrências

| Método | Endpoint                         | Descrição                           |
| ------ | -------------------------------- | ----------------------------------- |
| GET    | /paradas                         | Lista todas as ocorrências/paradas  |
| GET    | /paradas/{id}                    | Busca ocorrência/parada por ID      |
| GET    | /paradas/equipamento/{id}        | Lista ocorrências por equipamento   |
| POST   | /paradas                         | Registra nova ocorrência/parada     |
| PUT    | /paradas/{id}                    | Atualiza ocorrência/parada          |
| DELETE | /paradas/{id}                    | Remove ocorrência/parada            |
