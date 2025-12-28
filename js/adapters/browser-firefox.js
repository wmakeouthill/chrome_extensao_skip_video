/**
 * Browser Adapter - Firefox
 * Métodos específicos para Firefox
 */

function avancarYouTubeFirefox() {
  // Firefox: KeyboardEvent no document funciona melhor, com keyup também
  const eventoKeydown = new KeyboardEvent('keydown', {
    key: 'ArrowDown',
    code: 'ArrowDown',
    keyCode: 40,
    which: 40,
    bubbles: true,
    cancelable: true,
    view: window
  });
  document.dispatchEvent(eventoKeydown);
  
  // Firefox precisa do keyup também
  setTimeout(() => {
    const eventoKeyup = new KeyboardEvent('keyup', {
      key: 'ArrowDown',
      code: 'ArrowDown',
      keyCode: 40,
      which: 40,
      bubbles: true,
      cancelable: true,
      view: window
    });
    document.dispatchEvent(eventoKeyup);
  }, 50);
  
  if (DEBUG) console.log('[Auto Skip Video] ArrowDown (Firefox)');
}

