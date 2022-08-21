window.onbeforeunload = function () {
    return "Do you really want to close?";
};

var dt = new Date();
// console.log(dt.getFullYear() + "/" + parseInt(dt.getMonth()+1) + "/" + dt.getDay());

    const DynamicContent = (len) => {
        var hidden = len < 2 ? 'hidden' : "";
        // var variants = '<div class="row variant" style="display: none;">' +
        //                         '<div class="cl-6 cm-6 cs-6 cx-6">' +
        //                             ' <div class="form-group">' +
        //                                 '<input type="text" name="property[]" id="value' + parseInt($(".row_item").length + 1) + '" required>' +
        //                                 '<label for="property' + parseInt($(".row_item").length + 1) + '" class="floated-up-lbl">Property</label>' +
        //                                 '<sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>' +
        //                             '</div>' +
        //                         '</div>' +
        //                         '<div class="cl-6 cm-6 cs-6 cx-6">' +
        //                             ' <div class="form-group">' +
        //                                 '<input type="text" name="value[]" id="value' + parseInt($(".row_item").length + 1) + '" required>' +
        //                                 '<label for="value' + parseInt($(".row_item").length + 1) + '" class="floated-up-lbl">Value</label>' +
        //                                 '<sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>' +
        //                             '</div>' +
        //                         '</div>' +
        //                     '</div>';
        return '<div class="row row_item center-block" id="' + parseInt($(".row_item").length + 1) + '">' +   
                    '<div class="cl-1 cm-1 cs-12 cx-12" style="position: relative;">' +
                        '<h1 class="bg-default txt-center">' + parseInt($('.row_item').length + 1) + '</h1>' + 
                        '<button ' + hidden + ' type="button" class="btn btn-md btn-default btn_remove_row" title="Remove Row"><i class="fa fa-times clr-danger"></i></button>' +
                    '</div>' +
                    '<div class="cl-9 cm-11 cs-12 cx-12">' + 
                        '<div class="row">' + 
                            '<div class="cl-5 cm-5 cs-12 cx-12">' +
                                '<div class="form-group">' +
                                    '<input type="text" maxlength="100" name="item[]" id="item' + parseInt($(".row_item").length + 1) + '" list="items" class="txt-u" required>' +
                                    '<label for="item' + parseInt($(".row_item").length + 1) + '" class="floated-up-lbl">Description</label>' +
                                    '<sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>' +
                                    '<datalist id="items"></datalist>' + 
                                '</div>' +
                            '</div>' +
                            '<div class="cl-3 cm-3 cs-6 cx-6">' +
                                '<div class="form-group">' +
                                    '<input type="text" maxlength="13" name="barcode[]" id="barcode' + parseInt($(".row_item").length + 1) + '" class="txt-u barcode">' +
                                    '<label for="barcode' + parseInt($(".row_item").length + 1) + '" class="floated-up-lbl">Barcode</label>' +
                                    // '<sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>' +
                                '</div>' +
                            '</div>' +
                            '<div class="cl-2 cm-2 cs-3 cx-3">' +
                                '<div class="form-group">' +
                                    '<input type="number" min="1" step="1" name="dim[]" id="dim' + parseInt($(".row_item").length + 1) + '" required>' +
                                    '<label for="dim' + parseInt($(".row_item").length + 1) + '" class="floated-up-lbl">Dimension</label>' +
                                    '<sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>' +
                                '</div>' +
                            '</div>' +
                            // '<div class="cl-2 cm-2 cs-3 cx-6">' +
                            //     '<div class="form-group">' +
                            //         '<input type="number" min="1" step="1" name="qty[]" id="qty' + parseInt($(".row_item").length + 1) + '" required>' +
                            //         '<label for="qty' + parseInt($(".row_item").length + 1) + '" class="floated-up-lbl">Quantity</label>' +
                            //         '<sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>' +
                            //     '</div>' +
                            // '</div>' +
                            // '<div class="cl-3 cm-3 cs-3 cx-6" hidden>' +
                            //     ' <div class="form-group">' +
                            //         '<input type="number" min=".01" step=".01" name="cp[]" id="cp' + parseInt($(".row_item").length + 1) + '" required>' +
                            //         '<label for="cp' + parseInt($(".row_item").length + 1) + '" class="floated-up-lbl">Unit Cost</label>' +
                            //         '<sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>' +
                            //     '</div>' +
                            // '</div>' +
                            '<div class="cl-2 cm-2 cs-3 cx-3">' +
                                ' <div class="form-group">' +
                                    '<input type="number" min=".01" step=".01" name="rp[]" id="rp' + parseInt($(".row_item").length + 1) + '" required>' +
                                    '<label for="rp' + parseInt($(".row_item").length + 1) + '" class="floated-up-lbl">Retail Price</label>' +
                                    '<sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>' +
                                '</div>' +
                            '</div>' +
                            // '<div class="cl-3 cm-3 cs-4 cx-6">' +
                            //     '<div class="form-group">' +
                            //         '<input type="number" min="1" step="1" name="restock[]" id="restock' + parseInt($(".row_item").length + 1) + '" required>' +
                            //         '<label for="restock' + parseInt($(".row_item").length + 1) + '" class="floated-up-lbl" style="top: -5px">Restock Level</label>' +
                            //         '<sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>' +
                            //     '</div>' +
                            // '</div>' +
                            // '<div class="cl-3 cm-3 cs-4 cx-6" hidden>' +
                            //     ' <div class="form-group">' +
                            //         '<input type="date" name="expdate[]" id="expdate' + parseInt($(".row_item").length + 1) + '" required>' +
                            //         '<label for="expdate' + parseInt($(".row_item").length + 1) + '" class="floated-up-lbl" style="top: -5px;">Expiry Date</label>' +
                            //         '<sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>' +
                            //     '</div>' +                                
                            // '</div>' +
                            '<div hidden class="cl-12 cm-12 cs-12 cx-12">' +
                                ' <div class="form-group">' +
                                    '<button type="button" disabled class="btn btn-default clr-primary" onclick="addVariant(event);" id="btn_addVariant">Add Variant</button>' +
                                '</div>' +
                            '</div>' +                            
                        '</div>' +
                    '</div>' +
                '</div>';
    }

    function addVariant(e){
        var variants = '<div class="row mt-1 variant" style="background: whitesmoke;">' +
                                '<div class="cl-6 cm-6 cs-6 cx-6">' +
                                    ' <div class="form-group">' +
                                        '<input type="text" maxlength="50" name="prop[]" id="prop' + parseInt($(".variant").length + 1) + '" required>' +
                                        '<label for="prop' + parseInt($(".variant").length + 1) + '" class="floated-up-lbl">Property</label>' +
                                        '<sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="cl-2 cm-2 cs-2 cx-6">' +
                                    ' <div class="form-group">' +
                                        '<input type="number" min="1" step="1" name="qty[]" id="qty' + parseInt($(".variant").length + 1) + '" required>' +
                                        '<label for="qty' + parseInt($(".variant").length + 1) + '" class="floated-up-lbl">Qty</label>' +
                                        '<sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="cl-2 cm-2 cs-2 cx-6">' +
                                    ' <div class="form-group">' +
                                        '<input type="number" min=".01" step=".01" name="val[]" id="val' + parseInt($(".variant").length + 1) + '" required>' +
                                        '<label for="val' + parseInt($(".variant").length + 1) + '" class="floated-up-lbl">Value</label>' +
                                        '<sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="cl-2 cm-2 cs-2 cx-6">' +
                                    ' <div class="form-group">' +
                                        '<a href="javascript:void(0);" class="btn clr-danger no-udl" onclick="removeVariant(event);" style="font-size: 30px; padding: 5px 10px;">&times;</a>' +
                                    '</div>' +
                                '</div>' +
                            '</div>';                            
        e.target.id == 'btn_addVariant' ? $(e.target).closest('div').append(variants) : '';
    }

    function removeVariant(e){
        // $("#form-collection .row_item#" + $(this).closest('.row_item').attr('id')).remove();
        $(e.target).closest('.row.variant').hide();
        // $(".row_item h1").each(function(i){ $(this).text(i+1); });
        // $(".row_item").length == 1 ? $("#btn_remove_bottom_row").prop('disabled', true) : $("#btn_remove_bottom_row").prop('disabled', false);
    }

