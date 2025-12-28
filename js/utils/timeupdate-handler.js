/**
 * TimeUpdate Handler - Detecta fim de vídeo via timeupdate
 * Backup do evento 'ended' nativo
 */

function criarTimeUpdateHandler(video, endHandler) {
  let ultimoTempo = 0;
  let contadorLoop = 0;
  let jaAvancou = false;
  let tempoFimDetectado = false;
  let eventoEndedDisparado = false;
  
  // Listener para marcar quando evento 'ended' é disparado
  const endedListener = () => {
    eventoEndedDisparado = true;
    jaAvancou = true;
  };
  video.addEventListener('ended', endedListener, { once: true });
  
  return () => {
    const tempoAtual = video.currentTime;
    const duracao = video.duration;
    
    // Resetar flag se vídeo voltou a tocar (novo vídeo)
    if (tempoAtual < ultimoTempo && ultimoTempo > 0.5) {
      jaAvancou = false;
      tempoFimDetectado = false;
      eventoEndedDisparado = false;
    }
    
    // NÃO processar se já avançou ou se evento 'ended' foi disparado
    if (jaAvancou || eventoEndedDisparado || isAvancando) {
      return;
    }
    
    // Detectar se vídeo está no fim (últimos 0.3 segundos ou 99% completo)
    if (duracao > 0 && !tempoFimDetectado) {
      const percentual = (tempoAtual / duracao) * 100;
      const estaNoFim = tempoAtual >= duracao - 0.3 || percentual >= 99;
      
      if (estaNoFim && !jaAvancou) {
        tempoFimDetectado = true;
        if (DEBUG) console.log('[Auto Skip Video] Fim do vídeo detectado via timeupdate:', { 
          tempoAtual, 
          duracao, 
          percentual: percentual.toFixed(2) + '%' 
        });
        
        // Aguardar um pouco para ver se o evento 'ended' dispara
        setTimeout(() => {
          if (!eventoEndedDisparado && !jaAvancou && (video.paused || video.currentTime < 0.5)) {
            if (DEBUG) console.log('[Auto Skip Video] Forçando avanço (timeupdate - evento ended não disparou)');
            jaAvancou = true;
            endHandler();
          }
        }, 500);
      }
    }
    
    // Detectar loop explícito
    if (!eventoEndedDisparado && tempoAtual < 0.5 && ultimoTempo > duracao * 0.9 && duracao > 0) {
      contadorLoop++;
      if (contadorLoop >= 1 && !jaAvancou) {
        if (DEBUG) console.log('[Auto Skip Video] Loop detectado após fim do vídeo, forçando avanço');
        jaAvancou = true;
        endHandler();
        contadorLoop = 0;
      }
    } else if (tempoAtual > ultimoTempo) {
      contadorLoop = 0;
    }
    
    ultimoTempo = tempoAtual;
  };
}

