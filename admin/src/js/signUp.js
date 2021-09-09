$(document).ready(() => {
    let gNewUser = {
        firstname: '',
        lastname: '',
        email: '',
        password: '',
    };

    $('#btn-sign-up').click(userSignUp);

    function userSignUp() {
        gNewUser.firstname = $('#input-firstname').val();
        gNewUser.lastname = $('#input-lastname').val();
        gNewUser.email = $('#input-email').val();
        gNewUser.password = $('#input-password').val();

        if (validateUser(gNewUser)) {
            $.ajax({
                url: 'http://42.115.221.44:8080/devcamp-auth/users/signup',
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(gNewUser),
                success: function (pRes) {
                    window.location.href = 'signIn.html';
                },
                error: function (pAjaxContext) {
                    $('#modal-error').modal('show');
                    $('#message-error').text(pAjaxContext.responseJSON.message);
                },
            });
        }
    }

    function validateUser(paramUser) {
        let vResult = true;
        try {
            if (paramUser.firstname == '') {
                vResult = false;
                $('#modal-error').modal('show');
                throw 'Bạn chưa nhập first name';
            }
            if (paramUser.lastname == '') {
                vResult = false;
                $('#modal-error').modal('show');
                throw 'Bạn chưa nhập last name';
            }
            if (paramUser.email == '') {
                vResult = false;
                $('#modal-error').modal('show');
                throw 'Bạn chưa nhập email';
            }
            if (!validateEmail(paramUser.email)) {
                vResult = false;
                $('#modal-error').modal('show');
                throw 'Bạn chưa nhập sai định dạng email';
            }
            if (paramUser.password == '') {
                vResult = false;
                $('#modal-error').modal('show');
                throw 'Bạn chưa nhập password';
            }
            if (paramUser.password != $('#input-confirm-password').val()) {
                vResult = false;
                $('#modal-error').modal('show');
                throw 'Password không trùng nhau';
            }
            if (!$('#accept-checkbox').is(':checked')) {
                vResult = false;
                $('#modal-error').modal('show');
                throw 'Bạn chưa đồng ý với điều kiện';
            }
        } catch (error) {
            $('#message-error').text(error);
        }
        return vResult;
    }

    function validateEmail(email) {
        const re =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
});
