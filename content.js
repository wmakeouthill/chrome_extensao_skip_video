/**
 * Content Script - Orquestrador Principal
 * Coordena todos os módulos e gerencia o ciclo de vida
 */

// ==================== INICIALIZAÇÃO ====================
function inicializar() {
  chrome.storage.sync.get([STORAGE_KEY], (result) => {
    autoSkipEnabled = result[STORAGE_KEY] !== false;
    aguardarDOMPronto();
  });
}

function aguardarDOMPronto() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarAutoSkip);
  } else {
    inicializarAutoSkip();
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleChanged') {
    autoSkipEnabled = message.enabled;
    if (autoSkipEnabled) {
      aguardarDOMPronto();
    } else {
      limparRecursos();
    }
  }
});

// Observar mudanças de URL (SPA navigation)
function configurarObserverURL() {
  let ultimaUrl = location.href;
  
  const urlObserver = new MutationObserver(() => {
    const url = location.href;
    if (url !== ultimaUrl) {
      ultimaUrl = url;
      if (autoSkipEnabled) {
        setTimeout(inicializarAutoSkip, 100);
      }
    }
  });
  
  urlObserver.observe(document, { subtree: true, childList: true });
}

// Inicializar quando o script carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    configurarObserverURL();
    inicializar();
  });
} else {
  configurarObserverURL();
  inicializar();
}

// ==================== INICIALIZAÇÃO PRINCIPAL ====================
function inicializarAutoSkip() {
  if (!autoSkipEnabled) {
    if (DEBUG) console.log('[Auto Skip Video] Extensão desativada, não inicializando');
    return;
  }

  try {
    const plataforma = detectarPlataforma();
    if (DEBUG) console.log('[Auto Skip Video] Plataforma detectada:', plataforma);
    
    const endHandler = obterEndHandler(plataforma);
    inicializarObservadorVideo(endHandler);
    
    if (DEBUG) console.log('[Auto Skip Video] Inicialização concluída');
  } catch (error) {
    console.error('[Auto Skip Video] Erro ao inicializar:', error);
  }
}
