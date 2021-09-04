// TODO: refracotring api
$(document).ready(() => {
	// add event listener
	$(".filter-catagories").on("click", "a", onFilterProductLineClick);
	$(".filter-btn").click(onFilterByPriceClick);
	$(".product-content").on("click", ".add-cart", onAddCartClick);
	let gProductIdArray = [];

	// getproduct
	function getProduct(paramUrl) {
		$.ajax({
			url: paramUrl,
			method: "GET",
			dataType: "json",
			success: renderProduct,
			error: (e) => alert(e.responseJSON.message),
		});
	}
	getProduct("http://localhost:8080/products");

	function renderProduct(paramProduct) {
		let vProductContentElement = $(".product-content");

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
                                        <a data-id="${product.id}" class="add-cart" href="#"><i class="icon_bag_alt"></i></a>
                                    </li>
                                    <li class="quick-view">
                                        <a href="product.html?productId=${product.id}">Xem sản phẩm</a>
                                    </li>
                                </ul>
                            </div>
                            <div class="pi-text">
                                <div class="catagory-name">Towel</div>
                                <a class="add-cart" href="product.html?productId=${product.id}">
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
                                        <a data-id="${product.id}" class="add-cart" href="#"><i class="icon_bag_alt"></i></a>
                                    </li>
                                    <li class="quick-view">
                                        <a href="product.html?productId=${product.id}">Xem sản phẩm</a>
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
		$.get("http://localhost:8080/product-lines", loadProductLineToFilter);
	})();

	// lọc theo giới tính
	function loadProductLineToFilter(paramProductLine) {
		let vResult = paramProductLine.map((productLine) => {
			return `<li><a data-id="${productLine.id}" href="#">${productLine.productLine}</a></li>`;
		});
		$(".filter-catagories").append(vResult);
	}

	function onFilterProductLineClick(e) {
		e.preventDefault();
		let vProductLineId = $(this).data("id");
		if (vProductLineId == 0) {
			getProduct("http://localhost:8080/products");
		} else {
			getProduct(
				`http://localhost:8080/product-lines/${vProductLineId}/products`
			);
		}
	}

	// Lọc theo giá
	function onFilterByPriceClick() {
		let vMinValue = $("#minamount").val();
		let vMaxValue = $("#maxamount").val();
		getProduct(
			`http://localhost:8080/products/price?minPrice=${vMinValue}&maxPrice=${vMaxValue}`
		);
	}

	// add cart
	function onAddCartClick(e) {
		e.preventDefault();
		// set cart number
		let productNumber = localStorage.getItem("cartNumbers");
		productNumber = parseInt(productNumber);
		if (productNumber) {
			localStorage.setItem("cartNumbers", ++productNumber);
			$(".cart-icon span").text(productNumber);
		} else {
			localStorage.setItem("cartNumbers", 1);
			$(".cart-icon span").text(1);
		}

		// set product id
		let vProductId = $(this).data("id");

		let vProduct = JSON.parse(localStorage.getItem("products"));
		if (vProduct) {
			gProductIdArray = vProduct;
		}
		gProductIdArray.push(vProductId);
		let vFlatProductArray = [...new Set(gProductIdArray)];
		localStorage.setItem("products", JSON.stringify(vFlatProductArray));

		$(".select-items tbody").html("");
		loadProductToCart();
	}

	// on load cart number function
	function onLoadCartNumber() {
		let productNumber = localStorage.getItem("cartNumbers");
		if (productNumber) {
			$(".cart-icon span").text(productNumber);
		}
	}
	onLoadCartNumber();

	// function load cart product
	function loadProductToCart() {
		let vProduct = JSON.parse(localStorage.getItem("products"));
		if (vProduct) {
			vProduct.forEach((productId, index) => {
				$.ajax({
					url: `http://localhost:8080/products/${productId}`,
					method: "get",
					dataType: "json",
					success: (product) => {
						renderProductToCart(product, index);
					},
					error: (e) => alert(e.responseText),
				});
			});
		}
	}
	loadProductToCart();

	// render product to cart
	function renderProductToCart(paramProduct, paramIndex) {
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
					<p>${paramProduct.buyPrice} VNĐ</p>
					<h6>${paramProduct.productName}</h6>
				</div>
			</td>
			<td class="si-close">
				<i data-index="${paramIndex}" class="ti-close"></i>
			</td>
		</tr>
		`;
		$(".select-items tbody").append(vResult);
	}

	// delete product
	$(document).on("click", ".ti-close", (e) => {
		let vIndex = parseInt(e.target.dataset.index);
		console.log(vIndex);
		let vProduct = JSON.parse(localStorage.getItem("products"));
		vProduct.splice(vIndex, 1);
		localStorage.setItem("products", JSON.stringify(vProduct));
		let productNumber = localStorage.getItem("cartNumbers");
		productNumber = parseInt(productNumber);
		localStorage.setItem("cartNumbers", --productNumber);
		$(".cart-icon span").text(productNumber);
		$(".select-items tbody").html("");
		loadProductToCart();
	});
});
