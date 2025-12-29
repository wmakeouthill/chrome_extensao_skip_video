# Auto Skip Video - Website

Website estático Angular 20+ Zoneless para a extensão Auto Skip Video, hospedado no GitHub Pages.

## 🎯 Estrutura das Páginas

- **Página Inicial** (`/`) - Apresentação da extensão, funcionalidades e plataformas suportadas
- **Sobre** (`/sobre`) - Informações detalhadas sobre como a extensão funciona
- **Política de Privacidade** (`/privacidade`) - Política de privacidade completa

## 🚀 Tecnologias

- **Angular 20+** (Zoneless, Standalone)
- **TypeScript 5.8+** (Strict mode)
- **Signals** para estado reativo
- **Control Flow Moderno** (`@if`, `@for`, `@switch`, `@defer`)
- **ChangeDetectionStrategy.OnPush** em todos os componentes

## 📋 Pré-requisitos

- Node.js 22 LTS
- npm ou yarn

## 🔧 Desenvolvimento

### Instalação

```bash
cd website
npm install
```

O favicon será gerado automaticamente durante o `npm install` (script `postinstall`).

### Executar localmente

```bash
npm start
```

Acesse `http://localhost:4200`

### Build para produção

```bash
npm run build:gh
```

O build será gerado em `dist/browser/`

## 📦 Deploy no GitHub Pages

### Deploy Automático (Recomendado)

O projeto já está configurado com GitHub Actions (`.github/workflows/deploy.yml`).

Basta fazer push para a branch `main`:

```bash
git add .
git commit -m "Deploy para GitHub Pages"
git push origin main
```

O workflow irá automaticamente:
1. Instalar dependências
2. Fazer build da aplicação
3. Fazer deploy para GitHub Pages

### Configuração Inicial no GitHub

1. Vá em **Settings** → **Pages** no seu repositório
2. Em **Source**, selecione **GitHub Actions**
3. Salve as configurações

### Ajustar Base Href

O base-href está configurado para `/chrome_extensao_skip_video/`.

Se o nome do seu repositório for diferente, ajuste no `package.json`:

```json
"build:gh": "ng build --configuration production --base-href /SEU_REPOSITORIO/"
```

### URL do Site

Após o deploy, o site estará disponível em:
- `https://SEU_USUARIO.github.io/chrome_extensao_skip_video/`

## 📝 Scripts Disponíveis

- `npm start` - Executar em modo desenvolvimento
- `npm run build:gh` - Build para GitHub Pages
- `npm run build` - Build de produção
- `npm run watch` - Build em modo watch
- `npm run favicon` - Gerar favicon do PNG

## 🎨 Arquitetura

### Componentes Standalone

Todos os componentes seguem o padrão standalone do Angular 20+:

```typescript
@Component({
  selector: 'app-exemplo',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './exemplo.component.html',
  styleUrl: './exemplo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### Signals para Estado

Estado reativo usando Signals:

```typescript
readonly dados = signal([]);
readonly carregando = signal(false);
readonly total = computed(() => this.dados().length);
```

### Zoneless

- `provideExperimentalZonelessChangeDetection()` configurado no `main.ts`
- `zone.js` removido dos polyfills
- Signals para reatividade automática

## 🔒 Segurança

- CSP (Content Security Policy) - configurável
- XSS prevention via sanitização automática do Angular
- HTTPS obrigatório em produção
- Source maps desabilitados em produção

## 📚 Documentação Adicional

Consulte `DEPLOY.md` para instruções detalhadas de deploy.

## ✅ Checklist de Qualidade

- ✅ Standalone components
- ✅ ChangeDetectionStrategy.OnPush
- ✅ Signals para estado
- ✅ Control Flow Moderno (`@if`, `@for`)
- ✅ Zoneless configurado
- ✅ TypeScript Strict mode
- ✅ Código limpo e organizado
- ✅ Responsivo e moderno

