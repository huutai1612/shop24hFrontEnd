$(document).ready(function () {
    // get total order by customer inf
    function getOrderByCustomer() {
        $.ajax({
            url: `http://localhost:8080/customers/count-orders`,
            method: 'get',
            dataType: 'JSON',
            success: renderChart,
            error: (e) => alert(e.responseText),
        });
    }
    getOrderByCustomer();

    // render chart
    function renderChart(paramOrder) {
        console.log(paramOrder);
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
});