pop_rec('./pop_invoice_table.php', { perPage: $("#perPage").val(), filter_column: $('#filter_column').val(), search_term: $('#search_term').val() }, '#pop_invoice_table');

$(window).on('keydown', function(e){
    let key = e.keyCode || e.which;
    key == 107 && !$("#frm-gen-invoice #btn_add_row").is(":disabled") ? $("#frm-gen-invoice #btn_add_row").click() : key == 109 && !$("#frm-gen-invoice #btn_remove_bottom_row").is(":disabled") ? $("#frm-gen-invoice #btn_remove_bottom_row").click() : "";
});

$.post('./fetch_suppliers.php', function (resp) {
    $('#sup_id, #edit_sup_id').html('<option value="">--- select supplier ---</option>').append(resp);
});
$("#form-collection").append(DynamicContent(parseInt($(".row_item").length)));

$("#btn_add_row").click(function(){
    $("#form-collection").append(DynamicContent());
    $(".row_item h1").each(function (i) { $(this).text(i + 1); });
    $(".row_item").length > 1 ? $("#btn_remove_bottom_row").prop('disabled', false) : $("#btn_remove_bottom_row").prop('disabled', true);
});

$("#btn_remove_bottom_row").click(function () {
    $("#form-collection .row_item:last").remove();
    $(".row_item").length == 1 ? $("#btn_remove_bottom_row").prop('disabled', true) : $("#btn_remove_bottom_row").prop('disabled', false);
});

