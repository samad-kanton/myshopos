import { activeUser,appSounds, pop, Notif, popCountries, thousandsSeperator, uploadFiles, myUploader, displayFiles } from '../assets/js/utils.js';
import { checkAuth, printTableData, exportTableData } from '../assets/js/event.js';
import { TabulatorFull as Tabulator } from '../assets/plugins/tabulator-master/dist/js/tabulator_esm.min.js';
import acrData from './acr.js';

const notif = new Notif();

let companyProfile, tableStaff, acrTable, rights, uRoles = {"Admin": 1, "User": 2};
pop('../config/crud.php?pop')
.then(async resp => {
    companyProfile = await resp.data;

    pop('./crud.php?pop')
    .then(resp => {
        tableStaff.setData(resp.data);
    });

    $(document).on('input', '#search_staff', function(e){    
        let filters = [];
        _.map(tableStaff.getColumns(), col => filters = [...filters, {field: col.getField(), type: "like", value: _.trim(e.target.value)}]);
        tableStaff.setFilter([
            // {},
            // Nested filter OR Object
            filters
        ]);
        e.target.value == "" && tableStaff.clearFilter();;
    });
    $('#search_staff').val() && $('#search_staff').trigger('input');

    $(document).on('click', '#createStock', e => {    
        tableStaff.addRow();
    });

    $(document).on('click', '#printStaff', e => {
        printTableData({table: tableStaff, title: "Staff Bio Data"});
    });

    $(document).on('click', '#exportStaff_excel', e => {
        exportTableData({table: tableStaff, type: "xlsx", fileName: "staff_profile.xlsx", opts: { sheetName: "Staff Profile" } })
    });

    $(document).on('click', '#exportStaff_pdf', function(e){
        exportTableData({table: tableStaff, type: "pdf", fileName: "data.pdf", 
            opts: {
                orientation: "portrait", //set page orientation to portrait
                title: "Staff Bio Data", //add title to report
                autoTable: { //advanced table styling
                    styles: {
                        // fillColor: [100, 255, 255]
                    },
                    columnStyles: {
                        // id: {fillColor: 255}
                    },
                    margin: {right: 5, bottom: 5, left:5},
                },
            } 
        });
    }); 
});

