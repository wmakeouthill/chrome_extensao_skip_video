# Auto Skip Video - Extensão Chrome

Extensão do Chrome que pula automaticamente para o próximo vídeo quando o atual termina em plataformas de vídeos curtos (Shorts, Reels, TikTok, etc.), evitando loops e proporcionando uma experiência de navegação contínua.

## 🎯 Funcionalidades

- ✅ **Liga/Desliga com toggle simples** - Controle total via popup
- ✅ **Ativação automática** - Funciona automaticamente quando ativado, sem necessidade de interação
- ✅ **Múltiplas plataformas** - Suporta 13+ plataformas diferentes
- ✅ **Detecção inteligente** - Identifica automaticamente a plataforma e aplica o método apropriado
- ✅ **Prevenção de loops** - Desativa loops automáticos para garantir avanço
- ✅ **Proteção contra duplicação** - Sistema de flags previne múltiplos avanços simultâneos
- ✅ **Persistência de estado** - Mantém preferência ativada/desativada entre sessões

## 🌐 Plataformas Suportadas

A extensão funciona nas seguintes plataformas:

- **YouTube Shorts** - Navegação via tecla ArrowDown
- **TikTok** - Scroll automático
- **Instagram Reels** - Scroll automático
- **Kwai** - Método genérico (botões + scroll)
- **Pinterest Watch** - Método genérico
- **Reddit** - Método genérico
- **X/Twitter** - Método genérico
- **9GAG** - Método genérico
- **Imgur** - Método genérico
- **Twitch Clips** - Método genérico
- **Tumblr** - Método genérico
- **Likee** - Método genérico

## 📦 Instalação

### Opção 1: Modo Desenvolvedor (Desenvolvimento/Teste)

1. Abra o Chrome e vá para `chrome://extensions/`
2. Ative o **"Modo do desenvolvedor"** no canto superior direito
3. Clique em **"Carregar sem compactação"**
4. Selecione a pasta raiz do projeto (`chrome_extensao_skip_video`)
5. A extensão estará instalada e ativa!

### Opção 2: Build para Publicação

Para gerar o arquivo `.zip` pronto para publicação na Chrome Web Store:

```bash
npm run build
# ou
node build.js
```

Isso criará o arquivo `auto-skip-video.zip` com todos os arquivos necessários.

## 🚀 Como Usar

1. **Instalar a extensão** (seguindo os passos acima)
2. **Navegar para uma plataforma suportada** (ex: YouTube Shorts, TikTok)
3. **Clique no ícone da extensão** na barra de ferramentas do Chrome
4. **Ative o toggle** para ligar a funcionalidade
5. **Aproveite!** A extensão automaticamente pulará para o próximo vídeo quando o atual terminar

### Status da Extensão

- **Ativado** (toggle ligado): A extensão funciona automaticamente
- **Desativado** (toggle desligado): A extensão não interfere na navegação

## 🔧 Como Funciona

### Arquitetura

A extensão utiliza **Manifest V3** e é composta por três componentes principais:

1. **Background Service Worker** (`background.js`)
   - Inicializa estado padrão (ativado por padrão)
   - Gerencia configurações globais

2. **Content Script** (`content.js`)
   - Script principal que roda nas páginas das plataformas
   - Detecta quando vídeos terminam
   - Executa ações para avançar para o próximo vídeo

3. **Popup Interface** (`popup.html/js/css`)
   - Interface do usuário para ativar/desativar
   - Sincroniza estado com content script

### Fluxo de Funcionamento

```text
1. Extensão instalada → Background.js inicializa estado (ativado por padrão)
   ↓
2. Usuário navega para plataforma suportada → Content.js é injetado
   ↓
3. Content.js detecta plataforma → Seleciona handler apropriado
   ↓
4. Content.js encontra elemento <video> → Configura listeners
   ↓
5. Vídeo termina (evento 'ended' ou detecção via 'timeupdate')
   ↓
6. Handler específico executa ação:
   - YouTube: Simula tecla ArrowDown
   - TikTok/Instagram: Scroll automático
   - Outras: Busca botões ou faz scroll
   ↓
7. Próximo vídeo carrega → Processo se repete
```

### Detecção de Fim de Vídeo

A extensão utiliza múltiplas estratégias para detectar quando um vídeo termina:

1. **Evento 'ended'** - Evento nativo do elemento `<video>`
2. **Monitoramento 'timeupdate'** - Verifica quando vídeo está próximo do fim (últimos 0.3s ou 99%)
3. **Detecção de loop** - Identifica quando vídeo volta ao início após terminar

### Prevenção de Problemas

- **Flag `isAvancando`**: Previne múltiplas execuções simultâneas
- **Rastreamento de ID do vídeo**: Evita processar o mesmo vídeo múltiplas vezes
- **Desativação de loop**: Garante que vídeos não fiquem em loop antes de avançar
- **Delay configurável**: 300ms de delay para garantir que ações sejam processadas

### Configurações por Plataforma

#### YouTube Shorts

- Método: Simulação de tecla `ArrowDown`
- Desativa loop automaticamente
- Monitora mudanças no atributo `loop`

#### TikTok

- Método: Scroll automático (`window.scrollBy`)
- Desativa loop no elemento de vídeo

