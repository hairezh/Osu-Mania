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

async function loadSongs(){
  const grid=document.getElementById("songsGrid");
  if(!grid) return;

  try{

    const res=await fetch("data/songs.json",{cache:"no-store"});
    const songs=await res.json();

    grid.innerHTML=songs.map(s=>{

      const preview=(s.previews && s.previews[0])||"";

      return`
      <div class="card">

        <div class="previewWrap">
          <img class="thumb" src="${escapeAttr(preview)}">
        </div>

        <div class="cardBody">
          <div class="cardTitle">${escapeHtml(s.name)}</div>

          <div class="cardActions">
            <a class="small" href="${escapeAttr(s.download||"#")}" download>
            Download
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
loadSongs();
