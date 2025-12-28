/**
 * Video Handler - Configuração de vídeo REATIVA
 * SEM MutationObserver, SEM polling - apenas eventos nativos
 */

// Função para desativar loop agressivamente
function desativarLoop(video) {
  if (video.loop) {
    video.loop = false;
  }
  if (video.hasAttribute('loop')) {
    video.removeAttribute('loop');
  }
}

function configurarVideo(video) {
  if (!video || video === currentVideo) return;

  limparVideo();
  currentVideo = video;

  // Desativar loop imediatamente
  desativarLoop(video);

  // Handler para quando vídeo termina
  currentEndHandler = () => {
    if (isProcessing || !autoSkipEnabled) return;
    isProcessing = true;

    // Desativar loop novamente antes de avançar
    desativarLoop(video);

    setTimeout(() => {
      avancarVideo();
      setTimeout(() => { isProcessing = false; }, 500);
    }, DELAY_MS);
  };

  video.addEventListener('ended', currentEndHandler);

  // Desativar loop em MÚLTIPLOS eventos nativos (YouTube reativa constantemente)
  const desativarLoopHandler = () => desativarLoop(video);

  video.addEventListener('play', desativarLoopHandler, { passive: true });
  video.addEventListener('playing', desativarLoopHandler, { passive: true });
  video.addEventListener('seeked', desativarLoopHandler, { passive: true });
  video.addEventListener('loadeddata', desativarLoopHandler, { passive: true });

  // timeupdate com throttle leve (a cada 2s no máximo)
  let lastCheck = 0;
  video.addEventListener('timeupdate', () => {
    const now = Date.now();
    if (now - lastCheck > 2000) {
      lastCheck = now;
      desativarLoop(video);
    }
  }, { passive: true });
}

function avancarVideo() {
  const hostname = window.location.hostname;

  if (hostname.includes('youtube.com')) {
    // YouTube: simular tecla ArrowDown
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      code: 'ArrowDown',
      keyCode: 40,
      which: 40,
      bubbles: true
    }));
  } else {
    // Outras plataformas: scroll down
    scrollParaBaixo();
  }
}
