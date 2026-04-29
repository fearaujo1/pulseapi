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

### 📊 Interface Web

* Tabela com paginação
* Filtros por tipo e status
* Busca com debounce
* Cards de resumo
* Interface moderna e responsiva

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

---

## ▶️ Como Executar o Projeto

### 🔹 Backend

```bash
./mvnw spring-boot:run
```

ou no Windows:

```bash
mvnw.cmd spring-boot:run
```

A API estará disponível em:

```
http://localhost:8080
```

---

### 🔹 Frontend

```bash
cd frontend
npm install
npm run dev
```

A aplicação estará disponível em:

```
http://localhost:5173
```

---

## 🔐 Segurança

* Estrutura preparada para autenticação (Spring Security)
* Atualmente com permissões liberadas para desenvolvimento

---

## 📡 Endpoints principais

| Método | Endpoint                  | Descrição                   |
| ------ | ------------------------- | --------------------------- |
| GET    | /equipamentos             | Lista todos os equipamentos |
| GET    | /equipamentos/{id}        | Busca por ID                |
| POST   | /equipamentos             | Cria novo equipamento       |
| PUT    | /equipamentos/{id}        | Atualiza equipamento        |
| DELETE | /equipamentos/{id}        | Remove equipamento          |
| PATCH  | /equipamentos/{id}/status | Atualiza status             |

---

## 🧠 Tecnologias e Conceitos Aplicados

* Arquitetura em camadas
* REST API
* Integração com dispositivos industriais
* Comunicação via protocolo (Codenet)
* Frontend reativo
* Organização de código por domínio
* Versionamento com Git (commits semânticos)

---

## 🚧 Status do Projeto

🟡 Em desenvolvimento

Próximas etapas:

* Autenticação com JWT
* Dashboard com indicadores (OEE)
* Multi-tenant
* Integração com mais equipamentos
* Deploy em nuvem

---

## 👨‍💻 Autor

**Felipe Araújo (Fe)**
Estudante de Engenharia de Software
Desenvolvedor Backend | Full Stack em evolução

---

## 📄 Licença

Este projeto está sob a licença MIT.
