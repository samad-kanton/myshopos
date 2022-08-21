import { activeUser, appSounds, pop, headerMenu, computeAmt, thousandsSeperator, myProgressLoader, companyProfile, calcRecurBill } from "../../assets/js/utils.js";
import myAlertifyDialog from "../myAlertifyDialog.js";

let myCompany;
companyProfile().then((data) => myCompany = data);

let table;
const previewRecurringBill = params => {
    table = params.table;
    console.log("previewRecurringBill Params: ", params) 
    let { lbl, interval, span, period, dateFrom, dateTo } = params.recurFormData, { expired, repeats, lastBilled, nextBilled } = calcRecurBill(params.recurFormData);
console.log("Expired: ", expired)
    myAlertifyDialog({
        name: 'previewRecurringBill', 
        content: `
            <div style="position: relative;">
                <div>
                    <div>PREVIEW OF RECURRING BILL</div>
                </div>
                
                <hr style="border: dashed 1px #ccc;" />


                <div class="ribbon ribbon-top-right"><span style="background: ${expired ? 'red' : ''};">${expired ? 'EXPIRED' : 'ACTIVE'}</span></div>

                <div style="margin-bottom: 30px; display: grid; grid-template-columns: 400px auto; gap: 20px; justify-content: space-between;">
                    <div style="font-family: verdana; display: grid; gap: 20px; justify-content: space-between;">
                        <div style="display: flex; gap: 20px; align-items: center;">
                            <img src='../uploads/${myCompany[0]['logo']}' alt='${myCompany[0]['comp_name']} Logo' width='50' height='50'>
                            <h1 style="margin: 0;">${myCompany[0]['comp_name']}</h1>                                       
                        </div>
                        <div>
                            <p style="margin-top: 0">${myCompany[0]['addr']}</p>
                            <p style="margin-top: 0">0${myCompany[0]['phone']} / 0${myCompany[0]['mobile']}</p>
                        </div>
                        <div>
                            <p>Recurring Bill</p>
                            <section><b style="font-size: 1.5em;">${_.toUpper(lbl)}</b></section>
                        </div>
                    </div>
                    <div style="font-family: verdana; display: grid; gap: 10px; justify-content: flex-end; text-align: right;">
                        <div style="margin-right: 100px;">
                            <b>Next Bill Date</b>
                            <h1 style="margin: 0;">${nextBilled}</h1>
                        </div>
                        <div style="display: grid; gap: 10px;">
                            <section style="display: flex; gap: 10px; justify-content: space-between; align-items: center;">
                                <span>Repeats:</span>
                                <span style="flex: 100px;"><b>${repeats}</b></span>
                            </section>
                            <section style="display: flex; gap: 10px; justify-content: space-between; align-items: center;">
                                <span>Start On:</span>
                                <span style="flex: 100px;"><b>${moment(dateFrom).format('LL')}</b></span>
                            </section>
                            <section style="display: flex; gap: 10px; justify-content: space-between; align-items: center;">
                                <span>Ends On:</span>
                                <span style="flex: 100px;"><b>${moment(dateTo).format('LL')}</b></span>
                            </section>
                        </div>
                    </div>
                </div>

                <div id="recurringBillDetails-table" style="margin-top: 10px;"></div>
            </div>
        `,
        setup: {
            onshow: async () => {   

                alertify.recurringBillLoader().close();

                var tableRecurringBillDetails = new Tabulator("#recurringBillDetails-table", {
                    // width: '100vw',
                    height: "calc(100vh - 310px)",
                    data: table,           //load row data from array
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
                    // groupBy: "bill_id",    
                    // groupHeader: [
                    //     (value, count, data, group) => {
                    //         let matched = _.filter(table, bill => bill.bill_id == value), numVendors = _.size(matched);
                    //         return matched[0].invoice + `<span style='color:#d00; margin-left:10px;'>(${numVendors} ${numVendors > 1 ? 'items' : 'item'})</span>`
                    //     },
                    //     (value, count, data, group) => {
                    //         let matched = _.filter(tableBillsDetails.getData(), bill => bill.vendor_id == value), numInvoices = _.size(matched);
                    //         console.log(_.filter(matched, match => match.bill_date==matched[0].bill_date))
                    //         return _.toUpper(matched[0].vendor) + `<span style='color:#d00; margin-left:10px;'>(${numInvoices} ${numInvoices > 1 ? 'invoices' : 'invoice'})</span>`
                    //     },
                    //     (value, count, data, group) => {
                    //         // console.log(value, count, data, _.filter(tableBillsDetails.getData(), bill => bill.invoice == value))
                    //         return value + `<span style='color:#d00; margin-left:10px;'>(${count} ${count > 1 ? 'items' : 'item'})</span>`
                    //     }
                    // ],
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
            }
        }
    }).resizeTo(200, 300)
}

export default previewRecurringBill;