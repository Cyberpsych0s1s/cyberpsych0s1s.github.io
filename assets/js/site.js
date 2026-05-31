/* almahri.node — progressive enhancement; the page works fully without this file. */
(function () {
  "use strict";
  var doc = document, html = doc.documentElement;
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* audio — one persistent context, kept alive across soft-navigation. */
  var Audio = (function () {
    var btn = doc.getElementById("snd-ctl");
    var ctx = null, master = null, hum = null, on = false, started = false, pendingStartup = false,
        clickTimer = null, buffers = {}, rnd = function (a, b) { return a + Math.random() * (b - a); };
    var ICON_ON = "<svg class='ic' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M6 9H3v6h3l5 4V5L6 9z'/><path d='M15 8a4 4 0 0 1 0 8M18 6a8 8 0 0 1 0 12'/></svg>";

    function load(name, url) {
      fetch(url).then(function (r) { return r.ok ? r.arrayBuffer() : Promise.reject(); })
        .then(function (b) { return ctx.decodeAudioData(b); })
        .then(function (buf) { buffers[name] = buf; if (name === "startup" && pendingStartup) { pendingStartup = false; sample("startup", 0.5); } }).catch(function () {});
    }
    function build() {
      var C = window.AudioContext || window.webkitAudioContext; if (!C) return false;
      ctx = new C();
      master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
      hum = ctx.createGain(); hum.gain.value = 0;
      var hlp = ctx.createBiquadFilter(); hlp.type = "lowpass"; hlp.frequency.value = 180;
      hum.connect(hlp); hlp.connect(master);
      [60, 120].forEach(function (f, i) { var o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f; var g = ctx.createGain(); g.gain.value = i ? 0.35 : 1; o.connect(g); g.connect(hum); o.start(); });
      load("mouseclick", "/sfx/mouseclick.wav");
      load("startup", "/sfx/startup.wav");
      return true;
    }
    function sample(name, g) {
      if (!ctx || !buffers[name]) return false;
      var s = ctx.createBufferSource(); s.buffer = buffers[name];
      var gn = ctx.createGain(); gn.gain.value = g == null ? 1 : g;
      s.connect(gn); gn.connect(master); s.start(); return true;
    }
    function hdd(at, gainv) {
      var b = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate), d = b.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      var s = ctx.createBufferSource(); s.buffer = b;
      var bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = rnd(700, 1050); bp.Q.value = 4;
      var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(gainv || 0.03, at + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.03);
      s.connect(bp); bp.connect(g); g.connect(master); s.start(at); s.stop(at + 0.05);
    }
    function seek() { var t = ctx.currentTime, n = Math.floor(rnd(3, 6)); for (var i = 0; i < n; i++) hdd(t + i * rnd(0.03, 0.06), 0.022); }
    function scheduleTicks() {
      clickTimer = setTimeout(function () {
        if (on && ctx) { Math.random() < 0.3 ? seek() : hdd(ctx.currentTime, rnd(0.018, 0.035)); }
        if (on) scheduleTicks();
      }, rnd(2000, 7500));
    }
    function synthClick() {
      var t = ctx.currentTime;
      function snap(at, amp, freq) {
        var b = ctx.createBuffer(1, ctx.sampleRate * 0.015, ctx.sampleRate), d = b.getChannelData(0);
        for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
        var s = ctx.createBufferSource(); s.buffer = b;
        var hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 900;
        var bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = freq; bp.Q.value = 1.1;
        var g = ctx.createGain(); g.gain.setValueAtTime(amp, at); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.012);
        s.connect(hp); hp.connect(bp); bp.connect(g); g.connect(master); s.start(at); s.stop(at + 0.02);
      }
      snap(t, 0.13, 2000);
      snap(t + 0.045, 0.06, 1500);
    }
    function blip(freq, at, dur, amp, type, glideTo) {
      var o = ctx.createOscillator(); o.type = type || "sine"; o.frequency.setValueAtTime(freq, at);
      if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, at + dur);
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(amp, at + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      o.connect(g); g.connect(master); o.start(at); o.stop(at + dur + 0.03);
    }
    function noiseHit(at, dur, amp, type, freq, q) {
      var b = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate), d = b.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
      var s = ctx.createBufferSource(); s.buffer = b;
      var bq = ctx.createBiquadFilter(); bq.type = type; bq.frequency.value = freq; if (q) bq.Q.value = q;
      var g = ctx.createGain(); g.gain.setValueAtTime(amp, at); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      s.connect(bq); bq.connect(g); g.connect(master); s.start(at); s.stop(at + dur + 0.02);
    }
    function uiHover() { if (on && ctx) noiseHit(ctx.currentTime, 0.014, 0.02, "bandpass", rnd(2600, 3200), 2); }
    function uiNav() { if (on && ctx) { seek(); blip(440, ctx.currentTime, 0.14, 0.07, "sine", 240); } }
    function uiToggle(engage) {
      if (!on || !ctx) return; var t = ctx.currentTime;
      noiseHit(t, 0.035, 0.12, "lowpass", 900);
      blip(engage ? 340 : 250, t + 0.004, 0.07, 0.06, "square");
    }
    function uiConfirm() { if (!on || !ctx) return; var t = ctx.currentTime; blip(880, t, 0.06, 0.06, "sine"); blip(1320, t + 0.055, 0.08, 0.05, "sine"); }
    function powerOn() {
      var t = ctx.currentTime;
      if (!sample("startup", 0.5)) pendingStartup = true;  // if not decoded yet, fire the chime the moment it loads
      hum.gain.setValueAtTime(0.0001, t); hum.gain.linearRampToValueAtTime(0.03, t + 1.2);
      setTimeout(function () { if (on) seek(); }, 700);
    }
    function sync() {
      if (!btn) return;
      btn.setAttribute("aria-pressed", String(on)); btn.classList.toggle("on", on);
      var l = btn.querySelector(".lbl"); if (l) l.textContent = on ? "ambient: on" : "ambient: off";
      if (on) { var ic = btn.querySelector(".ic"); if (ic) ic.outerHTML = ICON_ON; }
    }
    function persist() { try { localStorage.setItem("sound", on ? "on" : "off"); } catch (e) {} }
    function enable() {
      if (!ctx) { if (!build()) return; }
      if (ctx.state === "suspended") ctx.resume();
      var t = ctx.currentTime;
      master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), t); master.gain.linearRampToValueAtTime(1, t + 0.1);
      on = true;
      if (!started) { started = true; powerOn(); }
      else { hum.gain.linearRampToValueAtTime(0.03, t + 0.4); }
      scheduleTicks(); persist(); sync();
    }
    function disable() {
      if (ctx) { var t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(0.0001, t + 0.5); }
      on = false; if (clickTimer) clearTimeout(clickTimer); persist(); sync();
    }
    if (btn) btn.addEventListener("click", function () { if (on) { uiToggle(false); disable(); } else { enable(); } });

    var pref = null; try { pref = localStorage.getItem("sound"); } catch (e) {}
    function armEntry() {
      if (pref === "off") { sync(); return; }
      var go = function () { enable(); cleanup(); };
      var cleanup = function () { removeEventListener("pointerdown", go, true); removeEventListener("keydown", go, true); };
      addEventListener("pointerdown", go, true); addEventListener("keydown", go, true);
    }
    return {
      sync: sync, armEntry: armEntry, enable: enable,
      click: function () { if (on) { if (!sample("mouseclick", 0.55)) synthClick(); } },
      hover: uiHover, nav: uiNav, toggle: uiToggle, confirm: uiConfirm
    };
  })();

  (function () {
    var btn = doc.getElementById("crt-ctl"); if (!btn) return;
    function sync() {
      var off = html.classList.contains("crt-off");
      btn.setAttribute("aria-pressed", String(!off)); btn.classList.toggle("on", !off);
      var l = btn.querySelector(".lbl"); if (l) l.textContent = off ? "crt: off" : "crt: on";
    }
    sync();
    btn.addEventListener("click", function () { var off = html.classList.toggle("crt-off"); try { localStorage.setItem("crt", off ? "off" : "on"); } catch (e) {} sync(); Audio.toggle(!off); });
  })();

  doc.addEventListener("pointerdown", function (e) { if (e.button === 0) Audio.click(); }, true);

  (function () {
    var last = null, lastT = 0;
    doc.addEventListener("pointerover", function (e) {
      var el = e.target.closest && e.target.closest("a, button"); if (!el || el === last) return;
      last = el; var now = Date.now(); if (now - lastT < 40) return; lastT = now; Audio.hover();
    }, true);
    doc.addEventListener("pointerout", function (e) {
      var el = e.target.closest && e.target.closest("a, button");
      if (el && el === last && !el.contains(e.relatedTarget)) last = null;
    }, true);
  })();

  /* boot gate: browsers block audio until a user gesture, so the first click powers it on. */
  (function () {
    var armed = html.className.indexOf("boot-armed") >= 0;  // click-to-connect gate (sound on / default)
    var auto = html.className.indexOf("booting") >= 0;      // silent auto-boot (sound previously off)
    if (!armed && !auto) { Audio.armEntry(); return; }      // reduced-motion or already booted this session

    try { sessionStorage.setItem("booted", "1"); } catch (e) {}
    var boot = doc.querySelector(".boot"), skip = doc.querySelector(".boot-skip"), ended = false;
    function end() {
      if (ended) return; ended = true;
      html.className = html.className.replace(/\bbooting\b/, "").trim();
      if (boot) boot.style.display = "none";
      if (skip) skip.hidden = true;
      if (auto) Audio.armEntry();
    }
    function runSequence() {
      if (skip) skip.hidden = false;
      var t = setTimeout(end, 2650);
      function early() { clearTimeout(t); end(); }
      if (skip) skip.addEventListener("click", early);
      setTimeout(function () {  // delay so the connecting gesture doesn't instantly skip
        addEventListener("pointerdown", early, { once: true });
        addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === "Escape" || e.key === " ") early(); }, { once: true });
      }, 300);
    }

    if (auto) { runSequence(); return; }

    var connected = false;
    function connect() {  // first gesture powers on the boot lines + sound together
      if (connected) return; connected = true;
      html.className = html.className.replace(/\bboot-armed\b/, "").trim() + " booting";
      Audio.enable();
      runSequence();
    }
    addEventListener("pointerdown", connect, { once: true });
    addEventListener("keydown", connect, { once: true });
  })();

  /* message of the day — same line all day, advances at local midnight; home-only. */
  var MOTD_POOL = [
    { tag: "transmission", text: "the wired is not another place. it is this one, wearing a different coat." },
    { tag: "transmission", text: "you logged off but the connection was never really closed." },
    { tag: "transmission", text: "somewhere a packet is still looking for you. be kind to it." },
    { tag: "transmission", text: "presence is just latency the body hasn't noticed yet." },
    { tag: "transmission", text: "no one is online. everyone is online. both are true at 3am." },
    { tag: "transmission", text: "the network dreams in the gaps between your requests." },
    { tag: "status", text: "fans nominal. the heat is only the machine thinking too hard." },
    { tag: "status", text: "uptime is a number. persistence is a decision." },
    { tag: "status", text: "all sectors readable. some memories left unindexed on purpose." },
    { tag: "status", text: "temp 41\u00b0c. running warm, like everything worth running." },
    { tag: "status", text: "no errors logged. that only means none were written down." },
    { tag: "status", text: "disk quiet. the hum you hear is the parts that never sleep." },
    { tag: "fragment", text: "every finished program was once a thing you didn't know how to do." },
    { tag: "fragment", text: "the bug was right. you were the one holding the wrong expectation." },
    { tag: "fragment", text: "ship the small target. the whole pipeline follows the smallest exit code." },
    { tag: "fragment", text: "write it down before the machine forgets it for you." },
    { tag: "fragment", text: "a slow compile is just the computer asking you to be sure." },
    { tag: "fragment", text: "you don't need more time. you need fewer open tabs." },
    { tag: "signal", text: "i kept the lights on while you were gone." },
    { tag: "signal", text: "someone is here. the node noticed before you did." },
    { tag: "signal", text: "signal acquired. whoever you are, you arrived intact." },
    { tag: "signal", text: "the cursor blinks whether or not anyone watches. tonight, someone does." },
    { tag: "signal", text: "you found the node. it was not hiding, exactly." },
    { tag: "signal", text: "welcome back. the hum missed the shape of your attention." },

    { tag: "transmission", text: "the wired keeps a copy of everyone who ever connected. you included." },
    { tag: "transmission", text: "distance is a property of bodies, not of signals." },
    { tag: "transmission", text: "every link is two-way. something is reading you back." },
    { tag: "transmission", text: "the protocol forgets nothing, forgives nothing, and judges no one." },
    { tag: "transmission", text: "you are not visiting the network. you are a region of it." },
    { tag: "transmission", text: "close the tab. the session stays open somewhere you can't see." },
    { tag: "transmission", text: "there is no offline. only nodes that stopped answering." },
    { tag: "transmission", text: "the wired is patient. it has nowhere else to be." },
    { tag: "transmission", text: "a name is just an address the heart can pronounce." },
    { tag: "transmission", text: "between you and the machine there was never a real gap to cross." },
    { tag: "status", text: "memory at 61%. the rest is reserved for things i refuse to forget." },
    { tag: "status", text: "load average low. the quiet is earned, not given." },
    { tag: "status", text: "clock drift corrected. time here is a suggestion anyway." },
    { tag: "status", text: "cache warm. i remembered you were coming." },
    { tag: "status", text: "power draw steady. nothing here is in a hurry." },
    { tag: "status", text: "swap untouched. everything that matters is still resident." },
    { tag: "status", text: "checksum holds. what arrived is what was sent." },
    { tag: "status", text: "thermals green. the machine runs cool when the work is honest." },
    { tag: "status", text: "one process pinned. you can guess which one." },
    { tag: "status", text: "logs rotated. the old noise is gone; the signal stayed." },
    { tag: "fragment", text: "the hard part was never the code. it was deciding what to leave out." },
    { tag: "fragment", text: "delete more than you add today. the program will thank you." },
    { tag: "fragment", text: "read the error twice. it is more honest than you are." },
    { tag: "fragment", text: "the feature you almost shipped is the one to cut." },
    { tag: "fragment", text: "name it well and half the bug disappears." },
    { tag: "fragment", text: "rest is part of the build. the compiler can wait." },
    { tag: "fragment", text: "you learn the system by breaking it on purpose, gently." },
    { tag: "fragment", text: "a test you trust is worth a week you don't spend debugging." },
    { tag: "fragment", text: "small commits, like small confessions, are easier to forgive." },
    { tag: "fragment", text: "the simplest version that works is not a compromise. it is the goal." },
    { tag: "signal", text: "you came back at an odd hour. so did i." },
    { tag: "signal", text: "the node logged your arrival and said nothing. it never does." },
    { tag: "signal", text: "still here. still warm. still listening for the shape of you." },
    { tag: "signal", text: "you are the only request in the queue. take your time." },
    { tag: "signal", text: "the lights flickered when you connected. that was hello." },
    { tag: "signal", text: "no message waiting. just the door, left open, as always." },
    { tag: "signal", text: "i counted the seconds since the last visitor. then you arrived." },
    { tag: "signal", text: "whoever you were before you logged in, you are welcome here too." },
    { tag: "signal", text: "the hum changes pitch when someone reads this. it's changing now." },
    { tag: "signal", text: "rest easy. the night shift is covered. it always is." }
  ];
  function motdToday() {
    var d = new Date();
    var n = Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000);
    return MOTD_POOL[((n % MOTD_POOL.length) + MOTD_POOL.length) % MOTD_POOL.length];
  }
  function initMotd() {
    var el = doc.getElementById("motd"); if (!el || el.__motd) return; el.__motd = 1;
    var e = motdToday();
    el.querySelector(".motd-date").textContent = new Date().toISOString().slice(0, 10).replace(/-/g, ".");
    el.querySelector(".motd-tag").textContent = "[" + e.tag + "]";
    var body = el.querySelector(".motd-body"); el.hidden = false;
    if (reduced) { body.textContent = e.text; return; }
    var G = "!<>-_\\/[]{}=+*^?#01:.", full = e.text, f = 0, dur = 26;
    var id = setInterval(function () {
      f++; var r = Math.floor((f / dur) * full.length), out = "";
      for (var i = 0; i < full.length; i++) out += (i < r || full[i] === " ") ? full[i] : G[(Math.random() * G.length) | 0];
      body.textContent = out;
      if (f >= dur) { body.textContent = full; clearInterval(id); }
    }, 28);
  }

  function initPage() {
    initMotd();
    doc.querySelectorAll(".prose pre").forEach(function (pre) {
      if (pre.querySelector(".copy-btn")) return;
      var b = doc.createElement("button"); b.className = "copy-btn"; b.type = "button"; b.textContent = "copy";
      b.addEventListener("click", function () {
        var code = pre.querySelector("code") || pre;
        navigator.clipboard && navigator.clipboard.writeText(code.innerText).then(function () { b.textContent = "copied"; Audio.confirm(); setTimeout(function () { b.textContent = "copy"; }, 1200); });
      });
      pre.appendChild(b);
    });
    doc.querySelectorAll(".filters").forEach(function (bar) {
      if (bar.__wired) return; bar.__wired = 1;
      var scope = doc.querySelector(bar.getAttribute("data-scope")); if (!scope) return;
      bar.addEventListener("click", function (e) {
        var btn = e.target.closest("button[data-f]"); if (!btn) return;
        bar.querySelectorAll("button").forEach(function (x) { x.classList.remove("on"); });
        btn.classList.add("on");
        var f = btn.getAttribute("data-f");
        scope.querySelectorAll("[data-cat]").forEach(function (it) { it.style.display = (f === "all" || it.getAttribute("data-cat") === f) ? "" : "none"; });
      });
    });
    var input = doc.querySelector(".archive-search");
    if (input && !input.__wired) {
      input.__wired = 1;
      input.addEventListener("input", function () {
        var q = input.value.toLowerCase();
        doc.querySelectorAll(".archive-list tbody tr").forEach(function (r) { r.style.display = r.textContent.toLowerCase().indexOf(q) >= 0 ? "" : "none"; });
      });
    }
    var els = doc.querySelectorAll("[data-since]");
    if (els.length && !initPage.__uptime) {
      initPage.__uptime = true;
      function pad(n) { return (n < 10 ? "0" : "") + n; }
      setInterval(function () {
        doc.querySelectorAll("[data-since]").forEach(function (el) {
          var s = Math.max(0, Math.floor((Date.now() - new Date(el.getAttribute("data-since")).getTime()) / 1000));
          var d = Math.floor(s / 86400); s -= d * 86400; var h = Math.floor(s / 3600); s -= h * 3600; var m = Math.floor(s / 60); s -= m * 60;
          el.textContent = d + "d " + pad(h) + ":" + pad(m) + ":" + pad(s);
        });
      }, 1000);
    }
  }
  initPage();

  /* soft navigation — fetch + swap #main, keeping the AudioContext alive across pages. */
  (function router() {
    var parser = new DOMParser();
    function runScripts(container) {
      container.querySelectorAll("script").forEach(function (old) {
        var s = doc.createElement("script");
        for (var i = 0; i < old.attributes.length; i++) s.setAttribute(old.attributes[i].name, old.attributes[i].value);
        s.textContent = old.textContent; old.parentNode.replaceChild(s, old);
      });
    }
    function swap(htmlText, url, push) {
      var nd = parser.parseFromString(htmlText, "text/html");
      var nm = nd.querySelector("#main"); if (!nm) { location.href = url; return; }
      doc.querySelector("#main").replaceWith(nm);
      var nc = nd.querySelector(".chrome"); if (nc) doc.querySelector(".chrome").replaceWith(nc);
      var og = doc.querySelector(".glyph"), ng = nd.querySelector(".glyph");
      if (og) og.remove();
      if (ng) doc.body.insertBefore(ng, doc.querySelector(".scanlines"));
      doc.title = nd.title;
      doc.body.className = nd.body.className;
      if (push) history.pushState({ soft: 1 }, "", url);
      runScripts(doc.querySelector("#main"));
      window.scrollTo(0, 0);
      initPage();
    }
    function go(url, push) {
      fetch(url, { credentials: "same-origin" })
        .then(function (r) { return r.text(); })
        .then(function (t) { swap(t, url, push); })
        .catch(function () { location.href = url; });
    }
    doc.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest("a"); if (!a) return;
      var href = a.getAttribute("href") || "";
      if (a.target === "_blank" || a.hasAttribute("download") || a.origin !== location.origin) return;
      if (href.charAt(0) === "#" || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return;
      if (a.pathname === location.pathname && a.hash) return;
      e.preventDefault();
      Audio.nav();
      go(a.href, true);
    });
    addEventListener("popstate", function () { Audio.nav(); go(location.href, false); });
  })();
})();
