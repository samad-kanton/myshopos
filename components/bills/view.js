import { thousandsSeperator, headerMenu, computeAmt, setPrintHeader, companyProfile, setPrintFooter, myProgressLoader, calcRecurBill } from "../../assets/js/utils.js";
import myAlertifyDialog from "../myAlertifyDialog.js";
import newBill from "./new.js";
import payBill from "./pay.js";
import sortBill from "./sort.js";
import previewBill from "./preview.js";
import recurringBill from "./recurring.js";
import previewRecurringBill from "./previewRecurring.js";

let myCompany, allBills, reformBills;
companyProfile().then((data) => myCompany = data);

const popBills = async () => {
    await $.ajax({
        url: './crud.php?bill&pop',
        type: "GET",
        dataType: 'json',
        success: resp => {
            // console.log("All Bills: ", resp);  
            allBills = resp.data;          
            _.map(resp.data, entry => {
                entry.amt = _.toNumber(entry.cp) * _.toNumber(entry.new_qty);
                entry.balance = _.toNumber(entry.amt) - _.toNumber(entry.PAID);
                entry.overdue = moment(entry.due_date).endOf('day').diff(moment(), 'days');
                entry.margin = (_.toNumber(entry.rp) * _.toNumber(entry.new_qty)) - _.toNumber(entry.cp) * _.toNumber(entry.new_qty);
                return entry;
            })
            reformBills = resp.data;
            
            // tableAllBills.replaceData(resp.data);
            myProgressLoader.stop();
        },
        beforeSend: () => {
            myProgressLoader.load();   
        }
    });
    return reformBills;
}

