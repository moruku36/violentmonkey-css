// ==UserScript==
// @name         Discord 自分の投稿だけ赤バブル
// @match        https://discord.com/*
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

const ME = 'moruku36';  // 自分の表示名(メッセージ上の名前)

GM_addStyle(`
  li[data-vm-mine="1"] [id^="message-content-"] {
    display: block !important;
    width: fit-content !important;
    max-width: 90% !important;
    background: #ff3b30 !important;   /* 赤み強め */
    color: #ffffff !important;
    padding: 8px 16px !important;
    margin: 4px 0 !important;
    border-radius: 20px !important;
    box-sizing: border-box !important;
  }
  li[data-vm-mine="1"] [id^="message-content-"] a {
    color: #ffffff !important;
    text-decoration: underline;
  }
`);

function mark() {
  let last = '';
  document.querySelectorAll('li[id^="chat-messages-"]').forEach(li => {
    const name = li.querySelector('h3 [class*="username"]');
    if (name) last = name.textContent.trim();   // 連投は直前の投稿者を引き継ぐ
    li.dataset.vmMine = (last === ME) ? '1' : '0';
  });
}

let t;
new MutationObserver(() => {
  cancelAnimationFrame(t);
  t = requestAnimationFrame(mark);
}).observe(document.body, { childList: true, subtree: true });
mark();
