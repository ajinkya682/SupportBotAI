(function () {
  const scriptTag = document.currentScript;
  const apiKey = scriptTag.getAttribute('data-api-key');
  const serverUrl = new URL(scriptTag.src).origin;
  const clientUrl = scriptTag.getAttribute('data-client-url') || 'http://localhost:5173';

  if (!apiKey) {
    console.error('SupportBotAI: data-api-key attribute is missing on the script tag.');
    return;
  }

  const styles = `
    #sb-ai-container { position: fixed; bottom: 24px; right: 24px; z-index: 2147483647; font-family: 'Inter', sans-serif; }
    .sb-ai-chat-window { 
      position: absolute; bottom: 78px; right: 0; width: 380px; height: 600px; 
      border-radius: 20px; background: #fff; display: none; overflow: hidden;
      box-shadow: 0 24px 60px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.12);
      transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
      opacity: 0; transform: scale(0.92) translateY(12px); transform-origin: bottom right;
      border: 1px solid rgba(255,255,255,0.12);
    }
    .sb-ai-chat-window.active { display: block; opacity: 1; transform: scale(1) translateY(0); }
    .sb-ai-bubble {
      width: 58px; height: 58px; border-radius: 50%; border: none; cursor: pointer;
      display: flex; alignItems: center; justifyContent: center; position: relative;
      transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s; outline: none; padding: 0;
    }
    .sb-ai-badge {
      position: absolute; top: -4px; right: -4px; background: #ef4444; color: #fff;
      border-radius: 50%; width: 22px; height: 22px; font-size: 11px; font-weight: bold;
      display: none; align-items: center; justify-content: center; border: 2px solid #fff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .sb-ai-toast {
      position: fixed; top: 24px; right: 24px; background: #fff; border-radius: 12px;
      padding: 16px 20px; display: none; align-items: center; gap: 12px; max-width: 320px;
      z-index: 2147483647; border: 1px solid rgba(0,0,0,0.05); cursor: pointer;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15); transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
      transform: translateX(400px);
    }
  `;

  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  if (!document.querySelector('#resolve-ai-font')) {
    const link = document.createElement('link');
    link.id = 'resolve-ai-font';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap';
    document.head.appendChild(link);
  }

  const state = {
    isOpen: false,
    themeColor: '#6366f1',
    logoUrl: null,
    unreadCount: 0
  };

  const chatSVG = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>`;
  const closeSVG = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

  const container = document.createElement('div');
  container.id = 'sb-ai-container';

  const chatWindow = document.createElement('div');
  chatWindow.className = 'sb-ai-chat-window';

  const iframe = document.createElement('iframe');
  iframe.src = `${clientUrl}/chat-widget/${apiKey}`;
  iframe.style.cssText = "width:100%; height:100%; border:none; display:block;";

  const bubble = document.createElement('button');
  bubble.className = 'sb-ai-bubble';
  bubble.setAttribute('aria-label', 'Open chat');
  bubble.style.backgroundColor = state.themeColor;

  const badge = document.createElement('div');
  badge.className = 'sb-ai-badge';

  const iconEl = document.createElement('div');
  iconEl.style.cssText = "display:flex; align-items:center; justify-content:center;";
  iconEl.innerHTML = chatSVG;

  const toast = document.createElement('div');
  toast.className = 'sb-ai-toast';

  chatWindow.appendChild(iframe);
  bubble.appendChild(badge);
  bubble.appendChild(iconEl);
  container.appendChild(chatWindow);
  container.appendChild(bubble);
  document.body.appendChild(container);
  document.body.appendChild(toast);

  function showToast(bizName, content) {
    if (state.isOpen) return;
    toast.innerHTML = `
      <div style="background:${state.themeColor}22; padding:10px; border-radius:50%; flex-shrink:0;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${state.themeColor}" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      </div>
      <div style="flex:1;">
        <div style="font-weight:700; font-size:14px; color:#1e293b; margin-bottom:2px;">${bizName}</div>
        <div style="font-size:12px; color:#64748b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:220px;">${content}</div>
      </div>`;
    toast.style.display = 'flex';
    setTimeout(() => toast.style.transform = 'translateX(0)', 50);
    setTimeout(() => {
      toast.style.transform = 'translateX(400px)';
      setTimeout(() => toast.style.display = 'none', 300);
    }, 6000);
  }

  toast.onclick = () => {
    toast.style.transform = 'translateX(400px)';
    setTimeout(() => toast.style.display = 'none', 300);
    openChat();
  };

  function openChat() {
    state.isOpen = true;
    chatWindow.classList.add('active');
    badge.style.display = 'none';
    state.unreadCount = 0;
    iconEl.innerHTML = closeSVG;
    bubble.setAttribute('aria-label', 'Close chat');
    iframe.contentWindow.postMessage('chat-opened', '*');
  }

  function closeChat() {
    state.isOpen = false;
    chatWindow.classList.remove('active');
    setTimeout(() => {
      iconEl.innerHTML = state.logoUrl
        ? `<img src="${state.logoUrl}" alt="" style="width:34px;height:34px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.5);" />`
        : chatSVG;
    }, 250);
    bubble.setAttribute('aria-label', 'Open chat');
    iframe.contentWindow.postMessage('chat-closed', '*');
  }

  bubble.onclick = () => state.isOpen ? closeChat() : openChat();
  bubble.onmouseenter = () => bubble.style.transform = 'scale(1.08)';
  bubble.onmouseleave = () => bubble.style.transform = 'scale(1)';

  window.addEventListener('message', (e) => {
    if (e.data === 'close-chat') closeChat();
    
    if (e.data.type === 'unread-count') {
      state.unreadCount = e.data.count;
      if (state.unreadCount > 0 && !state.isOpen) {
        badge.innerText = state.unreadCount > 9 ? '9+' : state.unreadCount;
        badge.style.display = 'flex';
      }
    }

    if (e.data.type === 'new-message' && !state.isOpen) {
      showToast(e.data.businessName, e.data.content);
    }
  });

  fetch(`${serverUrl}/api/chat/config/${apiKey}`)
    .then(r => r.json())
    .then(data => {
      state.themeColor = data?.appearance?.themeColor || '#6366f1';
      state.logoUrl = data?.appearance?.companyLogo || null;
      
      bubble.style.backgroundColor = state.themeColor;
      bubble.style.boxShadow = `0 8px 24px ${state.themeColor}55`;
      
      if (state.logoUrl) {
        iconEl.innerHTML = `<img src="${state.logoUrl}" alt="" style="width:34px;height:34px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.5);" />`;
      }
    }).catch(err => console.error("SupportBotAI: Failed to load config", err));
})();