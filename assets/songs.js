function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, m => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[m]));
}

function escapeAttr(str){
  return escapeHtml(str);
}

function setupIntro(){
  const intro = document.getElementById("intro");
  if(!intro) return;

  window.addEventListener("load", () => {
    setTimeout(() => {
      intro.classList.add("hide");

      setTimeout(() => {
        intro.remove();
      }, 1000);
    }, 2000);
  });
}

async function loadSongs(){
  const grid = document.getElementById("songsGrid");
  if(!grid) return;

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
    const res = await fetch("data/songs.json", { cache: "no-store" });
    if(!res.ok) throw new Error(`HTTP ${res.status}`);

    const songs = await res.json();

    grid.innerHTML = songs.map((s, songIdx) => {
      const previews = uniq(s?.previews).slice(0,4);
      const first = previews[0] || "";

      const dots = previews.map((_, i) =>
        `<div class="previewDot ${i === 0 ? "active" : ""}" data-i="${i}"></div>`
      ).join("");

      const arrowsAndDots = previews.length > 1 ? `
        <div class="previewArrow left" data-dir="-1">◀</div>
        <div class="previewArrow right" data-dir="1">▶</div>
        <div class="previewDots">${dots}</div>
      ` : ``;

      return `
        <div class="card" data-song="${songIdx}">
          <div class="previewWrap">
            <img
              class="thumb js-preview"
              src="${escapeAttr(first)}"
              alt=""
              data-song="${songIdx}"
              data-i="0"
            >
            ${arrowsAndDots}
          </div>

          <div class="cardBody">
            <div class="cardTitle">${escapeHtml(s.name || "Untitled")}</div>

            <div class="cardActions">
              <a class="small" href="${escapeAttr(s.download || "#")}" download>
                Download
              </a>
            </div>
          </div>
        </div>
      `;
    }).join("");

    function setPreview(img, targetIndex){
      const songIdx = Number(img.dataset.song);
      const previews = uniq(songs[songIdx]?.previews).slice(0,4);
      if(previews.length === 0) return;

      const i = ((targetIndex % previews.length) + previews.length) % previews.length;

      img.dataset.i = String(i);
      img.src = previews[i];

      const wrap = img.closest(".previewWrap");
      if(!wrap) return;

      const dots = wrap.querySelectorAll(".previewDot");
      dots.forEach(d =>
        d.classList.toggle("active", Number(d.dataset.i) === i)
      );
    }

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
      }
    });

  }catch(e){
    console.error(e);
    grid.innerHTML = `<div class="mini">Couldn’t load songs.json</div>`;
  }
}

setupIntro();
loadSongs();
