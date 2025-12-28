/**
 * Video Observer - Monitora e configura vídeos na página
 */

function inicializarObservadorVideo(endHandler) {
  limparRecursos();

  if (!document.body) {
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
    
    if (video === currentVideo) {
      // Mesmo vídeo, mas garantir que loop ainda está desativado (especialmente YouTube)
      const plataforma = detectarPlataforma();
      if (plataforma === 'youtube' && video.loop) {
        video.loop = false;
        video.setAttribute('loop', 'false');
        desativarLoopYouTube();
      }
      return;
    }

    removerListenerAnterior();
    currentVideo = video;
    currentEndHandler = endHandler;
    currentTimeUpdateHandler = criarTimeUpdateHandler(video, endHandler);
    
    // Configurações específicas por plataforma ao encontrar vídeo
    const plataforma = detectarPlataforma();
    configurarVideoPorPlataforma(video, plataforma);
    
    // Para YouTube, também desativar loop imediatamente após adicionar listeners
    if (plataforma === 'youtube') {
      // Usar setTimeout para garantir que acontece após configuração
      setTimeout(() => {
        desativarLoopYouTube();
      }, 0);
    }
    
    // Adicionar múltiplos listeners para garantir detecção
    video.addEventListener('ended', endHandler);
    video.addEventListener('timeupdate', currentTimeUpdateHandler);
    
    // Adicionar listener de 'play' para garantir loop desativado quando vídeo tocar
    video.addEventListener('play', () => {
      if (plataforma === 'youtube' && video.loop) {
        video.loop = false;
        video.setAttribute('loop', 'false');
        desativarLoopYouTube();
      }
    }, { once: false });
    
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

