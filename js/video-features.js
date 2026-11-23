(function () {
  console.log("Iniciando video-features.js...");

  const VIDEO_ID = "6a95a8a009d9c7ec2431c3c8";
  const EMBED_BASE = "https://scripts.converteai.net/cc9ae8cc-5df3-4982-a0c5-9f441fb7c292/players/" + VIDEO_ID + "/v4/embed.html";
  let lastKnownDuration = 1350;

  function setupDOM() {
    // Remover logo acima do título se existir
    const existingLogo = document.querySelector("#logo-7palavras-hero");
    if (existingLogo) existingLogo.remove();

    // Remover botão de pular se existir
    const existingBtn = document.querySelector("#btn-skip-container");
    if (existingBtn) existingBtn.remove();

    // Remover qualquer selo duplicado/injetado abaixo do botão de CTA
    document.querySelectorAll("[class*='selo-garantia-injected']").forEach((el) => el.remove());

    // Garantir link correto e target="_blank" em todos os botões de compra
    const ctaLinks = document.querySelectorAll("a[href*='kiwify']");
    ctaLinks.forEach((cta) => {
      cta.href = "https://pay.kiwify.com.br/UlhIdZf";
      cta.target = "_blank";
      cta.rel = "noopener noreferrer";
    });

    // 3. Posicionar e ampliar "FOI NOTÍCIA TAMBÉM EM" logo abaixo do vídeo
    const videoWrapper = document.querySelector("#ifr_" + VIDEO_ID + "_wrapper");
    const pressImg = document.querySelector("img[src*='foi-noticia']");
    const pressSection = pressImg?.closest("section");
    if (videoWrapper && pressSection && videoWrapper.nextElementSibling !== pressSection) {
      videoWrapper.after(pressSection);
    }
    if (pressSection) {
      pressSection.style.backgroundColor = "#FBF6E9";
      pressSection.style.padding = "0.75rem 1rem 1.25rem 1rem";
    }
    if (pressImg) {
      pressImg.style.width = "100%";
      pressImg.style.maxWidth = "400px";
      pressImg.style.display = "block";
      pressImg.style.margin = "0 auto";
      pressImg.style.mixBlendMode = "multiply";
    }

    // 4. Configurar telas sobrepostas no vídeo (Retomada & Tela Final)
    setupVideoOverlays();
  }

  function setupVideoOverlays() {
    const aspectContainer = document.querySelector("#ifr_" + VIDEO_ID + "_aspect");
    if (!aspectContainer) return;

    let overlay = document.querySelector("#vsl-overlay-container");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "vsl-overlay-container";
      overlay.style.position = "absolute";
      overlay.style.inset = "0";
      overlay.style.zIndex = "30";
      overlay.style.display = "none";
      aspectContainer.appendChild(overlay);
    }

    // Se estiver exibindo a tela antiga de retomada, limpa
    if (overlay.querySelector("#btn-vsl-resume")) {
      overlay.style.display = "none";
      overlay.innerHTML = "";
    }

    const isCompleted = localStorage.getItem("vsl_completed_7palavras") === "true";
    if (isCompleted) {
      showCompletedScreen();
    }
  }

  function showCompletedScreen() {
    const overlay = document.querySelector("#vsl-overlay-container");
    if (!overlay) return;

    // Liberar o bloco de compras
    const esconder = document.querySelector(".esconder");
    if (esconder) esconder.style.display = "block";

    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.position = "absolute";
    overlay.style.inset = "0";
    overlay.style.zIndex = "30";
    overlay.style.overflow = "hidden";
    overlay.style.padding = "1.5rem";
    overlay.style.textAlign = "center";

    overlay.innerHTML = `
      <img src="/capa-manual-final.jpg" alt="Manual das 7 Palavras de Salomão" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1;" />
      <div style="position: absolute; inset: 0; background: rgba(0, 0, 0, 0.82); backdrop-filter: blur(3px); z-index: 2;"></div>
      <div style="position: relative; z-index: 10; display: flex; flex-direction: column; align-items: center; max-width: 300px;">
        <div style="width: 56px; height: 56px; border-radius: 9999px; background: linear-gradient(135deg, #F59E0B, #EAB308); color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.5); border: 3px solid rgba(254, 240, 138, 0.4); margin-bottom: 14px;">
          <svg style="width: 28px; height: 28px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h3 style="font-family: Archivo, sans-serif; font-size: 1.4rem; font-weight: 900; color: #F6E8CB; margin-bottom: 8px; line-height: 1.25;">
          Você já assistiu a esse vídeo
        </h3>
        <p style="font-size: 0.75rem; color: #D1D5DB; margin-bottom: 22px; line-height: 1.4;">
          Aproveite as bênçãos e garanta o seu acesso ao manual completo logo abaixo!
        </p>
        <button id="btn-vsl-watch-again" style="width: 100%; padding: 14px 20px; border-radius: 9999px; background: linear-gradient(to right, #06B6D4, #2563EB); color: #FFFFFF; font-weight: 700; font-size: 1rem; border: none; cursor: pointer; box-shadow: 0 10px 20px -3px rgba(37, 99, 235, 0.4); transition: transform 0.2s;">
          Assistir novamente
        </button>
      </div>
    `;

    document.getElementById("btn-vsl-watch-again")?.addEventListener("click", () => {
      overlay.style.display = "none";
      localStorage.removeItem("vsl_completed_7palavras");
      localStorage.removeItem("vsl_progress_7palavras");
      const iframe = document.querySelector("#ifr_" + VIDEO_ID);
      if (iframe) {
        iframe.src = EMBED_BASE + "?start=0&autoplay=true&vl=" + encodeURIComponent(window.location.href);
      }
    });
  }

  // Escuta de mensagens do iframe VTurb
  window.addEventListener("message", function (ev) {
    try {
      const data = typeof ev.data === "string" ? JSON.parse(ev.data) : ev.data;
      if (!data) return;

      let time = 0, duration = 0, isEnd = false;
      if (data.type === "video:timeupdate" && data.detail) {
        time = data.detail.time;
        duration = data.detail.duration;
      } else if (data.currentTime !== undefined) {
        time = data.currentTime;
        duration = data.duration;
      } else if (data.time !== undefined) {
        time = data.time;
        if (data.duration) duration = data.duration;
      }

      if (duration > 10) {
        lastKnownDuration = duration;
      }

      if (data.type === "video:ended" || data.event === "ended" || (duration > 30 && time >= duration - 2)) {
        isEnd = true;
      }

      if (time > 5) {
        localStorage.setItem("vsl_progress_7palavras", Math.floor(time));
      }

      if (isEnd) {
        localStorage.setItem("vsl_completed_7palavras", "true");
        showCompletedScreen();
      }
    } catch (e) {}
  });

  // Conexão com a API nativa do smartplayer
  const spInterval = setInterval(() => {
    if (window.smartplayer && window.smartplayer.instances && window.smartplayer.instances[0]) {
      const inst = window.smartplayer.instances[0];
      inst.on("timeupdate", (t) => {
        if (t > 5) localStorage.setItem("vsl_progress_7palavras", Math.floor(t));
      });
      if (inst.instance) {
        inst.instance.addEventListener("video:ended", () => {
          localStorage.setItem("vsl_completed_7palavras", "true");
          showCompletedScreen();
        });
      }
      clearInterval(spInterval);
    }
  }, 1000);

  // Monitorar montagem do React no DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setInterval(setupDOM, 800);
    });
  } else {
    setInterval(setupDOM, 800);
  }
})();
