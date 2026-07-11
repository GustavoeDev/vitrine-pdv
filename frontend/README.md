# Vitrine PDV Frontend

Aplicativo mobile **VitrinePDV** com [Expo 54](https://expo.dev) e [Expo Router](https://docs.expo.dev/router/introduction).

## Desenvolvimento local (Expo Go)

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie o ambiente e ajuste a URL da API:

   ```bash
   cp .env.example .env
   ```

   Em desenvolvimento, use o IP da sua máquina na rede local (não `localhost` no celular):

   ```env
   EXPO_PUBLIC_API_URL=http://192.168.x.x:8000/api/v1
   ```

3. Inicie o servidor:

   ```bash
   npx expo start
   ```

4. Abra no emulador, dispositivo com **Expo Go** ou navegador.

> **Expo Go ≠ APK standalone.** Módulos nativos (mapas, localização, câmera) e HTTP cleartext contra a EC2 só se comportam de forma confiável no build EAS.

---

## Build APK preview (demo — EAS)

Gera um **APK instalável** no Android, apontando para o backend na EC2 (HTTP), **sem Play Store** e no plano free do EAS.

### Pré-requisitos

- Backend no ar na EC2 (`curl http://SEU_IP/api/v1/health/` retorna OK)
- Security Group da EC2 com porta **80** aberta
- Conta gratuita em [expo.dev](https://expo.dev)

### 1. Configurar URL da API (variável de ambiente)

O IP da EC2 **não** fica no repositório. Use variáveis de ambiente do EAS, vinculadas ao perfil `preview` via `"environment": "preview"` em [`eas.json`](eas.json).

**Opção A — a partir do seu `.env` local (recomendado):**

```bash
# .env (não commitado — ver .env.example)
EXPO_PUBLIC_API_URL=http://SEU_IP/api/v1

eas env:push --environment preview --path .env
```

**Opção B — criar direto no Expo:**

```bash
eas env:create \
  --name EXPO_PUBLIC_API_URL \
  --value "http://SEU_IP/api/v1" \
  --environment preview \
  --visibility plaintext
```

Para conferir: `eas env:list --environment preview`.

O WebSocket de notificações deriva automaticamente dessa URL (`http` → `ws`).

> **Dev local vs build:** o `.env` local alimenta o `expo start`. O EAS Build roda na nuvem e usa as variáveis do ambiente `preview` no [expo.dev](https://expo.dev) — não lê seu `.env` automaticamente.

> Rebuild obrigatório se o IP mudar — a variável é embutida no binário no momento do build.

### 2. Conta Expo e EAS CLI (uma vez)

```bash
npm install -g eas-cli
cd frontend
eas login
```

### 3. Vincular projeto ao Expo (primeira vez)

```bash
eas build:configure
```

Isso adiciona `extra.eas.projectId` em `app.json`. Commit esse arquivo após o configure.

### 4. Gerar o APK preview

```bash
eas build --platform android --profile preview
```

- Perfil `preview`: `distribution: internal`, `buildType: apk`
- Na primeira vez, escolha **"Let EAS manage credentials"** (keystore na nuvem)
- Acompanhe em [expo.dev](https://expo.dev) → Projects → Builds

**Custo:** plano free — fila + cota mensal limitada (suficiente para demo).

### 5. Instalar no celular

1. Quando o build terminar, o dashboard Expo exibe **QR code** ou link do `.apk`
2. No Android: escaneie o QR ou baixe o APK e instale (permita "fontes desconhecidas" se solicitado)

### 6. Checklist de validação no APK

Teste estes fluxos contra a EC2 (não no Expo Go):

| Fluxo | O que verificar |
|-------|-----------------|
| Login / registro | `POST /api/v1/auth/login/` e refresh token |
| Listagem de lojas | API REST responde com dados |
| Upload de imagem | Envio para S3 via backend |
| Notificações | WebSocket em `ws://SEU_IP/ws/notifications/` |

Se algo falhar:

| Problema | Solução |
|----------|---------|
| Network request failed | `expo-build-properties` com `usesCleartextTraffic: true` + SG porta 80 |
| API não responde | Conferir `eas env:list --environment preview` e rebuild |
| WebSocket não conecta | Nginx com `/ws/` na EC2; testar `ws://IP/ws/notifications/` |
| Build falha | Rodar `npx expo-doctor` localmente antes do build |

---

## Identidade do app

| Campo | Valor |
|-------|-------|
| Nome | VitrinePDV |
| Slug | vitrine-pdv |
| Android package | `com.vitrinepdv.app` |
| Ícones / splash | [`assets/`](assets/) (gerados a partir do logo laranja) |

O `android.package` é **permanente** — não altere após publicar builds.

---

## Estrutura

Comece editando os arquivos em `app/`. Configuração Expo em [`app.json`](app.json), builds em [`eas.json`](eas.json).
