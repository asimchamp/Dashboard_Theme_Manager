require(['splunkjs/mvc', 'jquery', 'splunkjs/mvc/simplexml/ready!'], function (mvc, $) {
    var utils = require("splunkjs/mvc/utils");
    $(document).ready(function () {
        // Hide the dashboard title
        var dashboardTitle = document.getElementsByClassName("dashboard-title dashboard-header-title");
        if (dashboardTitle.length > 0) {
            dashboardTitle[0].innerHTML = "";
        }

        // Hide the entire header section
        $('.dashboard-header').hide();

        // Remove the padding from the dashboard body
        $('.dashboard-body').css('padding-top', '0');

        // Ensure the header stays hidden
        setTimeout(function () {
            $('.dashboard-header').hide();
            $('.dashboard-body').css('padding-top', '0');
        }, 100);
    });
}); 