$(document).on('click', ".btn_remove_row", function () {
    $("#form-collection .row_item#" + $(this).closest('.row_item').attr('id')).remove();
    $(".row_item h1").each(function(i){ $(this).text(i+1); });
    $(".row_item").length == 1 ? $("#btn_remove_bottom_row").prop('disabled', true) : $("#btn_remove_bottom_row").prop('disabled', false);
});

$(document).on('input', "[list='invoice_list']", function (e) { 
    if(e.keycode || e.which != 38 && e.keycode || e.which != 40){
        $.post('./search_invoice.php', { search_term: this.value }, function (resp) { 
            $('datalist#invoice_list').html(resp.invoices); 
            if (resp.found) {
                $("#sup_id").val(resp.sup_id).prop('disabled', true);
            }
            else {
                $("#sup_id").val('').prop('disabled', false);
            }
        }, 'JSON')  
    }
});

$(document).on('input', "[list='items']", function (e) { 
    let rowNum = $(this).closest('.row_item').find('h1').text();
    if(e.keycode || e.which != 38 && e.keycode || e.which != 40){
        $.post('./search_item.php', { search_term: this.value }, function (resp) { 
            $('datalist#items').html(resp.items); 
            if (resp.found) {
                $("#barcode" + rowNum).val(resp.barcode).focus(), $("#cp" +rowNum).val(resp.cp), $("#rp" +rowNum).val(resp.rp), $("#restock" +rowNum).val(resp.restock), $("#expdate" +rowNum).val(resp.expdate);
            }
            else {
                $("#barcode" + rowNum).val(''), $("#cp" +rowNum).val(resp.cp),$("#cp" +rowNum).val(''), $("#rp" +rowNum).val(''), $("#restock" +rowNum).val(''), $("#expdate" +rowNum).val('');
            }
        }, 'JSON')  
    }
    // console.log($(e.target).val().length > 0)
    if($(e.target).val().length > 0){
        $(this).closest('.row_item').find('#btn_addVariant').prop('disabled', false);
    }
    else{
        $(this).closest('.row_item').find('#btn_addVariant').prop('disabled', true);
    }
});

// $(document).on('focus', "[name='rp[]']", function(){
//     if($(this).closest(".row_item").find("[name='cp[]']").val() == ""){
//         $(this).closest(".row_item").find("[name='cp[]']").focus();
//         alertify.notify("Field Required!");
//     }
// })

$(document).on('input', "[name='cp[]']", function () {
    let _this = $(this);
    if(_this.closest(".row_item").find("[name='rp[]']").val() != "" && _this.val() > parseFloat(_this.closest(".row_item").find("[name='rp[]']").val())) {
        _this.closest(".row_item").find("[name='rp[]']").closest('.form-group').addClass('error');
        alertify.error("Warning!<br/> Unit Cost must not be greater than Retail Price.");
        $("#frm-gen-invoice [type='submit']").prop('disabled', true);
    }
    else {
        _this.closest(".row_item").find("[name='rp[]']").closest('.form-group').removeClass('error');
        $("#frm-gen-invoice .form-group.error").length < 1 ? $("#frm-gen-invoice [type='submit']").prop('disabled', false) : $("#frm-gen-invoice [type='submit']").prop('disabled', true);
    }
});

// $(document).on('input', "[name='rp[]']", function(){
//     let _this = $(this);
//     if(_this.val() != "" && _this.val() < parseFloat(_this.closest(".row_item").find("[name='cp[]']").val())){
//         _this.closest(".form-group").addClass('error').focus();
//         alertify.error("Invalid Value!<br/> Retail Price must be greater than Unit Cost.");
//         $("#frm-gen-invoice [type='submit']").prop('disabled', true);
//     }
//     else{
//         _this.closest(".form-group").removeClass('error');
//         $("#frm-gen-invoice .form-group.error").length < 1 ? $("#frm-gen-invoice [type='submit']").prop('disabled', false) : $("#frm-gen-invoice [type='submit']").prop('disabled', true);
//     }
// });

