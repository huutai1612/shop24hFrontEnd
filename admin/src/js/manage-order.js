$(document).ready(() => {
  const G_BASE_URL = `http://localhost:8080/api`;

  // khai bao order
  const G_COLUMN_ACTION = 8;
  const G_ORDER_DETAIL_COLUMN = 0;
  let gOrderTable = $('#table-order').DataTable({
    orders: [],
    columns: [
      { data: 'id' },
      { data: 'fullName' },
      { data: 'phoneNumber' },
      { data: 'comments' },
      { data: 'orderDate' },
      { data: 'requiredDate' },
      { data: 'shippedDate' },
      { data: 'status' },
      { data: 'Action' },
    ],
    columnDefs: [
      {
        targets: G_ORDER_DETAIL_COLUMN,
        render: (orderId) =>
          `<a href="order-detail.html?orderId=${orderId}">Detail Order ${orderId}</a>`,
      },
      {
        targets: G_COLUMN_ACTION,
        defaultContent: `<i class="text-primary far fa-edit"></i>`,
      },
    ],
  });

  // get parameter string value
  let gStringUrl = new URL(window.location.href);

  // khai bao bien
  let gOrderId = 0;
  let gCustomerId = 0;
  let gParamStringCustomer = gStringUrl.searchParams.get('customerId');

  getCustomerData();

  if (gParamStringCustomer) {
    getOrderData(`customers/${gParamStringCustomer}/orders`);
  } else {
    getOrderData(`customers/orders`);
  }

  // add even listener
  $('#s-customer').change((e) => (gCustomerId = e.target.value));
  $('#btn-create-order').click(onCreateOrderClick);
  $('#table-order').on('click', '.fa-edit', onUpdateOrderClick);
  $('#btn-save-order').click(onSaveOrderClick);

  // save order
  function onSaveOrderClick() {
    let vNewOrder = {
      orderDate: $('#inp-order-date').val().trim(),
      requiredDate: $('#inp-required-date').val().trim(),
      shippedDate: $('#inp-shipped-date').val().trim(),
      status: $('#inp-status').val(),
      comments: $('#inp-message').val().trim(),
    };
    if (validateOrder(vNewOrder)) {
      if (gOrderId == 0) {
        createNewOrder(vNewOrder);
      } else {
        updateOrderById(vNewOrder);
      }
    }
  }

  // create new order
  function createNewOrder(paramOrder) {
    $.ajax({
      url: `${G_BASE_URL}/customers/${gCustomerId}/orders`,
      method: 'post',
      data: JSON.stringify(paramOrder),
      contentType: 'application/json ; charset=utf-8',
      success: (response) => {
        alert(`Đã tạo mới thành công order ${response.id}`);
        $('#modal-update-order').modal('hide');
        window.location.href = `add-product.html?orderId=${response.id}`;
      },
      error: (e) => alert(e.responseText),
    });
  }

  // update order
  function updateOrderById(paramOrder) {
    $.ajax({
      url: `${G_BASE_URL}/orders/${gOrderId}`,
      method: 'put',
      headers: { Authorization: `Token ${gUserToken}` },
      data: JSON.stringify(paramOrder),
      contentType: 'application/json ; charset=utf-8',
      success: () => {
        alert(`Đã cập nhật thành công order`);
        $('#modal-update-order').modal('hide');
        getOrderData(`customers/orders`);
      },
      error: (e) => alert(`Bạn không có quyền thực hiện thao tác này`),
    });
  }

  // validate order
  function validateOrder(paramOrder) {
    let vResult = true;
    try {
      if (paramOrder.orderDate == '') {
        vResult = false;
        throw '100. Ngày đặt hàng không được để trống';
      }
      if (paramOrder.requiredDate == '') {
        vResult = false;
        throw '101. Ngày nhận hàng không được để trống';
      }
      if (paramOrder.status == '') {
        vResult = false;
        throw '102. Trạng thái đơn hàng không được để trống';
      }
      if (gOrderId == 0) {
        if (gCustomerId == 0) {
          vResult = false;
          throw '200. Chọn khách hàng để lên đơn hàng';
        }
      }
    } catch (error) {
      $('#modal-error').modal('show');
      $('#error').text(error);
    }
    return vResult;
  }

  // create order click
  function onCreateOrderClick() {
    gOrderId = 0;
    $('#modal-update-order').modal('show');
    resetInput();
    $('#s-customer').prop('disabled', false);
  }

  // update order click
  function onUpdateOrderClick() {
    let vSelectedRow = $(this).parents('tr');
    let vSelectedData = gOrderTable.row(vSelectedRow).data();
    gOrderId = vSelectedData.id;
    $('#s-customer').prop('disabled', true);
    $('#modal-update-order').modal('show');
    $.get(`${G_BASE_URL}/orders/${gOrderId}`, loadOrderToInput);
  }

  // load order to input
  function loadOrderToInput(paramOrder) {
    $('#inp-order-date').val(paramOrder.orderDate);
    $('#inp-required-date').val(paramOrder.requiredDate);
    $('#inp-shipped-date').val(paramOrder.shippedDate);
    $('#inp-status').val(paramOrder.status);
    $('#inp-message').val(paramOrder.comments);
  }

  // reset input
  function resetInput() {
    $('#s-customer').val(0);
    $('#inp-order-date').val('');
    $('#inp-required-date').val('');
    $('#inp-shipped-date').val('');
    $('#inp-status').val('');
    $('#inp-message').val('');
  }

  // render order
  function renderOrderToTable(paramOrder) {
    gOrderTable.clear();
    gOrderTable.rows.add(paramOrder);
    gOrderTable.draw();
  }

  // get order
  function getOrderData(pSubUrl) {
    $.ajax({
      url: `${G_BASE_URL}/${pSubUrl}`,
      method: 'GET',
      dataType: 'json',
      success: renderOrderToTable,
      error: (e) => alert(e.responseText),
    });
  }

  // get customer
  function getCustomerData() {
    $.ajax({
      url: `${G_BASE_URL}/customers`,
      method: 'GET',
      dataType: 'json',
      success: renderToSelect,
      error: (e) => alert(e.responseText),
    });
  }

  // render customer to select
  function renderToSelect(paramCustomer) {
    let vSelectElement = $('#s-customer');
    paramCustomer.forEach((customer) => {
      $('<option>', {
        text: `${customer.firstName} ${customer.lastName}`,
        value: customer.id,
      }).appendTo(vSelectElement);
    });
  }

  // log out
  // add event listener
  $(document).on('click', '.btn-log-out', onLogoutClick);

  let gUserToken = getCookie('user');

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
