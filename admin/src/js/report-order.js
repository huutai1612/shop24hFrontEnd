$(document).ready(() => {
    // add event listener
    $('#btn-day').click(getDatePaymentReport);
    $('#btn-week').click(getWeekPaymentReport);
    // get payment
    function getDatePaymentReport() {
        $.ajax({
            url: `http://localhost:8080/api/payments/dates`,
            method: 'get',
            dataType: 'JSON',
            success: renderChartByDate,
            error: (e) => alert(e.responseText),
        });
    }
    getDatePaymentReport();

    function getWeekPaymentReport() {
        $.ajax({
            url: `http://localhost:8080/api/payments/weeks`,
            method: 'get',
            dataType: 'JSON',
            success: renderChartByWeek,
            error: (e) => alert(e.responseText),
        });
    }
    // getWeekPaymentReport();

    function renderChartByWeek(paramPayment) {
        var bar_data = {
            data: getTotalIncome(paramPayment),
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
                ticks: getPaymentWeek(paramPayment),
            },
        });
    }

    function renderChartByDate(paramPayment) {
        var bar_data = {
            data: getTotalIncome(paramPayment),
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
                ticks: getPaymentDate(paramPayment),
            },
        });
    }

    // get week payment
    function getPaymentWeek(paramPayment) {
        return paramPayment.map((payment, index) => [index, `${payment.week}`]);
    }

    // getPaymentDate
    function getPaymentDate(paramPayment) {
        return paramPayment.map((payment, index) => [
            index,
            payment.paymentDate,
        ]);
    }

    // getTotalIncome
    function getTotalIncome(paramPayment) {
        return paramPayment.map((payment, index) => [index, payment.total]);
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
