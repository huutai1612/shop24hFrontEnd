$(document).ready(() => {
    // khai báo biến
    let stringUrl = window.location.href;
    let url = new URL(stringUrl);
    let gOrderId = url.searchParams.get('orderId');
    $('#input-order-id').val(gOrderId);

    // chạy hảm khởi tạo
    onLoadCartNumber();
    loadProductToCart();

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
                    url: `http://localhost:8080/products/${productId}`,
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
