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
            district: $('#txtSearchDistrict').val(),
            name: $('#txtSearchName').val(),
            status: $('#lstSearchStatus').val(),
            city: $('#txtSearchCity').val()
        }, function (html) {
            $('.tower-list').append(html);
            page ++;
            lock = false;
        });
    }
    if ($('.tower-pano-list').length > 0) {
        if (lock) return;
        lock = true;
        $.get('/pano', {
            raw: true,
            p: page,
            provider: $('#lstProviders').val(),
            type: $('#lstTypes').val(),
            district: $('#txtSearchDistrict').val(),
            name: $('#txtSearchName').val(),
            status: $('#lstSearchStatus').val(),
            city: $('#txtSearchCity').val()
        }, function (html) {
            $('.tower-pano-list').append(html);
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
        $('.tower-pano-list').html('');
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

    $('#chkSelectAll').click(function () {
        if ($('#chkSelectAll').is(':checked'))
            $('.tower-chk').prop("checked", true);
        else
            $('.tower-chk').prop("checked", false);
    });
});

function editTower(id) {
    var tower = $('tr[data-tower="' + id + '"]');
    $('#txtName').val(tower.find('.name').html());
    $('#txtCity').val(tower.find('.city').html());
    $('#lstEditTypes').val(tower.find('.type').html());
    $('#txtDistrict').val(tower.find('.district').html());
    $('#txtAddress').val(tower.find('.address').html());
    $('#lstEditProviders').val(tower.attr('data-provider'));
    $('#imgTower').attr('src', '/file/download/' + tower.attr('data-picture'));
    $('#txtLon').val(tower.attr('data-lon'));
    $('#txtLat').val(tower.attr('data-lat'));
    $('#txtHeight').val(tower.attr('data-height'));
    $('#txtUrl').val(tower.attr('data-url'));
    $('#TowerID').val(tower.attr('data-tower'));
    $('#lstEditScene').val(tower.attr('data-scene'));
    $('#lstStatus').val(tower.attr('data-status'));
    $('#modalEditTower').modal('show');
}

function deleteTower(id) {
    $('tr[data-tower="' + id + '"]').remove();
    $.post('/tower/delete', { id: id }, function () {});
}

function DeleteTowers() {
    var tmp = '';
    $('.tower-chk').each(function () {
        if ($(this).is(':checked')) {
            tmp += $(this).attr('data-id') + ' ';
            $(this).parents('tr').remove();
        }
    });
    tmp = tmp.trim();
    $.post('/tower/deletemulti', { ids: tmp }, null);
}

function exportTowers() {
    window.open('/tower/export?provider=' + $('#lstProviders').val() + '&type=' + $('#lstTypes').val() + '&district=' + $('#txtSearchDistrict').val() + '&name=' + $('#txtSearchName').val() + '&status=' + $('#lstSearchStatus').val() + '&city=' + $('#txtSearchCity').val());
}