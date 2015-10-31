$('#candidates').on('click', 'input[type="checkbox"]', function () {
    cb = $(this);
    cb.val(cb.prop('checked'));
    $.ajax('/candidate/' + cb.attr("name"), {data: {endorsed: cb.prop('checked')}, method: 'PATCH'})
        .done(function (response) {
            cb.popover({content: response.message}).popover('show');
        });
});

| $('#candidates').on('click', 'input[type="checkbox"]', function () {
|     cb = $(this);
|     cb.val(cb.prop('checked'));
|     $.ajax('/candidate/' + cb.attr("name"), {data: {endorsed: cb.prop('checked')}, method: 'PATCH'})
|         .done(function (response) {
|             cb.popover({content: response.message}).popover('show');
|         });
| });