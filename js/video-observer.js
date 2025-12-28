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

