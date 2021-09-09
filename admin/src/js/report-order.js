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
});
