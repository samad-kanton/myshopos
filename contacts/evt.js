import { appSounds, SystemPrefs, pop, popCountries, Swiper, thousandsSeperator, Notif, footerBottomCustomText, } from '../assets/js/utils.js';
import Tagify from '../assets/plugins/tagify-master/dist/tagify.esm.js';
import newContact from '../components/contacts/new.js';
import crudContact from '../components/contacts/new.js';

const notif = new Notif(),
      systemPrefs = new SystemPrefs()

// BIND notif variable to the Global scope(window)   
window.notif = notif;

const pageTapSwiper = new Swiper('.swiper#pageTapSwiper', {
    // direction: 'vertical',
    speed: 400,
    autoHeight: true,
    allowTouchMove: false,
    simulateTouch: false,
    pagination: {
        el: '.swiper#pageTapSwiper .swiper-pagination',
        type: 'bullets',
        clickable: true,
        bulletElement: 'button',
        bulletActiveClass: 'activeTab',
        slidesPerView: 'auto',
        renderBullet: (index, className) => {
            // console.log(className);
            let tabs = [{title: 'contacts', icon: 'users'}, {title: 'Vendors', icon: 'exchange'}];
            return `<button type="button" class="tabs ${className}"><i class="fa fa-${tabs[index].icon} fa-2x"></i><br/> ${tabs[index].title}</button>`;
        }        
    },
    on: {
        init: () => {
            // console.log('swiper initialized');
        },
        slideChange: swiper => {
            // console.log('slide changed');
        },
        resize: swiper => {
            // console.log('resized');
        },
    }
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

// We register the plugins required to do 
// image previews, cropping, resizing, etc.
FilePond.registerPlugin(
    FilePondPluginFileValidateType,
    FilePondPluginImageExifOrientation,
    FilePondPluginImagePreview,
    FilePondPluginImageCrop,
    FilePondPluginImageResize,
    FilePondPluginImageTransform,
    FilePondPluginImageEdit
);

// Select the file input and use 
// create() to turn it into a pond
let pond = FilePond.create(
    document.querySelector('input[type="file"]#company_logo'),
    {
        labelIdle: 'Drag & Drop company logo or <span class="filepond--label-action"> Browse </span>',
        imagePreviewHeight: 170,
        imageCropAspectRatio: '1:1',
        imageResizeTargetWidth: 200,
        imageResizeTargetHeight: 200,
        stylePanelLayout: 'compact circle',
        styleLoadIndicatorPosition: 'center bottom',
        styleProgressIndicatorPosition: 'right bottom',
        styleButtonRemoveItemPosition: 'left bottom',
        styleButtonProcessItemPosition: 'right bottom',
        // required: true,
        credits: false,
        checkValidity: true,
        dropValidation: true,
        onaddfilestart: file => {
            $("#frm-crud-company-setup [type='submit']").prop('disabled', true);
        },
        onaddfile: file => {
            
        },
        onerror: (file, status) => {
            // console.log(file);
            file.main == 'File is of invalid type' && alert(`${file.main}\nOnly png, jpeg or jpg files are supported.`);
            if(file.code == 404){
                alert("File not found!");
                pond.removeFile();
                $("#frm-crud-company-setup [type='submit']").prop('disabled', false);
            }
        },
        onprocessfile: (error, file) => {
            // console.log(error, file);
            $("#frm-crud-company-setup [type='submit']").prop('disabled', false);
        },
        server: {
            url: './crud.php',
            // process: (fieldName, file, metadata, load, error, progress, abort, transfer, options) => {
                // console.log(file)
            //     console.log(fieldName, file, metadata, load, error, progress, abort, transfer, options)
            //     var formData = new FormData(), req = new XMLHttpRequest();
            //     formData.append(fieldName, file, file.name);
            //     req.open('POST', './crud.php');
            //     req.onload = e => {
            //         console.log(req.status)
            //     }
            //     req.send(formData);
            // }
        }
    }
);


/*
 * Contacts TAB *
*/

$(document).on('click', '#btnBillByContacts', e => { 
    // console.log(tableContacts.getData());
    // _.forEach($(".Contacts-card"), ContactsCardEl => {
    //     let ContactsProp = JSON.parse(ContactsCardEl.dataset['ContactsProp']),
    //         addr = JSON.parse(ContactsProp['addr']),
    //         country = _.find(countries, country => country.id == addr.locationAddr['cust_country']);
    //     $(ContactsCardEl).find("span#countryFlag").html(`${_.isUndefined(countries) ? '<i class="fa fa-spinner fa-spin"></i>' : (ContactsProp['is_default'] == 1 ? '<i class="fa fa-check-circle clr-lime"></i>' : (country?.emoji || ''))}`);
    // });
    !$("#overlay_billByContacts").is(':visible') 
    ? notif.show({ 
        el: $("#selContacts"), 
        title: `
                <div id="overlay_billByContacts" style="width: calc(100vw - 2.5vw); max-width: 500px; overflow-y: auto;">
                    <div class="txt-center" style="display: flex; justify-content: space-between; align-items: center;">
                        <section style="display: grid; grid-template-columns: auto auto; gap: 20px; padding: 10px;">
                            <a href="javascript:void(0);" class="close no-udl clr-default" onclick="$('#btnBillByContacts').trigger('click');"><i class="fa fa-chevron-down"></i></a> 
                            <span>Bill Contacts</span>
                        </section> 
                        <section>
                            <button type="button" class="btn-primary btn-sm" id="btnCreateContacts" style="background: none; color: dodgerblue;"><i class="fa fa-save"></i><br/>Create</button>                       
                            <button disabled type="button" class="btn-success btn-sm" id="btnEditContacts" style="background: none; color: green;"><i class="fa fa-pencil"></i><br/>Update</button>                       
                            <button disabled type="button" class="btn-danger btn-sm" id="btnDelContacts" style="background: none; color: red;"><i class="fa fa-trash"></i><br/>Delete</button> 
                        </section>                      
                    </div>
                    <div id="contacts-table"></div>
                </div>
        `, 
        styleName: 'bill-by-Contacts', 
        position: 'top-left',
        className: 'default', 
        autoHide: false,
        clickToHide: false
    })
    : notif.hide($(".notifyjs-bill-by-Contacts-base"));   
       

    $('#btnCreateContacts, #btnEditContacts, #btnDelContacts').on('click', e => {
        let target = $(e.target).closest('button'), data = tableContacts.getSelectedData()[0];
        // console.log(target);
        if(target[0].id == 'btnCreateContacts'){
            !$("#overlay_crudContacts").is(':visible') ? crudContact({target, position: 'bottom-center', crudOpr: 'new'}) : $('.notifyjs-crud-Contacts-base').remove();   
        }
        else if(target[0].id == 'btnEditContacts'){
            !$("#overlay_crudContacts").is(':visible') ? crudContact({target, position: 'bottom-center', crudOpr: 'update'}) : $('.notifyjs-crud-Contacts-base').remove();   
        }
        else{
            let { cust_id, is_default } = data;
            $.post(`../contacts/crud.php?delete`, { cust_id }, resp => {
                if(resp.deleted){
                    tableContacts.getSelectedRows()[0].delete()
                    .then(() => {
                        appSounds.oringz.play();
                        alertify.error('Deleted');
                    })
                }
                else{
                    console.error(resp);
                }
            }, 'JSON');
        }
        // console.log(tableContacts.getSelectedData()[0].cust_id); 
        // let { cust_id, is_default } = $('.Contacts-card.active').data('ContactsProp'),
        // ContactsClicked = JSON.parse(_.filter($('.Contacts-card'), entry => JSON.parse(entry.dataset['ContactsProp'])['cust_id'] == $("form#crudContacts [type='submit']").attr('id'))[0].dataset['ContactsProp'])['cust_id'];
        // alertify.confirm("Confirm", `<div class="txt-center">Are you sure you want to delete <br/><br/><p class="clr-danger">${_.upperFirst($('#cust_name').val())}</p><br/> from this system?</div>`, function () {
            // $.post(`../contacts/crud.php?delete`, { key: $("form#crudContacts [type='submit']").attr('id') }, resp => {
            //     if(resp.deleted){
            //         appSounds.oringz.play();
            //         $("#cust_name").val('');
            //         alertify.success("Deleted");
            //         $("form#crudContacts")[0].reset();
            //         popContactsGroups();
            //         $(e.target).hide();
            //         $('.Contacts-card.active').trigger('click');
            //         popcontacts();
            //         pond.removeFile();
            //     }
            //     else{
            //         console.error(resp);
            //     }
            // }, 'JSON');
        // }, function () { }).set('labels', { ok: 'Yes', cancel: 'No' });
    });    
});  

// var uppy = new Uppy.Core({
//     id: 'uppy',
//     autoProceed: true,
//     // allowMultipleUploadBatches: true,
//     debug: false,
//     restrictions: {
//       maxFileSize: 5000000,
//       minFileSize: null,
//       maxTotalFileSize: 5000000,
//       maxNumberOfFiles: 1,
//       minNumberOfFiles: 1,
//       allowedFileTypes: ['image/png', 'image/jpeg', 'image/jpg'],
//     //   requiredMetaFields: ['caption'],
//     },
//     meta: {},
//     onBeforeFileAdded: (currentFile, files) => currentFile,
//     onBeforeUpload: (files) => {},
//     onComplete: result => {
//         console.log('successful files:', result.successful)
//         console.log('failed files:', result.failed)
//     },
//     locale: {},
//     // store: new DefaultStore(),
//     logger: Uppy.debugLogger,
//     infoTimeout: 5000,
// })
// uppy.use(Uppy.Dashboard, { 
//     target: '#drag-drop-area', 
//     trigger: '.UppyModalOpenerBtn',
//     inline: true,
//     showProgressDetails: true,
//     // note: 'Images and video only, 2–3 files, up to 1 MB',
//     // height: 300,
//     metaFields: [
//         { id: 'name', name: 'Name', placeholder: 'file name' },
//         { id: 'caption', name: 'Caption', placeholder: 'describe what the image is about' }
//     ],
//     browserBackButtonClose: false
// })
// uppy.use(Uppy.Webcam, { target: Uppy.Dashboard })
// uppy.use(Uppy.ImageEditor, { target: Uppy.Dashboard })
// uppy.use(Uppy.ScreenCapture, { target: Uppy.Dashboard })
// uppy.use(Uppy.DropTarget, { target: document.body })
// // uppy.use(Uppy.Tus, { endpoint: 'https://tusd.tusdemo.net/files/' })

// $('.uppy-Dashboard-poweredBy').remove();


const popContactsGroups = async () => {
    await ContactsGroupsSwiper.removeAllSlides();
    await pop(`../contacts/crud.php?ContactsGroup&pop`).then(resp => {
        // console.log(resp.data);
        $("#cust_group").html('<option value="">--- select ---</option>');
        _.filter(resp.data, entry => {
            ContactsGroupsSwiper.appendSlide([
                `<div class="swiper-slide">
                    <span>${entry.title.toUpperCase()}</span>
                    <button type="button" class="btn btn-danger btn-xs new" id="btnDeleteContactsGroup" data-id="${entry.cust_group_id}"><i class="fa fa-trash"></i></button>
                </div>`,
            ]);
            $("#cust_group").append(`
                <option value="${entry.cust_group_id}">${entry.title.toUpperCase()}</option>
            `);
        });
    })
    .catch(err => console.error(err))

}
// popContactsGroups();

$("#cust_group_title").val('');
$(document).on('click', '#btnSaveContactsGroup', e => {
    $("#cust_group_title").trigger('focus');
    if($("#cust_group_title").val() != ""){
        $(e.target).closest("#btnSaveContactsGroup").prop('disabled', true);
        $.post(`../contacts/crud.php?ContactsGroup&empID=${activeUser.id}&${$("[type='button']#btnSaveContactsGroup").hasClass("new") && "new" || "update"}`, { groupTitle: $("#cust_group_title").val() }, resp => {
            // console.log(resp);
            $(e.target).closest("#btnSaveContactsGroup").prop('disabled', false);
            if(resp.data == 23000){
                alertify.error("Duplicate found!<br/>Title already exist.");
                $("#cust_group_title").trigger('focus');
            }
            else{
                if(resp.saved){
                    popContactsGroups();
                    alertify.success("Deleted");
                    $("#cust_group_title").val('')
                }
                else{
                    console.error(resp.data);                   
                }
            }
        }, 'json');
    }
});

$(document).on('change', '#cust_group', e => {
    $("form#crudContacts").find("input:not([type='checkbox']), select:not(#cust_group), button[type='submit'], a, label").val('').prop('disabled', !e.target.value ? true : false);
    pond.disabled = e.target.value == 0 && true || false;
});

$(document).on('click', '#ContactsGroup .swiper-slide', function(e) {
    // $("#cust_group_title").trigger('focus');
    if(e.target.id == "btnDeleteContactsGroup" || e.target.parentNode.id == "btnDeleteContactsGroup"){
        $(e.target).closest("#btnDeleteContactsGroup").prop('disabled', true);
        $.post(`../contacts/crud.php?ContactsGroup&del&empID=${activeUser.id}`, { key: $(e.target).closest('#btnDeleteContactsGroup').data('id') }, resp => {
            // console.log(resp);
            $(e.target).closest("#btnDeleteContactsGroup").prop('disabled', false);
            resp.deleted && alertify.success("Saved") && popContactsGroups() || console.log(resp);
        }, 'json');
    }
});

$(document).on('submit', 'form#crudContacts', function(e) {  
    const formData = new FormData(this),
          { cust_id, photo } = $("#crudContacts [type='submit']").hasClass("update") ? JSON.parse(_.filter($('.Contacts-card'), entry => JSON.parse(entry.dataset['ContactsProp'])['cust_id'] == $("form#crudContacts [type='submit']").attr('id'))[0].dataset['ContactsProp']) : {};
    pond.getFiles().length > 0 && formData.append('photo', pond.getFile()['file'], pond.getFile()['filename']);
    // console.log("Pond: ", pond.getFile());
    const allowedPaymentMethods = _.map($("input[name='allowed_payment_methods']:checked"), el => el.value);
    formData.append('allowed_payment_methods', JSON.stringify(allowedPaymentMethods));
    $.ajax({
        url: `../contacts/crud.php?empID=${activeUser.id}&${$("#crudContacts [type='submit']").hasClass("new") && "new" || `update&key=${cust_id}&oldFile=${photo}`}`,
        method: 'POST',
        data: formData,
        dataType: 'json',
        cache: false,
        contentType: false,
        processData: false,
        success: resp => {
            // console.log(resp);
            if(resp.data == 23000){
                alertify.error("Duplicate found!<br/>Company Name already exist.");
                $("#cust_name").trigger('focus');
            }
            else{                
                if (resp.saved || resp.updated) {
                    appSounds.oringz.play();
                    $("#cust_name").val('');
                    alertify.success(resp.saved && "Saved" || 'Updated');
                    $("form#crudContacts")[0].reset();
                    popContactsGroups();
                    popcontacts();
                    pond.removeFile();
                    if(resp.updated){
                        sessionStorage.setItem('Contacts', cust_id);
                    }
                }
                else{
                    console.error(resp);                   
                }
            }
            $(".ajax-page#billByContacts .content #top #right").find('input, select, button, textarea').prop('disabled', false);
            pond.disabled = false;
        },
        beforeSend: () => {
            $(".ajax-page#billByContacts .content #top #right").find('input, select, button, textarea').prop('disabled', true);
            pond.disabled = true; 
        }
    });
    return false;
});

$('#createContact').on('click', e => { 
    !$("#overlay_crudContacts").is(':visible') ? newContact({target: $(e.target).closest('button'), position: 'bottom left', crudOpr: 'new'}) : notif.hide($(".notifyjs-crud-Contacts-base"));   
});

let contactNumberTags, contactEmailTags;

// const initMap = params => {
//     mapboxgl.accessToken = 'pk.eyJ1Ijoic29mdGl0Z2giLCJhIjoiY2s4eHl6b2txMDBlMjNlbGNwMGZxZjYwcyJ9.9sJ8qq0zfKmQba0egzorfA';
//     if(mapboxgl.supported()) {
//         var map = new mapboxgl.Map({
//             container: params.container,
//             style: 'mapbox://styles/mapbox/streets-v11',
//             center: params.center,
//             zoom: params.zoom
//         });
        
//         const geocoder = new MapboxGeocoder({
//             // Initialize the geocoder
//             accessToken: mapboxgl.accessToken, // Set the access token
//             mapboxgl: mapboxgl, // Set the mapbox-gl instance
//             // marker: false // Do not use the default marker style
//             placeholder: ""
//         });
          
//         // Add the geocoder to the map
//         map.addControl(geocoder);

//         const marker = new mapboxgl.Marker({
//             color: "dodgerblue",
//             draggable: true
//         })
//         .setLngLat(params.center)
//         // .setPopup(new mapboxgl.Popup({closeOnClick: true}).setHTML("<h1>Hello World!</h1>"))
//         .addTo(map);

//         const popup = new mapboxgl.Popup({ closeOnClick: false })
//         .setLngLat(params.center)
//         // .setHTML('<h1>Hello World!</h1>')
//         .addTo(map);    

//         map.on('click', e => {
//             console.log(e);
//             // marker.setLngLat(e.lngLat);
//             // popup.setLngLat(e.lngLat);
//         }).on('dataloading', () => {
//             console.log('A dataloading event occurred.');
//         }).on('load', () => {
//             console.log('map loaded'); 
//             map.addSource('single-point', {
//                 type: 'geojson',
//                 data: {
//                     type: 'FeatureCollection',
//                     features: []
//                 }
//             });
            
//             map.addLayer({
//                 id: 'point',
//                 source: 'single-point',
//                 type: 'circle',
//                 paint: {
//                     'circle-radius': 10,
//                     'circle-color': '#448ee4'
//                 }
//             });
        
//             // Listen for the `result` event from the Geocoder
//             // `result` event is triggered when a user makes a selection
//             //  Add a marker at the result's coordinates
//             geocoder.on('result', (event) => {
//                 map.getSource('single-point').setData(event.result.geometry);
//                 console.log(event.result, event.result.text)
//                 // marker.setLngLat(event.result.geometry.coordinates);
//                 // popup.setLngLat(event.result.geometry.coordinates);
//                 pop(`https://api.mapbox.com/geocoding/v5/{endpoint}/{${event.result.text}}.json`)
//                 .then(data => {
//                     console.log(data)
//                 })
//                 .catch(err => console.error(err));
//             });
//         });

//         // Add geolocate control to the map.
//         map.addControl(
//             new mapboxgl.GeolocateControl({
//                 positionOptions: {
//                     enableHighAccuracy: true
//                 },
//                 // When active the map will receive updates to the device's location as it changes.
//                 trackUserLocation: true,
//                 // Draw an arrow next to the location dot to indicate which direction the device is heading.
//                 showUserHeading: true
//             })
//         );

//         map.addControl(new mapboxgl.NavigationControl());
//         map.addControl(new mapboxgl.FullscreenControl());
//         console.log(map.getContainer())
//     }
//     else{
//         alert('Your browser does not support Mapbox GL');
//     }
// }

let tableContacts = new Tabulator("#table-contacts", {
    // width: '100vw',
    height: "calc(100vh - 170px)",
    // data: tabledata,           //load row data from array
    layout: "fitColumns",      //fit columns to width of table
    layoutColumnsOnNewData: true,
    // responsiveLayout: "hide",  //hide columns that dont fit on the table
    tooltips: true,            //show tool tips on cells
    tooltipGenerationMode: "hover",
    // addRowPos: "top",          //when adding a new row, add it to the top of the table
    // history: true,             //allow undo and redo actions on the table
    selectable: 1,
    // movableColumns: true,      //allow column order to be changed
    resizableRows: false,       //allow row order to be changed
    // resizableColumns: false,
    cellVertAlign: "middle",
    // paginationSize: true,         //allow 7 rows per page of data
    initialSort: [             //set the initial sort order of the data
        // {column:"name", dir:"asc"},
    ],
    columns: [                 //define the table columns
        {title:"#", field:"", formatter: "rownum", width: 20},
        {title:"DESCRIPTION", field: "item", formatter: (cell, formatterParams, onRendered) => cell.getValue() && `${cell.getData().dim > 1 && cell.getValue().toUpperCase() + ' X ' + cell.getData().dim || cell.getValue().toUpperCase()}` || "" },
        {title:"DIM", field: "dim", hozAlign: "right", width: 55, visible: false, },
        {title:"P.LBL", field: "priceLabel", hozAlign: "right", width: 55, visible: false, },
        {title:"QTY", field: "qty", hozAlign: "right", formatter: (cell, formatterParams, onRendered) => cell.getValue() && QIHRF(cell.getValue(), cell.getData().priceLabel, cell.getData().dim), bottomCalc: (values, data, bottomCalcParams) => _.sumBy(data, entry => _.toNumber(entry.dim)*_.toNumber(entry.qty)), formatterParams: { precision: 0 }, width: 55, visible: !false },
        {title:"RATE", field: "rate", editor: false, hozAlign: "right", width: 65, visible: !false },
        {title:"AMOUNT", field: "amt", formatter: "money", hozAlign: "right", bottomCalc: (values, data, calcParams) => thousandsSeperator(_.sumBy(values, entry => _.toNumber(entry))), width: 70, visible: !false },
        // {title:"AMOUNT", field: "amt", formatter: (cell, formatterParams, onRendered) => cell.getValue() && `${QIHRF(cell.getData().qty, cell.getData().priceLabel, cell.getData().dim)} x ${cell.getData().rate}<br/>${cell.getValue()}`, hozAlign: "right", bottomCalc: (values, data, calcParams) => thousandsSeperator(_.sumBy(values, entry => _.toNumber(entry))) },
    ],    
    cellEditCancelled: cell => {
        //cell - cell component
        if(!cell.isEdited()){
            // cell.getOldValue() != "" ? cell.setValue(cell.getInitialValue() - cell.getOldValue()) : cell.restoreInitialValue();
            cell.clearValidation();
        }
    },
    cellEdited: cell => {
        // cell.getRow().update({amt: cell.getValue() * cell.getRow().getData()['rate']});
        // UpdateCartItemQty({data: cell.getRow().getData(), overwrite: true});
    },
    dataChanged: data => {
        //data - the updated table data
        // console.log(data);        
    },
    rowClick: (e, row) => {
        //e - the click event object
        //row - row component       
    },
    rowDblClick: (e, row) => {
        //e - the click event object
        //row - row component
        // console.log(e, row)
    },
    selectableCheck: row => {
        //row - row component for the selected row
        return row.getData()['item'] !== undefined;
    },
    rowSelected: row => {
        //row - row component for the selected row
    },
    rowSelectionChanged: (data, rows) => {
        // console.log(data.length && data[0]['item'] == undefined)       
    },
    printFormatter: (tableHolderElement, tableElement) => {
        //tableHolderElement - The element that holds the header, footer and table elements
        //tableElement - The table
        // console.log(tableHolderElement)       
    },
    renderStarted: data => {
        //data - the data loading into the table
        // $("#employee-table").html("<i class='fa fa-spinner fa-spin'></i>");
        // $(".my-tabulator-buttons").addClass('disabled');
    },
    renderComplete: () => {
        
    },
    tableBuilt: () => {

    },
    validationFailed: (cell, value, validators) => {
        // console.log(cell, value, validators);
        // alertify.error("Your cart contains some errors.\nPlease nip any before continuing...");
    },
    scrollToRowPosition: "bottom",
    placeholder: `No Contacts(s) data found.`
});

$('#createVendor').on('click', e => { 
    !$("#overlay_crudVendor").is(':visible') ? newContact({target: $(e.target).closest('button'), position: 'bottom left', crudOpr: 'new'}) : notif.hide($(".notifyjs-crud-vendor-base"));   
}); 

$(document).on('submit', "#overlay_crudStock form#crudVendor", e => {
    _.map($("#overlay_crudStock").find('#stockPPQ .row'), (row, i) => _.filter($(row).find('input'), (input, i2) => input.value == "" ? $(input).closest('.row').not(":first-child").remove() : addToPPQ(i, $(`#overlay_crudStock #stockPPQ .row:eq(${i})`).find('input'))));

    let crud_type = $(e.target).find('[type="submit"]').hasClass('new') ? 'new' : 'update',
        formData = new FormData(e.target);
    
    formData.append('ppq', JSON.stringify(ppq));
    crud_type == 'update' && formData.append('prod_id', $('#overlay_crudStock [type="submit"]').attr('data-prod-id'));
    
    // MAP ALL BARCODES TO ARRAY AND APPEND TO FORM DATA
    formData.append('barcode', JSON.stringify(contactNumberTags.arr));

    $.ajax({
        url: `./crud.php?stocks&${crud_type}&emp_id=${activeUser.id}`,
        type: "POST",
        dataType: 'JSON',
        data: formData,
        processData: false,
        contentType: false,
        cache: false,
        success: resp => {
            // console.log(resp);
            if (resp.saved || resp.updated) {
                $(e.target)[0].reset();
                appSounds.oringz.play();
                alertify.success(resp.saved && "Saved" || 'Updated.');
                pop('./crud.php?stocks&pop')
                .then(resp => {
                    tableStock.replaceData(resp.data);
                    tableStock.setGroupBy("title");
                });                    
                resetPPQ();
                resetTagsInput({targetEl: "#overlay_crudVendor"});
            }
            else {
                console.log(resp);
                notif.show({ 
                    el: $(e.target).find('#item_name'), 
                    title: `    
                            <div>
                                Item already exists.
                            </div>
                    `, 
                    styleName: 'duplicate-stock-flag', 
                    className: 'danger', 
                    autoHide: false, 
                    clickToHide: false, 
                    position: 'bottom center' 
                }); 
            }
            $(e.target).find('input, select, button').prop('disabled', false);
        },
        beforeSend: function () {
            notif.hide($(".notifyjs-duplicate-stock-flag-base"));
            $(e.target).find('input, select, button').prop('disabled', true);
        }
    });
    return false;
});
