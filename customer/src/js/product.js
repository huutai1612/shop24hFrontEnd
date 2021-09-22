$(document).ready(() => {
  const G_BASE_URL = `http://localhost:8080/api`;
  let gUrlString = window.location.href;
  let gUrl = new URL(gUrlString);
  let gProductId = parseInt(gUrl.searchParams.get('productId'));

  let gProductIdArray = [];
  let gOrderDetailArray = [];
  let gProduct = '';
  let gProductRate = 0;
  let gUserToken = getCookie('user');

  // add plus and minus product click
  let vQuantityNumber = 1;
  $(document).on('click', '.inc', function () {
    vQuantityNumber++;
    $('#quantity').val(vQuantityNumber);
  });
  $(document).on('click', '.dec', function () {
    if (vQuantityNumber < 2) {
      vQuantityNumber = 1;
      $('#quantity').val(vQuantityNumber);
    } else {
      vQuantityNumber--;
      $('#quantity').val(vQuantityNumber);
    }
  });
  $(document).on('click', '#btn-add-cart', onAddCartClick);

  getAverageRate();
  getProduct();
  getRelatedProduct();
  onLoadCartNumber();
  loadProductToCart();

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

  // function get average rate
  function getAverageRate() {
    $.ajax({
      url: `${G_BASE_URL}/products/${gProductId}/comments/average`,
      method: 'get',
      async: false,
      success: (response) => (gProductRate = response[0].average),
      error: (error) => alert(error.responseText),
    });
  }

  // get related product
  function getRelatedProduct() {
    $.ajax({
      url: `${G_BASE_URL}/products/related`,
      method: 'GET',
      async: false,
      dataType: 'json',
      success: renderRelatedProduct,
      error: (e) => alert(e.responseText),
    });
  }

  // render Related product
  function renderRelatedProduct(paramProduct) {
    let vResult = paramProduct.map((product) => {
      return `<div class="product-item">
            <div class="pi-pic">
                <img
                    style="height: 500px"
                    src="${product.urlImage}"
                    alt="shirt"
                />
                <div class="icon">
                    <i class="icon_heart_alt"></i>
                </div>
                <ul>
                    <li class="quick-view">
                        <a href="product.html?productId=${product.id}">Shop Now</a>
                    </li>
                </ul>
            </div>
            <div class="pi-text">
                <div class="catagory-name">${product.productDescription}</div>
                <a href="#">
                    <h5>${product.productName}</h5>
                </a>
                <div class="product-price">${product.buyPrice.toLocaleString()} VNĐ</div>
            </div>
        </div>`;
    });
    $('.my-own').html(vResult);
    var $owl = $('.my-own');
    $owl.trigger('destroy.owl.carousel');
    // After destory, the markup is still not the same with the initial.
    // The differences are:
    //   1. The initial content was wrapped by a 'div.owl-stage-outer';
    //   2. The '.owl-carousel' itself has an '.owl-loaded' class attached;
    //   We have to remove that before the new initialization.
    $owl.html($owl.find('.owl-stage-outer').html()).removeClass('owl-loaded');
    $owl.owlCarousel({
      loop: true,
      margin: 25,
      nav: true,
      items: 4,
      dots: true,
      navText: ['<i class="ti-angle-left"></i>', '<i class="ti-angle-right"></i>'],
      smartSpeed: 1200,
      autoHeight: false,
      autoplay: true,
      responsive: {
        0: {
          items: 1,
        },
        576: {
          items: 2,
        },
        992: {
          items: 2,
        },
        1200: {
          items: 3,
        },
      },
    });
  }

  // get product
  function getProduct() {
    $.ajax({
      method: 'get',
      dataType: 'json',
      async: false,
      url: `${G_BASE_URL}/products/${gProductId}`,
      success: renderProductToPage,
      error: (e) => alert(e.responseJSON),
    });
  }

  // renderProduct
  function renderProductToPage(paramProduct) {
    gProduct = paramProduct;
    let vResult = `
		<div class="col-lg-6">
			<div class="product-pic-zoom">
				<img
					class="product-big-img"
					src="${gProduct.urlImage}"
					alt="product"
				/>
			</div>
		</div>
		<div class="col-lg-6">
			<div class="product-details">
				<div class="pd-title">
					<h3>${gProduct.productName}</h3>
					<a href="#" class="heart-icon"
						><i class="icon_heart_alt"></i
					></a>
				</div>
				<div class="pd-rating">
                <span class="stars ml-2" data-rating="${gProductRate}" data-num-stars="5" >
                </span>
                (${gProductRate})
				</div>
				<div class="pd-desc">
					<p>
						${gProduct.productDescription}
					</p>
					<h4>${gProduct.buyPrice.toLocaleString()} VNĐ</h4>
				</div>
				<div class="quantity">
					<div class="pro-qty">
						<span class="dec qtybtn">-</span>
						<input id="quantity" type="text" value="1" />
						<span class="inc qtybtn">+</span>
					</div>
					<a href="#" id="btn-add-cart" class="primary-btn text-white pd-cart"
						>Add To Cart</a
					>
				</div>
				<div class="pd-share">
					<div class="p-code">Sku : ${gProduct.productCode}</div>
					<div class="pd-social">
						<a href="https://www.facebook.com/"
							><i class="ti-facebook"></i
						></a>
						<a href="https://twitter.com/"
							><i class="ti-twitter-alt"></i
						></a>
						<a href="https://www.linkedin.com/"
							><i class="ti-linkedin"></i
						></a>
					</div>
				</div>
			</div>
		</div>
		`;
    $('.product-details').html(vResult);
    renderComments(paramProduct.comments);
  }

  // render comments
  function renderComments(paramComments) {
    let vResult = paramComments.map((comment) => {
      return `
        <div class="avatar-text mt-2 d-flex">
          <h5>${comment.name}</h5>
              <span class="stars ml-2" data-rating="${comment.rateStar}" data-num-stars="5" ></span>
          </div>
          <div class="at-reply">
            <p class="user-comment">
            ${comment.comments}
            ${renderReply(comment.replies)}
            </p>
          </div>
        `;
    });
    $(function () {
      $('.stars').stars();
    });

    $('.comment-option').html(vResult);
  }

  function renderReply(pReply) {
    let vReturn = pReply.map((reply) => {
      return `
      <div class="arrow-up"></div>
      <div class=" reply d-flex justify-content-end shadow-lg p-3 bg-white rounded">
        <span>${reply.replies}</span>
        <i class="ml-2 fab fa-adn text-info"></i>
      </div>
      `;
    });
    return vReturn;
  }

  // render star
  $.fn.stars = function () {
    return $(this).each(function () {
      const rating = $(this).data('rating');
      const numStars = $(this).data('numStars');
      const fullStar = '<i class="fas fa-star text-warning"></i>'.repeat(Math.floor(rating));
      const halfStar = rating % 1 !== 0 ? '<i class="fas fa-star-half-alt text-warning"></i>' : '';
      const noStar = '<i class="far fa-star text-warning"></i>'.repeat(
        Math.floor(numStars - rating)
      );
      $(this).html(`${fullStar}${halfStar}${noStar}`);
    });
  };

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

  // add cart
  function onAddCartClick(e) {
    e.preventDefault();
    // set cart number
    let productNumber = localStorage.getItem('cartNumbers');
    productNumber = parseInt(productNumber);
    if (productNumber) {
      localStorage.setItem('cartNumbers', ++productNumber);
      $('.cart-icon span').text(productNumber);
    } else {
      localStorage.setItem('cartNumbers', 1);
      $('.cart-icon span').text(1);
    }

    // set product
    let vProduct = JSON.parse(localStorage.getItem('products'));
    if (vProduct) {
      gProductIdArray = vProduct;
    }
    gProductIdArray.push(gProductId);
    localStorage.setItem('products', JSON.stringify(gProductIdArray));

    // set order detail
    let vOrderDetail = JSON.parse(localStorage.getItem('orderDetail'));
    if (vOrderDetail) {
      gOrderDetailArray = vOrderDetail;
    }
    let newOrderDetail = {
      quantityOrder: parseInt($('#quantity').val()),
      priceEach: gProduct.buyPrice,
    };
    gOrderDetailArray.push(newOrderDetail);
    localStorage.setItem('orderDetail', JSON.stringify(gOrderDetailArray));

    $('.select-items tbody').html('');
    loadProductToCart();
    $('#modal-added').modal('show');
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
