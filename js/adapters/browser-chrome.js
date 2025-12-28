/**
 * Browser Adapter - Chrome/Chromium
 * Métodos específicos para navegadores baseados em Chromium
 */

function avancarYouTubeChrome() {
  // Chrome/Chromium: KeyboardEvent no elemento ativo funciona melhor
  const elementoAtivo = document.activeElement || document.body;
  const evento = new KeyboardEvent('keydown', {
    key: 'ArrowDown',
    code: 'ArrowDown',
    keyCode: 40,
    which: 40,
    bubbles: true,
    cancelable: true,
    view: window
  });
  elementoAtivo.dispatchEvent(evento);
  if (DEBUG) console.log('[Auto Skip Video] ArrowDown (Chrome/Chromium)');
}