let staffPhotos;
const openCrudStaffOverlay = params => {
    // console.log(params)
    notif.show({ 
        el: params.target, 
        title: `    
                <div id="overlay_crudStaff" style="width: calc(100vw - 7vw); max-width: 768px; background: aliceblue;">
                    <div style="display: flex; justify-content: space-between; align-items: center; box-shadow: 0 3px 10px 0 rgba(0, 0, 0, .4);">
                        <section style="display: grid; grid-template-columns: auto auto; gap: 20px; align-items: center;">
                            <a href="javascript:void(0);" class="close no-udl clr-default" style="transform: scale(1.5); padding: 10px;" onclick="notif.hide($('.notifyjs-crud-staff-base'));"><i class="fa fa-chevron-left"></i></a> 
                            <span style="text-overflow: ellipsis; overflow: hidden; whitespace: nowrap;">${params.crudOpr == 'new' ? '<u>N</u>ew Staff' : `<u>U</u>pdate <b>${_.toUpper(params.data.fullname)}`}</b></span>
                        </section>
                        <button type="button" id="btnTriggerSubmitter" class="btn clr-${params.crudOpr == 'new' ? 'primary' : 'success'}" onclick="$(event.target).closest('#overlay_crudStaff').find('#btnSubmitForm').trigger('click');" style="margin: 0 10px; background: none; border: none;">${params.crudOpr == 'new' ? '<i class="fa fa-save"></i> Save' : '<i class="fa fa-pencil"></i> Update'}</button>
                    </div>
                    <div style="height: calc(100vh - 190px); min-height: 200px; overflow-y: auto;">
                        <form role="form" id="crudStaff" autocomplete="off">
                            <div class="row">
                                <div class="cl-4 cm-4 cs-4 cx-12">
                                    <div class="form-group">
                                        <div id="uppy-staff-photo"></div>
                                    </div>
                                </div>
                                <div class="cl-8 cm-8 cs-8 cx-12 row">
                                    <div class="cl-5 cm-5 cs-6 cx-6">
                                        <div class="form-group">                                            
                                            <section style="display: flex; padding-top: 20px;">
                                                <label for="urole" class="floated-up-lbl" style="top: -5px;">User Role</label>
                                                <div class="radiobox">
                                                    <input type="radio" name="urole" id="admin" class="custom-checkbox" value="Admin"><label for="admin" style="cursor: pointer;">&nbsp;Admin</label>
                                                </div>&nbsp;&nbsp;
                                                <div class="radiobox">
                                                    <input ${params.crudOpr == 'new' ? 'checked' : ''} type="radio" name="urole" id="user" class="custom-checkbox" value="User"><label for="user" style="cursor: pointer;">&nbsp;User</label>
                                                </div>
                                            </section>
                                            <sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>
                                        </div>
                                    </div>                                   
                                    <div class="cl-7 cm-7 cs-6 cx-6">
                                        <div class="form-group">
                                            <input type="text" name="fullname" id="fullname" class="txt-u" required>
                                            <label for="fullname" class="floated-up-lbl">Full Name</label>
                                            <sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>
                                        </div>
                                    </div>                     
                                    <div class="cl-3 cm-3 cs-3 cx-3">
                                        <div class="form-group">
                                            <div>
                                                <input type="text" minlength="6" maxlength="6" name="pin" id="pin" required>
                                                <label for="pin" class="floated-up-lbl">Login Pin</label>
                                                <sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>
                                            </div>
                                        </div>
                                    </div>  
                                    <div class="cl-7 cm-7 cs-6 cx-7">
                                        <div class="form-group">
                                            <input type="tel" minlength="10" maxlength="10" name="phone" id="phone" required>
                                            <label for="phone" class="floated-up-lbl">Phone</label>
                                            <sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>
                                        </div>
                                    </div>  
                                    <div class="cl-2 cm-2 cs-3 cx-2">
                                        <div class="form-group">
                                            <div class="checkbox" style="padding-top: 15px;">
                                                <input hidden ${params.crudOpr == 'new' ? 'checked' : ''} type="checkbox" name="isActive" id="isActive" class="custom-checkbox" value="1"><label for="isActive" style='cursor: pointer;'>&nbsp;Yes</label>
                                            </div>
                                            <label for="isActive" class="floated-up-lbl" style="top: -5px;">Active?</label>
                                        </div>
                                    </div>                                                                
                                </div>
                            </div>
                            <button hidden type="submit" class="btn btn-default ${params.crudOpr == 'new' ? 'new' : 'update'}" id="btnSubmitForm">${params.crudOpr}</button>
                        </form>
                        <div id="acr-table" style="margin: 0 10px;"></div>
                    </div>
                </div>
        `, 
        styleName: 'crud-staff', 
        className: 'default', 
        autoHide: false, 
        clickToHide: false, 
        position: params.position 
    });

    staffPhotos = myUploader({
        uppyID: 'staffPhotos', 
        restrictions: {
            maxFileSize: 2048000,
            minFileSize: null,
            // maxTotalFileSize: 3072000,
            maxNumberOfFiles: 1,
            minNumberOfFiles: null,
            allowedFileTypes: ['.jpg', '.jpeg', '.png'],
            requiredMetaFields: [],
        },
        plugins: {
            Dashboard: {
                id: `Dashboard`,
                theme: 'light',
                trigger: '#btnOpenModalUppyFiles',
                inline: true,
                target: '#uppy-staff-photo',
                showProgressDetails: true,
                note: `1 Image of 2MB maximum size. JPEG, PNG or GIF recommended.`,
                height: 'auto',
                waitForThumbnailsBeforeUpload: true,
                // showRemoveButtonAfterComplete: true,
                doneButtonHandler: () => {},
                browserBackButtonClose: false,
                plugins: ['Webcam', 'ScreenCapture', 'ImageEditor', 'XHRUpload'],
                proudlyDisplayPoweredByUppy: false,
                waitForThumbnailsBeforeUpload: true,
                validateStatus(statusCode, responseText, response){
                    console.log(statusCode, responseText, response)
                },
                hideUploadButton: true,
                locale: {
                    strings: {
                        // dropPasteImportFiles: 'Drop files here, %{browseFiles} or import from:',
                        dropPasteImportFiles: `Photo - 2MB max`,
                    }
                },
            },
            Webcam: { target: Uppy.Dashboard },
            ScreenCapture: { target: Uppy.Dashboard },
            ImageEditor: { target: Uppy.Dashboard },
            XHRUpload: { endpoint: './crud.php', bundle: true, formData: true, fieldName: 'files[]'},
            DropTarget: { target: document.body }
        },
        callbacks: {
            complete: result => {
                console.log("Files Response: ", result.successful[0].response.body)
                console.log("Upload complete! We've uploaded these files:", result.successful)
            }
        }
    });

    acrTable = new Tabulator("#acr-table", {
        // minHeight: 311,
        // maxHeight: "calc(100vh - 420px)",
        data: acrData,           //load row data from array
        layout: "fitColumns",      //fit columns to width of table
        responsiveLayout: "collapse",  //hide columns that dont fit on the table    
        index: "emp_id",
        groupBy: "module",
        groupHeader: (value, count, data) => {
            count = _.size($(data[0].rights).find('[type="checkbox"]'));
            return `<span style="font-weight: bold;">${value}</span> - ${count} (${count === 1 ? "right" : "rights"})
                    <span class="checkbox" style="padding: 5px; position: absolute; top: -2px; right: 0;">
                        <input hidden type="checkbox" id="all_${value}" class="custom-checkbox check_row" style="padding: 5px;">
                        <label for="all_${value}" style="cursor: pointer;">&nbsp;All</label>
                    </span>
            `;
        },
        // autoColumns: true,
        columns: [                 
            //define the table columns
            {formatter: "rowSelection", titleFormatter: "rowSelection", headerSort: false, width: 20, visible: false },
            {title: "Module", field: "module", formatter: (cell, formatterParams, onRendered) => cell.getValue() && cell.getValue().toUpperCase(), width: 100, visible: false },
            {title: "Access Controls", field: "rights", headerSort: false, formatter: (cell, formatterParams, onRendered) => {
                return cell.getValue();
            } },
        ],
        columnDefaults: {
            vertAlign: "middle",
        },
        rowFormatter: row => {
            //row - row component
            // console.log(row);
            const rowEl = row.getElement(), data = row.getData();
            rowEl.style = 'background: aliceblue; color: #000; border: solid 1px #ccc;';
        },
        printAsHtml: true, //enable html table printing
        printStyled: true, //copy Tabulator styling to HTML table
    });

    acrTable.on('tableBuilt', () => {
        if(params.crudOpr == "update"){
            let { emp_id, fullname, pin, phone, urole, photos, active, rights } = params.data;

            rights = !_.isNull(rights) ? JSON.parse(rights) : [];
        
            // SET ITEM ID TO UPDATE
            $('#overlay_crudStaff [type="submit"]').attr('data-emp-id', emp_id);

            _.map(acrTable.getRows(), rows => {
                let module = _.toLower($(rows.getElement()).find('.tabulator-cell:eq(1)').text());
                // console.log(rights[module]);
                !_.isUndefined(rights) && _.forEach($(rows.getElement()).find('.tabulator-cell [type="checkbox"]'), checkbox => {
                    (rights && !_.isUndefined(rights[module])) && $(checkbox).prop('checked', rights[module][checkbox.id]);
                });
            });

            // refresh event listeners for checkboxes by creating user rights object
            $('.tabulator#acr-table .tabulator-cell [type="checkbox"]:not(:first)').trigger('change');

            $("#crudStaff #fullname").val(_.toUpper(fullname));
            $("#crudStaff #pin").val(pin);
            $("#crudStaff #phone").val(phone);
            $(`#crudStaff [name="urole"][value="${urole}"]`).prop('checked', true);
            $("#crudStaff #isActive").prop('checked', active == 1 ? true : false); 
            // !_.isNull(photo) && fetchFile({path: `../uploads/staff/${photo}`, file: photo, picker: staffPhotos});
            photos && displayFiles({instance: staffPhotos, data: JSON.parse(photos), loc: '../uploads/staff'});
        }
    });
    
    $(document).on('change', '[name="urole"]', e => {
        params.crudOpr != "update" && _.forEach(acrTable.getGroups(), group => $(group.getElement()).find('[type="checkbox"]').prop('checked', (e.target.checked && e.target.value == "Admin")).trigger('change'));
    });
 
    $(document).on('change', '.check_row', e => {
        $(e.target).closest('.tabulator-row').next('.tabulator-row').find('.tabulator-cell:nth-child(3) [type="checkbox"]').prop('checked', e.target.checked).trigger('change');
    });

    // When all children rights are checked, parent check_all box is also checked
    $(document).on('change', '.tabulator#acr-table .tabulator-cell:not(:first-child) [type="checkbox"]', e => {
        let qoCheckboxes = _.size($(e.target).closest('.tabulator-cell:not(:first-child)').find('[type="checkbox"]')),
            qoCheckboxesChecked = _.size($(e.target).closest('.tabulator-cell:not(:first-child)').find('[type="checkbox"]:checked'));
        $(e.target).closest('.tabulator-row').prev('.tabulator-row').find('[type="checkbox"].check_row').prop('checked', (qoCheckboxes == qoCheckboxesChecked));

        rights = {};
        
        _.map(acrTable.getRows(), (row, i) => {
            let module = _.toLower($(row.getElement()).find('.tabulator-cell:eq(1)').text()), rowEl = $(row.getElement());
            rights[module] = {};
            _.forEach(rowEl.find('.tabulator-cell [type="checkbox"]:not(:first)'), checkbox => {
                rights[module][checkbox.id] = $(checkbox).is(':checked');
            });
        });
        let sto = setTimeout(() => { clearInterval(sto); $(e.target).trigger('change');  }, 1000);
    });
}

