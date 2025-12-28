/**
 * Handler - YouTube Shorts
 * Lógica específica para YouTube
 */

function criarHandlerYouTube() {
  return () => {
    if (!autoSkipEnabled) {
      if (DEBUG) console.log('[Auto Skip Video] Extensão desativada');
      return;
    }

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

    if (DEBUG) console.log('[Auto Skip Video] Vídeo terminou no YouTube Shorts, avançando...');

    // IMPORTANTE: Desativar loop antes de avançar
    desativarLoopYouTube();

    setTimeout(() => {
      try {
        // Usar estratégia específica para cada navegador
        if (NAVEGADOR === 'firefox') {
          avancarYouTubeFirefox();
        } else {
          avancarYouTubeChrome();
        }
        
        // Resetar flag após um tempo para permitir próximo avanço
        setTimeout(() => {
          isAvancando = false;
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

