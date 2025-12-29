# Guia de Deploy para GitHub Pages

## Configuração Inicial

### 1. Habilitar GitHub Pages no Repositório

1. Vá em **Settings** → **Pages** no seu repositório GitHub
2. Em **Source**, selecione **GitHub Actions**
3. Salve as configurações

### 2. Deploy Automático (Recomendado)

O projeto já está configurado com GitHub Actions. Basta fazer push para a branch `main`:

```bash
git add .
git commit -m "Deploy para GitHub Pages"
git push origin main
```

O workflow `.github/workflows/deploy.yml` irá:
1. Instalar dependências
2. Fazer build da aplicação
3. Fazer deploy para a branch `gh-pages` automaticamente

### 3. Deploy Manual

Se preferir fazer deploy manual:

```bash
cd website
npm install
npm run build:gh

# O build estará em dist/browser/
# Faça push desta pasta para a branch gh-pages
```

### 4. Ajustar Base Href (se necessário)

O base-href está configurado para `/chrome_extensao_skip_video/`.

Se o nome do seu repositório for diferente, ajuste no `package.json`:

```json
"build:gh": "ng build --configuration production --base-href /SEU_REPOSITORIO/"
```

### 5. URL do Site

Após o deploy, o site estará disponível em:
- `https://SEU_USUARIO.github.io/chrome_extensao_skip_video/`

## Build Local

Para testar localmente:

```bash
cd website
npm install
npm start
```

Acesse `http://localhost:4200`

## Estrutura das Páginas

- `/` - Página inicial (Home)
- `/sobre` - Sobre a extensão
- `/privacidade` - Política de privacidade

## Notas

- O favicon é gerado automaticamente do `icons/logo-128.png` no script `postinstall`
- O projeto está configurado para Angular 20+ Zoneless
- Todos os componentes são standalone
- ChangeDetectionStrategy.OnPush em todos os componentes

