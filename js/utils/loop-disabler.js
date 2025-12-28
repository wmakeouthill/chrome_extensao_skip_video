/**
 * Loop Disabler - Desativa loops de vídeo
 * Especialmente para YouTube que reativa loops constantemente
 */

function desativarLoopYouTube() {
  try {
    // APENAS desativar no vídeo atual - sem queries pesadas (querySelectorAll removido!)
    if (currentVideo) {
      currentVideo.loop = false;
      currentVideo.setAttribute('loop', 'false');
    }
    
    // APIs do YouTube apenas se disponíveis (sem queries DOM)
    if (window.ytplayer?.config?.args) {
      window.ytplayer.config.args.loop = 0;
    }
    if (window.yt?.config_?.args) {
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
        
        // Limpar observers anteriores se existirem (não há mais intervalo!)
        if (loopObserver) {
          loopObserver.disconnect();
          loopObserver = null;
        }
        
        // Usar MutationObserver APENAS para detectar mudanças no atributo loop (reativo, não polling!)
        // Muito mais eficiente que setInterval
        loopObserver = new MutationObserver(() => {
          if (video && video.loop) {
            video.loop = false;
            video.setAttribute('loop', 'false');
            if (DEBUG) console.log('[Auto Skip Video] Loop detectado via MutationObserver, desativando');
          }
        });
        loopObserver.observe(video, { attributes: true, attributeFilter: ['loop'] });
        
        if (DEBUG) console.log('[Auto Skip Video] YouTube: Loop desativado e MutationObserver configurado (sem polling)');
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

