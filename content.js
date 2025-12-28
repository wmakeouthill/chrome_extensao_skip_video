/**
 * Content Script - Auto Skip Video Extension
 * Detecta quando vídeos terminam e avança automaticamente para o próximo
 */

// ==================== CONSTANTES ====================
const DELAY_MS = 300;
const OBSERVER_OPTIONS = { childList: true, subtree: true };
const STORAGE_KEY = 'autoSkipEnabled';
const DEBUG = true; // Ativar logs para debug

// Seletores comuns para botões "próximo"
const GENERIC_NEXT_SELECTORS = [
  'button[aria-label*="próximo" i]',
  'button[aria-label*="next" i]',
  'button[title*="próximo" i]',
  'button[title*="next" i]',
  '[data-testid*="next"]',
  '.next-button',
  '[class*="next"]'
];

// Seletores específicos por plataforma
const PLATFORM_SELECTORS = {
  youtube: [
    'button[aria-label*="Próximo" i]',
    'button[aria-label*="Next" i]',
    '[aria-label*="Próximo vídeo" i]',
    '[aria-label*="Next video" i]'
  ],
  tiktok: [
    '[data-e2e="arrow-right"]',
    'button[aria-label*="próximo" i]',
    'button[aria-label*="next" i]',
    '[class*="arrow-right"]'
  ],
  instagram: [
    'button[aria-label*="próximo" i]',
    'button[aria-label*="next" i]',
    '[class*="next"]'
  ]
};

// ==================== ESTADO GLOBAL ====================
let autoSkipEnabled = true;
let videoObserver = null;
let currentVideo = null;
let currentEndHandler = null;
let currentTimeUpdateHandler = null;
let isAvancando = false; // Flag para prevenir múltiplas execuções
let ultimoVideoId = null; // Rastrear qual vídeo já foi processado

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

