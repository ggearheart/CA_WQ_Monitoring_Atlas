// Shared chrome + helpers for every plate.
const PLATES = [
  ["index.html", "Atlas"],
  ["plates/why.html", "I · Why Monitor"],
  ["plates/council.html", "II · The Council"],
  ["plates/swamp.html", "III · SWAMP"],
  ["plates/budget.html", "IV · Budget"],
  ["plates/who-pays.html", "V · Who Pays"],
  ["plates/benefits.html", "VI · Benefits"],
  ["plates/risks.html", "VII · Risks"],
  ["plates/priorities.html", "VIII · Next Five Years"],
  ["plates/sources.html", "Sources"],
];

const ROOT = document.documentElement.dataset.root || "";

function chrome() {
  const file = location.pathname.split("/").pop() || "index.html";
  const idx = PLATES.findIndex(([href]) => href.split("/").pop() === file);
  const nav = PLATES.slice(1).map(([href, label], i) => {
    const cur = i + 1 === idx ? ' aria-current="page"' : "";
    return `<a href="${ROOT}${href}"${cur}>${label}</a>`;
  }).join("");
  document.body.insertAdjacentHTML("afterbegin",
    `<header class="site"><div class="wrap"><a class="brand" href="${ROOT}index.html">CA Water Quality Monitoring Atlas</a><nav>${nav}</nav></div></header>`);

  // Previous / next plate links at the foot of each plate.
  const main = document.querySelector("main");
  if (main && idx > 0) {
    const prev = PLATES[idx - 1], next = PLATES[idx + 1];
    main.insertAdjacentHTML("beforeend",
      `<nav class="pager">${prev ? `<a href="${ROOT}${prev[0]}">← ${prev[1]}</a>` : "<span></span>"}${next ? `<a href="${ROOT}${next[0]}">${next[1]} →</a>` : "<span></span>"}</nav>`);
  }
  document.body.insertAdjacentHTML("beforeend",
    `<footer class="site"><div class="wrap">An independent atlas of statewide ambient surface water quality monitoring in California. Not an official State publication. Every figure is sourced on the plate where it appears; full references are on the <a href="${ROOT}plates/sources.html">Sources</a> page. Corrections welcome.</div></footer>`);
}

// One floating tooltip shared by every chart on the page.
const tip = (() => {
  let el;
  return {
    show(html, ev) {
      if (!el) { el = document.createElement("div"); el.className = "tip"; document.body.append(el); }
      el.innerHTML = html; el.classList.add("on");
      const x = Math.min(ev.clientX + 14, innerWidth - el.offsetWidth - 8);
      const y = ev.clientY + 14 + el.offsetHeight > innerHeight ? ev.clientY - el.offsetHeight - 10 : ev.clientY + 14;
      el.style.left = x + "px"; el.style.top = y + "px";
    },
    hide() { el && el.classList.remove("on"); },
  };
})();

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Simple vertical bar chart. rows: [{k, v, c?, tip?}]
function vbars(host, rows, o = {}) {
  const W = 960, H = o.h || 300, pl = 8, pr = 8, pt = 26, pb = 34;
  const max = o.max || Math.max(...rows.map(r => r.v)) * 1.08;
  const bw = (W - pl - pr) / rows.length;
  const fmt = o.fmt || (v => v.toLocaleString());
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || "")}" style="width:100%;height:auto;display:block">`;
  s += `<line x1="${pl}" x2="${W - pr}" y1="${H - pb}" y2="${H - pb}" stroke="var(--axis)"/>`;
  rows.forEach((r, i) => {
    const h = r.v / max * (H - pt - pb), x = pl + i * bw + bw * 0.14, y = H - pb - h, w = bw * 0.72;
    s += `<g class="b" data-i="${i}"><rect x="${pl + i * bw}" y="0" width="${bw}" height="${H}" fill="transparent"/>
      <rect x="${x}" y="${y}" width="${w}" height="${Math.max(h, 1)}" rx="3" fill="${r.c || "var(--s1)"}"/>
      <text x="${x + w / 2}" y="${y - 6}" text-anchor="middle" font-size="${o.fs || 13}" font-weight="600" fill="var(--ink)">${fmt(r.v)}</text>
      <text x="${x + w / 2}" y="${H - pb + 18}" text-anchor="middle" font-size="12" fill="var(--muted)">${esc(r.k)}</text></g>`;
  });
  host.innerHTML = s + "</svg>";
  host.querySelectorAll(".b").forEach(g => {
    const r = rows[g.dataset.i];
    g.addEventListener("mousemove", e => tip.show(r.tip || `<b>${esc(r.k)}</b><br>${fmt(r.v)}`, e));
    g.addEventListener("mouseleave", tip.hide);
  });
}

// Simple horizontal bar chart with direct labels. rows: [{k, v, lab, c?, sub?}]
function hbars(host, rows, o = {}) {
  const W = 960, rh = o.rh || 54, lw = o.lw || 300, pr = 150;
  const max = o.max || Math.max(...rows.map(r => r.v));
  const H = rows.length * rh + 8;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || "")}" style="width:100%;height:auto;display:block">`;
  rows.forEach((r, i) => {
    const y = i * rh + 8, w = Math.max(r.v / max * (W - lw - pr), 2);
    s += `<text x="${lw - 12}" y="${y + 17}" text-anchor="end" font-size="14" font-weight="600" fill="var(--ink)">${esc(r.k)}</text>`;
    if (r.sub) s += `<text x="${lw - 12}" y="${y + 34}" text-anchor="end" font-size="12" fill="var(--muted)">${esc(r.sub)}</text>`;
    s += `<rect x="${lw}" y="${y + 2}" width="${w}" height="26" rx="3" fill="${r.c || "var(--s1)"}"/>`;
    s += `<text x="${lw + w + 8}" y="${y + 20}" font-size="14" font-weight="600" fill="var(--ink)">${esc(r.lab)}</text>`;
  });
  host.innerHTML = s + "</svg>";
}

chrome();