#### Instagram Reels

- Método: Scroll automático
- Desativa loop no elemento de vídeo

#### Outras Plataformas (Genérico)

- Tenta clicar em botões "próximo" primeiro
- Se não encontrar, faz scroll automático
- Seletores genéricos para detectar botões

## 📁 Estrutura do Projeto

```text
chrome_extensao_skip_video/
├── manifest.json          # Configuração da extensão (Manifest V3)
├── popup.html             # Interface do popup (HTML)
├── popup.css              # Estilos do popup
├── popup.js               # Lógica do popup (controle on/off)
├── content.js             # Script principal (detecção e navegação)
├── background.js          # Service worker (inicialização)
├── build.js               # Script de build (gera .zip)
├── package.json           # Configuração npm
├── icons/                 # Ícones da extensão
│   ├── logo-16.png
│   ├── logo-48.png
│   ├── logo-128.png
│   └── icon.svg
├── docswesley/            # Documentação adicional
│   ├── README.md
│   ├── QUICK-START.md
│   ├── INSTALACAO.md
│   └── ...
└── README.md              # Este arquivo
```

## ⚙️ Configurações Técnicas

### Constantes Importantes

- `DELAY_MS`: 300ms - Delay antes de executar ação de avanço
- `DEBUG`: true - Ativa logs no console (útil para desenvolvimento)
- `STORAGE_KEY`: 'autoSkipEnabled' - Chave para armazenamento do estado
- `ESTADO_PADRAO`: true - Estado inicial (ativado por padrão)

### Permissões

A extensão requer:

- `storage`: Para salvar preferências do usuário
- `activeTab`: Para interagir com a aba ativa
- `host_permissions`: Para injetar content scripts nas plataformas suportadas

## 🐛 Solução de Problemas

### A extensão não está funcionando

1. **Verifique se está ativada**
   - Clique no ícone da extensão
   - Certifique-se que o toggle está ligado

2. **Verifique se está em uma plataforma suportada**
   - Confira a lista de plataformas acima
   - A URL deve corresponder a uma das plataformas

3. **Abra o Console do Desenvolvedor**
   - Pressione `F12`
   - Vá para a aba "Console"
   - Procure por mensagens que começam com `[Auto Skip Video]`
   - Se `DEBUG = true`, você verá logs detalhados

4. **Recarregue a página**
   - Às vezes é necessário recarregar após instalar/ativar

5. **Verifique se há erros**
   - Procure por erros em vermelho no console
   - Algumas plataformas podem ter mudado sua estrutura

### A extensão pula múltiplos vídeos

- Isso é causado por múltiplas execuções simultâneas
- O código já possui proteções, mas se persistir:
  - Aumente o valor de `DELAY_MS` em `content.js`
  - Verifique se a flag `isAvancando` está funcionando corretamente

### Vídeo não avança

1. **Verifique se o vídeo realmente terminou**
   - Alguns vídeos podem ter anúncios no final
   - A extensão só avança quando o vídeo principal termina

2. **Plataforma pode ter mudado**
   - Plataformas atualizam frequentemente
   - Pode ser necessário atualizar seletores CSS em `content.js`

3. **Teste com DEBUG = true**
   - Ative logs detalhados para ver o que está acontecendo

## 🔨 Desenvolvimento

### Modificando o Código

1. **Edite os arquivos necessários**
2. **Recarregue a extensão**
   - Vá em `chrome://extensions/`
   - Clique no ícone de recarregar na extensão
3. **Teste na plataforma desejada**
4. **Verifique o console** (F12) para logs de debug

### Adicionando Nova Plataforma

1. Adicione a URL em `host_permissions` e `content_scripts.matches` no `manifest.json`
2. Adicione detecção em `detectarPlataforma()` em `content.js`
3. Crie um handler específico em `obterEndHandler()` ou use o genérico
4. Configure seletores específicos em `PLATFORM_SELECTORS` se necessário

### Build

```bash
# Criar arquivo .zip para publicação
npm run build

# O arquivo auto-skip-video.zip será criado na raiz do projeto
```

O script `build.js`:

- Verifica se todos os arquivos necessários existem
- Cria um arquivo `.zip` com os arquivos da extensão
- Funciona em Windows (PowerShell) e Linux/Mac (zip)

## 📄 Licença

MIT License - Livre para uso pessoal e comercial.

## 🤝 Contribuindo

Contribuições são bem-vindas! Se encontrar bugs ou tiver sugestões:

1. Teste a extensão em diferentes plataformas
2. Documente o problema ou melhoria
3. Proponha uma solução

## ⚠️ Avisos

- Esta extensão é para uso pessoal e educacional
- Plataformas podem atualizar e quebrar a funcionalidade
- A extensão não coleta dados pessoais
- Use com responsabilidade e respeite os termos de serviço das plataformas

## 📚 Documentação Adicional

Para mais detalhes, consulte os arquivos na pasta `docswesley/`:

- `QUICK-START.md` - Guia rápido
- `INSTALACAO.md` - Instruções detalhadas
- `PLATAFORMAS.md` - Informações sobre plataformas
- `PUBLICACAO.md` - Guia para publicar na Chrome Web Store
