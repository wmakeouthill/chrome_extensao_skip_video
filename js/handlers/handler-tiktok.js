/**
 * Handler - TikTok
 * Lógica específica para TikTok
 */

function criarHandlerTikTok() {
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

    if (DEBUG) console.log('[Auto Skip Video] Vídeo terminou no TikTok, avançando...');

    if (currentVideo) {
      currentVideo.loop = false;
    }

    setTimeout(() => {
      try {
        scrollParaBaixo();
        if (DEBUG) console.log('[Auto Skip Video] Scroll executado no TikTok');
        
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

