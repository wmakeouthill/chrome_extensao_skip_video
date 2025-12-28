/**
 * Script de Build - Auto Skip Video Extension
 * Gera arquivo .zip pronto para publicação
 * Preserva estrutura de pastas corretamente
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Arquivos e pastas para incluir
const INCLUIR = [
  'manifest.json',
  'popup.html',
  'popup.css',
  'popup.js',
  'content.js',
  'background.js',
  'js',      // pasta inteira
  'icons'    // pasta inteira
];

async function criarZip() {
  console.log('📦 Criando arquivo .zip...\n');

  const nomeArquivo = 'auto-skip-video.zip';

  // Remover zip existente
  if (fs.existsSync(nomeArquivo)) {
    fs.unlinkSync(nomeArquivo);
  }

  const output = fs.createWriteStream(nomeArquivo);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      const tamanhoKB = (archive.pointer() / 1024).toFixed(2);
      console.log(`\n✅ Arquivo criado: ${nomeArquivo}`);
      console.log(`📦 Tamanho: ${tamanhoKB} KB`);
      resolve(true);
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    // Adicionar cada arquivo/pasta
    INCLUIR.forEach(item => {
      const itemPath = path.join(__dirname, item);

      if (!fs.existsSync(itemPath)) {
        console.warn(`⚠️  Não encontrado: ${item}`);
        return;
      }

      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        // Adicionar pasta com estrutura preservada
        archive.directory(itemPath, item);
        console.log(`📁 Pasta: ${item}/`);
      } else {
        // Adicionar arquivo
        archive.file(itemPath, { name: item });
        console.log(`📄 Arquivo: ${item}`);
      }
    });

    archive.finalize();
  });
}

async function main() {
  try {
    // Verificar se archiver está instalado
    try {
      require.resolve('archiver');
    } catch (e) {
      console.log('📦 Instalando dependência archiver...');
      require('child_process').execSync('npm install archiver', { stdio: 'inherit' });
    }

    await criarZip();
    console.log('\n🎉 Build concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

main();
