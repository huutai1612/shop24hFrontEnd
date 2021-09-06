// FIXME: sua api
$(document).ready(() => {
    let gUrlString = window.location.href;
    let gUrl = new URL(gUrlString);
    let gProductId = parseInt(gUrl.searchParams.get('productId'));

    let gProductIdArray = [];
    let gOrderDetailArray = [];
    let gProduct = '';

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

    // get product
    $.ajax({
        method: 'get',
        dataType: 'json',
        async: false,
        url: `http://localhost:8080/products/${gProductId}`,
        success: renderProductToPage,
        error: (e) => alert(e.responseJSON),
    });

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
					<i class="fa fa-star"></i>
					<i class="fa fa-star"></i>
					<i class="fa fa-star"></i>
					<i class="fa fa-star"></i>
					<i class="fa fa-star-o"></i>
					<span>(5)</span>
				</div>
				<div class="pd-desc">
					<p>
						${gProduct.productDescription}
					</p>
					<h4>${gProduct.buyPrice} VNĐ</h4>
				</div>
				<div class="quantity">
					<div class="pro-qty">
						<span class="dec qtybtn">-</span>
						<input id="quantity" type="text" value="1" />
						<span class="inc qtybtn">+</span>
					</div>
					<a href="#" id="btn-add-cart" class="primary-btn pd-cart"
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
    }

    // add event listener
    $('#btn-add-cart').click(onAddCartClick);

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
    onLoadCartNumber();

    // function load cart product
    function loadProductToCart() {
        let vProduct = JSON.parse(localStorage.getItem('products'));
        let vOrderDetail = JSON.parse(localStorage.getItem('orderDetail'));
        if (vProduct) {
            vProduct.forEach((productId, index) => {
                $.ajax({
                    url: `http://localhost:8080/products/${productId}`,
                    method: 'get',
                    dataType: 'json',
                    success: (product) => {
                        renderProductToCart(
                            product,
                            index,
                            vOrderDetail[index]
                        );
                    },
                    error: (e) => alert(e.responseText),
                });
            });
        }
    }
    loadProductToCart();

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
						<p>${paramProduct.buyPrice} VNĐ x ${paramOrderDetail.quantityOrder}</p>
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
