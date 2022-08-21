import { activeUser, appSounds, pop, headerMenu, computeAmt, thousandsSeperator, myProgressLoader } from "../../assets/js/utils.js";
import myAlertifyDialog from "../myAlertifyDialog.js";

const payBill = params => {
    console.log("PayBill Params", params)
    // window.vendors = params.vendors;
    myAlertifyDialog({
        name: 'payBill', 
        content: `
            <div>
                <div>PAYMENT OF <b class="clr-f05">${thousandsSeperator(params.amt)}</b> FOR BILL No. <b class="clr-primary">${params.invoice}</b></div>
            </div>
            <hr style="border: dashed 1px #ccc;" />
            
            <form role="form" id="frm_billPayment" autocomplete="off" enctype="multipart/form-data">
                <div class="row" style="display: flex; align-items: flex-end;">                   
                    <div class="cl-4 cm-4 cs-4 cx-12">
                        <div class="form-group">
                            <input type="number" name="pay_amt" id="pay_amt" step=".01" min="0" placeholder="0.00" value="${thousandsSeperator(_.join(_.split(params.amt, ','), ''))}" required />
                            <label for="pay_amt" class="floated-up-lbl">Amount</label>
                            <sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>
                        </div>
                    </div> 
                    <div class="cl-4 cm-5 cs-5 cx-5">
                        <div class="form-group">
                            <div class="date-container">
                                <input type="date" name="pay_date" id="pay_date" required />
                                <label for="pay_date" class="floated-up-lbl" style="top: -5px;">Date</label>
                                <sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>
                            </div>
                        </div>
                    </div> 
                    <div class="cl-4 cm-3 cs-3 cx-12">
                        <div class="form-group">
                            <input type="text" name="pay_ref" id="pay_ref" placeholder="">
                            <label for="pay_ref" class="floated-up-lbl">Ref No.</label>
                        </div>
                    </div> 
                    <div class="cl-12 cm-12 cs-12 cx-12">
                        <div class="form-group" style="margin-bottom: 0;">
                            <textarea name="notes" id="notes" rows="1" maxlength="250" class="txt-u" placeholder=""></textarea>
                            <label for="notes" class="floated-up-lbl">Notes</label>
                        </div>
                    </div> 
                    <div class="cl-12 cm-12 cs-12 cx-12">
                        <div class="form-group" style="margin-bottom: 0;">
                            <button type="submit" class="btn btn-success btn-block"><i class="fa fa-money"></i> Pay Now</button>
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
                let stocks, tableBill, categoriesSelect = {};   
                
                
                $('#pay_amt').trigger('focus');
                
                $(document).on('input', '#invoice', e => {
                    tableBill.validate();
                    if(e.target.value != "" && _.size(tableBill.getInvalidCells()) < 1){
                        tableBill.addRow({new_record: 1});
                        tableBill.validate(); 
                    }
                });
        
                $("#frm_billPayment").on("submit", function(e) {
                    e.preventDefault();
                    let formData = new FormData(this), { bill_id } = params;
                    // formData.append('payLoad', ([{amt: $("#pay_amt").val(), date: $("#pay_date").val(), ref: $("#pay_ref").val(), notes: $("#notes").val()}]));
                    $.ajax({
                        url: `./crud.php?bill&pay&bill_id=${bill_id}&emp_id=${activeUser.id}`,
                        type: "POST",
                        data: formData,
                        processData: false,
                        contentType: false,
                        cache: false,
                        dataType: 'json',
                        success: resp => {
                            if (resp.saved || resp.updated) {
                                appSounds.oringz.play();
                                alertify.success(resp.saved && "Saved" || 'Updated.');
                                // $("#frm_billPayment")[0].reset();
                                alertify.payBill().close();
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
    }).resizeTo(200, 300)
}

export default payBill;