import { appSounds, SystemPrefs, Swiper, Notif, uploadFiles, myUploader, activeUser, TagsInput, rte, uuid } from '../assets/js/utils.js';
import Tagify from '../assets/plugins/tagify-master/dist/tagify.esm.js';
import { DateTime, Duration, FixedOffsetZone, IANAZone, Info, Interval, InvalidZone, Settings, SystemZone, VERSION, Zone } from '../assets/plugins/luxon.js'
import { TabulatorFull as Tabulator } from '../assets/plugins/tabulator-master/dist/js/tabulator_esm.min.js';

const notif = new Notif(),
      systemPrefs = new SystemPrefs(),
      tagsInput = new TagsInput(),
      editorReceipt = rte({el: '#custom_receipt_footer_text', placeholder: 'add custom text for receipts'}),
      editorBusinessAddr = rte({el: '#addr', height: 200, placeholder: 'your business location'});

const pageTapSwiper = new Swiper('.swiper#pageTapSwiper', {    
    speed: 400,
    autoHeight: true,
    allowTouchMove: false,
    simulateTouch: false,
    pagination: {
        el: '.swiper-pagination.main',
        type: 'bullets',
        clickable: true,
        bulletElement: 'button',
        bulletActiveClass: 'activeTab',
        slidesPerView: 'auto',
        renderBullet: (index, className) => {
            // console.log(className);
            let tabs = [{title: 'Company', icon: 'home'}, {title: 'Preferences', icon: 'wrench'}, {title: 'About', icon: 'info-circle'}];
            return `<button type="button" class="tabs ${className}"><i class="fa fa-${tabs[index].icon} fa-2x"></i> ${tabs[index].title}</button>`;
        },
        init: () => {
            // console.log('swiper initialized');
        },
        slideChange: swiper => {
            // console.log('slide changed');
        },
        resize: swiper => {
            // console.log('resized');
        },
    },
}),
subSwiper = new Swiper('.swiper.sub', {
    direction: 'vertical',
    speed: 400,
    autoHeight: true,
    allowTouchMove: false,
    simulateTouch: false,
    pagination: {
        el: '.swiper-pagination.sub',
        type: 'bullets',
        clickable: true,
        bulletElement: 'button',
        bulletActiveClass: 'activeSubTab',
        slidesPerView: 'auto',
        renderBullet: (index, className) => {
            let tabs = [{title: 'Profile', icon: 'archive'}, {title: 'Billing', icon: 'money'}, {title: 'Payments', icon: 'mobile'}, {title: 'Payments', icon: 'info-circle'}, {title: 'Payments', icon: 'info-circle'}];
            return !_.isUndefined(tabs[index]) ? `<button type="button" class="sub-tab ${className}"><i class="fa fa-${tabs[index].icon} fa-2x"></i> ${tabs[index].title}</button>` : '';
        },
        init: () => {
            // console.log('swiper initialized');
        },
        slideChange: swiper => {
            // console.log('slide changed');
        },
        resize: swiper => {
            // console.log('resized');
        },
    },
}),
clienteleSwiper = new Swiper('.swiper#clienteleSwiper', {
    speed: 400,
    // spaceBetween: 100,
    // navigation: false,
    slidesPerView: 2,
    autoplay: {
        delay: 5000,
        // disableOnInteraction: false,
        pauseOnFocus: false,
    },
    // nested: true,
    pagination: {
        el: '.swiper#clienteleSwiper .swiper-pagination',
        type: 'bullets',
        clickable: true,
    },
});

