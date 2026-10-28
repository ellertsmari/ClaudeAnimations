// Animations with Claude · model toggle, prompt list, copy buttons, step ticks, contents highlight

(function () {
  // ---------- which model: strong (explore) or weak (step by step) ----------
  var root = document.documentElement;
  var modeBtns = Array.prototype.slice.call(document.querySelectorAll("[data-set-model]"));
  function setModel(m, save) {
    root.setAttribute("data-model", m);
    modeBtns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-set-model") === m ? "true" : "false"); });
    if (save) store("awc-model", m);
  }
  modeBtns.forEach(function (b) {
    b.addEventListener("click", function () { setModel(b.getAttribute("data-set-model"), true); });
  });
  setModel(root.getAttribute("data-model") === "weak" ? "weak" : "strong", false);

  // the small floating toggle shows once the big one in the hero has scrolled away
  var pick = document.getElementById("pick");
  var float = document.getElementById("modeFloat");
  if (pick && float && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      var away = !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0;
      float.classList.toggle("show", away);
      float.setAttribute("aria-hidden", away ? "false" : "true");
      float.querySelectorAll("button").forEach(function (b) { b.tabIndex = away ? 0 : -1; });
    }).observe(pick);
  }

  // ---------- "All the prompts": a copy of every prompt in the steps, in order ----------
  var list = document.getElementById("promptList");
  if (list) {
    document.querySelectorAll(".step").forEach(function (step) {
      step.querySelectorAll("figure.prompt").forEach(function (fig) {
        var copy = fig.cloneNode(true);
        // keep which model it belongs to, even when that was set on a wrapper
        var owner = fig.closest("[data-for]");
        if (owner && !copy.hasAttribute("data-for")) copy.setAttribute("data-for", owner.getAttribute("data-for"));
        var from = document.createElement("a");
        from.className = "pl-from";
        from.href = "#" + step.id;
        from.textContent = "step " + step.querySelector(".num").textContent;
        copy.querySelector("figcaption").insertBefore(from, copy.querySelector(".copy"));
        list.appendChild(copy);
      });
    });
  }

  // ---------- copy buttons ----------
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".prompt .copy");
    if (!btn) return;
    var text = btn.closest(".prompt").querySelector("pre").textContent;
    var done = function () {
      btn.textContent = "Copied";
      btn.classList.add("ok");
      setTimeout(function () { btn.textContent = "Copy"; btn.classList.remove("ok"); }, 1600);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else {
      fallbackCopy(text);
      done();
    }
  });

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* nothing more we can do */ }
    document.body.removeChild(ta);
  }

  // ---------- step ticks (kept in this browser only) ----------
  var steps = Array.prototype.slice.call(document.querySelectorAll(".step"));
  var ticks = {};
  try { ticks = JSON.parse(load("awc-steps") || "{}") || {}; } catch (e) { ticks = {}; }

  function paint() {
    var count = 0;
    steps.forEach(function (step) {
      var id = step.id;
      var on = !!ticks[id];
      if (on) count++;
      step.classList.toggle("is-done", on);
      step.querySelector(".done input").checked = on;
      document.querySelectorAll('a[href="#' + id + '"]').forEach(function (a) { a.classList.toggle("is-done", on); });
    });
    var out = document.getElementById("doneCount");
    if (out) out.textContent = count;
  }
  steps.forEach(function (step) {
    step.querySelector(".done input").addEventListener("change", function (e) {
      ticks[step.id] = e.target.checked;
      store("awc-steps", JSON.stringify(ticks));
      paint();
    });
  });
  paint();

  // ---------- highlight the current section in the contents ----------
  var links = Array.prototype.slice.call(document.querySelectorAll(".toc a"));
  var targets = links.map(function (a) { return document.querySelector(a.getAttribute("href")); }).filter(Boolean);
  if ("IntersectionObserver" in window && targets.length) {
    var visible = new Map();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible.set(en.target.id, en.isIntersecting ? en.boundingClientRect.top : null); });
      var best = null, bestTop = Infinity;
      visible.forEach(function (top, id) { if (top !== null && Math.abs(top) < bestTop) { bestTop = Math.abs(top); best = id; } });
      if (best) links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + best); });
    }, { rootMargin: "-10% 0px -60% 0px" });
    targets.forEach(function (t) { io.observe(t); });
  }

  // ---------- storage that never throws ----------
  function load(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function store(key, val) { try { localStorage.setItem(key, val); } catch (e) { /* private mode */ } }
})();
