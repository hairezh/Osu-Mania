async function loadSkins(){
  const grid = document.getElementById("skinsGrid");
  const tabsEl = document.getElementById("skinsTabs");
  if(!grid) return;

  try{
    const res = await fetch("data/skins.json", { cache: "no-store" });
    if(!res.ok) throw new Error(`HTTP ${res.status}`);

    const skins = await res.json();

    // ---------------------------
    // Tabs / Categorias
    // ---------------------------
    let activeCategory = "All";
    const categories = ["All", ...new Set(skins.map(s => s.category).filter(Boolean))];

    if(tabsEl){
      tabsEl.innerHTML = categories.map(c => `
        <a class="btn ${c === activeCategory ? "active" : ""}" href="#" data-cat="${escapeAttr(c)}">
          ${escapeHtml(c)}
        </a>
      `).join("");

      tabsEl.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn");
        if(!btn) return;
        e.preventDefault();

        activeCategory = btn.dataset.cat || "All";

        // atualiza estado visual
        tabsEl.querySelectorAll(".btn").forEach(b =>
          b.classList.toggle("active", b.dataset.cat === activeCategory)
        );

        const filtered = (activeCategory === "All")
          ? skins
          : skins.filter(s => s.category === activeCategory);

        renderGrid(filtered);
      });
    }

    // ---------------------------
    // Render inicial
    // ---------------------------
    renderGrid(skins);

    function renderGrid(list){
      if(!Array.isArray(list) || list.length === 0){
        grid.innerHTML = `<div class="mini">Nenhum skin nessa categoria.</div>`;
        return;
      }

      grid.innerHTML = list.map((s) => {
        const previews = Array.isArray(s.previews) ? s.previews.filter(Boolean).slice(0,4) : [];
        const first = previews[0] || s.thumb || "";

        const dots = previews.map((_, i) =>
          `<div class="previewDot ${i === 0 ? "active" : ""}" data-i="${i}"></div>`
        ).join("");

        // downloads: variants (preferencial) ou download simples
        const variants = Array.isArray(s.variants) ? s.variants.filter(v => v && v.download) : [];

        const downloadsHtml =
          variants.length
            ? variants.map(v => `
                <a class="small" href="${escapeAttr(v.download)}" download>
                  ${escapeHtml(v.label || "Download")}
                </a>
              `).join("")
            : (s.download
                ? `<a class="small" href="${escapeAttr(s.download)}" download>Download</a>`
                : `<span class="mini">Sem download</span>`
              );

        // chave estável (pra preview não quebrar quando filtra)
        const skinKey = s.id ? String(s.id) : `idx:${skins.indexOf(s)}`;

        return `
          <div class="card">
            <div class="previewWrap">
              <img
                class="thumb js-preview"
                src="${escapeAttr(first)}"
                alt=""
                data-skin="${escapeAttr(skinKey)}"
                data-i="0"
              >
              ${previews.length > 1 ? `
                <div class="previewArrow left" data-dir="-1">◀</div>
                <div class="previewArrow right" data-dir="1">▶</div>
                <div class="previewDots">${dots}</div>
              ` : ``}
            </div>

            <div class="cardBody">
              <div class="cardTitle">${escapeHtml(s.name || "Untitled")}</div>

              <div class="meta">
                ${s.category ? `<span>${escapeHtml(s.category)}</span>` : ``}
                ${previews.length ? `<span>${previews.length} preview(s)</span>` : ``}
              </div>

              <div class="cardActions">
                ${downloadsHtml}
              </div>
            </div>
          </div>
        `;
      }).join("");
    }

    function getSkinByKey(key){
      const k = String(key || "");
      if(k.startsWith("idx:")){
        const idx = Number(k.slice(4));
        return skins[idx];
      }
      return skins.find(s => String(s.id) === k);
    }

    function setPreview(img, targetIndex){
      const s = getSkinByKey(img.dataset.skin);
      const previews = Array.isArray(s?.previews) ? s.previews.filter(Boolean).slice(0,4) : [];
      if(previews.length === 0) return;

      const i = ((targetIndex % previews.length) + previews.length) % previews.length;
      img.dataset.i = String(i);
      img.src = previews[i];

      const wrap = img.closest(".previewWrap");
      const dots = wrap?.querySelectorAll(".previewDot") || [];
      dots.forEach(d => d.classList.toggle("active", Number(d.dataset.i) === i));
    }

    // ---------------------------
    // Preview interações (setas/dots/click imagem)
    // ---------------------------
    grid.addEventListener("click", (e) => {
      const arrow = e.target.closest(".previewArrow");
      const dot = e.target.closest(".previewDot");
      const img = e.target.closest(".js-preview");

      if(arrow){
        const wrap = arrow.closest(".previewWrap");
        const imgEl = wrap?.querySelector(".js-preview");
        if(!imgEl) return;

        const dir = Number(arrow.dataset.dir || 1);
        const current = Number(imgEl.dataset.i || 0);
        setPreview(imgEl, current + dir);
        return;
      }

      if(dot){
        const wrap = dot.closest(".previewWrap");
        const imgEl = wrap?.querySelector(".js-preview");
        if(!imgEl) return;

        const target = Number(dot.dataset.i || 0);
        setPreview(imgEl, target);
        return;
      }

      if(img){
        const current = Number(img.dataset.i || 0);
        setPreview(img, current + 1);
        return;
      }
    });

  }catch(e){
    console.error(e);
    grid.innerHTML = `<div class="mini">Couldn’t load skins.json</div>`;
  }
}

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, m => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[m]));
}

function escapeAttr(str){ return escapeHtml(str); }

loadSkins();
