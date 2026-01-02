const SVGTooltip = {
  tipEl: null,

  init() {
    if (this.tipEl) return;
    this.tipEl = document.createElement('div');
    this.tipEl.className = 'svg-tooltip';
    this.tipEl.setAttribute('role', 'tooltip');
    this.tipEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(this.tipEl);
  },

  show(evt, text) {
    const target = evt.currentTarget || evt.target;
    const tip = this.tipEl;
    tip.textContent = text;
    tip.style.opacity = '1';
    tip.setAttribute('aria-hidden', 'false');
    this.positionNearTarget(target);
  },

  hide() {
    const tip = this.tipEl;
    tip.style.opacity = '0';
    tip.setAttribute('aria-hidden', 'true');
  },

  positionNearTarget(target) {
    const rect = target.getBoundingClientRect();
    const tip  = this.tipEl;
    const offset = 8;
    let x = rect.right + offset;
    let y = rect.top   + offset;
    const tipW = tip.offsetWidth;
    const tipH = tip.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (x + tipW + offset > vw) x = rect.left - tipW - offset;
    if (y + tipH + offset > vh) y = rect.bottom - tipH - offset;
    tip.style.left = Math.max(0, x) + 'px';
    tip.style.top  = Math.max(0, y) + 'px';
  }
};

// --- Leichtgewichtiges JSON-Cache + Loader ---
const JSONCache = new Map();
async function fetchJSON(url) {
  if (JSONCache.has(url)) return JSONCache.get(url);
  const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  JSONCache.set(url, data);
  return data;
}

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('svg-container');

  // 1) SVG laden und inline einfügen (damit DOM-Events funktionieren)
  const response = await fetch('assets/epcisProfileChecker.svg');
  const svgText  = await response.text();
  container.innerHTML = svgText;

  // 2) Tooltip initialisieren
  SVGTooltip.init();

  // 3a) Statische Tooltips: rect[data-tooltip]
  document.querySelectorAll('rect[data-tooltip]').forEach(rect => {
    const baseFill = getComputedStyle(rect).fill; // ursprüngliche Farbe merken
    rect.addEventListener('mouseover', evt => {
      rect.style.fill = '#6e98ec';
      const txt = rect.getAttribute('data-tooltip') || rect.id || '';
      SVGTooltip.show(evt, txt);
    });
    rect.addEventListener('mouseout', () => {
      rect.style.fill = baseFill;
      SVGTooltip.hide();
    });
    // Touch (kurz einblenden)
    rect.addEventListener('touchstart', evt => {
      rect.style.fill = '#6e98ec';
      const txt = rect.getAttribute('data-tooltip') || rect.id || '';
      SVGTooltip.show(evt, txt);
      setTimeout(() => { rect.style.fill = baseFill; SVGTooltip.hide(); }, 1800);
    }, { passive: true });
  });

  // 3b) Externe JSON-Tooltips: rect[data-tooltip-src]
  document.querySelectorAll('rect[data-tooltip-src]').forEach(rect => {
    const baseFill = getComputedStyle(rect).fill;
    const src = rect.getAttribute('data-tooltip-src');
    const key = rect.getAttribute('data-tooltip-json-key') || 'description';

    rect.addEventListener('mouseover', async evt => {
      rect.style.fill = '#6e98ec';
      try {
        SVGTooltip.show(evt, 'Lade…');
        const data = await fetchJSON(src);
        const txt  = (data && data[key]) ? String(data[key]) : '(Kein Text gefunden)';
        SVGTooltip.show(evt, txt);
      } catch (e) {
        console.error('JSON Tooltip error:', e);
        SVGTooltip.show(evt, 'Fehler beim Laden');
      }
    });

    rect.addEventListener('mouseout', () => {
      rect.style.fill = baseFill;
      SVGTooltip.hide();
    });

    rect.addEventListener('touchstart', async evt => {
      rect.style.fill = '#6e98ec';
      try {
        SVGTooltip.show(evt, 'Lade…');
        const data = await fetchJSON(src);
        const txt  = (data && data[key]) ? String(data[key]) : '(Kein Text gefunden)';
        SVGTooltip.show(evt, txt);
      } catch (e) {
        SVGTooltip.show(evt, 'Fehler beim Laden');
      }
      setTimeout(() => { rect.style.fill = baseFill; SVGTooltip.hide(); }, 2000);
    }, { passive: true });
  });
});
