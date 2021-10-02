$(document).ready(() => {
  const G_BASE_URL = `http://localhost:8080/api`;

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
        url: `${G_BASE_URL}/payments/dates/${vDateRange.firstDate}/${vDateRange.lastDate}`,
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
      url: `${G_BASE_URL}/payments/weeks`,
      method: 'get',
      dataType: 'JSON',
      success: renderChartByWeek,
      error: (e) => alert(e.responseText),
    });
  }

  // lấy theo tháng
  function onGetMonthPaymentReport() {
    $.ajax({
      url: `${G_BASE_URL}/payments/months`,
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
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            return `${tooltipItem.yLabel / 1000000} triệu`;
          },
        },
      },
      scales: {
        yAxes: [
          {
            ticks: {
              callback: function (label, index, labels) {
                return (label / 1000000).toLocaleString();
              },
            },
            scaleLabel: {
              display: true,
              labelString: 'Đơn vị: triệu VNĐ',
            },
          },
        ],
      },
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
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            return `${tooltipItem.yLabel / 1000000} triệu`;
          },
        },
      },
      scales: {
        yAxes: [
          {
            ticks: {
              callback: function (label, index, labels) {
                return (label / 1000000).toLocaleString();
              },
            },
            scaleLabel: {
              display: true,
              labelString: 'Đơn vị: triệu VNĐ',
            },
          },
        ],
      },
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
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            return `${tooltipItem.yLabel / 1000000} triệu`;
          },
        },
      },
      scales: {
        yAxes: [
          {
            ticks: {
              callback: function (label, index, labels) {
                return (label / 1000000).toLocaleString();
              },
            },
            scaleLabel: {
              display: true,
              labelString: 'Đơn vị: triệu VNĐ',
            },
          },
        ],
      },
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
