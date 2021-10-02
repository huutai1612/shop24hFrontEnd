$(document).ready(() => {
  const G_BASE_URL = `http://localhost:8080/api`;
  // on load
  onLoadCartNumber();
  loadProductToCart();

  // add event listener
  $('#btn-register').click(onRegisterCustomerClick);

  // click to register
  function onRegisterCustomerClick() {
    let vNewCustomer = {
      firstName: $('#f-name').val().trim(),
      lastName: $('#l-name').val().trim(),
      phoneNumber: $('#username').val().trim(),
      password: $('#pass').val().trim(),
    };
    let vRepeatPas = $('#con-pass').val().trim();
    if (validateNewCustomer(vNewCustomer, vRepeatPas)) {
      $.ajax({
        url: `${G_BASE_URL}/customers/phone/${vNewCustomer.phoneNumber}`,
        method: 'get',
        async: false,
        success: checkUserExist,
        error: () => {
          registerNewUser(vNewCustomer);
        },
      });
    }
  }

  // create user
  const registerNewUser = (pNewCustomer) => {
    $.ajax({
      url: `${G_BASE_URL}/register/customer`,
      method: `POST`,
      data: JSON.stringify(pNewCustomer),
      contentType: `application/json; charset=utf-8`,
      success: (res) => {
        $('#modal-register').modal('show');
        $('#text-success').text(
          `Bạn đã đăng ký thành công tài khoản với số điện thoại ${res.username}
          Xin quay lại trang đăng nhập để đăng nhập
          `
        );
        setTimeout(() => {
          window.location.href = `login.html`;
        }, 3000);
      },
      error: (e) => alert(e.responseText),
    });
  };

  // check user exist
  const checkUserExist = (pRes) => {
    $('#modal-error').modal('show');
    $('#error').text(`Tài khoản đã tồn tại trên hệ thống`);
  };

  // validate
  function validateNewCustomer(pNewCustomer, pPassRepeat) {
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
        throw '102. Không được để trống số điện thoại đăng ký';
      }
      if (pNewCustomer.phoneNumber.length < 10) {
        vResult = false;
        throw '103. Số điện thoại không đúng định dạng';
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

  // search click
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
  });
});
