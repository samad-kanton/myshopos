// $('header section:nth-child(2) a').hide();
// $(function () {

    var tableEmployees = new Tabulator("#employee-table", {
        height: "calc(100vh - 240px)",
        minHeight: 311,
        // data: resp.data,           //load row data from array
        layout: "fitColumns",      //fit columns to width of table
        cellVertAlign: "middle",
        // responsiveLayout: "collapse",  //hide columns that dont fit on the table    
        tooltips: true,            //show tool tips on cells
        addRowPos: "top",          //when adding a new row, add it to the top of the table
        history: true,             //allow undo and redo actions on the table        
        initialSort: [             //set the initial sort order of the data
            // {column: "CAT", dir: "asc"},
            {column: "fullname", dir: "asc"},
        ],
        selectable: 1,
        selectableCheck:function(row){
            //row - row component
            return row.getData().emp_id != undefined; //allow selection of rows where the age is greater than 18
        },
        index: "emp_id",
        // groupBy: "CAT",
        // autoColumns: true,
        columns: [                 
            //define the table columns
            {title: "#", headerSort: false, formatter: "rownum", width: 20},
            {title: "", field: "emp_id", visible: false},
            // {title: 'S/N', field: 'sn', headerSort: true, hozAlign: 'right', formatter: (cell, formatterParams, onRendered) => cell.getData().fullname != undefined && cell.getRow().getPosition() + 1 + '.' || '', width: 50 },
            {title: "Full Name", field: "fullname", editor: "autocomplete", editorParams: {
                showListOnEmpty:true, //show all values when the list is empty,
                freetext: true, //allow the user to set the value of the cell to a free text entry
                // allowEmpty: true, //allow empty string values
                searchFunc:function(term, values){ //search for exact matches
                    var matches = [];
            
                    values.forEach(function(value){
                        //value - one of the values from the value property
            
                        if(value.toLowerCase().indexOf(term.toLowerCase()) > -1){
                            matches.push(value);
                        }
                    });
            
                    return matches;
                },
                searchingPlaceholder: "Filtering ...", //set the search placeholder
                emptyPlaceholder: "(no matching results found)", //set the empty list placeholder
                // listItemFormatter:function(value, title){ //prefix all titles with the work "Mr"
                //     return "Mr " + title;
                // },
                values: true, //create list of values from all values contained in this column
                sortValuesList: "asc", //if creating a list of values from values:true then choose how it should be sorted
                // defaultValue: "Steve Johnson", //set the value that should be selected by default if the cells value is undefined
                elementAttributes:{
                    maxlength: "72", //set the maximum character length of the input element to 10 characters
                },
                mask: "",
                verticalNavigation:"hybrid", //navigate to new row when at the top or bottom of the selection list
            },
            formatter: (cell, formatterParams, onRendered) => cell.getValue() && cell.getValue().toUpperCase(), 
            accessorDownload: (value, data, type, params, column) => { return value.toUpperCase(); },
            validator: ["required", "unique"],
            minWidth: 150
            },
            // {title: 'Full Name', field: 'fullname', editor: "input", editorParams: { elementAttributes:{ maxlength: "50", }}, validator: ["required", "unique", "string"], formatter: (cell, formatterParams, onRendered) => cell.getValue() && cell.getValue().toUpperCase() },
            {title: "Pincode", field: "pin", formatter: (cell, formatterParams, onRendered) => { return "XXXXXX" }, editor: "input", editorParams:{ elementAttributes:{ maxlength: "6"}, mask: "******", maskAutoFill: true, maskNumberChar: "*"}, validator: ["required", "unique", "minLength: 6", "maxLength: 6", "integer"], headerSort: false, width: 70, print: false, download: false},
            {title: "Phone", field: "phone", editor: "input", editorParams:{ elementAttributes:{ maxlength: "10"}}, validator: ["required", "minLength: 10", "maxLength: 10", "integer"], headerSort: false, width: 100},
            {title: "", field: "", width: 30, headerSort: false, hozAlign: "center", tooltip: "Access Rights & Permissions", formatter: (cell, formatterParams, onRendered) => { return cell.getData()['emp_id'] != undefined && "<i class='fa fa-wrench fa-2x clr-success' onclick=''></i>" || ''; }, print: false, cellClick: (e, cell) => cell.getData()['emp_id'] != undefined && $('.ajax-page#manageUserRights').addClass('open') && $('.ajax-page#manageUserRights .title h2').html(cell.getData().fullname.toUpperCase())
                && 
                staffBioData.forEach((entry, i) => cell.getData().emp_id == entry.emp_id 
                && 
                // console.log(entry)
                Object.entries(JSON.parse(entry.rights)).forEach((right, r) => $(`.ajax-page#manageUserRights .content .modules [type='checkbox']#${right}`).prop('checked', right[1] == 'true' &&  true || false))
            )},
            {title: "", field: "", width: 30, headerSort: false, hozAlign: "center", tooltip: "Delete", formatter: (cell, formatterParams, onRendered) => { return cell.getData()['emp_id'] != undefined && "<i class='fa fa-trash fa-2x clr-danger' onclick=''></i>" || ''; }, print: false, cellClick: (e, cell) => cell.getData()['emp_id'] != undefined &&
                alertify.confirm("Confirm Delete", `<div class="txt-center">Are you sure you want to remove <br/><br/><b>${cell.getData().fullname.toUpperCase()}</b><br/><br/> from this system ?</div>`, function () {
                    $.post(`./crud.php?delete`, {key: cell.getData().emp_id}, function (resp) {
                        if(resp.deleted){
                            tableEmployees.deleteRow(cell.getData().emp_id)
                            .then(function(){
                                //run code after row has been deleted
                               appSounds.oringz.play();
                                alertify.error('Deleted.');
                            })
                            .catch(function(error){
                                //handle error deleting row
                                console.log(error);
                            });
                        }
                    }, 'JSON');
                }, function () { }).set('labels', { ok: 'Yes', cancel: 'No' })
            },
        ],
        tooltipsHeader: true, //enable header tooltips
        tooltipGenerationMode: "hover", //regenerate tooltip as users mouse enters the cell;
        cellEditing: function(cell){
            //cell - cell component
            // cell.getField() == "qty_wh" ? cell.setValue("") : '';
        },
        cellEditCancelled: function(cell){
            //cell - cell component
            if(!cell.isEdited()){
                // cell.getOldValue() != "" ? cell.setValue(cell.getInitialValue() - cell.getOldValue()) : cell.restoreInitialValue();
                cell.clearValidation();
            }
        },
        cellEdited: function(cell){
            //cell - cell component
            if(cell.isValid() && _.trim(cell.getValue()) != cell.getOldValue()){
                const crudRecord = (crud_type) => {
                    $.ajax({
                        url: `./crud.php?${crud_type}&emp_id=${activeUser.id}`,
                        type: "POST",
                        dataType: 'JSON',
                        data: crud_type == "new" && cell.getData() || { emp_id: cell.getData().emp_id, col: cell.getField(), oldValue: cell.getOldValue(), newValue: cell.getValue() },
                        success: function (rsp) {
                            if (rsp.saved || rsp.updated) {
                               appSounds.oringz.play();
                                alertify.success(rsp.saved && "Saved" || 'Updated.');
                                cell.getRow().getElement().classList.remove("new-record");
                                // console.log(cell.getRow().getElement());
                                // cell.getRow().reformat();
                                pop('./crud.php?pop')
                                .then(resp => {
                                    tableEmployees.replaceData(resp.data);
                                });
                            }
                            else {
                                console.log(rsp);
                            }
                        },
                        beforeSend: function () {
                            
                        }
                    });
                }
                !cell.getRow().getElement().classList.contains("new-record") &&
                alertify.confirm("Confirm Update", `${cell.getField() == "item" ? `Change from <br/><br/><b class="clr-danger">${cell.getOldValue()}</b><br/><br/>To<br/><br/><b class="clr-success">${cell.getData()[cell.getField()]}</b> ?` : `${cell.getOldValue() == "" || cell.getOldValue() == undefined ? "Set" : `Change from <br/><br/><b class="clr-danger">${cell.getOldValue()}</b><span style="margin: 0 20px;">To</span>`} <b class="clr-success">${cell.getData()[cell.getField()]}</b><span style="margin: 0 20px;">For</span><br/></br/><b>${cell.getData().fullname.toUpperCase()} ?`}</b>`, function () {
                    crudRecord("update")
                }, function () { 
                    cell.setValue(cell.getOldValue());
                }).set('labels', { ok: 'Yes', cancel: 'No' }).set('closableByDimmer', false) || 
                cell.getRow().validate() && !tableEmployees.getInvalidCells().length && crudRecord("new");   
            }
        },
        validationFailed: function(cell, value, validators){
            //cell - cell component for the edited cell
            //value - the value that failed validation
            //validatiors - an array of validator objects that failed
            // console.log(cell, value, validators);
        },
        rowFormatter: function(row){
            // console.log(row.getCell('emp_id').getValue(), row.getPosition() == 0 && row.getCell('emp_id').setValue(10000));
            row.getData()['emp_id'] == undefined && row.getElement().classList.add('new-record');
        },
        dataLoading: function(data){
            //data - the data loading into the table
            // $("#employee-table").html("<i class='fa fa-spinner fa-spin'></i>");
            $(".my-tabulator-buttons").addClass('disabled');
        },
        dataLoaded: function(data){
            //data - all data loaded into the table
            // $("#employee-table").html(data);
            // $(".my-tabulator-buttons").removeClass('disabled');
        },
        dataChanged: function(data){
            //data - the updated table data
        },
        pagination: "local",       //paginate the data
        paginationSize: 100,         //allow 7 rows per page of data
        paginationSizeSelector: true, //enable page size select element and generate list options
        printAsHtml: true, //enable html table printing
        printStyled: true, //copy Tabulator styling to HTML table
        printRowRange: "all",
        // printVisibleRows: false,
        // printHeader: `<center><h1 style="margin: 10px 0;">CRUNCHY CREME</h1><p style="margin-top: 0">OPP. KEN CITY BUILDING, MADINA MARKET</p><p>GENERAL STOCK OVERVIEW</p></center>`,
        printFooter: `<div style="display: flex; justify-content: space-between; align-items: center;"><p>MyShop OS v0.2</p><p>Software By: Samad Kanton</p></center>`,
        placeholder: "No Data Available", //display message to user on empty table
    });
    
    // if(companyProfile){
        pop('./crud.php?pop')
        .then(resp => {
            tableEmployees.setData(resp.data);
            tableEmployees.options.printHeader = `
                <div style="font-family: verdana; display: grid; grid-template-columns: auto 1fr auto; justify-content: space-between;">
                    <section><img src='../assets/img/KrunchyCreme_Logo.jpg' alt='KrunchyCreme Logo' width='160px' height='150px'></section>
                    <section style="text-align: center;"><h1 style="margin: 10px 0;">${companyProfile[0]['comp_name']}</h1><p style="margin-top: 0">${companyProfile[0]['addr']}</p><p style="margin-top: 0">0${companyProfile[0]['phone']} / 0${companyProfile[0]['mobile']}</p><p>EMPLOYEE BIO DATA</p></section>
                    <section><img src='../assets/img/KrunchyCreme_Logo.jpg' alt='KrunchyCreme Logo' width='160px' height='150px'></section>
                </div>
            `;
        });
    // }

    $(document).on('input', '#search_stock', function(e){    
        tableEmployees.setFilter([
            // {},
            // Nested filter OR Object
            [
                {field: "item", type: "like", value: e.target.value},
                {field: "barcode", type: "like", value: e.target.value}
            ]
        ]);
        e.target.value == "" && tableEmployees.clearFilter();;
    });
    $('#search_stock').val() && $('#search_stock').trigger('input');

    $(document).on('click', '#createStock', function(e){    
        tableEmployees.addRow();
    });

    $(document).on('click', '#printStock', function(e){    
        tableEmployees.print("", true);
    });

    $(document).on('click', '#exportStock_excel', function(e){    
        tableEmployees.download("xlsx", "data.xlsx", {sheetName:"My Data"});
    });

    $(document).on('click', '#exportStock_pdf', function(e){    
        tableEmployees.download("pdf", "data.pdf", {
            orientation:"portrait", //set page orientation to portrait
            title: "General Stock Report", //add title to report
            autoTable:{ //advanced table styling
                styles: {
                    // fillColor: [100, 255, 255]
                },
                columnStyles: {
                    // id: {fillColor: 255}
                },
                margin: {right: 5, bottom: 5, left:5},
            },
        });
    });

    $(document).on('change', ".ajax-page#manageUserRights .content .modules [type='checkbox']", function(e){
        let rights = Object.create(null), update_emp_id = tableEmployees.getSelectedData()[0]['emp_id'];
        for (let i = 0; i < $(".ajax-page#manageUserRights .content .modules [type='checkbox']").length; i++) {
            rights[$(".ajax-page#manageUserRights .content .modules [type='checkbox']")[i].name] = $(".ajax-page#manageUserRights .content .modules [type='checkbox']")[i].checked;
        }
        // console.log(tableEmployees.getSelectedData()[0]['emp_id'], rights)
        $.ajax({
            url: `./crud.php?update_staffBioData&emp_id=${activeUser.id}`,
            type: "POST",
            dataType: 'JSON',
            // data: {[e.target.name]: e.target.checked},
            data: {update_emp_id, rights},
            success: function (rsp) {
                if (rsp.saved || rsp.updated) {
                   appSounds.oringz.play();
                    alertify.success(rsp.saved && "Saved" || 'Updated.');
                    pop('./crud.php?pop').then(resp =>  staffBioData = resp.data);
                }
                else {
                    console.log(rsp);
                }
                $(".ajax-page#manageUserRights .content center [type='checkbox']").prop('disabled', false);
            },
            beforeSend: function () {
                $(".ajax-page#manageUserRights .content center [type='checkbox']").prop('disabled', true);
            }
        });
    });
    
    // let staffBioData;
    // pop('./crud.php?pop').then(resp =>  staffBioData = resp.data);

    // $(document).on('click', 'header section:nth-child(2) a', function(e){    
    //     let update_emp_id = activeUser.id, routeTo = $(e.target).closest('a')[0].href.split('/').splice(-2)[0], _authorized;
    //     // console.log(routeTo, $(e.target).closest('a')[0].classList.contains('active'));
    //     staffBioData.forEach((entry, i) => _authorized = update_emp_id == entry.emp_id
    //         && 
    //         JSON.parse(entry.rights).hasOwnProperty(routeTo)
    //         &&
    //         JSON.parse(entry.rights)[routeTo]
    //     );
    //     // console.log(_authorized);
    //     if(_authorized == 'true' || $(e.target).closest('a')[0].classList.contains('active')){
    //         return true;
    //     }
    //     alertify.alert("Access Denied!!!", "<div class='clr-danger'>You do not have sufficient rights to access this page.</div><br/>Please contact your System Administrator.");
    //     return false;
    // });

    // $(document).on('click', '.ajax-page#manageUserRights .title a.close', e => tableEmployees.getSelectedData().length > 0 && tableEmployees.deselectRow(tableEmployees.getSelectedData()[0].emp_id));
    
    // $('header section:nth-child(2) a').fadeIn();
// });