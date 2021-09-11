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
        var data = [
            {
                data: [
                    [0, 21.51],
                    [1, 32.5],
                    [2, 47.14],
                    [3, 10],
                ],
                stack: 0,
                label: 'Bottom',
            },
            {
                data: [
                    [0, 37.77],
                    [1, 24.65],
                    [2, 7.67],
                    [4, 15],
                ],
                stack: 0,
                label: 'Top',
            },
        ];
        var bar_data = [
            {
                data: getTotalOrder(paramOrder),
                bars: { show: true },
            },
            {
                data: getCustomerName(paramOrder),
                bars: { show: true },
            },
        ];
        let option = {
            grid: {
                borderWidth: 1,
                borderColor: '#f3f3f3',
                tickColor: '#f3f3f3',
                show: true,
                hoverable: true,
            },
            points: {
                show: false,
            },
            series: {
                bars: {
                    show: true,
                    barWidth: 0.5,
                    align: 'center',
                },
            },
            colors: ['#3c8dbc'],
            // xaxis: {
            //     ticks: getCustomerName(paramOrder),
            //     labelWidth: 1,
            // },
        };
        let plot = $.plot('#bar-chart', bar_data, option);
        $('#bar-chart').bind('plothover', function (event, pos, item) {
            $('#tooltip').remove();

            if (item) {
                var plotData = plot.getData();
                var valueString = '';

                for (var i = 0; i < plotData.length; ++i) {
                    var series = plotData[i];
                    for (var j = 0; j < series.data.length; ++j) {
                        if (series.data[j][0] === item.datapoint[0]) {
                            valueString += series.data[j][1] + ' ';
                        }
                    }
                }

                $("<div id='tooltip'>" + valueString + '</div>')
                    .css({
                        position: 'absolute',
                        display: 'none',
                        top: pos.pageY + 5,
                        left: pos.pageX + 5,
                        border: '1px solid #fdd',
                        padding: '2px',
                        'background-color': '#fee',
                        opacity: 0.8,
                    })
                    .appendTo('body')
                    .fadeIn(200);
            }
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
