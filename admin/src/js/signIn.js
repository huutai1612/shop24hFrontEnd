$(document).ready(() => {
    $('#btn-login').click(onLoginClick);

    const userCookie = getCookie('user');

    if (userCookie) {
        window.location.href = 'index.html';
    }

    function onLoginClick() {
        let gEmail = $('#input-email').val().trim();
        let gPassword = $('#input-password').val().trim();
        if (validateUser(gEmail, gPassword)) {
            signInForm(gEmail, gPassword);
        }
    }

    function signInForm(paramEmail, paramPassword) {
        let vFormData = new FormData();
        vFormData.append('email', paramEmail);
        vFormData.append('password', paramPassword);
        $.ajax({
            method: 'POST',
            url: 'http://42.115.221.44:8080/devcamp-auth/users/signin',
            data: vFormData,
            contentType: false,
            cache: false,
            processData: false,
            success: responseHandler,
            error: (error) => {
                $('#modal-error').modal('show');
                $('#message-error').text(error.responseJSON.message);
            },
        });
    }

    // handle response
    function responseHandler(res) {
        setCookie('user', res.token, 1);
        window.location.href = 'index.html';
    }

    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
        var expires = 'expires=' + d.toUTCString();
        document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
    }

    //Hàm get Cookie đã giới thiệu ở bài trước
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

    // validate user
    function validateUser(paramEmail, paramPassword) {
        let vResult = true;
        try {
            if (paramEmail == '') {
                $('#modal-error').modal('show');
                vResult = false;
                throw 'Bạn chưa nhập email';
            }
            if (!validateEmail(paramEmail)) {
                $('#modal-error').modal('show');
                vResult = false;
                throw 'Bạn đã nhập sai định dạng email';
            }
            if (paramPassword == '') {
                $('#modal-error').modal('show');
                vResult = false;
                throw 'Bạn đã chưa nhập password';
            }
        } catch (error) {
            $('#message-error').text(error);
        }
        return vResult;
    }

    // validate email
    function validateEmail(email) {
        const re =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
});
