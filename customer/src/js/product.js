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
    $('.btn-comments').click(onCreateCommentsClick);

    // get related product
    function getRelatedProduct() {
        $.ajax({
            url: `http://localhost:8080/products/related`,
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
                        <a href="shop.html">Shop Now</a>
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
        $owl.html($owl.find('.owl-stage-outer').html()).removeClass(
            'owl-loaded'
        );
        $owl.owlCarousel({
            loop: true,
            margin: 25,
            nav: true,
            items: 4,
            dots: true,
            navText: [
                '<i class="ti-angle-left"></i>',
                '<i class="ti-angle-right"></i>',
            ],
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
            url: `http://localhost:8080/products/${gProductId}`,
            success: renderProductToPage,
            error: (e) => alert(e.responseJSON),
        });
    }
    getProduct();
    getRelatedProduct();

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
					<h4>${gProduct.buyPrice.toLocaleString()} VNĐ</h4>
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
        renderComments(paramProduct.comments);
    }

    // render comments
    function renderComments(paramComments) {
        let vResult = paramComments.map(
            (comment) => `
            <div
                class="avatar-text">
                <h5>${comment.name}</h5>
                <div class=" at-rating">
                    <i class="fa fa-star text-warning"></i>
                    <i class="fa fa-star text-warning"></i>
                    <i class="fa fa-star text-warning"></i>
                    <i class="fa fa-star text-warning"></i>
                    <i class="fa fa-star-o"></i>
                </div>
                <div class="at-reply">${comment.comments}</div>
            </div>
        `
        );
        $('.comment-option').html(vResult);
    }

    // create comments
    function onCreateCommentsClick() {
        let vNewComment = {
            name: $('#inp-name').val(),
            comments: $('#inp-comment').val(),
        };
        if (validateComments(vNewComment)) {
            $.ajax({
                url: `http://localhost:8080/products/${gProductId}/comments`,
                method: 'POST',
                data: JSON.stringify(vNewComment),
                contentType: `application/json; charset=utf-8`,
                success: () => {
                    getProduct();
                    $('#inp-name').val('');
                    $('#inp-comment').val('');
                    $('#btn-add-cart').click(onAddCartClick);
                },
                error: (e) => alert(e.responseText),
            });
        }
    }

    function validateComments(paramComments) {
        let vResult = true;
        try {
            if (paramComments.name == '') {
                vResult = false;
                throw '100. Phải có tên để xác nhận danh tính';
            }
            if (paramComments.comments == '') {
                vResult = false;
                throw '101. Nên để lại comments';
            }
        } catch (error) {
            alert(error);
        }
        return vResult;
    }

    // add event listener
    $('#btn-add-cart').click(onAddCartClick);

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
