import { activeUser, appSounds, pop, headerMenu, computeAmt, myProgressLoader, dateEditor } from "../../assets/js/utils.js";
import myAlertifyDialog from "../myAlertifyDialog.js";
import recurringBill from "./recurring.js";

let table, clone;
const newBill = params => {
    console.log("NewBill Params: ", params)
    table = params.table;
    clone = params.clone;
    let { vendor_id, vendor } = params.table;

    myAlertifyDialog({
        name: 'newBill', 
        content: `
            <div>NEW BILL FOR <b class="clr-f05">${_.toUpper(vendor)}</b></div>
                <hr style="border: dashed 1px #ccc;" />

                <div class="row" style="display: flex; align-items: flex-end;">
                    <div class="cl-2 cm-3 cs-4 cx-5">
                        <div class="form-group">
                            <input type="text" name="invoice" id="invoice" placeholder="invoice">
                            <label for="invoice" class="floated-up-lbl">Bill Number</label>
                            <sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>
                        </div>
                    </div> 
                    <div class="cl-2 cm-2 cs-4 cx-5">
                        <div class="form-group">
                        <div class="date-container">
                            <input type="date" name="bill_date" id="bill_date" required>
                            <label for="bill_date" class="floated-up-lbl" style="top: -5px;">Billing Date</label>
                                <sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>
                            </div>
                        </div>
                    </div>  
                    <div class="cl-2 cm-2 cs-4 cx-5">
                        <div class="form-group">
                            <div class="date-container">
                                <input type="date" name="due_date" id="due_date" required>
                                <label for="due_date" class="floated-up-lbl" style="top: -5px;">Due Date</label>
                                <sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>
                            </div>
                        </div>
                    </div> 
                    <div class="cl-1 cm-1 cs-4 cx-2">
                        <div class="form-group">
                            <button type="button" id="btnTableOpts" class="btn btn-teal btn-md btn-block dropdown">
                                <span><i class="fa fa-cog fa-2x"></i></span>
                                <div class="dropdown-menu">
                                    
                                </div>
                            </button>
                        </div>
                    </div>
                    <div class="cl-2 cm-2 cs-4 cx-2">
                        <div class="form-group">
                            <button disabled type="button" id="btnSaveOpts" class="btn btn-info btn-lg btn-block dropdown">
                                <span>Save As <i class="fa fa-caret-down"></i></span>
                                <div class="dropdown-menu">
                                    <a href="javascript:void(0);" class="no-udl clr-teal"><i class="fa fa-bookmark-o"></i> Draft</a>
                                    <a href="javascript:void(0);" class="no-udl clr-success"><i class="fa fa-save"></i> Open</a>
                                    <a href="javascript:void(0);" class="no-udl clr-f05"><i class="fa fa-refresh"></i> Recurring</a>
                                </div>
                            </button>
                        </div>
                    </div>
                    <div class="cl-3 cm-2 cs-8 cx-7 search-pane float-xs">
                        <div class="form-group" style="position: relative;">
                            <input type="search" id="find_item" placeholder="Search...">
                            <label for="find_item" style="cursor: pointer;"><i class="fa fa-search clr-primary" style="width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;"></i></label>
                        </div>
                    </div>
                </div>
                <div id="newBill-table"></div>
        `,
        setup: {
            onshow: async () => {
                var stocks, tableNewBill, categoriesSelect = {}; 
                
                myProgressLoader.load();  
                $("#bill_date").val(moment().format("YYYY-MM-DD"));

                await pop('../stock/crud.php?pop')
                .then(async resp => {
                    await pop('../stock/categories/crud.php?pop').then(resp => {
                        // console.log(resp);
                        resp.data.map((entry, i) => {
                            categoriesSelect[entry.cat_id] = entry.title;
                        });
                        // console.log(categoriesSelect);
                    });
                    myProgressLoader.stop();

                    $('#invoice').trigger('focus')
                    stocks = resp.data;
                    console.log("Stocks: ", stocks)
        
                    tableNewBill = new Tabulator("#newBill-table", {
                        height: "calc(100vh - 155px)",
                        minHeight: 311,
                        data: (!_.isUndefined(clone) && clone) ? [...table.getData(), {new_record: 1}] : [], //load row data from array
                        layout: "fitColumns",      //fit columns to width of table
                        cellVertAlign: "middle",
                        // responsiveLayout: "collapse",  //hide columns that dont fit on the table    
                        selectable: 1,
                        tooltips: true,            //show tool tips on cells
                        addRowPos: "top",          //when adding a new row, add it to the top of the table
                        history: true,             //allow undo and redo actions on the table        
                        sortOrderReverse: true,
                        initialSort: [             //set the initial sort order of the data
                            // {column: "title", dir: "asc"},
                            {column: "item", dir: "asc"}
                        ],
                        index: "prod_id",
                        columns: [                 
                            //define the table columns
                            // {formatter:"rowSelection", titleFormatter:"rowSelection", hozAlign:"center", headerSort:false},
                            {title: "#", field: 'sn', headerMenu, headerSort: false, formatter: "rownum", width: 50},
                            {title: "ITEM ID", field: "prod_id", visible: false },
                            {title: "DESCRIPTION", field: "item", headerMenu, editor: "autocomplete", editorParams: {
                                showListOnEmpty: true, //show all values when the list is empty,
                                freetext: true, //allow the user to set the value of the cell to a free text entry
                                // allowEmpty: true, //allow empty string values
                                searchFunc: (term, values) => { //search for exact matches
                                    var matches = [];         
                                    values.forEach(value => {
                                        //value - one of the values from the value property            
                                        if(value.item.toLowerCase().indexOf(term.toLowerCase()) > -1){
                                            matches.push(value.item.toUpperCase());
                                        }
                                    });
                                    return matches;
                                },
                                searchingPlaceholder: "Filtering ...", //set the search placeholder
                                emptyPlaceholder: "(no matching results found)", //set the empty list placeholder
                                // listItemFormatter:function(value, title){ //prefix all titles with the work "Mr"
                                //     return "Mr " + title;
                                // },
                                values: stocks, //create list of values from all values contained in this column
                                sortValuesList: "asc", //if creating a list of values from values:true then choose how it should be sorted
                                // defaultValue: "Steve Johnson", //set the value that should be selected by default if the cells value is undefined
                                elementAttributes:{
                                    maxlength: "100", //set the maximum character length of the input element to 10 characters
                                },
                                mask: "",
                                verticalNavigation: "hybrid", //navigate to new row when at the top or bottom of the selection list
                            },
                            formatter: (cell, formatterParams, onRendered) => cell.getValue() && cell.getValue().toUpperCase(), 
                            accessorDownload: (value, data, type, params, column) => { return value?.toUpperCase(); },
                            validator: ["required", "unique"],
                            minWidth: 150,
                            // frozen:true
                            },
                            {title: "CATEGORY", field: "title", headerSort: false, editor: "select", editorParams: { sortValuesList: true, listItemFormatter: (value, title) => title.toUpperCase(), values: categoriesSelect, verticalNavigation:"hybrid"}, formatter: (cell, formatterParams) => cell.getValue() && cell.getValue().toUpperCase(), validator: "required", width: 120, print: false, download: false },
                            {title: "UNIT MEASURE", field: "um", headerSort: false, editor: "select", editorParams: { sortValuesList: true, listItemFormatter: (value, title) => title.toUpperCase(), values: ['Bag', 'Box', 'Bundle', 'Carton', 'Pc', 'Pack', 'Gallon', 'Olanka'], verticalNavigation:"hybrid"}, formatter: (cell, formatterParams) => cell.getValue() && cell.getValue().toUpperCase(), width: 120, visible: false },
                            // {title: "DIM", field: "dim", headerSort: false, editor: "input", hozAlign: 'right', formatter: "money", formatterParams: {precision: 0 }, validator: ["required", "min: .1", "numeric"], width: 50},
                            // {title: "UNIT", field: "um", headerSort: false, editor: "select", editorParams: {}, hozAlign: 'right', validator: ["required"], width: 50},
                            {title: "QTY (Pcs)", field: "new_qty", headerSort: false, editor: "input", hozAlign: 'right', formatter: "money", formatterParams: { precision: 0 }, bottomCalc: 'sum', bottomCalcParams: { precision: 2 }, validator: ["required", "min: 0", "numeric"], width: 80},
                            {title: "PREV QTY", field: "prev_qty", headerSort: false, editor: "input", hozAlign: 'right', formatter: "money", formatterParams: { precision: 0 }, bottomCalc: 'sum', bottomCalcParams: { precision: 2 }, validator: ["required", "min: 0", "numeric"], width: 80, visible: false},
                            {title: "UNIT COST", field: "cp", editor: "input", hozAlign: 'right', formatter: "money", bottomCalc: 'sum', bottomCalcParams: { precision: 2 }, validator: ["required", "min: 0", "numeric"], width: 120},     
                            {title: "RATE", field: "rp", editor: "input", hozAlign: 'right', formatter: "money", bottomCalc: 'sum', bottomCalcParams: { precision: 2 }, validator: ["required", "min: 0", "numeric"], width: 120},  
                            {title: "AMOUNT", field: "amt", hozAlign: 'right', formatter: "money", bottomCalc: 'sum', bottomCalcParams: { precision: 2 }, width: 110},  
                            {title: "MARGIN", field: "margin", hozAlign: 'right', formatter: "money", bottomCalc: 'sum', bottomCalcParams: { precision: 2 }, width: 110},  
                            {title: "NEW", field: "new_record", hozAlign: 'right', width: 40, visible: false},  
                            {title: "BARCODE", field: "barcode", headerSort: false, editor: "textarea", width: 120, visible: false},
                            {title: "RESTOCK", field: "restock", editor: "input", hozAlign: 'right', formatter: "money", formatterParams: { precision: 0}, validator: ["min: .01", "numeric"], width: 80, visible: false},    
                            {title: "EXPIRY", field: "expdate", headerSort: false, editor: dateEditor, formatter: "datetime", formatterParams:{ inputFormat:"YYYY-MM-DD HH:ii", outputFormat:"DD/MM/YY", invalidPlaceholder: true}, visible: false },
                            // validator: (cell, value, parameters) => value != "" && value != "Invalid date",
                            // minWidth: 100},
                            {title: "", field: "cmd", width: 30, headerSort: false, hozAlign: "center", tooltip: (cell) => cell.getData().new_record == 1 ? "Cancel" : "Delete", formatter: (cell, formatterParams, onRendered) => { return `<i class='fa fa-${cell.getData().new_record == 1 ? 'undo' : 'trash'} fa-2x clr-danger' onclick=''></i>` || ''; }, print: false, 
                                cellClick: (e, cell) => {
                                    // console.log(cell.getData().new_record)
                                    let { new_record } = cell.getData();
                                    console.log('size: ', (cell.getTable().getData()))
                                    // if(_.size(cell.getTable().getData()) > 0 && new_record == 0){
                                        // console.log(cell.getRow().getIndex())
                                        cell.getRow().delete();
                                        appSounds.oringz.play();
                                        $('#invoice').trigger('input');  // Add New Row
                                        cell.getRow().reformat();
                                    // }
                                    // else{
        
                                    // }
                                },
                            }
                        ],
                        tooltipsHeader: true, //enable header tooltips
                        tooltipGenerationMode: "hover", //regenerate tooltip as users mouse enters the cell;
                        rowClick: (row) => {
                            // console.log(row)
                        },
                        cellEditing: cell => {
                            //cell - cell component
                            cell.getRow().validate();
                        },
                        cellEditCancelled: cell => {
                            //cell - cell component
                            if(!cell.isEdited()){
                                // cell.getOldValue() != "" ? cell.setValue(cell.getInitialValue() - cell.getOldValue()) : cell.restoreInitialValue();
                                cell.clearValidation();
                            }
                        },
                        cellEdited: cell => {
                            //cell - cell component
                            // console.log(cell.getValue() != cell.getOldValue(), cell.getOldValue() == cell.getInitialValue(), cell)
                            if(cell.isValid() && _.trim(cell.getValue()) != cell.getOldValue() && _.trim(cell.getValue()) != "" || true){
                                let item = _.filter(stocks, stock => _.toLower(stock.item) == _.toLower(cell.getData().item));
                                item = _.size(item) > 0 && item[0];
                                // console.log("item: ", item)
                                let { prod_id, cat_id: title, cp, rp, qty: prev_qty } = { prod_id: !_.isUndefined(item.prod_id) && item.prod_id, cat_id: item.title ? item.title : cell.getData().title, cp: _.toLower(cell.getField()) == 'cp' ? cell.getValue() : ((_.toLower(cell.getField()) != 'new_qty' && _.toLower(cell.getField()) != 'rp') ? item.cp : cell.getData().cp), rp: _.toLower(cell.getField()) == 'rp' ? cell.getValue() : ((_.toLower(cell.getField()) != 'new_qty' && _.toLower(cell.getField()) != 'cp') ? item.rp : cell.getData().rp), qty: _.isUndefined(item.qty) ? 0 : item.qty}, { qty } = cell.getData(), amt = computeAmt(cp, qty), margin = (computeAmt(rp, qty) - computeAmt(cp, qty));
                                // console.log(prod_id, title, prev_qty, cp, rp, qty)
                                cell.getRow().update({prod_id, title, prev_qty, cp, rp, amt, margin});
                                cell.getRow().validate();

                                if(_.size(tableNewBill.getInvalidCells()) < 1){
                                    // Add New Row
                                    cell.getRow().update({new_record: 0});
                                    cell.getRow().reformat();
                                    $('#invoice').trigger('input');     
                                    $("#btnSaveOpts").prop('disabled', false);
                                }               
                                else{                             
                                    cell.getData().new_record != 0 && $("#btnSaveOpts").prop('disabled', true);
                                } 
                            }
                            cell.getRow().validate()
                        },
                        validationFailed: (cell, value, validators) => {
                            //cell - cell component for the edited cell
                            //value - the value that failed validation
                            //validatiors - an array of validator objects that failed
                            if(cell.getData().new_record == 0){
                                cell.setValue(cell.getValue());
                                cell.cancelEdit();
                                cell.clearValidation();                                        
                            }                              
                        },
                        rowFormatter: row => {
                            var element = row.getElement(), data = row.getData(), cellContents = '';
                            // clear current row data
                            // while(element.firstChild) element.removeChild(element.firstChild);

                            (data.new_record == 0 && (_.size(_.filter(row.getCells(), cell => (cell.getField() != 'sn' && cell.getField() != 'cmd') && _.isUndefined(cell.getValue()))) < 1 ? $("#btnSaveOpts").prop('disabled', false) : $("#btnSaveOpts").prop('disabled', true)));
                            !_.isUndefined(clone) && $("#btnSaveOpts").prop('disabled', false);
                        },
                        paginationSize: 100,         //allow 7 rows per page of data
                        paginationSizeSelector: true, //enable page size select element and generate list options
                        printFooter: `<div style="display: flex; justify-content: space-between; align-items: center;"><p>MyShop OS v0.2</p><p>Software By: Samad Kanton</p></center>`,
                        placeholder: "No Data Available", //display message to user on empty table
                    });
                });
                
                $(document).on('input', '#invoice', e => {
                    tableNewBill.validate();  
                    if(e.target.value != "" && _.size(tableNewBill.getInvalidCells()) < 1){
                        tableNewBill.addRow({new_record: 1});
                        tableNewBill.validate(); 
                    }
                });      
                
                // let tableCols = { sn: "Serial No.", item: 'Description', new_qty: 'Quantity', cp: "Unit Cost", rp: "Retail Price", amt: "Amount", margin: "Margin" }
                let toggleCols = { um: "Unit Measure", barcode: 'Barcode', restock: 'Restock At', expdate: 'Expiry Date' }
                _.filter(tableNewBill.getColumns(), (col, i) => {
                    // console.log(col.isVisible(), col.getField())
                    (!col.isVisible() && !_.isUndefined(toggleCols[col.getField()])) && $("#btnTableOpts .dropdown-menu").append(`
                        <div class="form-group" style="margin: 0; padding: 5px 10px;">
                            <div class="checkbox" style="white-space: nowrap;">
                                <input hidden type="checkbox" name="${col.getField()}" id="${col.getField()}" class="custom-checkbox">
                                <label for="${col.getField()}" style="cursor: pointer;">&nbsp;${_.startCase(toggleCols[col.getField()])}</label>
                            </div>
                        </div>
                        ${i < _.size(tableNewBill.getColumns())-1 && '<hr style="display: grid; width: 100%; border: dotted 1px #ddd;" />'}
                    `);
                })
                
                $("#btnTableOpts .dropdown-menu [type='checkbox']").on("change", function (e) {
                    tableNewBill.toggleColumn(e.target.id);
                    tableNewBill.redraw(true);
                    tableNewBill.scrollToColumn(e.target.id, "middle", false); //scroll column with field of "age" to the middle if not already visible
                    tableNewBill.validate(); 
                });
        
                $("#btnSaveOpts .dropdown-menu a").on("click", function () {
                    const saveBillAs = opts => {
                        const promptEmptyFields = opts => {
                            let emptyFields = _.filter(opts, param => $(param.field).val() == "");
                            if(_.size(emptyFields) > 0){
                                alert(emptyFields[0].msg);
                                $(emptyFields[0].field).trigger('focus')
                            }
                            return emptyFields;
                        }   
                        if(_.size(promptEmptyFields([{field: '#invoice', msg: `Please enter Bill Number"`}, {field: '#bill_date', msg: `Please enter Billing Date.`}, {field: '#due_date', msg: `Please select Date Due for payment.`}])) < 1){
                            $.ajax({
                                url: `./crud.php?bill&${opts.as}&emp_id=${activeUser.id}`,
                                type: "POST",
                                dataType: 'JSON',
                                // data: crud_type == "open" ? {...cell.getData(), invoice: $('#invoice').val(), dated: $('#dated').val(), vendor_id, prod_id} : { prod_id: cell.getData().prod_id, col: cell.getField() == "title" && "cat_id" || cell.getField(), oldValue: cell.getOldValue(), newValue: cell.getField() == "expdate" && moment(cell.getValue()).format("Y-MM-DD") || cell.getValue() },
                                data: { invoice: $('#invoice').val(), bill_date: $('#bill_date').val(), due_date: $('#due_date').val(), vendor_id, items: _.filter(tableNewBill.getData(), item => item.new_record != 1) },
                                success: function (resp) {
                                    console.log(resp.stat)
                                    if (resp.saved || resp.updated) {
                                        appSounds.oringz.play();
                                        alertify.success(`Saved as ${(resp.saved && resp.stat == 1 ) ? 'Draft' : 'Open'}`);
                                        tableNewBill.clearData();
                                        // alertify.newBill().close(); // Close Dialog instance with name 'newBill'
                                        // popAllBills();
                                    }
                                    else {
                                        console.log(resp);
                                    }
                                    $('#invoice, #bill_date, #dueDate, #btnSaveOpts').prop('disabled', false);                                        
                                    $('#invoice').val('').trigger('focus');                                        
                                },
                                beforeSend: function () {
                                    $('#invoice, #bill_date, #dueDate, #btnSaveOpts').prop('disabled', true);                                        
                                }
                            });
                        }
                    }
        
                    // Save per action type
                    if($(this).index() == 0) {
                        saveBillAs({as: 'draft'});                
                    }
                    else if($(this).index() == 1) {    
                        saveBillAs({as: 'open'});
                    }
                    else {
                        // saveBillAs({as: 'recurring'});
                        console.log("v", vendor)
                        recurringBill({table: _.filter(tableNewBill.getData(), entry => entry.new_record != 1), bill_id: clone ? params.bill_id : '', vendor, new: !clone});
                    }
                    
                }); 
            }
        }
    });
}

export default newBill;