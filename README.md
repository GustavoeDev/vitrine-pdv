# VitrinePDV

Plataforma de vitrine digital para comércios locais. Conecta consumidores a lojas da região com descoberta por categoria e localização, promoções, favoritos, avaliações e notificações em tempo real.

O projeto é um **monorepo** com backend REST/ASGI (Django) e aplicativo mobile (Expo/React Native).

---

## Funcionalidades

### Consumidor
- Descoberta de lojas por categoria, busca e mapa
- Visualização de produtos e promoções
- Favoritos com controle de notificações por loja
- Avaliações de estabelecimentos
- Inbox de notificações com atualização em tempo real (WebSocket)

### Lojista
- Cadastro e gestão do estabelecimento
- Catálogo de produtos
- Promoções do dia e descontos em produtos
- Estatísticas de desempenho (visualizações, favoritos, avaliações)
- Notificações de engajamento (ex.: nova avaliação)

### Administração
- Moderação de cadastros de lojas (aprovar/rejeitar)
- Painel de resumo e gestão de estabelecimentos

---

## Stack tecnológica

| Camada | Tecnologias |
|--------|-------------|
| **Backend** | Python 3.14, Django 6, Django REST Framework, SimpleJWT, Channels, Uvicorn |
| **Banco** | PostgreSQL 16 |
| **Mobile** | Expo 54, React Native, Expo Router, TanStack Query, Zustand |
| **Docs API** | drf-spectacular (OpenAPI 3 + Swagger UI) |

---

## Estrutura do repositório

```
vitrine-pdv/
├── backend/          # API Django + WebSocket
│   ├── accounts/     # Autenticação e usuários
│   ├── stores/       # Lojas, categorias, busca, admin
│   ├── catalog/      # Produtos
│   ├── marketing/    # Promoções
│   ├── engagement/   # Favoritos, avaliações, notificações
│   └── core/         # Configuração, mídia, OpenAPI
└── frontend/         # App Expo (consumer, merchant, admin)
```

---

## Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose
- [uv](https://docs.astral.sh/uv/) (gerenciador Python do backend)
- [Node.js](https://nodejs.org/) 20+ e npm
- [Expo Go](https://expo.dev/go) no dispositivo (opcional, para testes mobile)

---

## Configuração e execução

### 1. Banco de dados

```bash
cd backend
cp .env.example .env
docker compose up -d db
```

### 2. Backend

```bash
cd backend
uv sync
uv run python manage.py migrate
uv run uvicorn core.asgi:application --host 0.0.0.0 --port 8000 --reload
```

O servidor ficará disponível em `http://0.0.0.0:8000`.

#### Documentação da API (Swagger)

Com o backend em execução:

| Recurso | URL |
|---------|-----|
| **Swagger UI** | http://localhost:8000/api/v1/docs/ |
| **ReDoc** | http://localhost:8000/api/v1/docs/redoc/ |
| **Schema OpenAPI (JSON)** | http://localhost:8000/api/v1/schema/ |

No Swagger, faça login em `POST /api/v1/auth/login/`, copie o `access` token e clique em **Authorize** (Bearer).

#### WebSocket de notificações

```
ws://<host>/ws/notifications/?token=<access_token>
```

O channel layer usa memória em processo (adequado para desenvolvimento e deploy com um worker).

#### Usuário administrador (opcional)

```bash
uv run python manage.py create_staff --email admin@example.com --password sua-senha
```

### 3. Frontend (Expo)

```bash
cd frontend
cp .env.example .env
npm install
npx expo start
```

Para testar no celular com Expo Go, use o IP da máquina na rede local:

```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:8000/api/v1
```

---

## Autenticação

A API utiliza **JWT** (Bearer token).

1. `POST /api/v1/auth/register/` - criar conta
2. `POST /api/v1/auth/login/` - obter `access` e `refresh`
3. Enviar `Authorization: Bearer <access>` nas requisições autenticadas
4. `POST /api/v1/auth/refresh/` - renovar o access token

---

## Testes

```bash
cd backend
uv run pytest
```

---

## Variáveis de ambiente

### Backend (`backend/.env`)

| Variável | Descrição |
|----------|-----------|
| `DB_NAME` | Nome do banco PostgreSQL |
| `DB_USER` | Usuário do banco |
| `DB_PASSWORD` | Senha do banco |
| `DB_HOST` | Host do banco (padrão: `localhost`) |
| `DB_PORT` | Porta do banco (padrão: `5432`) |
| `DEBUG` | Modo debug (`True` em desenvolvimento) |
| `ALLOWED_HOSTS` | Hosts permitidos em produção |

### Frontend (`frontend/.env`)

| Variável | Descrição |
|----------|-----------|
| `EXPO_PUBLIC_API_URL` | URL base da API (`http://host:8000/api/v1`) |

---

## Perfis de acesso no app

| Perfil | Rota no app | Requisito |
|--------|-------------|-----------|
| Consumidor | `(consumer)/` | Usuário autenticado |
| Lojista | `(merchant)/` | Usuário com loja vinculada |
| Admin | `(admin)/` | `is_staff=True` |

---

## Licença

Projeto privado. Todos os direitos reservados.
