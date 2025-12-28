/**
 * Popup Script - Auto Skip Video Extension
 * Gerencia a interface de controle on/off
 */

const STORAGE_KEY = 'autoSkipEnabled';
const MENSAGENS = {
  ATIVADO: 'Ativado',
  DESATIVADO: 'Desativado'
};

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', inicializarPopup);

async function inicializarPopup() {
  try {
    const estado = await carregarEstado();
    const toggle = document.getElementById('toggleSwitch');
    const statusText = document.getElementById('statusText');

    toggle.checked = estado;
    statusText.textContent = estado ? MENSAGENS.ATIVADO : MENSAGENS.DESATIVADO;

    toggle.addEventListener('change', (event) => {
      const novoEstado = event.target.checked;
      atualizarEstado(novoEstado, statusText);
    });
  } catch (error) {
    console.error('[Auto Skip Video] Erro ao inicializar popup:', error);
  }
}

// ==================== GERENCIAMENTO DE ESTADO ====================
async function carregarEstado() {
  const result = await chrome.storage.sync.get([STORAGE_KEY]);
  return result[STORAGE_KEY] !== false; // padrão: true
}

async function atualizarEstado(novoEstado, elementoStatus) {
  try {
    await chrome.storage.sync.set({ [STORAGE_KEY]: novoEstado });
    elementoStatus.textContent = novoEstado ? MENSAGENS.ATIVADO : MENSAGENS.DESATIVADO;

    await notificarContentScript(novoEstado);
  } catch (error) {
    console.error('[Auto Skip Video] Erro ao atualizar estado:', error);
  }
}

async function notificarContentScript(estado) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      await chrome.tabs.sendMessage(tab.id, {
        action: 'toggleChanged',
        enabled: estado
      });
    }
  } catch (error) {
    // Ignora erro se a aba não tiver content script carregado
    console.debug('[Auto Skip Video] Content script não disponível:', error);
  }
}