// ==================== DETECÇÃO DE PLATAFORMA ====================
function detectarPlataforma() {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;

  if (hostname.includes('youtube.com') && (pathname.includes('/shorts') || pathname.includes('/watch'))) {
    return 'youtube';
  }
  if (hostname.includes('tiktok.com')) return 'tiktok';
  if (hostname.includes('instagram.com')) return 'instagram';
  if (hostname.includes('kwai.com')) return 'kwai';
  if (hostname.includes('pinterest.com')) return 'pinterest';
  if (hostname.includes('reddit.com')) return 'reddit';
  if (hostname.includes('x.com') || hostname.includes('twitter.com')) return 'twitter';
  if (hostname.includes('9gag.com')) return '9gag';
  if (hostname.includes('imgur.com')) return 'imgur';
  if (hostname.includes('twitch.tv')) return 'twitch';
  if (hostname.includes('tumblr.com')) return 'tumblr';
  if (hostname.includes('likee.video')) return 'likee';

  return 'generic';
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

// ==================== OBSERVADOR DE VÍDEO ====================
function inicializarObservadorVideo(endHandler) {
  limparRecursos();

  if (!document.body) {
    // Aguardar body estar disponível
    const bodyObserver = new MutationObserver(() => {
      if (document.body) {
        bodyObserver.disconnect();
        configurarObservadorVideo(endHandler);
      }
    });
    bodyObserver.observe(document.documentElement, OBSERVER_OPTIONS);
    return;
  }

  configurarObservadorVideo(endHandler);
}

function configurarObservadorVideo(endHandler) {
  const encontrarVideo = () => {
    const video = document.querySelector('video');
    if (!video) {
      if (DEBUG) console.log('[Auto Skip Video] Vídeo não encontrado ainda...');
      return;
    }
    
    if (video === currentVideo) return;

    removerListenerAnterior();
    currentVideo = video;
    currentEndHandler = endHandler;
    currentTimeUpdateHandler = criarTimeUpdateHandler(video, endHandler);
    
    // Configurações específicas por plataforma ao encontrar vídeo
    const plataforma = detectarPlataforma();
    configurarVideoPorPlataforma(video, plataforma);
    
    // Adicionar múltiplos listeners para garantir detecção
    video.addEventListener('ended', endHandler);
    video.addEventListener('timeupdate', currentTimeUpdateHandler);
    
    if (DEBUG) {
      console.log('[Auto Skip Video] Vídeo encontrado e monitorado:', {
        duration: video.duration,
        currentTime: video.currentTime,
        platform: plataforma,
        loop: video.loop
      });
    }
  };

  encontrarVideo();

  videoObserver = new MutationObserver(() => {
    encontrarVideo();
  });

  videoObserver.observe(document.body, OBSERVER_OPTIONS);
}

// Configurar vídeo de acordo com a plataforma
function configurarVideoPorPlataforma(video, plataforma) {
  try {
    switch (plataforma) {
      case 'youtube':
        // YouTube: sempre desativar loop
        video.loop = false;
        // Monitorar mudanças no atributo loop
        const loopObserver = new MutationObserver(() => {
          if (video.loop) {
            video.loop = false;
            if (DEBUG) console.log('[Auto Skip Video] Loop reativado pelo YouTube, desativando novamente');
          }
        });
        loopObserver.observe(video, { attributes: true, attributeFilter: ['loop'] });
        break;
        
      case 'tiktok':
        // TikTok: geralmente não tem loop, mas garantir
        video.loop = false;
        break;
        
      case 'instagram':
        // Instagram Reels: desativar loop
        video.loop = false;
        break;
        
      default:
        // Outras plataformas: desativar loop por padrão
        video.loop = false;
        break;
    }
  } catch (error) {
    if (DEBUG) console.error('[Auto Skip Video] Erro ao configurar vídeo:', error);
  }
}

// Função auxiliar para obter ID único do vídeo atual
function obterIdVideoAtual() {
  try {
    if (currentVideo) {
      // Tentar obter ID do vídeo de várias formas
      const src = currentVideo.src || currentVideo.currentSrc || '';
      const urlParams = new URLSearchParams(window.location.search);
      const videoId = urlParams.get('v') || 
                     window.location.pathname.split('/').pop() ||
                     src.split('/').pop() ||
                     Date.now().toString(); // Fallback: timestamp
      return videoId;
    }
  } catch (error) {
    if (DEBUG) console.error('[Auto Skip Video] Erro ao obter ID do vídeo:', error);
  }
  return Date.now().toString(); // Fallback
}

// Monitorar progresso do vídeo para detectar fim (backup do evento 'ended')
// IMPORTANTE: Este handler NÃO deve chamar endHandler se o evento 'ended' já foi disparado
function criarTimeUpdateHandler(video, endHandler) {
  let ultimoTempo = 0;
  let contadorLoop = 0;
  let jaAvancou = false;
  let tempoFimDetectado = false;
  let eventoEndedDisparado = false;
  
  // Listener para marcar quando evento 'ended' é disparado
  const endedListener = () => {
    eventoEndedDisparado = true;
    jaAvancou = true; // Marcar como já avançado para evitar duplicação
  };
  video.addEventListener('ended', endedListener, { once: true });
  
  return () => {
    const tempoAtual = video.currentTime;
    const duracao = video.duration;
    
    // Resetar flag se vídeo voltou a tocar (novo vídeo)
    if (tempoAtual < ultimoTempo && ultimoTempo > 0.5) {
      jaAvancou = false;
      tempoFimDetectado = false;
      eventoEndedDisparado = false;
    }
    
    // NÃO processar se já avançou ou se evento 'ended' foi disparado
    if (jaAvancou || eventoEndedDisparado || isAvancando) {
      return;
    }
    
    // Detectar se vídeo está no fim (últimos 0.3 segundos ou 99% completo)
    if (duracao > 0 && !tempoFimDetectado) {
      const percentual = (tempoAtual / duracao) * 100;
      const estaNoFim = tempoAtual >= duracao - 0.3 || percentual >= 99;
      
      if (estaNoFim && !jaAvancou) {
        tempoFimDetectado = true;
        if (DEBUG) console.log('[Auto Skip Video] Fim do vídeo detectado via timeupdate:', { 
          tempoAtual, 
          duracao, 
          percentual: percentual.toFixed(2) + '%' 
        });
        
        // Aguardar um pouco para ver se o evento 'ended' dispara
        // Se o evento 'ended' não disparar em 500ms, então forçar avanço
        setTimeout(() => {
          // Só forçar se evento 'ended' NÃO foi disparado e vídeo está parado
          if (!eventoEndedDisparado && !jaAvancou && (video.paused || video.currentTime < 0.5)) {
            if (DEBUG) console.log('[Auto Skip Video] Forçando avanço (timeupdate - evento ended não disparou)');
            jaAvancou = true;
            endHandler();
          }
        }, 500);
      }
    }
    
    // Detectar loop explícito (vídeo voltou ao início após estar no fim)
    // Mas só se evento 'ended' NÃO foi disparado
    if (!eventoEndedDisparado && tempoAtual < 0.5 && ultimoTempo > duracao * 0.9 && duracao > 0) {
      contadorLoop++;
      if (contadorLoop >= 1 && !jaAvancou) {
        if (DEBUG) console.log('[Auto Skip Video] Loop detectado após fim do vídeo, forçando avanço');
        jaAvancou = true;
        endHandler();
        contadorLoop = 0;
      }
    } else if (tempoAtual > ultimoTempo) {
      contadorLoop = 0;
    }
    
    ultimoTempo = tempoAtual;
  };
}

function removerListenerAnterior() {
  if (currentVideo) {
    if (currentEndHandler) {
      currentVideo.removeEventListener('ended', currentEndHandler);
    }
    if (currentTimeUpdateHandler) {
      currentVideo.removeEventListener('timeupdate', currentTimeUpdateHandler);
    }
  }
}

function limparRecursos() {
  removerListenerAnterior();
  
  if (videoObserver) {
    videoObserver.disconnect();
    videoObserver = null;
  }
  
  currentVideo = null;
  currentEndHandler = null;
  currentTimeUpdateHandler = null;
}

// ==================== HANDLERS DE FIM DE VÍDEO ====================
function obterEndHandler(plataforma) {
  const handlers = {
    youtube: criarHandlerYouTube,
    tiktok: criarHandlerTikTok,
    instagram: criarHandlerInstagram
  };

  const handlerFactory = handlers[plataforma] || criarHandlerGenerico;
  return handlerFactory();
}

function criarHandlerYouTube() {
  return () => {
    if (!autoSkipEnabled) {
      if (DEBUG) console.log('[Auto Skip Video] Extensão desativada');
      return;
    }

    // Prevenir múltiplas execuções
    if (isAvancando) {
      if (DEBUG) console.log('[Auto Skip Video] Já está avançando, ignorando chamada duplicada');
      return;
    }

    // Identificar vídeo atual para evitar processar o mesmo vídeo múltiplas vezes
    const videoId = obterIdVideoAtual();
    if (videoId && videoId === ultimoVideoId) {
      if (DEBUG) console.log('[Auto Skip Video] Vídeo já foi processado, ignorando');
      return;
    }

    isAvancando = true;
    ultimoVideoId = videoId;

    if (DEBUG) console.log('[Auto Skip Video] Vídeo terminou no YouTube Shorts, avançando...');

    // IMPORTANTE: Desativar loop antes de avançar
    desativarLoopYouTube();

    setTimeout(() => {
      try {
        // APENAS UM MÉTODO: Usar apenas o mais confiável (ArrowDown)
        // Não executar múltiplos métodos para evitar pular dois vídeos
        const evento = new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          code: 'ArrowDown',
          keyCode: 40,
          which: 40,
          bubbles: true,
          cancelable: true,
          view: window
        });
        
        // Disparar no elemento ativo ou no document
        const elementoAtivo = document.activeElement || document.body;
        elementoAtivo.dispatchEvent(evento);
        
        if (DEBUG) console.log('[Auto Skip Video] Tecla ArrowDown disparada (único método)');
        
        // Resetar flag após um tempo para permitir próximo avanço
        setTimeout(() => {
          isAvancando = false;
          // Resetar ID do vídeo após navegação para permitir processar próximo vídeo
          setTimeout(() => {
            ultimoVideoId = null;
          }, 1000);
        }, 500);
        
      } catch (error) {
        console.error('[Auto Skip Video] Erro ao avançar YouTube:', error);
        isAvancando = false;
      }
    }, DELAY_MS);
  };
}

