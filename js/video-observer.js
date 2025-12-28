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
      return;
    }

    // Se é o mesmo vídeo, não fazer nada (evitar reprocessamento desnecessário)
    if (video === currentVideo) {
      return;
    }

    removerListenerAnterior();
    currentVideo = video;
    currentEndHandler = endHandler;
    // REMOVIDO: timeupdate handler - dispara muito frequentemente e causa lentidão
    // Confiamos 100% no evento 'ended' nativo que é mais eficiente

    // Configurações específicas por plataforma ao encontrar vídeo
    const plataforma = detectarPlataforma();
    configurarVideoPorPlataforma(video, plataforma);

    // APENAS evento 'ended' - evento nativo, zero overhead quando vídeo está tocando
    video.addEventListener('ended', endHandler);

    // Listener de 'play' para garantir loop desativado quando vídeo começa (apenas YouTube)
    // Evento nativo - APENAS desativa loop básico, sem querySelectorAll pesado
    if (plataforma === 'youtube') {
      currentPlayListener = () => {
        // Desativar loop APENAS no vídeo atual (sem queries pesadas)
        if (video.loop) {
          video.loop = false;
          video.setAttribute('loop', 'false');
        }
      };
      video.addEventListener('play', currentPlayListener, { once: false });
    }

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

  // MutationObserver com throttling MUITO AGGRESSIVO para Firefox
  let ultimaObservacao = 0;
  const THROTTLE_OBSERVER_MS = 2000; // Máximo 1x a cada 2 segundos
  let pendingCheck = false;

  const executarBusca = () => {
    pendingCheck = false;
    encontrarVideo();
  };

  videoObserver = new MutationObserver(() => {
    const agora = Date.now();
    if (agora - ultimaObservacao < THROTTLE_OBSERVER_MS || pendingCheck) {
      return; // Throttling muito agressivo
    }
    ultimaObservacao = agora;
    pendingCheck = true;

    // Usar requestIdleCallback quando disponível (muito mais leve)
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(executarBusca, { timeout: 3000 });
    } else {
      setTimeout(executarBusca, 100);
    }
  });

  // Observar apenas childList do body (sem subtree) - mínimo overhead
  videoObserver.observe(document.body, { childList: true, subtree: false });
}

