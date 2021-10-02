$(document).ready(function () {
  const G_BASE_URL = `http://localhost:8080/api`;
  const G_PRODUCT_COLUMN_NAME = 0;
  const G_PRODUCT_COLUMN_IMG = 1;
  const G_STAR_COLUMN = 3;
  const G_ACTION_COLUMN = 5;
  let gReviewId = 0;

  // khai bao table
  let gReviewTable = $('#table-review').DataTable({
    columns: [
      { data: `productId` },
      { data: `productId` },
      { data: `name` },
      { data: `rateStar` },
      { data: `comments` },
      { data: `Action` },
    ],
    columnDefs: [
      {
        targets: G_PRODUCT_COLUMN_NAME,
        render: (pProductId) => {
          let gProduct = '';
          $.ajax({
            url: `${G_BASE_URL}/products/${pProductId}`,
            method: 'get',
            async: false,
            success: (response) => (gProduct = response),
          });
          return productName(gProduct);
        },
      },
      {
        targets: G_PRODUCT_COLUMN_IMG,
        render: (pProductId) => {
          let gProduct = '';
          $.ajax({
            url: `${G_BASE_URL}/products/${pProductId}`,
            method: 'get',
            async: false,
            success: (response) => (gProduct = response),
          });
          return imgProduct(gProduct);
        },
      },
      {
        targets: G_STAR_COLUMN,
        render: (pStar) => {
          return `<span class="stars ml-2" data-rating="${pStar}" data-num-stars="5" >`;
        },
      },
      {
        targets: G_ACTION_COLUMN,
        defaultContent: `<i class="fas fa-trash-alt text-danger"></i> | <i class=" text-info fas fa-comments"></i>`,
      },
    ],
  });

  $('#select-product').select2({
    theme: 'bootstrap4',
  });

  // get name
  let productName = function getProductName(pProduct) {
    return `<td>${pProduct.productName}</td>`;
  };

  // get img
  let imgProduct = function getProductImg(pProduct) {
    return `<img width="160px" height="160px" src="${pProduct.urlImage}" alt="${pProduct.productCode}"></img>`;
  };

  // add event listener
  $('#select-product').change(onSelectChange);
  $('#table-review').on('click', '.fa-trash-alt', onDeleteReviewClick);
  $('#table-review').on('click', '.fa-comments', onReplyCommentClick);
  $('#btn-confirm-delete').click(onConfirmDeleteClick);
  $('#btn-save-reply').click(onSaveReplyClick);

  // on Load
  onLoadProduct();
  getAllReview();

  // on reply comment click
  function onReplyCommentClick() {
    $('#modal-create-reply').modal('show');
    let vSelectedRow = $(this).parents('tr');
    let vSelectedData = gReviewTable.row(vSelectedRow).data();
    gReviewId = vSelectedData.id;
  }

  // on save reply click
  function onSaveReplyClick() {
    let vReplyComment = {
      replies: $('#inp-reply').val().trim(),
    };
    if (vReplyComment.replies == '') {
      alert(`100. Phải có nội dung để trả lời bình luận `);
    } else {
      $.ajax({
        url: `${G_BASE_URL}/comments/${gReviewId}/replies`,
        method: `POST`,
        data: JSON.stringify(vReplyComment),
        contentType: `application/json; charset=utf-8`,
        success: (res) => {
          alert(`Đã trả lời bình luận`);
          getAllReview();
          $('#inp-reply').val('');
          $('#modal-create-reply').modal('hide');
        },
        error: (e) => alert(e.responseText),
      });
    }
  }

  // function delete review
  function onDeleteReviewClick() {
    let vSelectedRow = $(this).parents('tr');
    let vSelectedData = gReviewTable.row(vSelectedRow).data();
    gReviewId = vSelectedData.id;
    $('#modal-confirm-delete').modal('show');
  }

  // confirm delete click
  function onConfirmDeleteClick() {
    $.ajax({
      url: `${G_BASE_URL}/comments/${gReviewId}`,
      headers: { Authorization: `Token ${gUserToken}` },
      method: `delete`,
      success: () => {
        alert('Bạn đã xóa thành công review');
        $('#modal-confirm-delete').modal('hide');
        getAllReview();
      },
      error: (e) => alert(`Bạn không có quyền thực hiện thao tác này`),
    });
  }

  // select change
  function onSelectChange(e) {
    let vProductId = e.target.value;
    if (vProductId == 0) {
      getAllReview();
    } else {
      $.ajax({
        url: `${G_BASE_URL}/products/${vProductId}/comments`,
        method: 'get',
        async: false,
        dataType: 'json',
        success: renderToTable,
        error: (e) => alert(e.responseText),
      });
    }
  }

  // get All review
  function getAllReview() {
    $.ajax({
      url: `${G_BASE_URL}/comments`,
      method: 'get',
      async: false,
      dataType: 'json',
      success: renderToTable,
      error: (e) => alert(e.responseText),
    });
  }

  // render To Table
  function renderToTable(pResponse) {
    gReviewTable.clear();
    gReviewTable.rows.add(pResponse);
    gReviewTable.draw();
    $(function () {
      $('span.stars').stars();
    });
  }

  // render star
  $.fn.stars = function () {
    return $(this).each(function () {
      const rating = $(this).data('rating');
      const numStars = $(this).data('numStars');
      const fullStar = '<i class="fas fa-star text-warning"></i>'.repeat(
        Math.floor(rating)
      );
      const halfStar =
        rating % 1 !== 0
          ? '<i class="fas fa-star-half-alt text-warning"></i>'
          : '';
      const noStar = '<i class="far fa-star text-warning"></i>'.repeat(
        Math.floor(numStars - rating)
      );
      $(this).html(`${fullStar}${halfStar}${noStar}`);
    });
  };

  // load product khi chay
  function onLoadProduct() {
    $.ajax({
      url: `${G_BASE_URL}/products`,
      method: 'GET',
      async: false,
      dataType: 'json',
      success: loadProductToSelect,
      error: (e) => alert(e.responseText),
    });
  }

  // render product
  function loadProductToSelect(pProduct) {
    let vSelectElement = $('#select-product');
    pProduct.forEach((product) => {
      $('<option>', {
        value: product.id,
        text: product.productCode,
      }).appendTo(vSelectElement);
    });
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