// Desativar loop automático no YouTube
function desativarLoopYouTube() {
  try {
    if (currentVideo) {
      // Desativar loop no elemento de vídeo
      currentVideo.loop = false;
      
      if (DEBUG) console.log('[Auto Skip Video] Loop desativado no vídeo');
    }
    
    // Tentar encontrar e desativar controles de loop na UI do YouTube
    const botoesLoop = document.querySelectorAll('button[aria-label*="loop" i], button[aria-label*="repetir" i]');
    botoesLoop.forEach(botao => {
      const ariaLabel = botao.getAttribute('aria-label') || '';
      const isPressed = botao.getAttribute('aria-pressed') === 'true';
      
      // Se o botão de loop está ativado, clicar para desativar
      if (isPressed && (ariaLabel.toLowerCase().includes('loop') || ariaLabel.toLowerCase().includes('repetir'))) {
        botao.click();
        if (DEBUG) console.log('[Auto Skip Video] Botão de loop desativado na UI');
      }
    });
    
    // Tentar desativar via configurações do player do YouTube
    if (window.ytplayer && window.ytplayer.config) {
      if (window.ytplayer.config.args) {
        window.ytplayer.config.args.loop = 0;
        if (DEBUG) console.log('[Auto Skip Video] Loop desativado via ytplayer.config');
      }
    }
  } catch (error) {
    if (DEBUG) console.error('[Auto Skip Video] Erro ao desativar loop:', error);
  }
}

