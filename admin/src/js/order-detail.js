$(document).ready(() => {
  let gUrlString = new URL(window.location.href);
  let gOrderId = gUrlString.searchParams.get('orderId');
  const G_COLUMN_NAME = 1;
  const G_COLUMN_CODE = 2;
  const G_COLUMN_IMG = 3;
  const G_BUY_PRICE_COLUMN = 4;
  const G_TOTAL_PRICE_COLUMN = 6;
  const G_BASE_URL = `http://localhost:8080/api`;
  let gToTal = 0;
  let gUserToken = getCookie('user');

  // khai báo table
  let gTableOrderDetail = $('#table-order-detail').DataTable({
    searching: false,
    paging: false,
    bInfo: false,
    columns: [
      { data: 'orderId' },
      { data: 'productId' },
      { data: 'productId' },
      { data: 'productId' },
      { data: 'priceEach' },
      { data: 'quantity' },
      { data: 'total' },
    ],
    columnDefs: [
      {
        targets: G_TOTAL_PRICE_COLUMN,
        render: (pData, pType, pRow) => {
          let vToTalEachDetail = pRow.priceEach * pRow.quantity;
          return `<p class="text-info">${vToTalEachDetail.toLocaleString()} <span class="ml-1 text-dark">VNĐ</span></p>`;
        },
      },
      {
        targets: G_COLUMN_NAME,
        render: (productId) => {
          let vProductData = '';
          $.ajax({
            url: `${G_BASE_URL}/products/${productId}`,
            dataType: 'json',
            method: 'get',
            async: false,
            success: (response) => (vProductData = response),
            error: (e) => alert(e.responseText),
          });
          return getProductName(vProductData);
        },
      },
      {
        targets: G_BUY_PRICE_COLUMN,
        render: (pBuyPrice) => `<p>${pBuyPrice.toLocaleString()} VNĐ </p>`,
      },
      {
        targets: G_COLUMN_CODE,
        render: (productId) => {
          let vProductData = '';
          $.ajax({
            url: `${G_BASE_URL}/products/${productId}`,
            dataType: 'json',
            method: 'get',
            async: false,
            success: (response) => (vProductData = response),
            error: (e) => alert(e.responseText),
          });
          return getProductCode(vProductData);
        },
      },
      {
        targets: G_COLUMN_IMG,
        render: (productId) => {
          let vProductData = '';
          $.ajax({
            url: `${G_BASE_URL}/products/${productId}`,
            dataType: 'json',
            method: 'get',
            async: false,
            success: (response) => (vProductData = response),
            error: (e) => alert(e.responseText),
          });
          return getProductImg(vProductData);
        },
      },
    ],
  });
  getOrderDetail();
  $('#total').text(gToTal.toLocaleString());

  // get order detail
  function getOrderDetail() {
    $.ajax({
      url: `${G_BASE_URL}/orders/${gOrderId}/order-details`,
      method: 'get',
      headers: { Authorization: `Token ${gUserToken}` },
      async: false,
      dataType: 'json',
      success: renderTable,
      error: (e) => alert(e.responseText),
    });
  }

  // rendertable
  function renderTable(paramOrderDetail) {
    // get total
    paramOrderDetail.forEach((orderDetail) => {
      let vToTalEach = orderDetail.priceEach * orderDetail.quantity;
      gToTal += vToTalEach;
    });
    // render
    gTableOrderDetail.clear();
    gTableOrderDetail.rows.add(paramOrderDetail);
    gTableOrderDetail.draw();
  }

  // render product name
  function getProductName(paramProduct) {
    return `<p>${paramProduct.productName}</p>`;
  }

  // render product code
  function getProductCode(paramProduct) {
    return `<p>${paramProduct.productCode}</p>`;
  }

  // render product code
  function getProductImg(paramProduct) {
    return `<img src="${paramProduct.urlImage}" alt="product" width="150" height="200">`;
  }

  // log out
  // add event listener
  $(document).on('click', '.btn-log-out', onLogoutClick);

  // check user cookie
  if (gUserToken) {
    $.ajax({
      url: `${G_BASE_URL}/user-info`,
      method: 'get',
      headers: { Authorization: `Token ${gUserToken}` },
      dataType: 'json',
      success: handleUser,
      error: (e) => console.log(e.responseText),
    });
  } else {
    window.location.href = `../customer/index.html`;
  }

  // log out
  function onLogoutClick() {
    setCookie('user', '', 1);
    window.location.href = `../customer/index.html`;
  }

  function handleUser() {}

  // get Cookie
  function getCookie(cname) {
    var name = cname + '=';
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  }

  // set cookie
  function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
  }
});
