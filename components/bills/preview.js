import { thousandsSeperator, headerMenu, computeAmt, setPrintHeader, companyProfile, setPrintFooter, myProgressLoader, appSounds } from "../../assets/js/utils.js";
import myAlertifyDialog from "../myAlertifyDialog.js";
import newBill from "./new.js";
import payBill from "./pay.js";
import recurringBill from "./recurring.js";
import sortBill from "./sort.js";

let myCompany, allBills;
companyProfile().then((data) => myCompany = data);

const popBills = async () => {
    await $.ajax({
        url: './crud.php?bill&pop',
        type: "GET",
        dataType: 'json',
        success: resp => {
            console.log("All Bills: ", resp);
            _.map(resp.data, entry => {
                entry.amt = _.toNumber(entry.cp) * _.toNumber(entry.new_qty);
                entry.margin = (_.toNumber(entry.rp) * _.toNumber(entry.new_qty)) - _.toNumber(entry.cp) * _.toNumber(entry.new_qty);
                return entry;
            })
            allBills = resp.data;
            
            // tableBillsDetails.replaceData(resp.data);
            myProgressLoader.stop()
        },
        beforeSend: () => {
            myProgressLoader.load();   
        }
    });
    return allBills;
}

let table;

const previewBill = params => {
    table = params.table;
    console.log("Preview Params: ", table.getSelectedData()[0])    

    myAlertifyDialog({
        name: 'previewBillDetails', 
        content: `
            <div>
                PREVIEWING VENDOR BILL No. <b class="clr-f05" id="bilNo">${table.getSelectedData()[0].invoice}</b>
            </div>            
            <hr style="border: dashed 1px #ccc;" />
  
            <div class="row">
                <div class="cl-3 cm-3 cs-4 cx-12">
                    <div class="" style="display: flex; gap: 10px; justify-content: space-between; align-items: flex-end;">                        
                        <div class="search-pane float-xs">
                            <div class="form-group" style="position: relative; margin: 0;">
                                <input type="search" id="filter_bills" placeholder="Search vendor, bill #, status...">
                                <label for="filter_bills" style="cursor: pointer;"><i class="fa fa-search clr-primary" style="width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;"></i></label>
                            </div>
                        </div>                          
                        <button type="button" id="btnBillsSummaryOpts" class="btn btn-f05 dropdown" style=" margin-right: 10px;">
                            <span><i class="fa fa-ellipsis-v"></i></span>
                            <div class="dropdown-menu">
                                <a href="javascript:void(0);" class="no-udl clr-danger"><i class="fa fa-shopping-bag"></i> New Bill</a>
                                <a href="javascript:void(0);" class="no-udl clr-inverse"><i class="fa fa-sort"></i> Sort & Filter</a>
                                <a href="javascript:void(0);" class="no-udl clr-inverse"><i class="fa fa-refresh"></i> Refresh List</a>
                            </div>
                        </button>                         
                    </div>
                    <div class="form-group" style="margin: 0 10px 10px 0;">                       
                        <div id="vendorBillsSummary-table" style="margin-top: 10px;"></div>
                    </div>
                </div>
                <div class="cl-9 cm-9 cs-8 cx-12">
                    <div class="form-group"  style="margin: 0">                        
                        <div class="previewBillToolbar" style="display: flex; gap: 10px; justify-content: space-between; align-items: flex-end;">                        
                            <div> 
                                <div>
                                    <button type="button" id="btnMakeBill" class="btn btn-primary dropdown">
                                        <span>Make Bill <i class="fa fa-caret-down"></i></span>
                                        <div class="dropdown-menu">
                                            <a href="javascript:void(0);" class="no-udl clr-inverse" id="btnMakeClone"><i class="fa fa-clone"></i> Clone</a>
                                            <a href="javascript:void(0);" class="no-udl clr-info" id="btnMakeOpen"><i class="fa fa-money"></i> Open</a>
                                            <a href="javascript:void(0);" class="no-udl clr-success" id="btnMakePayment"><i class="fa fa-money"></i> Payment</a>
                                            <a href="javascript:void(0);" class="no-udl clr-purple" id="btnMakeRecurring"><i class="fa fa-refresh"></i> Recurring</a>
                                        </div>
                                    </button>
                                </div>
                            </div>    
                            <div style="display: flex; gap: 50px; justify-content: space-between; align-items: flex-end;"> 
                                <div>                                
                                    <button type="button" id="btnExportBills" class="btn btn-teal dropdown">
                                        <span>Export To <i class="fa fa-caret-down"></i></span>
                                        <div class="dropdown-menu">
                                            <a href="javascript:void(0);" class="no-udl clr-inverse"><i class="fa fa-print"></i> Printer</a>
                                            <a href="javascript:void(0);" class="no-udl clr-success"><i class="fa fa-file-excel-o"></i> Excel</a>
                                            <a href="javascript:void(0);" class="no-udl clr-danger"><i class="fa fa-file-pdf-o"></i> PDF</a>
                                        </div>
                                    </button>
                                </div>                            
                                <div>
                                    <div class="search-pane float-xs">
                                        <div class="form-group" style="position: relative; margin: 0;">
                                            <input type="search" id="find_bill_item" placeholder="Search item...">
                                            <label for="find_bill_item" style="cursor: pointer;"><i class="fa fa-search clr-primary" style="width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;"></i></label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div id="vendorBillsDetails-table" style="margin-top: 10px;"></div>
                    </div>
                </div>
            </div>
        `,
        setup: {
            // frameless: false
            onshow: async () => {

                const search = params => {
                    let filters = [];
                    _.map(params.table.getColumns(), col => filters = [...filters, {field: col.getField(), type: "like", value: _.trim(params.query)}]);
                    params.table.setFilter([
                        // {},
                        // Nested filter OR Object
                        filters
                    ]);
                }                

                $(document).on('input', '#filter_bills', e => {
                    search({table: tableBillsSummary, query: e.target.value})
                });

                $(document).on('input', '#find_bill_item', e => {
                    search({table: tableBillsDetails, query: e.target.value})
                });            
            
                const popAllBills = () => popBills()
                .then(data => {
                    // console.log(data)
                    tableBillsSummary.replaceData(_.uniqBy(data, 'bill_id'));                    
                });
                popAllBills();


                var tableBillsSummary = await new Tabulator("#vendorBillsSummary-table", {
                    // width: '100vw',
                    height: "calc(100vh - 135px)",
                    // data: tabledata,           //load row data from array
                    layout: "fitColumns",      //fit columns to width of table
                    layoutColumnsOnNewData: true,
                    // responsiveLayout: "hide",  //hide columns that dont fit on the table
                    headerVisible: false, //hide column headers
                    tooltips: true,            //show tool tips on cells
                    tooltipGenerationMode: "hover",
                    addRowPos: "bottom",   
                    index: "bill_id",       //when adding a new row, add it to the top of the table
                    // history: true,             //allow undo and redo actions on the table
                    selectable: 1,
                    // movableColumns: true,      //allow column order to be changed
                    resizableRows: false,       //allow row order to be changed
                    // resizableColumns: false,
                    cellVertAlign: "middle",
                    pagination: "local",       //paginate the data
                    paginationSize: 100,         //allow 7 rows per page of data
                    paginationSizeSelector: true, //enable page size select element and generate list options        //allow 7 rows per page of data
                    initialSort: [             //set the initial sort order of the data
                        {column: "vendor", dir: "desc"},
                        {column: "bill_id", dir: "desc"},
                    ],
                    // sortOrderReverse: true,
                    groupBy: ["bill_date"],    
                    groupHeader: [
                        (value, count, data, group) => {
                            // console.log(value, count, data, _.uniqBy(_.filter(tableBillsDetails.getData(), bill => bill.bill_date == value), 'vendor_id'), _.uniqBy(tableBillsDetails.getData(), bill => bill.bill_date == value && bill.vendor_id), _.filter(tableBillsDetails.getData(), bill => bill.bill_date == value))
                            let matched = _.uniqBy(_.filter(tableBillsSummary.getData(), bill => bill.bill_date == value), 'vendor_id'), numVendors = _.size(matched);
                            return moment(value).format('dddd, MMMM DD, YYYY') + `<span style='color:#d00; margin-left:10px;'>(${numVendors} ${numVendors > 1 ? 'bills' : 'bill'})</span>`
                        },
                    //     (value, count, data, group) => {
                    //         let matched = _.filter(tableBillsSummary.getData(), bill => bill.vendor_id == value), numInvoices = _.size(matched);
                    //         console.log(_.filter(matched, match => match.bill_date==matched[0].bill_date))
                    //         return _.toUpper(matched[0].vendor) + `<span style='color:#d00; margin-left:10px;'>(${numInvoices} ${numInvoices > 1 ? 'invoices' : 'invoice'})</span>`
                    //     },
                    //     (value, count, data, group) => {
                    //         // console.log(value, count, data, _.filter(tableBillsDetails.getData(), bill => bill.invoice == value))
                    //         return value + `<span style='color:#d00; margin-left:10px;'>(${count} ${count > 1 ? 'items' : 'item'})</span>`
                    //     }
                    ],
                    columns: [                 //define the table columns
                        {title:"#", field:"", formatter: "rownum", visible: !false, print: true, width: 20},
                        // {title: "REG. DATE", field: "regdate", visible: false },
                        {title: "BILL ID", field: "bill_id", visible: false },
                        {title: "ORDER ID", field: "order_id", visible: false },
                        {title: "DATE", field: "regdate", formatter: (cell, formatterParams, onRendered) => moment(cell.getValue()).format('ddd, MMM DD, YYYY'), width: 75, visible: false },
                        {title: "BILL DATE", field: "bill_date", formatter: (cell, formatterParams, onRendered) => moment(cell.getValue()).format('ddd, MMM DD, YYYY'), width: 75, visible: false },
                        {title: "DUE DATE", field: "due_date", formatter: (cell, formatterParams, onRendered) => moment(cell.getValue()).format('ddd, MMM DD, YYYY'), width: 75, visible: false },
                        {title: "VENDOR ID", field: "vendor_id", formatter: (cell, formatterParams, onRendered) => cell.getValue() && _.toUpper(cell.getValue()), width: 100, visible: false },
                        {title: "VENDOR", field: "vendor", formatter: (cell, formatterParams, onRendered) => cell.getValue() && _.toUpper(cell.getValue()), width: 100, visible: false },
                        {title: "INVOICE", field: "invoice", width: 100, visible: false },
                        {title: "TERMS", field: "terms", width: 100, visible: false },
                        {title: "DESCRIPTION", field: "item", minWidth: 200 },
                        {title: "AMOUNT", field: "amt", minWidth: 200 },
                        {title: "STATUS", field: "stat", minWidth: 200 },
                    ],
                    placeholder: `No Vendor bills are available at the moment.`,
                    cellEditCancelled: cell => {
                        //cell - cell component
                        if(!cell.isEdited()){
                            // cell.getOldValue() != "" ? cell.setValue(cell.getInitialValue() - cell.getOldValue()) : cell.restoreInitialValue();
                            cell.clearValidation();
                        }
                    },
                    cellEdited: function(cell){
                        //cell - cell component
                    },
                    rowFormatter: row => {
                        var element = row.getElement(), data = row.getData(), cellContents = '';
                        //clear current row data
                        while(element.firstChild) element.removeChild(element.firstChild);
                        
                        let { bill_id, vendor, invoice, bill_date, due_date, qty, cp, stat, PAID } = data, status = { draft: 'purple', open: 'green', recurring: 'teal' }, amt = _.sum(_.map(_.filter(row.getTable().getData(), entry => entry.bill_id == bill_id), n => _.toNumber(n.cp) * _.toNumber(n.new_qty))), balance = amt - PAID;
                        // console.log(PAID)

                        cellContents += `
                            <div class="" style="padding: 10px; display: flex; gap: 10px; justify-content: space-between;">
                                <div>
                                    <div><b>${_.toUpper(vendor)}</b></div>
                                    <div style="margin-top: 5px;"><b class="clr-primary">${invoice}</b> | ${moment(due_date).format('LL')}</div>
                                </div>
                                <div>
                                    <div class="txt-right">${thousandsSeperator(balance)}</div>
                                    <div class="txt-right" style="margin-top: 10px;">
                                        <small class="" style="color: ${status[stat]}"><b>${_.toUpper(stat)}</b></small>
                                    </div>
                                </div>
                            </div>
                        `;

                        // row.getData()['acc_id'] == undefined && row.getElement().classList.add('new-record');
                        element.innerHTML += (cellContents);

                    },
                    rowSelectionChanged: (data, rows) => {
                        if(_.size(data) > 0){
                            let billDetails = _.filter(allBills, entry => entry.bill_id == data[0].bill_id);
                            // console.log(billDetails)
                            tableBillsDetails.replaceData(billDetails);
                            let { invoice, stat, amt, PAID, balance, recurring } = data[0];
                            // console.log(stat, amt, PAID, balance, _.size(JSON.parse(recurring)));
                            $("#btnMakeBill .dropdown-menu a").show();
                            if(stat == 'open'){
                                $("#btnMakeBill .dropdown-menu a:eq(1)").hide();
                                _.size(JSON.parse(recurring)) > 0 && $("#btnMakeBill .dropdown-menu a:eq(3)").hide();
                            } 
                            else if(stat == 'draft' || stat == 'paid'){
                                $("#btnMakeBill .dropdown-menu a:eq(2)").hide();
                            } 
                            $("#bilNo").html(invoice);
                        }
                        (!_.isUndefined(tableBillsDetails) && _.size(rows) < 1) && tableBillsDetails.clearData();
                        $('.previewBillToolbar').find('button, input').prop('disabled', _.size(rows) > 0 ? false : (!$('#dash .box').hasClass('active') && true));
                    },
                    dataLoaded: data => {
                        //data - all data loaded into the table
                        tableBillsSummary && !_.isUndefined(tableBillsSummary) && tableBillsSummary.selectRow(table.getSelectedData()[0].bill_id)
                    },                
                    footerElement: ``, //add a custom button to the footer element
                    printFooter: `<div style="display: flex; justify-content: space-between; align-items: center;"><p>MyShop OS v0.2</p><p>Software By: Samad Kanton</p></center>`
                });

                var tableBillsDetails = new Tabulator("#vendorBillsDetails-table", {
                    // width: '100vw',
                    height: "calc(100vh - 135px)",
                    // data: tabledata,           //load row data from array
                    layout: "fitColumns",      //fit columns to width of table
                    layoutColumnsOnNewData: true,
                    // responsiveLayout: "hide",  //hide columns that dont fit on the table
                    tooltips: true,            //show tool tips on cells
                    tooltipGenerationMode: "hover",
                    addRowPos: "bottom",   
                    index: "order_id",       //when adding a new row, add it to the top of the table
                    // history: true,             //allow undo and redo actions on the table
                    selectable: 1,
                    // movableColumns: true,      //allow column order to be changed
                    resizableRows: false,       //allow row order to be changed
                    // resizableColumns: false,
                    cellVertAlign: "middle",
                    pagination: "local",       //paginate the data
                    paginationSize: 100,         //allow 7 rows per page of data
                    paginationSizeSelector: true, //enable page size select element and generate list options        //allow 7 rows per page of data
                    initialSort: [             //set the initial sort order of the data
                        {column: "bill_date", dir: "desc"},
                    ],
                    // groupBy: ["bill_date", "vendor_id", "invoice"],    
                    groupBy: "bill_id",    
                    groupHeader: [
                        (value, count, data, group) => {
                            let matched = _.filter(allBills, bill => bill.bill_id == value), numVendors = _.size(matched);
                            return matched[0].invoice + `<span style='color:#d00; margin-left:10px;'>(${numVendors} ${numVendors > 1 ? 'items' : 'item'})</span>`
                        },
                    //     (value, count, data, group) => {
                    //         let matched = _.filter(tableBillsDetails.getData(), bill => bill.vendor_id == value), numInvoices = _.size(matched);
                    //         console.log(_.filter(matched, match => match.bill_date==matched[0].bill_date))
                    //         return _.toUpper(matched[0].vendor) + `<span style='color:#d00; margin-left:10px;'>(${numInvoices} ${numInvoices > 1 ? 'invoices' : 'invoice'})</span>`
                    //     },
                    //     (value, count, data, group) => {
                    //         // console.log(value, count, data, _.filter(tableBillsDetails.getData(), bill => bill.invoice == value))
                    //         return value + `<span style='color:#d00; margin-left:10px;'>(${count} ${count > 1 ? 'items' : 'item'})</span>`
                    //     }
                    ],
                    columns: [                 
                        //define the table columns
                        {title:"#", field:"", formatter: "rownum", visible: !false, print: true, width: 20},
                        // {title: "REG. DATE", field: "regdate", visible: false },
                        {title: "ID", field: "order_id", visible: false },
                        {title: "DATE", field: "regdate", formatter: (cell, formatterParams, onRendered) => moment(cell.getValue()).format('ddd, MMM DD, YYYY'), width: 75, visible: false },
                        {title: "DATE", field: "bill_date", formatter: (cell, formatterParams, onRendered) => moment(cell.getValue()).format('ddd, MMM DD, YYYY'), width: 75, visible: false },
                        {title: "VENDOR ID", field: "vendor_id", formatter: (cell, formatterParams, onRendered) => cell.getValue() && _.toUpper(cell.getValue()), width: 100, visible: false },
                        {title: "INVOICE", field: "invoice", width: 100, visible: false },
                        {title: "DESCRIPTION", field: "item", headerMenu, formatter: (cell, formatterParams, onRendered) => cell.getValue() && _.toUpper(cell.getValue()), minWidth: 200 },
                        {title: "CATEGORY", field: "title", headerSort: false, formatter: (cell, formatterParams) => cell.getValue() && cell.getValue().toUpperCase(), width: 120, print: false, download: false },
                        {title: "QTY (Pcs)", field: "new_qty", headerMenu, headerSort: false, editor: "input", hozAlign: 'right', formatter: "money", formatterParams: { precision: 0 }, bottomCalc: 'sum', bottomCalcParams: { precision: 2 }, validator: ["required", "min: 0", "numeric"], width: 80},
                        {title: "PREV QTY", field: "prev_qty", headerMenu, headerSort: false, editor: "input", hozAlign: 'right', formatter: "money", formatterParams: { precision: 0 }, bottomCalc: 'sum', bottomCalcParams: { precision: 2 }, validator: ["required", "min: 0", "numeric"], width: 80, visible: false},
                        {title: "UNIT COST", field: "cp", headerMenu, editor: "input", hozAlign: 'right', formatter: "money", bottomCalc: 'sum', bottomCalcParams: { precision: 2 }, validator: ["required", "min: 0", "numeric"], width: 120},     
                        {title: "RATE", field: "rp", headerMenu, editor: "input", hozAlign: 'right', formatter: "money", bottomCalc: 'sum', bottomCalcParams: { precision: 2 }, validator: ["required", "min: 0", "numeric"], width: 120},  
                        {title: "AMOUNT", field: "amt", headerMenu, hozAlign: 'right', formatter: "money", bottomCalc: 'sum', bottomCalcParams: { precision: 2 }, width: 110},  
                        {title: "MARGIN", field: "margin", headerMenu, hozAlign: 'right', formatter: "money", bottomCalc: 'sum', bottomCalcParams: { precision: 2 }, width: 110},  
                    ],
                    placeholder: `No Vendor bills are available at the moment.`,
                    cellEditCancelled: cell => {
                        //cell - cell component
                        if(!cell.isEdited()){
                            // cell.getOldValue() != "" ? cell.setValue(cell.getInitialValue() - cell.getOldValue()) : cell.restoreInitialValue();
                            cell.clearValidation();
                        }
                    },
                    cellEdited: function(cell){
                        //cell - cell component
                        // console.log(cell.getValue() != cell.getOldValue(), cell.getOldValue() == cell.getInitialValue(), cell)
                        if(cell.isValid() && _.trim(cell.getValue()) != cell.getOldValue()){

                        }
                    },
                    rowFormatter: row => {
                        var element = row.getElement(), data = row.getData(), cellContents = '';
                        //clear current row data
                        // while(element.firstChild) element.removeChild(element.firstChild);
                        row.getData()['acc_id'] == undefined && row.getElement().classList.add('new-record');
                    },
                    rowSelected: row => {
                        //row - row component for the selected row
                    },
                    rowSelectionChanged: (data, rows) => {
        
                    },
                    footerElement: ``, //add a custom button to the footer element
                    // printFooter: `<div style="display: flex; justify-content: space-between; align-items: center;"><p>MyShop OS v0.2</p><p>Software By: Samad Kanton</p></center>`
                });
                

                $("#btnBillsSummaryOpts .dropdown-menu a").on("click", function () {        
                    // Save per action type
                    if($(this).index() == 0) {
                        _.size(tableBillsSummary.getSelectedData()) > 0 ? newBill({table: tableBillsSummary.getSelectedData()[0]}) : alert("You need to select a vendor to assign bill. \n\nTip:\n\tClick any bill on the left side-side of this page\n\tor\n\tChoose from list of all vendors by closing this dialog.");            
                    }
                    else if($(this).index() == 1) {  
                        sortBill({table: tableBillsSummary});
                    }
                    else {
                        popAllBills();
                    }
                    
                }); 

                $("#btnMakeBill .dropdown-menu a").on("click", function (e) { 
                    let { id } = e.target, { bill_id, invoice, stat } = table.getSelectedData()[0], { vendor } = tableBillsSummary.getSelectedData()[0];
                    if(id == "btnMakeClone") {                  
                        // stat == "open" ? payBill(...tableAllBills.getSelectedData()) : ''; 
                        newBill({table: tableBillsDetails, bill_id, vendor, clone: true});
                    }
                    else if(id == "btnMakeOpen") {
                        myProgressLoader.load();
                        $.post(`./crud.php?bill&makeOpen`, { bill_id, invoice }, resp => {
                            if(resp.updated){
                                appSounds.oringz.play();
                                // alertify.success(`Bill status updated to <b>"OPEN"</b>`)
                                myAlertifyDialog({
                                    name: 'makeOpened', 
                                    content: `
                                        <div style="display: grid; justify-content: center;">
                                            <h3>Bill status changed to <b class="clr-info">"OPEN"</b>.</h3>
                                            <p>You can now proceed to make payment.</p>
                                        </div>
                                    `,
                                    setup: { startMaximized: false, resizable: false, modal: false }
                                });
                                popAllBills();
                            }
                            else{
                                consle.log(resp);
                            }
                            myProgressLoader.stop();
                        }, 'json');
                    }
                    else if(id == "btnMakePayment") {
                        payBill(...tableBillsSummary.getSelectedData())
                    }
                    else {
                        recurringBill({table: tableBillsDetails.getData(), bill_id, vendor, new: false});
                    }   
                });
                
                $("#btnExportBills .dropdown-menu a").on("click", function () {
                    // console.log($(this).index());
                    let { vendor, invoice, bill_date, due_date, terms, PAID, amt } = tableBillsSummary.getSelectedData()[0];
                    let balance = _.toNumber(PAID) - _.toNumber(amt);
                    balance = balance < 0 ? -balance : balance;
                    if($(this).index() == 0) {                        
                        setPrintHeader({
                            table: tableBillsDetails,
                            content: `
                                <div style="margin-bottom: 30px; display: grid; grid-template-columns: 400px auto; gap: 20px; justify-content: space-between;">
                                    <div style="font-family: verdana; display: grid; gap: 20px; justify-content: space-between;">
                                        <div style="display: flex; gap: 20px; align-items: center;">
                                            <img src='../uploads/${myCompany[0]['logo']}' alt='${myCompany[0]['comp_name']} Logo' width='50' height='50'>
                                            <h1 style="margin: 10px 0;">${myCompany[0]['comp_name']}</h1>                                       
                                        </div>
                                        <div>
                                            <p style="margin-top: 0">${myCompany[0]['addr']}</p>
                                            <p style="margin-top: 0">0${myCompany[0]['phone']} / 0${myCompany[0]['mobile']}</p>
                                        </div>
                                        <div>
                                            <p>Bill From:</p>
                                            <section><b style="font-size: 1.5em;">${_.toUpper(vendor)}</b></section>
                                        </div>
                                    </div>
                                    <div style="font-family: verdana; display: grid; gap: 10px; justify-content: flex-end; text-align: right;">
                                        <div>
                                            <h1>BILL</h1>
                                            <section>Bill No. <b>${invoice}</b></section>
                                        </div>
                                        <div>
                                            <div>Balance Due</div>
                                            <section><b style="font-size: 2em;">${thousandsSeperator(PAID <= 0 ? amt : balance )}</b></section>
                                        </div>
                                        <div style="display: grid; gap: 10px;">
                                            <section style="display: flex; gap: 10px; justify-content: space-between; align-items: center;">
                                                <span>Bill Date:</span>
                                                <span style="flex: 100px;"><b>${moment(bill_date).format('LL')}</b></span>
                                            </section>
                                            <section style="display: flex; gap: 10px; justify-content: space-between; align-items: center;">
                                                <span>Due Date:</span>
                                                <span style="flex: 100px;"><b>${moment(due_date).format('LL')}</b></span>
                                            </section>
                                            <section style="display: flex; gap: 10px; justify-content: space-between; align-items: center;">
                                                <span>Pay Terms:</span>
                                                <span style="flex: 100px;"><b>${_.startCase(_.join(terms.split('_'), ' '))}</b></span>
                                            </section>
                                        </div>
                                    </div>
                                </div>
                            `
                        });
                        setPrintFooter({
                            table: tableBillsDetails,
                            content: `
                                <div style="margin: 30px 0; display: grid; gap: 20px; justify-content: flex-end;">
                                    <h3 class="txt-right" style="margin: 0;">
                                        <span style="width: 200px;">Sub Total:</span>
                                        <span style="margin-left: 30px;">0.00</span>
                                    </h3>
                                    <h3 class="txt-right" style="margin: 0;">
                                        <span style="width: 200px;">Total:</span>
                                        <span style="margin-left: 30px;">0.00</span>
                                    </h3>
                                    <h3 class="txt-right" style="margin: 0;">
                                        <span style="width: 200px;">Balance Due:</span>
                                        <span style="margin-left: 30px;">0.00</span>
                                    </h3>
                                </div>
                            `
                        });
                        tableBillsDetails.print();
                    }
                    else if($(this).index() == 1) tableBillsDetails.download("xlsx", "Purchase Bills.xlsx", {});
                    else tableBillsDetails.download("pdf", "Purchase Bills.pdf", {
                            orientation: "portrait", //set page orientation to portrait
                            title: "Purchase Bills", //add title to report
                        });
                });
            }
            
        }
    }).bringToFront();
}

export default previewBill;