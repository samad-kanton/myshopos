import { activeUser, appSounds, pop, headerMenu, computeAmt, thousandsSeperator, localeEs, adp } from "../../assets/js/utils.js";
import myAlertifyDialog from "../myAlertifyDialog.js";
import viewBills from "./view.js";
// import en from '../../assets/plugins/air-datepicker/locale/en.js'

let table;

const sortBill = params => {
    table = params.table;
    // console.log("SortBill Params: ", table.element.id);
    myAlertifyDialog({
        name: 'payBill', 
        content: `
            <div style="display: flex; gap: 20px; position: relative; z-index: 2; width: 200px;">
                <div class="form-group" style="margin: 0; display: flex; gap: 5px; align-items: center;">
                    <input type="radio" name="optSortFilter" id="optSort" value="sort" required />
                    <label for="optSort" class="">Sort</label>
                </div>
                <div class="form-group" style="margin: 0; display: flex; gap: 5px; align-items: center;">
                    <input type="radio" name="optSortFilter" id="optFilter" value="filter" required />
                    <label for="optFilter" class="">Filter</label>
                </div>
            </div>
            <hr style="border: dashed 1px #ccc;" />
            
            <form role="form" id="frm_billPayment" autocomplete="off">

                <div style="display: flex; gap: 10px; justify-content: space-between; align-items: center;">
                    <div>
                        <div class="form-group" style="margin-left: 0; display: flex; gap: 5px; align-items: center;">
                            <input disabled type="radio" name="sortBy" id="billNo" value="invoice" required />
                            <label for="billNo" class="">Bill No.</label>
                        </div>
                        <div class="form-group" style="margin-left: 0; display: flex; gap: 5px; align-items: center;">
                            <input disabled type="radio" name="sortBy" id="vendor_name" value="vendor" required />
                            <label for="vendor_name" class="">Vendor Name</label>
                        </div>
                        <div class="form-group" style="margin-left: 0; display: flex; gap: 5px; align-items: center;">
                            <input disabled type="radio" name="sortBy" id="billDate" value="bill_date" required />
                            <label for="billDate" class="">Created Date</label>
                        </div>
                        <div class="form-group" style="margin-left: 0; display: flex; gap: 5px; align-items: center;">
                            <input disabled type="radio" name="sortBy" id="dueDate" value="due_date" required />
                            <label for="dueDate" class="">Due Date</label>
                        </div>
                        <div class="form-group" style="margin-left: 0; display: flex; gap: 5px; align-items: center;">
                            <input disabled type="radio" name="sortBy" id="amount" value="amt" required />
                            <label for="amount" class="">Amount</label>
                        </div>
                        <div class="form-group" style="margin-left: 0; display: flex; gap: 5px; align-items: center;">
                            <input disabled type="radio" name="sortBy" id="balanceDue" value="balance" required />
                            <label for="balanceDue" class="">Balance Due</label>
                        </div>
                    </div>
                    <div style="margin-top: 20px;">
                        <div class="sort_filter" id="sortFields" style="display: none; flex-flow: column;">
                            <div class="form-group" style="display: flex; gap: 5px; align-items: center;">
                                <input type="radio" name="sortDir" id="asc" value="asc" required />
                                <label for="asc" class="">As<u>c</u>ending</label>
                            </div>
                            <div class="form-group" style="display: flex; gap: 5px; align-items: center;">
                                <input type="radio" name="sortDir" id="desc" value="desc" required />
                                <label for="desc" class="">Des<u>c</u>ending</label>
                            </div>
                        </div>
                        <div class="sort_filter" id="filterFields" style="display: none;">
                            <div id="dp"></div>  
                        </div>
                    </div>    
                </div>    

            </form>
        `,
        setup: {
            startMaximized: false,
            // closable: false,
            modal: false,
            closableByDimmer: false,
            onshow: async () => {

                // console.log("Sorters: ", table.getSorters(), '\n', "Filters: ", table.getFilters())
                
                // store temporarily billsData for dynamic sorting
                sessionStorage.setItem('billsData', JSON.stringify(table.getData()));

                const sort = opts => opts.table.setSort([{column: opts.col, dir: opts.dir}]),
                filter = opts => {                 
                    table.setData(JSON.parse(sessionStorage.getItem('billsData')))
                    let dateRange = _.filter(_.map(opts.table.getData(), entry => moment(entry[opts.col]).isBetween(moment(opts.date[0]).format('YYYY-MM-DD'), moment(opts.date[_.size(opts.date) > 1 ? 1 : 0]).format('YYYY-MM-DD'), undefined, '[]') && entry[opts.col]), Boolean);
                    opts.table.setFilter(opts.col, 'in', dateRange);
                }   

                if(_.size(table.getSorters()) > 0 && _.size(table.getFilters()) > 0){
                    $('[name="optSortFilter"]#optSort').prop('checked', true)
                }
                else{    
                    if(_.size(table.getSorters()) > 0){
                        $('[name="optSortFilter"]#optSort').prop('checked', true)
                    }

                    // if(_.size(table.getFilters()) > 0){
                    //     $('[name="optSortFilter"]#optFilter').prop('checked', true)
                    // }
                }
                let sto = setTimeout(() => {
                    $('[name="optSortFilter"]#optSort').trigger('change');
                    let { field, dir } = table.getSorters()[0];
                    $(`[name="sortBy"][value="${field}"]`).prop('checked', true).trigger('change');
                    $(`[name="sortDir"][value="${dir}"]`).prop('checked', true).trigger('change');
                    clearTimeout(sto);
                }, 1);

                // declare & initialize DatePicker instance
                let dp = adp({
                    el: '#dp', 
                    opts: {
                        locale: localeEs,
                        range: true,
                        // selectedDates: [new Date()],
                        // dateFormat(date) {
                        //     return date.toLocaleDateString('en-us', {
                        //         year: 'numeric',
                        //         day: '2-digit',
                        //         month: 'long'
                        //     });
                        // },
                        onSelect({ date }) {
                            // console.log(date, moment(date[0]).format("YYYY-MM-DD"))
                            filter({table: table, col: $('[name="sortBy"]:checked').val(), date});
                        }
                    }
                });                         

                $('#pay_amt').trigger('focus');

                $('[name="optSortFilter"]').on('change', e => {                    
                    e.target.checked && $('[name="sortBy"]').removeAttr('disabled');
                    // Disable all Sorter Fields but date sorters when filtering
                    if(e.target.value == "filter"){
                        _.map($('[name="sortBy"]'), el => {
                            return (el.value != "bill_date" && el.value != "due_date") && $(el).prop('checked', false).attr('disabled', true).trigger('change');
                        });
                    }
                    $('[name="sortBy"]:checked').trigger('change');
                });

                $('[name="sortDir"]').on('change', e => {
                    sort({table, col: $('[name="sortBy"]:checked').val(), dir: e.target.value});
                });
                
                $('[name="sortBy"]').on('change', e => {
                    // console.log(e.target.value)
                    if(e.target.checked){
                        if($('[name="optSortFilter"]:checked').val() == "sort"){
                            $('#sortFields').show();
                            $('#filterFields').hide();
                        }
                        else{
                            $('#sortFields').hide();
                            $('#filterFields').show();
                        }
                    }
                    else{
                        $('#sortFields, #filterFields').hide();
                    }
                });
            }
        }
    }).resizeTo(400, 350)
}

export default sortBill;