let industryTags = new Tagify(
    document.querySelector('#industry'), {
        mode: 'select',
        enforceWhitelist: true,
        whitelist: ['Aerospace', 'Transport', 'Computer', 'Telecommunication', 'Agriculture', 'Construction', 'Education', 'Pharmaceutical', 'Food', 'Health-care', 'Hospitality', 'Entertainment', 'News Media', 'Energy', 'Manufacturing', 'Music', 'Mining', 'Worldwide web', 'Electronics'],
        skipInvalid: true,
        // keepInvalidTags: true,
        // placeholder: 'sector of your business',
        callbacks: {
            blur: e => _.size(e.detail.tagify.value) < 1 && e.detail.tagify.removeTag(),
        }
    }
),
phoneTags = new Tagify(
    document.querySelector('#phone'), {
        skipInvalid: true,
        // keepInvalidTags: true,
        // placeholder: 'enter up to 3 numbers here',
        delimiters: ",",
        maxTags: 3,     
        callbacks: {
            // "add": alert("focused"),
        },   
        validate: tag => _.size(tag.value) == 10,
        callbacks: {
            // "blur": e => _.size(e.detail.tagify.value) < 1 && $("#crud-company [type='submit']").prop('disabled', true),
            "input": e => console.log(e.detail.value = 200)
            
        }
    }
),
emailTags = new Tagify(
    document.querySelector('#email'), {
        placeholder: 'enter up to 3 accounts here if any',
        delimiters: ",",  
        maxTags: 3,     
        validate: tag => {
            let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(tag.value).toLowerCase());
        }     
    }
),
websiteTags = new Tagify(
    document.querySelector('#website'), {
        placeholder: 'enter up to 3 links here if any',
        delimiters: ",",   
        maxTags: 3,   
        validate: tag => {
            let re = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
            return re.test(String(tag.value).toLowerCase());
        }      
    }
);

const popCompanyInfo = () => {
    $.ajax({
        url: "./crud.php?pop",
        type: "post",
        dataType: 'JSON',
        success: resp => {
            console.log(resp)
            if (resp.data != 0) {
                let { comp_id, comp_name, slogan, tax_id, industry, addr, phone, email, website, logo } = resp.data[0];
                $("#crud-company [type='submit']").removeClass('btn-primary new').addClass('btn-success update').html("<i class='fa fa-pencil'></i> Update").attr('comp-id', comp_id);
                $("#company_name").val(comp_name);
                $("#tax_id").val(tax_id);
                $("#industry").val(industry);
                tagsInput.set({el: phoneTags, data: JSON.parse(phone)});
                !_.isNull(email) && tagsInput.set({el: emailTags, data: JSON.parse(email)});
                !_.isNull(website) && tagsInput.set({el: websiteTags, data: JSON.parse(website)});
                editorBusinessAddr.root.innerHTML = addr;
                if(!_.isNull(logo)){
                    uppyCompanyLogo.reset();
                    sessionStorage.setItem('oldCompanyLogo', logo); // store the old logo temporarily in session storage for later use
                    // fetchFile({path: `../uploads/company/${logo}`, file: logo, picker: uppyCompanyLogo});
                }
            }
            else {
                $("#crud-company [type='submit']").removeClass('btn-success update').addClass('btn-primary new').html("<i class='fa fa-save'></i> Save").removeAttr('data-comp-id');
            }
            $("#crud-company input, textarea, select").prop('disabled', false);
            $("#crud-company [type='submit']").prop('disabled', false);
        },
        beforeSend: function () {
            $("#crud-company input:not(#company_logo), textarea, select").prop('disabled', true);
            $("#crud-company [type='submit']").html("<i class='fa fa-spinner fa-spin'></i>").prop('disabled', true);
        }
    });
}
popCompanyInfo();
  
console.log(uuid(), uuid().length);

// subSwiper.slideTo(1);

let uppyCompanyLogo = uploadFiles({
    target: '#company_logo', 
    inline: false, 
    autoProceed: true,
    restrictions: {
        maxFileSize: 5000000,
        maxNumberOfFiles: 1,
        minNumberOfFiles: 0,
        allowedFileTypes: ['.jpg', '.jpeg', '.png'],
      //   requiredMetaFields: ['caption'],
    },
    methods: {
        onBeforeFileAdded: (file) => {
            $('#crud-company [type="submit"]').prop('disabled', true);
        }         
    },
    dashboard: {
        height: 210, 
        hideUploadButton: true,
        doneButtonHandler: null,
        plugins: ['Webcam', 'ScreenCapture', 'ImageEditor'],
        note: '1 Image of 5MB maximum size. JPEG, PNG or GIF recommended.',
        locale: {
            strings: {
                // dropPasteImportFiles: 'Drop files here, %{browseFiles} or import from:',
                dropPasteImportFiles: `Logo - 5MB size`,
            }
        }
    }
})
.use(Uppy.XHRUpload, {endpoint: './crud.php'});

