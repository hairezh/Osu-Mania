function escapeHtml(str){
  return String(str).replace(/[&<>"']/g,m=>({
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

function setupClock(){
  const clock=document.getElementById("clockBox");
  if(!clock) return;

  function updateClock(){
    const now=new Date();
    const date=now.toLocaleDateString("en-GB");
    const time=now.toLocaleTimeString("en-GB");

    clock.innerHTML=`${date}<br>${time}`;
  }

  updateClock();
  setInterval(updateClock,1000);
}

async function loadArchives(){
  const grid=document.getElementById("archivesGrid");
  if(!grid) return;

  try{

    const res=await fetch("data/archives.json",{cache:"no-store"});
    const archives=await res.json();

    grid.innerHTML=archives.map(a=>{

      const preview=(a.previews && a.previews[0])||"";

      return`
      <div class="card">

        <div class="previewWrap">
          <img class="thumb" src="${escapeAttr(preview)}">
        </div>

        <div class="cardBody">

          <div class="cardTitle">${escapeHtml(a.name)}</div>

          <div class="cardActions">

            <a class="small" href="${escapeAttr(a.download)}" download>
            Download
            </a>

            ${a.source?`<a class="small" href="${escapeAttr(a.source)}" target="_blank">Source</a>`:""}

          </div>

        </div>

      </div>
      `;

    }).join("");

  }catch(e){
    console.error(e);
  }
}

setupClock();
loadArchives();
