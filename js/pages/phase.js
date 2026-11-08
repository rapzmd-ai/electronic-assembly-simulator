export default (title, phase, items) => el => {
  el.innerHTML = `<div class="card"><h3>${title}</h3><div class="muted small">Dibangun di ${phase}. Fase sebelumnya sudah berfungsi penuh.</div>
  <ul class="muted">${items.map(i => `<li>${i}</li>`).join('')}</ul><a class="btn ghost sm" href="#/devices">Ke Device Selection</a></div>`;
};
