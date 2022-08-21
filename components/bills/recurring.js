import { activeUser, appSounds, pop, headerMenu, computeAmt, thousandsSeperator, myProgressLoader } from "../../assets/js/utils.js";
import myAlertifyDialog from "../myAlertifyDialog.js";
import previewRecurringBill from "./previewRecurring.js";

let table;

const recurringBill = params => {
    table = params.table;
    console.log("RecurringBill Params: ", params)
    let { bill_id, vendor } = params;
    // clone ? vendor = params.table[0].vendor : vendor;
    // console.log("vvv", vendor)
    // console.log(table[0]);

    myAlertifyDialog({
        name: 'recurBill', 
        content: `
            <div>
                <div>RECURRING BILL FOR <b class="clr-f05">${_.toUpper(vendor)}</b></div>
            </div>
            <hr style="border: dashed 1px #ccc;" />
            
            <form role="form" id="frm_billRecurring" autocomplete="off" enctype="multipart/form-data">
                <div class="row" style="display: flex; align-items: flex-end;">                   
                    <div class="cl-12 cm-12 cs-12 cx-12">
                        <div class="form-group">
                            <input type="text" name="lbl" id="lbl" minlength="3" maxlength="100" placeholder="name or title of bill" required />
                            <label for="lbl" class="floated-up-lbl" style="top: -5px;">Label</label>
                            <sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>
                        </div>
                    </div> 
                    <div class="row" style="display: flex; align-items: flex-end;">    
                        <div style="flex: 3;"">
                            <div class="form-group">
                                <div class="select-container">
                                    <select name="interval" id="interval" required>
                                        <option value="">--- select ---</option>
                                        <option value="1-w">Week</option>
                                        <option value="2-w">2 Weeks</option>
                                        <option value="1-m">Month</option>
                                        <option value="2-m">2 Months</option>
                                        <option value="3-m">3 Months</option>
                                        <option value="6-m">6 Months</option>
                                        <option value="1-y">Year</option>
                                        <option value="2-y">2 Years</option>
                                        <option value="3-y">3 Years</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                    <label for="interval" class="floated-up-lbl" style="top: -5px;">Repeat Every</label>
                                    <sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>
                                </div>
                            </div>
                        </div>
                        <div id="custom_interval" style="flex: 3; display: none;">
                            <div style="flex: 1;">
                                <div class="form-group">
                                    <input type="number" name="span" id="span" step="1" min="1" />
                                    <label for="span" class="floated-up-lbl">Span</label>
                                    <sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>
                                </div>
                            </div> 
                            <div style="flex: 2;">
                                <div class="form-group">
                                    <div class="select-container">
                                        <select name="period" id="period">
                                            <option value="">--- select ---</option>
                                            <option value="-d">Day(s)</option>
                                            <option value="-w">Week(s)</option>
                                            <option value="-m">Month(s)</option>
                                            <option value="-y">Years(s)</option>
                                        </select>
                                        <label for="period" class="floated-up-lbl" style="top: -5px;">Period</label>
                                        <sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="cl-6 cm-6 cs-6 cx-6">
                        <div class="form-group">
                            <div class="date-container">
                                <input type="date" name="dateFrom" id="dateFrom" required />
                                <label for="dateFrom" class="floated-up-lbl" style="top: -5px;">Start On</label>
                                <sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>
                            </div>
                        </div>
                    </div> 
                    <div class="cl-6 cm-6 cs-6 cx-6">
                        <div class="form-group">
                            <div class="date-container">
                                <input type="date" name="dateTo" id="dateTo" required />
                                <label for="dateTo" class="floated-up-lbl" style="top: -5px;">Ends On</label>
                                <sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>
                            </div>
                        </div>
                    </div>
                    <div class="cl-12 cm-12 cs-12 cx-12">
                        <div class="form-group" style="margin-bottom: 0;">
                            <button type="submit" class="btn btn-${params.new ? 'primary' : 'purple'} btn-block"><i class="fa fa-${params.new ? 'save' : 'pencil'}"></i> ${params.new ? 'Save as Recurring' : 'Set bill as Recurring'}</button>
                        </div>
                    </div> 
                </div>
            </form>
        `,
        setup: {
            startMaximized: false,
            // closable: false,
            closableByDimmer: false,
            onshow: async () => {

                $('#lbl').trigger('focus');
                
                $(document).on('change', '#interval', e => {
                    $("#custom_interval").css('display', e.target.value == 'custom' ? 'flex' : 'none').find('input, select').prop('required', e.target.value == 'custom')
                });
        
                $("#frm_billRecurring").on("submit", function(e) {
                    e.preventDefault();
                    let formData = new FormData(this);
                    $.ajax({
                        url: `./crud.php?bill&recur&bill_id=${bill_id}&emp_id=${activeUser.id}&new=${params.new}`,
                        type: "POST",
                        data: formData,
                        processData: false,
                        contentType: false,
                        cache: false,
                        dataType: 'json',
                        success: resp => {
                            console.log(resp);
                            if (resp.saved || resp.updated) {
                                appSounds.oringz.play();
                                // alertify.success(resp.saved && "Saved" || 'Updated.');
                                myAlertifyDialog({
                                    name: 'recurringBillLoader', 
                                    content: `
                                        <div style="display: grid; justify-content: center;">
                                            <h3>Recurring Bill successfully created.</h3>
                                            <p>Generating preview in a second...</p>
                                        </div>
                                    `,
                                    setup: { 
                                        startMaximized: false, 
                                        resizable: false, 
                                        modal: false,
                                        onshow: () => {
                                            // setTimeout(() => {
                                                previewRecurringBill({table, recurFormData: _.merge(..._.map($(e.target).find('input, select, textarea'), ctrl => ({[ctrl.id]: ctrl.value})))});
                                            // }, 5000);
                                            // console.log("Submit: ", _.map($(e.target).find('input, select, textarea'), ctrl => _.toLower(ctrl.nodeName) == 'select'))
                                        }
                                    },
                                });
                                // alertify.recurBill().close();
                                // $("#frm_billRecurring")[0].reset();
                                $("#btnBillsOpts .dropdown-menu a:last").trigger('click');
                                // popVendors();
                            }
                            else {
                                console.log(resp);
                            }
                            $(e.target).find('input, select, textarea').prop('disabled', false);
                            myProgressLoader.stop(); 
                        },
                        beforeSend: () => {
                            $(e.target).find('input, select, textarea').prop('disabled', true);
                            myProgressLoader.load(); 
                        }
                    });                    
                }); 
            }
        }
    }).resizeTo(200, 385)
}

export default recurringBill;