uppyCompanyLogo.on('files-added', file => {
    $('#crud-company [type="submit"]').prop('disabled', false);
});

uppyCompanyLogo.on('complete', result => {
    console.log('successful files: ', result.successful, 'failed files: ', result.failed)
});

$(document).on('click', ".side-panel a", e => {
    $(".side-panel a").removeClass('active').not($(e.target).closest('a').addClass('active'));
});

$(document).on('submit', "#crud-company", e => {
    let formData = new FormData(e.target), comp_id = $(e.target).find('[type="submit"]').attr('comp-id'), crud_type = $(e.target).find('[type="submit"]').hasClass('new') ? 'new' : 'update';

    _.size(uppyCompanyLogo.getFiles()) > 0 ? formData.append('company_logo', uppyCompanyLogo.getFiles()[0].data) : notif.show({ el: $(e.target).find('[type="submit"]'), title: `<div>You have not uploaded a logo.</p>This will default to the app's logo.</div>`, className: 'warning', styleName: 'no-company-logo', position: 'left center', autoHide: true });
    
    editorBusinessAddr.getLength() > 1 && formData.append('addr', editorBusinessAddr.root.innerHTML);

    _.forEach([phoneTags, emailTags, websiteTags], tag => _.size(JSON.parse(tagsInput.get({el: tag}))) > 0 && formData.append(`${_.split(tag['DOM'].originalInput.id, 'Tags')[0]}`, tagsInput.get({el: tag})));

    if(_.size(JSON.parse(tagsInput.get({el: phoneTags}))) < 1){
        notif.show({ el: $(`#phone`), title: `<div class="txt-center">Contact Phone is required</div>`, className: 'warning', styleName: 'phone-required', position: 'bottom left', autoHide: true });
        $(".swiper-slide-active").animate({ scrollTop: $("#phone").offset().top }, 2000);
    }
    else if(editorBusinessAddr.getLength() <= 1){
        notif.show({ el: $("#addr"), title: `<div class="txt-center">Business Location is required</div>`, className: 'warning', styleName: 'editor-required', position: 'bottom left', autoHide: true });
        $(".swiper-slide-active").animate({ scrollTop: $("#addr").offset().top }, 2000);
    }
    else{
        $.ajax({
            url: `./crud.php?${crud_type}&emp_id=${activeUser.id}${crud_type == "update" ? `&comp_id=${comp_id}&oldFile=${sessionStorage.getItem('oldCompanyLogo')}` : ''}`,
            type: "POST",
            dataType: 'JSON',
            data: formData,
            processData: false,
            contentType: false,
            cache: false,
            success: resp => {
                if (resp.saved || resp.updated) {
                    appSounds.oringz.play();
                    $(e.target)[0].reset();
                    alertify.success(resp.saved && "Saved" || 'Updated.');
                    _.forEach([phoneTags, emailTags, websiteTags], tag => tag.removeAllTags());
                    popCompanyInfo();
                }
                else {
                    console.log(resp);
                }
                // uncheck/reset all checked rights
                $(e.target).find('input, select, button').prop('disabled', false);
                _.forEach([phoneTags, emailTags, websiteTags], tag => tag.setDisabled(false));
            },
            beforeSend: () => {
                _.forEach([phoneTags, emailTags, websiteTags], tag => tag.setDisabled(true));
                $(e.target).find('input, select, button').prop('disabled', true);
            }
        });
    }
    return false;
}); 