let table, vendorFilter, recurringFilter;
const viewBills = params => {
    table = params.table;
    let { vendor } = vendorFilter ? table.getSelectedData()[0] : '';
    vendorFilter = params.vendorFilter;
    recurringFilter = params.recurringFilter;
    console.log("viewBill Params", params);

    myAlertifyDialog({
        name: 'viewBills', 
        content: `
            <div>${vendorFilter ? `PAY BILLS FOR <b class="clr-f05">${_.toUpper(vendor)}</b>` : `ALL ${recurringFilter ? 'RECURRING BILLS' : 'VENDOR BILLS'}`}</div>

            <hr style="border: dashed 1px #ccc;" />  
            
            <div class="row" style="display: flex; gap: 10px; justify-content: space-between; align-items: center;">
                <button type="button" class="btn btn-danger btn-block card txt-left box" id="unPaidBillsAmt">
                    <h1 style="margin: 0 0 10px 0;"></h1>
                    <samp style="margin-top: 10px;">Unpaid Bills <sup>0</sup></samp>
                </button>  
                <button type="button" class="btn btn-warning btn-block card txt-left box" id="overDueBillsAmt">
                    <h1 style="margin: 0 0 10px 0;"></h1>
                    <samp>Overdue Bills <sup>0</sup></samp>
                </button>
                <button type="button" class="btn btn-info btn-block card txt-left box" id="openBillsAmt">
                    <h1 style="margin: 0 0 10px 0;"></h1>
                    <samp>Open Bills <sup>0</sup></samp>
                </button>
                <button type="button" class="btn btn-wheat btn-block card txt-left box" id="partPaidBillsAmt">
                    <h1 style="margin: 0 0 10px 0;"></h1>
                    <samp>Part-paid Bills <sup>0</sup></samp>
                </button>
                <button type="button" class="btn btn-success btn-block card txt-left box" id="paidBillsAmt">
                    <h1 style="margin: 0 0 10px 0;"></h1>
                    <samp>Paid Bills <sup>0</sup></samp>
                </button>
            </div>  
            <div class="form-group" style="margin: 10px 0 0 0;">
                <div style="display: flex; gap: 50px; justify-content: space-between; align-items: flex-end;"> 
                    <div>
                        <button type="button" id="btnAllBillsOpts" class="btn btn-purple dropdown">
                            <span><i class="fa fa-ellipsis-v"></i> More <i class="fa fa-caret-down"></i></span>
                            <div class="dropdown-menu">
                                <a href="javascript:void(0);" class="no-udl clr-danger"><i class="fa fa-shopping-bag"></i> New Bill</a>
                                <a href="javascript:void(0);" class="no-udl clr-inverse"><i class="fa fa-filter"></i> Sort & Filter</a>
                                <a href="javascript:void(0);" class="no-udl clr-inverse"><i class="fa fa-refresh"></i> Refresh List</a>
                            </div>
                        </button> 
                    </div>
                    <div style="display: flex; gap: 50px; justify-content: space-between; align-items: flex-end;">                        
                        <div class="previewBillToolbar" style="display: flex; gap: 30px; justify-content: flex-end; align-items: flex-end">
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
                        </div>
                        <div>
                            <div class="search-pane float-xs">
                                <div class="form-group" style="position: relative; margin: 0;">
                                    <input type="search" id="findBill" placeholder="Search item...">
                                    <label for="findBill" style="cursor: pointer;"><i class="fa fa-search clr-primary" style="width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;"></i></label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div id="vendorBills-table" style="margin-top: 10px;"></div>
            </div>
        `,
        setup: {
            // frameless: false
            onshow: () => {

                const search = params => {
                    let filters = [];
                    _.map(params.table.getColumns(), col => filters = [...filters, {field: col.getField(), type: "like", value: _.trim(params.query)}]);
                    params.table.setFilter([
                        // {},
                        // Nested filter OR Object
                        filters
                    ]);
                }

                $(document).on('input', '#findBill', e => {
                    search({table: tableAllBills, query: e.target.value})
                });            
            
                const popAllBills = () => popBills()
                .then(data => {
                    console.log(data);
                    // Modifying Bills Array
                    _.map(data, entry => {
                        entry.recurring = JSON.parse(entry.recurring);
                        // let { interval, span, period, dateFrom, dateTo } = entry.recurring;
                        // entry.recurring.interval = _.size(entry.recurring) > 0 ? calcRecurBill({interval, span, period, dateFrom, dateTo }).repeats : undefined
                        return entry;
                    });
                    // console.log("Reformed Data: ", data)
                    tableAllBills.replaceData((vendorFilter || recurringFilter) ? _.filter(_.uniqBy(data, 'bill_id'), entry => vendorFilter ? (entry.vendor_id == table.getSelectedData()[0].vendor_id) : _.size(entry.recurring) > 0) : _.uniqBy(data, 'bill_id'));
                    
                    let unpaidBills = _.filter(_.uniqBy(tableAllBills.getData(), 'bill_id'), entry => (entry.PAID < entry.amt)),                    
                        overdueBills = _.filter(_.uniqBy(tableAllBills.getData(), 'bill_id'), entry => moment(entry.due_date).isBefore(moment()) && entry.overdue < 0 && entry.stat != "draft"),
                        openBills = _.filter(_.uniqBy(tableAllBills.getData(), 'bill_id'), entry => (entry.stat == 'open') && _.toNumber(entry.amt)),
                        // partPaidBills = _.filter(_.uniqBy(tableAllBills.getData(), 'bill_id'), entry => entry.stat == 'open' && _.toNumber(entry.PAID)),
                        partPaidBills = _.filter(_.uniqBy(tableAllBills.getData(), 'bill_id'), entry => (entry.PAID > 0 && entry.PAID < entry.amt) && entry.stat == 'open'),
                        paidBills = _.filter(_.uniqBy(tableAllBills.getData(), 'bill_id'), entry => (entry.PAID == entry.amt))

                    $('#unPaidBillsAmt h1').html(thousandsSeperator(_.sum(_.map(unpaidBills, entry => _.toNumber(entry.amt))))).parent().find('samp sup').html(_.size(_.filter(unpaidBills, Boolean)))
                    $('#overDueBillsAmt h1').html(thousandsSeperator(_.sum(_.map(overdueBills, entry => _.toNumber(entry.balance))))).parent().find('samp sup').html(_.size(_.filter(overdueBills, Boolean)));
                    $('#openBillsAmt h1').html(thousandsSeperator(_.sum(_.map(openBills, entry => entry.stat == 'open' && _.toNumber(entry.balance))))).parent().find('samp sup').html(_.size(_.filter(openBills, Boolean)))
                    $('#partPaidBillsAmt h1').html(thousandsSeperator(_.sum(_.map(partPaidBills, entry => _.toNumber(entry.PAID))))).parent().find('samp sup').html(_.size(_.filter(partPaidBills, Boolean)));
                    $('#paidBillsAmt h1').html(thousandsSeperator(_.sum(_.map(paidBills, entry => _.toNumber(entry.PAID))))).parent().find('samp sup').html(_.size(_.filter(paidBills, Boolean)));
                
                    $(document).on('click', '#dash .box', e => {
                        $('#dash .box').addClass('active').not($(e.target).closest('.box')).removeClass('active')
                        $('.previewBillToolbar').find('button, input').prop('disabled', false);
                    });

                    $(document).on('click', '#unPaidBillsAmt', e => {
                        tableAllBills.replaceData(unpaidBills);
                    });
                    
                    $(document).on('click', '#overDueBillsAmt', e => {
                        tableAllBills.replaceData(overdueBills);
                    });

                    $(document).on('click', '#openBillsAmt', e => {
                        tableAllBills.replaceData(openBills);
                    });
                    
                    $(document).on('click', '#partPaidBillsAmt', e => {
                        tableAllBills.replaceData(partPaidBills);
                    });  

                    $(document).on('click', '#paidBillsAmt', e => {
                        tableAllBills.replaceData(paidBills);
                    });                    
                    
                });
                popAllBills();

                let billStatus = { draft: {background: '#999', color: '#eee'}, open: {background: 'dodgerblue', color: '#fff'}, recurring: {background: '#ffbb33', color: '#fff'} }

                let tableAllBills = new Tabulator("#vendorBills-table", {
                    // width: '100vw',
                    height: "calc(100vh - 230px)",
                    // data: [],           //load row data from array
                    layout: "fitColumns",      //fit columns to width of table
                    layoutColumnsOnNewData: true,
                    // responsiveLayout: "hide",  //hide columns that dont fit on the table
                    // headerVisible: false, //hide column headers
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
                        {column: "vendor", dir: "desc"},
                        {column: "bill_id", dir: "desc"},
                    ],
                    // sortOrderReverse: true,
                    // groupBy: ["bill_id"], 
                    columns: [                 //define the table columns
                        {title: "#", field:"", formatter: "rownum", headerMenu, visible: !false, print: true, width: 20},
                        // {title: "REG. DATE", field: "regdate", visible: false },
                        {title: "BILL ID", field: "bill_id", headerMenu, visible: false },
                        {title: "ORDER ID", field: "order_id", headerMenu, visible: false },
                        {title: "DATE", field: "regdate", headerMenu, formatter: (cell, formatterParams, onRendered) => moment(cell.getValue()).format('ddd, MMM DD, YYYY'), width: 75, visible: false },
                        {title: "BILL DATE", field: "bill_date", headerMenu, formatter: (cell, formatterParams, onRendered) => moment(cell.getValue()).format('ddd, MMM DD, YYYY'), width: 100, visible: !recurringFilter },
                        {title: "VENDOR ID", field: "vendor_id", headerMenu, formatter: (cell, formatterParams, onRendered) => cell.getValue() && _.toUpper(cell.getValue()), width: 100, visible: false },
                        {title: "INVOICE", field: "invoice", headerMenu, width: 100, visible: !recurringFilter },
                        {title: "REF No.", field: "ref", headerMenu, width: 100, visible: !recurringFilter },
                        {title: "VENDOR", field: "vendor", headerMenu, formatter: (cell, formatterParams, onRendered) => cell.getValue() && _.toUpper(cell.getValue()), minWidth: 200, visible: !recurringFilter },
                        {title: "LABEL", field: "recurring.lbl", headerMenu, formatter: (cell, formatterParams, onRendered) => cell.getValue() && _.toUpper(cell.getValue()), minWidth: 120, visible: !_.isUndefined(recurringFilter) },
                        {title: "FREQUENCY", field: "recurring.interval", headerMenu, formatter: (cell, formatterParams, onRendered) => { let { interval, span, period, dateFrom, dateTo } = cell.getData().recurring; return calcRecurBill({interval, span, period, dateFrom, dateTo }).repeats; }, hozAlign: 'center', width: 120, visible: !_.isUndefined(recurringFilter) },
                        {title: "LAST BILL DATE", field: "recurring.dateFrom", headerMenu, formatter: (cell, formatterParams, onRendered) => { let { interval, span, period, dateFrom, dateTo } = cell.getData().recurring; let { lastBilled } = calcRecurBill({interval, span, period, dateFrom, dateTo }); return lastBilled == "" ? "" : lastBilled; }, width: 100, visible: !_.isUndefined(recurringFilter) },
                        {title: "NEXT BILL DATE", field: "recurring.dateTo", headerMenu, formatter: (cell, formatterParams, onRendered) => { let { interval, span, period, dateFrom, dateTo } = cell.getData().recurring; let { nextBilled } = calcRecurBill({interval, span, period, dateFrom, dateTo }); return nextBilled == "" ? "" : nextBilled; }, width: 100, visible: !_.isUndefined(recurringFilter) },
                        {title: "STATUS", field: "", headerMenu, formatter: (cell, formatterParams, onRendered) => { let { interval, span, period, dateFrom, dateTo } = cell.getData().recurring; return calcRecurBill({interval, span, period, dateFrom, dateTo }).expired ? `<span class="clr-danger">EXPIRED</span>` : `<span class="clr-primary">ACTIVE</span>`; }, hozAlign: 'center', width: 120, visible: !_.isUndefined(recurringFilter) },
                        {title: "STATUS", field: "stat", headerMenu, formatter: (cell, formatterParams, onRendered) => { let { due_date, balance, overdue } = cell.getData(); return (overdue < 0 && balance > 0) ? `<span style="width: 100%; background: ${-overdue > 1 ? 'red' : ''}; color: #fff; padding: 5px 10px; font-weight: bold;">OVERDUE <br/>BY ${-overdue} ${-overdue > 1 ? 'DAYS' : 'DAY'}</span>` : balance == 0 ? `<span style="width: 100%; background: green; color: #fff; padding: 5px 10px; font-weight: bold; display: flex; gap: 5px; align-items: center;"><i class="fa fa-check-circle fa-2x"></i> <span>PAID <br/>IN FULL</span></span>` : `<span style="background: ${!_.isUndefined(billStatus[cell.getValue()]) && billStatus[cell.getValue()].background}; color: ${!_.isUndefined(billStatus[cell.getValue()]) && billStatus[cell.getValue()].color}; width: 100%; padding: 5px 10px; font-weight: bold; display: flex; gap: 5px; align-items: center;">${_.toUpper(cell.getValue())}</span>` }, width: 120, visible: !recurringFilter },
                        {title: "DUE DATE", field: "due_date", headerMenu, formatter: (cell, formatterParams, onRendered) => moment(cell.getValue()).format('ddd, MMM DD, YYYY'), width: 100, visible: !recurringFilter },
                        {title: "AMOUNT", field: "amt", headerMenu, formatter: "money", hozAlign: "right", width: 100, bottomCalc: 'sum' },
                        {title: "BALANCE", field: "balance", headerMenu, formatter: "money", hozAlign: "right", bottomCalc: 'sum', width: 100, visible: !recurringFilter },
                        {title: "OVERDUE", field: "overdue", headerMenu, hozAlign: "right", width: 100, visible: false }
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
                        // while(element.firstChild) element.removeChild(element.firstChild);

                        // billStatus[data.stat] && $(element).css({'background': billStatus[data.stat].background, 'color': billStatus[data.stat].color});
                    },
                    rowFormatterPrint: row => {
                        //row - row component
                        var data = row.getData();
                    },
                    rowSelectionChanged: (data, rows) => {
                        if(_.size(data) > 0){
                            let { balance } = data[0];
                            console.log("Find: ", _.find(allBills, bill => bill.bill_id == tableAllBills.getSelectedData()[0].bill_id).recurring)
                            recurringFilter ? previewRecurringBill({ table: _.filter(allBills, bill => bill.bill_id == tableAllBills.getSelectedData()[0].bill_id), recurFormData: _.find(allBills, bill => bill.bill_id == tableAllBills.getSelectedData()[0].bill_id).recurring }) : previewBill({table: tableAllBills});
                            $('.previewBillToolbar #btnMakeBill').css({'display': _.size(rows) < 1 ? 'none' : ''});
                        }                        
                    },
                    printFormatter: (tableHolderElement, tableElement) => {
                        //tableHolderElement - The element that holds the header, footer and table elements
                        //tableElement - The table
                    },
                    footerElement: ``, //add a custom button to the footer element
                    printFooter: `<div style="display: flex; justify-content: space-between; align-items: center;"><p>MyShop OS v0.2</p><p>Software By: Samad Kanton</p></center>`
                });
                
                $("#btnAllBillsOpts .dropdown-menu a").on("click", function () { 
                    if($(this).index() == 0) {
                        _.size(tableAllBills.getSelectedRows()) > 0 ? newBill({table: tableAllBills}) : alert('You need to select a vendor from the list of bills.');                    
                    }
                    else {
                        if($(this).index() == 1) {
                            sortBill({table: tableAllBills});
                        }
                        else{
                            popAllBills();
                        }
                    }                    
                }); 
                
                $("#btnExportBills .dropdown-menu a").on("click", function () {
                    // console.log($(this).index());
                    if($(this).index() == 0) {
                        setPrintHeader({
                            table: tableAllBills,
                            content: `
                                <div style="font-family: verdana; display: grid; grid-template-columns: auto 1fr auto; justify-content: space-between;">
                                    <section><img src='../uploads/${myCompany[0]['logo']}' alt='${myCompany[0]['comp_name']} Logo' width='120px' height='100px'></section>
                                    <section style="text-align: center;"><h1 style="margin: 10px 0;">${myCompany[0]['comp_name']}</h1><p style="margin-top: 0">${myCompany[0]['addr']}</p><p style="margin-top: 0">0${myCompany[0]['phone']} / 0${myCompany[0]['mobile']}</p><h2>VENDOR BILLS</h2></section>
                                    <section><img src='../uploads/${myCompany[0]['logo']}' alt='${myCompany[0]['comp_name']} Logo' width='120px' height='100px'></section>
                                </div>
                            `
                        });
                        // setPrintHeader({
                        //     table: tableAllBills,
                        //     content: `
                        //         <div style="margin-bottom: 30px; display: grid; grid-template-columns: 400px auto; gap: 20px; justify-content: space-between;">
                        //             <div style="font-family: verdana; display: grid; gap: 20px; justify-content: space-between;">
                        //                 <div style="display: flex; gap: 20px; align-items: center;">
                        //                     <img src='../uploads/${myCompany[0]['logo']}' alt='${myCompany[0]['comp_name']} Logo' width='50' height='50'>
                        //                     <h1 style="margin: 10px 0;">${myCompany[0]['comp_name']}</h1>                                       
                        //                 </div>
                        //                 <div>
                        //                     <p style="margin-top: 0">${myCompany[0]['addr']}</p>
                        //                     <p style="margin-top: 0">0${myCompany[0]['phone']} / 0${myCompany[0]['mobile']}</p>
                        //                 </div>
                        //             </div>
                        //             <div style="font-family: verdana; display: grid; gap: 10px; justify-content: flex-end; text-align: right;">
                                        
                        //             </div>
                        //         </div>
                        //     `
                        // });
                        // setPrintFooter({
                        //     table: tableAllBills,
                        //     content: `
                        //         <div style="margin: 30px 0; display: grid; gap: 20px; justify-content: flex-end;">
                        //             <h3 class="txt-right" style="margin: 0;">
                        //                 <span style="width: 200px;">Sub Total:</span>
                        //                 <span style="margin-left: 30px;">0.00</span>
                        //             </h3>
                        //             <h3 class="txt-right" style="margin: 0;">
                        //                 <span style="width: 200px;">Total:</span>
                        //                 <span style="margin-left: 30px;">0.00</span>
                        //             </h3>
                        //             <h3 class="txt-right" style="margin: 0;">
                        //                 <span style="width: 200px;">Balance Due:</span>
                        //                 <span style="margin-left: 30px;">0.00</span>
                        //             </h3>
                        //         </div>
                        //     `
                        // });
                        tableAllBills.print();
                    }
                    else if($(this).index() == 1) tableAllBills.download("xlsx", "Vendor Accounts.xlsx", {});
                    else tableAllBills.download("pdf", "Vendor Accounts.pdf", {
                            orientation: "portrait", //set page orientation to portrait
                            title: "Vendor Accounts", //add title to report
                        });
                });
            }
            
        }
    });
}

export default viewBills;