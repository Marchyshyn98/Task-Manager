/* eslint-disable no-undef*/
$(function () {
    // remove Errors
    function removeErrors() {
        $(".task-form p.error").remove();
        $(".task-form input, .task-form textarea").removeClass("error");
    }

    

    //clear
    $(".task-form input, .task-form textarea").on("focus", function () {
        removeErrors();
    }); // коли переключаємось на інпут

    // publish
    $(".publish-button").on("click", function (e) {
        e.preventDefault();
        removeErrors();

        var data = {
            title: $("#task-title").val(),
            body: $("#task-body").val(),
            taskId: $("#task-id").val()
        };
        console.log(data);

        $.ajax({
            type: "POST",
            data: JSON.stringify(data), // переводимо js в json формат - в стрічку
            contentType: 'application/json',
            url: "/task/add"
        }).done(function (data) {
            console.log(data);
            if (!data.ok) {
                $(".task-form h2").after("<p class='error'>" + data.error + "</p>");
                if (data.fields) {
                    data.fields.forEach(function (item) {
                        $("#task-" + item).addClass("error");
                    });
                }
            } else {
                $(location).attr("href", "/");
            }
        });
    });

    // delete task
    $(".delete-button").on("click", function () {
        var data = {
            taskId: $("#delete-task").val()
        }
        console.log(data);

        $.ajax({
            type: "POST",
            data: JSON.stringify(data), // переводимо js в json формат - в стрічку
            contentType: 'application/json',
            url: "/task/delete"
        }).done(function (data) {
            console.log(data);
            if (!data.ok) {
                console.log("false");
            } else {
                $(location).attr("href", "/");
            }

        });
    });

    // share task
    $(".shareTask").on("click", function () {
        var data = {
            taskId: $("#task-share").val(),
            userId: $("#user-share").val()
        }

        console.log(data);

        $.ajax({
            type: "POST",
            data: JSON.stringify(data), // переводимо js в json формат - в стрічку
            contentType: 'application/json',
            url: "/task/share"
        }).done(function (data) {
            console.log(data);
            if (!data.ok) {
                $(location).attr("href", "/");
            } else {
                $(location).attr("href", "/");
            }

        });

    });
});
/* eslint-enable no-undef */