// const tablePaymentTypes = new Tabulator("#paymentTypes-table", {
//     width: 300,
//     height: 200,
//     layout: "fitColumns",
//     placeholder: "No Data Set",
//     movableRows: true,
//     addRowPos: "top",
//     headerVisible: false,
//     data: [
//         {title: "Cash", notes: ""},
//         {title: "Mobile Money", notes: ""},
//         {title: "POS", notes: ""},
//         {title: "Credit", notes: ""},
//     ],
//     columns: [
//         { rowHandle: true, formatter: "handle", headerSort: false, frozen: true, width: 30, minWidth: 30, },
//         // { title: "#", formatter: 'rownum', headerSort: false, align: "right", width: 40 },
//         { title: "PAYMENT_TYPE ID", field: 'pm_id', visible: false },
//         { title: "TITLE", field: "title", editor: 'input', hozAlign: "left", formatter: (cell, formatterParams, onRendered) => _.toUpper(cell.getValue()), width: 150 },
//         // { title: "DESCRIPTION", field: "notes", editor: 'input', headerSort: false, hozAlign: "left" },
//         {title: "", field: "", width: 30, headerSort: false, hozAlign: "center", tooltip: "Delete", formatter: (cell, formatterParams, onRendered) => { return "<i class='fa fa-check fa-2x' onclick=''></i>" || ''; }, print: false, cellClick: (e, cell) => {
            
//         }},
//     ],
//     rowMoved: (row) => {
//         console.log(row);
//     },
//     cellEdited: cell => {
//         if(cell.isValid()){
//             let row = cell.getRow();
//             let data = row.getData();
//             data.notes = cell.getValue();
//             row.update(data);
//         }
//     }
// });
// tablePaymentTypes.addRow({});

// const popPaymentTypes = () => {
//     $.get(`./crud.php?prefs&pop`, null, resp => {
//         console.log(resp);
//     }, 'json');
// }
// popPaymentTypes();

let vat, discount, receiptPref;
const PREFS = () => systemPrefs.pop()
.then(config => {
    // console.log(config);
    vat = JSON.parse(config.data[0].pref)['vat'];
    discount = JSON.parse(config.data[0].pref)['discount'];
    receiptPref = config.data[1].pref && JSON.parse((config.data[1])?.pref);
    if(_.size(_.keys(receiptPref)) > 0){
        $(`#vat`).val(he.decode(vat.rate));
        $(`#vatType`).val(he.decode(vat.type))
        $(`#discount`).val(he.decode(discount.rate))
        $(`#discountType`).val(he.decode(discount.type));
        $(`#vat_discount_apply_rule`).prop('checked', vat.before == 1)
        $(`#prefix`).val(he.decode(receiptPref.code.prefix));
        $(`#stickerVisibility`).prop('checked', receiptPref.sticker.visibility == 1)
        $(`[name="stickerType"][value="${_.toLower(receiptPref.sticker.type)}"]`).eq(0).prop('checked', true);
        $(`[name="stickerPosition"][value="${_.toLower(receiptPref.sticker.position)}"]`).eq(0).prop('checked', true);
        $(`#borderStyle option:contains(${he.decode(receiptPref.border.style)})`).eq(0).prop('selected', true);
        $("#borderDepth").val(he.decode(receiptPref.border.depth));
        $(`[name="borderColor"][value="${he.decode(receiptPref.border.color)}"]`).prop("checked", true);
        $(`[name="backgroundColor"][value="${he.decode(receiptPref.background.color)}"]`).prop("checked", true);
        $("#fontSize").val(he.decode(receiptPref.font.size));
        $(`#fontFamily option:contains(${he.decode(receiptPref.font.family)})`).eq(0).prop('selected', true);
        editorReceipt.root.innerHTML = (he.decode(receiptPref.footer.bottom));
    }
});
PREFS();

// console.log(he.decode(CONFIG.receiptPref.footer))
$(document).on('blur', "#custom_receipt_footer_text", e => {
    let editorText = e.target.innerHTML,
    { module, pref } = JSON.parse(e.target.parentElement.dataset.pref);
    if(receiptPref.footer.bottom != he.encode(editorText)){
        systemPrefs.update(module, pref, he.encode(editorText))
        .then(resp => {
            if(resp.updated){
                appSounds.oringz.play();
                alertify.success("Receipt Footer Updated");
                PREFS();
            }
            else{
                console.error(resp.data);     
            }
        })
        .catch(err => console.error("Oopss... ", err));
    }
});

$(document).on('change', "#vat, #discount", e => e.target.value = !e.target.value ? 0 : e.target.value);

