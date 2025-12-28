/**
 * Content Script - ULTRA LEVE
 * Zero polling, zero MutationObserver
 * Apenas escuta eventos nativos do DOM
 */

// ==================== INICIALIZAÇÃO ====================

function inicializar() {
  chrome.storage.sync.get([STORAGE_KEY], (result) => {
    autoSkipEnabled = result[STORAGE_KEY] !== false;
    if (autoSkipEnabled) {
      configurarEventos();
    }
  });
}

// ==================== EVENTOS REATIVOS ====================

function configurarEventos() {
  // Evento 'play' em qualquer vídeo da página (event delegation)
  document.addEventListener('play', (e) => {
    if (e.target.tagName === 'VIDEO' && autoSkipEnabled) {
      configurarVideo(e.target);
    }
  }, true); // capture phase para pegar antes de qualquer coisa

  // Capturar vídeo já existente na página
  const videoExistente = document.querySelector('video');
  if (videoExistente) {
    configurarVideo(videoExistente);
  }
}

// ==================== MENSAGENS DO POPUP ====================

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'toggleChanged') {
    autoSkipEnabled = message.enabled;
    if (!autoSkipEnabled) {
      limparVideo();
    } else {
      configurarEventos();
    }
  }
});

// ==================== INICIAR ====================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializar);
} else {
  inicializar();
}
