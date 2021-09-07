$(document).ready(function () {
    let gUrl = `http://localhost:8080/customers/count-orders`;

    $('#btn-filter').click(filterCustomerOrder);

    function filterCustomerOrder() {
        let vFilterValue = {
            min: $('#inp-min').val().trim(),
            max: $('#inp-max').val().trim(),
        };
        if (vFilterValue.min == '' || vFilterValue.max == '') {
            alert('Phải có giá trị để lọc customer');
            gUrl = `http://localhost:8080/customers/count-orders`;
            getOrderByCustomer(gUrl);
        } else {
            gUrl = `http://localhost:8080/customers/filter-count-orders?min=${vFilterValue.min}&max=${vFilterValue.max}`;
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
