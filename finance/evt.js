import { activeUser, appSounds, SystemPrefs, pop, popCountries, Swiper, thousandsSeperator, Notif, setPrintHeader } from '../assets/js/utils.js';
import { staffBioData } from '/assets/js/event.js';
import { TabulatorFull as Tabulator } from '../assets/plugins/tabulator-master/dist/js/tabulator_esm.min.js';

let companyProfile;
pop('../config/crud.php?pop').then(resp => companyProfile = resp.data);

var tableAccounts = new Tabulator("#accounts-table", {
    // width: '100vw',
    height: "calc(100vh - 220px)",
    // data: tabledata,           //load row data from array
    layout: "fitColumns",      //fit columns to width of table
    layoutColumnsOnNewData: true,
    addRowPos: "top",   
    index: "acc_id",       //when adding a new row, add it to the top of the table
    // history: true,             //allow undo and redo actions on the table
    selectable: 1,
    // movableColumns: true,      //allow column order to be changed
    resizableRows: false,       //allow row order to be changed
    // resizableColumns: false,
    pagination: "local",       //paginate the data
    paginationSize: 100,         //allow 7 rows per page of data
    paginationSizeSelector: true, //enable page size select element and generate list options        //allow 7 rows per page of data
    // paginationAddRow: "table", //add rows relative to the table
    initialSort: [             //set the initial sort order of the data
        {column: "regdate", dir: "desc"},
    ],
    // persistence: true, //enable table persistence
    // persistentLayout: true, //Enable column layout persistence
    columns: [                 //define the table columns
        {title:"#", field:"", formatter: "rownum", visible: !false, print: true, width: 20},
        {title: "DATE", field: "regdate", headerSort: false, visible: false },
        {title: "ID", field: "acc_id", sorter:"exists", visible: false },
        {title: "ACCOUNT NAME", field: "acc_name", editor: 'input', formatter: (cell, formatterParams, onRendered) => cell?.getValue() && _.toUpper(cell.getValue()), validator: ["required", "unique"], minWidth: 150},
        {title: "TYPE", field: "acc_type", editor: "select", editorParams: { sortValuesList: true, listItemFormatter: (value, title) => title.toUpperCase(), values: ['Dividends','Expenses','Assets','Liabilities','Equity','Revenue'], verticalNavigation: "hybrid"}, formatter: (cell, formatterParams) => cell.getValue() && _.toUpper(cell.getValue()), validator: "required", width: 100},
        {title: "REFERENCE", field: "acc_num", editor: 'input', validator: ["required", "unique"], width: 150},
        {title: "ADDRESS", field: "acc_addr", editor: 'input', width: 150},
        {title: "DESCRIPTION", field: "memo", editor: 'input', validator: "required", minWidth: 300},
        {title: "", field: "", width: 30, headerSort: false, hozAlign: "center", tooltip: "Delete", formatter: (cell, formatterParams, onRendered) => { return cell.getData()['acc_id'] != undefined && "<i class='fa fa-trash fa-2x clr-danger' onclick=''></i>" || ''; }, print: false, cellClick: (e, cell) => {
            cell.getData()['acc_id'] != undefined &&
            alertify.confirm("Confirm Delete", `<div class="txt-center">Are you sure you want to remove <br/><br/><b>${_.toUpper(cell.getData()['acc_name'])}</b><br/><br/> from this system ?</div>`, 
                function () {
                    $.post(`./crud.php?accounts&delete`, {key: cell.getData().acc_id}, function (resp) {
                        if(resp.deleted){
                            tableAccounts.deleteRow(cell.getData().acc_id)
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
                }, 
                function () { }).set('labels', { ok: 'Yes', cancel: 'No' });
            },
            // frozen: true.
        }
    ],
    columnDefaults: {
        tooltip: true,
        vertAlign: "middle"
    },
    placeholder: `No Data Available at the moment`,
    rowFormatter: row => {
        var element = row.getElement(), data = row.getData(), cellContents = '';
        //clear current row data
        // while(element.firstChild) element.removeChild(element.firstChild);
        row.getData().acc_id == undefined && row.getElement().classList.add('new-record');
    },
    printRowRange: () => {
        //only copy rows to print where the acc_id is defined
        return this.getRows().filter((row) => {
            console.log(row.getData().acc_id)
            return row.getData().acc_id != undefined;
        });
    }
});

tableAccounts.on("cellEdited", cell => {
        //cell - cell component
        // console.log(cell.getValue() != cell.getOldValue(), cell.getOldValue() == cell.getInitialValue(), cell)
        if(cell.isValid() && _.trim(cell.getValue()) != cell.getOldValue()){
            const crudRecord = (crud_type) => {
                $.ajax({
                    url: `./crud.php?accounts&${crud_type}&emp_id=${activeUser.id}`,
                    type: "POST",
                    dataType: 'JSON',
                    data: crud_type == "new" && cell.getData() || { acc_id: cell.getData().acc_id, col: cell.getField(), oldValue: cell.getOldValue(), newValue: cell.getField() == "expdate" && moment(cell.getValue()).format("Y-MM-DD") || cell.getValue() },
                    success: function (rsp) {
                        // console.log(rsp);
                        if (rsp.saved || rsp.updated) {
                           appSounds.oringz.play();
                            alertify.success(rsp.saved && "Saved" || 'Updated.');
                            cell.getRow().getElement().classList.remove("new-record");
                            popAccounts();
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
            alertify.confirm("Confirm Update", `${cell.getField() == "item" ? `Change from <br/><br/><b class="clr-danger">${cell.getOldValue()}</b><br/><br/>To<br/><br/><b class="clr-success">${cell.getData()[cell.getField()]}</b> ?` : `${cell.getOldValue() == "" || cell.getOldValue() == undefined ? "Set" : `Change from <br/><br/><b class="clr-danger">${cell.getOldValue() }</b><span style="margin: 0 20px;">To</span>`} <b class="clr-success">${cell.getField() == "title" && categoriesSelect[cell.getData().title] || cell.getData()[cell.getField()]}</b><br/><br/>as <span class="clr-f05">${_.toUpper(_.find(cell.getTable().getColumnDefinitions(), col => col.field == cell.getField()).title)}</span> <span>for</span><br/></br/><b>${cell.getData().acc_name.toUpperCase()} ?`}</b>`, function () {
                crudRecord("update")
            }, function () { 
                cell.setValue(cell.getOldValue() != null && cell.getOldValue() || "");
            }).set('labels', { ok: 'Yes', cancel: 'No' }).set('closableByDimmer', false) || 
            cell.getRow().validate() && !tableAccounts.getInvalidCells().length && crudRecord("new");   
        }
});

tableAccounts.on("cellEditCancelled", cell => {
    //cell - cell component
    if(!cell.isEdited()){
        // cell.getOldValue() != "" ? cell.setValue(cell.getInitialValue() - cell.getOldValue()) : cell.restoreInitialValue();
        cell.clearValidation();
    }
});

const popAccounts = () => {
    $.ajax({
        url: './crud.php?accounts&pop',
        type: "GET",
        dataType: 'json',
        success: resp => {
            // console.log(resp);            
            tableAccounts.replaceData(resp.data)
            .then(async () => {
                await tableAccounts.addRow({regdate: Date()});
                await _.forEach(resp.data, acc => $('#acc_name').append(`
                    <option value="${acc['acc_id']}">${_.toUpper(acc['acc_name'])}</option>
                `));
                const { finance_id } = tableAccounts.getData()[tableAccounts.getData().length - 1];
                $('#finance_id').val(finance_id).trigger('change');
            });
        },
        beforeSend: () => {
            $('#acc_name').html(`<option value="">--- select account ---</option>`);
        }
    });
}
popAccounts();

var tableTransactions = new Tabulator("#transactions-table", {
    // width: '100vw',
    height: "calc(100vh - 200px)",
    // data: tabledata,           //load row data from array
    layout: "fitColumns",      //fit columns to width of table
    layoutColumnsOnNewData: true,
    addRowPos: "top",   
    index: "finance_id",       //when adding a new row, add it to the top of the table
    // history: true,             //allow undo and redo actions on the table
    selectable: 1,
    // movableColumns: true,      //allow column order to be changed
    resizableRows: false,  
    pagination: "local",       //paginate the data
    paginationSize: 100,         //allow 7 rows per page of data
    paginationSizeSelector: true, //enable page size select element and generate list options        //allow 7 rows per page of data
    // paginationAddRow: "table", //add rows relative to the table
    initialSort: [             //set the initial sort order of the data
        {column: "regdate", dir: "desc"},
    ],
    groupBy: ["dated", "acc_type"],
    // persistence: true, //enable table persistence
    // persistentLayout: true, //Enable column layout persistence
    columns: [                 //define the table columns
        {title:"#", field:"", formatter: "rownum", visible: !false, print: true, width: 20},
        {title: "REG. DATE", field: "regdate", visible: false },
        {title: "ID", field: "finance_id", visible: false },
        {title: "DATE", field: "dated", formatter: (cell, formatterParams, onRendered) => moment(cell.getValue()).format('ddd, MMM DD, YYYY'), visible: false, width: 75 },
        {title: "ACTIVITY", field: "activity", width: 100},
        {title: "REFERENCE", field: "ref", width: 100},
        {title: "HOLDER", field: "acc_name", formatter: (cell, formatterParams, onRendered) => cell?.getValue() && _.toUpper(_.trim(cell.getValue())), validator: ["required", "unique"], width: 140},
        {title: "AMOUNT", field: "amt", hozAlign: 'right', formatter: 'money', bottomCalc: (values, data, calcParams) => thousandsSeperator(_.sumBy(values, value => _.toNumber(value))), bottomCalcParams: { precision: 2 }, width: 100},
        {title: "MEMO", field: "memo", validator: "required", formatter: (cell, formatterParams, onRendered) => cell?.getValue() && _.toUpper(_.trim(cell.getValue())) },
        {title: "", field: "", width: 30, headerSort: false, hozAlign: "center", tooltip: "Delete", formatter: (cell, formatterParams, onRendered) => { return cell.getData()['acc_id'] != undefined && "<i class='fa fa-trash fa-2x clr-danger' onclick=''></i>" || ''; }, print: false, cellClick: (e, cell) => {
            cell.getData()['acc_id'] != undefined &&
            alertify.confirm("Confirm Delete", `<div class="txt-center">Are you sure you want to remove <br/><br/><b>${_.toUpper(cell.getData()['acc_name'])}</b><br/><br/> from this system ?</div>`, 
                function () {
                    cell.getRow().select();
                    $.post(`./crud.php?transactions&delete`, {key: cell.getData().finance_id}, function (resp) {
                        if(resp.deleted){                            
                            tableTransactions.deleteRow(cell.getData().finance_id)
                            .then(function(){
                                //run code after row has been deleted
                               appSounds.oringz.play();
                                alertify.error('Deleted.'); 
                                tableTransactions.toggleSelect();
                            })
                            .catch(function(error){
                                //handle error deleting row
                                console.log(error);
                            });
                        }
                    }, 'JSON');
                }, 
                function () { }).set('labels', { ok: 'Yes', cancel: 'No' });
            },
            // frozen: true.
        }
    ],
    columnDefaults: {
        tooltip: true,
        vertAlign: "middle"
    },
    placeholder: `No Data Available at the moment`,
    groupHeader: [
        (value, count, data, group) => moment(value).format('dddd, MMMM DD, YYYY') + `<span style='color:#d00; margin-left:10px;'>(${count} ${count > 1 ? 'transactions' : 'transaction'})</span>`,
        (value, count, data, group) => value + `<span style='color:#d00; margin-left:10px;'>(${count} ${count > 1 ? 'entries' : 'entry'})</span>`
    ],  
    footerElement: ``, //add a custom button to the footer element
    printFooter: `<div style="display: flex; justify-content: space-between; align-items: center;"><p>MyShop OS v0.2</p><p>Software By: Samad Kanton</p></center>`
});

tableTransactions.on("rowSelectionChanged", (data, rows) => {
        if(data.length && data[0]['finance_id'] !== undefined){
            const { finance_id, dated, activity, ref, acc_id, amt, memo } = data[0];
            $("#finance_id").val(finance_id);
            $('#transDate').val(moment(dated).format('YYYY-MM-DD'));
            $(`#activity option:contains(${activity})`).prop('selected', true);
            $("#ref").val(ref);
            $("#acc_name").val(acc_id).trigger('change');
            $("#amt").val(amt);
            $("#memo").val(memo);
            $("#crudTransactions [type='submit']").removeClass("btn-primary new").addClass("btn-success update").html(`<i class="fa fa-pencil"></i> Update`);
        }
        else{
            $("#crudTransactions [type='submit']").removeClass("btn-success update").addClass("btn-primary new").html(`<i class="fa fa-save"></i> Save`);
            $("#crudTransactions")[0].reset();
        }
});

tableTransactions.on("cellEdited", function(cell){
    //cell - cell component
    // console.log(cell.getValue() != cell.getOldValue(), cell.getOldValue() == cell.getInitialValue(), cell)
    if(cell.isValid() && _.trim(cell.getValue()) != cell.getOldValue()){
        const crudRecord = (crud_type) => {
            $.ajax({
                url: `./crud.php?accounts&${crud_type}&emp_id=${activeUser.id}`,
                type: "POST",
                dataType: 'JSON',
                data: crud_type == "new" && cell.getData() || { acc_id: cell.getData().acc_id, col: cell.getField(), oldValue: cell.getOldValue(), newValue: cell.getField() == "expdate" && moment(cell.getValue()).format("Y-MM-DD") || cell.getValue() },
                success: function (rsp) {
                    // console.log(rsp);
                    if (rsp.saved || rsp.updated) {
                       appSounds.oringz.play();
                        alertify.success(rsp.saved && "Saved" || 'Updated.');
                        cell.getRow().getElement().classList.remove("new-record");
                        popAccounts();
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
        alertify.confirm("Confirm Update", `${cell.getField() == "item" ? `Change from <br/><br/><b class="clr-danger">${cell.getOldValue()}</b><br/><br/>To<br/><br/><b class="clr-success">${cell.getData()[cell.getField()]}</b> ?` : `${cell.getOldValue() == "" || cell.getOldValue() == undefined ? "Set" : `Change from <br/><br/><b class="clr-danger">${cell.getOldValue() }</b><span style="margin: 0 20px;">To</span>`} <b class="clr-success">${cell.getField() == "title" && categoriesSelect[cell.getData().title] || cell.getData()[cell.getField()]}</b><br/><br/>as <span class="clr-f05">${_.toUpper(_.find(cell.getTable().getColumnDefinitions(), col => col.field == cell.getField()).title)}</span> <span>for</span><br/></br/><b>${cell.getData().acc_name.toUpperCase()} ?`}</b>`, function () {
            crudRecord("update")
        }, function () { 
            cell.setValue(cell.getOldValue() != null && cell.getOldValue() || "");
        }).set('labels', { ok: 'Yes', cancel: 'No' }).set('closableByDimmer', false) || 
        cell.getRow().validate() && !tableAccounts.getInvalidCells().length && crudRecord("new");   
    }
});

tableTransactions.on("cellEditCancelled", cell => {
    //cell - cell component
    if(!cell.isEdited()){
        // cell.getOldValue() != "" ? cell.setValue(cell.getInitialValue() - cell.getOldValue()) : cell.restoreInitialValue();
        cell.clearValidation();
    }
});


// console.log(companyProfile)
const popFinancies = () => {
    $.ajax({
        url: './crud.php?transactions&pop',
        type: "GET",
        dataType: 'json',
        success: resp => {
            // console.log(resp);
            tableTransactions.replaceData(resp.data);
        },
        beforeSend: () => {
            $('#acc_id').html(`<option value="">--- select account ---</option>`);
        }
    });
}
popFinancies();

$("#find_account").on('input', e => {
    let filters = [];
    // _.map(tableAccounts.getColumns(), col => console.log(col['_column']['definition']['visible']));
    _.map(tableAccounts.getColumns(), col => filters = [...filters, {field: col.getField(), type: "like", value: _.trim(e.target.value)}]);
    tableAccounts.setFilter([
        // {},
        // Nested filter OR Object
        filters
    ]);
});

$("#btnExport_accounts .dropdown-menu a").on("click", function () {
    // console.log($(this).index());
    if($(this).index() == 0) {
        setPrintHeader({
            table: tableAccounts,
            content: `
                <div style="font-family: verdana; display: grid; grid-template-columns: auto 1fr auto; justify-content: space-between;">
                    <section><img src='../uploads/${companyProfile[0]['logo']}' alt='${companyProfile[0]['comp_name']} Logo' width='120px' height='100px'></section>
                    <section style="text-align: center;"><h1 style="margin: 10px 0;">${companyProfile[0]['comp_name']}</h1><p style="margin-top: 0">${companyProfile[0]['addr']}</p><p style="margin-top: 0">0${companyProfile[0]['phone']} / 0${companyProfile[0]['mobile']}</p><p>CHART OF ACCOUNTS</p></section>
                    <section><img src='../uploads/${companyProfile[0]['logo']}' alt='${companyProfile[0]['comp_name']} Logo' width='120px' height='100px'></section>
                </div>
            `
        });
        tableAccounts.print();
    }
    else if($(this).index() == 1) tableAccounts.download("xlsx", "Financial Accounts.xlsx", {});
    else tableAccounts.download("pdf", "Financial Accounts.pdf", {
            orientation: "portrait", //set page orientation to portrait
            title: "Financial Accounts", //add title to report
        });
});

$("#acc_name").on("change", e => {
    // console.log(tableAccounts.getData())
    if(e.target.value){
        $("#acc_id").val(_.find(tableAccounts.getData(), acc => acc['acc_id'] == e.target.value)?.['acc_num']);
        $("#acc_type").val(_.find(tableAccounts.getData(), acc => acc['acc_id'] == e.target.value)?.['acc_type']);
    }
    else{
        $("#acc_id, #acc_type").val('');
    }
});

$("#crudTransactions").on("submit", e => {
    e.preventDefault();
    let formData = $(e.target).serialize();
    $.ajax({
        url: `./crud.php?transactions&${$(e.target).find('[type="submit"]').hasClass('new') ? 'new' : `update&finance_id=${tableTransactions.getSelectedRows()[0].getData()['finance_id']}`}&emp_id=${activeUser.id}`,
        type: "POST",
        data: formData,
        dataType: 'json',
        success: resp => {
            // console.log(resp);
            if (resp.saved || resp.updated) {
                appSounds.oringz.play();
                alertify.success(resp.saved && "Saved" || 'Updated.');
                $("#crudTransactions")[0].reset();
                popFinancies();
            }
            else {
                console.log(resp);
            }
            $('#crudTransactions button').prop('disabled', false);
        },
        beforeSend: () => {
            $('#crudTransactions button').prop('disabled', true);
        }
    });
});

$("#btnExport_transactions .dropdown-menu a").on("click", function () {
    if($(this).index() == 0) {
        setPrintHeader({
            table: tableTransactions,
            content: `
                <div style="font-family: verdana; display: grid; grid-template-columns: auto 1fr auto; justify-content: space-between;">
                    <section><img src='../uploads/${companyProfile[0]['logo']}' alt='${companyProfile[0]['comp_name']} Logo' width='120px' height='100px'></section>
                    <section style="text-align: center;"><h1 style="margin: 10px 0;">${companyProfile[0]['comp_name']}</h1><p style="margin-top: 0">${companyProfile[0]['addr']}</p><p style="margin-top: 0">0${companyProfile[0]['phone']} / 0${companyProfile[0]['mobile']}</p><p>FINANCIAL TRANSACTIONS</p></section>
                    <section><img src='../uploads/${companyProfile[0]['logo']}' alt='${companyProfile[0]['comp_name']} Logo' width='120px' height='100px'></section>
                </div>
            `
        });
        tableTransactions.print();
    }
    else if($(this).index() == 1) tableTransactions.download("xlsx", "Financial Accounts.xlsx", {});
    else tableTransactions.download("pdf", "Financial Accounts.pdf", {
            orientation: "portrait", //set page orientation to portrait
            title: "Financial Accounts", //add title to report
        });
});

$("#find_transactions").on('input', e => {
    let filters = [];
    // _.map(tableAccounts.getColumns(), col => console.log(col['_column']['definition']['visible']));
    _.map(tableTransactions.getColumns(), col => filters = [...filters, {field: col.getField(), type: "like", value: _.trim(e.target.value)}]);
    tableTransactions.setFilter([
        // {},
        // Nested filter OR Object
        filters
    ]);
});

