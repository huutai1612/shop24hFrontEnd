$(document).ready(() => {
    // add event listener
    $('.filter-catagories').on('click', 'a', onFilterProductLineClick);
    $('.filter-btn').click(onFilterByPriceClick);
    $('.product-content').on('click', '.add-cart', onAddCartClick);
    $(document).on('click', '.page', onChangePageClick);
    $(document).on('click', '.next-page', onNextPageClick);
    $(document).on('click', '.previous-page', onPreviousPageClick);
    let gProductIdArray = [];
    let gOrderDetailArray = [];
    let gTotalPage = 0;
    let vPaginationElement = $('.pagination');
    let gCurrentPage = 0;
    onGetCurrentPageLoad();
    getTotalProductCount();
    renderPagination();
    $(`.pagination li:nth-child(${gCurrentPage + 2})`).addClass('active');

    // search
    let gUrl = new URL(document.location).searchParams;
    let gSearchValue = gUrl.get('name');
    if (gSearchValue) {
        getProduct(`http://localhost:8080/products/name/${gSearchValue}`);
    } else {
        getProduct(`http://localhost:8080/products/pages/${gCurrentPage}`);
    }
    getRelatedProduct();

    // function get count total
    function getTotalProductCount() {
        $.ajax({
            url: `http://localhost:8080/products/counts`,
            method: 'get',
            dataType: 'json',
            async: false,
            success: (res) => (gTotalPage = Math.ceil(res / 6)),
            error: (e) => alert(e.responseText),
        });
    }

    // render pagination
    function renderPagination() {
        for (let i = 0; i < gTotalPage; i++) {
            vPaginationElement.append(`
            <li class="page-item">
                <a data-page="${i}" class="page-link page" href="http://localhost:8080/products/pages/${i}">
                ${i + 1}
                </a>
            </li>`);
        }
        vPaginationElement.append(
            `<li class="page-item"><a class="page-link next-page" href="#">Next</a></li>`
        );
    }

    // on change page click
    function onChangePageClick(e) {
        e.preventDefault();
        // $(this)[0].style = 'color: rgb(24,140,255)';
        let vUrl = $(this)[0].href;
        let vPage = $(this)[0].dataset.page;
        $(this).parents('li').addClass('active');
        $(this).parents('li').siblings().removeClass('active');
        localStorage.setItem('currentPage', vPage);
        gCurrentPage = parseInt(localStorage.getItem('currentPage'));
        $('.pagination li:last-child').removeClass('disabled');
        $('.pagination li:last-child a')[0].style = 'color: rgb(7 134 250)';
        $('.pagination li:first-child').removeClass('disabled');
        $('.pagination li:first-child a')[0].style = 'color: rgb(7 134 250)';
        getProduct(vUrl);
    }

    // on next page click
    function onNextPageClick(e) {
        e.preventDefault();

        $('.pagination li:first-child').removeClass('disabled');
        $('.pagination li:first-child a')[0].style = 'color: rgb(7 134 250)';
        $(this)[0].style = 'color: rgb(24,140,255)';
        gCurrentPage++;
        if (gCurrentPage >= gTotalPage) {
            gCurrentPage = gTotalPage - 1;
            $(this).parent().addClass('disabled');
            $(this)[0].style = 'color: rgb(108,163,213)';
            localStorage.setItem('currentPage', gCurrentPage);
        } else {
            localStorage.setItem('currentPage', gCurrentPage);
        }
        let vUrl = `http://localhost:8080/products/pages/${parseInt(
            localStorage.getItem('currentPage')
        )}`;
        $(`.pagination li:nth-child(${gCurrentPage + 1})`).removeClass(
            'active'
        );
        $(`.pagination li:nth-child(${gCurrentPage + 1})`)
            .next()
            .addClass('active');
        getProduct(vUrl);
    }

    // on previous page click
    function onPreviousPageClick(e) {
        e.preventDefault();
        $(this)[0].style = 'color: rgb(24,140,255)';
        $('.pagination li:last-child').removeClass('disabled');
        $('.pagination li:last-child a')[0].style = 'color: rgb(7 134 250)';
        gCurrentPage--;
        if (gCurrentPage < 1) {
            gCurrentPage = 0;
            $(this).parent().addClass('disabled');
            $(this)[0].style = 'color: rgb(108,163,213)';
            localStorage.setItem('currentPage', gCurrentPage);
        } else {
            localStorage.setItem('currentPage', gCurrentPage);
        }
        let vUrl = `http://localhost:8080/products/pages/${parseInt(
            localStorage.getItem('currentPage')
        )}`;
        $(`.pagination li:nth-child(${gCurrentPage + 3})`).removeClass(
            'active'
        );
        $(`.pagination li:nth-child(${gCurrentPage + 3})`)
            .prev()
            .addClass('active');
        getProduct(vUrl);
    }

    // onGetCurrentPageLoad
    function onGetCurrentPageLoad() {
        let vPage = parseInt(localStorage.getItem('currentPage'));
        if (vPage) {
            gCurrentPage = vPage;
        }
    }

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
                        <a href="product.html?productId=${
                            product.id
                        }">Shop Now</a>
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

    // getproduct
    function getProduct(paramUrl) {
        $.ajax({
            url: paramUrl,
            method: 'GET',
            dataType: 'json',
            success: renderProduct,
            error: (e) => alert(e.responseText),
        });
    }

    function renderProduct(paramProduct) {
        let vProductContentElement = $('.product-content');

        let vProductResult = paramProduct.map((product) => {
            return `
            <div class="col-lg-4 col-sm-6">
                <div class="product-item">
                    <div class="pi-pic">
                        <img style="height: 400px" src="${
                            product.urlImage
                        }" alt="${product.productCode}" />
                        <div class="icon">
                            <i class="icon_heart_alt"></i>
                        </div>
                        <ul>
                            <li class="w-icon active">
                                <a data-price=${product.buyPrice} data-id="${
                product.id
            }" class="add-cart" href="#"><i class="icon_bag_alt"></i></a>
                            </li>
                            <li class="quick-view">
                                <a href="product.html?productId=${
                                    product.id
                                }">Xem sản phẩm</a>
                            </li>
                        </ul>
                    </div>
                    <div class="pi-text">
                        <div class="catagory-name">Towel</div>
                        <a class="add-cart" href="product.html?productId=${
                            product.id
                        }">
                            <h5>${product.productName}</h5>
                        </a>
                        <div class="product-price">
                            ${product.buyPrice.toLocaleString()} VNĐ
                        </div>
                    </div>
                </div>
            </div>
    `;
        });
        vProductContentElement.html(vProductResult);
    }

    // get product line
    (function () {
        $.get('http://localhost:8080/product-lines', loadProductLineToFilter);
    })();

    // lọc theo giới tính
    function loadProductLineToFilter(paramProductLine) {
        let vResult = paramProductLine.map((productLine) => {
            return `<li><a data-id="${productLine.id}" href="#">${productLine.productLine}</a></li>`;
        });
        $('.filter-catagories').append(vResult);
    }

    function onFilterProductLineClick(e) {
        e.preventDefault();
        let vProductLineId = $(this).data('id');
        if (vProductLineId == 0) {
            getProduct('http://localhost:8080/products/pages/0');
        } else {
            getProduct(
                `http://localhost:8080/product-lines/${vProductLineId}/products`
            );
        }
    }

    // Lọc theo giá
    function onFilterByPriceClick() {
        let vMinValue = $('#minamount').val();
        let vMaxValue = $('#maxamount').val();
        getProduct(
            `http://localhost:8080/products/price?minPrice=${vMinValue}&maxPrice=${vMaxValue}`
        );
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
        let vProductId = $(this).data('id');
        let vProduct = JSON.parse(localStorage.getItem('products'));
        if (vProduct) {
            gProductIdArray = vProduct;
        }
        gProductIdArray.push(vProductId);
        localStorage.setItem('products', JSON.stringify(gProductIdArray));

        // set order detail
        let vBuyPrice = $(this).data('price');
        let vOrderDetail = JSON.parse(localStorage.getItem('orderDetail'));
        if (vOrderDetail) {
            gOrderDetailArray = vOrderDetail;
        }
        let newOrderDetail = {
            quantityOrder: 1,
            priceEach: vBuyPrice,
        };
        gOrderDetailArray.push(newOrderDetail);
        localStorage.setItem('orderDetail', JSON.stringify(gOrderDetailArray));

        $('.select-items tbody').html('');
        loadProductToCart();
        $('#modal-added').modal('show');
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
