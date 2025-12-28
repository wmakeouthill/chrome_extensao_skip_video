/**
 * Background Service Worker - Auto Skip Video Extension
 * Gerencia estado inicial da extensão
 */

const STORAGE_KEY = 'autoSkipEnabled';
const ESTADO_PADRAO = true;

chrome.runtime.onInstalled.addListener(() => {
  try {
    chrome.storage.sync.set({ [STORAGE_KEY]: ESTADO_PADRAO });
  } catch (error) {
    console.error('[Auto Skip Video] Erro ao inicializar estado padrão:', error);
  }
});


