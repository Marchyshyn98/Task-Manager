/* eslint-disable no-undef*/
$(function () {
    // remove Errors
    function removeErrors() {
        $("form.login p.error, form.register p.error").remove();
        $("form.login input, form.register input").removeClass("error");
    }

    var flag = true;
    $(".switch-button").on("click", function (e) {
        e.preventDefault(); // щоб не відправлявся запит - стандартна настройка

        $("input").val(''); // обнуляємо усі поля при переході між формами
        $("p.error").remove();
        $("input").removeClass("error");

        if (flag) {
            flag = false;
            $(".register").show('slow');
            $(".login").hide();
        } else {
            flag = true;
            $('.login').show('slow');
            $('.register').hide();
        }
    });

    //clear
    $("form.login input, form.register input").on("focus", function () {
        removeErrors();
    }); // коли переключаємось на інпут

    // Реєстрація
    $(".register-button").on("click", function (e) {
        e.preventDefault();
        removeErrors();

        var data = {
            login: $("#register-login").val(),
            password: $("#register-password").val(),
            passwordConfirm: $("#register-password-confirm").val()
        };

        console.log(data);

        $.ajax({
            type: "POST",
            data: JSON.stringify(data), // переводимо js в json формат - в стрічку
            contentType: 'application/json',
            url: "/api/auth/register"
        }).done(function (data) {
            console.log(data);
            if (!data.ok) {
                $(".register h2").after("<p class='error'>" + data.error + "</p>");
                if (data.fields) {
                    data.fields.forEach(function (item) {
                        $("input[name=" + item + "]").addClass("error");
                    });
                }
            } else {
                location.reload();
            }
        });
    });

    // Авторизація
    $(".login-button").on("click", function (e) {
        e.preventDefault();
        removeErrors();

        var data = {
            login: $("#login-login").val(),
            password: $("#login-password").val()
        };

        $.ajax({
            type: "POST",
            data: JSON.stringify(data), // переводимо js в json формат - в стрічку
            contentType: 'application/json',
            url: "/api/auth/login"
        }).done(function (data) {
            console.log(data);
            if (!data.ok) {
                $(".login h2").after("<p class='error'>" + data.error + "</p>");
                if (data.fields) {
                    data.fields.forEach(function (item) {
                        $("input[name=" + item + "]").addClass("error");
                    });
                }
            } else {
                location.reload();
            }
        });
    });
});
/* eslint-enable no-undef */
