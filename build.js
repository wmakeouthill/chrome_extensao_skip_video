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
  const arquivosParaZipar = ARQUIVOS_INCLUIR.join(' ');
  
  try {
    // Detectar sistema operacional
    const isWindows = process.platform === 'win32';
    
    if (isWindows) {
      // Windows: usar PowerShell Compress-Archive
      const arquivosArray = ARQUIVOS_INCLUIR.map(a => `'${a}'`).join(',');
      const comando = `powershell -Command "$files = @(${arquivosArray}); Compress-Archive -Path $files -DestinationPath '${nomeArquivo}' -Force"`;
      execSync(comando, { stdio: 'inherit' });
    } else {
      // Linux/Mac: usar zip
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
