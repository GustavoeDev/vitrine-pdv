# VitrinePDV

Vitrine digital para comércios locais. O app conecta quem está na região a lojas próximas - com mapa, categorias, promoções, favoritos e avaliações - e dá ao lojista um painel para cuidar do estabelecimento no celular.

---

## O que o app faz

**Para quem compra / visita**
- Encontra lojas por busca, categoria ou mapa
- Vê produtos, promoções e avalia loja
- Favorita lojas e recebe avisos quando quiser
- Pode cadastrar o próprio negócio pelo app

**Para o lojista**
- Gerencia produtos e promoções
- Acompanha visualizações, favoritos e avaliações
- Mantém dados da loja (fotos, horário, contato)

**Para quem administra**
- Aprova ou recusa novos cadastros
- Ativa e desativa lojas quando precisar

---

## Stack

| Camada | Tecnologias |
|--------|-------------|
| App | Expo 54, React Native |
| API | Django Rest Framework |
| Infra | PostgreSQL, Docker, Nginx, AWS (EC2, RDS, S3) |

---

## Estrutura

```
vitrine-pdv/
├── .github/    # CI/CD do backend
├── frontend/   # App mobile
└── backend/    # API + Docker + Nginx
```

---

## Como rodar localmente

### Backend

```bash
cd backend
cp .env.example .env
docker compose up -d db
uv sync
uv run python manage.py migrate
uv run uvicorn core.asgi:application --host 0.0.0.0 --port 8000 --reload
```

Ou tudo via Docker: `docker compose up --build` (API em http://localhost:8000).

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npx expo start
```

No `.env`, use o IP da sua máquina na rede (não `localhost` no celular):

```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:8000/api/v1
```

Para gerar o APK de demonstração (EAS Build), veja o guia em [`frontend/README.md`](frontend/README.md).

---

## Deploy

O backend sobe na AWS com Docker + Nginx. Push em `master` dispara build da imagem e deploy na EC2. Em `develop`, o pipeline roda os testes.

Secrets do GitHub configurados (`DOCKERHUB_*`, `EC2_*`) e o `.env` na máquina de produção com base em [`backend/.env.production.example`](backend/.env.production.example).

---

## Perfis no app

| Quem | Como entra |
|------|------------|
| Consumidor | Conta comum |
| Lojista | Conta com loja aprovada |
| Admin | Usuário staff |

---

## Licença

Projeto privado. Todos os direitos reservados.
