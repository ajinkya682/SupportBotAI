(function () {
  const scriptTag = document.currentScript;
  const apiKey = scriptTag.getAttribute('data-api-key');
  const serverUrl = '__SERVER_BASE_URL__';
  const clientUrl = scriptTag.getAttribute('data-client-url') || serverUrl;

  if (!apiKey) {
    console.error('SupportBotAI: data-api-key attribute is missing on the script tag.');
    return;
  }

  let isOpen = false;
  let themeColor = '#6366f1';
  let logoUrl = null;
  let unreadCount = 0;
  const TOAST_AUTO_DISMISS_MS = 6000;

  const styleId = 'supportbotai-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .sb-ai-container { position: fixed; bottom: 24px; right: 24px; z-index: 2147483647; font-family: 'Inter', sans-serif; }
      .sb-ai-window { 
        position: absolute; bottom: 78px; right: 0; width: 380px; height: 600px; 
        border-radius: 20px; box-shadow: 0 24px 60px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.12);
        display: none; overflow: hidden; opacity: 0; background: #fff; border: 1px solid rgba(255,255,255,0.12);
        transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
        transform: scale(0.92) translateY(12px); transform-origin: bottom right;
      }
      .sb-ai-bubble { 
        width: 58px; height: 58px; border-radius: 50%; border: none; cursor: pointer;
        display: flex; align-items: center; justify-content: center; position: relative;
        transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s; outline: none;
      }
      .sb-ai-badge {
        position: absolute; top: -4px; right: -4px; background: #ef4444; color: #fff;
        border-radius: 50%; width: 22px; height: 22px; font-size: 11px; font-weight: bold;
        display: none; align-items: center; justify-content: center; border: 2px solid #fff;
      }
      .sb-ai-toast {
        position: fixed; top: 24px; right: 24px; background: #fff; border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.15); padding: 16px 20px; display: none;
        align-items: center; gap: 12px; max-width: 320px; z-index: 2147483647;
        border: 1px solid rgba(0,0,0,0.05); cursor: pointer; transform: translateX(400px);
        transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
      }
    `;
    document.head.appendChild(style);
  }

  if (!document.querySelector('#supportbotai-font')) {
    const link = document.createElement('link');
    link.id = 'supportbotai-font';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap';
    document.head.appendChild(link);
  }

  const container = document.createElement('div');
  container.className = 'sb-ai-container';

  const chatWindow = document.createElement('div');
  chatWindow.className = 'sb-ai-window';

  const iframe = document.createElement('iframe');
  iframe.src = `${clientUrl}/chat-widget/${apiKey}`;
  Object.assign(iframe.style, { width: '100%', height: '100%', border: 'none', display: 'block' });

  const bubble = document.createElement('button');
  bubble.className = 'sb-ai-bubble';
  bubble.style.backgroundColor = themeColor;
  bubble.setAttribute('aria-label', 'Open chat');

  const badge = document.createElement('div');
  badge.className = 'sb-ai-badge';

  const toast = document.createElement('div');
  toast.className = 'sb-ai-toast';

  const chatSVG = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>`;
  const closeSVG = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

  const iconEl = document.createElement('div');
  Object.assign(iconEl.style, { display: 'flex', alignItems: 'center', justifyContent: 'center' });
  iconEl.innerHTML = chatSVG;

  const showToast = (bizName, content) => {
    if (isOpen) return;
    toast.innerHTML = `
      <div style="background:${themeColor}22; padding:10px; border-radius:50%; flex-shrink:0;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${themeColor}" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      </div>
      <div style="flex:1;">
        <div style="font-weight:700; font-size:14px; color:#1e293b; margin-bottom:2px;">${bizName}</div>
        <div style="font-size:12px; color:#64748b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:220px;">${content}</div>
      </div>`;
    toast.style.display = 'flex';
    setTimeout(() => { toast.style.transform = 'translateX(0)'; }, 50);
    setTimeout(() => {
      toast.style.transform = 'translateX(400px)';
      setTimeout(() => { toast.style.display = 'none'; }, 300);
    }, TOAST_AUTO_DISMISS_MS);
  };

  const openChat = () => {
    isOpen = true;
    chatWindow.style.display = 'block';
    badge.style.display = 'none';
    unreadCount = 0;
    requestAnimationFrame(() => {
      chatWindow.style.opacity = '1';
      chatWindow.style.transform = 'scale(1) translateY(0)';
    });
    iconEl.innerHTML = closeSVG;
    bubble.setAttribute('aria-label', 'Close chat');
    iframe.contentWindow.postMessage('chat-opened', '*');
  };

  const closeChat = () => {
    isOpen = false;
    chatWindow.style.opacity = '0';
    chatWindow.style.transform = 'scale(0.92) translateY(12px)';
    setTimeout(() => { chatWindow.style.display = 'none'; }, 250);
    iconEl.innerHTML = logoUrl
      ? `<img src="${logoUrl}" alt="" style="width:34px;height:34px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.5);" />`
      : chatSVG;
    bubble.setAttribute('aria-label', 'Open chat');
    iframe.contentWindow.postMessage('chat-closed', '*');
  };

  toast.onclick = () => {
    toast.style.transform = 'translateX(400px)';
    setTimeout(() => { toast.style.display = 'none'; }, 300);
    openChat();
  };

  bubble.onmouseenter = () => { bubble.style.transform = 'scale(1.08)'; };
  bubble.onmouseleave = () => { bubble.style.transform = 'scale(1)'; };
  bubble.onclick = () => { isOpen ? closeChat() : openChat(); };

  window.addEventListener('message', (e) => {
    if (e.data === 'close-chat') { closeChat(); return; }
    if (e.data?.type === 'unread-count') {
      unreadCount = e.data.count;
      if (unreadCount > 0 && !isOpen) {
        badge.innerText = unreadCount > 9 ? '9+' : unreadCount;
        badge.style.display = 'flex';
      }
    }
    if (e.data?.type === 'new-message' && !isOpen) {
      showToast(e.data.businessName, e.data.content);
    }
  });

  chatWindow.appendChild(iframe);
  bubble.appendChild(badge);
  bubble.appendChild(iconEl);
  container.appendChild(chatWindow);
  container.appendChild(bubble);
  document.body.append(container, toast);

  fetch(`${serverUrl}/api/chat/config/${apiKey}`)
    .then((r) => {
      if (!r.ok) throw new Error(`Config fetch failed: ${r.status}`);
      return r.json();
    })
    .then((data) => {
      themeColor = data?.appearance?.themeColor || '#6366f1';
      logoUrl = data?.appearance?.companyLogo || null;
      bubble.style.backgroundColor = themeColor;
      bubble.style.boxShadow = `0 8px 24px ${themeColor}55`;
      if (logoUrl) {
        iconEl.innerHTML = `<img src="${logoUrl}" alt="" style="width:34px;height:34px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.5);" />`;
      }
    })
    .catch((err) => console.error('SupportBotAI: Failed to load widget config:', err.message));
})();