tableStaff = new Tabulator("#employee-table", {
    height: "calc(100vh - 160px)",
    minHeight: 311,
    layout: "fitColumns",      //fit columns to width of table
    responsiveLayout: "collapse",  //hide columns that dont fit on the table      
    initialSort: [             //set the initial sort order of the data
        {column: "fullname", dir: "asc"},
        {column: "urole", dir: "asc"}
    ],
    selectable: 1,
    selectableCheck: row => {
        return row.getData().emp_id != undefined;
    },
    index: "emp_id",
    groupBy: "urole",
    groupHeader: (value, count, data) => {
        return `${value} <span style='font-weight: bold;'>[ ${count + (count === 1 ? " profile" : " profiles")} ]</span>`;
    },
    columns: [                 
        //define the table columns
        {title: "#", headerSort: false, formatter: "rownum", width: 20},
        {title: "", field: "emp_id", visible: false},
        {title: "Photo", field: "photos", headerSort: false, formatter: (cell, formatterParams, onRendered) => { return !_.isUndefined(cell.getData().emp_id) ? `<img src="${formatterParams.urlPrefix}/staff/${cell.getValue() ? `${JSON.parse(cell.getValue())[0]}` : `avatar.jpg`}" alt="${cell.getData().item} photo" width="${formatterParams.width}" height="${formatterParams.height}" /></div>` : ""; }, formatterParams: { width: "100%", height: 50, urlPrefix: '../uploads', }, width: 60, responsive: 0},
        {title: "Full Name", field: "fullname", formatter: (cell, formatterParams, onRendered) => cell.getValue() && _.toUpper(cell.getValue()), minWidth: 150 },
        {title: "Role", field: "urole", width: 60, visible: false },
        {title: "Phone", field: "phone", width: 100, print: true, download: true },
        {title: "", field: "action.update", width: 30, headerSort: false, hozAlign: "center", tooltip: (e, cell, onRendered) => `Update ${cell.getData().fullname && _.toUpper(cell.getData().fullname)}`, formatter: (cell, formatterParams, onRendered) => { return cell.getData().emp_id != undefined && "<i class='fa fa-edit fa-2x clr-success'></i>" || ''; }, print: false, responsive: 0 },
        {title: "", field: "action.delete", width: 30, headerSort: false, hozAlign: "center", tooltip: "Delete", formatter: (cell, formatterParams, onRendered) => { return (cell.getData().emp_id != undefined && cell.getData().active != 0) && "<i class='fa fa-trash fa-2x clr-danger' onclick=''></i>" || ''; }, print: false, responsive: 0 },
    ],
    columnDefaults: {
        vertAlign: "middle",
    },  
    rowFormatter: row => {
        var tr = row.getElement(), data = row.getData(), cellContents = '';
        if(!_.isUndefined(row.getData().emp_id)){
            data.active == 0 ? $(tr).css({'background': '#dc3545', 'color': '#fff'}) : $(tr).css({'background': '', 'color': ''});
        }
    },
    dataLoaderLoading: `<div style='display:inline-block; border:4px solid #333; border-radius:10px; background:#fff; font-weight:bold; font-size:16px; color:#000; padding:10px 20px;'>Loading Data</div>`,
    dataLoaderError: `<div style='display:inline-block; border:4px solid #D00; border-radius:10px; background:#fff; font-weight:bold; font-size:16px; color:#590000; padding:10px 20px;'>Loading Error</div>`,
    pagination: true, 
    paginationSize: 100,      
    paginationSizeSelector: true, //enable page size select element and generate list options
    // printFooter: `<div style="display: flex; justify-content: space-between; align-items: center;"><p>MyShop OS v0.2</p><p>Software By: Samad Kanton</p></center>`,
    placeholder:"No Data Available",
});

