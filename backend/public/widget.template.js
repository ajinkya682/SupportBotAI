(function() {
  const script = document.currentScript;
  const apiKey = script.getAttribute('data-api-key');
  const clientUrl = script.getAttribute('data-client-url') || 'https://supportbotai.vercel.app';
  const serverUrl = script.src.includes('/public/') ? script.src.split('/public/')[0] : script.getAttribute('data-server-url') || 'http://localhost:3000';

  if (!apiKey) {
    console.error('SupportBotAI: Missing data-api-key attribute');
    return;
  }

  // ── FETCH CONFIG ──
  let businessConfig = null;
  fetch(`${serverUrl}/api/chat/config/${apiKey}`)
    .then(r => r.json())
    .then(data => {
      businessConfig = data;
      initWidget();
    })
    .catch(err => {
      console.warn('SupportBotAI: Using default config due to fetch error');
      initWidget();
    });

  function initWidget() {
    const themeColor = businessConfig?.appearance?.themeColor || '#7c3aed';
    const logoUrl = businessConfig?.appearance?.companyLogo;
    const botName = businessConfig?.appearance?.botName || businessConfig?.name || 'SupportBotAI';

    // ── STYLES ──
    const style = document.createElement('style');
    style.textContent = `
      #supportbot-bubble {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: ${themeColor};
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15), 0 0 0 4px ${themeColor}33;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999998;
        border: 2px solid white;
        transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s ease;
        opacity: 0;
        transform: translateY(100px);
        user-select: none;
      }
      #supportbot-bubble.entrance {
        opacity: 1;
        transform: translateY(0);
        transition: opacity 0.5s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        animation: sbFloat 3s ease-in-out infinite;
      }
      @keyframes sbFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
      }
      #supportbot-bubble:hover {
        transform: scale(1.08);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2), 0 0 0 6px ${themeColor}44;
        animation-play-state: paused;
      }
      #supportbot-bubble:active {
        transform: scale(0.92);
      }
      #supportbot-bubble img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
      }
      #supportbot-bubble svg {
        width: 28px;
        height: 28px;
        fill: white;
      }
      
      /* Pulse Ring */
      #supportbot-bubble::after {
        content: '';
        position: absolute;
        inset: -2px;
        border-radius: 50%;
        border: 2px solid ${themeColor}66;
        animation: sbPulse 3s infinite;
        z-index: -1;
      }
      @keyframes sbPulse {
        0% { transform: scale(1); opacity: 0.6; }
        70% { transform: scale(1.5); opacity: 0; }
        100% { transform: scale(1); opacity: 0; }
      }

      /* Unread Badge */
      #supportbot-badge {
        position: absolute;
        top: -2px;
        right: -2px;
        background: #ef4444;
        color: white;
        font-size: 11px;
        font-weight: 800;
        padding: 2px 6px;
        border-radius: 10px;
        border: 2px solid white;
        display: none;
        animation: sbPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      @keyframes sbPop { from { transform: scale(0); } to { transform: scale(1); } }

      /* Tooltip */
      #supportbot-tooltip {
        position: absolute;
        right: 75px;
        background: #1f2937;
        color: white;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease, transform 0.3s ease;
        transform: translateX(10px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      #supportbot-tooltip::after {
        content: '';
        position: absolute;
        right: -5px;
        top: 50%;
        transform: translateY(-50%);
        border-left: 6px solid #1f2937;
        border-top: 5px solid transparent;
        border-bottom: 5px solid transparent;
      }
      #supportbot-bubble:hover #supportbot-tooltip {
        opacity: 1;
        transform: translateX(0);
        transition-delay: 1s;
      }

      /* Container */
      #supportbot-container {
        position: fixed;
        bottom: 100px;
        right: 24px;
        width: 380px;
        height: 600px;
        max-height: calc(100vh - 120px);
        max-width: calc(100vw - 48px);
        background: white;
        border-radius: 24px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        z-index: 999999;
        overflow: hidden;
        display: none;
        opacity: 0;
        transform: translateY(20px) scale(0.95);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid rgba(255,255,255,0.3);
        transform-origin: bottom right;
      }
      #supportbot-container.visible {
        display: block;
        opacity: 1;
        transform: translateY(0) scale(1);
        animation: sbBounceIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      @keyframes sbBounceIn {
        from { opacity: 0; transform: translateY(20px) scale(0.8); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      #supportbot-iframe {
        width: 100%;
        height: 100%;
        border: none;
      }

      @media (max-width: 480px) {
        #supportbot-bubble { width: 56px; height: 56px; }
        #supportbot-container {
          width: 100vw; height: 100vh;
          bottom: 0; right: 0;
          border-radius: 0;
          max-height: 100vh; max-width: 100vw;
          transform: translateY(100%);
        }
        #supportbot-container.visible {
          transform: translateY(0);
          animation: sbSlideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
        }
        @keyframes sbSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        #supportbot-bubble.hidden { opacity: 0; pointer-events: none; }
        #supportbot-tooltip { display: none; }
      }
    `;
    document.head.appendChild(style);

    // ── ELEMENTS ──
    const bubble = document.createElement('div');
    bubble.id = 'supportbot-bubble';
    
    if (logoUrl) {
      bubble.innerHTML = `<img src="${logoUrl}" alt="${botName}">`;
    } else {
      bubble.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.1 21.9l4.899-1.239C8.47 21.513 10.179 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.477 0-2.854-.396-4.042-1.085l-2.894.732.733-2.893A7.953 7.953 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>';
    }

    const badge = document.createElement('div');
    badge.id = 'supportbot-badge';
    bubble.appendChild(badge);

    const tooltip = document.createElement('div');
    tooltip.id = 'supportbot-tooltip';
    tooltip.textContent = `Chat with ${botName}`;
    bubble.appendChild(tooltip);

    document.body.appendChild(bubble);

    const container = document.createElement('div');
    container.id = 'supportbot-container';
    const iframe = document.createElement('iframe');
    iframe.id = 'supportbot-iframe';
    iframe.src = `${clientUrl}/chat-widget/${apiKey}`;
    container.appendChild(iframe);
    document.body.appendChild(container);

    // ── ENTRANCE ──
    setTimeout(() => {
      bubble.classList.add('entrance');
    }, 1500);

    // ── LOGIC ──
    let isOpen = false;
    let unreadCount = 0;

    const toggleChat = () => {
      isOpen = !isOpen;
      if (isOpen) {
        container.style.display = 'block';
        setTimeout(() => {
          container.classList.add('visible');
          bubble.classList.add('hidden');
          iframe.contentWindow.postMessage('chat-opened', '*');
        }, 10);
        unreadCount = 0;
        badge.style.display = 'none';
      } else {
        container.classList.remove('visible');
        setTimeout(() => {
          container.style.display = 'none';
          bubble.classList.remove('hidden');
          iframe.contentWindow.postMessage('chat-closed', '*');
        }, 300);
      }
    };

    bubble.addEventListener('click', toggleChat);

    // Listen for messages from iframe
    window.addEventListener('message', (event) => {
      if (event.data === 'close-supportbot') {
        toggleChat();
      } else if (event.data && event.data.type === 'unread-count') {
        if (!isOpen) {
          unreadCount = event.data.count;
          badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
          badge.style.display = 'block';
        }
      }
    });
  }
})();
