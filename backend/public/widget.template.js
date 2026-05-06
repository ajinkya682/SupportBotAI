(function() {
  // ── CONFIGURATION ──
  const script = document.currentScript;
  const apiKey = script.getAttribute('data-api-key');
  const clientUrl = script.getAttribute('data-client-url') || 'https://supportbotai.vercel.app';
  const serverUrl = '__SERVER_BASE_URL__';

  if (!apiKey) {
    console.error('SupportBotAI: Missing data-api-key attribute');
    return;
  }

  // ── STYLES ──
  const style = document.createElement('style');
  style.textContent = `
    #supportbot-bubble {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      border-radius: 30px;
      background: #6366f1;
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 999998;
      animation: sbFloat 3s ease-in-out infinite;
    }
    @keyframes sbFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
    #supportbot-bubble:hover {
      transform: scale(1.1) translateY(-4px);
      box-shadow: 0 12px 32px rgba(99, 102, 241, 0.5);
    }
    #supportbot-bubble svg {
      width: 28px;
      height: 28px;
      fill: white;
    }
    #supportbot-container {
      position: fixed;
      bottom: 100px;
      right: 24px;
      width: 400px;
      height: 600px;
      max-height: calc(100vh - 120px);
      max-width: calc(100vw - 48px);
      background: white;
      border-radius: 20px;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
      z-index: 999999;
      overflow: hidden;
      display: none;
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(0,0,0,0.05);
    }
    #supportbot-container.visible {
      display: block;
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    #supportbot-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    @media (max-width: 480px) {
      #supportbot-container {
        width: 100vw;
        height: 100vh;
        bottom: 0;
        right: 0;
        border-radius: 0;
        max-height: 100vh;
        max-width: 100vw;
      }
      #supportbot-container.visible {
        display: block;
      }
      #supportbot-bubble.hidden {
        display: none;
      }
    }
  `;
  document.head.appendChild(style);

  // ── ELEMENTS ──
  const bubble = document.createElement('div');
  bubble.id = 'supportbot-bubble';
  bubble.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.1 21.9l4.899-1.239C8.47 21.513 10.179 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.477 0-2.854-.396-4.042-1.085l-2.894.732.733-2.893A7.953 7.953 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>';
  document.body.appendChild(bubble);

  const container = document.createElement('div');
  container.id = 'supportbot-container';
  const iframe = document.createElement('iframe');
  iframe.id = 'supportbot-iframe';
  iframe.src = `${clientUrl}/chat-widget/${apiKey}`;
  container.appendChild(iframe);
  document.body.appendChild(container);

  // ── LOGIC ──
  let isOpen = false;

  async function applyBranding() {
    try {
      const res = await fetch(`${serverUrl}/api/chat/config/${apiKey}`);
      const data = await res.json();
      if (data && data.appearance) {
        const theme = data.appearance.themeColor || '#6366f1';
        bubble.style.background = theme;
        bubble.style.boxShadow = `0 8px 24px ${theme}66`;
        
        const avatar = data.appearance.botAvatar || data.appearance.companyLogo;
        if (avatar) {
          bubble.innerHTML = `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;border:2px solid #fff;box-shadow:inset 0 0 10px rgba(0,0,0,0.1);" />`;
        }
      }
    } catch (e) {
      console.error('SupportBotAI: Failed to load branding', e);
    }
  }

  applyBranding();

  bubble.addEventListener('click', () => {
    isOpen = !isOpen;
    if (isOpen) {
      container.classList.add('visible');
      if (window.innerWidth <= 480) bubble.classList.add('hidden');
    } else {
      container.classList.remove('visible');
    }
  });

  // Listen for close message from iframe
  window.addEventListener('message', (event) => {
    const data = event.data;
    const isCloseAction = data === 'close-chat' || 
                         data === 'close-supportbot' || 
                         (data && typeof data === 'object' && (data.type === 'close-chat' || data.type === 'close-supportbot'));
    
    if (isCloseAction) {
      isOpen = false;
      container.classList.remove('visible');
      bubble.classList.remove('hidden');
      bubble.style.display = 'flex'; // Ensure bubble is visible
    }
  });
})();
