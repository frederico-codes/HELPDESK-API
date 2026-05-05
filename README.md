# 🛠 HelpDesk API (Backend)

API REST desenvolvida para gerenciamento de chamados técnicos, usuários e serviços.

---

## 📌 Tecnologias utilizadas

* Node.js
* TypeScript
* Express
* Prisma ORM
* PostgreSQL
* Zod (validação)
* JWT (autenticação)
* bcryptjs (hash de senha)
* Jest + Supertest (testes)
* Docker

---

## 📌 Funcionalidades

### 👤 Usuários

* Cadastro de usuários (Admin, Técnico, Cliente)
* Autenticação com JWT
* Atualização de perfil
* Atualização de senha (com validação)
* Exclusão de contas (com regras de segurança)

### 📞 Chamados

* Criação de chamados (somente cliente)
* Listagem de chamados
* Visualização detalhada
* Atualização de status (técnico/admin)
* Adição e remoção de serviços adicionais

### 🧩 Serviços

* Cadastro de serviços
* Listagem de serviços
* Ativação/desativação

---

## 🔐 Regras de acesso

| Ação                  | Cliente     | Técnico     | Admin       |
| --------------------- | ----------- | ----------- | ----------- |
| Criar chamado         | ✅           | ❌           | ❌           |
| Alterar chamado       | ❌           | ✅           | ✅           |
| Alterar usuários      | ❌           | ❌           | ✅           |
| Alterar própria conta | ✅           | ✅           | ✅           |
| Alterar senha         | ✅ (própria) | ✅ (própria) | ✅ (própria) |

---

## ⚙️ Variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/helpdesk
JWT_SECRET=seu_segredo
JWT_EXPIRES_IN=1d
PORT=3000
```

---

## 🚀 Como rodar o projeto

### 1. Clonar repositório

```bash
git clone git@github.com:frederico-codes/HELPDESK-API.git
cd helpdesk-api
```

---

### 2. Instalar dependências

```bash
npm install
```

---

### 3. Rodar banco com Docker

```bash
docker-compose up -d
```

---

### 4. Rodar migrations

```bash
npx prisma migrate dev
```

---

### 5. Rodar seed (dados iniciais)

```bash
npx prisma db seed
```

---

### 6. Rodar aplicação

```bash
npm run dev
```

---

## 🧪 Testes automatizados

Rodar testes:

```bash
npm run test:dev
```

Cobertura:

```bash
npm run test -- --coverage
```

---

## 📂 Estrutura do projeto

```txt
src/
  controllers/
  routes/
  middlewares/
  database/
  utils/
  tests/
```

---

## 🔑 Autenticação

A API utiliza JWT.

Envie no header:

```http
Authorization: Bearer <token>
```

---

## 📡 Principais endpoints

### Usuários

* POST `/users`
* GET `/users`
* PUT `/users/:id`
* PATCH `/users/:id/password`

---

### Sessões

* POST `/sessions`

---

### Chamados

* POST `/calls`
* GET `/calls`
* GET `/calls/:id`
* PATCH `/calls/:id/status`

---

### Serviços

* POST `/services`
* GET `/services`

---

## 🐳 Docker

Para rodar com Docker:

```bash
docker-compose up --build
```

---

## 🌍 Deploy

👉 API disponível em:

```txt
https://sua-api-em-producao.com
```



---

## 📌 Boas práticas implementadas

* Validação com Zod
* Autenticação JWT
* Controle de acesso por role (RBAC)
* Separação de responsabilidades
* Testes automatizados
* Docker para ambiente isolado

---

## 🌱 Seed de dados

O projeto possui um script de seed que cria usuários iniciais com diferentes níveis de acesso:

- Manager
- Technician
- Customer

Para rodar o seed:

```bash
npx prisma db seed
```

## 👨‍💻 Autor

Frederico Nakajima
