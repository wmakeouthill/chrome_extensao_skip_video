/**
 * Handler - Genérico
 * Lógica para outras plataformas não específicas
 */

function criarHandlerGenerico() {
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

    if (DEBUG) console.log('[Auto Skip Video] Vídeo terminou, avançando (método genérico)...');

    if (currentVideo) {
      currentVideo.loop = false;
    }

    setTimeout(() => {
      try {
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

function obterEndHandler(plataforma) {
  const handlers = {
    youtube: criarHandlerYouTube,
    tiktok: criarHandlerTikTok,
    instagram: criarHandlerInstagram
  };

  const handlerFactory = handlers[plataforma] || criarHandlerGenerico;
  return handlerFactory();
}