// Método específico para navegar no YouTube Shorts
function tentarNavegarProximoShort() {
  try {
    // Tentar encontrar o container de Shorts
    const shortsContainer = document.querySelector('ytd-shorts') || 
                           document.querySelector('[is="ytd-shorts"]') ||
                           document.querySelector('#shorts-player');
    
    if (shortsContainer) {
      // Tentar encontrar botão de próximo Short
      const botoes = shortsContainer.querySelectorAll('button, [role="button"]');
      for (const botao of botoes) {
        const ariaLabel = botao.getAttribute('aria-label') || '';
        const texto = botao.textContent || '';
        
        if (ariaLabel.toLowerCase().includes('next') || 
            ariaLabel.toLowerCase().includes('próximo') ||
            texto.toLowerCase().includes('next')) {
          botao.click();
          if (DEBUG) console.log('[Auto Skip Video] Botão de próximo Short encontrado e clicado');
          return;
        }
      }
    }
    
    // Tentar usar a API do YouTube se disponível
    if (window.ytInitialData || window.ytInitialPlayerResponse) {
      // Scroll para o próximo item na lista
      const proximoItem = document.querySelector('ytd-reel-item-renderer[is-active]')?.nextElementSibling;
      if (proximoItem) {
        proximoItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (DEBUG) console.log('[Auto Skip Video] Próximo item scrollado');
      }
    }
  } catch (error) {
    if (DEBUG) console.error('[Auto Skip Video] Erro ao tentar navegar próximo Short:', error);
  }
}

function criarHandlerTikTok() {
  return () => {
    if (!autoSkipEnabled) {
      if (DEBUG) console.log('[Auto Skip Video] Extensão desativada');
      return;
    }

    // Prevenir múltiplas execuções
    if (isAvancando) {
      if (DEBUG) console.log('[Auto Skip Video] Já está avançando, ignorando chamada duplicada');
      return;
    }

    const videoId = obterIdVideoAtual();
    if (videoId && videoId === ultimoVideoId) {
      if (DEBUG) console.log('[Auto Skip Video] Vídeo já foi processado, ignorando');
      return;
    }

    isAvancando = true;
    ultimoVideoId = videoId;

    if (DEBUG) console.log('[Auto Skip Video] Vídeo terminou no TikTok, avançando...');

    // Desativar loop no TikTok
    if (currentVideo) {
      currentVideo.loop = false;
    }

    setTimeout(() => {
      try {
        // APENAS UM MÉTODO: Scroll (método principal do TikTok)
        scrollParaBaixo();
        if (DEBUG) console.log('[Auto Skip Video] Scroll executado no TikTok (único método)');
        
        setTimeout(() => {
          isAvancando = false;
          setTimeout(() => {
            ultimoVideoId = null;
          }, 1000);
        }, 500);
      } catch (error) {
        console.error('[Auto Skip Video] Erro ao avançar TikTok:', error);
        isAvancando = false;
      }
    }, DELAY_MS);
  };
}

