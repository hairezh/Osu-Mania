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

/* INTRO */

function setupIntro(){
  const intro = document.getElementById("intro");
  if(!intro) return;

  const alreadyShown = sessionStorage.getItem("introShown");

  if(alreadyShown){
    intro.remove();
    return;
  }

  window.addEventListener("load", () => {
    sessionStorage.setItem("introShown","true");

    setTimeout(()=>{
      intro.classList.add("hide");

      setTimeout(()=>{
        intro.remove();
      },1000);

    },2000);
  });
}

/* CLOCK */

function setupClock(){
  const clock=document.getElementById("clockBox");
  if(!clock) return;

  function updateClock(){
    const now=new Date();

    const date=now.toLocaleDateString("en-GB",{
      day:"2-digit",
      month:"2-digit",
      year:"numeric"
    });

    const time=now.toLocaleTimeString("en-GB",{
      hour:"2-digit",
      minute:"2-digit",
      second:"2-digit"
    });

    clock.innerHTML=`${date}<br>${time}`;
  }

  updateClock();
  setInterval(updateClock,1000);
}

/* SKINS */

async function loadSkins(){
  const grid=document.getElementById("skinsGrid");
  if(!grid) return;

  try{
    const res=await fetch("data/skins.json",{cache:"no-store"});
    const skins=await res.json();

    grid.innerHTML=skins.map(s=>{

      const preview=(s.previews && s.previews[0])||"";

      return`
      <div class="card">

        <div class="previewWrap">
          <img class="thumb" src="${escapeAttr(preview)}">
        </div>

        <div class="cardBody">
          <div class="cardTitle">${escapeHtml(s.name)}</div>

          <div class="cardActions">
            <a class="small" href="${escapeAttr(s.download)}" download>
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

setupIntro();
setupClock();
loadSkins();
