// ==UserScript==
// @name         BTE Auto-Fill
// @namespace    http://tampermonkey.net/
// @version      25062301
// @description  BTE 신청 양식 자동 입력
// @author       garan-dable
// @match        https://docs.google.com/forms/*/1FAIpQLSeiuBIjugenzLuUlqxb5Lqneu7w_Pmw8z8bGWGp0GY2wYHWPA/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const item = {
    userName: '문가란',
    team: '개발팀',
    itemType: '전자책',
    paymentType: '카드 결제',
  };

  const items = [
    {
      ...item,
      itemName: '기록학자가 가르쳐주는 책 요약의 기술',
      itemHost: '아이캔유니버스',
      link: 'https://ican.co.kr/shop_view/?idx=89',
      purpose: '독서법 개선을 통한 학습 및 활용 능력 강화',
      paymentAmount: 28000,
    },
  ];

  const findInput = (label) => {
    return document.querySelector(`input[aria-labelledby="${label}"]`);
  };

  const findTextarea = (label) => {
    return document.querySelector(`textarea[aria-labelledby="${label}"]`);
  };

  const radioGroups = [...document.querySelectorAll('div[role="radiogroup"]')];
  const findRadioGroup = (title) => {
    for (const group of radioGroups) {
      const el = group
        .closest('div[role="listitem"]')
        ?.querySelector('div[role="heading"] span');
      if (!el?.innerText.trim().includes(title)) continue;
      return group;
    }
  };

  const fillCheckbox = (el) => {
    if (el.getAttribute('aria-checked') === 'false') {
      el.click();
    }
  };

  const fillInput = (el, value) => {
    if (el) {
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  const fillRadio = (group, option) => {
    if (!group) return;
    const el = [...group.querySelectorAll('div[role="radio"]')].find((el) =>
      el.getAttribute('aria-label')?.trim().includes(option)
    );
    el?.click();
  };

  const EMAIL_CHECKBOX = document.getElementById('i5');
  const USER_NAME_INPUT = findInput('i8 i11');
  const TEAM_RADIO = findRadioGroup('소속 / Team');
  const ITEM_TYPE_RADIO = findRadioGroup('BTE 교육 신청 항목');
  const ITEM_HOST_INPUT = findInput('i71 i74');
  const ITEM_NAME_INPUT = findInput('i76 i79');
  const LINK_TEXTAREA = findTextarea('i81 i84');
  const PURPOSE_TEXTAREA = findTextarea('i86 i89');
  const PAYMENT_TYPE_RADIO = findRadioGroup('결제 방식');
  const PAYMENT_AMOUNT_INPUT = findInput('i105 i108');

  function autofill() {
    items.forEach((item) => {
      const {
        userName,
        team,
        itemType,
        itemHost,
        itemName,
        link,
        purpose,
        paymentType,
        paymentAmount,
      } = item;
      fillCheckbox(EMAIL_CHECKBOX);
      fillInput(USER_NAME_INPUT, userName);
      fillRadio(TEAM_RADIO, team);
      fillRadio(ITEM_TYPE_RADIO, itemType);
      fillInput(ITEM_HOST_INPUT, itemHost);
      fillInput(ITEM_NAME_INPUT, itemName);
      fillInput(LINK_TEXTAREA, link);
      fillInput(PURPOSE_TEXTAREA, purpose);
      fillRadio(PAYMENT_TYPE_RADIO, paymentType);
      fillInput(PAYMENT_AMOUNT_INPUT, paymentAmount);
    });
  }

  const btn = document.createElement('button');
  btn.innerText = 'BTE AUTO_FIIL 🪄';
  btn.style.position = 'fixed';
  btn.style.top = '20px';
  btn.style.left = '20px';
  btn.style.zIndex = 9999;
  btn.style.padding = '1px 8px 2px 8px';
  btn.style.fontSize = '12px';
  btn.style.fontWeight = 'bold';
  btn.style.color = '#000';
  btn.style.background = '#fff';
  btn.style.border = '2px solid #000';
  btn.style.cursor = 'pointer';
  btn.onclick = autofill;

  btn.onmouseover = () => {
    btn.style.fontStyle = 'italic';
    btn.style.textDecoration = 'underline';
  };

  btn.onmouseout = () => {
    btn.style.fontStyle = 'normal';
    btn.style.textDecoration = 'none';
  };

  document.body.appendChild(btn);
})();