tableStaff.on('cellEditCancelled', cell => {
    !cell.isEdited() && cell.clearValidation();
});

tableStaff.on('rowClick', (e, row) => {
    !row.isSelected() && row.select();
});

tableStaff.on('cellClick', (e, cell) => {
    // console.log(cell.getField())
    let { emp_id, active } = cell.getData();
    if(cell.getField() == 'action.update'){
        openCrudStaffOverlay({target: $('#createStaff'), position: 'bottom left', crudOpr: 'update', data: cell.getData()});
    }
    else if(cell.getField() == 'action.delete'){
        tableStaff.alert(`
            <div class="txt-center">Are you sure you want to remove <br/><br/><b>${_.toUpper(cell.getData().fullname)}</b><br/><br/> from this system ?</div>
            <hr/>
            <div class="txt-right">
                <button typ3="button" class="btn btn-danger" id="btnProceedDelete">Yes</button>
                <button typ3="button" class="btn" id="btnAbortDelete">No</button>
            </div>
        `, "error");
    }

    $("#btnAbortDelete").on('click', e => tableStaff.clearAlert());

    $("#btnProceedDelete").on('click', e => {
        let { emp_id } = cell.getData();
        $.post(`./crud.php?delete`, {key: cell.getData().emp_id}, resp => {
            if(resp.deleted){
                appSounds.oringz.play();
                alertify.error('Deleted.');
                tableStaff.updateRow(emp_id, { active: 0 });
                cell.getRow(emp_id).reformat();
                tableStaff.setGroupBy('urole');
                $("#btnAbortDelete").trigger('click');
            }
        }, 'JSON');
    });
});

