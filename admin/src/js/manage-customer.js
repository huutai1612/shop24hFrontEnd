$(document).ready(() => {
  const G_BASE_URL = `http://localhost:8080/api`;

  // khai bao table
  const G_CUSTOMER_ID_COLUMN = 0;
  const G_LIST_ORDER_COLUMN = 9;
  const G_ACTION_COLUMN = 10;
  const G_PASSWORD_COLUMN = 11;
  let gCustomerTable = $('#table-customer').DataTable({
    order: [],
    columns: [
      { data: 'id' },
      { data: 'firstName' },
      { data: 'lastName' },
      { data: 'phoneNumber' },
      { data: 'address' },
      { data: 'state' },
      { data: 'city' },
      { data: 'country' },
      { data: 'postalCode' },
      { data: 'id' },
      { data: 'Action' },
      { data: 'id' },
    ],
    columnDefs: [
      {
        targets: G_CUSTOMER_ID_COLUMN,
        render: (pCustomerId) => `<p>FSCSID ${pCustomerId} </p>`,
      },
      {
        targets: G_LIST_ORDER_COLUMN,
        render: (pCustomerId) =>
          `<a href="manage-order.html?customerId=${pCustomerId}">Danh sách đơn hàng</a>`,
      },
      {
        targets: G_ACTION_COLUMN,
        defaultContent: `<i class="text-primary fas fa-user-edit" data-toggle="tooltip" data-placement="top" title="Edit user"></i> 
        | <i class="fas text-danger fa-user-minus data-toggle="tooltip" data-placement="top" title="Delete User""></i> 
        | <i class="text-info fas fa-user-cog" data-toggle="tooltip" data-placement="top" title="Edit Role"></i>`,
      },
      {
        targets: G_PASSWORD_COLUMN,
        render: (pCustomerId) =>
          `<button class="btn btn-info btn-change-password" data-id="${pCustomerId}">Đổi mật khẩu</button>`,
      },
    ],
  });
  let gCustomerId = 0;
  let gUserToken = getCookie('user');

  //add event listener
  $('#btn-create-customer').click(onCreateNewCustomerClick);
  $('#table-customer').on('click', '.fa-user-edit', onUpdateCustomerClick);
  $('#table-customer').on('click', '.fa-user-minus', onDeleteCustomerClick);
  $('#table-customer').on('click', '.fa-user-cog', onChangeRoleUserClick);
  $('#table-customer').on(
    'click',
    '.btn-change-password',
    onChangePasswordUserClick
  );
  $('#btn-save-customer').click(onSaveCustomerClick);
  $(document).on('click', '.btn-log-out', onLogoutClick);
  $('#select-customer').change(onSelectRoleChange);
  $('#btn-confirm-delete').click(onConfirmDeleteUserClick);
  $('#btn-register').click(onRegisterCustomerClick);
  $('#btn-create-staff').click(onCreateNewStaffClick);
  $('#btn-confirm-change-role').click(onConfirmChangeRoleClick);
  $('#btn-save-password').click(onSaveNewPassWordClick);

  getDataForSelect();

  // on save password click
  function onSaveNewPassWordClick() {
    let vNewPassword = {
      password: $('#inp-new-password').val().trim(),
    };
    if (vNewPassword.password == '') {
      $('#modal-error').modal('show');
      $('#error').text(`Cần nhập mật khẩu để thay đổi`);
    } else {
      $.ajax({
        url: `${G_BASE_URL}/admin/change-password/customers/${gCustomerId}`,
        method: `put`,
        data: JSON.stringify(vNewPassword),
        headers: {
          Authorization: `Token ${gUserToken}`,
        },
        contentType: `application/json; charset=utf-8`,
        success: (res) => {
          $('#modal-success').modal('show');
          $('#success').text(`Đã thay đổi password cho user thành công`);
          getCustomerData(3);
          $('#inp-new-password').val('');
          $('#modal-update-password').modal('hide');
        },
        error: (e) => {
          $('#modal-error').modal('show');
          $('#error').text(`Bạn không có quyền thực hiện thao tác này`);
        },
      });
    }
  }

  // on change password user click
  function onChangePasswordUserClick() {
    gCustomerId = $(this).data('id');
    $('#modal-update-password').modal('show');
  }

  // on confirm change role click
  function onConfirmChangeRoleClick() {
    let vRoleId = $('#select-change-role').val();
    if (vRoleId == 0) {
      $('#modal-error').modal('show');
      $('#error').text(`Chọn quyền để thay đổi cho user`);
    } else {
      $.ajax({
        url: `${G_BASE_URL}/roles/${vRoleId}/customers-set-role/${gCustomerId}`,
        method: `PUT`,
        headers: { Authorization: `Token ${gUserToken}` },
        contentType: 'application/json; charset=utf-8',
        dataType: `json`,
        success: (res) => {
          $('#modal-change-role').modal('hide');
          $('#select-change-role').val(0);
          $('#modal-success').modal('show');
          $('#success').text('Bạn đã thay đổi thành công quyền của user');
          getCustomerData(vRoleId);
        },
        error: (e) => {
          $('#modal-error').modal('show');
          $('#error').text(`Bạn không có quyền thực hiện thao tác này`);
        },
      });
    }
  }

  // on change role user click
  function onChangeRoleUserClick() {
    $('#modal-change-role').modal('show');
    let vSelectedRow = $(this).parents('tr');
    let vSelectedData = gCustomerTable.row(vSelectedRow).data();
    gCustomerId = vSelectedData.id;
  }

  // on confirm delete user click
  function onConfirmDeleteUserClick() {
    $.ajax({
      url: `${G_BASE_URL}/customers/${gCustomerId}`,
      headers: { Authorization: `Token ${gUserToken}` },
      method: `DELETE`,
      success: () => {
        $('#modal-confirm-delete').modal('hide');
        $('#modal-success').modal('show');
        $('#success').text(`Đã xóa thành công user`);
        getCustomerData(3);
      },
      error: (e) => {
        $('#modal-error').modal('show');
        $('#error').text(`Bạn không có quyền thực hiện thao tác này`);
      },
    });
  }

  // on delete customer click
  function onDeleteCustomerClick() {
    $('#modal-confirm-delete').modal('show');
    let vSelectedRow = $(this).parents('tr');
    let vSelectedData = gCustomerTable.row(vSelectedRow).data();
    gCustomerId = vSelectedData.id;
  }

  // select role change
  function onSelectRoleChange(e) {
    let vRoleId = e.target.value;
    if (vRoleId == 0) {
      gCustomerTable.clear();
    }
    getCustomerData(vRoleId);
  }

  // click to show register
  function onCreateNewStaffClick() {
    $('#modal-register-staff').modal('show');
  }

  // click to register
  function onRegisterCustomerClick() {
    let vNewStaff = {
      firstName: $('#f-name').val().trim(),
      lastName: $('#l-name').val().trim(),
      phoneNumber: $('#username').val().trim(),
      password: $('#pass').val().trim(),
    };
    let vRepeatPas = $('#con-pass').val().trim();
    if (validateNewStaff(vNewStaff, vRepeatPas)) {
      $.ajax({
        url: `${G_BASE_URL}/register/manager`,
        method: `POST`,
        data: JSON.stringify(vNewStaff),
        contentType: `application/json; charset=utf-8`,
        success: (res) => {
          $('#modal-register-staff').modal('hide');
          $('#modal-success').modal('show');
          $('#success').text(
            `Bạn đã thành công tạo mới nhân viên ${res.firstName} ${res.lastName}`
          );
          getCustomerData(2);
        },
        error: (e) => {
          $('#modal-error').modal('show');
          $('#error').text(e.responseText);
        },
      });
    }
  }

  // validate
  function validateNewStaff(pNewCustomer, pPassRepeat) {
    let vResult = true;
    try {
      if (pNewCustomer.firstName == '') {
        vResult = false;
        throw '100. Không được để trống họ';
      }
      if (pNewCustomer.lastName == '') {
        vResult = false;
        throw '101. Không được để trống tên';
      }
      if (pNewCustomer.phoneNumber == '') {
        vResult = false;
        throw '102. Không được để trống tên đăng nhập';
      }
      if (pNewCustomer.password == '') {
        vResult = false;
        throw '104. Mật khẩu không được để trống';
      }
      if (pNewCustomer.password !== pPassRepeat) {
        vResult = false;
        throw '105. Mật khẩu không trùng nhau';
      }
    } catch (error) {
      $('#modal-error').modal('show');
      $('#error').text(error);
    }
    return vResult;
  }

  // get data for select user
  function getDataForSelect() {
    $.ajax({
      url: `${G_BASE_URL}/roles`,
      method: `get`,
      success: renderSelectData,
      error: (e) => {
        $('#modal-error').modal('show');
        $('#error').text(e.responseText);
      },
    });
  }

  // render select data
  function renderSelectData(pResponse) {
    let vSelectRoleElement = $('.select-customer');
    pResponse.forEach((role) => {
      $('<option>', {
        text: role.roleName,
        value: role.id,
      }).appendTo(vSelectRoleElement);
    });
  }

  // save customer
  function onSaveCustomerClick() {
    let vNewCustomer = {
      lastName: $('#inp-last-name').val().trim(),
      firstName: $('#inp-first-name').val().trim(),
      phoneNumber: $('#inp-phone').val().trim(),
      address: $('#inp-address').val().trim(),
      city: $('#inp-city').val().trim(),
      state: $('#inp-state').val().trim(),
      postalCode: $('#inp-postal-code').val().trim(),
      country: $('#inp-country').val().trim(),
    };
    if (validateCustomer(vNewCustomer)) {
      if (gCustomerId == 0) {
        createNewCustomer(vNewCustomer);
      } else {
        updateCustomer(vNewCustomer);
      }
    }
  }

  // create customer
  function createNewCustomer(paramCustomer) {
    $.ajax({
      url: `${G_BASE_URL}/customers`,
      method: 'POST',
      data: JSON.stringify(paramCustomer),
      contentType: 'application/json; charset=utf-8 ',
      success: () => {
        $('#modal-success').modal('show');
        $('#success').text('Đã tạo khách hàng mới thành công');
        getCustomerData(3);
        $('#modal-update-customer').modal('hide');
      },
      error: (e) => {
        $('#modal-error').modal('show');
        $('#error').text(e.responseText);
      },
    });
  }

  // update customer
  function updateCustomer(paramCustomer) {
    $.ajax({
      url: `${G_BASE_URL}/customers/${gCustomerId}`,
      method: 'PUT',
      headers: { Authorization: `Token ${gUserToken}` },
      data: JSON.stringify(paramCustomer),
      contentType: 'application/json; charset=utf-8 ',
      success: () => {
        $('#modal-success').modal('show');
        $('#success').text('Đã cập nhật thông tin khách hàng thành công');
        getCustomerData(3);
        $('#modal-update-customer').modal('hide');
      },
      error: (e) => {
        $('#modal-error').modal('show');
        $('#error').text(e.responseText);
      },
    });
  }

  // validate customer
  function validateCustomer(paramCustomer) {
    let vResult = true;
    try {
      if (paramCustomer.firstName == '') {
        vResult = false;
        throw '100. Họ không được để trống';
      }
      if (paramCustomer.lastName == '') {
        vResult = false;
        throw '101. Tên không được để trống';
      }
      if (gCustomerId == 0) {
        if (paramCustomer.phoneNumber.length < 10) {
          vResult = false;
          throw '103. Số điện thoại không đúng định dạng 10 số hoặc trống';
        }
      }
      if (paramCustomer.address == '') {
        vResult = false;
        throw '104. Địa chỉ không được để trống';
      }
      if (paramCustomer.city == '') {
        vResult = false;
        throw '105. Thành phố không được để trống';
      }
      if (paramCustomer.state == '') {
        vResult = false;
        throw '106. Tỉnh không được để trống';
      }
    } catch (error) {
      $('#modal-error').modal('show');
      $('#error').text(error);
    }
    return vResult;
  }

  // create customer
  function onCreateNewCustomerClick() {
    gCustomerId = 0;
    $('#modal-update-customer').modal('show');
    resetInput();
  }

  // update Customer
  function onUpdateCustomerClick() {
    let vSelectedRow = $(this).parents('tr');
    let vSelectedData = gCustomerTable.row(vSelectedRow).data();
    gCustomerId = vSelectedData.id;
    $('#modal-update-customer').modal('show');
    $.get(`${G_BASE_URL}/customers/${gCustomerId}`, loadCustomerToInput);
  }

  // load customer to input
  function loadCustomerToInput(paramCustomer) {
    $('#inp-first-name').val(paramCustomer.firstName);
    $('#inp-last-name').val(paramCustomer.lastName);
    $('#inp-phone').val(paramCustomer.phoneNumber);
    $('#inp-address').val(paramCustomer.address);
    $('#inp-state').val(paramCustomer.state);
    $('#inp-city').val(paramCustomer.city);
    $('#inp-country').val(paramCustomer.country);
    $('#inp-postal-code').val(paramCustomer.postalCode);
    $('#inp-sale-rep').val(paramCustomer.salesRepEmployeeNumber);
    $('#inp-credit').val(paramCustomer.creditLimit);
  }

  // reset input
  function resetInput() {
    $('#inp-first-name').val('');
    $('#inp-last-name').val('');
    $('#inp-phone').val('');
    $('#inp-address').val('');
    $('#inp-state').val('');
    $('#inp-city').val('');
    $('#inp-country').val('');
    $('#inp-postal-code').val('');
    $('#inp-sale-rep').val('');
    $('#inp-credit').val('');
  }

  // get data for table
  function getCustomerData(pRoleId) {
    $.ajax({
      url: `${G_BASE_URL}/customers/roles/${pRoleId}`,
      method: 'GET',
      dataType: 'json',
      success: renderCustomerTable,
      error: (e) => {
        $('#modal-error').modal('show');
        $('#error').text(e.responseText);
      },
    });
  }

  // render table
  function renderCustomerTable(paramCustomer) {
    gCustomerTable.clear();
    gCustomerTable.rows.add(paramCustomer);
    gCustomerTable.draw();
  }

  // log out

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
