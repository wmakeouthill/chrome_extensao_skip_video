# 🚀 Guia Completo de Deploy para GitHub Pages

## 📋 Pré-requisitos

- Repositório GitHub criado
- Node.js 22 LTS instalado (para build local)
- Git configurado

## 🔧 Configuração Inicial (Uma vez apenas)

### Passo 1: Habilitar GitHub Pages no Repositório

1. Acesse seu repositório no GitHub
2. Vá em **Settings** → **Pages** (no menu lateral)
3. Em **Source**, selecione **GitHub Actions**
4. Clique em **Save**

> ⚠️ **Importante**: O workflow `.github/workflows/deploy.yml` já está configurado e será executado automaticamente após o primeiro push.

### Passo 2: Verificar Base Href

O `base-href` está configurado para `/chrome_extensao_skip_video/` no `package.json`.

**Se o nome do seu repositório for diferente**, ajuste:

```json
"build:gh": "ng build --configuration production --base-href /SEU_REPOSITORIO/"
```

**Exemplo**: Se seu repositório for `meu-projeto`, use:
```json
"build:gh": "ng build --configuration production --base-href /meu-projeto/"
```

## 🎯 Deploy Automático (Recomendado)

O projeto está configurado com **GitHub Actions** para deploy automático.

### Como Funciona

1. Faça push para a branch `main`:
```bash
git add .
git commit -m "Deploy para GitHub Pages"
git push origin main
```

2. O workflow `.github/workflows/deploy.yml` será executado automaticamente:
   - ✅ Instala Node.js 22 LTS
   - ✅ Instala dependências (`npm ci`)
   - ✅ Faz build da aplicação (`npm run build:gh`)
   - ✅ Faz deploy para GitHub Pages

3. **Acompanhe o progresso**:
   - Vá em **Actions** no seu repositório GitHub
   - Clique no workflow em execução
   - Aguarde a conclusão (geralmente 2-3 minutos)

4. **Após o deploy**, o site estará disponível em:
   - `https://SEU_USUARIO.github.io/chrome_extensao_skip_video/`

### Executar Deploy Manualmente

Você também pode executar o workflow manualmente:

1. Vá em **Actions** → **Deploy to GitHub Pages**
2. Clique em **Run workflow**
3. Selecione a branch `main`
4. Clique em **Run workflow**

## 🔨 Deploy Manual (Alternativa)

Se preferir fazer deploy manual sem GitHub Actions:

### Passo 1: Build Local

```bash
cd website
npm install
npm run build:gh
```

O build será gerado em `website/dist/browser/`

### Passo 2: Deploy via gh-pages (Recomendado)

Instale o pacote `gh-pages` globalmente:

```bash
npm install -g gh-pages
```

Depois, faça o deploy:

```bash
cd website
gh-pages -d dist/browser
```

### Passo 3: Deploy Manual via Git

```bash
# 1. Build (se ainda não fez)
cd website
npm run build:gh

# 2. Criar branch gh-pages (se não existir)
git checkout --orphan gh-pages
git rm -rf .

# 3. Copiar arquivos do build
cp -r dist/browser/* .

# 4. Commit e push
git add .
git commit -m "Deploy para GitHub Pages"
git push origin gh-pages --force

# 5. Voltar para main
git checkout main
```

> ⚠️ **Atenção**: O método manual requer configurar o GitHub Pages para usar a branch `gh-pages` como source.

## 🧪 Testar Build Localmente

Antes de fazer deploy, teste o build localmente:

```bash
cd website
npm install
npm run build:gh
```

Para testar o build de produção localmente, você pode usar um servidor HTTP simples:

```bash
# Opção 1: Usando npx serve
npx serve -s dist/browser -l 4000

# Opção 2: Usando Python
cd dist/browser
python -m http.server 4000

# Opção 3: Usando Node.js http-server
npx http-server dist/browser -p 4000
```

Acesse `http://localhost:4000` no navegador.

## 📁 Estrutura das Páginas

Após o deploy, as seguintes rotas estarão disponíveis:

- `/` - Página inicial (Home)
- `/sobre` - Sobre a extensão
- `/privacidade` - Política de privacidade

## 🔍 Verificar Deploy

### 1. Verificar Status do Workflow

- Vá em **Actions** no GitHub
- Verifique se o último workflow foi executado com sucesso (✓ verde)

### 2. Verificar Configuração do GitHub Pages

- Vá em **Settings** → **Pages**
- Verifique se está configurado como **GitHub Actions**
- A URL do site deve aparecer na parte superior

### 3. Testar o Site

- Acesse a URL: `https://SEU_USUARIO.github.io/chrome_extensao_skip_video/`
- Teste todas as rotas:
  - `/`
  - `/sobre`
  - `/privacidade`

## 🐛 Troubleshooting

### Problema: Workflow falha no build

**Solução**:
1. Verifique os logs em **Actions**
2. Certifique-se de que todas as dependências estão no `package.json`
3. Teste o build localmente: `cd website && npm run build:gh`

### Problema: Site não carrega (404)

**Solução**:
1. Verifique se o `base-href` está correto no `package.json`
2. O `base-href` deve corresponder ao nome do repositório
3. Aguarde alguns minutos após o deploy (pode levar até 10 minutos)

### Problema: Rotas não funcionam (404 em rotas internas)

**Solução**:
- O GitHub Pages não suporta SPA routing nativamente
- Você precisa configurar um arquivo `404.html` que redirecione para `index.html`
- Ou usar um domínio customizado com configuração adequada

### Problema: Assets não carregam

**Solução**:
1. Verifique se o `base-href` está correto
2. Certifique-se de que os assets estão em `src/assets/`
3. Verifique os caminhos no código (use caminhos relativos)

## 📝 Notas Importantes

- ✅ O favicon é gerado automaticamente do `icons/logo-128.png` no script `postinstall`
- ✅ O projeto está configurado para Angular 20+ Zoneless
- ✅ Todos os componentes são standalone
- ✅ ChangeDetectionStrategy.OnPush em todos os componentes
- ✅ O workflow só executa quando há mudanças em `website/` ou no próprio workflow
- ✅ O deploy automático acontece apenas na branch `main`

## 🔄 Atualizar o Site

Para atualizar o site, basta fazer push para `main`:

```bash
git add .
git commit -m "Atualizar website"
git push origin main
```

O workflow será executado automaticamente e o site será atualizado em alguns minutos.

## 📚 Recursos Adicionais

- [Documentação do GitHub Pages](https://docs.github.com/en/pages)
- [Documentação do Angular Deployment](https://angular.io/guide/deployment)
- [GitHub Actions para Pages](https://github.com/actions/deploy-pages)

