$(document).ready(() => {
  // table product
  const G_URL_COLUMN = 1;
  const G_ACTION_COLUMN = 10;
  const G_BUY_PRICE_COLUMN = 4;
  const G_BASE_URL = `http://localhost:8080/api`;

  let gProductTable = $('#table-product').DataTable({
    columns: [
      { data: 'id' },
      { data: 'urlImage' },
      { data: 'productName' },
      { data: 'productCode' },
      { data: 'buyPrice' },
      { data: 'productDescription' },
      { data: 'productScale' },
      { data: 'productVendor' },
      { data: 'quantityInStock' },
      { data: 'isRelated' },
      { data: 'Action' },
    ],
    columnDefs: [
      {
        targets: G_URL_COLUMN,
        render: (paramUrl) =>
          `<img class="style-img" src="${paramUrl}" alt="product" width="500" height="600">`,
      },
      {
        targets: G_BUY_PRICE_COLUMN,
        render: (pBuyPrice) => `<p>${pBuyPrice.toLocaleString()} VNĐ </p>`,
      },
      {
        targets: G_ACTION_COLUMN,
        defaultContent: `<i class="text-primary fas fa-edit"></i> 
                | <i class="text-danger fas fa-trash-alt"></i>`,
      },
    ],
  });

  // khai báo biến

  let gProduct = {
    db: '',
    checkProductCode(paramProductCode) {
      return this.db.some((product) => product.productCode == paramProductCode);
    },
  };
  let gUserToken = getCookie('user');
  let gProductId = 0;
  let gProductLineId = 0;
  getProductLine();
  getProductData();

  // add even listener
  $('#btn-create-product').click(onCreateProductClick);
  $('#table-product').on('click', '.fa-edit', onUpdateProductClick);
  $('#s-product-line').change((e) => (gProductLineId = e.target.value));
  $('#btn-save-product').click(onSaveProductClick);
  $('#btn-delete-all').click(onDeleteAllProductClick);
  $('#table-product').on('click', '.fa-trash-alt', onDeleteProductClick);
  $('#btn-confirm-delete').click(onConfirmDeleteClick);

  // confirm delete
  function onConfirmDeleteClick() {
    if (gProductId == 0) {
      deleteAllProduct();
    } else {
      deleteProductById();
    }
  }

  // delete product by id
  function deleteProductById() {
    $.ajax({
      url: `${G_BASE_URL}/products/${gProductId}`,
      method: `delete`,
      headers: { Authorization: `Token ${gUserToken}` },
      success: () => {
        alert('Đã sản phẩm thành công');
        $('#modal-confirm-delete').modal('hide');
        getProductData();
      },
      error: (e) => alert(`Bạn không có quyền thực hiện thao tác này`),
    });
  }

  // delete all product
  function deleteAllProduct() {
    $.ajax({
      url: `${G_BASE_URL}/products`,
      method: `delete`,
      headers: { Authorization: `Token ${gUserToken}` },
      success: () => {
        alert('Đã xóa tất cả sản phẩm thành công');
        $('#modal-confirm-delete').modal('hide');
        getProductData();
      },
      error: (e) => alert(`Bạn không có quyền thực hiện thao tác này`),
    });
  }

  // delete all product click
  function onDeleteAllProductClick() {
    gProductId = 0;
    $('#modal-confirm-delete').modal('show');
  }

  // delete product click
  function onDeleteProductClick() {
    $('#modal-confirm-delete').modal('show');
    let vSelectedRow = $(this).parents('tr');
    let vSelectedData = gProductTable.row(vSelectedRow).data();
    gProductId = vSelectedData.id;
  }

  // save product
  function onSaveProductClick() {
    let vNewProduct = {
      productCode: $('#inp-code').val().trim(),
      productName: $('#inp-name').val().trim(),
      productDescription: $('#inp-description').val().trim(),
      productScale: $('#inp-scale').val().trim(),
      productVendor: $('#inp-vendor').val().trim(),
      quantityInStock: $('#inp-storage').val().trim(),
      buyPrice: $('#inp-price').val().trim(),
      urlImage: $('#inp-url').val().trim(),
      isRelated: $('#inp-related').val(),
    };
    setTrueFalse(vNewProduct);
    if (validateProduct(vNewProduct)) {
      if (gProductId == 0) {
        saveNewProduct(vNewProduct);
      } else {
        updateExistProduct(vNewProduct);
      }
    }
  }

  // set true false cho isRelated
  function setTrueFalse(pNewProduct) {
    if (pNewProduct.isRelated == 0 || pNewProduct.isRelated == 'false') {
      pNewProduct.isRelated = false;
    } else {
      pNewProduct.isRelated = true;
    }
  }

  // save new product
  function saveNewProduct(paramProduct) {
    $.ajax({
      url: `${G_BASE_URL}/product-lines/${gProductLineId}/products`,
      method: 'POST',
      headers: { Authorization: `Token ${gUserToken}` },
      data: JSON.stringify(paramProduct),
      contentType: 'application/json; charset=utf-8',
      success: (response) => {
        alert(`Thành công thêm mới sản phẩm`);
        getProductData();
        $('#modal-create-product').modal('hide');
      },
      error: (e) => alert(e.responseText),
    });
  }

  // update product
  function updateExistProduct(paramProduct) {
    $.ajax({
      url: `${G_BASE_URL}/products/${gProductId}`,
      method: 'PUT',
      data: JSON.stringify(paramProduct),
      headers: { Authorization: `Token ${gUserToken}` },
      contentType: 'application/json; charset=utf-8',
      success: (response) => {
        alert(`Thành công cập nhật sản phẩm`);
        getProductData();
        $('#modal-create-product').modal('hide');
      },
      error: (e) => alert(e.responseText),
    });
  }

  // validate product
  function validateProduct(paramProduct) {
    let vResult = true;
    try {
      if (gProductId == 0) {
        if (gProduct.checkProductCode(paramProduct.productCode)) {
          vResult = false;
          throw '100. Đã có mã sản phẩm';
        }
        if (gProductLineId == 0) {
          vResult = false;
          throw '200. Chọn loại sản phẩm mới thêm sản phẩm vào để phân loại';
        }
      }
      if (paramProduct.productCode == '') {
        vResult = false;
        throw '101. Chưa nhập mã sản phẩm';
      }
      if (paramProduct.productName == '') {
        vResult = false;
        throw '102. Chưa nhập tên sản phẩm';
      }
      if (paramProduct.productScale == '') {
        vResult = false;
        throw '103. Chưa nhập chiến lược cho sản phẩm';
      }
      if (paramProduct.productVendor == '') {
        vResult = false;
        throw '104. Chưa nhập nhà sản xuất sản phẩm';
      }
      if (paramProduct.quantityInStock == '') {
        vResult = false;
        throw '105. Chưa nhập số lượng sản phẩm nhập vào';
      }
      if (paramProduct.buyPrice == '') {
        vResult = false;
        throw '106. Chưa nhập giá thành sản phẩm';
      }
      if (paramProduct.urlImage == '') {
        vResult = false;
        throw '107. Chưa nhập link hình ảnh sản phẩm';
      }
    } catch (error) {
      $('#modal-error').modal('show');
      $('#error').text(error);
    }
    return vResult;
  }

  // create product
  function onCreateProductClick() {
    $('#modal-create-product').modal('show');
    gProductId = 0;
    resetInput();
    $('#s-product-line').prop('disabled', false);
  }

  // update product
  function onUpdateProductClick() {
    $('#modal-create-product').modal('show');
    let vSelectedRow = $(this).parents('tr');
    let vSelectedData = gProductTable.row(vSelectedRow).data();
    gProductId = vSelectedData.id;
    $('#s-product-line').prop('disabled', true);
    $.get(`${G_BASE_URL}/products/${gProductId}`, loadProductToInput);
  }

  // load product to input
  function loadProductToInput(paramProduct) {
    $('#s-product-line').val(0);
    $('#inp-url').val(paramProduct.urlImage);
    $('#inp-name').val(paramProduct.productName);
    $('#inp-code').val(paramProduct.productCode);
    $('#inp-price').val(paramProduct.buyPrice);
    $('#inp-description').val(paramProduct.productDescription);
    $('#inp-scale').val(paramProduct.productScale);
    $('#inp-vendor').val(paramProduct.productVendor);
    $('#inp-storage').val(paramProduct.quantityInStock);
    $('#inp-related').val(paramProduct.isRelated);
  }

  // reset input
  function resetInput() {
    $('#s-product-line').val(0);
    $('#inp-url').val('');
    $('#inp-name').val('');
    $('#inp-code').val('');
    $('#inp-price').val('');
    $('#inp-description').val('');
    $('#inp-scale').val('');
    $('#inp-vendor').val('');
    $('#inp-storage').val('');
    $('#inp-related').val(0);
  }

  // render table
  function renderProductTable(paramProduct) {
    gProductTable.clear();
    gProductTable.rows.add(paramProduct);
    gProductTable.draw();
  }

  // get Product
  function getProductData() {
    $.ajax({
      url: `${G_BASE_URL}/products`,
      method: 'GET',
      dataType: 'json',
      async: false,
      success: (response) => {
        (gProduct.db = response), renderProductTable(gProduct.db);
      },
      error: (e) => alert(e.responseText),
    });
  }

  // get product line
  function getProductLine() {
    $.get(`${G_BASE_URL}/product-lines`, (response) => {
      let vSelectElement = $('#s-product-line');
      response.forEach((productLine) => {
        $('<option>', {
          text: productLine.productLine,
          value: productLine.id,
        }).appendTo(vSelectElement);
      });
    });
  }

  // log out
  // add event listener
  $(document).on('click', '.btn-log-out', onLogoutClick);

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