function criarHandlerInstagram() {
  return () => {
    if (!autoSkipEnabled) {
      if (DEBUG) console.log('[Auto Skip Video] Extensão desativada');
      return;
    }

    // Prevenir múltiplas execuções
    if (isAvancando) {
      if (DEBUG) console.log('[Auto Skip Video] Já está avançando, ignorando chamada duplicada');
      return;
    }

    const videoId = obterIdVideoAtual();
    if (videoId && videoId === ultimoVideoId) {
      if (DEBUG) console.log('[Auto Skip Video] Vídeo já foi processado, ignorando');
      return;
    }

    isAvancando = true;
    ultimoVideoId = videoId;

    if (DEBUG) console.log('[Auto Skip Video] Vídeo terminou no Instagram Reels, avançando...');

    // Desativar loop no Instagram
    if (currentVideo) {
      currentVideo.loop = false;
    }

    setTimeout(() => {
      try {
        // APENAS UM MÉTODO: Scroll (método principal do Instagram)
        scrollParaBaixo();
        if (DEBUG) console.log('[Auto Skip Video] Scroll executado no Instagram (único método)');
        
        setTimeout(() => {
          isAvancando = false;
          setTimeout(() => {
            ultimoVideoId = null;
          }, 1000);
        }, 500);
      } catch (error) {
        console.error('[Auto Skip Video] Erro ao avançar Instagram:', error);
        isAvancando = false;
      }
    }, DELAY_MS);
  };
}

function criarHandlerGenerico() {
  return () => {
    if (!autoSkipEnabled) {
      if (DEBUG) console.log('[Auto Skip Video] Extensão desativada');
      return;
    }

    // Prevenir múltiplas execuções
    if (isAvancando) {
      if (DEBUG) console.log('[Auto Skip Video] Já está avançando, ignorando chamada duplicada');
      return;
    }

    const videoId = obterIdVideoAtual();
    if (videoId && videoId === ultimoVideoId) {
      if (DEBUG) console.log('[Auto Skip Video] Vídeo já foi processado, ignorando');
      return;
    }

    isAvancando = true;
    ultimoVideoId = videoId;

    if (DEBUG) console.log('[Auto Skip Video] Vídeo terminou, avançando (método genérico)...');

    // Desativar loop em todas as plataformas
    if (currentVideo) {
      currentVideo.loop = false;
    }

    setTimeout(() => {
      try {
        // APENAS UM MÉTODO: Tentar botão primeiro, depois scroll
        const clicou = clicarBotaoProximo(GENERIC_NEXT_SELECTORS);
        if (!clicou) {
          scrollParaBaixo();
          if (DEBUG) console.log('[Auto Skip Video] Scroll executado (genérico - fallback)');
        } else {
          if (DEBUG) console.log('[Auto Skip Video] Botão próximo clicado (genérico)');
        }
        
        setTimeout(() => {
          isAvancando = false;
          setTimeout(() => {
            ultimoVideoId = null;
          }, 1000);
        }, 500);
      } catch (error) {
        console.error('[Auto Skip Video] Erro ao avançar vídeo:', error);
        isAvancando = false;
      }
    }, DELAY_MS);
  };
}

// ==================== MÉTODOS DE NAVEGAÇÃO ====================
function simularTeclaSetaBaixo() {
  const event = new KeyboardEvent('keydown', {
    key: 'ArrowDown',
    code: 'ArrowDown',
    keyCode: 40,
    which: 40,
    bubbles: true,
    cancelable: true
  });
  document.dispatchEvent(event);
}

function scrollParaBaixo() {
  window.scrollBy({
    top: window.innerHeight,
    behavior: 'smooth'
  });
}

function clicarBotaoProximo(selectors) {
  for (const selector of selectors) {
    const botao = document.querySelector(selector);
    if (botao && estaVisivel(botao)) {
      botao.click();
      return true;
    }
  }
  return false;
}

function estaVisivel(elemento) {
  return elemento.offsetParent !== null;
}
