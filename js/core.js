/**
 * Core - Configuração e estado global
 * ULTRA LEVE - Zero polling, zero observers
 */

const STORAGE_KEY = 'autoSkipEnabled';
const DELAY_MS = 300;

// Estado global mínimo
let autoSkipEnabled = true;
let currentVideo = null;
let currentEndHandler = null;
let isProcessing = false;

// ==================== FUNÇÕES UTILITÁRIAS ====================

function scrollParaBaixo() {
  window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
}

function limparVideo() {
  if (currentVideo && currentEndHandler) {
    currentVideo.removeEventListener('ended', currentEndHandler);
  }
  currentVideo = null;
  currentEndHandler = null;
  isProcessing = false;
}
