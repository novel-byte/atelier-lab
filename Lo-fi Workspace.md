---
type: dashboard
tags: [sandbox]
cssclasses: [dashboard-layout, atelier-dashboard-page, atelier-lofi-page]
---

```dataviewjs
(async () => {
const H = new Function("dv", "require", "app", await app.vault.read((app.vault.getAbstractFileByPath("_core/helpers.js") || app.vault.getAbstractFileByPath(H.path("_core/helpers.js")))))(dv, require, app);
const { store } = H;
const root = dv.container.createDiv({ cls: "lofi-app" });
H.mountHome(root);
const state = Object.assign({ duration: 25 * 60, endsAt: 0, running: false, label: "Deep work", startedAt: 0 }, store.get("lofi-session", {}));
const save = () => store.set("lofi-session", state);
const remaining = () => state.running ? Math.max(0, Math.ceil((state.endsAt - Date.now()) / 1000)) : state.duration;
let interval;

const scene = root.createDiv({ cls: "lofi-scene" });
scene.createDiv({ cls: "lofi-rain" });
// Scene art resolved through the vault API — immune to snippet path handling.
const sceneArt = app.vault.getAbstractFileByPath(H.path("_core/vendor/lofi-city.svg"));
if (sceneArt) {
  scene.style.backgroundImage = `linear-gradient(90deg, rgba(6,8,16,.42), rgba(6,8,16,.04)), url(${app.vault.adapter.getResourcePath(sceneArt.path)})`;
  scene.style.backgroundSize = "cover";
  scene.style.backgroundPosition = "center";
}

// --- WebGL atmosphere (three.js, vendored, fully lifecycle-guarded) ---
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!REDUCED) (async () => {
  const vendor = app.vault.getAbstractFileByPath(H.path("_core/vendor/three.min.js"));
  if (!vendor) return;
  await new Promise(res => {
    const s = document.createElement("script");
    s.src = app.vault.adapter.getResourcePath(vendor.path);
    s.onload = res; s.onerror = res;
    document.head.appendChild(s);
  });
  const T = window.THREE; if (!T) return;
  let renderer;
  try { renderer = new T.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" }); }
  catch (_) { return; }
  renderer.setClearColor(0x000000, 0); // keep the scene image visible through the canvas
  const rainEl = scene.querySelector(".lofi-rain"); if (rainEl) rainEl.style.display = "none";
  const W = () => scene.clientWidth || 800, Hh = () => scene.clientHeight || 500;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(W(), Hh());
  Object.assign(renderer.domElement.style, { position: "absolute", inset: "0", pointerEvents: "none" });
  scene.appendChild(renderer.domElement);

  const gl = new T.Scene();
  const cam = new T.PerspectiveCamera(60, W() / Hh(), .1, 100); cam.position.z = 10;

  // rain streaks
  const N = 650, pos = new Float32Array(N * 3), vel = new Float32Array(N);
  for (let i = 0; i < N; i++) { pos[i*3] = (Math.random() - .5) * 34; pos[i*3+1] = (Math.random() - .5) * 22; pos[i*3+2] = (Math.random() - .5) * 6; vel[i] = .14 + Math.random() * .2; }
  const rainGeo = new T.BufferGeometry(); rainGeo.setAttribute("position", new T.BufferAttribute(pos, 3));
  const rainMat = new T.PointsMaterial({ color: 0xa9cfdf, size: .055, transparent: true, opacity: .38, depthWrite: false });
  gl.add(new T.Points(rainGeo, rainMat));

  // warm dust motes
  const M = 110, p2 = new Float32Array(M * 3);
  for (let i = 0; i < M; i++) { p2[i*3] = (Math.random() - .5) * 26; p2[i*3+1] = (Math.random() - .5) * 18; p2[i*3+2] = Math.random() * 4; }
  const dustGeo = new T.BufferGeometry(); dustGeo.setAttribute("position", new T.BufferAttribute(p2, 3));
  const dustMat = new T.PointsMaterial({ color: 0xf4bb73, size: .1, transparent: true, opacity: .25, depthWrite: false });
  const dust = new T.Points(dustGeo, dustMat); gl.add(dust);

  // lightning flash plane
  const flashMat = new T.MeshBasicMaterial({ color: 0xdceaf5, transparent: true, opacity: 0, depthWrite: false });
  const flash = new T.Mesh(new T.PlaneGeometry(90, 60), flashMat); flash.position.z = -6; gl.add(flash);

  let mx = 0, my = 0;
  const onMove = e => { mx = (e.clientX / innerWidth - .5) * 2; my = (e.clientY / innerHeight - .5) * 2; };
  window.addEventListener("mousemove", onMove);

  let raf = 0, running = true, last = performance.now();
  let nextFlash = performance.now() + 6000 + Math.random() * 9000;
  function tick(now) {
    if (!running) return;
    raf = requestAnimationFrame(tick);
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    const a = rainGeo.attributes.position.array;
    for (let i = 0; i < N; i++) { a[i*3+1] -= vel[i] * dt * 10; a[i*3] += mx * dt * .6; if (a[i*3+1] < -11) a[i*3+1] = 11; }
    rainGeo.attributes.position.needsUpdate = true;
    dust.rotation.y += dt * .02; dust.position.x = mx * .8; dust.position.y = -my * .6;
    cam.position.x += (mx * .9 - cam.position.x) * .04;
    cam.position.y += (-my * .6 - cam.position.y) * .04;
    cam.lookAt(0, 0, 0);
    if (now > nextFlash) { flashMat.opacity = .35 + Math.random() * .3; nextFlash = now + 7000 + Math.random() * 12000; }
    flashMat.opacity *= .92;
    renderer.render(gl, cam);
  }
  raf = requestAnimationFrame(tick);

  const dispose = () => {
    running = false; cancelAnimationFrame(raf);
    io.disconnect(); visibilityOff(); sweepOff();
    window.removeEventListener("mousemove", onMove);
    renderer.dispose(); rainGeo.dispose(); rainMat.dispose(); dustGeo.dispose(); dustMat.dispose();
    flash.geometry.dispose(); flashMat.dispose();
    renderer.domElement.remove();
  };
  const setVisible = v => { if (v && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(tick); } else if (!v && running) { running = false; cancelAnimationFrame(raf); } };
  const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting)); io.observe(renderer.domElement);
  const onVis = () => setVisible(!document.hidden);
  document.addEventListener("visibilitychange", onVis);
  const visibilityOff = () => document.removeEventListener("visibilitychange", onVis);
  const sweep = setInterval(() => { if (!scene.isConnected) { dispose(); } }, 2000);
  const sweepOff = () => clearInterval(sweep);
})();
const panel = root.createDiv({ cls: "lofi-panel" });
panel.createDiv({ cls: "lofi-kicker", text: "ATELIER LAB / LO-FI ROOM" });
panel.createEl("h1", { text: "Stay with the work." });
const label = panel.createEl("input", { cls: "lofi-label-input", attr: { value: state.label, placeholder: "Session label" } });
const clock = panel.createDiv({ cls: "lofi-clock" });
const statusLine = panel.createDiv({ cls: "lofi-status" });

// context selects — sessions log against a project/course
const labProjects = dv.pages(H.q("Projects")).where(p => p.type === "project").array().map(p => p.file.name);
const labCourses = dv.pages(H.q("Courses")).where(p => p.type === "course").array().map(c => c.file.name);
const ctx = panel.createDiv({ cls: "lofi-ctx" });
const mkSelect = (placeholder, options) => {
  const s = ctx.createEl("select", { cls: "lofi-track" }); s.style.marginTop = "0";
  s.createEl("option", { text: placeholder, value: "" });
  options.forEach(o => s.createEl("option", { text: o, value: o }));
  return s;
};
const projectSel = mkSelect("Project (optional)", labProjects);
const courseSel = mkSelect("Course (optional)", labCourses);

const presets = panel.createDiv({ cls: "lofi-presets" });
const controls = panel.createDiv({ cls: "lofi-controls" });
const start = controls.createEl("button", { cls: "lofi-primary" });
const reset = controls.createEl("button", { cls: "lofi-secondary", text: "Reset" });
const logBtn = controls.createEl("button", { cls: "lofi-secondary", text: "Log session" });
const capture = panel.createEl("input", { cls: "lofi-capture", attr: { placeholder: "Capture a thought..." } });

const render = () => {
  const r = remaining();
  clock.textContent = `${String(Math.floor(r / 60)).padStart(2, "0")}:${String(r % 60).padStart(2, "0")}`;
  start.textContent = state.running ? "Pause" : r < state.duration ? "Resume" : "Start";
  statusLine.textContent = state.running ? "Deep work in progress." : r < state.duration ? "Paused. Pick it back up." : "Ready when you are.";
};
const stop = () => { if (interval) clearInterval(interval); interval = null; };
const elapsedMin = () => Math.max(1, Math.round((state.duration - remaining()) / 60));
[5, 25, 45, 90].forEach(m => {
  presets.createEl("button", { text: `${m}m` }).onclick = () => { stop(); state.duration = m * 60; state.running = false; state.endsAt = 0; save(); render(); };
});
start.onclick = () => {
  if (state.running) { state.duration = remaining(); state.running = false; stop(); }
  else { state.startedAt = state.startedAt || Date.now(); state.endsAt = Date.now() + state.duration * 1000; state.running = true;
         stop(); interval = setInterval(() => { render(); if (remaining() <= 0) finish(); }, 500); }
  save(); render();
};
reset.onclick = () => { stop(); state.running = false; state.duration = 25 * 60; state.endsAt = 0; state.startedAt = 0; start.textContent = "Start"; save(); render(); };
logBtn.onclick = () => H.logFocusSession({ label: label.value.trim() || state.label, minutes: elapsedMin(), project: projectSel.value, course: courseSel.value });
label.onchange = () => { state.label = label.value.trim() || "Deep work"; save(); };
capture.onkeydown = async e => {
  if (e.key !== "Enter" || !capture.value.trim()) return;
  const f = app.vault.getAbstractFileByPath(H.path("Inbox.md"));
  if (f) { await app.vault.append(f, `\n- ${capture.value.trim()} *${window.moment().format("YYYY-MM-DD HH:mm")}*`); capture.value = ""; new Notice("Saved to Lab inbox."); }
};
async function finish() {
  stop(); state.running = false;
  await H.logFocusSession({ label: label.value.trim() || state.label, minutes: elapsedMin(), project: projectSel.value, course: courseSel.value });
  state.duration = 25 * 60; state.startedAt = 0; save(); render();
}
if (files_audio()) {
  const files = app.vault.getFiles().filter(f => /\.(mp3|ogg|wav|m4a)$/i.test(f.path));
  const select = panel.createEl("select", { cls: "lofi-track" });
  files.forEach(f => select.createEl("option", { text: f.name, value: f.path }));
  const audio = panel.createEl("audio", { attr: { controls: true } });
  audio.src = app.vault.adapter.getResourcePath(files[0].path);
  select.onchange = () => audio.src = app.vault.adapter.getResourcePath(select.value);
}
function files_audio() { return app.vault.getFiles().some(f => /\.(mp3|ogg|wav|m4a)$/i.test(f.path)); }
render();
if (state.running) interval = setInterval(() => { render(); if (remaining() <= 0) finish(); }, 500);
})();
```
