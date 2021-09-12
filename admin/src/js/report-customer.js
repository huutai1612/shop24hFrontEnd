$(document).ready(function () {
    let gUrl = `http://localhost:8080/customers/count-orders`;

    $('#btn-filter').click(filterCustomerOrder);

    // filter customer
    function filterCustomerOrder() {
        let vFilterValue = {
            firstDate: $('#inp-first-date').val(),
            lastDate: $('#inp-last-date').val(),
        };
        if (validateFilterValue(vFilterValue)) {
            gUrl = `http://localhost:8080/customers/filter-count-orders?firstDate=${vFilterValue.firstDate}&lastDate=${vFilterValue.lastDate}`;
            getToTalOrderOfCustomer(gUrl);
        }
    }

    function validateFilterValue(pOrderFilter) {
        let vResult = true;
        try {
            if (pOrderFilter.firstDate == '') {
                vResult = false;
                throw '100. Cần có ngày băt đầu';
            }
            if (pOrderFilter.lastDate == '') {
                vResult = false;
                throw '101. Cần có ngày kết thúc';
            }
        } catch (error) {
            $('#modal-error').modal('show');
            $('#error').text(error);
        }
        return vResult;
    }

    // get total order of customer
    function getToTalOrderOfCustomer(paramUrl) {
        $.ajax({
            url: paramUrl,
            method: 'get',
            dataType: 'JSON',
            success: renderChart,
            error: (e) => alert(e.responseText),
        });
    }

    // render chart
    function renderChart(paramOrder) {
        let vAreaChartData = {
            labels: getCustomerName(paramOrder),
            datasets: [
                {
                    label: 'Số order',
                    backgroundColor: 'rgba(60,141,188,0.9)',
                    borderColor: 'rgba(60,141,188,0.8)',
                    pointRadius: false,
                    pointColor: '#3b8bba',
                    pointStrokeColor: 'rgba(60,141,188,1)',
                    pointHighlightFill: '#fff',
                    pointHighlightStroke: 'rgba(60,141,188,1)',
                    data: getTotalOrder(paramOrder),
                },
            ],
        };
        vAreaChartData.datasets[0].data.push(0);

        let vBarChartCanvas = $('#customer-chart').get(0).getContext('2d');
        let vBarChartData = $.extend(true, {}, vAreaChartData);
        let temp0 = vAreaChartData.datasets[0];
        vBarChartData.datasets[0] = temp0;

        let vBarChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            datasetFill: false,
        };

        new Chart(vBarChartCanvas, {
            type: 'bar',
            data: vBarChartData,
            options: vBarChartOptions,
        });
    }

    // get customer name
    function getCustomerName(paramCustomer) {
        return paramCustomer.map((customer) => customer.fullName);
    }

    // get total order
    function getTotalOrder(paramOrder) {
        return paramOrder.map((order) => order.totalOrder);
    }

    // signout
    const userCookie = getCookie('user');
    let urlInfo = 'http://42.115.221.44:8080/devcamp-auth/users/me';

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
