$(document).ready(() => {
    // lay order id
    let gStringUrl = new URL(window.location.href);
    let gOrderId = gStringUrl.searchParams.get('orderId');

    // table product
    const G_URL_COLUMN = 1;
    const G_QUANTITY_COLUMN = 5;
    const G_ACTION_COLUMN = 6;
    const G_BUY_PRICE_COLUMN = 4;
    let gProductTable = $('#table-product').DataTable({
        columns: [
            { data: 'id' },
            { data: 'urlImage' },
            { data: 'productName' },
            { data: 'productCode' },
            { data: 'buyPrice' },
            { data: 'quantity' },
            { data: 'Action' },
        ],
        columnDefs: [
            {
                targets: G_URL_COLUMN,
                render: (paramUrl) =>
                    `<img class="style-img" src="${paramUrl}" alt="product" width="500" height="600">`,
            },
            {
                targets: G_BUY_PRICE_COLUMN,
                render: (pBuyPrice) => `<p>${pBuyPrice.toLocaleString()} VNĐ </p>`,
            },
            {
                targets: G_QUANTITY_COLUMN,
                defaultContent: `<input type="number" class="form-control inp-quantity">`,
            },
            {
                targets: G_ACTION_COLUMN,
                defaultContent: `<button class="btn btn-dark btn-add-oder-detail" >Add</button>`,
            },
        ],
    });
    getProductData();
    $('.btn-add-oder-detail').click(onAddOrderDetailClick);
    $('#btn-check-order').click(onCheckOrderClick);

    // check order detail
    function onCheckOrderClick() {
        window.location.href = `order-detail.html?orderId=${gOrderId}`;
    }

    // add order detail click
    function onAddOrderDetailClick() {
        let vSelectedRow = $(this).parents('tr');
        let vSelectedData = gProductTable.row(vSelectedRow).data();
        let vProductId = vSelectedData.id;
        let vNewOrderDetail = {
            quantityOrder: vSelectedRow.find('.inp-quantity').val(),
            priceEach: vSelectedData.buyPrice,
        };
        if (validateOrderDetail(vNewOrderDetail)) {
            $.ajax({
                url: `http://localhost:8080/orders/${gOrderId}/products/${vProductId}/order-details`,
                method: 'post',
                data: JSON.stringify(vNewOrderDetail),
                contentType: `application/json; charset=utf-8`,
                success: () => alert(`Đã cập nhật sản phẩm cho order ${gOrderId}`),
                error: (e) => alert(e.responseText),
            });
        }
    }

    // validate order detail
    function validateOrderDetail(paramOrderDetail) {
        let vResult = true;
        try {
            if (paramOrderDetail.quantityOrder == '') {
                vResult = false;
                throw '100. Chưa nhập số lượng sản phẩm';
            }
        } catch (error) {
            alert(error);
        }
        return vResult;
    }

    // render table
    function renderProductTable(paramProduct) {
        gProductTable.clear();
        gProductTable.rows.add(paramProduct);
        gProductTable.draw();
    }

    // get Product
    function getProductData() {
        $.ajax({
            url: 'http://localhost:8080/products',
            method: 'GET',
            dataType: 'json',
            async: false,
            success: (response) => {
                renderProductTable(response);
            },
            error: (e) => alert(e.responseText),
        });
    }

    // signout
    /* const userCookie = getCookie('user');
    var urlInfo = 'http://42.115.221.44:8080/devcamp-auth/users/me';

    $.ajax({
        url: urlInfo,
        method: 'GET',
        headers: { Authorization: 'Bearer ' + userCookie },
        success: function (responseObject) {
            displayUser(responseObject);
        },
        error: function (xhr) {
            // Khi token hết hạn, AJAX sẽ trả về lỗi khi đó sẽ redirect về trang login để người dùng đăng nhập lại
            redirectToLogin();
        },
    });

    function displayUser(paramUser) {}

    function redirectToLogin() {
        // Trước khi logout cần xóa token đã lưu trong cookie
        setCookie('user', '', 1);
        window.location.href = 'signIn.html';
    }

    $('#btn-log-out').click(redirectToLogin);

    function getCookie(cname) {
        let name = cname + '=';
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return '';
    }
    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
        var expires = 'expires=' + d.toUTCString();
        document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
    } */
});
