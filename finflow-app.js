/* ============================================================
 * FinFlow — premium app (Command Center) + auth + cloud sync
 * ============================================================ */
(function () {
  "use strict";
  var CFG = {
    URL: "https://ldkxbxfmpusekeuozilr.supabase.co",
    KEY: "sb_publishable_vLbs-Tn2bbqWQ4T5CwaqtA_O2NmjE_v",
    BANK: { bank: "BCA", no: "8715431617", name: "Mavra Guher" },
  };
  var sb = window.supabase.createClient(CFG.URL, CFG.KEY);
  try { if (localStorage.getItem("ff_theme") === "light") document.documentElement.setAttribute("data-theme", "light"); } catch (e) {}
  function toggleTheme() { var el = document.documentElement, light = el.getAttribute("data-theme") === "light"; if (light) { el.removeAttribute("data-theme"); } else { el.setAttribute("data-theme", "light"); } try { localStorage.setItem("ff_theme", light ? "dark" : "light"); } catch (e) {} }
  var A = { user: null, company: null, plan: null, features: [], plans: [], sub: null, S: null, view: "dash", busy: false, dirty: false };
  window.FF = A;

  /* ---------- helpers ---------- */
  var root = document.getElementById("root");
  // cursor surrounded by light (premium glow trail)
  (function () {
    var cg = document.getElementById("cursor-glow"); if (!cg) return;
    var x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
    addEventListener("mousemove", function (e) { tx = e.clientX; ty = e.clientY; cg.style.opacity = 1; }, { passive: true });
    addEventListener("mouseout", function (e) { if (!e.relatedTarget) cg.style.opacity = 0; }, { passive: true });
    (function loop() { x += (tx - x) * 0.16; y += (ty - y) * 0.16; cg.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)"; requestAnimationFrame(loop); })();
  })();
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  function rp(n) { return "Rp " + Math.round(n || 0).toLocaleString("id-ID"); }
  function rpShort(n) {
    n = n || 0; var a = Math.abs(n);
    if (a >= 1e9) return "Rp " + (n / 1e9).toLocaleString("id-ID", { maximumFractionDigits: 2 }) + " M";
    if (a >= 1e6) return "Rp " + (n / 1e6).toLocaleString("id-ID", { maximumFractionDigits: 2 }) + " Jt";
    if (a >= 1e3) return "Rp " + (n / 1e3).toLocaleString("id-ID", { maximumFractionDigits: 0 }) + " rb";
    return "Rp " + Math.round(n).toLocaleString("id-ID");
  }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function download(name, content, type) { var b = new Blob(["﻿" + content], { type: type }); var u = URL.createObjectURL(b); var a = document.createElement("a"); a.href = u; a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 200); }
  function csvCell(s) { s = String(s == null ? "" : s); return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
  function toCSV(rows) { return rows.map(function (r) { return r.map(csvCell).join(","); }).join("\r\n"); }
  function printPage() { document.body.classList.add("printing-page"); window.print(); setTimeout(function () { document.body.classList.remove("printing-page"); }, 400); }
  var _actx, _splashIv, _splashGone;
  function thunder() {
    try {
      if (!_actx) _actx = new (window.AudioContext || window.webkitAudioContext)();
      if (_actx.state === "suspended") _actx.resume();
      var ctx = _actx, t0 = ctx.currentTime, sr = ctx.sampleRate;
      // low rumble — filtered noise, long decay
      var dur = 1.7, buf = ctx.createBuffer(1, Math.floor(sr * dur), sr), d = buf.getChannelData(0);
      for (var i = 0; i < d.length; i++) { var p = i / d.length; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - p, 1.7); }
      var src = ctx.createBufferSource(); src.buffer = buf;
      var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.setValueAtTime(720, t0); lp.frequency.exponentialRampToValueAtTime(80, t0 + dur);
      var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.3, t0 + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(lp); lp.connect(g); g.connect(ctx.destination); src.start(t0); src.stop(t0 + dur);
      // sharp crack — short bright noise burst
      var cd = 0.22, cb = ctx.createBuffer(1, Math.floor(sr * cd), sr), cdd = cb.getChannelData(0);
      for (var j = 0; j < cdd.length; j++) { var q = j / cdd.length; cdd[j] = (Math.random() * 2 - 1) * Math.pow(1 - q, 4); }
      var cs = ctx.createBufferSource(); cs.buffer = cb;
      var hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 1400;
      var cg = ctx.createGain(); cg.gain.setValueAtTime(0.2, t0); cg.gain.exponentialRampToValueAtTime(0.0001, t0 + cd);
      cs.connect(hp); hp.connect(cg); cg.connect(ctx.destination); cs.start(t0); cs.stop(t0 + cd);
    } catch (e) {}
  }
  // (suara klik UI dihapus atas permintaan — app senyap)

  // Venom welcome — dijamin berbunyi pada interaksi pertama (browser blokir audio sebelum gesture)
  var _zoomed = false, _venomFired = false;
  function venomZoom() { if (_zoomed) return; _zoomed = true; try { var sl = document.querySelector(".splash-logo"); if (sl) sl.classList.add("zoom"); } catch (e) {} }
  function fireVenom() {
    if (_venomFired) return; _venomFired = true;
    venomZoom();
    bigThunder();
  }
  function bigThunder() {
    try {
      if (!_actx) _actx = new (window.AudioContext || window.webkitAudioContext)();
      if (_actx.state === "suspended") _actx.resume();
      var ctx = _actx, t = ctx.currentTime, sr = ctx.sampleRate;
      var dur = 2.3, buf = ctx.createBuffer(1, Math.floor(sr * dur), sr), d = buf.getChannelData(0);
      for (var i = 0; i < d.length; i++) { var p = i / d.length; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - p, 1.35); }
      var src = ctx.createBufferSource(); src.buffer = buf;
      var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.setValueAtTime(950, t); lp.frequency.exponentialRampToValueAtTime(60, t + dur);
      var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.6, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(lp); lp.connect(g); g.connect(ctx.destination); src.start(t); src.stop(t + dur);
      var cd = 0.32, cb = ctx.createBuffer(1, Math.floor(sr * cd), sr), cdd = cb.getChannelData(0);
      for (var j = 0; j < cdd.length; j++) { var q = j / cdd.length; cdd[j] = (Math.random() * 2 - 1) * Math.pow(1 - q, 3); }
      var cs = ctx.createBufferSource(); cs.buffer = cb;
      var hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 1100;
      var cg = ctx.createGain(); cg.gain.setValueAtTime(0.42, t); cg.gain.exponentialRampToValueAtTime(0.0001, t + cd);
      cs.connect(hp); hp.connect(cg); cg.connect(ctx.destination); cs.start(t); cs.stop(t + cd);
    } catch (e) {}
  }
  function startSplashFX() { /* splash = logo zoom-in murni (CSS), tanpa suara/petir/halo */ }
  var _splashStart = Date.now(), _splashHiding = false;
  function hideSplash() {
    if (_splashHiding) return; _splashHiding = true;
    /* 0.5s diam + 1s efek cahaya logo = 1.5s, lalu langsung ke login */
    var wait = Math.max(0, 1500 - (Date.now() - _splashStart));
    setTimeout(function () {
      _splashGone = true; if (_splashIv) clearInterval(_splashIv);
      var s = document.getElementById("splash"); if (s) { s.style.opacity = 0; setTimeout(function () { s.style.display = "none"; }, 350); }
    }, wait);
  }
  startSplashFX();
  var LOGO = '<img class="fmark" src="assets/finflow-logo-gold.png" alt="FinFlow" />';

  function defState() { return { v: 1, profile: { company: "", npwp: "", type: "jasa" }, tx: [], invoices: [], target: { income: 0, expense: 0 } }; }

  /* ---------- modal ---------- */
  function modal(html, wide) {
    closeModal();
    var ov = document.createElement("div"); ov.className = "ov"; ov.id = "ov";
    ov.innerHTML = '<div class="mcard' + (wide ? " wide" : "") + '">' + html + "</div>";
    document.body.appendChild(ov); return ov;
  }
  function closeModal() { var o = document.getElementById("ov"); if (o) o.remove(); }
  var MBRAND = '<div class="mbrand">' + LOGO + '<div><div class="wm">Fin<span class="f">Flow</span></div><div class="tg">Track · Manage · Grow</div></div></div>';

  /* ================= AUTH ================= */
  var GICON = '<svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-2.6-11.3-7l-6.5 5C9.6 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.6l6.3 5.2C41.4 35.7 44 30.3 44 24c0-1.3-.1-2.3-.4-3.5z"/></svg>';
  function showAuth(up) {
    hideSplash();
    modal(MBRAND +
      '<div class="mh">' + (up ? "Buat akun" : "Selamat datang") + '</div>' +
      '<div class="msub">Akuntansi &amp; pajak Indonesia — premium, tersinkron aman di cloud.</div>' +
      '<button class="mbtn g" id="ag">' + GICON + ' Lanjut dengan Google</button>' +
      '<div class="mor">atau pakai email</div>' +
      (up ? '<div class="fld"><input class="inp" id="an" placeholder="Nama lengkap"></div>' : "") +
      '<div class="fld"><input class="inp" id="ae" type="email" placeholder="Email"></div>' +
      '<div class="fld"><input class="inp" id="ap" type="password" placeholder="Kata sandi"></div>' +
      '<div class="mmsg" id="am"></div>' +
      '<button class="mbtn pri" id="ago">' + (up ? "Daftar sekarang" : "Masuk") + '</button>' +
      '<div class="mfoot">' + (up ? "Sudah punya akun? " : "Belum punya akun? ") + '<span class="mlink" id="asw">' + (up ? "Masuk" : "Daftar gratis") + "</span>" + (up ? "" : ' · <span class="mlink" id="afg">Lupa kata sandi?</span>') + "</div>");
    $("#asw").onclick = function () { showAuth(!up); };
    var fg = $("#afg"); if (fg) fg.onclick = showForgot;
    $("#ag").onclick = function () { sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin } }); };
    var go = $("#ago");
    go.onclick = function () {
      var email = $("#ae").value.trim(), pass = $("#ap").value, m = $("#am");
      m.className = "mmsg err";
      if (!email || !pass) { m.textContent = "Email dan kata sandi wajib diisi."; return; }
      go.disabled = true; go.textContent = "Memproses…";
      var p = up ? sb.auth.signUp({ email: email, password: pass, options: { data: { full_name: ($("#an") || {}).value || "" } } })
        : sb.auth.signInWithPassword({ email: email, password: pass });
      p.then(function (r) {
        if (r.error) throw r.error;
        if (up && !r.data.session) { m.className = "mmsg ok"; m.textContent = "Akun dibuat! Mengarahkan…"; }
      }).catch(function (e) { m.className = "mmsg err"; m.textContent = e.message || String(e); go.disabled = false; go.textContent = up ? "Daftar sekarang" : "Masuk"; });
    };
  }

  function showForgot() {
    modal(MBRAND + '<button class="mx" id="x">×</button><div class="mh">Atur Ulang Kata Sandi</div><div class="msub">Masukkan email akunmu — kami kirim tautan untuk membuat kata sandi baru.</div>' +
      '<div class="fld"><input class="inp" id="fg_e" type="email" placeholder="Email"></div>' +
      '<div class="mmsg" id="fg_m"></div><button class="mbtn pri" id="fg_s">Kirim tautan reset</button>' +
      '<div class="mfoot"><span class="mlink" id="fg_bk">← Kembali ke login</span></div>');
    $("#x").onclick = function () { showAuth(false); };
    $("#fg_bk").onclick = function () { showAuth(false); };
    $("#fg_s").onclick = function () {
      var email = ($("#fg_e").value || "").trim().toLowerCase(), m = $("#fg_m"), b = $("#fg_s");
      m.className = "mmsg err";
      if (!/.+@.+\..+/.test(email)) { m.textContent = "Email tidak valid."; return; }
      b.disabled = true; b.textContent = "Mengirim…";
      sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname }).then(function (r) {
        if (r.error) { m.textContent = r.error.message; b.disabled = false; b.textContent = "Kirim tautan reset"; return; }
        m.className = "mmsg ok"; m.textContent = "Terkirim! Cek inbox (dan folder spam) " + email + ", lalu klik tautannya.";
        b.textContent = "✓ Email terkirim";
      });
    };
  }
  function showSetPassword(fromRecovery) {
    modal(MBRAND + (fromRecovery ? "" : '<button class="mx" id="x">×</button>') + '<div class="mh">Kata Sandi Baru</div><div class="msub">' + (fromRecovery ? "Tautan reset valid — buat kata sandi barumu sekarang." : "Ganti kata sandi akunmu.") + '</div>' +
      '<div class="fld"><input class="inp" id="np_1" type="password" placeholder="Kata sandi baru (min. 6 karakter)"></div>' +
      '<div class="fld"><input class="inp" id="np_2" type="password" placeholder="Ulangi kata sandi baru"></div>' +
      '<div class="mmsg" id="np_m"></div><button class="mbtn pri" id="np_s">Simpan kata sandi</button>');
    var x = $("#x"); if (x) x.onclick = closeModal;
    $("#np_s").onclick = function () {
      var p1 = $("#np_1").value, p2 = $("#np_2").value, m = $("#np_m"), b = $("#np_s");
      m.className = "mmsg err";
      if (p1.length < 6) { m.textContent = "Minimal 6 karakter."; return; }
      if (p1 !== p2) { m.textContent = "Kata sandi tidak sama."; return; }
      b.disabled = true; b.textContent = "Menyimpan…";
      sb.auth.updateUser({ password: p1 }).then(function (r) {
        if (r.error) { m.textContent = r.error.message; b.disabled = false; b.textContent = "Simpan kata sandi"; return; }
        m.className = "mmsg ok"; m.textContent = "✓ Kata sandi diperbarui!";
        setTimeout(function () { closeModal(); if (!A.user) location.reload(); }, 900);
      });
    };
  }

  /* ================= ONBOARDING ================= */
  function ensureCompany() {
    return sb.from("memberships").select("company_id").then(function (r) {
      var ids = (r.data || []).map(function (m) { return m.company_id; });
      if (!ids.length) return showCreate();
      return sb.from("companies").select("*").in("id", ids).then(function (c) {
        A.companies = (c.data || []).sort(function (a, b) { return (a.created_at > b.created_at ? 1 : -1); });
        var sel = null; try { sel = localStorage.getItem("ff_active_company"); } catch (e) {}
        A.company = A.companies.filter(function (x) { return x.id === sel; })[0] || A.companies[0];
        return A.company;
      });
    });
  }
  function switchCompany(id) { try { localStorage.setItem("ff_active_company", id); } catch (e) {} location.reload(); }
  function showCompanies() {
    var rows = (A.companies || []).map(function (c) {
      var active = c.id === A.company.id;
      return '<div class="orow" data-co="' + c.id + '" style="cursor:pointer"><div class="oi" style="background:var(--grad-gold);border:none"><span style="color:#1a1407;font-weight:800;font-size:13px">' + esc((c.name || "?").charAt(0).toUpperCase()) + '</span></div><div style="flex:1"><div class="ot">' + esc(c.name) + '</div><div class="od">' + esc(c.business_type || "") + (c.npwp ? " · " + esc(c.npwp) : "") + '</div></div>' + (active ? '<span class="pill pos" style="margin-left:auto">Aktif</span>' : '<span class="mlink" style="margin-left:auto">Pilih</span>') + "</div>";
    }).join("");
    modal(MBRAND + '<button class="mx" id="x">×</button><div class="mh">Perusahaan / Klien</div><div class="msub">Pilih perusahaan aktif atau tambah klien baru.</div>' + rows + '<button class="mbtn pri" id="addCo" style="margin-top:12px">+ Tambah perusahaan / klien</button>', true);
    $("#x").onclick = closeModal;
    document.querySelectorAll("[data-co]").forEach(function (e) { e.onclick = function () { var id = e.getAttribute("data-co"); if (id !== A.company.id) switchCompany(id); else closeModal(); }; });
    $("#addCo").onclick = function () { closeModal(); A.busy = false; showCreate().then(function (c) { try { localStorage.setItem("ff_active_company", c.id); } catch (e) {} location.reload(); }); };
  }
  function showCreate() {
    hideSplash();
    return new Promise(function (resolve) {
      modal(MBRAND +
        '<div class="mh">Buat perusahaan</div><div class="msub">Profil tenant pertama Anda. Bisa tambah klien lain kapan saja.</div>' +
        '<div class="fld"><label>Nama perusahaan</label><input class="inp" id="cn" placeholder="mis. PT Cipta Nusantara"></div>' +
        '<div class="fld"><label>Jenis usaha</label><select class="inp" id="ct"><option value="jasa">Jasa</option><option value="dagang">Dagang</option><option value="manufaktur">Manufaktur</option></select></div>' +
        '<div class="fld"><label>NPWP (opsional)</label><input class="inp" id="cnp" placeholder="00.000.000.0-000.000"></div>' +
        '<div class="mmsg" id="cm"></div><button class="mbtn pri" id="cs">Simpan &amp; mulai</button>');
      var b = $("#cs");
      b.onclick = function () {
        if (A.busy) return; A.busy = true; b.disabled = true; b.textContent = "Menyimpan…";
        sb.rpc("create_company", { p_name: $("#cn").value.trim() || "Perusahaan Saya", p_business_type: $("#ct").value, p_npwp: $("#cnp").value.trim() || null })
          .then(function (r) { if (r.error) throw r.error; return sb.from("companies").select("*").eq("id", r.data).single(); })
          .then(function (c) { A.company = c.data; A.busy = false; closeModal(); resolve(c.data); })
          .catch(function (e) { A.busy = false; b.disabled = false; b.textContent = "Simpan & mulai"; $("#cm").className = "mmsg err"; $("#cm").textContent = e.message || String(e); });
      };
    });
  }

  /* ================= SUBSCRIPTION ================= */
  function loadSub() {
    return Promise.all([
      sb.from("subscriptions").select("*").eq("company_id", A.company.id).maybeSingle(),
      sb.from("plans").select("*").eq("is_active", true).order("sort"),
    ]).then(function (res) {
      A.sub = res[0].data; A.plans = res[1].data || [];
      var pl = A.plans.filter(function (p) { return p.id === ((A.sub && A.sub.plan_id) || "free"); })[0] || A.plans[0];
      A.plan = pl; A.features = (pl && pl.features) || [];
    });
  }
  function can(f) { return A.features.indexOf(f) >= 0; }

  /* ================= CLOUD SYNC ================= */
  function pull() { return sb.from("company_state").select("data").eq("company_id", A.company.id).maybeSingle(); }
  function push() {
    if (!A.dirty) return Promise.resolve(); A.dirty = false;
    return sb.from("company_state").upsert({ company_id: A.company.id, data: A.S }, { onConflict: "company_id" });
  }
  function save() { A.dirty = true; }
  function initSync() {
    return pull().then(function (r) {
      var d = r.data && r.data.data;
      A.S = (d && d.tx) ? d : defState();
      if (!A.S.profile) A.S.profile = { company: A.company.name, type: A.company.business_type };
      if (!A.S.invoices) A.S.invoices = [];
      if (!A.S.target) A.S.target = { income: 0, expense: 0 };
      if (!A.S.cats) A.S.cats = { inc: CATS.inc.slice(), exp: CATS.exp.slice() };
      if (!A.S.quotes) A.S.quotes = [];
      if (!A.S.purchases) A.S.purchases = [];
      if (!A.S.receipts) A.S.receipts = [];
      if (!A.S.products) A.S.products = [];
      if (!A.S.assets) A.S.assets = [];
      if (!A.S.employees) A.S.employees = [];
      if (!A.S.recurs) A.S.recurs = [];
      if (!A.S.budget) A.S.budget = {};
      checkRecurring();
      if (!d || !d.tx) { A.dirty = true; push(); }
      setInterval(push, 4000);
      window.addEventListener("beforeunload", function () { try { if (A.dirty) navigator.sendBeacon; push(); } catch (e) {} });
    });
  }

  /* ================= DATA / METRICS ================= */
  var CATS = { inc: ["Penjualan", "Jasa", "Pendapatan Lain"], exp: ["Pembelian", "Gaji", "Sewa", "Operasional", "Pajak", "Lain-lain"] };
  function catsFor(kind) { var c = (A.S && A.S.cats && A.S.cats[kind]) || CATS[kind]; return c.length ? c : CATS[kind]; }
  function metrics() {
    var tx = A.S.tx, inc = 0, exp = 0; for (var i = 0; i < tx.length; i++) { if (tx[i].kind === "inc") inc += tx[i].amount; else exp += tx[i].amount; }
    return { inc: inc, exp: exp, laba: inc - exp, n: tx.length };
  }
  function byMonthN(n) {
    var m = {}, now = new Date(), keys = [];
    for (var i = n - 1; i >= 0; i--) { var d = new Date(now.getFullYear(), now.getMonth() - i, 1); var k = d.getFullYear() + "-" + (d.getMonth() + 1); m[k] = { inc: 0, exp: 0, net: 0, lab: d.toLocaleDateString("id-ID", { month: "short" }), full: d.toLocaleDateString("id-ID", { month: "long", year: "numeric" }) }; keys.push(k); }
    A.S.tx.forEach(function (t) { var d = new Date(t.date); var k = d.getFullYear() + "-" + (d.getMonth() + 1); if (m[k]) { if (t.kind === "inc") { m[k].inc += t.amount; m[k].net += t.amount; } else { m[k].exp += t.amount; m[k].net -= t.amount; } } });
    return keys.map(function (k) { return m[k]; });
  }
  function byMonth() { return byMonthN(6); }
  function expByCat() {
    var m = {}; A.S.tx.forEach(function (t) { if (t.kind === "exp") m[t.cat] = (m[t.cat] || 0) + t.amount; });
    return Object.keys(m).map(function (k) { return { cat: k, v: m[k] }; }).sort(function (a, b) { return b.v - a.v; });
  }

  /* ================= SHELL ================= */
  var NAV = [
    { g: "Utama" },
    { id: "dash", t: "Command Center", f: null, ic: '<path d="M3 9l9-7 9 7v11a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>' },
    { id: "clients", t: "Semua Klien", f: null, ic: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>' },
    { g: "Finance Hub" },
    { id: "ledger", t: "Buku Besar", f: null, ic: '<path d="M4 6h16M4 12h16M4 18h10"/>' },
    { id: "accounts", t: "Account Architecture", f: null, ic: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>' },
    { id: "invoice", t: "Invoice", f: null, ic: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>' },
    { id: "pnl", t: "Laba Rugi", f: null, ic: '<path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/>' },
    { id: "cashflow", t: "Arus Kas", f: null, ic: '<path d="M3 7h13l-3-3M21 17H8l3 3M3 12h18"/>' },
    { id: "insights", t: "Financial Insights", f: "ai_assistant", ic: '<path d="M3 3v18h18"/><path d="M7 12l3 3 7-8"/>' },
    { g: "Dokumen" },
    { id: "penawaran", t: "Penawaran", f: null, ic: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 13h6M9 16h6"/>' },
    { id: "po", t: "Purchase Order", f: null, ic: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>' },
    { id: "kuitansi", t: "Kuitansi", f: null, ic: '<path d="M4 3h16v18l-2-1-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/><path d="M8 8h8M8 12h6"/>' },
    { id: "katalog", t: "Katalog Produk", f: null, ic: '<path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>' },
    { g: "Operasional" },
    { id: "aset", t: "Aset & Depresiasi", f: null, ic: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>' },
    { id: "payroll", t: "Payroll", f: null, ic: '<circle cx="9" cy="7" r="4"/><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><path d="M19 8v6M22 11h-6"/>' },
    { id: "recurring", t: "Transaksi Berulang", f: null, ic: '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>' },
    { id: "anggaran", t: "Anggaran", f: null, ic: '<path d="M3 12a9 9 0 1 0 9-9v9z"/><path d="M12 3v9l6.5 6.5"/>' },
    { g: "Pajak" },
    { id: "tax", t: "Tax Command", f: "tax_engine", ic: '<path d="M12 3v18M5 8h14M5 8l-2 5h4zM19 8l-2 5h4z"/>' },
    { id: "calendar", t: "Compliance Calendar", f: "tax_calendar", ic: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>' },
    { id: "compliance", t: "Compliance Index", f: null, ic: '<path d="M12 3l8 4v5c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V7z"/><path d="M9 12l2 2 4-4"/>' },
    { g: "Kepatuhan" },
    { id: "resolution", t: "Resolution Center", f: null, ic: '<path d="M12 16V4M7 9l5-5 5 5M5 20h14"/>' },
    { id: "coretax", t: "Coretax Hub", f: "tax_engine", ic: '<path d="M21 12a9 9 0 1 1-3-6.7M21 4v4h-4"/>' },
    { g: "Tim" },
    { id: "team", t: "Anggota Tim", f: null, ic: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>' },
  ];
  function shell(inner, crumb) {
    var co = A.company || {}, mk = (co.name || "F").charAt(0).toUpperCase();
    var sbc = false; try { sbc = localStorage.getItem("ff_sbc") === "1"; } catch (e) {}
    var nav = NAV.map(function (n) {
      if (n.g) return '<div class="navg">' + n.g + "</div>";
      var locked = n.f && !can(n.f);
      return '<a class="ni' + (A.view === n.id ? " on" : "") + '" data-v="' + n.id + '"' + (sbc ? ' title="' + esc(n.t) + '"' : "") + '><svg viewBox="0 0 24 24">' + n.ic + '</svg> <span class="txt">' + n.t + "</span>" + (locked ? '<span class="lk">PRO</span>' : "") + "</a>";
    }).join("");
    var um = (A.user && A.user.email || "U").charAt(0).toUpperCase();
    function bn(id, lbl, ic) { return '<a data-v="' + id + '"' + (A.view === id ? ' class="on"' : "") + '><svg viewBox="0 0 24 24">' + ic + "</svg>" + lbl + "</a>"; }
    root.innerHTML =
      '<div class="app' + (sbc ? " sbc" : "") + '"><aside class="side" id="side">' +
        '<div class="brand" data-v="dash">' + LOGO + '<div class="wm">Fin<span class="f">Flow</span></div></div>' +
        '<div class="ws" id="wsBtn">' + ((A.S && A.S.profile && A.S.profile.logo) ? '<span class="mk" style="background:none;box-shadow:none;overflow:hidden;padding:0"><img src="' + A.S.profile.logo + '" style="width:26px;height:26px;object-fit:cover;border-radius:7px"></span>' : '<span class="mk">' + mk + "</span>") + '<div class="nm">' + esc(co.name || "Perusahaan") + '<small>' + esc((co.business_type || "jasa")) + " · " + (A.plan ? esc(A.plan.name) : "") + '</small></div><svg class="cx" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></div>' +
        nav +
        '<a class="ni sbt" id="sbT"><svg viewBox="0 0 24 24">' + (sbc ? '<path d="M13 17l5-5-5-5M6 17l5-5-5-5"/>' : '<path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/>') + '</svg> <span class="txt" id="sbtLbl">Perkecil menu</span></a>' +
        '<div class="spacer"></div>' +
        '<div class="me" id="meBtn"><span class="av">' + um + '</span><div class="nm">' + esc((A.user && A.user.email || "").split("@")[0]) + '<small>' + (A.plan ? esc(A.plan.name) : "Free") + '</small></div></div>' +
      "</aside>" +
      '<div class="main"><div class="top">' +
        '<div class="menub" id="mb"><svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg></div>' +
        '<div class="crumb"><b>' + esc(crumb) + "</b></div><div class=\"grow\"></div>" +
        '<div class="ic-btn" id="schBtn" title="Cari (Ctrl+K)"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg></div>' +
        '<div class="ic-btn" id="bellBtn" title="Pengingat pajak"><svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>' + (function () { var n = deadlines().list.filter(function (o) { return o.days <= 7; }).length; return n ? '<span style="position:absolute;top:3px;right:4px;min-width:15px;height:15px;padding:0 3px;border-radius:8px;background:var(--neg);color:#fff;font-size:9px;font-weight:700;display:grid;place-items:center;line-height:1">' + n + "</span>" : ""; })() + "</div>" +
        '<div class="ic-btn" id="thBtn" title="Tema terang/gelap"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19"/></svg></div>' +
        '<div class="ic-btn" id="addTop" title="Buat baru"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></div>' +
      "</div>" + inner + "</div>" +
      '<nav class="bnav">' +
        bn("dash", "Beranda", '<path d="M3 9l9-7 9 7v11a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>') +
        bn("ledger", "Buku", '<path d="M4 6h16M4 12h16M4 18h10"/>') +
        '<a class="fab" id="bnAdd"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></a>' +
        bn("invoice", "Invoice", '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>') +
        bn("tax", "Pajak", '<path d="M12 3v18M5 8h14M5 8l-2 5h4zM19 8l-2 5h4z"/>') +
      "</nav></div>";
    // wire
    root.querySelectorAll("[data-v]").forEach(function (e) {
      e.onclick = function () {
        var v = e.getAttribute("data-v"); var nv = NAV.filter(function (x) { return x.id === v; })[0];
        if (nv && nv.f && !can(nv.f)) { showPlans(); return; }
        A.view = v; render(); var sd = $("#side"); if (sd) sd.classList.remove("open");
      };
    });
    $("#mb").onclick = function () { $("#side").classList.toggle("open"); };
    $("#meBtn").onclick = showAccount; $("#wsBtn").onclick = showCompanies;
    $("#addTop").onclick = openCreateMenu;
    var _bn = $("#bnAdd"); if (_bn) _bn.onclick = openCreateMenu;
    var _sc = $("#schBtn"); if (_sc) _sc.onclick = openSearch;
    var _sb = $("#sbT"); if (_sb) _sb.onclick = toggleSB;
    var _th = $("#thBtn"); if (_th) _th.onclick = toggleTheme;
    var _bl = $("#bellBtn"); if (_bl) _bl.onclick = showReminders;
  }

  /* ================= VIEWS ================= */
  function render() {
    if (A.view === "dash") return viewDash();
    if (A.view === "ledger") return viewLedger();
    if (A.view === "pnl") return viewPnl();
    if (A.view === "tax") return viewTax();
    if (A.view === "calendar") return viewCalendar();
    if (A.view === "coretax") return viewCoretax();
    if (A.view === "insights") return viewInsights();
    if (A.view === "compliance") return viewCompliance();
    if (A.view === "accounts") return viewAccounts();
    if (A.view === "resolution") return viewResolution();
    if (A.view === "invoice") return viewInvoice();
    if (A.view === "team") return viewTeam();
    if (A.view === "clients") return viewClients();
    if (A.view === "cashflow") return viewCashflow();
    if (A.view === "penawaran") return viewPenawaran();
    if (A.view === "po") return viewPO();
    if (A.view === "kuitansi") return viewKuitansi();
    if (A.view === "katalog") return viewKatalog();
    if (A.view === "aset") return viewAset();
    if (A.view === "payroll") return viewPayroll();
    if (A.view === "recurring") return viewRecurring();
    if (A.view === "anggaran") return viewAnggaran();
    return viewSoon();
  }

  function viewDash() {
    var m = metrics(), mm = byMonth(), ex = expByCat();
    var name = (A.user && A.user.email || "").split("@")[0];
    // trend chart
    var maxV = Math.max.apply(null, mm.map(function (x) { return x.inc; }).concat([1]));
    var W = 620, H = 200, pad = 30, step = (W - 50) / 5;
    function pts(key) { return mm.map(function (d, i) { return [50 + i * step, H - pad - (d[key] / maxV) * (H - pad - 20)]; }); }
    function path(p) { return p.map(function (c, i) { return (i ? "L" : "M") + c[0].toFixed(0) + " " + c[1].toFixed(0); }).join(" "); }
    var incP = pts("inc"), area = path(incP) + " L" + (50 + 5 * step) + " " + (H - pad) + " L50 " + (H - pad) + " Z";
    var hasTx = m.n > 0;
    // donut for expenses
    var totalEx = ex.reduce(function (a, b) { return a + b.v; }, 0) || 1;
    var colors = ["#d4af37", "#7d93c8", "#62cf90", "#e0726a", "#a78bd0", "#3f4659"];
    var off = 0, circ = 2 * Math.PI * 46;
    var donut = ex.slice(0, 6).map(function (e, i) { var frac = e.v / totalEx; var dash = frac * circ; var seg = '<circle cx="60" cy="60" r="46" fill="none" stroke="' + colors[i % 6] + '" stroke-width="16" stroke-dasharray="' + dash.toFixed(1) + " " + (circ - dash).toFixed(1) + '" stroke-dashoffset="' + (-off).toFixed(1) + '" transform="rotate(-90 60 60)"/>'; off += dash; return seg; }).join("");
    var legend = ex.slice(0, 6).map(function (e, i) { return '<div class="lr"><span class="sw" style="background:' + colors[i % 6] + '"></span><span class="nm">' + esc(e.cat) + '</span><span class="vl">' + Math.round(e.v / totalEx * 100) + "%</span></div>"; }).join("") || '<div class="lr" style="color:var(--faint)">Belum ada beban</div>';
    var recent = A.S.tx.slice().sort(function (a, b) { return (b.date > a.date ? 1 : -1); }).slice(0, 6).map(function (t) {
      return '<div class="orow"><div class="oi ' + t.kind + '"><svg viewBox="0 0 24 24">' + (t.kind === "inc" ? '<path d="M12 19V5M5 12l7-7 7 7"/>' : '<path d="M12 5v14M5 12l7 7 7-7"/>') + '</svg></div><div><div class="ot">' + esc(t.note || t.cat) + '</div><div class="od">' + esc(t.cat) + " · " + new Date(t.date).toLocaleDateString("id-ID") + '</div></div><span class="amt ' + t.kind + '">' + (t.kind === "inc" ? "+" : "−") + rp(t.amount) + "</span></div>";
    }).join("") || '<div class="empty">Belum ada transaksi. Klik <b>Catat Pergerakan</b> untuk memulai.</div>';
    // tax estimate (PPh Final UMKM 0.5%)
    var pphFinal = m.inc * 0.005;
    var mthM = (function () { var now = new Date(), y = now.getFullYear(), mo = now.getMonth(), i = 0, e = 0; A.S.tx.forEach(function (t) { var d = new Date(t.date); if (d.getFullYear() === y && d.getMonth() === mo) { if (t.kind === "inc") i += t.amount; else e += t.amount; } }); return { inc: i, exp: e }; })();
    function tgtBar(lbl, val, target, col) { target = target || 0; var pct = target ? Math.min(100, Math.round(val / target * 100)) : 0; return '<div><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:7px"><span style="color:var(--soft)">' + lbl + '</span><span style="font-family:var(--mono);color:var(--val)">' + rp(val) + (target ? " / " + rp(target) : "") + '</span></div><div style="height:9px;background:rgba(128,128,128,.2);border-radius:5px;overflow:hidden"><div style="height:100%;width:' + pct + '%;background:' + col + ';border-radius:5px;transition:width .6s cubic-bezier(.2,.8,.2,1)"></div></div><div style="font-size:11px;color:var(--faint);margin-top:5px">' + (target ? pct + "% tercapai bulan ini" : 'Belum diatur — klik "Atur target"') + "</div></div>"; }
    var inner = '<div class="content">' +
      '<div class="phead"><div><div class="pt">Selamat datang kembali, ' + esc(name) + '</div><div class="ps">Posisi keuangan ' + esc(A.company.name) + ' — ' + new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" }) + '.</div></div>' +
      '<div class="acts"><button class="btn pri" id="addBtn"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg> Catat Pergerakan</button></div></div>' +
      '<div class="kpis">' +
        kpi("Total Pendapatan", rpShort(m.inc), '<path d="M3 17l5-5 4 4 8-8M16 8h4v4"/>', "up", "akumulasi") +
        kpi("Total Beban", rpShort(m.exp), '<path d="M3 7l5 5 4-4 8 8M16 16h4v-4"/>', "dn", "akumulasi") +
        kpi("Laba Bersih", rpShort(m.laba), '<circle cx="12" cy="9" r="6"/><path d="M9 14.5 7.5 22l4.5-2.5L16.5 22 15 14.5"/>', m.laba >= 0 ? "up" : "dn", "pendapatan − beban") +
        kpi("Est. PPh Final", rpShort(pphFinal), '<path d="M12 3v18M5 8h14M5 8l-2 5h4zM19 8l-2 5h4z"/>', "up", "0,5% × omzet (PP 23)") +
      "</div>" +
      '<div class="grid2"><div class="card"><div class="card-h"><h3>Tren Pendapatan &amp; Laba Bersih</h3><div class="lg"><span><i style="background:var(--gold)"></i>Pendapatan</span><span><i style="background:#7d93c8"></i>Laba</span></div></div>' +
        '<div class="chart-wrap"><svg viewBox="0 0 ' + W + " " + H + '" width="100%" style="display:block">' +
          '<g stroke="rgba(255,255,255,0.05)"><line x1="50" y1="40" x2="' + W + '" y2="40"/><line x1="50" y1="100" x2="' + W + '" y2="100"/><line x1="50" y1="160" x2="' + W + '" y2="160"/></g>' +
          (hasTx ? '<path class="af" d="' + area + '" fill="url(#area)"/><path class="ld" d="' + path(incP) + '" fill="none" stroke="url(#g)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path class="ld" d="' + path(pts("net")) + '" fill="none" stroke="#7d93c8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' : '') +
          '<g font-family="JetBrains Mono" font-size="10" fill="#6c6a62" text-anchor="middle">' + mm.map(function (d, i) { return '<text x="' + (50 + i * step) + '" y="' + (H - 8) + '">' + d.lab + "</text>"; }).join("") + "</g>" +
        "</svg></div></div>" +
        '<div class="card"><div class="card-h"><h3>Komposisi Beban</h3><span class="hint">akumulasi</span></div><div class="donut-wrap">' +
          '<svg viewBox="0 0 120 120" width="124" height="124" style="flex-shrink:0"><circle cx="60" cy="60" r="46" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="16"/>' + donut + '<text x="60" y="56" text-anchor="middle" font-family="Cormorant Garamond" font-size="18" font-weight="600" style="fill:var(--val)">' + rpShort(totalEx).replace("Rp ", "") + '</text><text x="60" y="71" text-anchor="middle" font-family="Schibsted Grotesk" font-size="7" fill="#6c6a62">TOTAL BEBAN</text></svg>' +
          '<div class="legend">' + legend + "</div></div></div></div>" +
      '<div class="grid2"><div class="card"><div class="card-h"><h3>Transaksi Terbaru</h3><span class="hint">' + m.n + ' transaksi</span></div><div>' + recent + '</div><div class="footrow"><a data-go="ledger">Lihat buku besar →</a></div></div>' +
        '<div class="card"><div class="card-h"><h3>Kewajiban Pajak (estimasi)</h3><span class="hint">informasional</span></div>' +
          '<div class="orow"><div class="oi exp"><svg viewBox="0 0 24 24"><path d="M12 3v18M5 8h14"/></svg></div><div><div class="ot">PPh Final UMKM 0,5%</div><div class="od">PP 23 · dari omzet bruto</div></div><span class="amt">' + rp(pphFinal) + '</span></div>' +
          '<div class="orow"><div class="oi exp"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2"/></svg></div><div><div class="ot">PPN 11% (jika PKP)</div><div class="od">estimasi dari pendapatan</div></div><span class="amt">' + rp(m.inc * 0.11) + '</span></div>' +
          '<div class="footrow"><a data-go="tax">Buka Tax Command →</a></div></div></div>' +
      '<div class="card" style="margin-top:16px"><div class="card-h"><h3>Target &amp; Budget Bulan Ini</h3><span class="mlink" id="setTgt" style="margin-left:auto;cursor:pointer">Atur target</span></div><div style="padding:18px 20px;display:grid;grid-template-columns:1fr 1fr;gap:24px">' + tgtBar("Pendapatan", mthM.inc, (A.S.target || {}).income, "var(--pos)") + tgtBar("Beban (budget)", mthM.exp, (A.S.target || {}).expense, "var(--neg)") + "</div></div>" +
      "</div>";
    shell(inner, "Command Center");
    $("#addBtn").onclick = showAddTx;
    var _st = $("#setTgt"); if (_st) _st.onclick = showTarget;
    root.querySelectorAll("[data-go]").forEach(function (e) { e.onclick = function () { var v = e.getAttribute("data-go"); var nv = NAV.filter(function (x) { return x.id === v; })[0]; if (nv && nv.f && !can(nv.f)) return showPlans(); A.view = v; render(); }; });
  }
  function kpi(lab, val, ic, dir, since) {
    return '<div class="card kpi"><div class="ktop"><div class="ico"><svg viewBox="0 0 24 24">' + ic + '</svg></div><div class="lab">' + lab + '</div></div><div class="val">' + val + '</div><div class="chg ' + dir + '"><span class="since">' + since + "</span></div></div>";
  }

  function viewLedger() {
    var kind = A.ledgerKind || "all";
    var all = A.S.tx.slice().sort(function (a, b) { return (b.date > a.date ? 1 : (b.date < a.date ? -1 : 0)); });
    var tx = kind === "all" ? all : all.filter(function (t) { return t.kind === kind; });
    var rows = tx.map(function (t) {
      var sdata = ((t.note || "") + " " + t.cat).toLowerCase();
      return '<tr data-s="' + esc(sdata) + '"><td>' + new Date(t.date).toLocaleDateString("id-ID") + '</td><td><span class="m">' + esc(t.note || "-") + "</span></td><td>" + esc(t.cat) + '</td><td style="color:' + (t.kind === "inc" ? "var(--pos)" : "var(--neg)") + '">' + (t.kind === "inc" ? "Masuk" : "Keluar") + '</td><td style="text-align:right;font-family:var(--mono);color:var(--val)">' + rp(t.amount) + '</td><td style="text-align:right"><span class="mlink" data-del="' + t.id + '" style="color:var(--neg)">hapus</span></td></tr>';
    }).join("");
    var lseg = '<div style="display:inline-flex;border:1px solid var(--line);border-radius:9px;overflow:hidden">' + [["all", "Semua"], ["inc", "Masuk"], ["exp", "Keluar"]].map(function (x) { return '<span data-k="' + x[0] + '" style="padding:8px 13px;font-size:12px;cursor:pointer;border-right:1px solid var(--line);' + (x[0] === kind ? "background:var(--grad-gold);color:#1a1407;font-weight:700" : "color:var(--soft)") + '">' + x[1] + "</span>"; }).join("") + "</div>";
    var ltoolbar = '<div style="padding:13px 18px;display:flex;gap:10px;align-items:center;border-bottom:1px solid var(--line);flex-wrap:wrap"><input class="inp" id="ledgerQ" placeholder="Cari keterangan / kategori…" style="flex:1;min-width:180px;max-width:340px;padding:9px 13px">' + lseg + "</div>";
    var inner = '<div class="content"><div class="phead"><div><div class="pt">Buku Besar</div><div class="ps">Semua pergerakan kas perusahaan.</div></div><div class="acts"><button class="btn" id="expX"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg> Excel</button><button class="btn" id="expP"><svg viewBox="0 0 24 24"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/></svg> PDF</button><button class="btn" id="impBtn"><svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg> Impor</button><button class="btn pri" id="addBtn"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg> Catat Pergerakan</button></div></div>' +
      '<div class="card">' + ltoolbar + (tx.length ? '<table class="tbl"><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th>Jenis</th><th style="text-align:right">Jumlah</th><th></th></tr></thead><tbody>' + rows + '</tbody></table><div class="empty" id="ledgerNone" style="display:none">Tidak ada hasil pencarian.</div>' : '<div class="empty">Belum ada transaksi pada filter ini.</div>') + "</div></div>";
    shell(inner, "Buku Besar");
    $("#addBtn").onclick = showAddTx;
    $("#impBtn").onclick = showImport;
    $("#expP").onclick = printPage;
    $("#expX").onclick = function () {
      var r = [["Tanggal", "Keterangan", "Kategori", "Jenis", "Jumlah"]];
      tx.forEach(function (t) { r.push([t.date, t.note || "", t.cat, t.kind === "inc" ? "Masuk" : "Keluar", t.amount]); });
      download("buku-besar-" + (A.company.name || "finflow") + ".csv", toCSV(r), "text/csv;charset=utf-8");
    };
    root.querySelectorAll("[data-k]").forEach(function (e) { e.onclick = function () { A.ledgerKind = e.getAttribute("data-k"); render(); }; });
    var lq = $("#ledgerQ"); if (lq) lq.oninput = function () { var v = lq.value.toLowerCase().trim(), trs = root.querySelectorAll("tbody tr[data-s]"), shown = 0; trs.forEach(function (tr) { var ok = !v || tr.getAttribute("data-s").indexOf(v) >= 0; tr.style.display = ok ? "" : "none"; if (ok) shown++; }); var none = $("#ledgerNone"); if (none) none.style.display = (trs.length && !shown) ? "" : "none"; };
    root.querySelectorAll("[data-del]").forEach(function (e) { e.onclick = function () { var id = e.getAttribute("data-del"); A.S.tx = A.S.tx.filter(function (t) { return t.id !== id; }); save(); render(); }; });
  }

  function viewPnl() {
    var inc = {}, exp = {}, ti = 0, te = 0;
    A.S.tx.forEach(function (t) { if (t.kind === "inc") { inc[t.cat] = (inc[t.cat] || 0) + t.amount; ti += t.amount; } else { exp[t.cat] = (exp[t.cat] || 0) + t.amount; te += t.amount; } });
    function rows(o) { return Object.keys(o).map(function (k) { return '<tr><td>' + esc(k) + '</td><td style="text-align:right;font-family:var(--mono);color:var(--val)">' + rp(o[k]) + "</td></tr>"; }).join("") || '<tr><td colspan="2" style="color:var(--faint)">—</td></tr>'; }
    var inner = '<div class="content"><div class="phead"><div><div class="pt">Laporan Laba Rugi</div><div class="ps">Ringkasan pendapatan dan beban · ' + new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" }) + '.</div></div><div class="acts"><button class="btn" id="expX"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg> Excel</button><button class="btn" id="expP"><svg viewBox="0 0 24 24"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/></svg> PDF</button></div></div>' +
      '<div class="card" style="max-width:640px"><table class="tbl"><thead><tr><th>Pendapatan</th><th style="text-align:right">Jumlah</th></tr></thead><tbody>' + rows(inc) +
      '<tr><td class="m" style="color:var(--pos)">Total Pendapatan</td><td style="text-align:right;font-family:var(--mono);color:var(--pos)">' + rp(ti) + '</td></tr></tbody></table>' +
      '<table class="tbl"><thead><tr><th>Beban</th><th style="text-align:right">Jumlah</th></tr></thead><tbody>' + rows(exp) +
      '<tr><td class="m" style="color:var(--neg)">Total Beban</td><td style="text-align:right;font-family:var(--mono);color:var(--neg)">' + rp(te) + '</td></tr></tbody></table>' +
      '<div style="padding:18px 20px;border-top:1px solid var(--line-gold);display:flex;align-items:center"><div style="font-family:var(--disp);font-size:18px">Laba Bersih</div><div style="margin-left:auto;font-family:var(--disp);font-size:26px;color:' + (ti - te >= 0 ? "var(--pos)" : "var(--neg)") + '">' + rp(ti - te) + '</div></div></div></div>';
    shell(inner, "Laba Rugi");
    $("#expP").onclick = printPage;
    $("#expX").onclick = function () {
      var rows = [["LAPORAN LABA RUGI", A.company.name || ""], [], ["Pendapatan", "Jumlah"]];
      Object.keys(inc).forEach(function (k) { rows.push([k, inc[k]]); }); rows.push(["Total Pendapatan", ti], []);
      rows.push(["Beban", "Jumlah"]); Object.keys(exp).forEach(function (k) { rows.push([k, exp[k]]); }); rows.push(["Total Beban", te], [], ["Laba Bersih", ti - te]);
      download("laba-rugi-" + (A.company.name || "finflow") + ".csv", toCSV(rows), "text/csv;charset=utf-8");
    };
  }

  function viewTax() {
    var m = metrics();
    var inner = '<div class="content"><div class="phead"><div><div class="pt">Tax Command</div><div class="ps">Estimasi kewajiban pajak berdasarkan transaksi.</div></div></div>' +
      '<div class="kpis">' +
        kpi("Omzet Bruto", rpShort(m.inc), '<path d="M3 17l5-5 4 4 8-8"/>', "up", "akumulasi") +
        kpi("PPh Final 0,5%", rpShort(m.inc * 0.005), '<path d="M12 3v18M5 8h14"/>', "up", "PP 23") +
        kpi("PPN Keluaran 11%", rpShort(m.inc * 0.11), '<rect x="3" y="4" width="18" height="17" rx="2"/>', "up", "jika PKP") +
        kpi("Est. Pajak Penghasilan", rpShort(Math.max(0, m.laba) * 0.11), '<path d="M12 3l8 4v5c0 5-3.5 7.5-8 9"/>', "up", "11% laba (UMKM badan)") +
      '</div><div class="card"><div class="card-h"><h3>Catatan</h3></div><div style="padding:18px 20px;color:var(--soft);font-size:13.5px;line-height:1.6">Angka di atas adalah <b style="color:var(--ink)">estimasi</b> untuk perencanaan, bukan nasihat pajak resmi. Tarif final UMKM 0,5% (PP 23) berlaku untuk peredaran bruto tertentu; PPN hanya untuk Pengusaha Kena Pajak. Verifikasi dengan peraturan terbaru atau konsultan pajak sebelum pelaporan.</div></div></div>';
    shell(inner, "Tax Command");
  }

  function deadlines() {
    var m = metrics(), now = new Date(), Y = now.getFullYear(), M = now.getMonth();
    var nm = new Date(Y, M + 1, 1), lastDay = new Date(Y, M + 2, 0).getDate();
    function due(day) { return new Date(Y, M + 1, day); }
    var periodLbl = now.toLocaleDateString("id-ID", { month: "long" });
    var list = [
      { t: "Setor PPh 21 & 23", s: "Masa " + periodLbl, amt: 0, due: due(10), day: 10 },
      { t: "PPh Final UMKM 0,5%", s: "PP 23 · masa " + periodLbl, amt: m.inc * 0.005, due: due(15), day: 15 },
      { t: "Lapor SPT Masa Unifikasi", s: "PPh 21/23 · masa " + periodLbl, amt: 0, due: due(20), day: 20 },
      { t: "SPT Masa PPN (jika PKP)", s: "Pajak Keluaran · masa " + periodLbl, amt: m.inc * 0.11, due: due(lastDay), day: lastDay },
    ];
    list.forEach(function (o) { o.days = Math.ceil((o.due - now) / 86400000); o.cls = o.days < 0 ? "neg" : (o.days <= 3 ? "neg" : (o.days <= 10 ? "warn" : "pos")); o.lbl = o.days < 0 ? "Lewat" : "H-" + o.days; });
    return { list: list, nmName: nm.toLocaleDateString("id-ID", { month: "long", year: "numeric" }), nm: nm, lastDay: lastDay, Y: Y, M: M + 1, total: list.reduce(function (a, b) { return a + b.amt; }, 0) };
  }

  function viewCalendar() {
    var D = deadlines();
    var dueDays = {}; D.list.forEach(function (o) { (dueDays[o.day] = dueDays[o.day] || []).push(o); });
    var first = new Date(D.Y, D.M - 1, 1).getDay(); var off = (first === 0 ? 6 : first - 1); // Mon-first
    var cells = "";
    for (var i = 0; i < off; i++) cells += '<div></div>';
    for (var d = 1; d <= D.lastDay; d++) {
      var has = dueDays[d];
      cells += '<div style="aspect-ratio:1;border:1px solid ' + (has ? "var(--line-gold)" : "var(--line-2)") + ';border-radius:9px;padding:6px 7px;background:' + (has ? "rgba(212,175,55,.08)" : "transparent") + '"><div style="font-size:12px;color:' + (has ? "var(--gold-lt)" : "var(--soft)") + ';font-weight:600">' + d + "</div>" + (has ? '<div style="font-size:8.5px;color:var(--faint);margin-top:2px;line-height:1.2">' + has.map(function (x) { return x.t.split(" ").slice(0, 2).join(" "); }).join("<br>") + "</div>" : "") + "</div>";
    }
    var rows = D.list.slice().sort(function (a, b) { return a.due - b.due; }).map(function (o) {
      return '<div class="orow"><div class="oi exp"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></div><div><div class="ot">' + esc(o.t) + '</div><div class="od">' + esc(o.s) + " · jatuh tempo " + o.due.toLocaleDateString("id-ID", { day: "numeric", month: "short" }) + '</div></div>' + (o.amt ? '<span class="amt">' + rp(o.amt) + "</span>" : "") + '<span class="pill ' + o.cls + '" style="margin-left:13px">' + o.lbl + "</span></div>";
    }).join("");
    var nearest = D.list.slice().sort(function (a, b) { return a.due - b.due; })[0];
    var inner = '<div class="content"><div class="phead"><div><div class="pt">Compliance Calendar</div><div class="ps">Tak ada tenggat yang terlewat — diingatkan H-10, H-7, H-3, H-1.</div></div></div>' +
      '<div class="kpis">' +
        kpi("Total Kewajiban", rpShort(D.total), '<path d="M12 3v18M5 8h14"/>', "up", "masa berjalan") +
        kpi("Deadline Terdekat", (nearest ? nearest.lbl : "-"), '<circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/>', nearest && nearest.days <= 3 ? "dn" : "up", nearest ? nearest.due.toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "") +
        kpi("Jumlah Kewajiban", String(D.list.length), '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>', "up", "perlu tindakan") +
        kpi("Periode", new Date().toLocaleDateString("id-ID", { month: "short" }), '<rect x="3" y="4" width="18" height="17" rx="2"/>', "up", String(new Date().getFullYear())) +
      "</div>" +
      '<div class="grid2"><div class="card"><div class="card-h"><h3>' + esc(D.nmName) + '</h3><span class="hint">jatuh tempo</span></div><div style="padding:14px 18px"><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-bottom:8px;font-size:10px;color:var(--faint);text-align:center">' + ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map(function (x) { return "<div>" + x + "</div>"; }).join("") + '</div><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">' + cells + "</div></div></div>" +
        '<div class="card"><div class="card-h"><h3>Kewajiban Terdekat</h3></div><div>' + rows + '</div></div></div></div>';
    shell(inner, "Compliance Calendar");
  }

  function viewCoretax() {
    var m = metrics(), co = A.company || {};
    function row(l, v, st) { return '<div class="orow"><div><div class="ot">' + esc(l) + '</div><div class="od">' + esc(v) + '</div></div>' + (st ? '<span class="pill pos" style="margin-left:auto">' + st + "</span>" : "") + "</div>"; }
    var inner = '<div class="content"><div class="phead"><div><div class="pt">Coretax Hub</div><div class="ps">Data dirapikan FinFlow — tinggal satu langkah ke portal Coretax DJP.</div></div>' +
      '<div class="acts"><a class="btn pri" href="https://coretaxdjp.pajak.go.id" target="_blank" rel="noopener"><svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-3-6.7M21 4v4h-4"/></svg> Buka Coretax DJP</a></div></div>' +
      '<div class="grid2"><div class="card"><div class="card-h"><h3>Profil Wajib Pajak</h3><span class="pill pos">Terverifikasi</span></div>' +
        row("Nama", co.name || "-", "") + row("NPWP", co.npwp || "Belum diisi", "") + row("Jenis Usaha", co.business_type || "-", "") + row("Masa Pajak", new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" }), "") +
      "</div>" +
      '<div class="card"><div class="card-h"><h3>Paket Data Siap Lapor</h3><span class="hint">dari pembukuan</span></div>' +
        row("Laporan Laba Rugi", "Laba bersih " + rp(m.laba), "Siap") +
        row("Omzet Bruto", rp(m.inc), "Siap") +
        row("PPh Final 0,5%", rp(m.inc * 0.005), "Siap") +
        row("PPN Keluaran 11%", rp(m.inc * 0.11), "Siap") +
        '<div class="footrow"><span style="font-size:11.5px;color:var(--faint)">Nilai di atas siap disalin ke Coretax. Estimasi — verifikasi sebelum lapor.</span></div>' +
      "</div></div>" +
      '<div class="card" style="margin-top:16px"><div class="card-h"><h3>Langkah Pelaporan</h3></div><div style="padding:16px 20px;color:var(--soft);font-size:13.5px;line-height:1.9">1. Klik <b style="color:var(--ink)">Buka Coretax DJP</b> &amp; login dengan akun DJP Anda.<br>2. Pilih masa pajak ' + new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" }) + '.<br>3. Isi SPT dengan nilai dari Paket Data di atas.<br>4. Submit &amp; simpan bukti penerimaan negara (BPN/NTPN).</div></div></div>';
    shell(inner, "Coretax Hub");
  }

  function viewInsights() {
    var m = metrics(), period = A.insPeriod || 6, mm = byMonthN(period);
    var margin = m.inc ? (m.laba / m.inc * 100) : 0, expRatio = m.inc ? (m.exp / m.inc * 100) : 0;
    var prev = mm[mm.length - 2], cur = mm[mm.length - 1];
    var growth = (prev && prev.inc) ? ((cur.inc - prev.inc) / prev.inc * 100) : 0;
    var avg = m.n ? (m.inc + m.exp) / m.n : 0;
    var metric = A.insMetric || "net";
    var vals = mm.map(function (d) { return metric === "inc" ? d.inc : (metric === "exp" ? (d.inc - d.net) : d.net); });
    var maxV = Math.max.apply(null, vals.map(function (v) { return Math.abs(v); }).concat([1]));
    var mLbl = { inc: "Pendapatan", net: "Laba Bersih", exp: "Beban" };
    var bars = mm.map(function (d, i) {
      var v = vals[i], h = Math.abs(v) / maxV * 90, pos = v >= 0;
      var col = metric === "exp" ? "var(--neg)" : (metric === "inc" ? "var(--grad-gold)" : (pos ? "var(--grad-gold)" : "var(--neg)"));
      return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px"><div style="height:100px;display:flex;align-items:flex-end;width:100%;justify-content:center" title="' + d.lab + ": " + rp(v) + '"><div style="width:62%;min-height:2px;height:' + h.toFixed(0) + 'px;border-radius:5px 5px 0 0;background:' + col + ';transition:height .45s cubic-bezier(.2,.8,.2,1)"></div></div><div style="font-size:10px;color:var(--faint)">' + d.lab + "</div></div>";
    }).join("");
    var seg = '<div style="display:inline-flex;border:1px solid var(--line);border-radius:9px;overflow:hidden">' + ["inc", "net", "exp"].map(function (m) { return '<span data-m="' + m + '" style="padding:6px 11px;font-size:11px;cursor:pointer;border-right:1px solid var(--line);' + (m === metric ? "background:var(--grad-gold);color:#1a1407;font-weight:700" : "color:var(--soft)") + '">' + { inc: "Pendapatan", net: "Laba", exp: "Beban" }[m] + "</span>"; }).join("") + "</div>";
    var pseg = '<div style="display:inline-flex;border:1px solid var(--line);border-radius:9px;overflow:hidden">' + [3, 6, 12].map(function (p) { return '<span data-p="' + p + '" style="padding:6px 10px;font-size:11px;cursor:pointer;border-right:1px solid var(--line);' + (p === period ? "background:var(--grad-gold);color:#1a1407;font-weight:700" : "color:var(--soft)") + '">' + p + "B</span>"; }).join("") + "</div>";
    var insights = [];
    insights.push(margin >= 20 ? "Margin laba sehat di " + margin.toFixed(1) + "% — pertahankan efisiensi beban." : (m.inc ? "Margin laba " + margin.toFixed(1) + "% — pertimbangkan menaikkan harga atau menekan beban." : "Belum ada pendapatan tercatat."));
    if (prev && prev.inc) insights.push(growth >= 0 ? "Pendapatan naik " + growth.toFixed(1) + "% dibanding bulan lalu." : "Pendapatan turun " + Math.abs(growth).toFixed(1) + "% — perlu perhatian.");
    insights.push(expRatio > 80 && m.inc ? "Rasio beban tinggi (" + expRatio.toFixed(0) + "% dari pendapatan)." : (m.inc ? "Rasio beban terkendali di " + expRatio.toFixed(0) + "%." : "Catat transaksi untuk melihat rasio beban."));
    var inner = '<div class="content"><div class="phead"><div><div class="pt">Financial Insights</div><div class="ps">Telaah kinerja keuangan dari data transaksi Anda.</div></div></div>' +
      '<div class="kpis">' +
        kpi("Margin Laba", (m.inc ? margin.toFixed(1) + "%" : "—"), '<path d="M3 17l5-5 4 4 8-8"/>', margin >= 0 ? "up" : "dn", "laba / pendapatan") +
        kpi("Rasio Beban", (m.inc ? expRatio.toFixed(0) + "%" : "—"), '<path d="M3 7l5 5 4-4 8 8"/>', expRatio > 80 ? "dn" : "up", "beban / pendapatan") +
        kpi("Pertumbuhan", (prev && prev.inc ? (growth >= 0 ? "+" : "") + growth.toFixed(1) + "%" : "—"), '<path d="M3 12h18M12 3l9 9-9 9"/>', growth >= 0 ? "up" : "dn", "vs bulan lalu") +
        kpi("Rata-rata Transaksi", rpShort(avg), '<circle cx="12" cy="12" r="9"/>', "up", m.n + " transaksi") +
      "</div>" +
      '<div class="grid2"><div class="card"><div class="card-h"><h3>' + mLbl[metric] + ' per Bulan</h3><div style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap">' + pseg + seg + '</div></div><div style="padding:18px 20px;display:flex;gap:8px;align-items:flex-end">' + bars + "</div></div>" +
        '<div class="card"><div class="card-h"><h3>Insight</h3><span class="hint">otomatis</span></div><div style="padding:8px 4px">' + insights.map(function (t) { return '<div class="orow"><div class="oi inc"><svg viewBox="0 0 24 24"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg></div><div><div class="ot" style="font-weight:500;font-size:13px;color:var(--soft);line-height:1.5">' + esc(t) + "</div></div></div>"; }).join("") + "</div></div></div></div>";
    shell(inner, "Financial Insights");
    root.querySelectorAll("[data-m]").forEach(function (e) { e.onclick = function () { A.insMetric = e.getAttribute("data-m"); render(); }; });
    root.querySelectorAll("[data-p]").forEach(function (e) { e.onclick = function () { A.insPeriod = +e.getAttribute("data-p"); render(); }; });
  }

  function viewCompliance() {
    var m = metrics(), co = A.company || {};
    var pembukuan = Math.min(100, A.S.tx.length * 8);
    var kepatuhan = Math.min(100, (co.npwp ? 60 : 30) + (A.S.tx.length ? 40 : 0));
    var risiko = m.inc ? Math.min(100, Math.max(20, Math.round(100 - Math.max(0, (m.exp / m.inc * 100) - 70)))) : 50;
    var score = Math.round(pembukuan * 0.4 + kepatuhan * 0.3 + risiko * 0.3);
    var status = score >= 80 ? "Sehat" : (score >= 55 ? "Cukup" : "Perlu perhatian");
    var statusDesc = score >= 80 ? "Kepatuhan baik dengan sedikit risiko." : (score >= 55 ? "Beberapa hal perlu dirapikan." : "Segera lengkapi pembukuan & data pajak.");
    function bar(lbl, v) { return '<div style="display:flex;align-items:center;gap:10px;font-size:12px;color:var(--soft);margin:8px 0"><span style="width:80px">' + lbl + '</span><span style="flex:1;height:6px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden"><span style="display:block;height:100%;width:' + v + '%;background:var(--grad-gold);border-radius:3px"></span></span><span style="font-family:var(--mono);color:var(--val);width:28px;text-align:right">' + v + "</span></div>"; }
    var tips = [];
    if (!co.npwp) tips.push("Lengkapi NPWP perusahaan untuk skor kepatuhan lebih tinggi.");
    if (A.S.tx.length < 13) tips.push("Catat lebih banyak transaksi agar pembukuan makin lengkap.");
    if (m.inc && (m.exp / m.inc) > 0.7) tips.push("Rasio beban tinggi — tinjau pengeluaran untuk menurunkan risiko.");
    if (!tips.length) tips.push("Pertahankan pencatatan rutin & pelaporan tepat waktu.");
    var inner = '<div class="content"><div class="phead"><div><div class="pt">Compliance Index</div><div class="ps">Skor kesehatan kepatuhan pajak &amp; pembukuan Anda.</div></div></div>' +
      '<div class="grid2"><div class="card"><div class="idx" style="padding:24px;display:flex;gap:24px;align-items:center;flex-wrap:wrap">' +
        '<div style="width:152px;height:152px;border-radius:50%;background:conic-gradient(var(--gold) 0 ' + score + '%, rgba(255,255,255,.06) ' + score + '% 100%);display:grid;place-items:center;position:relative;box-shadow:var(--glow);flex-shrink:0">' +
          '<div style="width:118px;height:118px;border-radius:50%;background:var(--bg-1);position:absolute"></div>' +
          '<div style="position:relative;text-align:center"><div style="font-family:var(--disp);font-size:42px;color:var(--val);line-height:1">' + score + '</div><div style="font-size:10px;color:var(--faint)">dari 100</div></div></div>' +
        '<div style="flex:1;min-width:200px"><div style="font-size:17px;font-weight:700;color:var(--gold-lt)">' + status + '</div><div style="font-size:12.5px;color:var(--soft);margin:5px 0 12px">' + statusDesc + '</div>' +
          bar("Pembukuan", pembukuan) + bar("Kepatuhan", kepatuhan) + bar("Risiko", risiko) + "</div>" +
        "</div></div>" +
        '<div class="card"><div class="card-h"><h3>Rekomendasi</h3><span class="hint">tingkatkan skor</span></div><div style="padding:8px 4px">' +
          tips.map(function (t) { return '<div class="orow"><div class="oi inc"><svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div><div><div class="ot" style="font-weight:500;font-size:13px;color:var(--soft);line-height:1.5">' + esc(t) + "</div></div></div>"; }).join("") +
        "</div></div></div></div>";
    shell(inner, "Compliance Index");
  }

  function viewAccounts() {
    var m = metrics();
    var incCats = {}, expCats = {};
    A.S.tx.forEach(function (t) { if (t.kind === "inc") incCats[t.cat] = (incCats[t.cat] || 0) + t.amount; else expCats[t.cat] = (expCats[t.cat] || 0) + t.amount; });
    function section(title, code, rows, total, color) {
      return '<div class="card" style="margin-bottom:16px"><div class="card-h"><h3>' + title + '</h3><span class="hint">' + code + '</span></div>' +
        '<table class="tbl"><tbody>' + rows + '<tr><td class="m" style="color:' + color + '">Total ' + title + '</td><td style="text-align:right;font-family:var(--mono);color:' + color + '">' + rp(total) + "</td></tr></tbody></table></div>";
    }
    function rowsFrom(o, fallback) {
      var k = Object.keys(o); if (!k.length) return '<tr><td style="color:var(--faint)">' + fallback + '</td><td style="text-align:right;font-family:var(--mono);color:var(--faint)">' + rp(0) + "</td></tr>";
      return k.map(function (c) { return '<tr><td><span class="m">' + esc(c) + '</span></td><td style="text-align:right;font-family:var(--mono);color:var(--val)">' + rp(o[c]) + "</td></tr>"; }).join("");
    }
    var aset = '<tr><td><span class="m">Kas &amp; Setara Kas</span></td><td style="text-align:right;font-family:var(--mono);color:var(--val)">' + rp(m.laba) + "</td></tr>";
    var inner = '<div class="content"><div class="phead"><div><div class="pt">Account Architecture</div><div class="ps">Struktur akun (COA) &amp; saldo dari pembukuan Anda — SAK EMKM.</div></div></div>' +
      '<div class="grid2" style="align-items:start"><div>' +
        section("Aset", "1-xxxx", aset, m.laba, "var(--gold-lt)") +
        section("Pendapatan", "4-xxxx", rowsFrom(incCats, "Belum ada pendapatan"), m.inc, "var(--pos)") +
      "</div><div>" +
        section("Beban", "5-xxxx", rowsFrom(expCats, "Belum ada beban"), m.exp, "var(--neg)") +
        '<div class="card"><div class="card-h"><h3>Ekuitas</h3><span class="hint">3-xxxx</span></div><table class="tbl"><tbody><tr><td><span class="m">Laba Ditahan (berjalan)</span></td><td style="text-align:right;font-family:var(--mono);color:var(--val)">' + rp(m.laba) + '</td></tr></tbody></table></div>' +
      "</div></div></div>";
    shell(inner, "Account Architecture");
  }

  function viewResolution() {
    var m = metrics(), co = A.company || {}, D = deadlines();
    var issues = [];
    if (!co.npwp) issues.push({ s: "warn", t: "NPWP belum diisi", d: "Lengkapi NPWP perusahaan untuk kesiapan pelaporan pajak.", a: "Isi di menu Akun / Coretax" });
    if (m.inc && (m.exp / m.inc) > 0.8) issues.push({ s: "neg", t: "Beban sangat tinggi", d: "Beban " + Math.round(m.exp / m.inc * 100) + "% dari pendapatan — margin tertekan.", a: "Tinjau pengeluaran di Buku Besar" });
    if (m.laba < 0) issues.push({ s: "neg", t: "Arus kas/laba negatif", d: "Pengeluaran melebihi pemasukan periode ini.", a: "Kurangi beban atau tingkatkan penjualan" });
    if (A.S.tx.length < 5) issues.push({ s: "warn", t: "Pembukuan belum lengkap", d: "Baru " + A.S.tx.length + " transaksi tercatat.", a: "Catat transaksi rutin tiap hari" });
    var nearest = D.list.slice().sort(function (a, b) { return a.due - b.due; })[0];
    if (nearest && nearest.days <= 7) issues.push({ s: nearest.days <= 3 ? "neg" : "warn", t: "Tenggat pajak mendekat: " + nearest.t, d: "Jatuh tempo " + nearest.due.toLocaleDateString("id-ID", { day: "numeric", month: "long" }) + " (" + nearest.lbl + ").", a: "Siapkan di Compliance Calendar" });
    var body;
    if (!issues.length) {
      body = '<div class="card"><div class="soon"><div class="ic" style="background:var(--pos-bg);border-color:var(--pos)"><svg viewBox="0 0 24 24" stroke="var(--pos)"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div><h3>Tidak ada masalah aktif</h3><p>Kepatuhan &amp; keuangan Anda sehat. Pertahankan pencatatan rutin dan pelaporan tepat waktu.</p></div></div>';
    } else {
      body = '<div class="card"><div class="card-h"><h3>' + issues.length + ' hal perlu tindakan</h3><span class="hint">early warning</span></div>' +
        issues.map(function (x) { return '<div class="orow"><div class="oi exp" style="border-color:var(--' + (x.s === "neg" ? "neg" : "warn") + ');background:var(--' + (x.s === "neg" ? "neg" : "warn") + '-bg)"><svg viewBox="0 0 24 24" stroke="var(--' + (x.s === "neg" ? "neg" : "warn") + ')"><path d="M12 9v4M12 17v.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg></div><div style="flex:1"><div class="ot">' + esc(x.t) + '</div><div class="od">' + esc(x.d) + " · " + esc(x.a) + '</div></div><span class="pill ' + (x.s === "neg" ? "neg" : "warn") + '" style="margin-left:8px">' + (x.s === "neg" ? "Penting" : "Perhatian") + "</span></div>"; }).join("") + "</div>";
    }
    var inner = '<div class="content"><div class="phead"><div><div class="pt">Resolution Center</div><div class="ps">Deteksi dini masalah keuangan &amp; pajak — dengan langkah penyelesaian.</div></div></div>' +
      '<div class="kpis" style="grid-template-columns:repeat(3,1fr)">' +
        kpi("Masalah Aktif", String(issues.length), '<path d="M12 9v4M12 17v.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3z"/>', issues.length ? "dn" : "up", issues.length ? "perlu tindakan" : "semua aman") +
        kpi("Tenggat Terdekat", (nearest ? nearest.lbl : "-"), '<rect x="3" y="4" width="18" height="17" rx="2"/>', nearest && nearest.days <= 3 ? "dn" : "up", nearest ? nearest.due.toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "") +
        kpi("Margin Laba", (m.inc ? Math.round(m.laba / m.inc * 100) + "%" : "—"), '<path d="M3 17l5-5 4 4 8-8"/>', m.laba >= 0 ? "up" : "dn", "kesehatan") +
      "</div>" + body + "</div>";
    shell(inner, "Resolution Center");
  }

  function showTarget() {
    var t = A.S.target || { income: 0, expense: 0 };
    modal(MBRAND + '<button class="mx" id="x">×</button><div class="mh">Target Bulanan</div><div class="msub">Target pendapatan &amp; batas (budget) beban per bulan.</div>' +
      '<div class="fld"><label>Target Pendapatan (Rp)</label><input class="inp" id="tg_i" inputmode="numeric" value="' + (t.income ? Number(t.income).toLocaleString("id-ID") : "") + '"></div>' +
      '<div class="fld"><label>Budget Beban (Rp)</label><input class="inp" id="tg_e" inputmode="numeric" value="' + (t.expense ? Number(t.expense).toLocaleString("id-ID") : "") + '"></div>' +
      '<button class="mbtn pri" id="tg_s">Simpan target</button>');
    $("#x").onclick = closeModal;
    ["tg_i", "tg_e"].forEach(function (id) { var el = $("#" + id); el.oninput = function () { var v = el.value.replace(/\D/g, ""); el.value = v ? Number(v).toLocaleString("id-ID") : ""; }; });
    $("#tg_s").onclick = function () { A.S.target = { income: Number(($("#tg_i").value || "").replace(/\D/g, "")), expense: Number(($("#tg_e").value || "").replace(/\D/g, "")) }; save(); closeModal(); render(); };
  }
  function invNo() {
    var n = (A.S.invoices.length + 1), d = new Date();
    return "INV/" + d.getFullYear() + "/" + ("0" + (d.getMonth() + 1)).slice(-2) + "/" + ("000" + n).slice(-4);
  }
  function togglePaid(id) {
    var i = A.S.invoices.filter(function (x) { return x.id === id; })[0]; if (!i) return;
    if (i.status === "paid") { i.status = "unpaid"; }
    else { i.status = "paid"; if (!i.posted) { A.S.tx.push({ id: uid(), date: new Date().toISOString().slice(0, 10), kind: "inc", cat: "Penjualan", note: "Invoice " + i.no + " — " + i.client, amount: i.total }); i.posted = true; } }
    save(); render();
  }
  function invoiceDoc(id) {
    var i = A.S.invoices.filter(function (x) { return x.id === id; })[0]; if (!i) return;
    var co = A.company || {}, sub = i.qty * i.price, ppnAmt = i.ppn ? Math.round(sub * 0.11) : 0;
    modal(MBRAND + '<button class="mx" id="x">×</button>' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px"><div>' + (A.S.profile && A.S.profile.logo ? '<img src="' + A.S.profile.logo + '" style="max-height:44px;margin-bottom:6px;display:block">' : "") + '<div style="font-family:var(--disp);font-size:22px">' + esc(co.name || "Perusahaan") + '</div><div style="color:var(--faint);font-size:11px">' + esc(co.npwp ? ("NPWP " + co.npwp) : "") + '</div></div><div style="text-align:right"><div style="font-family:var(--disp);font-size:20px;color:var(--gold-lt)">FAKTUR</div><div style="color:var(--soft);font-size:12px;font-family:var(--mono)">' + esc(i.no) + '</div><span class="pill ' + (i.status === "paid" ? "pos" : "warn") + '">' + (i.status === "paid" ? "LUNAS" : "BELUM DIBAYAR") + '</span></div></div>' +
      '<div style="border-top:1px solid var(--line);padding-top:12px;margin-bottom:10px;font-size:13px"><div style="color:var(--faint);font-size:11px">DITAGIHKAN KE</div><div style="font-weight:600">' + esc(i.client) + '</div><div style="color:var(--soft);font-size:12px;margin-top:4px">Tanggal ' + new Date(i.date).toLocaleDateString("id-ID") + " · Jatuh tempo " + new Date(i.due).toLocaleDateString("id-ID") + '</div></div>' +
      '<table class="tbl" style="font-size:13px"><thead><tr><th>Deskripsi</th><th style="text-align:right">Qty</th><th style="text-align:right">Harga</th><th style="text-align:right">Jumlah</th></tr></thead><tbody>' +
        '<tr><td><span class="m">' + esc(i.desc) + '</span></td><td style="text-align:right">' + i.qty + '</td><td style="text-align:right;font-family:var(--mono)">' + rp(i.price) + '</td><td style="text-align:right;font-family:var(--mono);color:var(--val)">' + rp(sub) + "</td></tr>" +
        (ppnAmt ? '<tr><td colspan="3" style="text-align:right;color:var(--soft)">PPN 11%</td><td style="text-align:right;font-family:var(--mono);color:var(--val)">' + rp(ppnAmt) + "</td></tr>" : "") +
        '<tr><td colspan="3" style="text-align:right" class="m">Total</td><td style="text-align:right;font-family:var(--disp);font-size:18px;color:var(--gold-lt)">' + rp(i.total) + "</td></tr>" +
      "</tbody></table>" +
      '<button class="mbtn pri" id="iv_pr" style="margin-top:14px">Cetak / Simpan PDF</button><button class="mbtn ghost" id="iv_cl">Tutup</button>');
    $("#x").onclick = closeModal; $("#iv_cl").onclick = closeModal;
    $("#iv_pr").onclick = function () { window.print(); };
  }
  function showAddInvoice() {
    modal(MBRAND + '<button class="mx" id="x">×</button><div class="mh">Buat Invoice</div><div class="msub">Faktur ' + invNo() + "</div>" + prodDatalist() +
      '<div class="fld"><label>Klien</label><input class="inp" id="iv_c" placeholder="Nama klien / perusahaan"></div>' +
      '<div class="fld"><label>Deskripsi</label><input class="inp" id="iv_d" placeholder="mis. Jasa konsultasi"></div>' +
      '<div style="display:flex;gap:10px"><div class="fld" style="flex:1"><label>Qty</label><input class="inp" id="iv_q" inputmode="numeric" value="1"></div><div class="fld" style="flex:2"><label>Harga satuan (Rp)</label><input class="inp" id="iv_p" inputmode="numeric" placeholder="0"></div></div>' +
      '<div style="display:flex;gap:10px"><div class="fld" style="flex:1"><label>Tanggal</label><input class="inp" id="iv_dt" type="date" value="' + new Date().toISOString().slice(0, 10) + '"></div><div class="fld" style="flex:1"><label>Jatuh tempo</label><input class="inp" id="iv_du" type="date" value="' + new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10) + '"></div></div>' +
      '<label style="display:flex;align-items:center;gap:8px;color:var(--soft);font-size:13px;margin:6px 0"><input type="checkbox" id="iv_ppn"> Tambah PPN 11%</label>' +
      '<div class="mmsg" id="iv_m"></div><button class="mbtn pri" id="iv_s">Simpan invoice</button>');
    $("#x").onclick = closeModal;
    var p = $("#iv_p"); p.oninput = function () { var v = p.value.replace(/\D/g, ""); p.value = v ? Number(v).toLocaleString("id-ID") : ""; };
    prodAutofill("iv_d", "iv_p");
    $("#iv_s").onclick = function () {
      var qty = Number(($("#iv_q").value || "1").replace(/\D/g, "")) || 1;
      var price = Number(($("#iv_p").value || "").replace(/\D/g, ""));
      var m = $("#iv_m"); m.className = "mmsg err";
      if (!$("#iv_c").value.trim()) { m.textContent = "Nama klien wajib diisi."; return; }
      if (!price) { m.textContent = "Harga wajib diisi."; return; }
      var ppn = $("#iv_ppn").checked, total = Math.round(qty * price * (ppn ? 1.11 : 1));
      A.S.invoices.push({ id: uid(), no: invNo(), client: $("#iv_c").value.trim(), desc: $("#iv_d").value.trim() || "Layanan", qty: qty, price: price, ppn: ppn, total: total, date: $("#iv_dt").value, due: $("#iv_du").value, status: "unpaid", posted: false });
      save(); closeModal(); render();
    };
  }
  function viewInvoice() {
    var inv = (A.S.invoices || []).slice().sort(function (a, b) { return (b.date > a.date ? 1 : -1); });
    var totAll = 0, paid = 0; inv.forEach(function (i) { totAll += i.total; if (i.status === "paid") paid += i.total; });
    var rows = inv.map(function (i) {
      var due = new Date(i.due), late = i.status !== "paid" && due < new Date();
      return "<tr><td><span class=\"m\">" + esc(i.no) + "</span></td><td>" + esc(i.client) + "</td><td>" + new Date(i.date).toLocaleDateString("id-ID") + '</td><td style="color:' + (late ? "var(--neg)" : "var(--soft)") + '">' + due.toLocaleDateString("id-ID") + '</td><td style="text-align:right;font-family:var(--mono);color:var(--val)">' + rp(i.total) + '</td><td><span class="pill ' + (i.status === "paid" ? "pos" : (late ? "neg" : "warn")) + '">' + (i.status === "paid" ? "Lunas" : (late ? "Terlambat" : "Belum bayar")) + "</span></td>" +
        '<td style="text-align:right;white-space:nowrap"><span class="mlink" data-vi="' + i.id + '">Lihat</span> · <span class="mlink" data-pay="' + i.id + '" style="color:' + (i.status === "paid" ? "var(--faint)" : "var(--pos)") + '">' + (i.status === "paid" ? "Batal" : "Lunas") + '</span> · <span class="mlink" data-di="' + i.id + '" style="color:var(--neg)">hapus</span></td></tr>';
    }).join("");
    var inner = '<div class="content"><div class="phead"><div><div class="pt">Invoice</div><div class="ps">Buat &amp; kelola faktur — tandai lunas, otomatis masuk pendapatan.</div></div><div class="acts"><button class="btn pri" id="addInv"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg> Buat Invoice</button></div></div>' +
      '<div class="kpis" style="grid-template-columns:repeat(3,1fr)">' +
        kpi("Total Tagihan", rpShort(totAll), '<rect x="4" y="3" width="16" height="18" rx="2"/>', "up", inv.length + " invoice") +
        kpi("Sudah Lunas", rpShort(paid), '<path d="M20 6 9 17l-5-5"/>', "up", "diterima") +
        kpi("Belum Dibayar", rpShort(totAll - paid), '<circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/>', (totAll - paid) > 0 ? "dn" : "up", "outstanding") +
      "</div>" +
      '<div class="card">' + (inv.length ? '<table class="tbl"><thead><tr><th>No</th><th>Klien</th><th>Tanggal</th><th>Jatuh tempo</th><th style="text-align:right">Total</th><th>Status</th><th></th></tr></thead><tbody>' + rows + "</tbody></table>" : '<div class="empty">Belum ada invoice. Klik <b>Buat Invoice</b> untuk faktur pertama.</div>') + "</div></div>";
    shell(inner, "Invoice");
    $("#addInv").onclick = showAddInvoice;
    root.querySelectorAll("[data-vi]").forEach(function (e) { e.onclick = function () { invoiceDoc(e.getAttribute("data-vi")); }; });
    root.querySelectorAll("[data-pay]").forEach(function (e) { e.onclick = function () { togglePaid(e.getAttribute("data-pay")); }; });
    root.querySelectorAll("[data-di]").forEach(function (e) { e.onclick = function () { var id = e.getAttribute("data-di"); A.S.invoices = A.S.invoices.filter(function (i) { return i.id !== id; }); save(); render(); }; });
  }

  function viewTeam() {
    shell('<div class="content"><div class="phead"><div><div class="pt">Anggota Tim</div><div class="ps">Memuat…</div></div></div><div class="card"><div class="spin"></div></div></div>', "Anggota Tim");
    Promise.all([
      sb.from("memberships").select("user_id, role").eq("company_id", A.company.id),
      sb.from("company_invites").select("*").eq("company_id", A.company.id),
    ]).then(function (res) {
      var mems = res[0].data || [], invites = res[1].data || [], uids = mems.map(function (m) { return m.user_id; });
      sb.from("profiles").select("id,email,full_name").in("id", uids.length ? uids : ["00000000-0000-0000-0000-000000000000"]).then(function (p) {
        var profs = {}; (p.data || []).forEach(function (x) { profs[x.id] = x; });
        renderTeam(mems, invites, profs);
      });
    }).catch(function () { renderTeam([], [], {}); });
  }
  function renderTeam(mems, invites, profs) {
    var myRole = (mems.filter(function (m) { return m.user_id === A.user.id; })[0] || {}).role || "staff";
    var isAdmin = myRole === "owner" || myRole === "admin";
    var memRows = mems.map(function (m) {
      var p = profs[m.user_id] || {}, nm = p.full_name || p.email || "Anggota", av = nm.charAt(0).toUpperCase();
      return '<div class="orow"><div class="oi" style="background:var(--grad-gold);border:none"><span style="color:#1a1407;font-weight:800">' + esc(av) + '</span></div><div style="flex:1"><div class="ot">' + esc(nm) + (m.user_id === A.user.id ? ' <span style="color:var(--faint);font-size:11px">(Anda)</span>' : "") + '</div><div class="od">' + esc(p.email || "") + '</div></div><span class="pill ' + (m.role === "owner" ? "pos" : "warn") + '">' + esc(m.role) + "</span>" + ((isAdmin && m.role !== "owner" && m.user_id !== A.user.id) ? ' <span class="mlink" data-rm="' + m.user_id + '" style="color:var(--neg);margin-left:8px">keluarkan</span>' : "") + "</div>";
    }).join("");
    var invRows = invites.map(function (iv) { return '<div class="orow"><div class="oi exp"><svg viewBox="0 0 24 24" stroke="var(--warn)" fill="none"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg></div><div style="flex:1"><div class="ot">' + esc(iv.email) + '</div><div class="od">Menunggu bergabung · peran ' + esc(iv.role) + '</div></div>' + (isAdmin ? '<span class="mlink" data-cancel="' + iv.id + '" style="color:var(--neg)">batalkan</span>' : "") + "</div>"; }).join("");
    var inner = '<div class="content"><div class="phead"><div><div class="pt">Anggota Tim</div><div class="ps">Kelola akses ' + esc(A.company.name) + '.</div></div>' + (isAdmin ? '<div class="acts"><button class="btn pri" id="invBtn"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg> Undang anggota</button></div>' : "") + "</div>" +
      '<div class="card"><div class="card-h"><h3>Anggota (' + mems.length + ")</h3></div>" + (memRows || '<div class="empty">—</div>') + "</div>" +
      (invites.length ? '<div class="card" style="margin-top:16px"><div class="card-h"><h3>Undangan tertunda (' + invites.length + ")</h3></div>" + invRows + "</div>" : "") +
      (isAdmin ? "" : '<div class="card" style="margin-top:16px"><div style="padding:16px 20px;color:var(--soft);font-size:13px">Hanya owner/admin yang dapat mengundang atau mengeluarkan anggota.</div></div>') + "</div>";
    shell(inner, "Anggota Tim");
    var ib = $("#invBtn"); if (ib) ib.onclick = showInvite;
    root.querySelectorAll("[data-cancel]").forEach(function (e) { e.onclick = function () { sb.from("company_invites").delete().eq("id", e.getAttribute("data-cancel")).then(viewTeam); }; });
    root.querySelectorAll("[data-rm]").forEach(function (e) { e.onclick = function () { sb.from("memberships").delete().eq("company_id", A.company.id).eq("user_id", e.getAttribute("data-rm")).then(viewTeam); }; });
  }
  function showInvite() {
    modal(MBRAND + '<button class="mx" id="x">×</button><div class="mh">Undang Anggota</div><div class="msub">Mereka otomatis bergabung saat login dengan email ini.</div>' +
      '<div class="fld"><label>Email</label><input class="inp" id="in_e" type="email" placeholder="nama@email.com"></div>' +
      '<div class="fld"><label>Peran</label><select class="inp" id="in_r"><option value="staff">Staff</option><option value="admin">Admin</option><option value="viewer">Viewer (lihat saja)</option></select></div>' +
      '<div class="mmsg" id="in_m"></div><button class="mbtn pri" id="in_s">Kirim undangan</button>');
    $("#x").onclick = closeModal;
    $("#in_s").onclick = function () {
      var email = ($("#in_e").value || "").trim().toLowerCase(), m = $("#in_m"); m.className = "mmsg err";
      if (!/.+@.+\..+/.test(email)) { m.textContent = "Email tidak valid."; return; }
      sb.from("company_invites").insert({ company_id: A.company.id, email: email, role: $("#in_r").value, created_by: A.user.id }).then(function (r) {
        if (r.error) { m.textContent = r.error.message; return; }
        m.className = "mmsg ok"; m.textContent = "Undangan terkirim. Mereka bergabung otomatis saat login.";
        setTimeout(function () { closeModal(); viewTeam(); }, 900);
      });
    };
  }
  function acceptInvites() {
    if (!A.user || !A.user.email) return Promise.resolve();
    return sb.from("company_invites").select("*").then(function (r) {
      var inv = r.data || []; if (!inv.length) return;
      return Promise.all(inv.map(function (iv) { return sb.from("memberships").insert({ company_id: iv.company_id, user_id: A.user.id, role: iv.role || "staff" }).then(function () { return sb.from("company_invites").delete().eq("id", iv.id); }).catch(function () {}); }));
    }).catch(function () {});
  }

  function viewCashflow() {
    var m = metrics(), map = {};
    A.S.tx.forEach(function (t) { var d = new Date(t.date), k = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2); if (!map[k]) map[k] = { inc: 0, exp: 0, lab: d.toLocaleDateString("id-ID", { month: "short", year: "numeric" }) }; if (t.kind === "inc") map[k].inc += t.amount; else map[k].exp += t.amount; });
    var keys = Object.keys(map).sort(), bal = 0;
    var rows = keys.map(function (k) { var r = map[k], net = r.inc - r.exp; bal += net; return '<tr><td><span class="m">' + esc(r.lab) + '</span></td><td style="text-align:right;font-family:var(--mono);color:var(--pos)">' + rp(r.inc) + '</td><td style="text-align:right;font-family:var(--mono);color:var(--neg)">' + rp(r.exp) + '</td><td style="text-align:right;font-family:var(--mono);color:' + (net >= 0 ? "var(--pos)" : "var(--neg)") + '">' + (net >= 0 ? "+" : "") + rp(net) + '</td><td style="text-align:right;font-family:var(--mono);color:var(--val)">' + rp(bal) + "</td></tr>"; }).join("");
    var inner = '<div class="content"><div class="phead"><div><div class="pt">Laporan Arus Kas</div><div class="ps">Metode langsung — arus kas masuk &amp; keluar per bulan.</div></div><div class="acts"><button class="btn" id="expX"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg> Excel</button><button class="btn" id="expP"><svg viewBox="0 0 24 24"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/></svg> PDF</button></div></div>' +
      '<div class="kpis" style="grid-template-columns:repeat(3,1fr)">' +
        kpi("Total Kas Masuk", rpShort(m.inc), '<path d="M12 19V5M5 12l7-7 7 7"/>', "up", "operasi") +
        kpi("Total Kas Keluar", rpShort(m.exp), '<path d="M12 5v14M5 12l7 7 7-7"/>', "dn", "operasi") +
        kpi("Saldo Kas", rpShort(m.laba), '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/>', m.laba >= 0 ? "up" : "dn", "akhir periode") +
      "</div>" +
      '<div class="card">' + (keys.length ? '<table class="tbl"><thead><tr><th>Bulan</th><th style="text-align:right">Kas Masuk</th><th style="text-align:right">Kas Keluar</th><th style="text-align:right">Arus Bersih</th><th style="text-align:right">Saldo Akhir</th></tr></thead><tbody>' + rows + '<tr><td class="m">Total</td><td style="text-align:right;font-family:var(--mono);color:var(--pos)">' + rp(m.inc) + '</td><td style="text-align:right;font-family:var(--mono);color:var(--neg)">' + rp(m.exp) + '</td><td style="text-align:right;font-family:var(--mono);color:var(--val)">' + rp(m.laba) + '</td><td style="text-align:right;font-family:var(--mono);color:var(--gold-lt)">' + rp(m.laba) + "</td></tr></tbody></table>" : '<div class="empty">Belum ada transaksi untuk laporan arus kas.</div>') + "</div></div>";
    shell(inner, "Arus Kas");
    $("#expP").onclick = printPage;
    $("#expX").onclick = function () { var r = [["Bulan", "Kas Masuk", "Kas Keluar", "Arus Bersih", "Saldo Akhir"]], b = 0; keys.forEach(function (k) { var x = map[k], net = x.inc - x.exp; b += net; r.push([x.lab, x.inc, x.exp, net, b]); }); download("arus-kas-" + (A.company.name || "finflow") + ".csv", toCSV(r), "text/csv;charset=utf-8"); };
  }
  function viewClients() {
    shell('<div class="content"><div class="phead"><div><div class="pt">Semua Klien</div><div class="ps">Memuat ringkasan…</div></div></div><div class="card"><div class="spin"></div></div></div>', "Semua Klien");
    var ids = (A.companies || []).map(function (c) { return c.id; });
    sb.from("company_state").select("company_id,data").in("company_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]).then(function (r) {
      var byId = {}; (r.data || []).forEach(function (x) { byId[x.company_id] = x.data || {}; });
      var list = (A.companies || []).map(function (c) {
        var s = byId[c.id] || {}, tx = s.tx || [], inc = 0, exp = 0; tx.forEach(function (t) { if (t.kind === "inc") inc += t.amount; else exp += t.amount; });
        return { c: c, inc: inc, exp: exp, laba: inc - exp, n: tx.length };
      });
      renderClients(list);
    }).catch(function () { renderClients([]); });
  }
  function renderClients(list) {
    var totInc = 0, totLaba = 0; list.forEach(function (x) { totInc += x.inc; totLaba += x.laba; });
    var rows = list.map(function (x) {
      var active = x.c.id === A.company.id;
      return '<tr style="cursor:pointer" data-co="' + x.c.id + '"><td><span class="m">' + esc(x.c.name) + "</span>" + (active ? ' <span style="color:var(--faint);font-size:11px">(aktif)</span>' : "") + "</td><td>" + esc(x.c.business_type || "") + '</td><td style="text-align:right;font-family:var(--mono);color:var(--val)">' + rp(x.inc) + '</td><td style="text-align:right;font-family:var(--mono);color:var(--neg)">' + rp(x.exp) + '</td><td style="text-align:right;font-family:var(--mono);color:' + (x.laba >= 0 ? "var(--pos)" : "var(--neg)") + '">' + rp(x.laba) + '</td><td style="text-align:right">' + x.n + '</td><td><span class="pill ' + (x.laba >= 0 ? "pos" : "neg") + '">' + (x.laba >= 0 ? "Sehat" : "Rugi") + "</span></td></tr>";
    }).join("");
    var inner = '<div class="content"><div class="phead"><div><div class="pt">Semua Klien</div><div class="ps">Ringkasan ' + list.length + ' perusahaan/klien dalam satu layar.</div></div></div>' +
      '<div class="kpis" style="grid-template-columns:repeat(3,1fr)">' +
        kpi("Total Klien", String(list.length), '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>', "up", "perusahaan") +
        kpi("Total Omzet", rpShort(totInc), '<path d="M3 17l5-5 4 4 8-8"/>', "up", "gabungan") +
        kpi("Total Laba", rpShort(totLaba), '<circle cx="12" cy="9" r="6"/><path d="M9 14.5 7.5 22l4.5-2.5L16.5 22 15 14.5"/>', totLaba >= 0 ? "up" : "dn", "gabungan") +
      "</div>" +
      '<div class="card">' + (list.length ? '<table class="tbl"><thead><tr><th>Klien</th><th>Jenis</th><th style="text-align:right">Omzet</th><th style="text-align:right">Beban</th><th style="text-align:right">Laba</th><th style="text-align:right">Tx</th><th>Status</th></tr></thead><tbody>' + rows + "</tbody></table>" : '<div class="empty">Belum ada klien.</div>') + "</div></div>";
    shell(inner, "Semua Klien");
    root.querySelectorAll("[data-co]").forEach(function (e) { e.onclick = function () { var id = e.getAttribute("data-co"); if (id !== A.company.id) switchCompany(id); }; });
  }
  function showReminders() {
    var dl = deadlines();
    var rows = dl.list.slice().sort(function (a, b) { return a.due - b.due; }).map(function (o) {
      return '<div class="orow"><div class="oi exp" style="border-color:var(--' + (o.days <= 3 ? "neg" : "warn") + ')"><svg viewBox="0 0 24 24" stroke="var(--' + (o.days <= 3 ? "neg" : "warn") + ')" fill="none"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></div><div style="flex:1"><div class="ot">' + esc(o.t) + '</div><div class="od">' + esc(o.s) + " · " + o.due.toLocaleDateString("id-ID", { day: "numeric", month: "long" }) + "</div></div>" + (o.amt ? '<span class="amt">' + rp(o.amt) + "</span>" : "") + '<span class="pill ' + o.cls + '" style="margin-left:10px">' + o.lbl + "</span></div>";
    }).join("");
    modal(MBRAND + '<button class="mx" id="x">×</button><div class="mh">Pengingat Tenggat Pajak</div><div class="msub">Kewajiban masa berjalan — ' + new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" }) + ".</div>" + rows + '<button class="mbtn ghost" id="rm_cal" style="margin-top:12px">Buka Compliance Calendar</button>', true);
    $("#x").onclick = closeModal;
    $("#rm_cal").onclick = function () { closeModal(); A.view = "calendar"; render(); };
  }
  function showBranding() {
    if (!A.S.profile) A.S.profile = {};
    function prev() { var lg = A.S.profile.logo; return lg ? '<img src="' + lg + '" style="max-height:80px;max-width:220px;border-radius:8px">' : '<div style="color:var(--faint);font-size:13px">Belum ada logo</div>'; }
    modal(MBRAND + '<button class="mx" id="x">×</button><div class="mh">Logo &amp; Branding</div><div class="msub">Logo ini tampil di invoice &amp; sidebar untuk ' + esc(A.company.name) + '.</div>' +
      '<div id="lgPrev" style="text-align:center;margin:12px 0;padding:14px;border:1px dashed var(--line);border-radius:12px">' + prev() + "</div>" +
      '<input type="file" id="lg_f" accept="image/*" class="inp" style="padding:9px"><div class="mmsg" id="lg_m"></div>' +
      '<button class="mbtn ghost" id="lg_rm">Hapus logo</button><button class="mbtn pri" id="lg_done">Selesai</button>');
    $("#x").onclick = function () { closeModal(); render(); };
    $("#lg_done").onclick = function () { closeModal(); render(); };
    $("#lg_rm").onclick = function () { A.S.profile.logo = ""; save(); $("#lgPrev").innerHTML = prev(); };
    $("#lg_f").onchange = function () { var f = this.files[0]; if (!f) return; if (f.size > 500000) { $("#lg_m").className = "mmsg err"; $("#lg_m").textContent = "Logo terlalu besar (maks ~500KB). Pilih gambar lebih kecil."; return; } var r = new FileReader(); r.onload = function () { A.S.profile.logo = r.result; save(); $("#lgPrev").innerHTML = prev(); var m = $("#lg_m"); m.className = "mmsg ok"; m.textContent = "Logo tersimpan."; }; r.readAsDataURL(f); };
  }
  function showCategories() {
    if (!A.S.cats) A.S.cats = { inc: CATS.inc.slice(), exp: CATS.exp.slice() };
    function chips(kind) { return catsFor(kind).map(function (c, i) { return '<span data-rm="' + kind + "|" + i + '" style="cursor:pointer;background:rgba(212,175,55,.1);border:1px solid var(--line-gold);color:var(--gold-lt);padding:4px 10px;border-radius:20px;font-size:12px;display:inline-flex;gap:6px">' + esc(c) + " ✕</span>"; }).join(""); }
    function body() { return '<div style="font-size:11px;color:var(--faint);text-transform:uppercase;letter-spacing:.04em;margin-top:6px">Pemasukan</div><div style="display:flex;flex-wrap:wrap;gap:7px;margin:7px 0">' + chips("inc") + '</div><div style="display:flex;gap:8px"><input class="inp" id="ncI" placeholder="kategori pemasukan baru"><button class="mbtn ghost" id="adI" style="width:auto;margin:0;padding:0 16px">+</button></div>' + '<div style="font-size:11px;color:var(--faint);text-transform:uppercase;letter-spacing:.04em;margin-top:14px">Pengeluaran</div><div style="display:flex;flex-wrap:wrap;gap:7px;margin:7px 0">' + chips("exp") + '</div><div style="display:flex;gap:8px"><input class="inp" id="ncE" placeholder="kategori pengeluaran baru"><button class="mbtn ghost" id="adE" style="width:auto;margin:0;padding:0 16px">+</button></div>'; }
    function refresh() { var c = $("#catBody"); if (c) c.innerHTML = body(); wire(); }
    function wire() {
      document.querySelectorAll("[data-rm]").forEach(function (e) { e.onclick = function () { var p = e.getAttribute("data-rm").split("|"); A.S.cats[p[0]].splice(+p[1], 1); save(); refresh(); }; });
      var ai = $("#adI"); if (ai) ai.onclick = function () { var v = $("#ncI").value.trim(); if (v && A.S.cats.inc.indexOf(v) < 0) { A.S.cats.inc.push(v); save(); refresh(); } };
      var ae = $("#adE"); if (ae) ae.onclick = function () { var v = $("#ncE").value.trim(); if (v && A.S.cats.exp.indexOf(v) < 0) { A.S.cats.exp.push(v); save(); refresh(); } };
    }
    modal(MBRAND + '<button class="mx" id="x">×</button><div class="mh">Kelola Kategori</div><div class="msub">Atur daftar kategori pemasukan &amp; pengeluaran.</div><div id="catBody">' + body() + '</div><button class="mbtn pri" id="cat_done" style="margin-top:14px">Selesai</button>');
    $("#x").onclick = function () { closeModal(); showAddTx(); };
    $("#cat_done").onclick = function () { closeModal(); showAddTx(); };
    wire();
  }
  function parseCSV(text) {
    text = String(text || "").replace(/\r\n?/g, "\n").trim();
    var lines = text.split("\n").filter(function (l) { return l.trim(); });
    if (!lines.length) return [];
    var delim = (lines[0].split(";").length > lines[0].split(",").length) ? ";" : (lines[0].split("\t").length > lines[0].split(",").length ? "\t" : ",");
    return lines.map(function (line) {
      var out = [], cur = "", q = false;
      for (var i = 0; i < line.length; i++) { var c = line[i]; if (q) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; } else { if (c === '"') q = true; else if (c === delim) { out.push(cur); cur = ""; } else cur += c; } }
      out.push(cur); return out;
    });
  }
  function parseAmt(s) { s = String(s == null ? "" : s).trim(); var neg = /^\(.*\)$/.test(s) || /-/.test(s.replace(/[^\d\-]/g, "")); s = s.replace(/[^\d.,]/g, ""); if (s.indexOf(",") > -1 && s.indexOf(".") > -1) s = s.replace(/\./g, "").replace(",", "."); else if (s.indexOf(",") > -1) s = s.replace(",", "."); var n = parseFloat(s); if (isNaN(n)) return 0; return neg ? -Math.abs(n) : n; }
  function parseDate(s) { s = String(s || "").trim(); var m = s.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/); if (m) return m[1] + "-" + ("0" + m[2]).slice(-2) + "-" + ("0" + m[3]).slice(-2); m = s.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/); if (m) { var y = m[3].length === 2 ? "20" + m[3] : m[3]; return y + "-" + ("0" + m[2]).slice(-2) + "-" + ("0" + m[1]).slice(-2); } var d = new Date(s); if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10); return new Date().toISOString().slice(0, 10); }
  function showImport() {
    modal(MBRAND + '<button class="mx" id="x">×</button><div class="mh">Impor Transaksi (CSV)</div><div class="msub">Unggah file .csv atau tempel datanya. Baris pertama = judul kolom.</div>' +
      '<input type="file" id="im_f" accept=".csv,text/csv" class="inp" style="padding:9px">' +
      '<textarea class="inp" id="im_t" placeholder="atau tempel CSV di sini…" style="min-height:84px;margin-top:8px;font-family:var(--mono);font-size:12px"></textarea>' +
      '<button class="mbtn ghost" id="im_p">Proses</button><div id="im_map"></div><div class="mmsg" id="im_m"></div>');
    $("#x").onclick = closeModal;
    $("#im_f").onchange = function () { var f = this.files[0]; if (!f) return; var r = new FileReader(); r.onload = function () { $("#im_t").value = r.result; doProcess(); }; r.readAsText(f); };
    $("#im_p").onclick = doProcess;
    function doProcess() {
      var rows = parseCSV($("#im_t").value), m = $("#im_m"); m.className = "mmsg err";
      if (rows.length < 2) { m.textContent = "Data CSV minimal 2 baris (judul + isi)."; $("#im_map").innerHTML = ""; return; }
      var head = rows[0], data = rows.slice(1);
      function guess(re) { for (var i = 0; i < head.length; i++) if (re.test(head[i] || "")) return i; return -1; }
      var gd = guess(/tang|date|tgl/i), gk = guess(/ket|desc|uraian|narasi|catatan|transaksi/i), ga = guess(/jumlah|amount|nominal|nilai|debit|kredit|mutasi/i);
      function sel(id, def) { return '<select class="inp" id="' + id + '">' + head.map(function (h, i) { return '<option value="' + i + '"' + (i === def ? " selected" : "") + ">" + esc(h || ("Kolom " + (i + 1))) + "</option>"; }).join("") + "</select>"; }
      m.textContent = "";
      $("#im_map").innerHTML = '<div style="margin-top:10px"><div class="fld"><label>Kolom Tanggal</label>' + sel("im_d", gd < 0 ? 0 : gd) + '</div><div class="fld"><label>Kolom Keterangan</label>' + sel("im_k", gk < 0 ? 0 : gk) + '</div><div class="fld"><label>Kolom Jumlah</label>' + sel("im_a", ga < 0 ? 0 : ga) + '</div><div class="fld"><label>Jenis</label><select class="inp" id="im_kind"><option value="auto">Otomatis (− = keluar)</option><option value="inc">Semua Masuk</option><option value="exp">Semua Keluar</option></select></div><button class="mbtn pri" id="im_go">Impor ' + data.length + " baris</button></div>";
      $("#im_go").onclick = function () {
        var di = +$("#im_d").value, ki = +$("#im_k").value, ai = +$("#im_a").value, kd = $("#im_kind").value, n = 0;
        data.forEach(function (r) { var amt = parseAmt(r[ai]); if (!amt) return; var k = kd === "auto" ? (amt < 0 ? "exp" : "inc") : kd; A.S.tx.push({ id: uid(), date: parseDate(r[di]), kind: k, cat: "Impor", note: (r[ki] || "").trim() || "Impor CSV", amount: Math.abs(amt) }); n++; });
        save(); closeModal(); A.view = "ledger"; render();
      };
    }
  }

  function viewSoon() {
    var nv = NAV.filter(function (x) { return x.id === A.view; })[0] || { t: "Segera" };
    shell('<div class="content"><div class="card"><div class="soon"><div class="ic"><svg viewBox="0 0 24 24"><path d="M12 8v4l3 2"/><circle cx="12" cy="12" r="9"/></svg></div><h3>' + esc(nv.t) + '</h3><p>Layar premium ini sedang dibangun mengikuti prototipe Hi-Fi FinFlow. Dashboard, Buku Besar, Laba Rugi &amp; Tax Command sudah aktif.</p></div></div></div>', nv.t);
  }

  /* ================= ADD TRANSACTION ================= */
  function showAddTx() {
    var kind = "inc";
    function opts() { return catsFor(kind).map(function (c) { return "<option>" + esc(c) + "</option>"; }).join(""); }
    modal(MBRAND + '<button class="mx" id="x">×</button><div class="mh">Catat Pergerakan</div><div class="msub">Tambah pemasukan atau pengeluaran.</div>' +
      '<div class="seg2"><button class="on inc" data-k="inc" id="ki">Pemasukan</button><button data-k="exp" id="ke">Pengeluaran</button></div>' +
      '<div class="fld"><label>Jumlah (Rp)</label><input class="inp" id="tx_amt" inputmode="numeric" placeholder="0"></div>' +
      '<div class="fld"><label>Kategori <span class="mlink" id="tx_mgcat" style="float:right;font-size:10px;text-transform:none;letter-spacing:0">Kelola</span></label><select class="inp" id="tx_cat">' + opts() + '</select></div>' +
      '<div class="fld"><label>Keterangan</label><input class="inp" id="tx_note" placeholder="mis. Penjualan produk A"></div>' +
      '<div class="fld"><label>Tanggal</label><input class="inp" id="tx_date" type="date" value="' + new Date().toISOString().slice(0, 10) + '"></div>' +
      '<div class="mmsg" id="tx_m"></div><button class="mbtn pri" id="tx_save">Simpan transaksi</button>');
    $("#x").onclick = closeModal;
    function setKind(k) { kind = k; $("#ki").className = k === "inc" ? "on inc" : ""; $("#ke").className = k === "exp" ? "on exp" : ""; $("#tx_cat").innerHTML = opts(); }
    $("#ki").onclick = function () { setKind("inc"); }; $("#ke").onclick = function () { setKind("exp"); };
    $("#tx_mgcat").onclick = function () { closeModal(); showCategories(); };
    var amt = $("#tx_amt"); amt.oninput = function () { var v = amt.value.replace(/\D/g, ""); amt.value = v ? Number(v).toLocaleString("id-ID") : ""; };
    $("#tx_save").onclick = function () {
      var val = Number(($("#tx_amt").value || "").replace(/\D/g, ""));
      if (!val) { $("#tx_m").className = "mmsg err"; $("#tx_m").textContent = "Jumlah wajib diisi."; return; }
      A.S.tx.push({ id: uid(), date: $("#tx_date").value || new Date().toISOString().slice(0, 10), kind: kind, cat: $("#tx_cat").value, note: $("#tx_note").value.trim(), amount: val });
      save(); closeModal(); render();
    };
  }

  /* ================= PLANS / BILLING ================= */
  function planFeats(p) {
    var map = { tax_engine: "Tax Engine (PPh/PPN)", tax_calendar: "Tax Calendar", tax_health: "Tax Health Score", invoice: "Invoice & faktur", efaktur: "e-Faktur / e-Bupot", ai_assistant: "AI Assistant", voice: "Voice-to-journal", approval_workflow: "Approval workflow", consultant_mode: "Mode konsultan", audit_export: "Audit export", api_access: "Akses API" };
    var ks = (p.features || []).filter(function (f) { return map[f]; }); var top = ks.slice(0, 5).map(function (k) { return map[k]; });
    if (ks.length > 5) top.push("+" + (ks.length - 5) + " lainnya"); if (!top.length) top.push("Pembukuan & laporan dasar");
    return top.map(function (t) { return "<li>" + t + "</li>"; }).join("");
  }
  function showPlans() {
    var cur = A.plan && A.plan.id;
    var cards = A.plans.map(function (p) {
      var paid = p.price_idr > 0, isc = p.id === cur;
      return '<div class="plan' + (paid && !isc ? " feat" : "") + '"><h4>' + esc(p.name) + (isc ? ' <span class="tag">Aktif</span>' : "") + '</h4><div class="pr">' + (paid ? rp(p.price_idr) + ' <small>/ ' + (p.interval === "year" ? "thn" : "bln") + "</small>" : "Gratis") + '</div><ul>' + planFeats(p) + "</ul>" + (paid && !isc ? '<button class="mbtn pri" data-buy="' + p.id + '" style="margin-top:12px">Berlangganan via BCA VA</button>' : "") + "</div>";
    }).join("");
    modal(MBRAND + '<button class="mx" id="x">×</button><div class="mh">Paket FinFlow</div><div class="msub">Paket aktif: <b style="color:var(--ink)">' + esc((A.plan && A.plan.name) || "-") + "</b></div>" + cards, true);
    $("#x").onclick = closeModal;
    root.querySelectorAll && document.querySelectorAll("[data-buy]").forEach(function (e) { e.onclick = function () { startPay(e.getAttribute("data-buy")); }; });
  }
  function startPay(planId) {
    var plan = A.plans.filter(function (p) { return p.id === planId; })[0];
    modal(MBRAND + '<div class="mh">Menyiapkan tagihan…</div><div class="msub">Membuat BCA Virtual Account untuk ' + esc(plan.name) + '.</div><div class="spin"></div>');
    sb.functions.invoke("create-payment", { body: { company_id: A.company.id, plan_id: planId } }).then(function (r) {
      var d = r.data; if (r.error || (d && d.error)) throw new Error((d && d.error) || r.error.message);
      var exp = d.expiry_time ? new Date(d.expiry_time.replace(" ", "T")).toLocaleString("id-ID") : "-";
      modal(MBRAND + '<button class="mx" id="x">×</button><div class="mh">Bayar via BCA VA</div><div class="msub">Transfer tepat <b style="color:var(--ink)">' + rp(d.amount_idr) + '</b> ke Virtual Account BCA:</div>' +
        '<div style="background:var(--bg-0);border:1px dashed var(--line-gold);border-radius:14px;padding:14px"><div style="text-align:center;color:var(--faint);font-size:11px">Bank BCA · Virtual Account</div><div class="va">' + (d.va_number || "-") + '</div><div style="text-align:center;color:var(--faint);font-size:11px">Berlaku s/d ' + exp + '</div></div>' +
        '<div class="msub" style="margin-top:14px">Langganan aktif otomatis setelah pembayaran terkonfirmasi.</div><button class="mbtn pri" id="chk">Saya sudah bayar — cek status</button><div class="mmsg" id="cm"></div>');
      $("#x").onclick = closeModal;
      $("#chk").onclick = function () { $("#cm").textContent = "Mengecek…"; loadSub().then(function () { if (A.sub && A.sub.plan_id === planId && A.sub.status === "active") { closeModal(); render(); } else { $("#cm").className = "mmsg err"; $("#cm").textContent = "Belum terkonfirmasi. Coba lagi sesaat setelah transfer."; } }); };
    }).catch(function (e) {
      modal(MBRAND + '<button class="mx" id="x">×</button><div class="mh">Gagal membuat tagihan</div><div class="msub">' + esc(e.message || String(e)) + '</div><div class="msub" style="font-size:12px">Pastikan gateway pembayaran (Midtrans) sudah dikonfigurasi.</div><button class="mbtn ghost" id="x2">Tutup</button>');
      $("#x").onclick = closeModal; $("#x2").onclick = closeModal;
    });
  }

  /* ================= UI v2 — toast, sidebar, create menu, search ================= */
  var _toastT;
  function toast(msg) {
    var t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(_toastT); _toastT = setTimeout(function () { t.classList.remove("show"); }, 2400);
  }
  function toggleSB() {
    var app = $(".app"); if (!app) return;
    var c = !app.classList.contains("sbc");
    try { localStorage.setItem("ff_sbc", c ? "1" : ""); } catch (e) {}
    render();
  }
  var CREATE_ACTIONS = [
    { fn: "tx", l: "Transaksi", s: "Pemasukan / pengeluaran", c: "#34d399", ic: '<path d="M12 5v14M5 12h14"/>' },
    { fn: "inv", l: "Invoice", s: "Faktur tagihan ke klien", c: "#d4af37", ic: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>' },
    { fn: "quote", l: "Penawaran", s: "Quotation / proposal harga", c: "#60a5fa", ic: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v4h4"/>' },
    { fn: "po", l: "Purchase Order", s: "Pesanan pembelian ke vendor", c: "#f59e0b", ic: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>' },
    { fn: "kw", l: "Kuitansi", s: "Bukti terima pembayaran", c: "#a78bfa", ic: '<path d="M4 3h16v18l-2-1-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/><path d="M8 8h8M8 12h6"/>' },
    { fn: "prod", l: "Produk / Jasa", s: "Tambah item katalog", c: "#f472b6", ic: '<path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>' },
    { fn: "emp", l: "Karyawan", s: "Payroll & slip gaji", c: "#2dd4bf", ic: '<circle cx="9" cy="7" r="4"/><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>' },
    { fn: "rec", l: "Transaksi Berulang", s: "Otomatis tiap bulan", c: "#fb923c", ic: '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>' },
  ];
  function openCreateMenu() {
    var w = document.getElementById("createMenu");
    if (!w) { w = document.createElement("div"); w.id = "createMenu"; document.body.appendChild(w); }
    w.innerHTML = '<div class="cm-sheet"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-family:var(--disp);font-size:20px">Buat Baru</b><span class="mlink" id="cmX" style="font-size:17px;color:var(--faint)">✕</span></div><div class="cm-grid">' +
      CREATE_ACTIONS.map(function (a, i) { return '<button class="cm-item" data-cm="' + i + '"><span class="cm-ico" style="background:' + a.c + '"><svg viewBox="0 0 24 24">' + a.ic + '</svg></span><span class="cm-tx"><b>' + a.l + "</b><small>" + a.s + "</small></span></button>"; }).join("") + "</div></div>";
    w.classList.add("show");
    w.onclick = function (e) { if (e.target === w) closeCreateMenu(); };
    $("#cmX").onclick = closeCreateMenu;
    w.querySelectorAll("[data-cm]").forEach(function (b) {
      b.onclick = function () {
        closeCreateMenu();
        var fn = CREATE_ACTIONS[+b.getAttribute("data-cm")].fn;
        if (fn === "tx") showAddTx(); else if (fn === "inv") showAddInvoice(); else if (fn === "quote") showAddQuote(); else if (fn === "po") showAddPO(); else if (fn === "kw") showAddReceipt(); else if (fn === "prod") showAddProduct(); else if (fn === "emp") showAddEmployee(); else showAddRecur();
      };
    });
  }
  function closeCreateMenu() { var w = document.getElementById("createMenu"); if (w) w.classList.remove("show"); }
  function openSearch() {
    modal(MBRAND + '<button class="mx" id="x">×</button><div class="mh">Cari</div><div class="msub">Menu, transaksi, invoice, penawaran, PO, kuitansi, produk, karyawan.</div>' +
      '<input class="inp" id="gsQ" placeholder="Ketik apa saja… (min. 2 huruf)" autocomplete="off">' +
      '<div id="gsR" style="margin-top:10px;max-height:46vh;overflow:auto"></div>', true);
    $("#x").onclick = closeModal;
    var q = $("#gsQ"); q.focus();
    q.oninput = function () { runSearch(q.value); };
    runSearch("");
  }
  function runSearch(q) {
    var box = $("#gsR"); if (!box) return;
    q = (q || "").toLowerCase().trim();
    if (q.length < 2) { box.innerHTML = '<div style="color:var(--faint);font-size:13px;text-align:center;padding:18px">Ketik minimal 2 huruf…</div>'; return; }
    function m(s) { return String(s == null ? "" : s).toLowerCase().indexOf(q) >= 0; }
    var hits = [];
    NAV.forEach(function (n) { if (!n.g && m(n.t)) hits.push({ v: n.id, ic: "📂", t: n.t, d: "Buka menu" }); });
    (A.S.tx || []).forEach(function (t) { if (m(t.note) || m(t.cat) || m(t.amount)) hits.push({ v: "ledger", ic: t.kind === "inc" ? "💰" : "💸", t: t.note || t.cat, d: new Date(t.date).toLocaleDateString("id-ID") + " · " + rp(t.amount) }); });
    (A.S.invoices || []).forEach(function (i) { if (m(i.no) || m(i.client) || m(i.desc)) hits.push({ v: "invoice", ic: "🧾", t: i.no + " · " + i.client, d: rp(i.total) + " · " + (i.status === "paid" ? "Lunas" : "Belum bayar") }); });
    (A.S.quotes || []).forEach(function (x) { if (m(x.no) || m(x.client) || m(x.desc)) hits.push({ v: "penawaran", ic: "📄", t: x.no + " · " + x.client, d: rp(x.total) }); });
    (A.S.purchases || []).forEach(function (x) { if (m(x.no) || m(x.vendor) || m(x.desc)) hits.push({ v: "po", ic: "📦", t: x.no + " · " + x.vendor, d: rp(x.total) }); });
    (A.S.receipts || []).forEach(function (x) { if (m(x.no) || m(x.from) || m(x.untuk)) hits.push({ v: "kuitansi", ic: "🧾", t: x.no + " · " + x.from, d: rp(x.amount) }); });
    (A.S.products || []).forEach(function (x) { if (m(x.name)) hits.push({ v: "katalog", ic: "🏷️", t: x.name, d: rp(x.price) + (x.unit ? " / " + x.unit : "") }); });
    (A.S.employees || []).forEach(function (x) { if (m(x.name)) hits.push({ v: "payroll", ic: "👤", t: x.name, d: "Karyawan · " + rp(x.gaji) }); });
    if (!hits.length) { box.innerHTML = '<div style="color:var(--faint);font-size:13px;text-align:center;padding:18px">Tidak ada hasil untuk “' + esc(q) + '”.</div>'; return; }
    box.innerHTML = hits.slice(0, 30).map(function (h) { return '<div class="gs-hit" data-gs="' + h.v + '"><span style="font-size:17px">' + h.ic + '</span><div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(h.t) + '</div><div style="font-size:11px;color:var(--faint)">' + esc(h.d) + '</div></div><span style="color:var(--faint);font-size:11px">↵</span></div>'; }).join("");
    box.querySelectorAll("[data-gs]").forEach(function (e) { e.onclick = function () { closeModal(); var v = e.getAttribute("data-gs"); var nv = NAV.filter(function (x) { return x.id === v; })[0]; if (nv && nv.f && !can(nv.f)) { showPlans(); return; } A.view = v; render(); }; });
  }
  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) { e.preventDefault(); if (A.S) openSearch(); }
  });

  /* ================= SHARED HELPERS (dokumen & operasional) ================= */
  function docNo(prefix, arr) { var d = new Date(); return prefix + "/" + d.getFullYear() + "/" + ("0" + (d.getMonth() + 1)).slice(-2) + "/" + ("000" + ((arr || []).length + 1)).slice(-4); }
  function moneyIn(el) { if (!el) return; el.oninput = function () { var v = el.value.replace(/\D/g, ""); el.value = v ? Number(v).toLocaleString("id-ID") : ""; }; }
  function nval(id) { return Number(($("#" + id).value || "").replace(/\D/g, "")); }
  function byId(arr, id) { return (arr || []).filter(function (x) { return x.id === id; })[0]; }
  function delFrom(key, id) { A.S[key] = A.S[key].filter(function (x) { return x.id !== id; }); save(); toast("Dihapus"); render(); }
  function tdR(v, color) { return '<td style="text-align:right;font-family:var(--mono);color:' + (color || "var(--val)") + '">' + v + "</td>"; }
  function fmtD(s) { return s ? new Date(s).toLocaleDateString("id-ID") : "-"; }
  function monthKey(d) { d = d || new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2); }
  function terbilang(n) {
    n = Math.round(Math.abs(n || 0));
    var a = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
    function t(x) {
      if (x < 12) return a[x];
      if (x < 20) return t(x - 10) + " belas";
      if (x < 100) return t(Math.floor(x / 10)) + " puluh" + (x % 10 ? " " + t(x % 10) : "");
      if (x < 200) return "seratus" + (x - 100 ? " " + t(x - 100) : "");
      if (x < 1000) return t(Math.floor(x / 100)) + " ratus" + (x % 100 ? " " + t(x % 100) : "");
      if (x < 2000) return "seribu" + (x - 1000 ? " " + t(x - 1000) : "");
      if (x < 1e6) return t(Math.floor(x / 1000)) + " ribu" + (x % 1000 ? " " + t(x % 1000) : "");
      if (x < 1e9) return t(Math.floor(x / 1e6)) + " juta" + (x % 1e6 ? " " + t(x % 1e6) : "");
      if (x < 1e12) return t(Math.floor(x / 1e9)) + " miliar" + (x % 1e9 ? " " + t(x % 1e9) : "");
      return t(Math.floor(x / 1e12)) + " triliun" + (x % 1e12 ? " " + t(x % 1e12) : "");
    }
    return n ? t(n) + " rupiah" : "nol rupiah";
  }
  function prodDatalist() { return '<datalist id="prodDL">' + (A.S.products || []).map(function (p) { return '<option value="' + esc(p.name) + '">'; }).join("") + "</datalist>"; }
  function prodAutofill(descId, priceId) {
    var d = $("#" + descId); if (!d) return; d.setAttribute("list", "prodDL");
    d.addEventListener("input", function () {
      var p = (A.S.products || []).filter(function (x) { return x.name === d.value; })[0];
      if (p && p.price) { var pr = $("#" + priceId); if (pr) pr.value = Number(p.price).toLocaleString("id-ID"); }
    });
  }
  function docHead(title, no, pill) {
    var co = A.company || {};
    return '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px"><div>' + (A.S.profile && A.S.profile.logo ? '<img src="' + A.S.profile.logo + '" style="max-height:44px;margin-bottom:6px;display:block">' : "") + '<div style="font-family:var(--disp);font-size:22px">' + esc(co.name || "Perusahaan") + '</div><div style="color:var(--faint);font-size:11px">' + esc(co.npwp ? ("NPWP " + co.npwp) : "") + '</div></div><div style="text-align:right"><div style="font-family:var(--disp);font-size:20px;color:var(--gold-lt)">' + title + '</div><div style="color:var(--soft);font-size:12px;font-family:var(--mono)">' + esc(no) + "</div>" + (pill || "") + "</div></div>";
  }

  /* ================= KATALOG PRODUK ================= */
  function showAddProduct(id) {
    var p = byId(A.S.products, id) || { type: "jasa" };
    modal(MBRAND + '<button class="mx" id="x">×</button><div class="mh">' + (id ? "Ubah" : "Tambah") + ' Produk / Jasa</div><div class="msub">Item katalog — otomatis muncul saat membuat invoice, penawaran &amp; PO.</div>' +
      '<div class="fld"><label>Nama</label><input class="inp" id="pd_n" value="' + esc(p.name || "") + '" placeholder="mis. Jasa Konsultasi Pajak"></div>' +
      '<div style="display:flex;gap:10px"><div class="fld" style="flex:1"><label>Jenis</label><select class="inp" id="pd_t"><option value="jasa"' + (p.type === "jasa" ? " selected" : "") + '>Jasa</option><option value="barang"' + (p.type === "barang" ? " selected" : "") + '>Barang</option></select></div><div class="fld" style="flex:1"><label>Satuan</label><input class="inp" id="pd_u" value="' + esc(p.unit || "") + '" placeholder="unit / jam / pcs"></div></div>' +
      '<div class="fld"><label>Harga (Rp)</label><input class="inp" id="pd_p" inputmode="numeric" value="' + (p.price ? Number(p.price).toLocaleString("id-ID") : "") + '" placeholder="0"></div>' +
      '<div class="mmsg" id="pd_m"></div><button class="mbtn pri" id="pd_s">Simpan</button>');
    $("#x").onclick = closeModal; moneyIn($("#pd_p"));
    $("#pd_s").onclick = function () {
      var name = $("#pd_n").value.trim(), price = nval("pd_p"), msg = $("#pd_m"); msg.className = "mmsg err";
      if (!name) { msg.textContent = "Nama wajib diisi."; return; }
      if (id) { p.name = name; p.type = $("#pd_t").value; p.unit = $("#pd_u").value.trim(); p.price = price; }
      else A.S.products.push({ id: uid(), name: name, type: $("#pd_t").value, unit: $("#pd_u").value.trim(), price: price });
      save(); closeModal(); toast("✓ Produk tersimpan"); render();
    };
  }
  function viewKatalog() {
    var ps = A.S.products || [];
    var rows = ps.map(function (p) {
      return '<tr><td><span class="m">' + esc(p.name) + '</span></td><td><span class="pill ' + (p.type === "jasa" ? "warn" : "pos") + '">' + esc(p.type) + "</span></td><td>" + esc(p.unit || "-") + "</td>" + tdR(rp(p.price)) +
        '<td style="text-align:right;white-space:nowrap"><span class="mlink" data-ed="' + p.id + '">ubah</span> · <span class="mlink" data-dl="' + p.id + '" style="color:var(--neg)">hapus</span></td></tr>';
    }).join("");
    var inner = '<div class="content"><div class="phead"><div><div class="pt">Katalog Produk</div><div class="ps">Daftar produk &amp; jasa — dipakai otomatis di invoice, penawaran, dan PO.</div></div><div class="acts"><button class="btn pri" id="addP"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg> Tambah</button></div></div>' +
      '<div class="kpis" style="grid-template-columns:repeat(3,1fr)">' +
      kpi("Total Item", String(ps.length), '<path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>', "up", "produk & jasa") +
      kpi("Jasa", String(ps.filter(function (p) { return p.type === "jasa"; }).length), '<path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.3 1 2.5h6c0-1.2.2-1.7 1-2.5A6 6 0 0 0 12 3z"/>', "up", "layanan") +
      kpi("Barang", String(ps.filter(function (p) { return p.type === "barang"; }).length), '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>', "up", "fisik") +
      '</div><div class="card">' + (ps.length ? '<table class="tbl"><thead><tr><th>Nama</th><th>Jenis</th><th>Satuan</th><th style="text-align:right">Harga</th><th></th></tr></thead><tbody>' + rows + "</tbody></table>" : '<div class="empty">Belum ada item katalog. Klik <b>Tambah</b>.</div>') + "</div></div>";
    shell(inner, "Katalog Produk");
    $("#addP").onclick = function () { showAddProduct(); };
    root.querySelectorAll("[data-ed]").forEach(function (e) { e.onclick = function () { showAddProduct(e.getAttribute("data-ed")); }; });
    root.querySelectorAll("[data-dl]").forEach(function (e) { e.onclick = function () { delFrom("products", e.getAttribute("data-dl")); }; });
  }

  /* ================= PENAWARAN (QUOTATION) ================= */
  function showAddQuote() {
    modal(MBRAND + '<button class="mx" id="x">×</button><div class="mh">Buat Penawaran</div><div class="msub">Quotation ' + docNo("PEN", A.S.quotes) + "</div>" + prodDatalist() +
      '<div class="fld"><label>Klien</label><input class="inp" id="qt_c" placeholder="Nama klien / perusahaan"></div>' +
      '<div class="fld"><label>Deskripsi</label><input class="inp" id="qt_d" placeholder="mis. Jasa desain — atau pilih dari katalog"></div>' +
      '<div style="display:flex;gap:10px"><div class="fld" style="flex:1"><label>Qty</label><input class="inp" id="qt_q" inputmode="numeric" value="1"></div><div class="fld" style="flex:2"><label>Harga satuan (Rp)</label><input class="inp" id="qt_p" inputmode="numeric" placeholder="0"></div></div>' +
      '<div style="display:flex;gap:10px"><div class="fld" style="flex:1"><label>Tanggal</label><input class="inp" id="qt_dt" type="date" value="' + new Date().toISOString().slice(0, 10) + '"></div><div class="fld" style="flex:1"><label>Berlaku s.d.</label><input class="inp" id="qt_vl" type="date" value="' + new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10) + '"></div></div>' +
      '<label style="display:flex;align-items:center;gap:8px;color:var(--soft);font-size:13px;margin:6px 0"><input type="checkbox" id="qt_ppn"> Tambah PPN 11%</label>' +
      '<div class="mmsg" id="qt_m"></div><button class="mbtn pri" id="qt_s">Simpan penawaran</button>');
    $("#x").onclick = closeModal; moneyIn($("#qt_p")); prodAutofill("qt_d", "qt_p");
    $("#qt_s").onclick = function () {
      var qty = Number(($("#qt_q").value || "1").replace(/\D/g, "")) || 1, price = nval("qt_p"), msg = $("#qt_m"); msg.className = "mmsg err";
      if (!$("#qt_c").value.trim()) { msg.textContent = "Nama klien wajib diisi."; return; }
      if (!price) { msg.textContent = "Harga wajib diisi."; return; }
      var ppn = $("#qt_ppn").checked, total = Math.round(qty * price * (ppn ? 1.11 : 1));
      A.S.quotes.push({ id: uid(), no: docNo("PEN", A.S.quotes), client: $("#qt_c").value.trim(), desc: $("#qt_d").value.trim() || "Layanan", qty: qty, price: price, ppn: ppn, total: total, date: $("#qt_dt").value, valid: $("#qt_vl").value, status: "draft" });
      save(); closeModal(); toast("✓ Penawaran dibuat"); A.view = "penawaran"; render();
    };
  }
  var QSTAT = { draft: ["warn", "Draft"], terkirim: ["warn", "Terkirim"], diterima: ["pos", "Diterima"], ditolak: ["neg", "Ditolak"] };
  function quoteDoc(id) {
    var x = byId(A.S.quotes, id); if (!x) return;
    var sub = x.qty * x.price, ppnAmt = x.ppn ? Math.round(sub * 0.11) : 0, st = QSTAT[x.status] || QSTAT.draft;
    modal(MBRAND + '<button class="mx" id="x">×</button>' +
      docHead("PENAWARAN", x.no, '<span class="pill ' + st[0] + '">' + st[1].toUpperCase() + "</span>") +
      '<div style="border-top:1px solid var(--line);padding-top:12px;margin-bottom:10px;font-size:13px"><div style="color:var(--faint);font-size:11px">KEPADA</div><div style="font-weight:600">' + esc(x.client) + '</div><div style="color:var(--soft);font-size:12px;margin-top:4px">Tanggal ' + fmtD(x.date) + " · Berlaku s.d. " + fmtD(x.valid) + "</div></div>" +
      '<table class="tbl" style="font-size:13px"><thead><tr><th>Deskripsi</th><th style="text-align:right">Qty</th><th style="text-align:right">Harga</th><th style="text-align:right">Jumlah</th></tr></thead><tbody>' +
      '<tr><td><span class="m">' + esc(x.desc) + '</span></td><td style="text-align:right">' + x.qty + "</td>" + tdR(rp(x.price)) + tdR(rp(sub)) + "</tr>" +
      (ppnAmt ? '<tr><td colspan="3" style="text-align:right;color:var(--soft)">PPN 11%</td>' + tdR(rp(ppnAmt)) + "</tr>" : "") +
      '<tr><td colspan="3" style="text-align:right" class="m">Total</td><td style="text-align:right;font-family:var(--disp);font-size:18px;color:var(--gold-lt)">' + rp(x.total) + "</td></tr></tbody></table>" +
      '<div style="color:var(--faint);font-size:11px;margin-top:8px">Harga di atas berlaku sampai ' + fmtD(x.valid) + ". Hubungi kami untuk pertanyaan.</div>" +
      '<button class="mbtn pri" id="qd_pr" style="margin-top:14px">Cetak / Simpan PDF</button>' +
      (x.status !== "diterima" && x.status !== "ditolak" ? '<button class="mbtn ghost" id="qd_iv">✓ Jadikan Invoice</button>' : "") +
      '<button class="mbtn ghost" id="qd_cl">Tutup</button>');
    $("#x").onclick = closeModal; $("#qd_cl").onclick = closeModal;
    $("#qd_pr").onclick = function () { window.print(); };
    var iv = $("#qd_iv"); if (iv) iv.onclick = function () { closeModal(); quoteToInvoice(id); };
  }
  function quoteToInvoice(id) {
    var x = byId(A.S.quotes, id); if (!x) return;
    A.S.invoices.push({ id: uid(), no: invNo(), client: x.client, desc: x.desc, qty: x.qty, price: x.price, ppn: x.ppn, total: x.total, date: new Date().toISOString().slice(0, 10), due: new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10), status: "unpaid", posted: false });
    x.status = "diterima"; save(); toast("✓ Invoice dibuat dari penawaran"); A.view = "invoice"; render();
  }
  function viewPenawaran() {
    var qs = (A.S.quotes || []).slice().sort(function (a, b) { return (b.date > a.date ? 1 : -1); });
    var tot = 0, acc = 0; qs.forEach(function (x) { tot += x.total; if (x.status === "diterima") acc += x.total; });
    var rows = qs.map(function (x) {
      var st = QSTAT[x.status] || QSTAT.draft;
      var acts = ['<span class="mlink" data-vq="' + x.id + '">Lihat</span>'];
      if (x.status === "draft") acts.push('<span class="mlink" data-sq="' + x.id + '" style="color:var(--warn)">kirim</span>');
      if (x.status === "draft" || x.status === "terkirim") { acts.push('<span class="mlink" data-iq="' + x.id + '" style="color:var(--pos)">✓ invoice</span>'); acts.push('<span class="mlink" data-rq="' + x.id + '" style="color:var(--neg)">tolak</span>'); }
      acts.push('<span class="mlink" data-dq="' + x.id + '" style="color:var(--neg)">hapus</span>');
      return '<tr><td><span class="m">' + esc(x.no) + "</span></td><td>" + esc(x.client) + "</td><td>" + fmtD(x.date) + '</td><td style="color:var(--soft)">' + fmtD(x.valid) + "</td>" + tdR(rp(x.total)) + '<td><span class="pill ' + st[0] + '">' + st[1] + '</span></td><td style="text-align:right;white-space:nowrap">' + acts.join(" · ") + "</td></tr>";
    }).join("");
    var inner = '<div class="content"><div class="phead"><div><div class="pt">Penawaran</div><div class="ps">Quotation ke calon klien — sekali klik jadi invoice saat deal.</div></div><div class="acts"><button class="btn pri" id="addQ"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg> Buat Penawaran</button></div></div>' +
      '<div class="kpis" style="grid-template-columns:repeat(3,1fr)">' +
      kpi("Total Penawaran", String(qs.length), '<path d="M6 3h9l4 4v14H6z"/>', "up", rpShort(tot)) +
      kpi("Deal Diterima", rpShort(acc), '<path d="M20 6 9 17l-5-5"/>', "up", "terkonversi") +
      kpi("Konversi", (qs.length ? Math.round(qs.filter(function (x) { return x.status === "diterima"; }).length / qs.length * 100) + "%" : "—"), '<path d="M3 17l5-5 4 4 8-8"/>', "up", "penawaran → invoice") +
      '</div><div class="card">' + (qs.length ? '<table class="tbl"><thead><tr><th>No</th><th>Klien</th><th>Tanggal</th><th>Berlaku s.d.</th><th style="text-align:right">Total</th><th>Status</th><th></th></tr></thead><tbody>' + rows + "</tbody></table>" : '<div class="empty">Belum ada penawaran. Klik <b>Buat Penawaran</b>.</div>') + "</div></div>";
    shell(inner, "Penawaran");
    $("#addQ").onclick = showAddQuote;
    root.querySelectorAll("[data-vq]").forEach(function (e) { e.onclick = function () { quoteDoc(e.getAttribute("data-vq")); }; });
    root.querySelectorAll("[data-sq]").forEach(function (e) { e.onclick = function () { var x = byId(A.S.quotes, e.getAttribute("data-sq")); if (x) { x.status = "terkirim"; save(); toast("✓ Ditandai terkirim"); render(); } }; });
    root.querySelectorAll("[data-iq]").forEach(function (e) { e.onclick = function () { quoteToInvoice(e.getAttribute("data-iq")); }; });
    root.querySelectorAll("[data-rq]").forEach(function (e) { e.onclick = function () { var x = byId(A.S.quotes, e.getAttribute("data-rq")); if (x) { x.status = "ditolak"; save(); render(); } }; });
    root.querySelectorAll("[data-dq]").forEach(function (e) { e.onclick = function () { delFrom("quotes", e.getAttribute("data-dq")); }; });
  }

  /* ================= PURCHASE ORDER ================= */
  function showAddPO() {
    modal(MBRAND + '<button class="mx" id="x">×</button><div class="mh">Buat Purchase Order</div><div class="msub">PO ' + docNo("PO", A.S.purchases) + "</div>" + prodDatalist() +
      '<div class="fld"><label>Vendor / Pemasok</label><input class="inp" id="po_v" placeholder="Nama vendor"></div>' +
      '<div class="fld"><label>Deskripsi barang/jasa</label><input class="inp" id="po_d" placeholder="mis. ATK kantor"></div>' +
      '<div style="display:flex;gap:10px"><div class="fld" style="flex:1"><label>Qty</label><input class="inp" id="po_q" inputmode="numeric" value="1"></div><div class="fld" style="flex:2"><label>Harga satuan (Rp)</label><input class="inp" id="po_p" inputmode="numeric" placeholder="0"></div></div>' +
      '<div class="fld"><label>Tanggal</label><input class="inp" id="po_dt" type="date" value="' + new Date().toISOString().slice(0, 10) + '"></div>' +
      '<div class="mmsg" id="po_m"></div><button class="mbtn pri" id="po_s">Simpan PO</button>');
    $("#x").onclick = closeModal; moneyIn($("#po_p")); prodAutofill("po_d", "po_p");
    $("#po_s").onclick = function () {
      var qty = Number(($("#po_q").value || "1").replace(/\D/g, "")) || 1, price = nval("po_p"), msg = $("#po_m"); msg.className = "mmsg err";
      if (!$("#po_v").value.trim()) { msg.textContent = "Nama vendor wajib diisi."; return; }
      if (!price) { msg.textContent = "Harga wajib diisi."; return; }
      A.S.purchases.push({ id: uid(), no: docNo("PO", A.S.purchases), vendor: $("#po_v").value.trim(), desc: $("#po_d").value.trim() || "Pembelian", qty: qty, price: price, total: qty * price, date: $("#po_dt").value, status: "draft", posted: false });
      save(); closeModal(); toast("✓ PO dibuat"); A.view = "po"; render();
    };
  }
  var POSTAT = { draft: ["warn", "Draft"], dikirim: ["warn", "Dikirim"], diterima: ["pos", "Diterima"] };
  function poDoc(id) {
    var x = byId(A.S.purchases, id); if (!x) return;
    var st = POSTAT[x.status] || POSTAT.draft;
    modal(MBRAND + '<button class="mx" id="x">×</button>' +
      docHead("PURCHASE ORDER", x.no, '<span class="pill ' + st[0] + '">' + st[1].toUpperCase() + "</span>") +
      '<div style="border-top:1px solid var(--line);padding-top:12px;margin-bottom:10px;font-size:13px"><div style="color:var(--faint);font-size:11px">KEPADA VENDOR</div><div style="font-weight:600">' + esc(x.vendor) + '</div><div style="color:var(--soft);font-size:12px;margin-top:4px">Tanggal ' + fmtD(x.date) + "</div></div>" +
      '<table class="tbl" style="font-size:13px"><thead><tr><th>Deskripsi</th><th style="text-align:right">Qty</th><th style="text-align:right">Harga</th><th style="text-align:right">Jumlah</th></tr></thead><tbody>' +
      '<tr><td><span class="m">' + esc(x.desc) + '</span></td><td style="text-align:right">' + x.qty + "</td>" + tdR(rp(x.price)) + tdR(rp(x.total)) + "</tr>" +
      '<tr><td colspan="3" style="text-align:right" class="m">Total</td><td style="text-align:right;font-family:var(--disp);font-size:18px;color:var(--gold-lt)">' + rp(x.total) + "</td></tr></tbody></table>" +
      '<div style="color:var(--faint);font-size:11px;margin-top:8px">Mohon kirim barang/jasa sesuai spesifikasi di atas beserta invoice ke ' + esc((A.company || {}).name || "kami") + ".</div>" +
      '<button class="mbtn pri" id="pd_pr" style="margin-top:14px">Cetak / Simpan PDF</button><button class="mbtn ghost" id="pd_cl">Tutup</button>');
    $("#x").onclick = closeModal; $("#pd_cl").onclick = closeModal;
    $("#pd_pr").onclick = function () { window.print(); };
  }
  function poReceive(id) {
    var x = byId(A.S.purchases, id); if (!x) return;
    x.status = "diterima";
    if (!x.posted) { A.S.tx.push({ id: uid(), date: new Date().toISOString().slice(0, 10), kind: "exp", cat: "Pembelian", note: "PO " + x.no + " — " + x.vendor, amount: x.total }); x.posted = true; }
    save(); toast("✓ PO diterima — beban tercatat otomatis"); render();
  }
  function viewPO() {
    var ps = (A.S.purchases || []).slice().sort(function (a, b) { return (b.date > a.date ? 1 : -1); });
    var tot = 0, rec = 0; ps.forEach(function (x) { tot += x.total; if (x.status === "diterima") rec += x.total; });
    var rows = ps.map(function (x) {
      var st = POSTAT[x.status] || POSTAT.draft;
      var acts = ['<span class="mlink" data-vp="' + x.id + '">Lihat</span>'];
      if (x.status === "draft") acts.push('<span class="mlink" data-sp="' + x.id + '" style="color:var(--warn)">kirim</span>');
      if (x.status !== "diterima") acts.push('<span class="mlink" data-rp="' + x.id + '" style="color:var(--pos)">✓ diterima</span>');
      acts.push('<span class="mlink" data-dp="' + x.id + '" style="color:var(--neg)">hapus</span>');
      return '<tr><td><span class="m">' + esc(x.no) + "</span></td><td>" + esc(x.vendor) + "</td><td>" + esc(x.desc) + "</td><td>" + fmtD(x.date) + "</td>" + tdR(rp(x.total)) + '<td><span class="pill ' + st[0] + '">' + st[1] + '</span></td><td style="text-align:right;white-space:nowrap">' + acts.join(" · ") + "</td></tr>";
    }).join("");
    var inner = '<div class="content"><div class="phead"><div><div class="pt">Purchase Order</div><div class="ps">Pesanan ke vendor — saat barang diterima, beban tercatat otomatis.</div></div><div class="acts"><button class="btn pri" id="addPO"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg> Buat PO</button></div></div>' +
      '<div class="kpis" style="grid-template-columns:repeat(3,1fr)">' +
      kpi("Total PO", String(ps.length), '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>', "up", rpShort(tot)) +
      kpi("Sudah Diterima", rpShort(rec), '<path d="M20 6 9 17l-5-5"/>', "up", "masuk beban") +
      kpi("Dalam Proses", rpShort(tot - rec), '<circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/>', (tot - rec) > 0 ? "dn" : "up", "belum diterima") +
      '</div><div class="card">' + (ps.length ? '<table class="tbl"><thead><tr><th>No</th><th>Vendor</th><th>Deskripsi</th><th>Tanggal</th><th style="text-align:right">Total</th><th>Status</th><th></th></tr></thead><tbody>' + rows + "</tbody></table>" : '<div class="empty">Belum ada purchase order. Klik <b>Buat PO</b>.</div>') + "</div></div>";
    shell(inner, "Purchase Order");
    $("#addPO").onclick = showAddPO;
    root.querySelectorAll("[data-vp]").forEach(function (e) { e.onclick = function () { poDoc(e.getAttribute("data-vp")); }; });
    root.querySelectorAll("[data-sp]").forEach(function (e) { e.onclick = function () { var x = byId(A.S.purchases, e.getAttribute("data-sp")); if (x) { x.status = "dikirim"; save(); render(); } }; });
    root.querySelectorAll("[data-rp]").forEach(function (e) { e.onclick = function () { poReceive(e.getAttribute("data-rp")); }; });
    root.querySelectorAll("[data-dp]").forEach(function (e) { e.onclick = function () { delFrom("purchases", e.getAttribute("data-dp")); }; });
  }

  /* ================= KUITANSI ================= */
  function showAddReceipt() {
    modal(MBRAND + '<button class="mx" id="x">×</button><div class="mh">Buat Kuitansi</div><div class="msub">Kuitansi ' + docNo("KW", A.S.receipts) + "</div>" +
      '<div class="fld"><label>Telah diterima dari</label><input class="inp" id="kw_f" placeholder="Nama pembayar"></div>' +
      '<div class="fld"><label>Jumlah (Rp)</label><input class="inp" id="kw_a" inputmode="numeric" placeholder="0"></div>' +
      '<div class="fld"><label>Untuk pembayaran</label><input class="inp" id="kw_u" placeholder="mis. Pelunasan invoice INV/2026/07/0001"></div>' +
      '<div style="display:flex;gap:10px"><div class="fld" style="flex:1"><label>Metode</label><select class="inp" id="kw_m"><option>Transfer bank</option><option>Tunai</option><option>QRIS</option><option>Lainnya</option></select></div><div class="fld" style="flex:1"><label>Tanggal</label><input class="inp" id="kw_dt" type="date" value="' + new Date().toISOString().slice(0, 10) + '"></div></div>' +
      '<div class="mmsg" id="kw_msg"></div><button class="mbtn pri" id="kw_s">Simpan kuitansi</button>');
    $("#x").onclick = closeModal; moneyIn($("#kw_a"));
    $("#kw_s").onclick = function () {
      var amt = nval("kw_a"), msg = $("#kw_msg"); msg.className = "mmsg err";
      if (!$("#kw_f").value.trim()) { msg.textContent = "Nama pembayar wajib diisi."; return; }
      if (!amt) { msg.textContent = "Jumlah wajib diisi."; return; }
      A.S.receipts.push({ id: uid(), no: docNo("KW", A.S.receipts), from: $("#kw_f").value.trim(), amount: amt, untuk: $("#kw_u").value.trim() || "Pembayaran", method: $("#kw_m").value, date: $("#kw_dt").value });
      save(); closeModal(); toast("✓ Kuitansi dibuat"); A.view = "kuitansi"; render();
    };
  }
  function receiptDoc(id) {
    var x = byId(A.S.receipts, id); if (!x) return;
    var co = A.company || {};
    modal(MBRAND + '<button class="mx" id="x">×</button>' +
      docHead("KUITANSI", x.no, '<span class="pill pos">SAH</span>') +
      '<div style="border-top:1px solid var(--line);padding-top:14px;font-size:13.5px;line-height:2">' +
      '<div style="display:flex;gap:8px"><span style="color:var(--faint);min-width:150px">Telah diterima dari</span><b>' + esc(x.from) + "</b></div>" +
      '<div style="display:flex;gap:8px"><span style="color:var(--faint);min-width:150px">Uang sejumlah</span><b style="font-family:var(--mono);color:var(--gold-lt)">' + rp(x.amount) + "</b></div>" +
      '<div style="display:flex;gap:8px"><span style="color:var(--faint);min-width:150px">Terbilang</span><i style="color:var(--soft);text-transform:capitalize">' + esc(terbilang(x.amount)) + "</i></div>" +
      '<div style="display:flex;gap:8px"><span style="color:var(--faint);min-width:150px">Untuk pembayaran</span><b>' + esc(x.untuk) + "</b></div>" +
      '<div style="display:flex;gap:8px"><span style="color:var(--faint);min-width:150px">Metode</span><span>' + esc(x.method) + "</span></div></div>" +
      '<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:24px"><div style="color:var(--faint);font-size:11px">' + fmtD(x.date) + '</div><div style="text-align:center"><div style="color:var(--faint);font-size:11px;margin-bottom:34px">Penerima,</div><div style="border-top:1px solid var(--line);padding-top:6px;font-weight:600;font-size:13px">' + esc(co.name || "") + "</div></div></div>" +
      '<button class="mbtn pri" id="kd_pr" style="margin-top:14px">Cetak / Simpan PDF</button><button class="mbtn ghost" id="kd_cl">Tutup</button>');
    $("#x").onclick = closeModal; $("#kd_cl").onclick = closeModal;
    $("#kd_pr").onclick = function () { window.print(); };
  }
  function viewKuitansi() {
    var ks = (A.S.receipts || []).slice().sort(function (a, b) { return (b.date > a.date ? 1 : -1); });
    var tot = 0; ks.forEach(function (x) { tot += x.amount; });
    var rows = ks.map(function (x) {
      return '<tr><td><span class="m">' + esc(x.no) + "</span></td><td>" + esc(x.from) + "</td><td>" + esc(x.untuk) + "</td><td>" + fmtD(x.date) + "</td>" + tdR(rp(x.amount)) +
        '<td style="text-align:right;white-space:nowrap"><span class="mlink" data-vk="' + x.id + '">Lihat</span> · <span class="mlink" data-dk="' + x.id + '" style="color:var(--neg)">hapus</span></td></tr>';
    }).join("");
    var inner = '<div class="content"><div class="phead"><div><div class="pt">Kuitansi</div><div class="ps">Bukti penerimaan pembayaran resmi — lengkap dengan terbilang.</div></div><div class="acts"><button class="btn pri" id="addK"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg> Buat Kuitansi</button></div></div>' +
      '<div class="kpis" style="grid-template-columns:repeat(2,1fr)">' +
      kpi("Total Kuitansi", String(ks.length), '<path d="M4 3h16v18l-2-1-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/>', "up", "dokumen") +
      kpi("Nilai Diterima", rpShort(tot), '<path d="M12 19V5M5 12l7-7 7 7"/>', "up", "total") +
      '</div><div class="card">' + (ks.length ? '<table class="tbl"><thead><tr><th>No</th><th>Dari</th><th>Untuk</th><th>Tanggal</th><th style="text-align:right">Jumlah</th><th></th></tr></thead><tbody>' + rows + "</tbody></table>" : '<div class="empty">Belum ada kuitansi. Klik <b>Buat Kuitansi</b>.</div>') + "</div></div>";
    shell(inner, "Kuitansi");
    $("#addK").onclick = showAddReceipt;
    root.querySelectorAll("[data-vk]").forEach(function (e) { e.onclick = function () { receiptDoc(e.getAttribute("data-vk")); }; });
    root.querySelectorAll("[data-dk]").forEach(function (e) { e.onclick = function () { delFrom("receipts", e.getAttribute("data-dk")); }; });
  }

  /* ================= ASET & DEPRESIASI ================= */
  function depMonthly(a) { return a.life ? Math.max(0, (a.cost - (a.salvage || 0))) / (a.life * 12) : 0; }
  function depMonths(a) {
    var start = new Date(a.date), now = new Date();
    var mo = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    return Math.max(0, Math.min(mo, a.life * 12));
  }
  function showAddAsset(id) {
    var a = byId(A.S.assets, id) || {};
    modal(MBRAND + '<button class="mx" id="x">×</button><div class="mh">' + (id ? "Ubah" : "Tambah") + ' Aset Tetap</div><div class="msub">Depresiasi garis lurus (SAK EMKM) dihitung otomatis.</div>' +
      '<div class="fld"><label>Nama aset</label><input class="inp" id="as_n" value="' + esc(a.name || "") + '" placeholder="mis. Laptop MacBook"></div>' +
      '<div class="fld"><label>Harga perolehan (Rp)</label><input class="inp" id="as_c" inputmode="numeric" value="' + (a.cost ? Number(a.cost).toLocaleString("id-ID") : "") + '" placeholder="0"></div>' +
      '<div style="display:flex;gap:10px"><div class="fld" style="flex:1"><label>Tanggal perolehan</label><input class="inp" id="as_d" type="date" value="' + (a.date || new Date().toISOString().slice(0, 10)) + '"></div><div class="fld" style="flex:1"><label>Umur manfaat (tahun)</label><select class="inp" id="as_l">' + [4, 8, 16, 20].map(function (y) { return '<option value="' + y + '"' + ((a.life || 4) === y ? " selected" : "") + ">" + y + " tahun (Kel. " + { 4: "1", 8: "2", 16: "3", 20: "4/bangunan" }[y] + ")</option>"; }).join("") + "</select></div></div>" +
      '<div class="fld"><label>Nilai residu (Rp, opsional)</label><input class="inp" id="as_s" inputmode="numeric" value="' + (a.salvage ? Number(a.salvage).toLocaleString("id-ID") : "") + '" placeholder="0"></div>' +
      '<div class="mmsg" id="as_m"></div><button class="mbtn pri" id="as_sv">Simpan</button>');
    $("#x").onclick = closeModal; moneyIn($("#as_c")); moneyIn($("#as_s"));
    $("#as_sv").onclick = function () {
      var name = $("#as_n").value.trim(), cost = nval("as_c"), msg = $("#as_m"); msg.className = "mmsg err";
      if (!name) { msg.textContent = "Nama aset wajib diisi."; return; }
      if (!cost) { msg.textContent = "Harga perolehan wajib diisi."; return; }
      var o = { name: name, cost: cost, date: $("#as_d").value, life: +$("#as_l").value, salvage: nval("as_s") };
      if (id) { for (var k in o) a[k] = o[k]; } else { o.id = uid(); A.S.assets.push(o); }
      save(); closeModal(); toast("✓ Aset tersimpan"); render();
    };
  }
  function assetSchedule(id) {
    var a = byId(A.S.assets, id); if (!a) return;
    var perYear = (a.cost - (a.salvage || 0)) / a.life, rows = "", acc = 0, y0 = new Date(a.date).getFullYear();
    for (var y = 0; y < a.life; y++) { acc += perYear; rows += "<tr><td>" + (y0 + y) + "</td>" + tdR(rp(perYear)) + tdR(rp(acc)) + tdR(rp(Math.max(a.cost - acc, a.salvage || 0)), "var(--gold-lt)") + "</tr>"; }
    modal(MBRAND + '<button class="mx" id="x">×</button><div class="mh">Jadwal Depresiasi</div><div class="msub">' + esc(a.name) + " — garis lurus " + a.life + " tahun.</div>" +
      '<table class="tbl" style="font-size:13px"><thead><tr><th>Tahun</th><th style="text-align:right">Penyusutan</th><th style="text-align:right">Akumulasi</th><th style="text-align:right">Nilai Buku</th></tr></thead><tbody>' + rows + "</tbody></table>" +
      '<button class="mbtn ghost" id="as_cl" style="margin-top:12px">Tutup</button>', true);
    $("#x").onclick = closeModal; $("#as_cl").onclick = closeModal;
  }
  function postDepreciation() {
    var key = monthKey();
    if (A.S.lastDep === key) { toast("Beban penyusutan bulan ini sudah dicatat"); return; }
    var tot = 0; (A.S.assets || []).forEach(function (a) { if (depMonths(a) < a.life * 12) tot += depMonthly(a); });
    tot = Math.round(tot);
    if (!tot) { toast("Tidak ada aset yang masih disusutkan"); return; }
    A.S.tx.push({ id: uid(), date: new Date().toISOString().slice(0, 10), kind: "exp", cat: "Penyusutan", note: "Beban penyusutan " + new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" }), amount: tot });
    A.S.lastDep = key; save(); toast("✓ Beban penyusutan " + rp(tot) + " dicatat"); render();
  }
  function viewAset() {
    var as = A.S.assets || [], totC = 0, totAcc = 0;
    var rows = as.map(function (a) {
      var acc = Math.round(depMonthly(a) * depMonths(a)), nb = Math.max(a.cost - acc, a.salvage || 0);
      totC += a.cost; totAcc += acc;
      return '<tr><td><span class="m">' + esc(a.name) + "</span></td><td>" + fmtD(a.date) + "</td>" + tdR(rp(a.cost)) + '<td style="text-align:center">' + a.life + " thn</td>" + tdR(rp(Math.round(depMonthly(a))), "var(--neg)") + tdR(rp(acc), "var(--neg)") + tdR(rp(nb), "var(--gold-lt)") +
        '<td style="text-align:right;white-space:nowrap"><span class="mlink" data-sa="' + a.id + '">jadwal</span> · <span class="mlink" data-ea="' + a.id + '">ubah</span> · <span class="mlink" data-da="' + a.id + '" style="color:var(--neg)">hapus</span></td></tr>';
    }).join("");
    var inner = '<div class="content"><div class="phead"><div><div class="pt">Aset &amp; Depresiasi</div><div class="ps">Aset tetap dengan penyusutan garis lurus otomatis — sesuai kelompok fiskal.</div></div><div class="acts"><button class="btn" id="depBtn"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg> Catat beban bulan ini</button><button class="btn pri" id="addA"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg> Tambah Aset</button></div></div>' +
      '<div class="kpis" style="grid-template-columns:repeat(3,1fr)">' +
      kpi("Harga Perolehan", rpShort(totC), '<rect x="2" y="7" width="20" height="14" rx="2"/>', "up", as.length + " aset") +
      kpi("Akumulasi Penyusutan", rpShort(totAcc), '<path d="M3 3v18h18"/><path d="M7 10l4 4 6-8"/>', "dn", "s.d. bulan ini") +
      kpi("Nilai Buku", rpShort(totC - totAcc), '<circle cx="12" cy="9" r="6"/><path d="M9 14.5 7.5 22l4.5-2.5L16.5 22 15 14.5"/>', "up", "sekarang") +
      '</div><div class="card">' + (as.length ? '<table class="tbl"><thead><tr><th>Aset</th><th>Perolehan</th><th style="text-align:right">Harga</th><th style="text-align:center">Umur</th><th style="text-align:right">Susut/bln</th><th style="text-align:right">Akumulasi</th><th style="text-align:right">Nilai Buku</th><th></th></tr></thead><tbody>' + rows + "</tbody></table>" : '<div class="empty">Belum ada aset tetap. Klik <b>Tambah Aset</b>.</div>') + "</div></div>";
    shell(inner, "Aset & Depresiasi");
    $("#addA").onclick = function () { showAddAsset(); };
    $("#depBtn").onclick = postDepreciation;
    root.querySelectorAll("[data-sa]").forEach(function (e) { e.onclick = function () { assetSchedule(e.getAttribute("data-sa")); }; });
    root.querySelectorAll("[data-ea]").forEach(function (e) { e.onclick = function () { showAddAsset(e.getAttribute("data-ea")); }; });
    root.querySelectorAll("[data-da]").forEach(function (e) { e.onclick = function () { delFrom("assets", e.getAttribute("data-da")); }; });
  }

  /* ================= PAYROLL (PPh 21 TER + BPJS) ================= */
  var TER = {
    A: [[5400000, 0], [5650000, .25], [5950000, .5], [6300000, .75], [6750000, 1], [7500000, 1.25], [8550000, 1.5], [9650000, 1.75], [10050000, 2], [10350000, 2.25], [10700000, 2.5], [11050000, 3], [11600000, 3.5], [12500000, 4], [13750000, 5], [15100000, 6], [16950000, 7], [19750000, 8], [24150000, 9], [26450000, 10], [28000000, 11], [30050000, 12], [32400000, 13], [35400000, 14], [39100000, 15], [43850000, 16], [47800000, 17], [51400000, 18], [56300000, 19], [62200000, 20], [68600000, 21], [77500000, 22], [89000000, 23], [103000000, 24], [125000000, 25], [157000000, 26], [206000000, 27], [337000000, 28], [454000000, 29], [550000000, 30], [695000000, 31], [910000000, 32], [1400000000, 33]],
    B: [[6200000, 0], [6500000, .25], [6850000, .5], [7300000, .75], [9200000, 1], [10750000, 1.5], [11250000, 2], [11600000, 2.5], [12600000, 3], [13600000, 4], [14950000, 5], [16400000, 6], [18450000, 7], [21850000, 8], [26000000, 9], [27700000, 10], [29350000, 11], [31450000, 12], [33950000, 13], [37100000, 14], [41100000, 15], [45800000, 16], [49500000, 17], [53800000, 18], [58500000, 19], [64000000, 20], [71000000, 21], [80000000, 22], [93000000, 23], [109000000, 24], [129000000, 25], [163000000, 26], [211000000, 27], [374000000, 28], [459000000, 29], [555000000, 30], [704000000, 31], [957000000, 32], [1405000000, 33]],
    C: [[6600000, 0], [6950000, .25], [7350000, .5], [7800000, .75], [8850000, 1], [9800000, 1.25], [10950000, 1.5], [11200000, 1.75], [12050000, 2], [12950000, 3], [14150000, 4], [15550000, 5], [17050000, 6], [19500000, 7], [22700000, 8], [26600000, 9], [28100000, 10], [30100000, 11], [32600000, 12], [35400000, 13], [38900000, 14], [43000000, 15], [47400000, 16], [51200000, 17], [55800000, 18], [60400000, 19], [66700000, 20], [74500000, 21], [83200000, 22], [95600000, 23], [110000000, 24], [134000000, 25], [169000000, 26], [221000000, 27], [390000000, 28], [463000000, 29], [561000000, 30], [709000000, 31], [965000000, 32], [1419000000, 33]],
  };
  function terCat(ptkp) { if (ptkp === "K/3") return "C"; if (["TK/2", "TK/3", "K/1", "K/2"].indexOf(ptkp) >= 0) return "B"; return "A"; }
  function terRate(cat, b) { var t = TER[cat]; for (var i = 0; i < t.length; i++) if (b <= t[i][0]) return t[i][1]; return 34; }
  function calcGaji(e) {
    var bruto = (e.gaji || 0) + (e.tunj || 0);
    var jkn = Math.round(Math.min(bruto, 12000000) * 0.01);
    var jht = Math.round(bruto * 0.02);
    var jp = Math.round(Math.min(bruto, 10042300) * 0.01);
    var cat = terCat(e.ptkp || "TK/0"), rate = terRate(cat, bruto);
    var pph = Math.round(bruto * rate / 100);
    return { bruto: bruto, jkn: jkn, jht: jht, jp: jp, bpjs: jkn + jht + jp, cat: cat, rate: rate, pph: pph, net: bruto - jkn - jht - jp - pph };
  }
  function showAddEmployee(id) {
    var e0 = byId(A.S.employees, id) || {};
    var PTKPS = ["TK/0", "TK/1", "TK/2", "TK/3", "K/0", "K/1", "K/2", "K/3"];
    modal(MBRAND + '<button class="mx" id="x">×</button><div class="mh">' + (id ? "Ubah" : "Tambah") + ' Karyawan</div><div class="msub">PPh 21 (TER bulanan) &amp; BPJS dihitung otomatis.</div>' +
      '<div class="fld"><label>Nama</label><input class="inp" id="em_n" value="' + esc(e0.name || "") + '"></div>' +
      '<div class="fld"><label>Status PTKP</label><select class="inp" id="em_p">' + PTKPS.map(function (p) { return "<option" + (e0.ptkp === p ? " selected" : "") + ">" + p + "</option>"; }).join("") + "</select></div>" +
      '<div style="display:flex;gap:10px"><div class="fld" style="flex:1"><label>Gaji pokok (Rp)</label><input class="inp" id="em_g" inputmode="numeric" value="' + (e0.gaji ? Number(e0.gaji).toLocaleString("id-ID") : "") + '"></div><div class="fld" style="flex:1"><label>Tunjangan (Rp)</label><input class="inp" id="em_t" inputmode="numeric" value="' + (e0.tunj ? Number(e0.tunj).toLocaleString("id-ID") : "") + '"></div></div>' +
      '<div class="mmsg" id="em_m"></div><button class="mbtn pri" id="em_s">Simpan</button>');
    $("#x").onclick = closeModal; moneyIn($("#em_g")); moneyIn($("#em_t"));
    $("#em_s").onclick = function () {
      var name = $("#em_n").value.trim(), gaji = nval("em_g"), msg = $("#em_m"); msg.className = "mmsg err";
      if (!name) { msg.textContent = "Nama wajib diisi."; return; }
      if (!gaji) { msg.textContent = "Gaji wajib diisi."; return; }
      var o = { name: name, ptkp: $("#em_p").value, gaji: gaji, tunj: nval("em_t") };
      if (id) { for (var k in o) e0[k] = o[k]; } else { o.id = uid(); A.S.employees.push(o); }
      save(); closeModal(); toast("✓ Karyawan tersimpan"); render();
    };
  }
  function slipGaji(id) {
    var e = byId(A.S.employees, id); if (!e) return;
    var c = calcGaji(e), co = A.company || {};
    function line(l, v, color) { return '<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--line-2);font-size:13px"><span style="color:var(--soft)">' + l + '</span><span style="font-family:var(--mono);color:' + (color || "var(--val)") + '">' + v + "</span></div>"; }
    modal(MBRAND + '<button class="mx" id="x">×</button>' +
      docHead("SLIP GAJI", new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" }), "") +
      '<div style="border-top:1px solid var(--line);padding-top:10px;margin-bottom:8px;font-size:13px"><b>' + esc(e.name) + '</b> <span style="color:var(--faint)">· PTKP ' + esc(e.ptkp || "TK/0") + " · TER " + c.cat + "</span></div>" +
      line("Gaji pokok", rp(e.gaji)) + line("Tunjangan", rp(e.tunj || 0)) + line("<b>Penghasilan bruto</b>", "<b>" + rp(c.bruto) + "</b>") +
      line("BPJS Kesehatan (1%)", "− " + rp(c.jkn), "var(--neg)") + line("BPJS JHT (2%)", "− " + rp(c.jht), "var(--neg)") + line("BPJS JP (1%)", "− " + rp(c.jp), "var(--neg)") +
      line("PPh 21 — TER " + c.cat + " (" + c.rate + "%)", "− " + rp(c.pph), "var(--neg)") +
      '<div style="display:flex;justify-content:space-between;padding:12px 0;font-size:15px"><b>Diterima bersih</b><b style="font-family:var(--disp);font-size:19px;color:var(--gold-lt)">' + rp(c.net) + "</b></div>" +
      '<div style="color:var(--faint);font-size:11px;font-style:italic;text-transform:capitalize">' + esc(terbilang(c.net)) + "</div>" +
      '<div style="color:var(--faint);font-size:10.5px;margin-top:10px">Estimasi TER PMK 168/2023 — verifikasi final via Coretax. ' + esc(co.name || "") + "</div>" +
      '<button class="mbtn pri" id="sg_pr" style="margin-top:14px">Cetak / Simpan PDF</button><button class="mbtn ghost" id="sg_cl">Tutup</button>');
    $("#x").onclick = closeModal; $("#sg_cl").onclick = closeModal;
    $("#sg_pr").onclick = function () { window.print(); };
  }
  function prosesGaji() {
    var key = monthKey();
    if (A.S.lastPayroll === key) { toast("Gaji bulan ini sudah diproses"); return; }
    var emps = A.S.employees || []; if (!emps.length) { toast("Belum ada karyawan"); return; }
    var tot = 0; emps.forEach(function (e) { tot += calcGaji(e).bruto; });
    A.S.tx.push({ id: uid(), date: new Date().toISOString().slice(0, 10), kind: "exp", cat: "Gaji", note: "Payroll " + new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" }) + " (" + emps.length + " karyawan)", amount: tot });
    A.S.lastPayroll = key; save(); toast("✓ Payroll " + rp(tot) + " tercatat sebagai beban gaji"); render();
  }
  function viewPayroll() {
    var emps = A.S.employees || [], totB = 0, totP = 0, totN = 0;
    var rows = emps.map(function (e) {
      var c = calcGaji(e); totB += c.bruto; totP += c.pph; totN += c.net;
      return '<tr><td><span class="m">' + esc(e.name) + '</span></td><td style="text-align:center">' + esc(e.ptkp || "TK/0") + "</td>" + tdR(rp(c.bruto)) + tdR("− " + rp(c.bpjs), "var(--neg)") + tdR("− " + rp(c.pph) + ' <span style="color:var(--faint);font-size:10px">(' + c.rate + "%)</span>", "var(--neg)") + tdR(rp(c.net), "var(--gold-lt)") +
        '<td style="text-align:right;white-space:nowrap"><span class="mlink" data-sl="' + e.id + '">slip</span> · <span class="mlink" data-ee="' + e.id + '">ubah</span> · <span class="mlink" data-de="' + e.id + '" style="color:var(--neg)">hapus</span></td></tr>';
    }).join("");
    var inner = '<div class="content"><div class="phead"><div><div class="pt">Payroll</div><div class="ps">Gaji, BPJS &amp; PPh 21 metode TER (PMK 168/2023) — slip gaji siap cetak.</div></div><div class="acts"><button class="btn" id="prBtn"><svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg> Proses gaji bulan ini</button><button class="btn pri" id="addE"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg> Tambah Karyawan</button></div></div>' +
      '<div class="kpis" style="grid-template-columns:repeat(4,1fr)">' +
      kpi("Karyawan", String(emps.length), '<circle cx="9" cy="7" r="4"/><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>', "up", "aktif") +
      kpi("Total Bruto/bln", rpShort(totB), '<path d="M3 17l5-5 4 4 8-8"/>', "up", "beban gaji") +
      kpi("PPh 21/bln", rpShort(totP), '<path d="M12 3v18M5 8h14"/>', "dn", "dipotong TER") +
      kpi("Take Home/bln", rpShort(totN), '<circle cx="12" cy="9" r="6"/><path d="M9 14.5 7.5 22l4.5-2.5L16.5 22 15 14.5"/>', "up", "dibayarkan") +
      '</div><div class="card">' + (emps.length ? '<table class="tbl"><thead><tr><th>Nama</th><th style="text-align:center">PTKP</th><th style="text-align:right">Bruto</th><th style="text-align:right">BPJS</th><th style="text-align:right">PPh 21</th><th style="text-align:right">Bersih</th><th></th></tr></thead><tbody>' + rows + "</tbody></table>" : '<div class="empty">Belum ada karyawan. Klik <b>Tambah Karyawan</b>.</div>') + "</div>" +
      '<div style="color:var(--faint);font-size:11px;margin-top:10px">Potongan karyawan: BPJS Kesehatan 1% (maks. dasar 12 jt), JHT 2%, JP 1% (maks. dasar ±10 jt). PPh 21 memakai Tarif Efektif Rata-rata bulanan — estimasi, verifikasi via Coretax/e-Bupot.</div></div>';
    shell(inner, "Payroll");
    $("#addE").onclick = function () { showAddEmployee(); };
    $("#prBtn").onclick = prosesGaji;
    root.querySelectorAll("[data-sl]").forEach(function (e) { e.onclick = function () { slipGaji(e.getAttribute("data-sl")); }; });
    root.querySelectorAll("[data-ee]").forEach(function (e) { e.onclick = function () { showAddEmployee(e.getAttribute("data-ee")); }; });
    root.querySelectorAll("[data-de]").forEach(function (e) { e.onclick = function () { delFrom("employees", e.getAttribute("data-de")); }; });
  }

  /* ================= TRANSAKSI BERULANG ================= */
  function checkRecurring() {
    var now = new Date(), key = monthKey(now), posted = 0;
    (A.S.recurs || []).forEach(function (r) {
      if (!r.active || r.last === key || now.getDate() < (r.day || 1)) return;
      A.S.tx.push({ id: uid(), date: key + "-" + ("0" + (r.day || 1)).slice(-2), kind: r.kind, cat: r.cat, note: (r.note || r.cat) + " (berulang)", amount: r.amount });
      r.last = key; posted++;
    });
    if (posted) { save(); setTimeout(function () { toast("↻ " + posted + " transaksi berulang dicatat otomatis"); }, 600); }
  }
  function showAddRecur(id) {
    var r = byId(A.S.recurs, id) || { kind: "exp", day: 1, active: true };
    function catOpts(kind, sel) { return catsFor(kind).map(function (c) { return "<option" + (c === sel ? " selected" : "") + ">" + esc(c) + "</option>"; }).join(""); }
    modal(MBRAND + '<button class="mx" id="x">×</button><div class="mh">' + (id ? "Ubah" : "Tambah") + ' Transaksi Berulang</div><div class="msub">Otomatis dicatat tiap bulan pada tanggal yang dipilih.</div>' +
      '<div style="display:flex;gap:10px"><div class="fld" style="flex:1"><label>Jenis</label><select class="inp" id="rc_k"><option value="exp"' + (r.kind === "exp" ? " selected" : "") + '>Pengeluaran</option><option value="inc"' + (r.kind === "inc" ? " selected" : "") + '>Pemasukan</option></select></div><div class="fld" style="flex:1"><label>Kategori</label><select class="inp" id="rc_c">' + catOpts(r.kind, r.cat) + "</select></div></div>" +
      '<div class="fld"><label>Catatan</label><input class="inp" id="rc_n" value="' + esc(r.note || "") + '" placeholder="mis. Sewa kantor"></div>' +
      '<div style="display:flex;gap:10px"><div class="fld" style="flex:2"><label>Jumlah (Rp)</label><input class="inp" id="rc_a" inputmode="numeric" value="' + (r.amount ? Number(r.amount).toLocaleString("id-ID") : "") + '"></div><div class="fld" style="flex:1"><label>Tiap tanggal</label><select class="inp" id="rc_d">' + (function () { var o = ""; for (var i = 1; i <= 28; i++) o += '<option value="' + i + '"' + (r.day === i ? " selected" : "") + ">" + i + "</option>"; return o; })() + "</select></div></div>" +
      '<div class="mmsg" id="rc_m"></div><button class="mbtn pri" id="rc_s">Simpan</button>');
    $("#x").onclick = closeModal; moneyIn($("#rc_a"));
    $("#rc_k").onchange = function () { $("#rc_c").innerHTML = catOpts($("#rc_k").value); };
    $("#rc_s").onclick = function () {
      var amt = nval("rc_a"), msg = $("#rc_m"); msg.className = "mmsg err";
      if (!amt) { msg.textContent = "Jumlah wajib diisi."; return; }
      var o = { kind: $("#rc_k").value, cat: $("#rc_c").value, note: $("#rc_n").value.trim(), amount: amt, day: +$("#rc_d").value };
      if (id) { for (var k in o) r[k] = o[k]; } else { o.id = uid(); o.active = true; o.last = ""; A.S.recurs.push(o); }
      save(); closeModal(); toast("✓ Transaksi berulang tersimpan"); render();
    };
  }
  function viewRecurring() {
    var rs = A.S.recurs || [], now = new Date();
    var rows = rs.map(function (r) {
      var next = new Date(now.getFullYear(), now.getMonth() + ((r.last === monthKey(now) || now.getDate() > r.day) ? 1 : 0), r.day);
      return '<tr><td><span class="pill ' + (r.kind === "inc" ? "pos" : "neg") + '">' + (r.kind === "inc" ? "Masuk" : "Keluar") + '</span></td><td><span class="m">' + esc(r.note || r.cat) + '</span></td><td>' + esc(r.cat) + '</td><td style="text-align:center">tgl ' + r.day + "</td><td>" + next.toLocaleDateString("id-ID", { day: "numeric", month: "short" }) + "</td>" + tdR(rp(r.amount)) +
        '<td><span class="pill ' + (r.active ? "pos" : "warn") + '">' + (r.active ? "Aktif" : "Jeda") + "</span></td>" +
        '<td style="text-align:right;white-space:nowrap"><span class="mlink" data-tr="' + r.id + '">' + (r.active ? "jeda" : "aktifkan") + '</span> · <span class="mlink" data-er="' + r.id + '">ubah</span> · <span class="mlink" data-dr="' + r.id + '" style="color:var(--neg)">hapus</span></td></tr>';
    }).join("");
    var monthly = 0; rs.forEach(function (r) { if (r.active) monthly += (r.kind === "exp" ? -1 : 1) * r.amount; });
    var inner = '<div class="content"><div class="phead"><div><div class="pt">Transaksi Berulang</div><div class="ps">Sewa, langganan, gaji rutin — dicatat otomatis tiap bulan.</div></div><div class="acts"><button class="btn pri" id="addR"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg> Tambah</button></div></div>' +
      '<div class="kpis" style="grid-template-columns:repeat(3,1fr)">' +
      kpi("Total Rutin", String(rs.length), '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>', "up", rs.filter(function (r) { return r.active; }).length + " aktif") +
      kpi("Dampak Bersih/bln", rpShort(monthly), '<path d="M3 17l5-5 4 4 8-8"/>', monthly >= 0 ? "up" : "dn", "otomatis") +
      kpi("Bulan Ini", String(rs.filter(function (r) { return r.last === monthKey(); }).length), '<path d="M20 6 9 17l-5-5"/>', "up", "sudah dicatat") +
      '</div><div class="card">' + (rs.length ? '<table class="tbl"><thead><tr><th>Jenis</th><th>Catatan</th><th>Kategori</th><th style="text-align:center">Jadwal</th><th>Berikutnya</th><th style="text-align:right">Jumlah</th><th>Status</th><th></th></tr></thead><tbody>' + rows + "</tbody></table>" : '<div class="empty">Belum ada transaksi berulang. Klik <b>Tambah</b>.</div>') + "</div></div>";
    shell(inner, "Transaksi Berulang");
    $("#addR").onclick = function () { showAddRecur(); };
    root.querySelectorAll("[data-tr]").forEach(function (e) { e.onclick = function () { var r = byId(A.S.recurs, e.getAttribute("data-tr")); if (r) { r.active = !r.active; save(); render(); } }; });
    root.querySelectorAll("[data-er]").forEach(function (e) { e.onclick = function () { showAddRecur(e.getAttribute("data-er")); }; });
    root.querySelectorAll("[data-dr]").forEach(function (e) { e.onclick = function () { delFrom("recurs", e.getAttribute("data-dr")); }; });
  }

  /* ================= ANGGARAN PER KATEGORI ================= */
  function showSetBudget() {
    var cats = catsFor("exp");
    modal(MBRAND + '<button class="mx" id="x">×</button><div class="mh">Atur Anggaran</div><div class="msub">Batas belanja bulanan per kategori pengeluaran.</div>' +
      cats.map(function (c, i) { return '<div class="fld"><label>' + esc(c) + ' (Rp/bulan)</label><input class="inp" data-bg="' + esc(c) + '" inputmode="numeric" value="' + (A.S.budget[c] ? Number(A.S.budget[c]).toLocaleString("id-ID") : "") + '" placeholder="0 = tanpa batas"></div>'; }).join("") +
      '<button class="mbtn pri" id="bg_s">Simpan anggaran</button>');
    $("#x").onclick = closeModal;
    document.querySelectorAll("[data-bg]").forEach(function (el) { moneyIn(el); });
    $("#bg_s").onclick = function () {
      document.querySelectorAll("[data-bg]").forEach(function (el) { var v = Number((el.value || "").replace(/\D/g, "")); if (v) A.S.budget[el.getAttribute("data-bg")] = v; else delete A.S.budget[el.getAttribute("data-bg")]; });
      save(); closeModal(); toast("✓ Anggaran tersimpan"); render();
    };
  }
  function viewAnggaran() {
    var key = monthKey(), spent = {};
    A.S.tx.forEach(function (t) { if (t.kind === "exp" && String(t.date).slice(0, 7) === key) spent[t.cat] = (spent[t.cat] || 0) + t.amount; });
    var cats = {}; catsFor("exp").forEach(function (c) { cats[c] = 1; }); Object.keys(A.S.budget).forEach(function (c) { cats[c] = 1; }); Object.keys(spent).forEach(function (c) { cats[c] = 1; });
    var totB = 0, totS = 0, bars = Object.keys(cats).map(function (c) {
      var b = A.S.budget[c] || 0, s = spent[c] || 0; totB += b; totS += s;
      var pct = b ? Math.min(100, Math.round(s / b * 100)) : 0;
      var col = !b ? "var(--faint)" : (s > b ? "var(--neg)" : (pct >= 80 ? "var(--warn)" : "var(--pos)"));
      return '<div style="padding:13px 20px;border-bottom:1px solid var(--line-2)"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:7px"><span class="m" style="color:var(--ink);font-weight:600">' + esc(c) + '</span><span style="font-family:var(--mono);color:var(--soft)">' + rp(s) + (b ? ' <span style="color:var(--faint)">/ ' + rp(b) + "</span>" : ' <span style="color:var(--faint)">— tanpa batas</span>') + "</span></div>" +
        (b ? '<div class="bgt-bar"><i style="width:' + pct + "%;background:" + col + '"></i></div>' + (s > b ? '<div style="color:var(--neg);font-size:11px;margin-top:5px">⚠ Melebihi anggaran ' + rp(s - b) + "</div>" : "") : "") + "</div>";
    }).join("");
    var inner = '<div class="content"><div class="phead"><div><div class="pt">Anggaran</div><div class="ps">Budget belanja per kategori — ' + new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" }) + '.</div></div><div class="acts"><button class="btn pri" id="setB"><svg viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg> Atur Anggaran</button></div></div>' +
      '<div class="kpis" style="grid-template-columns:repeat(3,1fr)">' +
      kpi("Total Anggaran", rpShort(totB), '<path d="M3 12a9 9 0 1 0 9-9v9z"/>', "up", "per bulan") +
      kpi("Terpakai", rpShort(totS), '<path d="M12 5v14M5 12l7 7 7-7"/>', totB && totS > totB ? "dn" : "up", totB ? Math.round(totS / totB * 100) + "% dari budget" : "bulan ini") +
      kpi("Sisa", rpShort(Math.max(0, totB - totS)), '<circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/>', (totB - totS) >= 0 ? "up" : "dn", "tersedia") +
      '</div><div class="card">' + (Object.keys(cats).length ? bars : '<div class="empty">Belum ada kategori pengeluaran.</div>') + "</div></div>";
    shell(inner, "Anggaran");
    $("#setB").onclick = showSetBudget;
  }

  /* ================= ACCOUNT ================= */
  function showAccount() {
    modal(MBRAND + '<button class="mx" id="x">×</button><div class="mh">Akun</div>' +
      '<div class="msub">' + esc(A.user && A.user.email || "") + '<br>Perusahaan: <b style="color:var(--ink)">' + esc(A.company.name) + '</b><br>Paket: <b style="color:var(--gold-lt)">' + esc((A.plan && A.plan.name) || "-") + "</b></div>" +
      '<button class="mbtn pri" id="up">Lihat paket / upgrade</button><button class="mbtn ghost" id="thm">Tema: ' + (document.documentElement.getAttribute("data-theme") === "light" ? "Terang ☀️" : "Gelap 🌙") + '</button><button class="mbtn ghost" id="brand">Logo &amp; Branding</button><button class="mbtn ghost" id="cpwd">Ganti kata sandi</button><button class="mbtn ghost" id="bkup">Backup data (JSON)</button><button class="mbtn ghost" id="rstr">Pulihkan dari backup</button><input type="file" id="rstrF" accept=".json,application/json" style="display:none"><button class="mbtn ghost" id="sy">Sinkron sekarang</button><button class="mbtn ghost" id="out">Keluar</button>');
    $("#x").onclick = closeModal;
    $("#up").onclick = showPlans;
    $("#thm").onclick = function () { toggleTheme(); $("#thm").textContent = "Tema: " + (document.documentElement.getAttribute("data-theme") === "light" ? "Terang ☀️" : "Gelap 🌙"); };
    $("#brand").onclick = function () { closeModal(); showBranding(); };
    $("#cpwd").onclick = function () { showSetPassword(false); };
    $("#bkup").onclick = function () {
      var payload = { app: "FinFlow", version: 1, company: (A.company || {}).name || "", exported: new Date().toISOString(), state: A.S };
      download("finflow-backup-" + ((A.company || {}).name || "data").replace(/\W+/g, "-").toLowerCase() + "-" + new Date().toISOString().slice(0, 10) + ".json", JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
      toast("✓ Backup diunduh");
    };
    $("#rstr").onclick = function () { $("#rstrF").click(); };
    $("#rstrF").onchange = function () {
      var f = this.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var d = JSON.parse(r.result), st = d && (d.state || d);
          if (!st || !Object.prototype.toString.call(st.tx).match(/Array/)) { toast("✗ File backup tidak valid"); return; }
          if (!window.confirm("Ganti seluruh data \"" + ((A.company || {}).name || "") + "\" dengan isi backup ini? Data saat ini akan tertimpa.")) return;
          A.S = st; save(); push().then(function () { toast("✓ Data dipulihkan dari backup"); closeModal(); render(); });
        } catch (e) { toast("✗ Gagal membaca file: " + e.message); }
      };
      r.readAsText(f);
    };
    $("#sy").onclick = function () { A.dirty = true; push().then(function () { $("#sy").textContent = "✓ Tersinkron"; }); };
    $("#out").onclick = function () { A.dirty = true; push().then(function () { return sb.auth.signOut(); }).then(function () { location.reload(); }); };
  }

  /* ================= BOOT ================= */
  function boot(session) {
    if (!session) { showAuth(false); return; }
    A.user = session.user; closeModal();
    acceptInvites().then(ensureCompany).then(loadSub).then(initSync).then(function () { closeModal(); hideSplash(); render(); })
      .catch(function (e) { console.error("[FinFlow]", e); hideSplash(); modal(MBRAND + '<div class="mh">Terjadi kesalahan</div><div class="msub">' + esc(e.message || String(e)) + '</div><button class="mbtn pri" onclick="location.reload()">Muat ulang</button>'); });
  }
  sb.auth.getSession().then(function (r) { boot(r.data.session); });
  sb.auth.onAuthStateChange(function (_e, session) {
    if (_e === "PASSWORD_RECOVERY") { if (session && !A.user) { A.user = session.user; } hideSplash(); showSetPassword(true); return; }
    if (session && !A.user) boot(session);
    if (!session && A.user) { A.user = null; location.reload(); }
  });
  setTimeout(hideSplash, 4000);
})();
