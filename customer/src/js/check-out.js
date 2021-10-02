$(document).ready(() => {
  const G_BASE_URL = `http://localhost:8080/api`;
  let gProduct = JSON.parse(localStorage.getItem('products'));
  let gOrderDetail = JSON.parse(localStorage.getItem('orderDetail'));
  let gTotal = 0;
  let gCustomerId = 0;
  let gOrderId = 0;
  let gUserToken = getCookie('user');

  // get don hang
  function getBill() {
    $('.order-table').html('');
    $('.order-table').append(`<li>Sản phẩm <span>Tổng</span></li>`);
    gProduct.forEach((productId, index) => {
      $.ajax({
        url: `${G_BASE_URL}/products/${productId}`,
        method: 'get',
        dataType: 'json',
        async: false,
        success: (response) => renderBill(response, index),
        error: (e) => {
          $('#error').text(e.responseText);
          $('#modal-error').modal('show');
        },
      });
    });
    $('.order-table').append(
      `<li class="total-price">Phải thanh toán <span>${gTotal.toLocaleString()} VNĐ</span></li>`
    );
  }

  getBill();
  onLoadCartNumber();
  loadProductToCart();

  if (gUserToken) {
    $('.non-active').css('display', 'none');
  }

  // add event listener
  $(document).on('click', '.btn-log-out', onLogoutClick);
  $('#btn-order').click(onCreateOrderClick);

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
  }

  // log out
  function onLogoutClick() {
    setCookie('user', '', 1);
    window.location.href = `index.html`;
  }

  // handle user
  function handleUser(pRes) {
    $('.ht-right').html(`
                  <div class="dropdown login-panel">
                <button class="btn btn-warning dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                Xin chào ${[pRes[0]]}
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                <a href="user-detail.html?userId=${
                  pRes[1]
                }" class="dropdown-item"><i class="fa fa-user"></i>Hồ sơ của tôi
                </a>
                  <button class="btn btn-danger dropdown-item btn-log-out">Log out</button>
                </ul>
              </div>
                <div class="top-social">
                    <a href="https://www.facebook.com"><i class="ti-facebook"></i></a>
                    <a href="https://twitter.com/"><i class="ti-twitter-alt"></i></a>
                    <a href="https://www.linkedin.com/"><i class="ti-linkedin"></i></a>
                    <a href="https://www.pinterest.com/"><i class="ti-pinterest"></i></a>
                </div>`);
  }

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

  // render đơn hàng
  function renderBill(paramProduct, paramIndex) {
    gTotal +=
      gOrderDetail[paramIndex].quantityOrder *
      gOrderDetail[paramIndex].priceEach;
    let vResult = `
		<li class="fw-normal">
			${paramProduct.productName} x ${gOrderDetail[paramIndex].quantityOrder}
			<span>
				${(
          gOrderDetail[paramIndex].quantityOrder *
          gOrderDetail[paramIndex].priceEach
        ).toLocaleString()}
				VNĐ
			</span>
		</li>
		`;
    $('.order-table').append(vResult);
  }

  // place order

  function onCreateOrderClick() {
    let vCustomerInfo = {
      lastName: $('#last').val().trim(),
      firstName: $('#fir').val().trim(),
      phoneNumber: $('#phone').val().trim(),
      address: $('#street').val().trim(),
      city: $('#town').val().trim(),
      state: $('#state').val().trim(),
      postalCode: $('#zip').val().trim(),
      country: $('#cun').val().trim(),
      salesRepEmployeeNumber: $('#sale-rep').val().trim(),
      creditLimit: $('#credit').val().trim(),
    };
    if (gUserToken) {
      $.ajax({
        url: `${G_BASE_URL}/user-info`,
        method: 'get',
        headers: { Authorization: `Token ${gUserToken}` },
        dataType: 'json',
        success: setCustomerIfLogin,
        error: (e) => {
          $('#error').text(e.responseText);
          $('#modal-error').modal('show');
        },
      });
    } else {
      if (validateCustomer(vCustomerInfo)) {
        $.ajax({
          url: `${G_BASE_URL}/customers/phone/${vCustomerInfo.phoneNumber}`,
          method: 'get',
          dataType: 'json',
          success: checkUserExist,
          error: (e) => {
            createUser(vCustomerInfo);
          },
        });
      }
    }
  }

  function setCustomerIfLogin(pResponse) {
    gCustomerId = pResponse[1];
    $('#modal-order').modal('show');
  }

  // check user
  function checkUserExist(paramCustomer) {
    gCustomerId = paramCustomer.id;
    $('#modal-order').modal('show');
  }

  // create user
  function createUser(paramCustomerInfo) {
    $.ajax({
      url: `${G_BASE_URL}/customers`,
      method: 'POST',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(paramCustomerInfo),
      success: (response) => {
        gCustomerId = response.id;
        $('#modal-order').modal('show');
      },
      error: (e) => {
        $('#error').text(e.responseText);
        $('#modal-error').modal('show');
      },
    });
  }

  function formatDate(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  //create order
  $('#btn-create-order').click(createOrder);
  function createOrder() {
    let vNewOrder = {
      orderDate: formatDate(new Date()),
      status: 'open',
      requiredDate: $('#input-date-required').val(),
      comments: $('#input-message').val(),
    };
    if (validateOrder(vNewOrder)) {
      $.ajax({
        url: `${G_BASE_URL}/customers/${gCustomerId}/orders`,
        method: 'POST',
        contentType: 'application/json; charset=utf-8',
        async: false,
        data: JSON.stringify(vNewOrder),
        success: (response) => {
          gOrderId = response.id;
          createOrderDetail(response.id);
        },
        error: (e) => {
          $('#error').text(e.responseText);
          $('#modal-error').modal('show');
        },
      });
    }
  }

  // create order detail
  function createOrderDetail(paramOrderId) {
    gProduct.forEach((productId, index) => {
      $.ajax({
        url: `${G_BASE_URL}/orders/${paramOrderId}/products/${productId}/order-details`,
        method: 'POST',
        async: false,
        data: JSON.stringify(gOrderDetail[index]),
        contentType: 'application/json; charset=utf-8',
        success: (response) => {},
        error: (e) => {
          $('#error').text(e.responseText);
          $('#modal-error').modal('show');
        },
      });
    });
    localStorage.clear();
    window.location.href = `success.html?orderId=${gOrderId}`;
  }

  // validate order
  function validateOrder(paramOrder) {
    let vResult = true;
    try {
      if (paramOrder.requiredDate == '') {
        vResult = false;
        throw `200. Cần có ngày nhận hàng`;
      }
    } catch (error) {
      $('#error').text(error);
      $('#modal-error').modal('show');
    }
    return vResult;
  }

  // validate customer info
  function validateCustomer(paramCustomerInfo) {
    let vResult = true;
    try {
      if (paramCustomerInfo.lastName == '') {
        vResult = false;
        throw `100. First name không được để trống`;
      }
      if (paramCustomerInfo.firstName == '') {
        vResult = false;
        throw `101. Last name không được để trống`;
      }
      if (paramCustomerInfo.phoneNumber.length < 10) {
        vResult = false;
        throw `103. Số điện thoại phải đúng định dạng 10 số hoặc không được để trống`;
      }
    } catch (error) {
      $('#error').text(error);
      $('#modal-error').modal('show');
    }
    return vResult;
  }

  // on load cart number function
  function onLoadCartNumber() {
    let productNumber = localStorage.getItem('cartNumbers');
    if (productNumber) {
      $('.cart-icon span').text(productNumber);
    }
  }

  // function load cart product
  function loadProductToCart() {
    let vProduct = JSON.parse(localStorage.getItem('products'));
    let vOrderDetail = JSON.parse(localStorage.getItem('orderDetail'));
    if (vProduct) {
      vProduct.forEach((productId, index) => {
        $.ajax({
          url: `${G_BASE_URL}/products/${productId}`,
          method: 'get',
          dataType: 'json',
          success: (product) => {
            renderProductToCart(product, index, vOrderDetail[index]);
          },
          error: (e) => alert(e.responseText),
        });
      });
    }
  }

  // render product to cart
  function renderProductToCart(paramProduct, paramIndex, paramOrderDetail) {
    let vResult = `
			<tr>
				<td class="si-pic">
					<img style="width:72px; height:72px"
						src="${paramProduct.urlImage}"
						alt="product"
					/>
				</td>
				<td class="si-text">
					<div class="product-selected">
						<p>${paramProduct.buyPrice.toLocaleString()} VNĐ x ${
      paramOrderDetail.quantityOrder
    }</p>
						<h6>${paramProduct.productName} </h6>
					</div>
				</td>
				<td class="si-close">
					<i data-index="${paramIndex}" class="ti-close"></i>
				</td>
			</tr>
			`;
    $('.select-items tbody').append(vResult);
  }

  // delete product
  $(document).on('click', '.ti-close', (e) => {
    let vIndex = parseInt(e.target.dataset.index);

    // set product number
    let productNumber = localStorage.getItem('cartNumbers');
    productNumber = parseInt(productNumber);
    localStorage.setItem('cartNumbers', --productNumber);
    $('.cart-icon span').text(productNumber);
    $('.select-items tbody').html('');

    // set product
    let vProduct = JSON.parse(localStorage.getItem('products'));
    vProduct.splice(vIndex, 1);
    localStorage.setItem('products', JSON.stringify(vProduct));

    // set order detail
    let vOrderDetail = JSON.parse(localStorage.getItem('orderDetail'));
    vOrderDetail.splice(vIndex, 1);
    localStorage.setItem('orderDetail', JSON.stringify(vOrderDetail));

    loadProductToCart();
    gTotal = 0;
    gProduct = JSON.parse(localStorage.getItem('products'));
    gOrderDetail = JSON.parse(localStorage.getItem('orderDetail'));
    getBill();
  });

  // search click
  $('#btn-search').click(onSearchClick);
  function onSearchClick() {
    let vSearchInput = $('#inp-search').val().trim();
    if (vSearchInput == '') {
      $('#modal-error').modal('show');
      $('#error').text(`Cần có tên sản phẩm để tìm kiếm`);
    } else {
      window.location.href = `shop.html?name=${vSearchInput}`;
    }
  }
});