const fontCheck = new Set([
    // Windows 10
    'Arial', 'Arial Black', 'Bahnschrift', 'Calibri', 'Cambria', 'Cambria Math', 'Candara', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New', 'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Georgia', 'HoloLens MDL2 Assets', 'Impact', 'Ink Free', 'Javanese Text', 'Leelawadee UI', 'Lucida Console', 'Lucida Sans Unicode', 'Malgun Gothic', 'Marlett', 'Microsoft Himalaya', 'Microsoft JhengHei', 'Microsoft New Tai Lue', 'Microsoft PhagsPa', 'Microsoft Sans Serif', 'Microsoft Tai Le', 'Microsoft YaHei', 'Microsoft Yi Baiti', 'MingLiU-ExtB', 'Mongolian Baiti', 'MS Gothic', 'MV Boli', 'Myanmar Text', 'Nirmala UI', 'Palatino Linotype', 'Segoe MDL2 Assets', 'Segoe Print', 'Segoe Script', 'Segoe UI', 'Segoe UI Historic', 'Segoe UI Emoji', 'Segoe UI Symbol', 'SimSun', 'Sitka', 'Sylfaen', 'Symbol', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings', 'Yu Gothic',
    // macOS
    'American Typewriter', 'Andale Mono', 'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold', 'Arial Unicode MS', 'Avenir', 'Avenir Next', 'Avenir Next Condensed', 'Baskerville', 'Big Caslon', 'Bodoni 72', 'Bodoni 72 Oldstyle', 'Bodoni 72 Smallcaps', 'Bradley Hand', 'Brush Script MT', 'Chalkboard', 'Chalkboard SE', 'Chalkduster', 'Charter', 'Cochin', 'Comic Sans MS', 'Copperplate', 'Courier', 'Courier New', 'Didot', 'DIN Alternate', 'DIN Condensed', 'Futura', 'Geneva', 'Georgia', 'Gill Sans', 'Helvetica', 'Helvetica Neue', 'Herculanum', 'Hoefler Text', 'Impact', 'Lucida Grande', 'Luminari', 'Marker Felt', 'Menlo', 'Microsoft Sans Serif', 'Monaco', 'Noteworthy', 'Optima', 'Palatino', 'Papyrus', 'Phosphate', 'Rockwell', 'Savoye LET', 'SignPainter', 'Skia', 'Snell Roundhand', 'Tahoma', 'Times', 'Times New Roman', 'Trattatello', 'Trebuchet MS', 'Verdana', 'Zapfino',
].sort());
  
(async() => {
    await document.fonts.ready;

    const fontAvailable = new Set();

    for (const font of fontCheck.values()) {
        if (document.fonts.check(`12px "${font}"`)) {
            fontAvailable.add(font);
        }
    }
    // Append the list of available fonts to the fonts select picker.
    [...fontAvailable.values()].map(font => {
        // $(`#fontFamily`).append(`<option ${_.toLower(font) == "verdana" ? 'selected' : ''}>${font}</option>`);
        $(`#fontFamily`).append(`<option value="${_.upperFirst(font)}">${_.upperFirst(font)}</option>`);
    });    
})();

$(document).on('change', "#fontFamily", function(e){
    $(`#fontPreview`).css('font-family', e.target.value);
});

$(document).on('change', "#preferences input, #preferences select, #preferences textarea", function(e){
    let { module, pref } = $(e.target).data('pref');
    systemPrefs.update(module, pref, he.encode(e.target.value))
    .then(resp => {
        if(resp.updated){
            appSounds.oringz.play();
            alertify.success("Receipt Footer Updated");
            PREFS();
        }
        else{
            console.error(resp.data);     
        }
    })
    .catch(err => console.error("Oopss... ", err));
});

$(document).on('click', "#db_backup", function(e){
    $.post(`./crud.php?database&backup`, {dbName: "myshoposdb_backup.sql"}, resp => {
        console.log(resp);
        // if(resp.updated){
        //    appSounds.oringz.play();
        //     resp.saved ? alertify.success("Updated") : console.error(resp.data);     
        // }
    }, 'json');
});

