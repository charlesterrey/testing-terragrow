// Video demo modal — auto-shows on first visit, re-openable via "i" button
(function () {
  var STORAGE_KEY = 'tg_demo_seen';

  // Build modal overlay
  var overlay = document.createElement('div');
  overlay.id = 'video-modal-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;background:rgba(2,17,48,0.75);backdrop-filter:blur(4px);opacity:0;transition:opacity 250ms ease-out;';

  var modal = document.createElement('div');
  modal.style.cssText = 'position:relative;width:90%;max-width:840px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);transform:scale(0.96) translateY(8px);transition:transform 250ms ease-out;';

  var video = document.createElement('video');
  video.id = 'demo-video';
  video.src = 'demo.mp4';
  video.controls = true;
  video.style.cssText = 'width:100%;display:block;';

  var btnWrap = document.createElement('div');
  btnWrap.style.cssText = 'padding:12px 16px;display:flex;justify-content:flex-end;border-top:1px solid #efefef;';

  var closeBtn = document.createElement('button');
  closeBtn.textContent = 'Fermer';
  closeBtn.className = 'text-sm font-medium text-white bg-[#021130] hover:bg-[#021130]/80 px-4 py-1.5 rounded-md transition-colors';
  closeBtn.type = 'button';

  btnWrap.appendChild(closeBtn);
  modal.appendChild(video);
  modal.appendChild(btnWrap);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Build floating "i" button (bottom-right)
  var infoBtn = document.createElement('button');
  infoBtn.type = 'button';
  infoBtn.title = 'Voir la vidéo de démo';
  infoBtn.className = 'fixed z-[9998] flex items-center justify-center w-9 h-9 rounded-full border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-950 hover:text-white hover:border-neutral-950 transition-colors shadow-sm';
  infoBtn.style.cssText = 'bottom:20px;right:20px;font-family:Inter,system-ui,sans-serif;';
  infoBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width:16px;height:16px"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd"/></svg>';
  document.body.appendChild(infoBtn);

  function openModal() {
    overlay.style.display = 'flex';
    // Force reflow then animate in
    overlay.offsetHeight;
    overlay.style.opacity = '1';
    modal.style.transform = 'scale(1) translateY(0)';
  }

  function closeModal() {
    overlay.style.opacity = '0';
    modal.style.transform = 'scale(0.96) translateY(8px)';
    video.pause();
    setTimeout(function () { overlay.style.display = 'none'; }, 250);
    localStorage.setItem(STORAGE_KEY, '1');
  }

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });
  infoBtn.addEventListener('click', openModal);

  // Auto-show on first visit
  if (!localStorage.getItem(STORAGE_KEY)) {
    // Small delay so the page renders first
    setTimeout(openModal, 400);
  }
})();
