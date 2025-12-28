/**
 * Loop Disabler - Desativa loops de vídeo
 * Especialmente para YouTube que reativa loops constantemente
 */

function desativarLoopYouTube() {
  try {
    if (currentVideo) {
      currentVideo.loop = false;
      currentVideo.setAttribute('loop', 'false');
      if (DEBUG) console.log('[Auto Skip Video] Loop desativado no vídeo');
    }
    
    // Tentar encontrar e desativar controles de loop na UI do YouTube
    const botoesLoop = document.querySelectorAll('button[aria-label*="loop" i], button[aria-label*="repetir" i], button[aria-label*="repeat" i]');
    botoesLoop.forEach(botao => {
      const ariaLabel = botao.getAttribute('aria-label') || '';
      const isPressed = botao.getAttribute('aria-pressed') === 'true';
      
      if (isPressed && (ariaLabel.toLowerCase().includes('loop') || ariaLabel.toLowerCase().includes('repetir') || ariaLabel.toLowerCase().includes('repeat'))) {
        botao.click();
        if (DEBUG) console.log('[Auto Skip Video] Botão de loop desativado na UI:', ariaLabel);
      }
    });
    
    // Tentar desativar via configurações do player do YouTube
    if (window.ytplayer && window.ytplayer.config) {
      if (window.ytplayer.config.args) {
        window.ytplayer.config.args.loop = 0;
        if (DEBUG) console.log('[Auto Skip Video] Loop desativado via ytplayer.config');
      }
    }
    
    if (window.yt && window.yt.config_) {
      try {
        window.yt.config_.args.loop = 0;
        if (DEBUG) console.log('[Auto Skip Video] Loop desativado via yt.config_');
      } catch (e) {}
    }
  } catch (error) {
    if (DEBUG) console.error('[Auto Skip Video] Erro ao desativar loop:', error);
  }
}

function configurarVideoPorPlataforma(video, plataforma) {
  try {
    switch (plataforma) {
      case 'youtube':
        video.loop = false;
        
        if (loopDisableInterval) {
          clearInterval(loopDisableInterval);
        }
        
        // Desativar loop continuamente (a cada 100ms) - necessário porque YouTube reativa constantemente
        loopDisableInterval = setInterval(() => {
          if (video) {
            if (video.loop !== false) {
              video.loop = false;
              video.setAttribute('loop', 'false');
              if (DEBUG) console.log('[Auto Skip Video] Loop reativado pelo YouTube, desativando novamente');
            }
          }
        }, 100);
        
        // Monitorar mudanças no atributo loop via MutationObserver
        if (loopObserver) {
          loopObserver.disconnect();
        }
        loopObserver = new MutationObserver(() => {
          if (video && video.loop) {
            video.loop = false;
            video.setAttribute('loop', 'false');
            if (DEBUG) console.log('[Auto Skip Video] Loop detectado via MutationObserver, desativando');
          }
        });
        loopObserver.observe(video, { attributes: true, attributeFilter: ['loop'] });
        break;
        
      case 'tiktok':
      case 'instagram':
      default:
        video.loop = false;
        break;
    }
  } catch (error) {
    if (DEBUG) console.error('[Auto Skip Video] Erro ao configurar vídeo:', error);
  }
}

