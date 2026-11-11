// ==UserScript==
// @name         Discord DM欄を折りたたむ
// @namespace    local.discord.layout
// @version      1.0
// @description  DM一覧を折りたたみ、チャットを広くする
// @match        https://discord.com/*
// @run-at       document-idle
// @noframes
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(() => {
  'use strict';

  let collapsed = GM_getValue('collapsed', true);
  const root = document.documentElement;

  GM_addStyle(`
    html[data-local-dm-folded="true"]
    #app-mount [class^="base_"]:has(nav[class^="privateChannels_"]) {
      grid-template-columns:
        [start] var(--custom-guild-list-width, 72px)
        [guildsEnd] 0px
        [channelsEnd] minmax(0, 1fr) [end] !important;
    }

    html[data-local-dm-folded="true"]
    #app-mount [class^="sidebar_"]:has(nav[class^="privateChannels_"]) {
      width: var(--custom-guild-list-width, 72px) !important;
      min-width: 0 !important;
    }

    html[data-local-dm-folded="true"]
    #app-mount [class^="sidebarList_"]:has(> nav[class^="privateChannels_"]),
    html[data-local-dm-folded="true"]
    #app-mount [class^="sidebar_"]:has(nav[class^="privateChannels_"])
      > [class^="sidebarResizeHandle_"],
    html[data-local-dm-folded="true"]
    #app-mount [class^="sidebar_"]:has(nav[class^="privateChannels_"])
      > section[class^="panels_"] {
      display: none !important;
    }

    #local-discord-dm-toggle {
      position: fixed;
      left: 8px;
      bottom: 76px;
      z-index: 1000;
      width: 56px;
      height: 32px;
      padding: 0;
      border: 1px solid #8b8df8;
      border-radius: 8px;
      background: #313338;
      color: #fff;
      font: 12px sans-serif;
      cursor: pointer;
    }

    html[data-local-dm-folded="true"] #local-discord-dm-toggle {
      bottom: 8px;
    }

    #local-discord-dm-toggle[hidden] {
      display: none !important;
    }
  `);

  const button = document.createElement('button');
  button.id = 'local-discord-dm-toggle';
  button.type = 'button';

  function sync() {
    const isDM =
      /^\/channels\/@me(?:\/|$)/.test(location.pathname) &&
      !!document.querySelector(
        '#app-mount nav[class^="privateChannels_"]'
      );

    root.setAttribute('data-local-dm-folded', String(isDM && collapsed));
    button.hidden = !isDM;

    const label = collapsed ? 'DM表示' : 'DM隠す';
    if (button.textContent !== label) button.textContent = label;
    button.title = collapsed
      ? 'DM一覧とユーザー設定を表示'
      : 'DM一覧とユーザー設定を折りたたむ';
    button.setAttribute('aria-expanded', String(!collapsed));

    if (!button.isConnected) document.body.appendChild(button);
  }

  function toggle() {
    collapsed = !collapsed;
    GM_setValue('collapsed', collapsed);
    sync();
  }

  button.addEventListener('click', toggle);
  GM_registerMenuCommand('DM一覧の表示／非表示', toggle);

  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      sync();
    });
  });

  sync();
  observer.observe(document.body, { childList: true, subtree: true });
})();
