/**
 * Detector - Identifica navegador e plataforma
 */

// ==================== DETECÇÃO DE NAVEGADOR ====================
function detectarNavegador() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('firefox')) return 'firefox';
  if (ua.includes('edg')) return 'edge';
  if (ua.includes('chrome') && !ua.includes('edg')) return 'chrome';
  if (ua.includes('safari')) return 'safari';
  if (ua.includes('opera') || ua.includes('opr')) return 'opera';
  return 'chrome'; // Padrão para Chromium-based
}

const NAVEGADOR = detectarNavegador();

