$(document).ready(function () {
  $(".dd-country").select2();
  $("#toggle").click(function (e) {
    if ($(this).prop("checked")) {
      $("body").addClass("dark");
    } else {
      $("body").removeClass();
    }
  });
});
