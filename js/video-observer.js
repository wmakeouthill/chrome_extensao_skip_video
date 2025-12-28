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
  const isFullscreen = !!document.fullscreenElement;

  // Função para simular tecla
  const pressionarTecla = (key, keyCode) => {
    const target = document.fullscreenElement || document.activeElement || document.body;
    ['keydown', 'keypress', 'keyup'].forEach(type => {
      target.dispatchEvent(new KeyboardEvent(type, {
        key, code: key, keyCode, which: keyCode, bubbles: true, cancelable: true
      }));
    });
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key, code: key, keyCode, which: keyCode, bubbles: true, cancelable: true
    }));
  };

  if (hostname.includes('youtube.com')) {
    pressionarTecla('ArrowDown', 40);
  }
  else if (hostname.includes('tiktok.com')) {
    // TikTok: ArrowDown funciona em fullscreen e normal
    pressionarTecla('ArrowDown', 40);
    // Fallback: scroll se não estiver em fullscreen
    if (!isFullscreen) {
      setTimeout(scrollParaBaixo, 100);
    }
  }
  else if (hostname.includes('instagram.com')) {
    // Instagram: ArrowDown para Reels
    pressionarTecla('ArrowDown', 40);
    if (!isFullscreen) {
      setTimeout(scrollParaBaixo, 100);
    }
  }
  else if (hostname.includes('kwai.com') || hostname.includes('likee.video')) {
    pressionarTecla('ArrowDown', 40);
    setTimeout(scrollParaBaixo, 100);
  }
  else {
    // Outras plataformas: scroll down
    scrollParaBaixo();
  }
}
