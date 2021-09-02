$(document).ready(() => {
	// TODO: refracotring api

	// add event listener
	$('.filter-catagories').on('click', 'a', onFilterProductLineClick);
	$('.filter-btn').click(onFilterByPriceClick);

	// getproduct
	function getProduct(paramUrl) {
		$.ajax({
			url: paramUrl,
			method: 'GET',
			dataType: 'json',
			success: renderProduct,
			error: (e) => alert(e.responseJSON.message),
		});
	}
	getProduct('http://localhost:8080/products');

	function renderProduct(paramProduct) {
		let vProductContentElement = $('.product-content');

		let vProductResult = paramProduct.map((product) => {
			if (!product.isRelated) {
				return `
                    <div class="col-lg-4 col-sm-6">
                        <div class="product-item">
                            <div class="pi-pic">
                                <img style="height: 400px" src="${product.urlImage}" alt="${product.productCode}" />
                                <div class="icon">
                                    <i class="icon_heart_alt"></i>
                                </div>
                                <ul>
                                    <li class="w-icon active">
                                        <a href="#"><i class="icon_bag_alt"></i></a>
                                    </li>
                                    <li class="quick-view">
                                        <a href="product.html?productId=${product.id}">+ Quick View</a>
                                    </li>
                                </ul>
                            </div>
                            <div class="pi-text">
                                <div class="catagory-name">Towel</div>
                                <a href="product.html?productId=${product.id}">
                                    <h5>${product.productName}</h5>
                                </a>
                                <div class="product-price">
                                    ${product.buyPrice} VNĐ
                                </div>
                            </div>
                        </div>
                    </div>
            `;
			} else {
				return `
                    <div class="col-lg-4 col-sm-6">
                        <div class="product-item">
                            <div class="pi-pic">
                                <img style="height: 400px" src="${product.urlImage}" alt="${product.productCode}" />
                                <div class="icon">
                                    <i class="icon_heart_alt text-danger"></i>
                                </div>
                                <ul>
                                    <li class="w-icon active">
                                        <a href="#"><i class="icon_bag_alt"></i></a>
                                    </li>
                                    <li class="quick-view">
                                        <a href="product.html?productId=${product.id}">+ Quick View</a>
                                    </li>
                                </ul>
                            </div>
                            <div class="pi-text">
                                <div class="catagory-name">Towel</div>
                                <a href="product.html?productId=${product.id}">
                                    <h5>${product.productName}</h5>
                                </a>
                                <div class="product-price">
                                    ${product.buyPrice} VNĐ
                                </div>
                            </div>
                        </div>
                    </div>
            `;
			}
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
			getProduct('http://localhost:8080/products');
		} else {
			getProduct(`http://localhost:8080/product-lines/${vProductLineId}/products`);
		}
	}

	// Lọc theo giá
	function onFilterByPriceClick() {
		let vMinValue = $('#minamount').val();
		let vMaxValue = $('#maxamount').val();
		getProduct(
			`http://localhost:8080/products/price?minPrice=${vMinValue}&maxPrice=${vMaxValue}`,
		);
	}
});
