/**
 * Loop Disabler - Desativa loops de vídeo
 * Especialmente para YouTube que reativa loops constantemente
 */

function desativarLoopYouTube() {
  try {
    // Desativar no elemento de vídeo atual
    if (currentVideo) {
      currentVideo.loop = false;
      currentVideo.setAttribute('loop', 'false');
    }
    
    // Também desativar em todos os vídeos encontrados na página (YouTube pode ter múltiplos)
    const todosVideos = document.querySelectorAll('video');
    todosVideos.forEach(video => {
      if (video.loop) {
        video.loop = false;
        video.setAttribute('loop', 'false');
      }
    });
    
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
    
    // Tentar desativar via configurações do player do YouTube (múltiplas APIs)
    if (window.ytplayer && window.ytplayer.config) {
      if (window.ytplayer.config.args) {
        window.ytplayer.config.args.loop = 0;
      }
    }
    
    if (window.yt && window.yt.config_) {
      try {
        window.yt.config_.args.loop = 0;
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
        // Garantir que loop está desativado imediatamente
        video.loop = false;
        video.setAttribute('loop', 'false');
        
        // Limpar intervalos/observers anteriores se existirem
        if (loopDisableInterval) {
          clearInterval(loopDisableInterval);
          loopDisableInterval = null;
        }
        if (loopObserver) {
          loopObserver.disconnect();
          loopObserver = null;
        }
        
        // Desativar loop continuamente (a cada 50ms) - YouTube reativa muito rápido
        loopDisableInterval = setInterval(() => {
          if (video && video.parentNode) { // Verificar se vídeo ainda existe no DOM
            // Forçar desativação do loop
            if (video.loop !== false) {
              video.loop = false;
              video.setAttribute('loop', 'false');
              if (DEBUG) console.log('[Auto Skip Video] Loop reativado pelo YouTube, desativando novamente');
            }
            // Desativar em todos os vídeos da página também
            const todosVideos = document.querySelectorAll('video');
            todosVideos.forEach(v => {
              if (v.loop) {
                v.loop = false;
                v.setAttribute('loop', 'false');
              }
            });
          } else {
            // Vídeo não existe mais, limpar intervalo
            if (loopDisableInterval) {
              clearInterval(loopDisableInterval);
              loopDisableInterval = null;
            }
          }
        }, 50); // Intervalo mais frequente (50ms ao invés de 100ms)
        
        // Monitorar mudanças no atributo loop via MutationObserver
        loopObserver = new MutationObserver(() => {
          if (video && video.loop) {
            video.loop = false;
            video.setAttribute('loop', 'false');
            // Desativar em todos os vídeos também
            const todosVideos = document.querySelectorAll('video');
            todosVideos.forEach(v => {
              if (v.loop) {
                v.loop = false;
                v.setAttribute('loop', 'false');
              }
            });
            if (DEBUG) console.log('[Auto Skip Video] Loop detectado via MutationObserver, desativando');
          }
        });
        loopObserver.observe(video, { attributes: true, attributeFilter: ['loop'] });
        
        if (DEBUG) console.log('[Auto Skip Video] YouTube: Loop desativado e monitoramento contínuo configurado');
        break;
        
      case 'tiktok':
      case 'instagram':
        // Para TikTok e Instagram, apenas desativar uma vez (eles geralmente não reativam)
        video.loop = false;
        if (DEBUG) console.log('[Auto Skip Video] Loop desativado para', plataforma);
        break;
        
      default:
        // Outras plataformas: desativar loop por padrão
        video.loop = false;
        break;
    }
  } catch (error) {
    if (DEBUG) console.error('[Auto Skip Video] Erro ao configurar vídeo:', error);
  }
}

