$(document).ready(() => {
  const G_BASE_URL = `http://localhost:8080/api`;
  onLoadCartNumber();
  loadProductToCart();
  let gUserToken = getCookie('user');
  if (gUserToken) {
    checkRole();
  }

  // add event listener
  $('#btn-search').click(onSearchClick);
  $('.login-btn').click(onLoginClick);

  // login click
  function onLoginClick() {
    let vLoginData = {
      phoneNumber: $('#phone').val().trim(),
      password: $('#pass').val().trim(),
    };
    if (validateData(vLoginData)) {
      signIn(vLoginData);
    }
  }

  // login
  function signIn(pData) {
    $.ajax({
      method: 'POST',
      url: `${G_BASE_URL}/login`,
      data: JSON.stringify(pData),
      contentType: `application/json; charset=utf-8`,
      success: responseHandler,
      error: (error) => {
        $('#modal-error').modal('show');
        $('#message-error').text(error.responseJSON.message);
      },
    });
  }

  // response handle
  function responseHandler(res) {
    setCookie('user', res, 1);
    gUserToken = getCookie('user');
    checkRole();
  }

  // check role
  function checkRole() {
    $.ajax({
      url: `${G_BASE_URL}/user/checkrole`,
      method: 'get',
      async: false,
      headers: { Authorization: 'Token ' + gUserToken },
      success: redirectCustomerPage,
      error: redirectToAdminPage,
    });
  }

  // redirect to customer page
  function redirectCustomerPage() {
    window.location.href = `index.html`;
  }

  // redirect to admin Page
  function redirectToAdminPage() {
    window.location.href = `../admin/index.html`;
  }

  // validate data
  function validateData(pData) {
    let vResult = true;
    try {
      if (pData.phoneNumber == '') {
        vResult = false;
        throw '100. Số điện thoại không được để trống';
      }
      if (pData.password == '') {
        vResult = false;
        throw '101. Mật khẩu không được để trống';
      }
    } catch (error) {
      $('#modal-error').modal('show');
      $('#error').text(error);
    }
    return vResult;
  }

  // set cookie
  function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
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

  // search click
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
