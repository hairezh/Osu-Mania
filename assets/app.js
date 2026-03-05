async function loadSkins(){
  const grid = document.getElementById("skinsGrid");
  if(!grid) return;

  // remove duplicados mantendo ordem
  const uniq = (arr) => {
    const seen = new Set();
    const out = [];
    for(const x of (Array.isArray(arr) ? arr : [])){
      if(!x) continue;
      if(seen.has(x)) continue;
      seen.add(x);
      out.push(x);
    }
    return out;
  };

  try{
    const res = await fetch("data/skins.json", { cache: "no-store" });
    if(!res.ok) throw new Error(`HTTP ${res.status}`);

    const skins = await res.json();

    grid.innerHTML = skins.map((s, skinIdx) => {
      const basePreviews = uniq(s?.previews).slice(0,4);

      const variants = Array.isArray(s.variants)
        ? s.variants.filter(v => v && (v.download || v.previews))
        : [];

      // preview inicial: se tiver variants com previews, usa o da variant 0; senão base
      const v0 = variants[0] || null;
      const v0Previews = uniq(v0?.previews).slice(0,4);

      const previews = (v0Previews.length ? v0Previews : basePreviews);
      const first = previews[0] || s.thumb || "";

      const dots = previews.map((_, i) =>
        `<div class="previewDot ${i === 0 ? "active" : ""}" data-i="${i}"></div>`
      ).join("");

      const arrowsAndDots = previews.length > 1 ? `
        <div class="previewArrow left" data-dir="-1">◀</div>
        <div class="previewArrow right" data-dir="1">▶</div>
        <div class="previewDots">${dots}</div>
      ` : ``;

      // downloads:
      // - se tiver variants => botão de download vira "variant 0"
      // - senão usa s.download
      const initialDownload =
        variants.length ? (variants[0].download || s.download || "#")
                       : (s.download || "#");

      // botões de variação (se existir)
      const variantsHtml = variants.length > 1 ? `
        <div class="cardActions variantsRow">
          ${variants.map((v, i) => `
            <a class="small js-variant ${i === 0 ? "active" : ""}"
               href="#"
               data-skin="${skinIdx}"
               data-v="${i}">
              ${escapeHtml(v.label || `V${i+1}`)}
            </a>
          `).join("")}
        </div>
      ` : ``;

      return `
        <div class="card" data-skin="${skinIdx}" data-v="0">
          <div class="previewWrap">
            <img
              class="thumb js-preview"
              src="${escapeAttr(first)}"
              alt=""
              data-skin="${skinIdx}"
              data-v="0"
              data-i="0"
            >
            ${arrowsAndDots}
          </div>

          <div class="cardBody">
            <div class="cardTitle">${escapeHtml(s.name || "Untitled")}</div>

            ${variantsHtml}

            <div class="cardActions">
              <a class="small js-download"
                 href="${escapeAttr(initialDownload)}"
                 download>
                 Download
              </a>
            </div>
          </div>
        </div>
      `;
    }).join("");

    function getPreviews(skinIdx, vIdx){
      const s = skins[skinIdx];
      const base = uniq(s?.previews).slice(0,4);

      const variants = Array.isArray(s?.variants) ? s.variants : [];
      const v = variants?.[vIdx];

      const vPrev = uniq(v?.previews).slice(0,4);
      return vPrev.length ? vPrev : base;
    }

    function getDownload(skinIdx, vIdx){
      const s = skins[skinIdx];
      const variants = Array.isArray(s?.variants) ? s.variants : [];
      const v = variants?.[vIdx];
      return (v?.download || s?.download || "#");
    }

    function renderDots(wrap, previews, activeIndex){
      const dotsWrap = wrap.querySelector(".previewDots");
      if(!dotsWrap) return;

      dotsWrap.innerHTML = previews.map((_, i) =>
        `<div class="previewDot ${i === activeIndex ? "active" : ""}" data-i="${i}"></div>`
      ).join("");
    }

    function ensureArrowsDots(wrap, previews, activeIndex){
      // se só 1 preview, remove overlays se existirem
      const left = wrap.querySelector(".previewArrow.left");
      const right = wrap.querySelector(".previewArrow.right");
      const dotsWrap = wrap.querySelector(".previewDots");

      if(previews.length <= 1){
        left?.remove();
        right?.remove();
        dotsWrap?.remove();
        return;
      }

      // se não existir, cria
      if(!left){
        const el = document.createElement("div");
        el.className = "previewArrow left";
        el.dataset.dir = "-1";
        el.textContent = "◀";
        wrap.appendChild(el);
      }
      if(!right){
        const el = document.createElement("div");
        el.className = "previewArrow right";
        el.dataset.dir = "1";
        el.textContent = "▶";
        wrap.appendChild(el);
      }
      if(!dotsWrap){
        const el = document.createElement("div");
        el.className = "previewDots";
        wrap.appendChild(el);
      }

      renderDots(wrap, previews, activeIndex);
    }

    function setPreview(img, targetIndex){
      const skinIdx = Number(img.dataset.skin);
      const vIdx = Number(img.dataset.v || 0);

      const previews = getPreviews(skinIdx, vIdx);
      if(previews.length === 0) return;

      const i = ((targetIndex % previews.length) + previews.length) % previews.length;
      img.dataset.i = String(i);
      img.src = previews[i];

      const wrap = img.closest(".previewWrap");
      if(!wrap) return;

      ensureArrowsDots(wrap, previews, i);

      const dots = wrap.querySelectorAll(".previewDot");
      dots.forEach(d => d.classList.toggle("active", Number(d.dataset.i) === i));
    }

    function setVariant(card, skinIdx, vIdx){
      card.dataset.v = String(vIdx);

      // ativa botão visual
      const variantBtns = card.querySelectorAll(".js-variant");
      variantBtns.forEach(b => b.classList.toggle("active", Number(b.dataset.v) === vIdx));

      // atualiza download
      const dl = card.querySelector(".js-download");
      if(dl) dl.href = getDownload(skinIdx, vIdx);

      // reseta preview pra 0 da variação nova
      const img = card.querySelector(".js-preview");
      if(img){
        img.dataset.v = String(vIdx);
        img.dataset.i = "0";
        const previews = getPreviews(skinIdx, vIdx);
        img.src = previews[0] || img.src;

        const wrap = img.closest(".previewWrap");
        if(wrap) ensureArrowsDots(wrap, previews, 0);
      }
    }

    // Listener único
    grid.addEventListener("click", (e) => {
      const arrow = e.target.closest(".previewArrow");
      const dot = e.target.closest(".previewDot");
      const img = e.target.closest(".js-preview");
      const variantBtn = e.target.closest(".js-variant");

      // trocar variante
      if(variantBtn){
        e.preventDefault();
        const skinIdx = Number(variantBtn.dataset.skin);
        const vIdx = Number(variantBtn.dataset.v);
        const card = variantBtn.closest(".card");
        if(!card) return;
        setVariant(card, skinIdx, vIdx);
        return;
      }

      // setas
      if(arrow){
        const wrap = arrow.closest(".previewWrap");
        const imgEl = wrap?.querySelector(".js-preview");
        if(!imgEl) return;

        const dir = Number(arrow.dataset.dir || 1);
        const current = Number(imgEl.dataset.i || 0);
        setPreview(imgEl, current + dir);
        return;
      }

      // dots
      if(dot){
        const wrap = dot.closest(".previewWrap");
        const imgEl = wrap?.querySelector(".js-preview");
        if(!imgEl) return;

        const target = Number(dot.dataset.i || 0);
        setPreview(imgEl, target);
        return;
      }

      // click na imagem
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
