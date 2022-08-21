import Tagify from '../../assets/plugins/tagify-master/dist/tagify.esm.js';
import { SystemPrefs } from '../../assets/js/utils.js';

class LoadingIndicator {
    static show(params){
        $(params.el).append(`
            <div class="loading-indicator" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, .4); display: grid; justify-content: center; align-items: center;">
                <i class="fa fa-spinner fa-spin fa-5x clr-default"></i>
            </div>
        `);
    }

    static hide(params){
        $(params.el).find(".loading-indicator").remove();
    }
}

let contactNumberTags, contactEmailTags, gateways, terms, systemPrefs = new SystemPrefs()
const newContact = params => {
    notif.show({ 
        el: params.target, 
        title: `  
                <div id="overlay_crudContacts" style="width: calc(100vw - 7vw); max-width: 768px; overflow-y: auto; background: aliceblue;">
                    <form role="form" id="crudContacts" autocomplete="off" enctype="multipart/form-data">
                        <div style="display: flex; justify-content: space-between; align-items: center; box-shadow: 0 3px 10px 0 rgba(0, 0, 0, .4);">
                            <section style="display: grid; grid-template-columns: auto auto; gap: 20px; align-items: center;">
                                <a href="javascript:void(0);" class="close no-udl clr-default" style="transform: scale(1.5); padding: 10px;" onclick="$('#createContact').trigger('click');"><i class="fa fa-chevron-left"></i></a> 
                                <span style="text-overflow: ellipsis; overflow: hidden; whitespace: nowrap; display: flex; align-items: center;">${params.crudOpr == 'new' ? '<u>N</u>ew <label for="customer" style="display: flex; align-items: center; font-size: 14px;"><input type="radio" name="contact_type" id="customer" value="customer" required />Customer</label><label for="vendor" style="display: flex; align-items: center; font-size: 14px;"><input type="radio" name="contact_type" id="vendor" value="vendor" required />Vendor</label>' : `<u>U</u>pdate <b>${_.toUpper(params.data.item)}`}</b></span>
                            </section>
                            <button type="button" class="btn clr-${params.crudOpr == 'new' ? 'primary' : 'success'}" onclick="$(event.target).closest('#overlay_crudContacts').find('#btnSubmitForm').trigger('click');" style="margin: 0 10px; background: none; border: none;">${params.crudOpr == 'new' ? '<i class="fa fa-save"></i> Save' : '<i class="fa fa-pencil"></i> Update'}</button>
                        </div>
                        <div style="max-height: calc(100vh - 250px); overflow-y: auto;">
                            <div class="row">    
                                <div class="cl-2 cm-2 cs-3 cx-4">
                                    <div class="form-group">
                                        <input type="number" step=".01" min="0" name="opening_balance" id="opening_balance">
                                        <label for="opening_balance" class="floated-up-lbl">Opening Balance</label>
                                    </div>
                                </div> 
                                <div class="cl-3 cm-3 cs-3 cx-5">
                                    <div class="form-group">
                                        <input type="date" name="opening_balance_date" id="opening_balance_date">
                                        <label for="opening_balance_date" class="floated-up-lbl">as of</label>
                                    </div>
                                </div>
                                <div class="cl-7 cm-7 cs-6 cx-12">
                                    <div class="form-group">
                                        <input type="text" name="cust_name" id="cust_name" class="txt-u" onblur="$('#billing_addr').val(event.target.value)" required>
                                        <label for="cust_name" class="floated-up-lbl">Contact Name</label>
                                        <sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>
                                    </div>
                                </div>
                                <div class="cl-8 cm-8 cs-8 cx-8">
                                    <div class="form-group">
                                        <input type="text" name="cust_company_name" id="cust_company_name" class="txt-u" onblur="$('#billing_addr').val(event.target.value)" required>
                                        <label for="cust_company_name" class="floated-up-lbl">Company Name</label>
                                        <sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>
                                    </div>
                                </div>
                                <div class="cl-4 cm-4 cs-4 cx-4">
                                    <div class="form-group">
                                        <input type="text" name="sup_vat" id="sup_vat" class="txt-u">
                                        <label for="sup_vat" class="floated-up-lbl" style="top: -5px;">Tax Number</label>
                                    </div>
                                </div>  
                                <div class="cl-6 cm-5 cs-5 cx-5">
                                    <div class="form-group">
                                        <input type="tel" minlength="10" maxlength="10" name="contact-number" id="contact-number-tags">
                                        <label for="contact-number-tags" class="floated-up-lbl" style="top: -5px;">Phone, Mobile</label>
                                    </div>
                                </div>
                                <div class="cl-6 cm-7 cs-7 cx-7">
                                    <div class="form-group">
                                        <input type="email" name="email" id="contact-email-tags" class="txt-l">
                                        <label for="contact-email-tags" class="floated-up-lbl" style="top: -5px;">Email Address</label>
                                    </div>
                                </div>
                                <div class="cl-3 cm-3 cs-3 cx-4">
                                    <div class="form-group">
                                        <div class="select-container">
                                            <select name="payment_method" id="payment_method" required>
                                                ${_.map(gateways, (gateway, i) => `<option value="${gateway.name}">${gateway.name}</option>`)}
                                            </select>
                                        </div>
                                        <label for="payment_method" class="floated-up-lbl" style="top: -5px;">Pay Terms</label>
                                    </div>
                                </div>
                                <div class="cl-3 cm-3 cs-3 cx-4">
                                    <div class="form-group">
                                        <div class="select-container">
                                            <select name="payment_terms" id="payment_terms" required>
                                                ${_.map(terms, (term, i) => `<option value="${term.name}">${term.name}</option>`)}
                                            </select>
                                        </div>
                                        <label for="payment_terms" class="floated-up-lbl" style="top: -5px;">Pay Terms</label>
                                    </div>
                                </div>
                                <div class="cl-3 cm-3 cs-3 cx-4">
                                    <div class="form-group">
                                        <input type="number" min="0" step=".01" name="credit_limit" id="credit_limit">
                                        <label for="credit_limit" class="floated-up-lbl" style="top: -5px;">Credit Limit</label>
                                    </div>
                                </div>
                                <div class="cl-6 cm-6 cs-6 cx-12">
                                    <fieldset class="form-group" style="margin-top: 5px; border: solid 1px #ccc; color: #777; font-size: 13px;">
                                        <legend>Billing Address</legend>
                                        <textarea rows="1" name="billing_addr" id="billing_addr" class="txt-u"></textarea>
                                    </fieldset>
                                </div>
                                <div class="cl-6 cm-6 cs-6 cx-12">
                                    <fieldset class="form-group" style="margin-top: 5px; border: solid 1px #ccc; color: #777; font-size: 13px;">
                                        <legend>Shipping Address <a href="javascript:void(0);" class="clr-info txt-right">Same as Billing</a></legend>
                                        <textarea rows="1" name="shipping_addr" id="shipping_addr" class="txt-u"></textarea>
                                    </fieldset>
                                </div>                                            

                                <button hidden type="submit" class="btn btn-default ${params.crudOpr == 'new' ? 'new' : 'update'}" id="btnSubmitForm">${params.crudOpr}</button>

                            </div>
                        </div>
                    </form> 
                </div>
        `, 
        styleName: 'crud-Contacts', 
        className: 'default', 
        autoHide: false, 
        clickToHide: false, 
        position: params.position 
    });

    contactNumberTags = new Tagify(
        document.querySelector('#contact-number-tags'), 
        {
            placeholder: 'add numbers',
            delimiters: ",",    
            maxTags: 3,       
            callbacks: {
                'input': e => {
                    // console.log(e.detail)
                    // return e.detail.value.length > 10 ? false: true;
                }
            },
            validate: tag => {
                console.log(tag)
                return tag.value.length < 11;
            }
        },
    )

    contactEmailTags = new Tagify(
        document.querySelector('#contact-email-tags'), 
        {
            placeholder: 'add emails',
            delimiters: ",",           
            maxTags: 3,       
            callbacks: {
                'input': e => {
                    console.log(e.detail)
                    // return e.detail.value > 10 ? false: true;
                }
            }
        },
    )

    $(".btnUseMap").on('click', e => {
        !$("#overlay_useMap").is(':visible') ? 
        notif.show({
            el: $(e.target),
            title: `<div id="overlay_useMap">
                        <div id="map" style="width: 270px; height: 250px;"></div>
                    </div>
            `,
            styleName: 'use-map',
            className: 'default',
            position: 'top center',
            autoHide: false,
            clickToHide: false
        }) : $(".notifyjs-use-map-base").closest('.notifyjs-wrapper').remove();  
        
        // get current location using browser geolocation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                let pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                initMap({container: 'map', center: [pos.lng, pos.lat], zoom: 9});
            });
        }
        else{
            console.log('Geolocation is not supported by this browser.');
        }
    });

    LoadingIndicator.show({el: "#overlay_crudContacts #cust_name"})
    systemPrefs.pop()
    // .then(resp => ({gateways, terms} = JSON.parse(resp.data[2].pref)));
    .then(resp => {
            LoadingIndicator.hide({el: "#overlay_crudContacts #cust_name"})
            console.log($("#overlay_crudContacts").height())
            return {gateways, terms} = JSON.parse(resp.data[2].pref)
    });
    console.log(params)
    console.log(terms)
} 

export default newContact;