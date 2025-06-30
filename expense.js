// ==UserScript==
// @name         BTE Auto-Fill
// @namespace    http://tampermonkey.net/
// @version      25062301
// @description  BTE 신청 양식 자동 입력
// @author       garan-dable
// @match        https://exp.yanolja.in/main.do?p=1
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const items = [
    {
      itemName: '실리콘밸리에서 통하는 파이썬 인터뷰 가이드',
      amount: 17010,
      categoryCode: '61419020',
    },
    {
      itemName: '요즘 우아한 AI 개발',
      amount: 17280,
      categoryCode: '61419020',
    },
    {
      itemName: '주니어 백엔드 개발자가 반드시 알아야 할 실무 지식',
      amount: 20160,
      categoryCode: '61419020',
    },
    {
      itemName: 'Clean Code',
      amount: 23760,
      categoryCode: '61419020',
    },
    {
      itemName: '디지털 제텔카스텐',
      amount: 6300,
      categoryCode: '61419020',
    },
    {
      itemName: '개발자를 위한 글쓰기 가이드',
      amount: 11520,
      categoryCode: '61419020',
    },
    {
      itemName: '작게 나누어 생각하기',
      amount: 14580,
      categoryCode: '61419020',
    },
    {
      itemName: '생각에 관한 생각',
      amount: 17100,
      categoryCode: '61419020',
    },
    {
      itemName: '50개의 프로젝트로 완성하는 파이썬 업무 자동화',
      amount: 19800,
      categoryCode: '61419020',
    },
    {
      itemName: '진짜 챗GPT API 활용법',
      amount: 20160,
      categoryCode: '61419020',
    },
    {
      itemName: '게임으로 배우는 파이썬',
      amount: 9900,
      categoryCode: '61419020',
    },
    {
      itemName: '파이썬으로 배우는 게임 개발: 실전편',
      amount: 18900,
      categoryCode: '61419020',
    },
    {
      itemName: 'TS/JS 디자인 패턴 with Canvas',
      amount: 44550,
      categoryCode: '61419010',
    },
    {
      itemName: 'The Complete Agentic AI Engineering Course (2025)',
      amount: 15000,
      categoryCode: '61419010',
    },
    {
      itemName: '기록학자가 가르쳐주는 책 요약의 기술',
      amount: 28000,
      categoryCode: '61419010',
    },
  ];

  const fillInput = (el, value) => {
    if (el) {
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  const findElement = (selectorFn) => {
    const contexts = [window, ...Array.from(window.frames)];
    for (const ctx of contexts) {
      const el = selectorFn(ctx.document);
      if (el) return el;
    }
  };

  const TOTAL_AMOUNT_INPUT = (doc) => doc.getElementById('TOT_AMOUNT');
  const ITEM_NAME_INPUT = (doc) =>
    doc.querySelector('input[name="arrSummary"]');
  // const CATEGORY_NAME_INPUT = (doc) =>
  //   doc.querySelector('input[name="arrGName"]');
  // const CATEGORY_CODE_INPUT = (doc) =>
  //   doc.querySelector('input[name="arrGLCode"]');

  function autofill() {
    const amoutEl = findElement(TOTAL_AMOUNT_INPUT);
    const amount = parseInt(amoutEl?.value.replace(/,/g, ''), 10);
    const item = items.find((item) => item.amount === amount);
    if (item) {
      const itemNameEl = findElement(ITEM_NAME_INPUT);
      itemNameEl.value = item.itemName;
    }
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
