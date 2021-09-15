$(document).ready(() => {
    // khai bao table
    const G_ACTION_COLUMN = 11;
    let gCustomerTable = $('#table-customer').DataTable({
        columns: [
            { data: 'id' },
            { data: 'firstName' },
            { data: 'lastName' },
            { data: 'phoneNumber' },
            { data: 'address' },
            { data: 'state' },
            { data: 'city' },
            { data: 'country' },
            { data: 'postalCode' },
            { data: 'salesRepEmployeeNumber' },
            { data: 'creditLimit' },
            { data: 'Action' },
        ],
        columnDefs: [
            {
                targets: G_ACTION_COLUMN,
                defaultContent: `<i class="text-primary fas fa-user-edit"></i>`,
            },
        ],
    });
    let gCustomerId = 0;

    //add event listener
    $('#btn-create-customer').click(onCreateNewCustomerClick);
    $('#table-customer').on('click', '.fa-user-edit', onUpdateCustomerClick);
    $('#btn-save-customer').click(onSaveCustomerClick);

    getCustomerData();

    // save customer
    function onSaveCustomerClick() {
        let vNewCustomer = {
            lastName: $('#inp-last-name').val().trim(),
            firstName: $('#inp-first-name').val().trim(),
            phoneNumber: $('#inp-phone').val().trim(),
            address: $('#inp-address').val().trim(),
            city: $('#inp-city').val().trim(),
            state: $('#inp-state').val().trim(),
            postalCode: $('#inp-postal-code').val().trim(),
            country: $('#inp-country').val().trim(),
            salesRepEmployeeNumber: $('#inp-sale-rep').val().trim(),
            creditLimit: $('#inp-credit').val().trim(),
        };
        if (validateCustomer(vNewCustomer)) {
            if (gCustomerId == 0) {
                createNewCustomer(vNewCustomer);
            } else {
                updateCustomer(vNewCustomer);
            }
        }
    }

    // create customer
    function createNewCustomer(paramCustomer) {
        $.ajax({
            url: `http://localhost:8080/customers`,
            method: 'POST',
            data: JSON.stringify(paramCustomer),
            contentType: 'application/json; charset=utf-8 ',
            success: () => {
                alert('Đã tạo khách hàng mới thành công');
                getCustomerData();
                $('#modal-update-customer').modal('hide');
            },
            error: (e) => alert(e.responseText),
        });
    }

    // update customer
    function updateCustomer(paramCustomer) {
        $.ajax({
            url: `http://localhost:8080/customers/${gCustomerId}`,
            method: 'PUT',
            data: JSON.stringify(paramCustomer),
            contentType: 'application/json; charset=utf-8 ',
            success: () => {
                alert('Đã cập nhật thông tin khách hàng thành công');
                getCustomerData();
                $('#modal-update-customer').modal('hide');
            },
            error: (e) => alert(e.responseText),
        });
    }

    // validate customer
    function validateCustomer(paramCustomer) {
        let vResult = true;
        try {
            if (paramCustomer.firstName == '') {
                vResult = false;
                throw '100. Họ không được để trống';
            }
            if (paramCustomer.lastName == '') {
                vResult = false;
                throw '101. Tên không được để trống';
            }
            if (paramCustomer.phoneNumber.length < 10) {
                vResult = false;
                throw '103. Số điện thoại không đúng định dạng 10 số hoặc trống';
            }
            if (paramCustomer.address == '') {
                vResult = false;
                throw '104. Địa chỉ không được để trống';
            }
            if (paramCustomer.city == '') {
                vResult = false;
                throw '105. Thành phố không được để trống';
            }
            if (paramCustomer.state == '') {
                vResult = false;
                throw '106. Tỉnh không được để trống';
            }
        } catch (error) {
            $('#modal-error').modal('show');
            $('#error').text(error);
        }
        return vResult;
    }

    // create customer
    function onCreateNewCustomerClick() {
        gCustomerId = 0;
        $('#modal-update-customer').modal('show');
        resetInput();
    }

    // update Customer
    function onUpdateCustomerClick() {
        let vSelectedRow = $(this).parents('tr');
        let vSelectedData = gCustomerTable.row(vSelectedRow).data();
        gCustomerId = vSelectedData.id;
        $('#modal-update-customer').modal('show');
        $.get(`http://localhost:8080/customers/${gCustomerId}`, loadCustomerToInput);
    }

    // load customer to input
    function loadCustomerToInput(paramCustomer) {
        $('#inp-first-name').val(paramCustomer.firstName);
        $('#inp-last-name').val(paramCustomer.lastName);
        $('#inp-phone').val(paramCustomer.phoneNumber);
        $('#inp-address').val(paramCustomer.address);
        $('#inp-state').val(paramCustomer.state);
        $('#inp-city').val(paramCustomer.city);
        $('#inp-country').val(paramCustomer.country);
        $('#inp-postal-code').val(paramCustomer.postalCode);
        $('#inp-sale-rep').val(paramCustomer.salesRepEmployeeNumber);
        $('#inp-credit').val(paramCustomer.creditLimit);
    }

    // reset input
    function resetInput() {
        $('#inp-first-name').val('');
        $('#inp-last-name').val('');
        $('#inp-phone').val('');
        $('#inp-address').val('');
        $('#inp-state').val('');
        $('#inp-city').val('');
        $('#inp-country').val('');
        $('#inp-postal-code').val('');
        $('#inp-sale-rep').val('');
        $('#inp-credit').val('');
    }

    // get data for table
    function getCustomerData() {
        $.ajax({
            url: `http://localhost:8080/customers`,
            method: 'GET',
            dataType: 'json',
            success: renderCustomerTable,
            error: (e) => alert(e.responseText),
        });
    }

    // render table
    function renderCustomerTable(paramCustomer) {
        gCustomerTable.clear();
        gCustomerTable.rows.add(paramCustomer);
        gCustomerTable.draw();
    }

    // log out
    // add event listener
    $(document).on('click', '.btn-log-out', onLogoutClick);

    let gUserToken = getCookie('user');

    // check user cookie
    if (gUserToken) {
        $.ajax({
            url: `http://localhost:8080/user-info`,
            method: 'get',
            headers: { Authorization: `Token ${gUserToken}` },
            dataType: 'json',
            success: handleUser,
            error: (e) => console.log(e.responseText),
        });
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
