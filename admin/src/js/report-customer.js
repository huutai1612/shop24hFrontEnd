$(document).ready(function () {
  const G_BASE_URL = `http://localhost:8080/api`;

  let gUrl = `${G_BASE_URL}/customers/count-orders`;

  $('#btn-filter').click(filterCustomerOrder);

  // filter customer
  function filterCustomerOrder() {
    let vFilterValue = {
      firstDate: $('#inp-first-date').val(),
      lastDate: $('#inp-last-date').val(),
    };
    if (validateFilterValue(vFilterValue)) {
      gUrl = `${G_BASE_URL}/customers/filter-count-orders?firstDate=${vFilterValue.firstDate}&lastDate=${vFilterValue.lastDate}`;
      getToTalOrderOfCustomer(gUrl);
    }
  }

  // validate filter value
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
    $('#customer-chart').remove();
    $('.chart').append(`<canvas id="customer-chart"
        style="
            min-height: 250px;
            height: 250px;
            max-height: 250px;
            max-width: 100%;
        "
        ></canvas>`);
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

  // log out
  // add event listener
  $(document).on('click', '.btn-log-out', onLogoutClick);

  let gUserToken = getCookie('user');

  // check user cookie
  if (gUserToken) {
    $.ajax({
      url: `${G_BASE_URL}/user-info`,
      method: 'get',
      headers: { Authorization: `Token ${gUserToken}` },
      dataType: 'json',
      success: handleUser,
      error: (e) => console.log(e.responseText),
    });
  } else {
    window.location.href = `../customer/index.html`;
  }

  // log out
  function onLogoutClick() {
    setCookie('user', '', 1);
    window.location.href = `../customer/index.html`;
  }

  function handleUser() {}

  // get Cookie
  function getCookie(cname) {
    var name = cname + '=';
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  }

  // set cookie
  function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
  }
});
