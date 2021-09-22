$(document).ready(() => {
  // khai báo biến
  let gProduct = JSON.parse(localStorage.getItem('products'));
  let gOrderDetail = JSON.parse(localStorage.getItem('orderDetail'));
  const G_BASE_URL = `http://localhost:8080/api`;

  // add event listener
  $('#btn-search').click(onSearchClick);
  $(document).on('click', '.btn-log-out', onLogoutClick);

  // chạy các hàm khởi tạo
  getProduct();
  addEventListenerForIncreaseAndDecrease();
  onLoadCartNumber();
  loadProductToCart();

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

  // get product
  function getProduct() {
    $('.cart-table tbody').html('');
    if (gProduct) {
      gProduct.forEach((productId, index) => {
        $.ajax({
          url: `${G_BASE_URL}/products/${productId}`,
          method: 'get',
          async: false,
          dataType: 'json',
          success: (product) => {
            renderProduct(product, index, gOrderDetail[index]);
          },
          error: (e) => alert(e.responseText),
        });
      });
    }
  }

  // render product
  function renderProduct(paramProduct, paramIndex, paramOrderDetail) {
    let vResult = `
		<tr>
			<td class="cart-pic first-row">
				<img style="width:168px; height:168px" src="${paramProduct.urlImage}" alt="product">
			</td>
			<td class="cart-title first-row">
				<a class="text-primary" href="product.html?productId=${paramProduct.id}">${
      paramProduct.productName
    }</a>
			</td>
			<td class="p-price first-row">${paramOrderDetail.priceEach.toLocaleString()} VNĐ</td>
			<td class="qua-col first-row">
				<div class="quantity">
					<div class="pro-qty"><span class="dec qtybtn">-</span>
						<input class="inp-quantity" type="text" value="${paramOrderDetail.quantityOrder}">
					<span class="inc qtybtn">+</span></div>
				</div>
			</td>
			<td class="total-price first-row">${(
        paramOrderDetail.priceEach * paramOrderDetail.quantityOrder
      ).toLocaleString()} VNĐ</td>
			<td class="close-td first-row"><i  data-index="${paramIndex}" class="ti-close"></i></td>
		</tr>
		`;
    $('.cart-table tbody').append(vResult);
  }

  function addEventListenerForIncreaseAndDecrease() {
    let gDecreaseInput = $('.dec');
    let gIncreaseInput = $('.inc');
    let gInputElement = document.querySelectorAll('.inp-quantity');
    // decrease
    for (let i = 0; i < gDecreaseInput.length; i++) {
      gDecreaseInput[i].addEventListener('click', () =>
        onDecreaseProductClick(gInputElement[i], i)
      );
    }

    function onDecreaseProductClick(paramInputElement, paramIndex) {
      if (paramInputElement.value < 2) {
        paramInputElement.value = 1;
      }
      gOrderDetail[paramIndex].quantityOrder = parseInt(--paramInputElement.value);
      localStorage.setItem('orderDetail', JSON.stringify(gOrderDetail));
      $('.select-items tbody').html('');
      gProduct = JSON.parse(localStorage.getItem('products'));
      gOrderDetail = JSON.parse(localStorage.getItem('orderDetail'));
      getProduct();
      addEventListenerForIncreaseAndDecrease();
      loadProductToCart();
    }
    // increase
    for (let i = 0; i < gIncreaseInput.length; i++) {
      gIncreaseInput[i].addEventListener('click', () =>
        onIncreaseProductClick(gInputElement[i], i)
      );
    }

    function onIncreaseProductClick(paramInputElement, paramIndex) {
      gOrderDetail[paramIndex].quantityOrder = parseInt(++paramInputElement.value);
      localStorage.setItem('orderDetail', JSON.stringify(gOrderDetail));
      $('.select-items tbody').html('');
      gProduct = JSON.parse(localStorage.getItem('products'));
      gOrderDetail = JSON.parse(localStorage.getItem('orderDetail'));
      getProduct();
      addEventListenerForIncreaseAndDecrease();
      loadProductToCart();
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

    gProduct = JSON.parse(localStorage.getItem('products'));
    gOrderDetail = JSON.parse(localStorage.getItem('orderDetail'));
    getProduct();
    addEventListenerForIncreaseAndDecrease();
  });

  // search click
  function onSearchClick() {
    let vSearchInput = $('#inp-search').val().trim();
    if (vSearchInput == '') {
      alert('Cần có tên sản phẩm để tìm kiếm');
    } else {
      window.location.href = `shop.html?name=${vSearchInput}`;
    }
  }
});
