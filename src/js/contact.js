$(document).ready(() => {
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
})