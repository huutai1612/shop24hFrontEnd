$(document).ready(() => {
  // khai báo biến
  let gUserToken = getCookie('user');
  const G_URL_STRING = new URL(window.location.href);
  let gUserId = G_URL_STRING.searchParams.get('userId');
  const G_BASE_URL = `http://localhost:8080/api`;
  let gProductId = 0;

  // search click
  onLoadCartNumber();
  loadProductToCart();
  getInfo();

  // add event listener
  $(document).on('click', '.btn-log-out', onLogoutClick);
  $('#btn-information').click(showMyInfo);
  $(document).on('click', '.btn-order-detail', getOrderDetail);
  $(document).on('click', '.btn-rating', onRatingClick);
  $('.btn-comments').click(onCreateCommentsClick);
  $('#btn-update').click(onSaveCustomerClick);
  $('#btn-change-password').click(onChangePasswordClick);
  $('#btn-confirm-change-password').click(onConfirmChangePasswordClick);

  // change password click
  function onChangePasswordClick() {
    $('#modal-change-password').modal('show');
  }

  // on confirm change pas click
  function onConfirmChangePasswordClick() {
    let vOldPassWord = $('#inp-old-password').val().trim();
    let vNewPassword = {
      password: $('#inp-new-password').val().trim(),
    };
    let vRepeatPassword = $('#inp-new-password-repeat').val().trim();
    if (validatePassword(vOldPassWord, vNewPassword, vRepeatPassword)) {
      $.ajax({
        url: `${G_BASE_URL}/customer/change-password/customers/${gUserId}/old-password/${vOldPassWord}`,
        method: `put`,
        headers: {
          Authorization: `Token ${gUserToken}`,
        },
        data: JSON.stringify(vNewPassword),
        contentType: `application/json ; charset=utf-8`,
        success: (res) => {
          alert('Đã cập nhật mật khẩu thành công. Xin hãy đăng nhập lại');
          setCookie('user', '', 1);
          window.location.href = `login.html`;
        },
        error: (e) => alert(e.responseText),
      });
    }
  }

  // validate password
  function validatePassword(pOldPas, pNewPas, pRePas) {
    let vResult = true;
    try {
      if (pOldPas == '') {
        vResult = false;
        throw `101. Bạn chưa nhập mật khẩu cũ`;
      }
      if (pNewPas.password == '') {
        vResult = false;
        throw `102. Bạn chưa nhập mật khẩu mới`;
      }
      if (pRePas == '') {
        vResult = false;
        throw `103. Bạn chưa nhập lại  mật khẩu mới`;
      }
      if (pRePas !== pNewPas.password) {
        vResult = false;
        throw `104. Mật khẩu không trùng nhau`;
      }
    } catch (error) {
      $('#modal-error').modal('show');
      $('#error').text(error);
    }
    return vResult;
  }

  // save customer
  function onSaveCustomerClick() {
    let vNewCustomer = {
      lastName: $('#last').val().trim(),
      firstName: $('#fir').val().trim(),
      address: $('#street').val().trim(),
      city: $('#town').val().trim(),
      state: $('#state').val().trim(),
      postalCode: $('#zip').val().trim(),
      country: $('#cun').val().trim(),
      salesRepEmployeeNumber: $('#sale-rep').val().trim(),
      creditLimit: $('#credit').val().trim(),
    };
    if (validateCustomer(vNewCustomer)) {
      updateCustomer(vNewCustomer);
    }
  }

  // update customer
  function updateCustomer(paramCustomer) {
    $.ajax({
      url: `${G_BASE_URL}/customers/${gUserId}`,
      method: 'PUT',
      headers: { Authorization: `Token ${gUserToken}` },
      data: JSON.stringify(paramCustomer),
      contentType: 'application/json; charset=utf-8 ',
      success: () => {
        alert('Đã cập nhật thông tin khách hàng thành công');
        getInfo();
        $('#modal-information').modal('hide');
      },
      error: (e) => alert(e.responseText),
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

  // rating
  function onRatingClick() {
    gProductId = $(this).data('productId');
    $('#modal-rating').modal('show');
  }

  // create comments
  function onCreateCommentsClick() {
    let vNewComment = {
      comments: $('#inp-comment').val(),
      rateStar: $('#inp-rating').val(),
    };
    if (validateComments(vNewComment)) {
      $.ajax({
        url: `${G_BASE_URL}/customers/${gUserId}/products/${gProductId}/comments`,
        method: 'POST',
        headers: { Authorization: `Token ${gUserToken}` },
        data: JSON.stringify(vNewComment),
        contentType: `application/json; charset=utf-8`,
        success: () => {
          alert('Cảm ơn bạn đã để lại đánh giá cho sản phẩm');
          $('#modal-rating').modal('hide');
        },
        error: (e) => alert(e.responseText),
      });
    }
  }

  // validate comments
  function validateComments(paramComments) {
    let vResult = true;
    try {
      if (paramComments.comments == '') {
        vResult = false;
        throw '100. Xin để lại đánh giá cho sản phẩm';
      }
      if (paramComments.rateStar == '') {
        vResult = false;
        throw '100. Xin để lại đánh giá cho sản phẩm';
      }
    } catch (error) {
      alert(error);
    }
    return vResult;
  }

  // get order detail
  function getOrderDetail() {
    let vOrderId = $(this).data('id');
    $.ajax({
      url: `${G_BASE_URL}/orders/${vOrderId}/order-details`,
      method: 'get',
      headers: { Authorization: `Token ${gUserToken}` },
      async: false,
      dataType: 'json',
      success: renderOrderDetail,
      error: (e) => alert(e.responseText),
    });
  }

  // render order detail
  function renderOrderDetail(pOrderDetail) {
    let vTotalPrice = 0;
    let vResult = pOrderDetail.map((orderDetail) => {
      let vProduct = '';
      let vTotal = 0;
      vTotal = orderDetail.priceEach * orderDetail.quantity;
      vTotalPrice += vTotal;
      $.ajax({
        url: `${G_BASE_URL}/products/${orderDetail.productId}`,
        method: 'get',
        async: false,
        success: (response) => (vProduct = response),
        error: (e) => alert(e.responseText),
      });
      return `
            <tr>
                <td class="cart-pic first-row">
                    <img style="width:168px; height:168px"
                        src="${vProduct.urlImage}"
                        alt=""
                    />
                </td>
                <td class="cart-title first-row">
                    <a href="product.html?productId=${vProduct.id}">${vProduct.productName}</a>
                </td>
                <td class="p-price first-row">${orderDetail.priceEach.toLocaleString()} VNĐ</td>
                <td class="p-price first-row">${orderDetail.quantity}</td>
                <td class="total-price first-row">${vTotal.toLocaleString()} VNĐ</td>
                <td class="close-td first-row">
                    <button class="btn btn-warning btn-rating" data-product-id="${
                      orderDetail.productId
                    }">
                        Đánh giá
                    </button>
                </td>
            </tr>
            `;
    });
    $('.body-order-detail').html(vResult);
    $('#total-price').text(vTotalPrice.toLocaleString());
  }

  // show info modal
  function showMyInfo() {
    $('#modal-information').modal('show');
  }

  // get my information
  function getInfo() {
    $.ajax({
      url: `${G_BASE_URL}/customers/${gUserId}`,
      method: 'get',
      success: handleCustomerInfo,
      error: (e) => alert(e.responseText),
    });
  }

  // handle CustomerInfo
  function handleCustomerInfo(PResponse) {
    renderInfo(PResponse);
    renderOrder(PResponse.orders);
  }

  // render order
  function renderOrder(pOrder) {
    let vResult = pOrder.map(
      (order) => `
        <li><button class="dropdown-item btn-order-detail btn-warning" data-id="${order.id}">${order.orderDate} OIDOD${order.id}</button></li>
        `
    );
    $('.my-order').html(vResult);
  }

  // render info
  function renderInfo(pUserInfo) {
    $('#fir').val(pUserInfo.firstName);
    $('#last').val(pUserInfo.lastName);
    $('#cun').val(pUserInfo.country);
    $('#street').val(pUserInfo.address);
    $('#town').val(pUserInfo.city);
    $('#state').val(pUserInfo.state);
    $('#zip').val(pUserInfo.postalCode);
    $('#credit').val(pUserInfo.creditLimit);
    $('#sale-rep').val(pUserInfo.salesRepEmployeeNumber);
  }

  // check user cookie
  if (gUserToken) {
    $.ajax({
      url: `${G_BASE_URL}/user-info`,
      method: 'get',
      headers: { Authorization: `Token ${gUserToken}` },
      dataType: 'json',
      success: handleUser,
      error: (e) => alert(e.responseText),
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

  $('#btn-search').click(onSearchClick);
  function onSearchClick() {
    let vSearchInput = $('#inp-search').val().trim();
    if (vSearchInput == '') {
      alert('Cần có tên sản phẩm để tìm kiếm');
    } else {
      window.location.href = `shop.html?name=${vSearchInput}`;
    }
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
						<p>${paramProduct.buyPrice.toLocaleString()} VNĐ x ${paramOrderDetail.quantityOrder}</p>
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
  });
});
