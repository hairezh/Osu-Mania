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

async function loadMaps(){
  const grid=document.getElementById("mapsGrid");
  if(!grid) return;

  try{

    const res=await fetch("data/maps.json",{cache:"no-store"});
    const maps=await res.json();

    grid.innerHTML=maps.map(m=>{

      const preview=(m.previews && m.previews[0])||"";

      return`
      <div class="card">

        <div class="previewWrap">
          <img class="thumb" src="${escapeAttr(preview)}">
        </div>

        <div class="cardBody">

          <div class="cardTitle">${escapeHtml(m.name)}</div>

          <div class="cardActions">

            <a class="small" href="${escapeAttr(m.download)}" download>
            Download
            </a>

            <a class="small" href="${escapeAttr(m.osu||"#")}" target="_blank">
            osu! page
            </a>

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
loadMaps();
