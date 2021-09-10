$(document).ready(function () {
    let gUrl = `http://localhost:8080/api/customers/count-orders`;

    $('#btn-filter').click(filterCustomerOrder);

    function filterCustomerOrder() {
        let vFilterValue = {
            min: $('#inp-min').val().trim(),
            max: $('#inp-max').val().trim(),
        };
        if (vFilterValue.min == '' || vFilterValue.max == '') {
            alert('Phải có giá trị để lọc customer');
            gUrl = `http://localhost:8080/api/customers/count-orders`;
            getOrderByCustomer(gUrl);
        } else {
            gUrl = `http://localhost:8080/api/customers/filter-count-orders?min=${vFilterValue.min}&max=${vFilterValue.max}`;
            getOrderByCustomer(gUrl);
        }
    }

    // get total order by customer inf
    function getOrderByCustomer(paramUrl) {
        $.ajax({
            url: paramUrl,
            method: 'get',
            dataType: 'JSON',
            success: renderChart,
            error: (e) => alert(e.responseText),
        });
    }
    getOrderByCustomer(gUrl);

    // render chart
    function renderChart(paramOrder) {
        var bar_data = {
            data: getTotalOrder(paramOrder),
            bars: { show: true },
        };
        $.plot('#bar-chart', [bar_data], {
            grid: {
                borderWidth: 1,
                borderColor: '#f3f3f3',
                tickColor: '#f3f3f3',
            },
            series: {
                bars: {
                    show: true,
                    barWidth: 0.5,
                    align: 'center',
                },
            },
            colors: ['#3c8dbc'],
            xaxis: {
                ticks: getCustomerName(paramOrder),
                labelWidth: 1,
            },
        });
    }

    // get customer name
    function getCustomerName(paramCustomer) {
        return paramCustomer.map((customer, index) => [
            index,
            customer.fullName,
        ]);
    }

    // get total order
    function getTotalOrder(paramOrder) {
        return paramOrder.map((order, index) => [index, order.totalOrder]);
    }

    // signout
    const userCookie = getCookie('user');
    var urlInfo = 'http://42.115.221.44:8080/devcamp-auth/users/me';

    $.ajax({
        url: urlInfo,
        method: 'GET',
        headers: { Authorization: 'Bearer ' + userCookie },
        success: function (responseObject) {
            displayUser(responseObject);
        },
        error: function (xhr) {
            console.log(xhr);
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
    }
});
