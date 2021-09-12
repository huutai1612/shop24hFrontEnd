$(document).ready(() => {
    let gUrlString = new URL(window.location.href);
    let gOrderId = gUrlString.searchParams.get('orderId');
    const G_COLUMN_NAME = 1;
    const G_COLUMN_CODE = 2;
    const G_COLUMN_IMG = 3;
    getOrderDetail();

    let gTableOrderDetail = $('#table-order-detail').DataTable({
        columns: [
            { data: 'orderId' },
            { data: 'productId' },
            { data: 'productId' },
            { data: 'productId' },
            { data: 'priceEach' },
            { data: 'quantity' },
        ],
        columnDefs: [
            {
                targets: G_COLUMN_NAME,
                render: (productId) => {
                    let vProductData = '';
                    $.ajax({
                        url: `http://localhost:8080/products/${productId}`,
                        dataType: 'json',
                        method: 'get',
                        async: false,
                        success: (response) => (vProductData = response),
                        error: (e) => alert(e.responseText),
                    });
                    return getProductName(vProductData);
                },
            },
            {
                targets: G_COLUMN_CODE,
                render: (productId) => {
                    let vProductData = '';
                    $.ajax({
                        url: `http://localhost:8080/products/${productId}`,
                        dataType: 'json',
                        method: 'get',
                        async: false,
                        success: (response) => (vProductData = response),
                        error: (e) => alert(e.responseText),
                    });
                    return getProductCode(vProductData);
                },
            },
            {
                targets: G_COLUMN_IMG,
                render: (productId) => {
                    let vProductData = '';
                    $.ajax({
                        url: `http://localhost:8080/products/${productId}`,
                        dataType: 'json',
                        method: 'get',
                        async: false,
                        success: (response) => (vProductData = response),
                        error: (e) => alert(e.responseText),
                    });
                    return getProductImg(vProductData);
                },
            },
        ],
    });

    // get order detail
    function getOrderDetail() {
        $.get(
            `http://localhost:8080/orders/${gOrderId}/order-details`,
            renderTable
        );
    }

    // rendertable
    function renderTable(paramOrderDetail) {
        gTableOrderDetail.clear();
        gTableOrderDetail.rows.add(paramOrderDetail);
        gTableOrderDetail.draw();
    }

    // render product name
    function getProductName(paramProduct) {
        return `<p>${paramProduct.productName}</p>`;
    }

    // render product code
    function getProductCode(paramProduct) {
        return `<p>${paramProduct.productCode}</p>`;
    }

    // render product code
    function getProductImg(paramProduct) {
        return `<img src="${paramProduct.urlImage}" alt="product" width="150" height="200">`;
    }
});
