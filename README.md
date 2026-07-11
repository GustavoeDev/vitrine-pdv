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
├── backend/
│   ├── Dockerfile              # Imagem da API
│   ├── docker-compose.yml      # Dev: db + api
│   ├── docker-compose.prod.yml # Produção: api + nginx
│   ├── nginx/nginx.conf        # Reverse proxy + WebSocket
│   ├── scripts/entrypoint.sh   # migrate + collectstatic + uvicorn
│   └── core/settings/          # base, local, production
└── frontend/
```

---

## Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose
- [uv](https://docs.astral.sh/uv/) (gerenciador Python do backend)
- [Node.js](https://nodejs.org/) 20+ e npm
- [Expo Go](https://expo.dev/go) no dispositivo (opcional, para testes mobile)

---

## Configuração e execução

### Ambientes do backend

O Django usa `DJANGO_ENV` para escolher as configurações:

| `DJANGO_ENV` | Módulo | Uso |
|--------------|--------|-----|
| `local` (padrão) | `core.settings.local` | Desenvolvimento |
| `production` | `core.settings.production` | Deploy (S3, HTTPS, CORS restrito) |

### Opção A — Desenvolvimento local (uvicorn)

```bash
cd backend
cp .env.example .env
docker compose up -d db
uv sync
uv run python manage.py migrate
uv run uvicorn core.asgi:application --host 0.0.0.0 --port 8000 --reload
```

### Opção B — Desenvolvimento com Docker (API + banco)

```bash
cd backend
cp .env.example .env
docker compose up --build
```

API em http://localhost:8000

### Opção C — Stack prod-like local (Nginx + API + banco)

Simula produção com Nginx na frente da API (porta 8080):

```bash
cd backend
cp .env.production.example .env
# Ajuste SECRET_KEY se necessário; USE_S3=false mantém mídia em disco
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

API em http://localhost:8080 (WebSocket: `ws://localhost:8080/ws/notifications/`)

### Deploy AWS

Na EC2, use [`backend/docker-compose.prod.yml`](backend/docker-compose.prod.yml) com `.env` apontando para o RDS e `USE_S3=true`. Ver [`backend/.env.production.example`](backend/.env.production.example).

### CI/CD (GitHub Actions)

Pipeline em [`.github/workflows/backend.yml`](.github/workflows/backend.yml):

1. **PR / push** → `pytest` com Postgres
2. **push na `main`** → build da imagem → push Docker Hub → deploy SSH na EC2

Configure em **GitHub → Settings → Secrets and variables → Actions**:

| Secret | Descrição |
|--------|-----------|
| `DOCKERHUB_USERNAME` | Usuário Docker Hub |
| `DOCKERHUB_TOKEN` | Access token do Docker Hub |
| `EC2_HOST` | IP elástico ou domínio da EC2 |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | Conteúdo completo do arquivo `.pem` |

Na EC2, o `.env` deve incluir `DOCKER_IMAGE=seu-usuario/vitrine-pdv-api:latest` (mesmo nome usado no workflow).

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
| `DJANGO_ENV` | `local` ou `production` |
| `SECRET_KEY` | Chave Django (obrigatória em produção) |
| `DB_NAME` | Nome do banco PostgreSQL |
| `DB_USER` | Usuário do banco |
| `DB_PASSWORD` | Senha do banco |
| `DB_HOST` | Host do banco (`localhost`, `db` no Docker, endpoint RDS na AWS) |
| `DB_PORT` | Porta do banco (padrão: `5432`) |
| `DEBUG` | Modo debug (`True` em desenvolvimento) |
| `ALLOWED_HOSTS` | Hosts permitidos em produção (lista separada por vírgula) |
| `CORS_ALLOWED_ORIGINS` | Origens CORS em produção |
| `ENABLE_API_DOCS` | Exibir Swagger/ReDoc (`true` no dev, `false` em produção) |
| `USE_S3` | `true` para mídia no S3 (produção AWS) |
| `AWS_STORAGE_BUCKET_NAME` | Bucket S3 de mídia |
| `AWS_S3_REGION_NAME` | Região AWS (ex.: `sa-east-1`) |
| `HTTP_PORT` | Porta do Nginx no compose prod (padrão: `8080`) |
| `DOCKER_IMAGE` | Imagem Docker para deploy (ex.: `usuario/vitrine-pdv-api:latest`) |

Modelo completo de produção: [`backend/.env.production.example`](backend/.env.production.example)

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
