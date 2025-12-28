/**
 * Script de Build - Auto Skip Video Extension
 * Gera arquivo .zip pronto para publicação na Chrome Web Store
 * Usa apenas módulos nativos do Node.js (sem dependências)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ARQUIVOS_INCLUIR = [
  'manifest.json',
  'popup.html',
  'popup.css',
  'popup.js',
  'content.js',
  'background.js',
  'js',
  'icons'
];

function verificarArquivos() {
  console.log('🔍 Verificando arquivos necessários...\n');
  
  const faltando = [];
  
  ARQUIVOS_INCLUIR.forEach(arquivo => {
    const caminhoCompleto = path.join(__dirname, arquivo);
    if (!fs.existsSync(caminhoCompleto)) {
      faltando.push(arquivo);
    }
  });

  // Verificar ícones específicos
  const icones = ['icons/logo-16.png', 'icons/logo-48.png', 'icons/logo-128.png'];
  icones.forEach(icone => {
    const caminhoCompleto = path.join(__dirname, icone);
    if (!fs.existsSync(caminhoCompleto)) {
      faltando.push(icone);
    }
  });

  if (faltando.length > 0) {
    console.error('❌ Arquivos faltando:');
    faltando.forEach(arquivo => console.error(`   - ${arquivo}`));
    console.error('\n⚠️  Crie os arquivos faltantes antes de continuar!');
    process.exit(1);
  }

  console.log('✅ Todos os arquivos necessários estão presentes!\n');
}

function criarZip() {
  console.log('📦 Criando arquivo .zip...\n');
  
  const nomeArquivo = 'auto-skip-video.zip';
  
  try {
    // Detectar sistema operacional
    const isWindows = process.platform === 'win32';
    
    if (isWindows) {
      // Windows: usar PowerShell Compress-Archive com recursão correta
      // Incluir arquivos e pastas específicos recursivamente
      const arquivosParaIncluir = [
        'manifest.json',
        'popup.html',
        'popup.css',
        'popup.js',
        'content.js',
        'background.js',
        'icons\\*',
        'js\\*',
        'js\\adapters\\*',
        'js\\handlers\\*',
        'js\\utils\\*'
      ];
      
      // Remover zip existente
      if (fs.existsSync(nomeArquivo)) {
        fs.unlinkSync(nomeArquivo);
      }
      
      // Criar lista de arquivos para incluir (usando Set para evitar duplicatas)
      const arquivosList = new Set();
      
      // Adicionar manifest.json primeiro
      if (fs.existsSync('manifest.json')) {
        arquivosList.add('manifest.json');
      }
      
      // Adicionar arquivos JS baseado no manifest.json (apenas os que são realmente usados)
      const manifestPath = path.join(__dirname, 'manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      // Arquivos JS do content_scripts
      if (manifest.content_scripts && manifest.content_scripts[0] && manifest.content_scripts[0].js) {
        manifest.content_scripts[0].js.forEach(jsFile => {
          const filePath = path.join(__dirname, jsFile);
          if (fs.existsSync(filePath)) {
            arquivosList.add(jsFile);
          } else {
            console.warn(`⚠️  Arquivo do manifest não encontrado: ${jsFile}`);
          }
        });
      }
      
      // Arquivos JS do background
      if (manifest.background && manifest.background.scripts) {
        manifest.background.scripts.forEach(jsFile => {
          const filePath = path.join(__dirname, jsFile);
          if (fs.existsSync(filePath)) {
            arquivosList.add(jsFile);
          } else {
            console.warn(`⚠️  Arquivo do manifest não encontrado: ${jsFile}`);
          }
        });
      }
      
      // Adicionar arquivos HTML/CSS do popup
      if (manifest.action && manifest.action.default_popup) {
        arquivosList.add(manifest.action.default_popup);
        // Adicionar CSS e JS relacionados ao popup
        ['popup.css', 'popup.js'].forEach(file => {
          if (fs.existsSync(file)) {
            arquivosList.add(file);
          }
        });
      }
      
      // Adicionar arquivos de ícones
      if (manifest.icons) {
        Object.values(manifest.icons).forEach(iconPath => {
          if (fs.existsSync(iconPath)) {
            arquivosList.add(iconPath);
          }
        });
      }
      if (manifest.action && manifest.action.default_icon) {
        Object.values(manifest.action.default_icon).forEach(iconPath => {
          if (fs.existsSync(iconPath)) {
            arquivosList.add(iconPath);
          }
        });
      }
      
      // Converter Set para Array
      const arquivosArray = Array.from(arquivosList);
      
      // Criar zip usando PowerShell
      const arquivosQuoted = arquivosArray.map(f => `'${f.replace(/'/g, "''")}'`).join(',');
      const comando = `powershell -Command "$files = @(${arquivosQuoted}); Compress-Archive -Path $files -DestinationPath '${nomeArquivo}' -Force"`;
      execSync(comando, { stdio: 'inherit' });
    } else {
      // Linux/Mac: usar zip
      const arquivosParaZipar = ARQUIVOS_INCLUIR.join(' ');
      const comando = `zip -r ${nomeArquivo} ${arquivosParaZipar} -x "*.md" "*.git*" ".DS_Store" "Thumbs.db" "build.js" "package.json" "node_modules/*"`;
      execSync(comando, { stdio: 'inherit' });
    }
    
    // Verificar se arquivo foi criado
    if (fs.existsSync(nomeArquivo)) {
      const stats = fs.statSync(nomeArquivo);
      const tamanhoMB = (stats.size / 1024 / 1024).toFixed(2);
      console.log(`\n✅ Arquivo criado: ${nomeArquivo}`);
      console.log(`📦 Tamanho: ${tamanhoMB} MB`);
      console.log(`📝 Total de bytes: ${stats.size}`);
      return true;
    } else {
      throw new Error('Arquivo .zip não foi criado');
    }
  } catch (error) {
    console.error('❌ Erro ao criar .zip:', error.message);
    console.error('\n💡 Dica: Tente criar manualmente usando build-manual.md');
    return false;
  }
}

// Executar
async function main() {
  try {
    verificarArquivos();
    criarZip();
    console.log('\n🎉 Build concluído com sucesso!');
    console.log('📦 O arquivo auto-skip-video.zip está pronto para publicação.');
  } catch (error) {
    console.error('❌ Erro ao criar arquivo:', error);
    process.exit(1);
  }
}

main();