$(document).on('submit', "#frm-gen-invoice", function () {
    var formData = $(this).serialize();
    $.ajax({
        url: "./save_new_invoice.php?sup_id=" + $('#sup_id').val()+"&emp_id=" + localStorage.getItem('activeUser.id'),
        type: "post",
        dataType: 'JSON',
        data: formData,
        success: function (rsp) { 
            if (rsp.saved) {
                $("#frm-gen-invoice #form-collection .row_item input").val('');
                $(".row_item .btn_remove_row").each(function (i) { $(".btn_remove_row").click(); });
                $("#form-collection").append(DynamicContent(parseInt($(".row_item").length)));
                pop_rec('pop_invoice_table.php', { perPage: $("#perPage").val(), filter_column: $('#filter_column').val(), search_term: $('#search_term').val() }, '#pop_invoice_table');
                alertify.success('Saved.');
            }
            else {
                console.log(rsp);
            }
            $("#frm-gen-invoice [type='submit']").html("<i class='fa fa-save'></i> Save").prop('disabled', false);
            $("#frm-gen-invoice #form-collection input, textarea, select").prop('disabled', false);
        },
        beforeSend: function () {
            $("#frm-gen-invoice [type='submit']").html("<i class='fa fa-spinner fa-spin'></i>").prop('disabled', true);
            $("#frm-gen-invoice #form-collection input, textarea, select").prop('disabled', true);
        }
    });
    return false;
});

$(document).on('submit', "#frm-update-product", function () {
    var formData = $(this).serialize();
    $.ajax({
        url: "./update_product.php",
        type: "post",
        dataType: 'JSON',
        data: formData,
        success: function (rsp) {
            console.log(rsp);
            if (rsp.updated) {
                $("#frm-update-product")[0].reset();
                pop_rec('pop_invoice_table.php', { perPage: $("#perPage").val(), filter_column: $('#filter_column').val(), search_term: $('#search_term').val() }, '#pop_invoice_table');
                alertify.success('Updated Successfully.');
                $('#modal_update_product button.close').click();
            }
            else if (rsp.stock_exist) {
                alertify.error('Duplicate Found!<br/>Item already exist.');
            }
            else {
                console.log(rsp);
            }
            $("#frm-update-product [type='submit']").html("<i class='fa fa-pencil'></i> Update").prop('disabled', false);
            $("#frm-update-product input, textarea, select").prop('disabled', false);
        },
        beforeSend: function () {
            $("#frm-update-product [type='submit']").html("<i class='fa fa-spinner fa-spin'></i>").prop('disabled', true);
            $("#frm-update-product input, textarea, select").prop('disabled', true);
        }
    });
    return false;
});

function delete_rec(resource, key) {
    alertify.confirm("Confirm", "Delete?", function () {
        $.post(resource, key, function (resp) {
            if(resp){
                pop_rec('pop_invoice_table.php', { perPage: $("#perPage").val(), filter_column: $('#filter_column').val(), search_term: $('#search_term').val() }, '#pop_invoice_table');
                alertify.success('Deleted');
            }
            else{
                console.log(resp);
            }
        });
    }, function () { }).set('labels', { ok: 'Yes', cancel: 'No' });
} 

const disp_invoice_items = (invoice_id) => {
    $.ajax({
        url: "./disp_invoice_item.php",
        type: "post",
        data: { invoice_id: invoice_id, regdate: $('#id' + invoice_id).closest('#panel-invoice-list').find('span#regdate').text(), supplier: $('#id' + invoice_id).closest('#panel-invoice-list').find('.panel-content span:first').text() },
        success: function (resp) {
            if ($('#id' + invoice_id).closest('#panel-invoice-list').find('span:last-child .fa').hasClass('open')) {
                $('*#panel-invoice-list .panel-content.open').slideUp();
                $('*#panel-invoice-list').find('span:last-child .fa').removeClass('open');
            }
            else {
                $('*#panel-invoice-list .panel-content.open').slideUp();
                $('*#panel-invoice-list').find('span:last-child .fa').removeClass('open');
                $('#id' + invoice_id).css({ 'border-left': 'solid 1px dodgerblue', 'border-right': 'solid 1px dodgerblue', 'border-bottom': 'solid 1px dodgerblue' }).html(resp).slideToggle().addClass('open');
                $('#id' + invoice_id).closest('#panel-invoice-list').find('span:last-child .fa').toggleClass('open');
            }   
            $('*#panel-invoice-list button').prop('disabled', false);
            $('#id' + invoice_id).closest('.row').find('.image-loader').css({'display': 'none'});
        },
        beforeSend: function () {
            $('*#panel-invoice-list button').prop('disabled', true);
            $('#id' + invoice_id).closest('.row').find('.image-loader').css({'display':'flex'});
        }
    });
}
