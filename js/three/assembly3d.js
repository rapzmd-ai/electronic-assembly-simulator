// Mesin 3D perakitan. THREE dan OrbitControls dikirim dari luar (dimuat via importmap/CDN).
import { LAYOUTS } from '../data/layouts.js';
import { DEVICES } from '../data/devices.js';
const CYL = new Set(['fan', 'case_fan', 'camera', 'speaker', 'microphone', 'cpu_cooler']);
const OPACITY = { casing: .16, display: .5, keyboard: .7 };
const LID = new Set(['casing', 'display', 'keyboard']);
const COLOR = { motherboard: 0x1f6f4a, chipset: 0x2a2f3a, cpu: 0x2a2f3a, gpu: 0x23262d, ram: 0x2c4a7a, storage: 0x3a3f4a, ssd: 0x3a3f4a, storage_pc: 0x3a3f4a,
  display: 0x0a0a0c, battery: 0x8a8f99, camera: 0x15181d, speaker: 0x444a55, microphone: 0x555b66, charging_port: 0x9aa0aa, casing: 0xb0b5bf, cooling: 0xb87333,
  keyboard: 0x2b2e35, fan: 0x4b5563, heatsink: 0xb87333, psu: 0x1c1f26, cpu_cooler: 0x9aa0aa, case_fan: 0x4b5563, cable: 0xc2410c, monitor: 0x0a0a0c, peripheral: 0x2b2e35, sensor: 0xdc2626 };
const MODE = { idle: [0x4b5563, .55], dim: [0x4b5563, .18], target: [0x3b82f6, .9], ok: [0x34d399, 1], bad: [0xf87171, 1] };
const SNAP_PX = 85;