$("#createStaff").on('click', e => {
    !$("#overlay_crudStaff").is(':visible') ? openCrudStaffOverlay({target: $(e.target).closest('button'), position: 'bottom left', crudOpr: 'new'}) : notif.hide($('.notifyjs-crud-staff-base'));         
});

$(document).on('submit', "form#crudStaff", e => {
    try {
        let formData = new FormData(e.target), 
            crud_type = $(e.target).find('[type="submit"]').hasClass('new') ? 'new' : 'update',
            { emp_id, photos } = crud_type != "new" ? tableStaff.getSelectedData()[0] : { emp_id: null, photos: null },
            fileNames = _.map(staffPhotos.getFiles(), file => file.name);

        // console.log(fileNames, crud_type, emp_id, photos, fileNames)
        
        _.size(rights) && formData.append('rights', JSON.stringify(rights));
        crud_type == 'update' && formData.append('emp_id', emp_id);

        _.size(staffPhotos.getFiles()) > 0 && formData.append('staff_avatar', staffPhotos.getFiles()[0].data);
        
        // ASSERT OPERATION TYPE FOR PRODUCT ID UPDATE
        if(crud_type == 'update'){
            formData.append('emp_id', emp_id);
            // console.log(_.xor(fileNames, JSON.parse(photos)), JSON.parse(photos))
            _.size(_.xor(fileNames, JSON.parse(photos))) > 0 && formData.append('oldFiles', JSON.stringify(_.xor(fileNames, JSON.parse(photos))));
        }

        ((crud_type == "new" || _.size(_.difference(fileNames, JSON.parse(photos))) > 0)) && _.map(staffPhotos.getFiles(), (file, i) => formData.append(`files[${i}]`, file.data, file.name));

        $.ajax({
            url: `./crud.php?${crud_type}&emp_id=${activeUser.id}`,
            type: "POST",
            dataType: 'JSON',
            data: formData,
            processData: false,
            contentType: false,
            cache: false,
            success: resp => {
                console.log(resp)
                if (resp.saved || resp.updated) {
                    appSounds.oringz.play();
                    $(e.target)[0].reset();
                    $("#fullname").trigger('focus');
                    alertify.success(resp.saved && "Saved" || 'Updated.');
                    
                    if(resp.saved){
                        pop('./crud.php?pop')
                        .then(resp => {
                            tableStaff.replaceData(resp.data);
                        });
                        $('[name="urole"]').trigger('checked');
                    }
                    else{
                        if(resp.updated){
                            notif.hide($('.notifyjs-crud-staff-base'));                  
                            let updatedDataSet = {};
                            for(let pair of formData.entries()){
                                updatedDataSet[pair[0]] = pair[1];
                            }

                            // IF D/F IN FILES, OVERWRITE PHOTOS COLUMN WITH STRINGIFIED PHOTOS OBJECT
                            _.size(_.xor(fileNames, JSON.parse(photos))) > 0 ? updatedDataSet.photos = JSON.stringify(!resp.is_uploaded_files ? (resp.updatePhotos == "NULL" ? undefined : JSON.parse(photos)) : resp.myFileUploaderFiles) : '';

                            updatedDataSet.active = _.isUndefined(updatedDataSet.isActive) ? 0 : 1;
                            tableStaff.updateRow(emp_id, updatedDataSet);
                            tableStaff.getRow(emp_id).reformat();
                            // tableStaff.setGroupBy('urole');
                            // console.log("updatedDataSet: ", updatedDataSet);
                        }
                    }
                    checkAuth({currentUser: activeUser});
                    staffPhotos.reset();
                }
                else {
                    console.log(resp);
                }
                $(e.target).find('input, select, button').prop('disabled', false);
                // uncheck/reset all checked rights
                $('.tabulator#acr-table .tabulator-cell [type="checkbox"]').prop('checked', false).trigger('change');
            },
            beforeSend: () => {
                // $(e.target).find('input, select, button').prop('disabled', true);
            }
        });
    } 
    catch (error) {
        console.log(error);
    }
    
    return false;
});
