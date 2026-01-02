document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('svg-container');

  // SVG laden und inline einfügen
  const response = await fetch('assets/epcisProfileChecker.svg');
  const svgText = await response.text();
  container.innerHTML = svgText;

  // Tooltip initialisieren
  SVGTooltip.init();

  // Events für alle Rechtecke mit Tooltip
  document.querySelectorAll('rect[data-tooltip]').forEach(rect => {
    rect.addEventListener('mouseover', evt => SVGTooltip.show(evt));
    rect.addEventListener('mouseout', () => SVGTooltip.hide());
    // Optional: Touch-Unterstützung
    rect.addEventListener('touchstart', evt => {
      SVGTooltip.show(evt);
      setTimeout(() => SVGTooltip.hide(), 2000); // Tooltip nach 2s ausblenden
    });
  });
});

// Tooltip-Logik
const SVGTooltip = {
  tipEl: null,
  init() {
    this.tipEl = document.createElement('div');
    this.tipEl.className = 'svg-tooltip';
    this.tipEl.setAttribute('role', 'tooltip');
    this.tipEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(this.tipEl);
  },
  getText(target) {
    return target.getAttribute('data-tooltip') || target.id || '';
  },
  show(evt) {
    const target = evt.currentTarget || evt.target;
    const txt = this.getText(target);
    this.tipEl.textContent = txt;
    this.tipEl.style.opacity = '1';
    this.tipEl.setAttribute('aria-hidden', 'false');
    this.positionNearTarget(target);
  },
  hide() {
    this.tipEl.style.opacity = '0';
    this.tipEl.setAttribute('aria-hidden', 'true');
  },
  positionNearTarget(target) {
    const rect = target.getBoundingClientRect();
    const tip = this.tipEl;
    const offset = 8;
    let x = rect.right + offset;
    let y = rect.top + offset;
    const tipW = tip.offsetWidth;
    const tipH = tip.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (x + tipW + offset > vw) x = rect.left - tipW - offset;
    if (y + tipH + offset > vh) y = rect.bottom - tipH - offset;
    tip.style.left = Math.max(0, x) + 'px';
    tip.style.top = Math.max(0, y) + 'px';
  }
};
