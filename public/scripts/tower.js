var page = 1;
var lock = false;
var series = null;

function load() {
    loadTowers();
}

function loadTowers() {
    if ($('.tower-list').length > 0) {
        if (lock) return;
        lock = true;
        $.get('/tower', {
            raw: true,
            p: page,
            provider: $('#lstProviders').val(),
            type: $('#lstTypes').val(),
            district: $('#txtDistrict').val()
        }, function (html) {
            $('.tower-list').append(html);
            page ++;
            lock = false;
        });
    }
}

$(window).scroll(function () {
    var totalheight = parseFloat($(window).height()) + parseFloat($(window).scrollTop());
    if ($(document).height() <= totalheight) {
        load();
    }
});

$(document).ready(function () {
    load();
    $('#btnSearchTower').click(function () {
        $('.tower-list').html('');
        page = 1;
        lock = false;
        load();
    });

    $('.edit-user').click(function () {
        var id = $(this).parents('tr').attr('data-user');
        $('#UserID').val(id);
        $('#modalEditUser').modal('show');
    });

    $('#btnSaveUser').click(function () {
        $('#modalEditUser').modal('hide');
        $.post('/user/edit', { id: $('#UserID').val(), password: $('#txtPassword').val() }, function () {});
    });

    $('.delete-user').click(function () {
        var id = $(this).parents('tr').attr('data-user');
        $('tr[data-user="' + id + '"]').remove();
        $.post('/user/delete', { id: id }, function () {});
    });

    $('.delete-series').click(function () {
        var id = $(this).parents('tr').attr('data-series');
        $('tr[data-series="' + id + '"]').remove();
        $.post('/signal/delete', { id: id }, function () {});
    });
});

function editTower(id) {
    var tower = $('tr[data-tower="' + id + '"]');
    $('#txtName').val(tower.find('.name').html());
    $('#lstEditTypes').val(tower.find('.type').html());
    $('#txtDistrict').val(tower.find('.district').html());
    $('#lstEditProviders').val(tower.attr('data-provider'));
    $('#imgTower').attr('src', '/file/download/' + tower.attr('data-picture'));
    $('#txtLon').val(tower.attr('data-lon'));
    $('#txtLat').val(tower.attr('data-lat'));
    $('#txtHeight').val(tower.attr('data-height'));
    $('#txtUrl').val(tower.attr('data-url'));
    $('#TowerID').val(tower.attr('data-tower'));
    $('#modalEditTower').modal('show');
}

function deleteTower(id) {
    $('tr[data-tower="' + id + '"]').remove();
    $.post('/tower/delete', { id: id }, function () {});
}