export function createAssembly(THREE, OrbitControls, host, deviceKey) {
  const L = LAYOUTS[deviceKey], slotIds = DEVICES[deviceKey].slots.filter(s => L.slots[s]);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0b0c0e);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 300);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const cv = renderer.domElement; cv.style.cssText = 'display:block;width:100%;height:100%;touch-action:none';
  host.appendChild(cv);
  scene.add(new THREE.AmbientLight(0xffffff, .75));
  const sun = new THREE.DirectionalLight(0xffffff, 1.1); sun.position.set(6, 12, 8); scene.add(sun);
  const fill = new THREE.DirectionalLight(0x88aaff, .35); fill.position.set(-8, 5, -6); scene.add(fill);
  const grid = new THREE.GridHelper(60, 60, 0x262a31, 0x16181d); grid.position.y = -.1; scene.add(grid);
  const mb = L.slots.motherboard;
  const pad = new THREE.Mesh(new THREE.BoxGeometry(mb[3] + .9, .12, mb[5] + .9), new THREE.MeshStandardMaterial({ color: 0x1a1d22, roughness: .9 }));
  pad.position.set(mb[0], 0, mb[2]); scene.add(pad);

  const controls = new OrbitControls(camera, cv);
  controls.enableDamping = true; controls.dampingFactor = .08; controls.minDistance = 3; controls.maxDistance = 70;
  controls.maxPolarAngle = Math.PI / 2 - .02;
  const resetCamera = () => { camera.position.set(L.cam * .55, L.cam * .7, L.cam * .85); controls.target.set(0, .5, 0); controls.update(); dirty = true; };
  let dirty = true, disposed = false, raf = 0, drag = null, down = null;
  controls.addEventListener('change', () => { dirty = true; });

  const geoFor = id => { const [, , , w, h, d] = L.slots[id]; return CYL.has(id) ? new THREE.CylinderGeometry(Math.max(w, d) / 2, Math.max(w, d) / 2, h, 24) : new THREE.BoxGeometry(w, h, d); };
  const anchor = id => new THREE.Vector3(...L.slots[id].slice(0, 3));
  function makeMesh(id, tier, opacity) {
    const op = opacity ?? OPACITY[id] ?? 1, geo = geoFor(id);
    const mat = new THREE.MeshStandardMaterial({ color: COLOR[id] || 0x888888, roughness: .55, metalness: .3, transparent: op < 1, opacity: op, depthWrite: op >= .6 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: tier === 'premium' ? 0x60a5fa : 0x000000, transparent: true, opacity: .5 })));
    mesh.position.copy(anchor(id)); mesh.userData.slot = id; return mesh;
  }
  // Titik pemasangan (ghost)
  const ghosts = {}, parts = {};
  for (const id of slotIds) {
    const g = new THREE.Group(), geo = geoFor(id), h = L.slots[id][4];
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ transparent: true }));
    const dot = new THREE.Mesh(new THREE.SphereGeometry(.09, 12, 12), new THREE.MeshBasicMaterial({ transparent: true }));
    dot.position.y = h / 2 + .2; g.add(edges, dot); g.position.copy(anchor(id));
    g.userData = { edges, dot, mode: 'idle' }; ghosts[id] = g; scene.add(g); setMode(id, 'idle');
  }
  function setMode(id, mode) {
    const g = ghosts[id]; if (!g) return; const [c, o] = MODE[mode]; g.userData.mode = mode;
    g.userData.edges.material.color.setHex(c); g.userData.edges.material.opacity = o;
    g.userData.dot.material.color.setHex(c); g.userData.dot.material.opacity = Math.min(1, o + .1); dirty = true;
  }
  const resetGhosts = () => slotIds.forEach(id => { ghosts[id].visible = !parts[id]; setMode(id, 'idle'); });

  const anims = [];
  const anim = (dur, fn, done) => anims.push({ t0: performance.now(), dur, fn, done });
  const ease = t => 1 - Math.pow(1 - t, 3);
  function ring(id) {
    const [x, y, z, w, , d] = L.slots[id], size = Math.max(w, d);
    const m = new THREE.Mesh(new THREE.RingGeometry(.4, .5, 40), new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, side: THREE.DoubleSide }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); scene.add(m);
    anim(450, e => { m.scale.setScalar(.5 + e * size * 1.6); m.material.opacity = 1 - e; }, () => { scene.remove(m); m.geometry.dispose(); m.material.dispose(); });
  }
  function addPart(id, tier, animate) {
    if (parts[id] || !L.slots[id]) return; const m = makeMesh(id, tier); parts[id] = m; scene.add(m); ghosts[id].visible = false;
    if (animate) { const y0 = m.position.y; anim(320, e => { m.position.y = y0 + (1 - e) * 1.5; }, () => { m.position.y = y0; }); ring(id); }
    dirty = true;
  }
  function removePart(id, animate) {
    const m = parts[id]; if (!m) return; delete parts[id]; ghosts[id].visible = true; setMode(id, 'idle');
    const fin = () => { scene.remove(m); m.traverse(o => { o.geometry?.dispose(); o.material?.dispose(); }); dirty = true; };
    if (!animate) return fin();
    const y0 = m.position.y; anim(280, e => { m.position.y = y0 + e * 1.6; m.scale.setScalar(Math.max(.02, 1 - e * .95)); }, fin);
  }
  function setSelected(id) {
    for (const [k, m] of Object.entries(parts)) m.material.emissive.setHex(k === id ? 0x1d4ed8 : 0x000000); dirty = true;
  }
  const rayFor = (cx, cy) => {
    const r = cv.getBoundingClientRect(), ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1), camera); return { ray, r };
  };
  // Klik komponen terpasang
  const onDown = e => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; };
  const onUp = e => {
    if (!down || drag) { down = null; return; }
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), quick = performance.now() - down.t < 500; down = null;
    if (moved > 6 || !quick) return;
    const hits = rayFor(e.clientX, e.clientY).ray.intersectObjects(Object.values(parts), false);
    const hit = hits.find(h => !LID.has(h.object.userData.slot)) || hits[0];
    api.onPick?.(hit ? hit.object.userData.slot : null);
  };
  cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointerup', onUp);

  // Drag komponen dari daftar
  function beginDrag(slot, tier, result) {
    if (!ghosts[slot]) return false;
    const preview = makeMesh(slot, tier, .85); preview.visible = false; scene.add(preview);
    drag = { slot, preview, result, snapped: false, inside: false };
    slotIds.forEach(id => { ghosts[id].visible = !parts[id]; setMode(id, 'dim'); });
    ghosts[slot].visible = true; setMode(slot, 'target'); controls.enabled = false; return true;
  }
  function updateDrag(cx, cy) {
    if (!drag) return; const { ray, r } = rayFor(cx, cy), p = drag.preview;
    drag.inside = cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom;
    if (!drag.inside) { p.visible = false; drag.snapped = false; setMode(drag.slot, 'target'); return; }
    const a = anchor(drag.slot), dir = new THREE.Vector3(); camera.getWorldDirection(dir);
    const hit = ray.ray.intersectPlane(new THREE.Plane().setFromNormalAndCoplanarPoint(dir, a), new THREE.Vector3());
    p.visible = true; if (hit) p.position.copy(hit);
    const s = a.clone().project(camera), sx = r.left + (s.x + 1) / 2 * r.width, sy = r.top + (1 - s.y) / 2 * r.height;
    drag.snapped = Math.hypot(sx - cx, sy - cy) < SNAP_PX;
    if (drag.snapped) { p.position.copy(a); setMode(drag.slot, drag.result.ok ? 'ok' : 'bad'); p.material.emissive.setHex(drag.result.ok ? 0x000000 : 0x7f1d1d); }
    else { setMode(drag.slot, 'target'); p.material.emissive.setHex(0x000000); }
    dirty = true;
  }
  function endDrag() {
    if (!drag) return { snapped: false, inside: false };
    const out = { snapped: drag.snapped, inside: drag.inside, slot: drag.slot, ok: drag.result.ok };
    scene.remove(drag.preview); drag.preview.traverse(o => { o.geometry?.dispose(); o.material?.dispose(); });
    const slot = drag.slot; drag = null; controls.enabled = true; resetGhosts();
    if (out.snapped && !out.ok) { setMode(slot, 'bad'); setTimeout(() => !disposed && !parts[slot] && setMode(slot, 'idle'), 700); }
    return out;
  }
  function resize() {
    const w = host.clientWidth || 300, h = host.clientHeight || 300;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); dirty = true;
  }
  const ro = new ResizeObserver(resize); ro.observe(host); resize(); resetCamera();

  function loop(now) {
    if (disposed) return; raf = requestAnimationFrame(loop);
    if (controls.update()) dirty = true;
    for (let i = anims.length - 1; i >= 0; i--) {
      const a = anims[i], t = Math.min(1, (now - a.t0) / a.dur); a.fn(ease(t)); dirty = true;
      if (t >= 1) { anims.splice(i, 1); a.done?.(); }
    }
    if (drag && ghosts[drag.slot].userData.mode === 'target') {
      const o = .45 + .4 * Math.sin(now / 160), g = ghosts[drag.slot].userData; g.edges.material.opacity = o; g.dot.material.opacity = o; dirty = true;
    }
    if (dirty) { dirty = false; renderer.render(scene, camera); }
  }
  raf = requestAnimationFrame(loop);

  const api = {
    onPick: null, addPart, removePart, setSelected, beginDrag, updateDrag, endDrag, resetCamera,
    load(list) { list.forEach(([id, tier]) => addPart(id, tier, false)); },
    dispose() {
      disposed = true; cancelAnimationFrame(raf); ro.disconnect(); controls.dispose();
      cv.removeEventListener('pointerdown', onDown); cv.removeEventListener('pointerup', onUp);
      scene.traverse(o => { o.geometry?.dispose(); if (o.material) [].concat(o.material).forEach(m => m.dispose()); });
      renderer.dispose(); cv.remove();
    },
  };
  return api;
}
