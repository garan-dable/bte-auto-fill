(function () {
  'use strict';

  let initItem = {
    userName: '',
    team: '',
    itemType: '',
    itemHost: '',
    itemName: '',
    link: '',
    purpose: '',
    paymentType: '',
    paymentAmount: '',
  };

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

  const getRadioValue = (group) => {
    if (!group) return '';
    const selectedRadio = [...group.querySelectorAll('div[role="radio"]')].find(
      (el) => el.getAttribute('aria-checked') === 'true'
    );
    return selectedRadio?.getAttribute('aria-label')?.trim() || '';
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

  const autofill = (item) => {
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
    // const submitButton = document.querySelector('[jsname="M2UYVd"]');
    // if (submitButton) submitButton.click();
  };

  const loadPreviousValues = () => {
    const prevValues = JSON.parse(localStorage.getItem('prevValues'));
    if (!prevValues) return;
    const newValues = { ...initItem, ...prevValues };
    initItem = newValues;
    autofill(newValues);
  };

  const saveCurrentValues = () => {
    const prevValues = {
      userName: USER_NAME_INPUT.value,
      team: getRadioValue(TEAM_RADIO),
      itemType: getRadioValue(ITEM_TYPE_RADIO),
      itemHost: ITEM_HOST_INPUT.value,
      itemName: ITEM_NAME_INPUT.value,
      link: LINK_TEXTAREA.value,
      purpose: PURPOSE_TEXTAREA.value,
      paymentType: getRadioValue(PAYMENT_TYPE_RADIO),
      paymentAmount: PAYMENT_AMOUNT_INPUT.value,
    };
    localStorage.setItem('prevValues', JSON.stringify(prevValues));
    showToast('저장되었습니다. 다음 작성 시 현재 값이 자동으로 입력됩니다.');
  };

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  function getDateRange() {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    return {
      startDate: formatDate(oneMonthAgo),
      endDate: formatDate(today),
    };
  }

  function fetchOrders() {
    return new Promise((resolve, reject) => {
      const { startDate, endDate } = getDateRange();
      const url = `https://order.kyobobook.co.kr/api/comm/ord/v1/order/orderList?mmbrNum=&startDate=${startDate}&endDate=${endDate}&ordrPrgsCdtnCode=&page=1&pageUnit=10&cmdtName=&ordrId=&summarySelectVal=0&includeOrdrDlpnYsno=Y`;
      GM_xmlhttpRequest({
        method: 'GET',
        url: url,
        headers: { 'Content-Type': 'application/json' },
        onload: function (response) {
          try {
            if (response.status >= 200 && response.status < 300) {
              const result = JSON.parse(response.responseText);
              resolve(result.data);
            } else {
              const result = `fetchOrders 실패: ${response.status} ${response.statusText}`;
              console.error(result);
              resolve(undefined);
            }
          } catch (error) {
            const result = `JSON 파싱 실패: ${error.message}`;
            reject(new Error(result));
          }
        },
        onerror: function (error) {
          const result = `네트워크 오류: ${error.message || '알 수 없는 오류'}`;
          reject(new Error(result));
        },
      });
    });
  }

  function fetchOrderItems(orderNumber) {
    return new Promise((resolve, reject) => {
      const url = `https://order.kyobobook.co.kr/api/comm/ord/v1/order/${orderNumber}`;
      GM_xmlhttpRequest({
        method: 'GET',
        url: url,
        headers: { 'Content-Type': 'application/json' },
        onload: function (response) {
          try {
            if (response.status >= 200 && response.status < 300) {
              const data = JSON.parse(response.responseText);
              resolve(data.data.ordrCmdtList || []);
            } else {
              const result = `fetchOrderItems 실패: ${response.status} ${response.statusText}`;
              reject(new Error(result));
            }
          } catch (error) {
            const result = `JSON 파싱 실패: ${error.message}`;
            reject(new Error(result));
          }
        },
        onerror: function (error) {
          const result = `네트워크 오류: ${error.message || '알 수 없는 오류'}`;
          reject(new Error(result));
        },
      });
    });
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.top = '50%';
    toast.style.left = '50%';
    toast.style.transform = 'translate(-50%, -50%)';
    toast.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    toast.style.color = '#fff';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.fontSize = '14px';
    toast.style.zIndex = 10001;
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease-in-out';
    toast.style.pointerEvents = 'none';
    toast.style.whiteSpace = 'nowrap';
    toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '1';
    }, 10);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 2000);
  }

  function createModal(title, content) {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = 10000;
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#fff';
    modalContent.style.padding = '35px';
    modalContent.style.paddingTop = '30px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.minWidth = '400px';
    modalContent.style.maxWidth = '600px';
    modalContent.style.maxHeight = '80vh';
    modalContent.style.overflow = 'auto';
    modalContent.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    titleEl.style.marginTop = '0';
    titleEl.style.marginBottom = '20px';

    modalContent.appendChild(titleEl);
    modalContent.appendChild(content);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
    return { modal, modalContent };
  }

  function showItemSelectModal(orders) {
    return new Promise((resolve) => {
      const content = document.createElement('div');
      const buttonContainer = document.createElement('div');
      buttonContainer.style.display = 'flex';
      buttonContainer.style.flexDirection = 'column';
      buttonContainer.style.gap = '8px';
      buttonContainer.style.maxHeight = '600px';
      buttonContainer.style.overflowY = 'auto';
      const { modal } = createModal('📖 도서를 선택해주세요.', content);

      orders.forEach((item, index) => {
        const itemButton = document.createElement('button');
        itemButton.textContent = item.itemName;
        itemButton.style.width = '100%';
        itemButton.style.padding = '12px 16px';
        itemButton.style.textAlign = 'left';
        itemButton.style.backgroundColor = '#fff';
        itemButton.style.color = '#000';
        itemButton.style.border = '1px solid #ddd';
        itemButton.style.borderRadius = '10px';
        itemButton.style.cursor = 'pointer';
        itemButton.style.fontSize = '14px';
        itemButton.style.transition = 'all 0.2s';
        itemButton.addEventListener('mouseenter', () => {
          itemButton.style.backgroundColor = '#f0f8ff';
          itemButton.style.borderColor = '#007bff';
        });
        itemButton.addEventListener('mouseleave', () => {
          itemButton.style.backgroundColor = '#fff';
          itemButton.style.borderColor = '#ddd';
        });
        itemButton.addEventListener('click', () => {
          document.body.removeChild(modal);
          resolve(index);
        });
        buttonContainer.appendChild(itemButton);
      });
      content.appendChild(buttonContainer);
    });
  }

  async function selectKyoboOrderItem() {
    const orders = await fetchOrders();
    if (!orders) {
      showToast('교보문고에 로그인하면 최근 한 달간의 주문 목록이 표시됩니다.');
      return;
    }
    if (!orders.length) {
      showToast('최근 한 달간 도서 주문 내역이 없습니다.');
      return;
    }
    const orderIds = orders?.map((order) => order.ordrId).filter((id) => id);
    const orderItemsPromises = (orderIds || []).map((orderId) =>
      fetchOrderItems(orderId)
    );
    const orderItemsResults = await Promise.all(orderItemsPromises);
    const allOrderItems = orderItemsResults.flat().map((item, index) => {
      const isEBook = item.saleCmdtDvsnCode === 'EBK';
      return {
        ...initItem,
        itemHost: '도서',
        itemName: item.cmdtName.replace('[eBook]', '') || `항목 ${index + 1}`,
        itemType: isEBook ? '전자책' : '도서',
        link: `${
          isEBook
            ? 'https://ebook-product.kyobobook.co.kr/dig/epd/ebook/'
            : 'https://product.kyobobook.co.kr/detail/'
        }${item.saleCmdtid}`,
        paymentAmount: item.cmdtLastStlmAmnt,
      };
    });
    const selectedIndex = await showItemSelectModal(allOrderItems);
    if (selectedIndex === null) return;
    const orderItem = allOrderItems[selectedIndex];
    if (!orderItem) {
      showToast('항목을 찾을 수 없습니다.');
      return;
    }
    autofill(orderItem);
  }

  const createBtn = (title, onClick) => {
    const btn = document.createElement('button');
    btn.innerText = title;
    btn.style.zIndex = 9999;
    btn.style.padding = '1px 8px';
    btn.style.fontSize = '12px';
    btn.style.fontWeight = 'bold';
    btn.style.color = '#000';
    btn.style.background = '#fff';
    btn.style.border = '2px solid #000';
    btn.style.cursor = 'pointer';
    btn.onclick = onClick;
    btn.onmouseover = () => {
      btn.style.fontStyle = 'italic';
      btn.style.textDecoration = 'underline';
    };
    btn.onmouseout = () => {
      btn.style.fontStyle = 'normal';
      btn.style.textDecoration = 'none';
    };
    return btn;
  };

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '20px';
  container.style.left = '20px';
  container.style.display = 'flex';
  container.style.flexDirection = 'row';
  container.style.gap = '5px';
  container.style.zIndex = 9999;
  container.appendChild(createBtn('KYOBO AUTO_FIIL 🪄', selectKyoboOrderItem));
  container.appendChild(createBtn('💾', saveCurrentValues));
  loadPreviousValues();

  document.body.appendChild(container);
})();
