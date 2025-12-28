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
      // Limpar intervalo de URL também
      if (urlObserverInterval) {
        clearInterval(urlObserverInterval);
        urlObserverInterval = null;
      }
      limparRecursos();
    }
  }
});

// Observar mudanças de URL (SPA navigation) - ULTRA Otimizado
let urlObserverInterval = null;
let navigationListener = null;

function configurarObserverURL() {
  // Limpar recursos anteriores
  if (urlObserverInterval) {
    clearInterval(urlObserverInterval);
    urlObserverInterval = null;
  }
  if (navigationListener && window.navigation) {
    window.navigation.removeEventListener('navigate', navigationListener);
    navigationListener = null;
  }

  let ultimaUrl = location.href;

  // Preferir Navigation API (zero polling, event-driven)
  if (typeof window.navigation !== 'undefined') {
    navigationListener = (event) => {
      if (autoSkipEnabled && event.destination.url !== ultimaUrl) {
        ultimaUrl = event.destination.url;
        inicializarAutoSkip();
      }
    };
    window.navigation.addEventListener('navigate', navigationListener);
    if (DEBUG) console.log('[Auto Skip Video] Usando Navigation API (zero polling)');
  } else {
    // Fallback: Polling a cada 3 segundos (suficiente para SPAs)
    urlObserverInterval = setInterval(() => {
      const url = location.href;
      if (url !== ultimaUrl) {
        ultimaUrl = url;
        if (autoSkipEnabled) {
          inicializarAutoSkip();
        }
      }
    }, 3000); // 3 segundos - mais leve
  }
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
