/**
 * Core - Código comum compartilhado
 * Constantes, estado global e funções utilitárias
 */

// ==================== CONSTANTES ====================
const DELAY_MS = 300;
const OBSERVER_OPTIONS = { childList: true, subtree: true };
const STORAGE_KEY = 'autoSkipEnabled';
const DEBUG = false;

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
let isAvancando = false;
let ultimoVideoId = null;
let loopObserver = null;
let currentPlayListener = null; // Listener de 'play' para desativar loop quando vídeo começa

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

// ==================== FUNÇÕES UTILITÁRIAS ====================
function obterIdVideoAtual() {
  try {
    if (currentVideo) {
      const src = currentVideo.src || currentVideo.currentSrc || '';
      const urlParams = new URLSearchParams(window.location.search);
      const videoId = urlParams.get('v') || 
                     window.location.pathname.split('/').pop() ||
                     src.split('/').pop() ||
                     Date.now().toString();
      return videoId;
    }
  } catch (error) {
    if (DEBUG) console.error('[Auto Skip Video] Erro ao obter ID do vídeo:', error);
  }
  return Date.now().toString();
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

function removerListenerAnterior() {
  if (currentVideo) {
    if (currentEndHandler) {
      currentVideo.removeEventListener('ended', currentEndHandler);
    }
    // REMOVIDO: timeupdate handler não é mais usado
    if (currentPlayListener) {
      currentVideo.removeEventListener('play', currentPlayListener);
      currentPlayListener = null;
    }
  }
}

function limparRecursos() {
  removerListenerAnterior();
  
  if (videoObserver) {
    videoObserver.disconnect();
    videoObserver = null;
  }
  
  if (loopObserver) {
    loopObserver.disconnect();
    loopObserver = null;
  }
  
  currentVideo = null;
  currentEndHandler = null;
}

