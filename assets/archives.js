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

async function loadArchives(){
  const grid = document.getElementById("archivesGrid");
  if(!grid) return;

  try{
    const res = await fetch("data/archives.json", { cache:"no-store" });
    if(!res.ok) throw new Error(`HTTP ${res.status}`);

    const archives = await res.json();

    grid.innerHTML = archives.map((a) => {
      const preview = (a.previews && a.previews[0]) || "";

      return `
        <div class="card">
          <div class="previewWrap">
            <img
              class="thumb"
              src="${escapeAttr(preview)}"
              alt=""
            >
          </div>

          <div class="cardBody">
            <div class="cardTitle">${escapeHtml(a.name || "Untitled")}</div>

            <div class="cardActions">
              <a class="small"
                 href="${escapeAttr(a.download || "#")}"
                 download>
                 Download
              </a>

              ${a.source ? `
                <a class="small"
                   href="${escapeAttr(a.source)}"
                   target="_blank"
                   rel="noopener noreferrer">
                   Source
                </a>
              ` : ""}
            </div>
          </div>
        </div>
      `;
    }).join("");

  }catch(e){
    console.error(e);
    grid.innerHTML = `<div class="mini">Couldn't load archives.json</div>`;
  }
}

loadArchives();
