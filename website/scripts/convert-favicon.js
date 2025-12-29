/**
 * Script simples para converter PNG em ICO usando sharp
 * Para uso com GitHub Pages
 */

const fs = require('fs');
const path = require('path');

// Copiar o PNG como favicon (navegadores modernos aceitam PNG)
const sourcePng = path.join(__dirname, '../../icons/logo-128.png');
const destFavicon = path.join(__dirname, '../src/favicon.ico');

try {
  // Como o navegador moderno aceita PNG como favicon.ico, vamos copiar diretamente
  // Para uma conversão real de ICO, seria necessário uma biblioteca especializada
  // Mas para GitHub Pages, PNG funciona perfeitamente
  fs.copyFileSync(sourcePng, destFavicon);
  console.log('✅ Favicon copiado com sucesso de', sourcePng, 'para', destFavicon);
  console.log('ℹ️  Nota: Navegadores modernos aceitam PNG como favicon.ico');
} catch (error) {
  console.error('❌ Erro ao copiar favicon:', error.message);
  process.exit(1);
}

