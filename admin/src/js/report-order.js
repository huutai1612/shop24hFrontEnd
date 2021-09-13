$(document).ready(() => {
    // add event listener
    $('#btn-day').click(selectValueToGetPaymentDate);
    $('#btn-week').click(onGetWeekPaymentReport);
    $('#btn-month').click(onGetMonthPaymentReport);
    $('#btn-filter-date').click(onGetPaymentDateReportClick);
    // get payment
    function selectValueToGetPaymentDate() {
        $('#modal-date-range').modal('show');
    }

    // get payment
    function onGetPaymentDateReportClick() {
        let vDateRange = {
            firstDate: $('#inp-first-date').val(),
            lastDate: $('#inp-last-date').val(),
        };
        if (validateDate(vDateRange)) {
            $.ajax({
                url: `http://localhost:8080/payments/dates/${vDateRange.firstDate}/${vDateRange.lastDate}`,
                method: 'get',
                dataType: 'JSON',
                success: renderChartByDate,
                error: (e) => alert(e.responseText),
            });
        }
        $('#modal-date-range').modal('hide');
    }

    // validate date
    function validateDate(paramDate) {
        let vResult = true;
        try {
            if (paramDate.firstDate == '') {
                vResult = false;
                throw '100. Ngày bắt đầu không được dể trống';
            }
            if (paramDate.lastDate == '') {
                vResult = false;
                throw '100. Ngày kết thúc không được dể trống';
            }
        } catch (error) {
            $('#modal-error').modal('show');
            $('#error').text(error);
        }
        return vResult;
    }

    // lấy theo tuần
    function onGetWeekPaymentReport() {
        $.ajax({
            url: `http://localhost:8080/payments/weeks`,
            method: 'get',
            dataType: 'JSON',
            success: renderChartByWeek,
            error: (e) => alert(e.responseText),
        });
    }

    // lấy theo tháng
    function onGetMonthPaymentReport() {
        $.ajax({
            url: `http://localhost:8080/payments/months`,
            method: 'get',
            dataType: 'JSON',
            success: renderChartByMonth,
            error: (e) => alert(e.responseText),
        });
    }

    // render chart theo ngày
    function renderChartByDate(paramPayment) {
        $('#payment-chart').remove();
        $('.chart').append(`<canvas id="payment-chart"
        style="
            min-height: 250px;
            height: 250px;
            max-height: 250px;
            max-width: 100%;
        "
        ></canvas>`);
        let vAreaChartData = {
            labels: getPaymentDate(paramPayment),
            datasets: [
                {
                    label: 'Tổng thu nhập',
                    backgroundColor: 'rgba(60,141,188,0.9)',
                    borderColor: 'rgba(60,141,188,0.8)',
                    pointRadius: false,
                    pointColor: '#3b8bba',
                    pointStrokeColor: 'rgba(60,141,188,1)',
                    pointHighlightFill: '#fff',
                    pointHighlightStroke: 'rgba(60,141,188,1)',
                    data: getTotalIncome(paramPayment),
                },
            ],
        };

        let vBarChartCanvas = $('#payment-chart').get(0).getContext('2d');
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

    // render char theo tuần
    function renderChartByWeek(paramPayment) {
        $('#payment-chart').remove();
        $('.chart').append(`<canvas id="payment-chart"
        style="
            min-height: 250px;
            height: 250px;
            max-height: 250px;
            max-width: 100%;
        "
        ></canvas>`);
        let vAreaChartData = {
            labels: getPaymentWeek(paramPayment),
            datasets: [
                {
                    label: 'Tổng thu nhập',
                    backgroundColor: 'rgba(60,141,188,0.9)',
                    borderColor: 'rgba(60,141,188,0.8)',
                    pointRadius: false,
                    pointColor: '#3b8bba',
                    pointStrokeColor: 'rgba(60,141,188,1)',
                    pointHighlightFill: '#fff',
                    pointHighlightStroke: 'rgba(60,141,188,1)',
                    data: getTotalIncome(paramPayment),
                },
            ],
        };
        let vBarChartCanvas = $('#payment-chart').get(0).getContext('2d');
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

    // render char theo tháng
    function renderChartByMonth(paramPayment) {
        $('#payment-chart').remove();
        $('.chart').append(`<canvas id="payment-chart"
        style="
            min-height: 250px;
            height: 250px;
            max-height: 250px;
            max-width: 100%;
        "
        ></canvas>`);
        let vAreaChartData = {
            labels: getPaymentMonth(paramPayment),
            datasets: [
                {
                    label: 'Tổng thu nhập',
                    backgroundColor: 'rgba(60,141,188,0.9)',
                    borderColor: 'rgba(60,141,188,0.8)',
                    pointRadius: false,
                    pointColor: '#3b8bba',
                    pointStrokeColor: 'rgba(60,141,188,1)',
                    pointHighlightFill: '#fff',
                    pointHighlightStroke: 'rgba(60,141,188,1)',
                    data: getTotalIncome(paramPayment),
                },
            ],
        };
        let vBarChartCanvas = $('#payment-chart').get(0).getContext('2d');
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

    // getPaymentDate
    function getPaymentDate(paramPayment) {
        return paramPayment.map((payment) => payment.paymentDate);
    }

    // get week payment
    function getPaymentWeek(paramPayment) {
        return paramPayment.map((payment) => payment.week);
    }

    // get month payment
    function getPaymentMonth(paramPayment) {
        return paramPayment.map((payment) => payment.month);
    }

    // getTotalIncome
    function getTotalIncome(paramPayment) {
        return paramPayment.map((payment) => payment.total);
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
