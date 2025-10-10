# 🚚 HerrlogTracker

**HerrlogTracker** é uma aplicação moderna para **monitoramento e rastreamento de veículos**.  
Ela combina **Express + Vite + React + Tailwind + TypeScript + Drizzle ORM** em uma arquitetura fullstack simples e modular.

![Vite](https://img.shields.io/badge/Vite-5A29E4?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-149ECA?logo=react&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)




![Preview da Interface Herrlog](https://github.com/brunaszarin/herrlog-tracking-app/raw/main/previewinterface.gif)




---

## 🧭 Índice
- [Visão Geral](#-visão-geral)
- [Arquitetura](#-arquitetura)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Execução](#-instalação-e-execução)
- [Banco de Dados (Drizzle ORM)](#-banco-de-dados-drizzle-orm)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Endpoints Principais](#-endpoints-principais)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

---

## 🚀 Visão Geral

O **HerrlogTracker** é uma aplicação para **gerenciar e visualizar dados de veículos, rotas e telemetria GPS**, ideal para uso em frotas e operações logísticas. Ele oferece uma interface moderna, backend em Express, e integração opcional com banco de dados PostgreSQL via **Drizzle ORM**. No modo de desenvolvimento, o sistema já inclui uma base de dados mockada em memória (`MemStorage`) com veículos e rotas de exemplo.

---

## 🏗️ Arquitetura

```
📦 HerrlogTracker
 ┣ 📂 client          # Frontend React + Vite + Tailwind
 ┣ 📂 server          # Backend Express + TypeScript
 ┣ 📂 shared          # Schemas e tipagens compartilhadas (Drizzle + Zod)
 ┣ 📄 drizzle.config.ts
 ┣ 📄 package.json
 ┣ 📄 tsconfig.json
 ┣ 📄 vite.config.ts
 ┗ 📄 README.md
```

### Tecnologias Principais
- **Frontend:** React 18 + Vite + Tailwind + ShadCN/UI  
- **Backend:** Express + TSX + Node.js  
- **ORM:** Drizzle ORM (PostgreSQL via Neon ou local)  
- **Autenticação:** Passport + Sessions  
- **Validação:** Zod  
- **Armazenamento Mock:** `MemStorage` (modo dev)

---

## ⚙️ Pré-requisitos

- Node.js **v20.x LTS** (⚠️ não use Node 22 — incompatível com PostCSS)
- npm 10+
- (Opcional) PostgreSQL 14+ se quiser persistência real

---

## 🧩 Instalação e Execução

```bash
# Clone o repositório
git clone https://github.com/seuusuario/HerrlogTracker.git
cd HerrlogTracker

# Instale as dependências
npm install

# Crie o arquivo .env
cp .env.example .env
```

### Rodar em modo de desenvolvimento
```bash
npm run dev
```

O servidor iniciará em:
👉 [http://localhost:5000](http://localhost:5000)

---

## 🗃️ Banco de Dados (Drizzle ORM)

O app roda sem banco por padrão, mas você pode ativar o PostgreSQL:

### 1. Configure o `.env`
```env
DATABASE_URL=postgres://usuario:senha@localhost:5432/herrlogtracker
SESSION_SECRET=sua-string-aleatoria
PORT=5000
```

### 2. Atualize o Drizzle
```bash
npx drizzle-kit push
```

Isso criará as tabelas definidas em `shared/schema.ts`.

---

## 🧱 Estrutura de Pastas

| Pasta | Descrição |
|-------|------------|
| `server/` | Backend Express e rotas API |
| `server/storage.ts` | Implementação do armazenamento (memória ou DB) |
| `shared/schema.ts` | Modelos e schemas Drizzle + Zod |
| `client/` | Frontend React com Tailwind e ShadCN UI |
| `drizzle.config.ts` | Configuração ORM e migrações |
| `test-gps-data.json` | Dados de teste de GPS (mock) |

---

## 📜 Scripts Disponíveis

| Script | Função |
|--------|--------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Gera build otimizado para produção |
| `npm start` | Executa o app em modo produção |
| `npm run db:push` | Cria/sincroniza o schema do banco via Drizzle |
| `npm run check` | Verifica tipos TypeScript |

---

## ⚙️ Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|-----------|------------|----------|
| `PORT` | Porta do servidor | `5000` |
| `DATABASE_URL` | Conexão PostgreSQL | `postgres://user:pass@localhost:5432/herrlogtracker` |
| `SESSION_SECRET` | Chave usada nas sessões | `sua-string-aleatoria` |
| `NODE_ENV` | Ambiente de execução | `development` / `production` |

---

## 🔗 Endpoints Principais

| Método | Endpoint | Descrição |
|--------|-----------|-----------|
| `GET` | `/api/vehicles` | Lista todos os veículos |
| `GET` | `/api/vehicles/:id` | Detalhes de um veículo |
| `POST` | `/api/vehicles` | Cria um novo veículo |
| `GET` | `/api/gps-data` | Retorna dados de GPS filtrados |
| `POST` | `/api/upload` | Envia arquivo JSON de telemetria |
| `POST` | `/api/auth/login` | Login de usuário |
| `POST` | `/api/auth/register` | Registro de usuário |

---

## 🤝 Contribuição

Contribuições são bem-vindas!  
Abra uma issue ou envie um pull request.

1. Faça um fork do projeto  
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`  
3. Commit: `git commit -m "feat: adiciona nova funcionalidade"`  
4. Push: `git push origin feature/nova-funcionalidade`  
5. Abra um Pull Request 🚀

---

## 📄 Licença

Este projeto está sob a licença **MIT** — sinta-se livre para usar e modificar.  
Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

### 💡 Créditos
Desenvolvido com ❤️ por [Bruna Szarin](https://github.com/brunaszarin)  
Projetado para estudos e demonstrações de integração **React + Express + Drizzle ORM**.
