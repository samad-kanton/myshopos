import { activeUser, appSounds, SystemPrefs, myTransCodePrefix, pop, popCountries, Swiper, thousandsSeperator, Notif, footerBottomCustomText, calcVATDISCOUNTAMOUNT, QIHRF, CEDIS, PAYMENT_METHODS } from '../assets/js/utils.js'
import receipt from './receipt.js';
import { pageRights, printTableData, exportTableData } from '../assets/js/event.js';
import { TabulatorFull as Tabulator } from '../assets/plugins/tabulator-master/dist/js/tabulator_esm.min.js';

console.log(pageRights);

let countries, companyProfile;
popCountries().then(all_countries => {
    countries = all_countries;
    _.filter(countries, country => {
        $('#cust_country').append(`
            <option value="${country.id}" data-states='${JSON.stringify(country.states)}'>${country.name}</option>
        `).prop('disabled', false);
    });
});
pop('../config/crud.php?pop').then(resp => companyProfile = resp.data);

const notif = new Notif(),
      systemPrefs = new SystemPrefs()

var productCategoriesSwiper = new Swiper('.swiper#productCategories', {
    slidesPerView: 2,
    spaceBetween: 30,
    centeredSlides: true,
    pagination: false,
    autoplay: {
        delay: 5000,
        speed: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
    },
    autoHeight: false,
    breakpoints: {
        480: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1080: { slidesPerView: 3 },
        1280: { slidesPerView: 4 }
    }
});


$(document).on('click', '#toggleReceiptPrint', function(e) {
    $(this).is(':checked') ? localStorage.setItem('toggleReceiptPrint', true) : localStorage.removeItem('toggleReceiptPrint');
});

$(document).on('keydown', e => e.keyCode == 113 || e.which == 113 ? $("#received").focus() : "");

$("main .left-sidebar .cart").prepend(`
    <div id="carts">
        <button type="button" class="btn btn-primary cart_1"><i class="fa fa-shopping-cart"></i> <span hidden>1</span></button>
        <button type="button" class="btn btn-default cart_2"><i class="fa fa-shopping-cart"></i> <span hidden>2</span></button>
        <button type="button" class="btn btn-default cart_3"><i class="fa fa-shopping-cart"></i> <span hidden>3</span></button>
        <button type="button" class="btn btn-default cart_4"><i class="fa fa-shopping-cart"></i> <span hidden>4</span></button>
        <button type="button" class="btn btn-default cart_5"><i class="fa fa-shopping-cart"></i> <span hidden>5</span></button>
        <div class="date-container">
            <input type="date" name="transDate" id="transDate">
        </div>
    </div>
`);
$("main .left-sidebar .cart .carts").hide();
$('#carts button.btn-primary').addClass('active');

let activeCart = $('#carts button.active span').text(),
    shoppingCart = JSON.parse(localStorage.getItem('cart')) ? JSON.parse(localStorage.getItem('cart')) : [];
// console.log(shoppingCart[activeCart]);

//  SET / CHANGE TRANSACTION DATE MANUALLY
$(document).on('click input', '#transDate', e => {
    if(pageRights.set_salesDate){
        GenTransID();
    }
    else{
        $('#transDate').val(sessionStorage.getItem('transDate'))
        sessionStorage.setItem('transDate', $('#transDate').val());
        notif.show({ el: $(e.target), title: '<div class="txt-center"><small><i class="fa fa-warning fa-2x"></i><small>You are not allowed to <br/>set transactions date.</small></div>', className: 'error', styleName: 'access-denied-set-sales-date', position: 'bottom right', autoHide: true });
    }
});
$('#transDate').val(moment().format('Y-MM-DD'));
sessionStorage.setItem('transDate', $('#transDate').val());

let GenTransID = async () => {
    let res = await (await fetch(`./cart.php?NextTransID=${true}&customTransDate=${$("#transDate").val()}`)).json();
    $('#transID').text(res.trans_id);       
    return await res;
}

const getIndex = (payLoad, stack) => _.findIndex(stack, entry => entry.id == payLoad['id'] && _.toLower(entry.priceLabel) == _.toLower(payLoad['priceLabel']))
// localStorage.removeItem('cart');

const refreshShoppingCart = async () => localStorage.setItem('cart', JSON.stringify(shoppingCart));

let UpdateCartItemQty = (payLoad) => {
    let { id, priceLabel, qty, rate } = payLoad.data, { overwrite } = payLoad;
    if(overwrite){
        shoppingCart[activeCart][getIndex({id, priceLabel}, shoppingCart[activeCart])].qty = _.toNumber(qty);
        shoppingCart[activeCart][getIndex({id, priceLabel}, shoppingCart[activeCart])].amt = _.toNumber(rate) * _.toNumber(shoppingCart[activeCart][getIndex({id, priceLabel}, shoppingCart[activeCart])].qty);
    }
    else{
        shoppingCart[activeCart][getIndex({id, priceLabel}, shoppingCart[activeCart])].qty = _.toNumber(qty) + _.toNumber(shoppingCart[activeCart][getIndex({id, priceLabel}, shoppingCart[activeCart])].qty);   
        shoppingCart[activeCart][getIndex({id, priceLabel}, shoppingCart[activeCart])].amt = _.toNumber(rate) * _.toNumber(shoppingCart[activeCart][getIndex({id, priceLabel}, shoppingCart[activeCart])].qty);
    }
    refreshShoppingCart();
    showShoppingCartTableOpts();
    $('#find_item').trigger('focus');
    // shoppingCartTable.redraw();
}

//  COUNT & DISPLAY DISTINCT QUANTITIES IN ALL FIVE(5) CARTS
const countCart = () => { 
    for (let i = 1; i <= 5; i++) {
        $(`main .left-sidebar .cart #carts button:eq(${i-1}) sup`).remove();
        shoppingCart[i] && shoppingCart[i].length && $(`main .left-sidebar .cart #carts button:eq(${i-1})`).append(`<sup style="position: absolute; top: 7px; padding: 2px 5px; border-radius: 50%; background: magenta; color: #fff;">${shoppingCart[i].length}</sup>`);
        // shoppingCart[i] && shoppingCart[i].length && $(`main .left-sidebar .cart #carts button:eq(${i-1})`).hide();
    }
}

const ClearCart = () => { 
    let id, priceLabel;
    // FIND INDEXES OF ITEMS TO REMOVE IN ACTIVE SHOPPING CART 
    if(shoppingCartTable.getSelectedData().length){
        let idx = getIndex({id, priceLabel} = shoppingCartTable.getSelectedData()[0], shoppingCart[activeCart])
        shoppingCartTable.deleteRow(id);
        shoppingCart[activeCart].splice(idx, 1); 
        // console.log(id, idx)
    }
    else{
        shoppingCart[activeCart].splice(0, shoppingCart[activeCart].length);
    }
    shoppingCartTable.recalc();    
    countCart();
    refreshShoppingCart();
    showShoppingCartTableOpts();
    validateTotalBill();
    // $('#received').val('');
    shoppingCart[activeCart].length < 1 && shoppingCartTable.clearData();
    appSounds.removed_tone.play();
    $("#shopping-cart-table .tabulator-placeholder").addClass('bg-danger').html(`<div style="margin: 0 auto;"><h2 class="txt-center">No items in cart</div>`);
}

//  SHOW CLEAR AND PRINT BUTONS OF CART TABLE
const showShoppingCartTableOpts = () => $(".tabulator#shopping-cart-table .tabulator-footer .tabulator-calcs-holder .tabulator-row .tabulator-cell:nth-child(2)").html(`
    <div style='display: flex; justify-content: space-between; align-items: center;'>    
        <button type="button" class="btn btn-default btn-sm" id="btnClearCart" style="border: solid 1px red;"><i class="fa fa-trash-o clr-danger"></i> <span>Clear</span></button>
        &nbsp;&nbsp;&nbsp;&nbsp; 
        <div class='checkbox'>
            <input hidden ${localStorage.getItem('toggleReceiptPrint') ? "checked" : ''} type='checkbox' name='toggleReceiptPrint' id='toggleReceiptPrint' class='custom-checkbox'><label for='toggleReceiptPrint' style='cursor: pointer;'>&nbsp;Print</label>
        </div>
    </div>
`);

const validateTotalBill = () => {
    if(totalBill() < 0){
        notif.show({
            el: $('.tabulator#shopping-cart-table .tabulator-footer .tabulator-calcs-holder .tabulator-row'), 
            title: `
                        <span style="">Total Bill cannot be less than zero</span>.
                        <p/>You might have to: 
                        <ol style="margin: 3px 15px; padding: 0;">
                            <li>Check your VAT/Discount rates.</li>
                            <li>See that Prices are positive integrals.</li>
                            <li>Better still add more items to cart.</li>
                        </ol>
            `, 
            styleName: 'invalid-total-bill',
            position: 'top right', 
            className: 'danger',
            autoHide: false,
            clickToHide: false
        });
    }
    else{
        notif.hide($('.notifyjs-invalid-total-bill-base'));
    }
    $("#toggleVAT, #toggleDiscount").trigger('change');
}

const AddToCart = async (activeCart, id, item, dim, priceLabel, qty, cp, rate, amt) => {
    // console.log(activeCart, id, item, dim, priceLabel, qty, cp, rate, amt); 
    $('#payment_methods, #btnCheckout').val('').prop('disabled', true);  
    $("main .left-sidebar .cart").append("");
    shoppingCart[activeCart] = !shoppingCart[activeCart] ? [] : shoppingCart[activeCart];
    if(id){      
        if(qty > 0){
            if(_.findIndex(shoppingCart[activeCart], entry => entry['id'] == id && entry['priceLabel'] == priceLabel) > -1) 
                UpdateCartItemQty({data: {id, priceLabel, qty, rate}})
            else 
                shoppingCart[activeCart].push({ id, item, dim, priceLabel, qty, cp, rate, amt });
            refreshShoppingCart();
            appSounds.pull_out.play();
        }
        else{
            notif.show({el: $(e.target), title: "No quantity to sell.<br/><br/>Please restock now.", styleName: "zero-qty-stock", className: "warning", position: 'bottom center'});
        }
    }
    let fetchCart = async () => {
        $("main .left-sidebar .cart .details").html('');
        if(shoppingCart[activeCart].length){ // if shopping cart Obj has current/active cart number/id
            $("main .left-sidebar .cart .details").css('height', 'calc(100% - 105px)');
            shoppingCartTable.setData(shoppingCart[activeCart])
            .then(() => shoppingCartTable.validate())
            .catch(error => console.error(error));
            shoppingCartTable.scrollToRow(shoppingCartTable.getData()[shoppingCartTable.getData().length - 1]['id']);
            showShoppingCartTableOpts();
        }
        else{
            shoppingCartTable.clearData();            
            $("#shopping-cart-table .tabulator-placeholder").addClass('bg-danger').html(`<div style="margin: 0 auto;"><h2 class="txt-center">No items in cart</div>`);     
        }  
    }    
    fetchCart().then(() => {
        countCart();
        $('#find_item').trigger('focus');
        $('#received').trigger('input');
        $(".tabulator#shopping-cart-table .tabulator-footer .tabulator-calcs-holder").css('height', 'calc(100% - 120px)')
        $('#received, main .left-sidebar .cart-toolbar .calculator .keypad button').prop('disabled',  shoppingCartTable.getData().length > 0 ? false : true);     
        validateTotalBill();
    });
}

let overWriteCartItemQtyValue = [], qtyCellAddr, qtyRowAddr;
//  *************** CART SECTION    *************** //
let shoppingCartTable = new Tabulator("#shopping-cart-table", {
    // width: '100vw',
    height: "calc(100% - 40px)",
    // data: tabledata,           //load row data from array
    layout: "fitColumns",      //fit columns to width of table
    layoutColumnsOnNewData: true,
    selectable: 1,
    // movableColumns: true,      //allow column order to be changed
    resizableRows: false,       //allow row order to be changed
    initialSort: [             //set the initial sort order of the data
        // {column:"name", dir:"asc"},
    ],
    columns: [                 //define the table columns
        {title:"#", field:"", formatter: "rownum", width: 20},
        {title:"DESCRIPTION", field: "item", formatter: (cell, formatterParams, onRendered) => cell.getValue() && `${cell.getData().dim > 1 && cell.getValue().toUpperCase() + ' X ' + cell.getData().dim || cell.getValue().toUpperCase()}` || "" },
        {title:"DIM", field: "dim", hozAlign: "right", width: 55, visible: false, },
        {title:"P.LBL", field: "priceLabel", hozAlign: "right", width: 55, visible: false, },
        {title:"QTY", field: "qty", hozAlign: "right", formatter: (cell, formatterParams, onRendered) => cell.getValue() && QIHRF(cell.getValue(), cell.getData().priceLabel, cell.getData().dim), bottomCalc: (values, data, bottomCalcParams) => _.sumBy(data, entry => _.toNumber(entry.dim)*_.toNumber(entry.qty)), formatterParams: { precision: 0 }, width: 55, visible: !false },
        {title:"RATE", field: "rate", editor: false, hozAlign: "right", width: 65, visible: !false },
        {title:"AMOUNT", field: "amt", formatter: "money", hozAlign: "right", bottomCalc: (values, data, calcParams) => thousandsSeperator(_.sumBy(values, entry => _.toNumber(entry))), width: 70, visible: !false },
        // {title:"AMOUNT", field: "amt", formatter: (cell, formatterParams, onRendered) => cell.getValue() && `${QIHRF(cell.getData().qty, cell.getData().priceLabel, cell.getData().dim)} x ${cell.getData().rate}<br/>${cell.getValue()}`, hozAlign: "right", bottomCalc: (values, data, calcParams) => thousandsSeperator(_.sumBy(values, entry => _.toNumber(entry))) },
    ],
    columnDefaults: {
        tooltip: true,
        vertAlign: "middle"
    },
    scrollToRowPosition: "bottom",
    placeholder: `No items in cart`,
    selectableCheck: row => {
        //row - row component for the selected row
        return row.getData()['item'] !== undefined;
    },
    printHeader: `
    
    `,
});

shoppingCartTable.on("tableBuilt", () => {
    
});

shoppingCartTable.on("rowSelected", row => {
    //row - row component for the selected row
    qtyCellAddr = row.getCell('qty');
    qtyRowAddr = row;
    // console.log(row.getData()['item']);
    tableStock.setFilter([
        {field: "item", type: "like", value: row.getData().item}
    ]); 
    $('#find_item').val('').trigger('focus'); 
});

shoppingCartTable.on("rowSelectionChanged", (data, rows) => {
    // console.log(data.length && data[0]['item'] == undefined)
    $(".tabulator#shopping-cart-table .tabulator-footer .tabulator-calcs-holder .tabulator-row .tabulator-cell:nth-child(2) .btn-default span").text(rows.length ? "Remove" : "Clear");
    // $(".cart-toolbar .calculator .keypad .num .cmd.dot, #received").prop('disabled', rows.length ? true : false);
    overWriteCartItemQtyValue = [];
    // qtyCellAddr && $(".cart-toolbar .calculator .keypad .num .cmd.backspace").prop('disabled', qtyCellAddr && qtyCellAddr.getValue().toString().split('').length < 2 && true || false);
    qtyCellAddr && $(".cart-toolbar .calculator .keypad .num .cmd.backspace").prop('disabled', rows.length && true || false);
});

shoppingCartTable.on("cellEditCancelled", cell => {
    //cell - cell component
    if(!cell.isEdited()){
        // cell.getOldValue() != "" ? cell.setValue(cell.getInitialValue() - cell.getOldValue()) : cell.restoreInitialValue();
        cell.clearValidation();
    }
});

const processTrans  = (transDate, trans_id, processTrans, amtDue, received, balance, customer, pm_id, emp_id) => {
    // console.log(shoppingCart[activeCart], transDate, trans_id, processTrans, amtDue, received, balance, customer, pm_id, emp_id);    
    let { cust_id, cust_name, is_default } = customer,
        { cust_phone } = JSON.parse(customer.addr).contactAddr;
    if($('#transDate').val() != ""){
        // if($("#payment_methods").val() == 4 && $(".customer-card.active").length < 1){
        //     $("#payment_methods").trigger('change');
        // }
        // else{
            $("#btnCheckout").html("<div class='txt-center'><i class='fa fa-spinner fa-spin fa-3x'></i><br/></div>").prop('disabled', true);
            if($("#payment_methods").val() != ""){
                // console.log("pick: ", _.map(_.filter(shoppingCart[activeCart], entry => delete entry.item)));
                pop(`./cart.php`, {
                    method: 'POST', // *GET, POST, PUT, DELETE, etc.
                    mode: 'cors', // no-cors, *cors, same-origin
                    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                    credentials: 'same-origin', // include, *same-origin, omit
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    redirect: 'follow', // manual, *follow, error
                    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                    body: JSON.stringify({
                        transDate,
                        cart: shoppingCart[activeCart],
                        trans_id,
                        processTrans,
                        amtDue,
                        received,
                        balance,
                        customer,
                        pm_id,
                        cust_id,
                        emp_id,
                        extCartOpts: JSON.stringify({
                            vat: {type: vat.type, rate: vat.rate, amount: vat_amount, applied: $("#toggleVAT").is(':checked')}, 
                            discount: {type: discount.type, rate: discount.rate, amount: discount_amount, applied: $("#toggleDiscount").is(':checked')}, 
                        }),
                        receiptPref,
                        toggleReceiptPrint: localStorage.getItem('toggleReceiptPrint')
                    }) // body data type must match "Content-Type" header
                })
                .then(resp => {
                    console.log(resp);
                    shoppingCartTable.getSelectedData() && shoppingCartTable.deselectRow(_.map(shoppingCartTable.getSelectedData(), 'id')); //  FIRST OF ALL, CLEAR ANY ROWS SELECTION
                    shoppingCartTable.getSelectedData().length && shoppingCartTable.deselectRow(shoppingCartTable.getSelectedData()[0]['id']);    // DESELECT ANY SELECTED ROWS IN CART TABLE
                    if(typeof resp.qtyOverSell == "object" && _.size(resp.qtyOverSell) > 0){
                        let qtyOverRows = _.map(resp.qtyOverSell, 'prod_id');
                        shoppingCartTable.selectRow(qtyOverRows);
                        // $(".tabulator#shopping-cart-table .tabulator-row.tabulator-selected .tabulator-cell").css({'background': '#d9534f', 'color': '#fff'});
                        // console.log(qtyOverRows);
                        qtyOverRows && shoppingCartTable.scrollToRow(qtyOverRows[0]);
                        notif.show({ el: $("#carts button.active"), title: `<small>Some items in cart exceeds <br/> available quantity at hand</small>.`, styleName: "cart-qty-oversell", className: "warning", position: "bottom left", autoHide: true, clickToHide: true });
                    }
                    else{
                        $(".tabulator#shopping-cart-table .tabulator-row.tabulator-selected").css({'background': '', 'color': ''});
                        if(resp.sold){
                            $("#btnReloadData").trigger('click');    
                            let data = new Array();
                            _.map(shoppingCartTable.getData(), entry => data.push({
                                regdate: moment(),
                                item: entry['item'],
                                dim: entry['dim'],
                                priceLabel: entry['priceLabel'],
                                qty: entry['qty'],
                                rp: entry['rate'],
                                amt: entry['amt'],
                                netTotalAmt: totalBill(),
                                received: $('#received').val(),
                                balance: $('#balance').text(),
                                payment: $(`#payment_methods option:selected`).text(), 
                                extCartOpts: JSON.stringify({
                                    vat: {type: vat.type, rate: vat.rate, amount: vat_amount, applied: $("#toggleVAT").is(':checked')}, 
                                    discount: {type: discount.type, rate: discount.rate, amount: discount_amount, applied: $("#toggleDiscount").is(':checked')}, 
                                }),
                                receiptPref: JSON.stringify(receiptPref),
                                customer: JSON.stringify({ cust_id, cust_name, cust_phone, is_default }),
                                teller: activeUser.name
                            }))                                          
                            localStorage.getItem('toggleReceiptPrint') == 'true' && receipt({transID: trans_id, data});            
                            ClearCart();
                            AddToCart(activeCart);
                            // popCustomers();
                            $("#payment_methods, #received").val('');
                            $('#find_item').val('').trigger('focus');                        
                        }
                        else{
                            console.log(resp);
                        }                        
                    }
                    $("#btnCheckout").html(`<span style="padding: 0 10px;">&#x20b5;</span><section id="transID">${trans_id}</section>`).prop('disabled', false);
                    GenTransID();
                })
                .catch(err => console.error(err));
            }
            else{
                $("#btnCheckout").html(`<span style="padding: 0 10px;">&#x20b5;</span><section id="transID">${trans_id}</section>`).prop('disabled', false);
            }
        // }
    }
    else{
        notif.show({el: $("#transDate"), title: "Please set transaction date", styleName: "set-transDate", className: "warning", position: 'bottom right'});
        $('#transDate').trigger('focus');
    }
}

const validateCreditSale = customer => {
    if((_.toNumber(customer.CUST_TILL)+customer.totalBill) > customer.credit_limit){
        $("#payment_methods").val('').trigger('change');
        notif.show({
            el: $("#payment_methods"),
            title: `Ooppsss... ${customer.CUST_TILL > 0 
                    ? 
                    `This customer has already purchased<br/><br/> <b class="clr-f05">&#x20b5;${customer.CUST_TILL}</b> of the <b class="clr-success">&#x20b5;${customer.credit_limit}</b> <b>Credit Limit</b> alloted.<br/><br/>You can either increase the value threshold or consider reducing the amount of items in cart.` 
                    : 
                    `We've detected that this customer hasn't purchased anything yet from you.<br/><br/>Whereas the bill about to be processed exceeds the maximum threshold of <b class="clr-success">&#x20b5;${customer.credit_limit}</b>, consider increasing the value threshold or reducing the amount of items in cart.`}`,
            styleName: "error",
            className: "credit-limit-flag",
            position: "top left",
            autoHide: true,
            clickToHide: true
        });
    }
    return true;
}

GenTransID()    //  AUTO-GENERATE TRANSACTION ID's
.then(() => AddToCart(activeCart))  // LOAD CART DATA
.catch(err => console.error(err));

$(document).on('click', '#carts button', function (e) { 
    // $(e.target).closest('button').hide();    
    $('#carts button').removeClass('btn-primary active').addClass('btn-default').not($(e.target).closest('button').removeClass('btn-default').addClass('btn-primary active'));
    activeCart = $('#carts button.active span').text();
    AddToCart(activeCart);
    // $("main .right-sidebar").toggleClass('open');
    if($("main .right-sidebar").hasClass('open')){
        if($("#carts button.active").hasClass('withChevron')){
            $("#carts button.active").removeClass('withChevron');
            $("main .right-sidebar").removeClass('open');
        }
        else{
            $("#carts button.active").addClass('withChevron');
        }
    }
    else{
        $("#carts button.active").addClass('withChevron');
        $("main .right-sidebar").addClass('open');
    }
});

$(document).on('click', '#btnClearCart', e => ClearCart());

$(document).on('focus', '#filter_cart', function (e) { 
    $(e.target).closest('.search-pane').find('label').fadeOut();
});

$(document).on('blur', '#filter_cart', function (e) { 
    $(e.target).closest('.search-pane').find('input[type="search"]').val() == "" && $(e.target).closest('.search-pane').find('label').fadeIn();
});

$(document).on('input', '#filter_cart', function (e) { 
    shoppingCartTable.setFilter([
        {field: "item", type: "like", value: e.target.value}
    ]);
});

//  LOAD ONLY STOCK FOR CATEGORY-CLICKED
$(document).on('click', 'main .right-sidebar #stock-pane #productCategories a', function (e) {     ;
    // console.log($(e.target).data('catItems'));
    $('main .right-sidebar #stock-pane #productCategories a').removeClass('active').not($(e.target).closest('a').addClass('active'));
    tableStock.clearFilter();
    $("#selCategoriesFilter").attr('sel-cat-id', $(e.target).data('catItems')[0] && $(e.target).data('catItems')[0]['cat_id']).css({'background': !_.isUndefined($(e.target).data('catItems')[0]) && $(e.target).data('catItems')[0].color, 'color': '#fff', 'border': 'inherit'}).find('small').html(e.target.innerText);
    tableStock.setData(_.filter($(e.target).data('catItems'), entry => entry.active != 0));
    tableStock.getData().length < 1 && $(".tabulator-placeholder").css({'background': 'red', 'color': '#fff'}).html(`<div style="margin: 0 auto;"><h2 class="txt-center"><p><i class="fa fa-glass fa-3x"></i></p>Ooppsss...<p>No items found under chosen category.</p></h2></div>`);
});

//  CLEAR SELECTED FILTER-BY-CATEGORY
$(document).on('click', '#btnClear_filterCategory', function (e) {
    tableStock.replaceData(_.filter(stocks, entry => entry.active != 0))
    $("#selCategoriesFilter").css({'background': '', 'color': '', 'border': 'solid 1px dodgerblue'}).find('small').html('All Categories');
    $('#find_item').trigger('input').trigger('focus');
});

//  HOT-RELOAD ALL STOCKS FROM SERVER
$(document).on('click', '#btnReloadData', function (e) {
    popStock()
    .then(() => {
        $("main .right-sidebar #stock-pane #productCategories .swiper-wrapper").html("<div style='width: 100%; height: 100%; display: grid; justify-content: center; align-items: center;'><i class='fa fa-spinner fa-spin fa-4x'></i></div>");
        popCats();
        $('#find_item').trigger('focus')
    });
});

$(document).on('click', '#btnCheckout', e => {
    pageRights.process_sales ? processTrans(moment($('#transDate').val()).format(`YYYY-MM-DD`), (myTransCodePrefix + $('#transID').text()), true, _.split(totalBill(), ',').join(''), $('#received').val(), $('main .left-sidebar .cart-toolbar .trans-bar .top span:last').text(), JSON.parse(sessionStorage.getItem('customer')), $("#payment_methods").val(), activeUser.id) : notif.show({ el: $('#btnCheckout'), title: '<small>You are not allowed to <br/>process sales transactions.</small></div>', className: 'error', styleName: 'access-denied-process-sales', position: 'right center', autoHide: true });
});

$('#received').val('');
$(document).on('keydown input', '#received', function (e) {
    let key = e.keyCode || e.which;
    if (key == 32 || ((key < 48 || key >= 59) && (key < 96 || key > 105)) && key != 110 && key != 190 && key != 8){
        e.preventDefault();
    }
    else{
        key == 190 && e.target.value == "" ? $('#received').val(0.) : '';
    }

    if(!isNaN($(this).val()) && e.target.value != ""){
        key == 13 && !$("#btnCheckout").is(':disabled') ? $("#btnCheckout").trigger('click') : "";
        var total = 0, received = 0, balance = 0;
            received = _.toNumber($(this).val()), total = totalBill(), balance = received - total;
        $('main .left-sidebar .cart-toolbar .trans-bar .top span:last').text(thousandsSeperator(_.toNumber(balance)));
        $('.screen button.clear').prop('disabled', false).css('opacity', 1);
        if(balance < 0 || total < 0){
            $("#payment_methods").prop('disabled', true);
        }
        else{
            $("#payment_methods").prop('disabled', false).trigger('change');
        }
        validateTotalBill();
    }
    else{
        $('main .left-sidebar .cart-toolbar .trans-bar .top span:last').text('0.00');
        $('#payment_methods, #btnCheckout').prop('disabled', true);
    }    
});

$(document).on('click', 'main .left-sidebar .cart-toolbar .calculator .keypad button', function (e) {    
    if(!this.classList.contains('backspace') && shoppingCartTable.getSelectedData().length == 1){
        // IF overWriteCartItemQtyValue isEMPTY AND THE FIRST CHAR IS ZERO
        !overWriteCartItemQtyValue.length && e.target.innerText == "0" && overWriteCartItemQtyValue.push(...qtyCellAddr.getValue().toString().split(''), e.target.innerText) || overWriteCartItemQtyValue.push(e.target.innerText);
        qtyRowAddr.update({qty: overWriteCartItemQtyValue.join(''), amt: overWriteCartItemQtyValue.join('') * qtyCellAddr.getRow().getData().rate})
        .then(() => UpdateCartItemQty({data: qtyCellAddr.getRow().getData(), overwrite: true}))
        .catch((error) => console.error(error));
    }
    else{
        let _received = $('main .left-sidebar .cart-toolbar .calculator .screen .computation input#received');
        if($(e.target).closest('div.num').hasClass('num')){
            !this.classList.contains('cmd') ? _received.val(_received.val() + parseInt($(this).text())).trigger('input').trigger('focus') : '';
            
            let oldValue = _received.val();
            this.classList.contains('dot') ? _received.val(oldValue+String.fromCharCode(46)).trigger('input') : '';
            
            !shoppingCartTable.getSelectedData().length && $('main .left-sidebar .cart-toolbar .calculator .screen button.clear').prop('disabled', false).css('opacity', 1);
        }
        else{
            if($(e.target).closest('div.currency').hasClass('currency')){
                _received.val() != "" ? _received.val(parseInt(_received.val()) + parseInt(this.innerText)).trigger('input').trigger('focus') : _received.val(parseInt(this.innerText)).trigger('input').trigger('focus');
            }
        }
    }
});

$(document).on('click', 'main .left-sidebar .cart-toolbar .calculator .keypad .num .cmd', function (e) {
    if(shoppingCartTable.getSelectedData().length && shoppingCartTable.getSelectedData()[0]['priceLabel'].toLowerCase() == "retail"){
        overWriteCartItemQtyValue = qtyCellAddr.getValue().toString().split('');
        overWriteCartItemQtyValue.pop(overWriteCartItemQtyValue.length, 1);
        // console.log(overWriteCartItemQtyValue.length)
        qtyRowAddr.update({qty: overWriteCartItemQtyValue.join(''), amt: overWriteCartItemQtyValue.join('') * qtyCellAddr.getRow().getData()['rate']})
        .then(() => UpdateCartItemQty({data: qtyCellAddr.getRow().getData(), overwrite: true}))
        .catch((error) => console.error(error));
        overWriteCartItemQtyValue.length < 2 && $(e.target).closest('button.backspace').prop('disabled', true);
    }
    else{
        if(this.classList.contains('backspace')){
            $('main .left-sidebar .cart-toolbar .calculator .screen .computation input#received').trigger('focus');
            let oldValue = $('main .left-sidebar .cart-toolbar .calculator .screen .computation input#received').val();
            $('main .left-sidebar .cart-toolbar .calculator .screen .computation input#received').val(oldValue.substring(0, oldValue.length-1)).trigger('input');
        }    
    }
});

let tableQuickSalesInvoicesLookup = new Tabulator("#sales-invoices-table", {
    // width: '100%',
    height: "calc(100vh - 215px)",
    layout: "fitColumns",
    responsiveLayout: "collapse",  //hide columns that dont fit on the table    
    // movableColumns: true,    
    history: true,
    // selectable: 1,
    columns: [
        {formatter: "rowSelection", titleFormatter: (cell, formatterParams, onRendered) => `<button type="button" class="btn-teal btn-sm" id="btnInvoiceOpts"><i class="fa fa-ellipsis-v"></i></button>`, headerSort: false, hozAlign: "center", width: 30},
        {title: "", field: "", formatter: "rownum" || "", headerSort: false, hozAlign: "center", width: 30},
        {title: "DATE", field: "TRANS_DATE", hozAlign: "center", width: 100, visible: false},
        {title: "", field: "prod_id", visible: false },
        {title: "TRANS_ID", field: "strans_id", formatter: (cell, formatterParams, onRendered) => !_.isUndefined(cell.getData()?.receiptPref) && JSON.parse(cell.getData()?.receiptPref)?.code?.prefix + moment(cell.getData()?.regdate).format("YYMMDD") + cell.getValue(), visible: false },
        {title: "TELLER", field: "fullname", visible: false },
        {title: "PAY_TYPE", field: "PAY_TYPE", visible: false },
        {title: "CUSTOMER NAME", field: "cust_name", formatter: (cell, formatterParams, onRendered) => cell.getValue() && _.toUpper(cell.getValue()) || "", minWidth: 100, visible: false },
        {title: "DESCRIPTION", field: "item", formatter: (cell, formatterParams, onRendered) => cell.getValue() && `${cell.getData().dim > 1 && cell.getValue().toUpperCase() + ' X ' + cell.getData().dim || cell.getValue().toUpperCase()}` || "", },
        {title: "DIM", field: "dim", hozAlign: "right", width: 55, visible: false, },
        {title: "UNIT", field: "um", hozAlign: "right", width: 55, visible: false, },
        {title: "P.LBL", field: "priceLabel", hozAlign: "right", width: 55, visible: false, },
        {title: "QTY", field: "qty", hozAlign: "right", formatter: (cell, formatterParams, onRendered) => (cell.getValue() && cell.getData().priceLabel) && QIHRF(cell.getValue(), cell.getData().priceLabel, cell.getData().dim), width: 55 },
        {title: "RATE", field: "sp", formatter: "money", hozAlign: "right", width: 55 },
        {title: "EXT", field: "EXT_AMT", bottomCalc: (values, data, calcParams) => thousandsSeperator(_.sumBy(values, entry => _.toNumber(_.join(_.split(entry, ','), '')))), hozAlign: "right", width: 60 },
    ],
    columnDefaults: {
        tooltip: true,
        vertAlign: "middle",
        resizable: false,
    },
    rowFormatter: row => {
        let rowEl = row.getElement(), data = row.getData();
        _.isUndefined(data.strans_id) && $(rowEl).find('input[type="checkbox"]').remove();
    },
    pagination: "local",       //paginate the data
    paginationSize: 100,         //allow 7 rows per page of data
    paginationButtonCount: 2,
    placeholder: "No Data Available", //display message to user on empty table
});

tableQuickSalesInvoicesLookup.on("tableBuilt", () => {
    window.matchMedia("(max-width: 768px)").matches ? tableQuickSalesInvoicesLookup.setHeight("calc(100vh - 210px)") :tableQuickSalesInvoicesLookup.setHeight("calc(100vh - 140px)"); 
});

// QUICK SALES INVOICES LOOKUP
const PopInvoices = async rptOpts => {    
    console.log(`../report/rpt_func.php?mainRpt=${Object.values(rptOpts)[0].mainRpt}&subRpt=${Object.values(rptOpts)[0].subRpt}&df=${Object.values(rptOpts)[0].dateFrom}&dt=${Object.values(rptOpts)[0].dateTo}&allTime=false`)
    $.ajax({
        url: `../report/rpt_func.php?mainRpt=${Object.values(rptOpts)[0].mainRpt}&subRpt=${Object.values(rptOpts)[0].subRpt}&df=${Object.values(rptOpts)[0].dateFrom}&dt=${Object.values(rptOpts)[0].dateTo}&allTime=false`,
        type: "POST",
        dataType: 'JSON',
        // data: { dateFrom: dateFrom, dateTo: dateTo, emp_id: emp_id, search: search },        
        success: resp => {
            // console.log(resp.data);
            tableQuickSalesInvoicesLookup.setData(pageRights.preview_session_sales ? _.filter(resp.data, entry => entry.emp_id == activeUser.id) : resp.data);
            tableQuickSalesInvoicesLookup.setSort([{column: "strans_id", dir: "desc"}]);
            tableQuickSalesInvoicesLookup.setGroupBy(["TRANS_DATE", "emp_id", "strans_id"]);
            tableQuickSalesInvoicesLookup.setGroupHeader([
                (value, count, data) => {                                    
                    let numTellers = _.size(_.filter(_.uniqBy(resp.data, 'emp_id'), entry => entry.TRANS_DATE == value)),
                        numInvoices = _.size(_.filter(_.uniqBy(resp.data, 'strans_id'), entry => entry.TRANS_DATE == value));
                    return value ? moment(value).format('ddd, LL') + `<span style='color:#d00; margin: 0 10px;'> - &nbsp;&nbsp; ${numTellers + (numTellers > 1 ? ' Tellers' : ' Teller')}</span> | <span>${numInvoices + (numInvoices > 1 ? ' Invoices' : ' Invoice')}</span> &nbsp;&nbsp;| <span>${count + (count > 1 ? ' Items' : ' Item')}</span>` : '<span style="background: #000; color: lime;">TOTAL AMOUNT</span>';
                },
                (value, count, data) => {
                    let matched = _.find(resp.data, entry2 => entry2.emp_id == value),    
                        numInvoices = _.size(_.filter(_.uniqBy(resp.data, 'strans_id'), entry => entry.emp_id == value)),
                        tellerTill = _.sum(_.map(_.uniqBy(resp.data, 'strans_id'), entry => _.sumBy(resp.data, entry2 => (entry2.strans_id == entry.strans_id && entry2.emp_id == value) ? _.toNumber(entry2.EXT_AMT) : 0))),
                        vat_amount = _.sumBy(_.uniqBy(resp.data, 'strans_id'), entry => (entry.emp_id == value) && _.toNumber(JSON.parse(entry.vat_discount).vat.amount)),
                        discount_amount = _.sumBy(_.uniqBy(resp.data, 'strans_id'), entry => (entry.emp_id == value) && _.toNumber(JSON.parse(entry.vat_discount).discount.amount));
                    return value ? _.toUpper(matched?.fullname) + `<span style='color:#d00; margin-left:10px;'> - &nbsp;&nbsp; ${numInvoices + (numInvoices > 1 ? ' Invoices' : ' Invoice')}</span> = ${thousandsSeperator(tellerTill)}&nbsp;&nbsp; | &nbsp;<span style="color: maroon;">VAT = ${thousandsSeperator(vat_amount)}</span>&nbsp; | &nbsp;<span style="color: teal;">Discount = ${thousandsSeperator(discount_amount)}</span>` : '';
                },
                (value, count, data) => {
                    let matched = _.find(resp.data, entry2 => entry2.strans_id == value),
                        { vat, discount } = !_.isUndefined(matched) && JSON.parse(matched.vat_discount);
                    // return matched ? `${JSON.parse(matched?.receiptPref)?.code?.prefix + moment(matched?.regdate).format("YYMMDD") + value} @ <span style="color: blue;">${moment(matched?.regdate).format("LTS")}</span>
                    return matched ? `<div class="checkbox" style="position: absolute; top: 10px; left: 10px;">
                                            <input hidden type="checkbox" id="transOpts_${value}" class="transOpts custom-checkbox" value="${value}" data-invoice-details='${JSON.stringify(data)}'><label for="transOpts_${value}" style='cursor: pointer;'>&nbsp;</label>
                                        </div>${value} @ <span style="color: blue;">${moment(matched?.regdate).format("LTS")}</span>
                                        &nbsp;&nbsp; => <span style='color:#d00; margin-left:10px;'>(${count + (count > 1 ? ' Items' : ' Item')})</span>
                                        <span style='color: purple; margin-left:10px;'>${_.toUpper(matched?.cust_name)}</span>
                                        &nbsp;&nbsp; | <span style='color: teal;'>${matched?.PAY_TYPE}</span><span style="">VAT: ${thousandsSeperator(_.toNumber(vat.amount))}</span> &nbsp;&nbsp;| <span style="color: green;">Discount: ${thousandsSeperator(_.toNumber(discount.amount))}</span>
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin: 5px 0 0 20px;">
                                            <p style="margin: 0;">
                                                <section>Paid:<span>${thousandsSeperator(_.toNumber(matched?.received))}</span></section>
                                                &nbsp;|&nbsp;
                                                <section>Balance:<span>${thousandsSeperator(matched?.balance)}</span></section>
                                            </p>
                                        </div>
                                ` : ''
                    ;
                } 
            ]);
            tableQuickSalesInvoicesLookup.addRow([{
                sn: '',
                EXT_AMT: thousandsSeperator(_.sumBy(tableQuickSalesInvoicesLookup.getData(), entry => _.toNumber(entry['EXT_AMT'])))
            }], false);
        },
        beforeSend: () => {
            // $("#quickInvoicesLookup .content .left .bottom").html("<div style='display: grid; grid-template-columns: auto; justify-content: center; align-items: center; margin-top: 50px;'><img src='../assets/img/loading.gif' alt='loading' width='76px' height='76px' /></p>Please wait...</div>");
        }
    });
}
// position: absolute; top: 2px; right: 30px;
PopInvoices({rptOpts: {mainRpt: 4, subRpt: 1, dateFrom: $("#dateFrom").val(), dateTo: $("#dateTo").val()}});

$(document).on('click', '#btnMoreOpts', function (e) {
    !$("#overlay_moreOpts").is(':visible') ? notif.show({
        el: $(e.target).closest('button#btnMoreOpts'), 
        title: `
                <ul id="overlay_moreOpts" style="margin: 0; padding: 0; display: grid; list-style: none;">
                    <li><a href="javascript:void(0);" id="btnPreviewInvoices" class="no-udl clr-teal" style="display: block; padding: 10px 5px; border-bottom: solid 1px #ddd;"><i class="fa fa-book"></i> Invoice Lookup</a></li>
                    <li><a href="javascript:void(0);" id="btnFilterSeachStock" class="no-udl clr-teal" style="display: block; padding: 10px 5px; border-bottom: solid 1px #ddd;"><i class="fa fa-long-arrow-${(_.isNull(sessionStorage.getItem('SortStockPPQ'))) ? 'up' : 'down'}"></i> Sort PPQ <span>${(_.isNull(sessionStorage.getItem('SortStockPPQ'))) ? 'AS<u>C</u>' : 'DES<u>C</u>'}</span></a></li>
                    <li><a href="javascript:void(0);" id="btnReloadStock" class="no-udl clr-teal" style="display: block; padding: 10px 5px;"><i class="fa fa-refresh"></i> Reload Stock</a></li>
                <ul>
        `, 
        styleName: 'btnMoreOpts-overlay',
        position: 'bottom left', 
        className: 'default',
        autoHide: false,
        clickToHide: false
    }) : notif.hide($('.notifyjs-btnMoreOpts-overlay-base'));

    $("#btnPreviewInvoices").on('click', e => {
        notif.hide($('.notifyjs-btnMoreOpts-overlay-base'));
        if(pageRights.preview_sales) {
            $('#quickInvoicesLookup .content .right').css({'background': 'aliceblue'}); $('#quickInvoicesLookup .content .right .bottom #invoice_details').html(''); $('.ajax-page#quickInvoicesLookup').addClass('open'); $('#quickInvoicesLookup .title a').is(':hidden') ? $('#quickInvoicesLookup .content .left .top .row a').show() : '';
            PopInvoices({rptOpts: {mainRpt: 4, subRpt: 1, dateFrom: $("#dateFrom").val(), dateTo: $("#dateTo").val()}});
        }
        else{
            notif.show({ el: $(e.target), title: '<small><b>Access Denied</b>!<br/>You are not allowed to preview sales.</small>', className: 'warning', styleName: 'filter_stock_right', position: 'right center', autoHide: true });
        }
    });
    
    $("#btnFilterSeachStock").on('click', e => {
        notif.hide($('.notifyjs-btnMoreOpts-overlay-base'));
        if(sessionStorage.getItem('SortStockPPQ') == 'true'){
            sessionStorage.removeItem('SortStockPPQ');
            $(e.target).closest('a').find('i').removeClass('fa-long-arrow-down').addClass('fa-long-arrow-up');
            $(e.target).closest('a').find('span').html(`AS<u>C</u>`);
        }
        else{
            sessionStorage.setItem('SortStockPPQ', Boolean(true));
            $(e.target).closest('a').find('i').removeClass('fa-long-arrow-up').addClass('fa-long-arrow-down');
            $(e.target).closest('a').find('span').html(`DES<u>C</u>`);
        }
        _.forEach(tableStock.getRows(), row => row.reformat());
    });

    //  HOT-RELOAD ALL STOCKS FROM SERVER
    $("#btnReloadStock").on('click', e => {   
        notif.hide($('.notifyjs-btnMoreOpts-overlay-base'));
        // tableStock.alert(`<img src="../assets/img/loading.gif" alt="" width="" height="" />`);
        popStock().then(() => {
            $("main .right-sidebar #stock-pane #productCategories .swiper-wrapper").html("<div style='width: 100%; height: 100%; display: grid; justify-content: center; align-items: center;'><i class='fa fa-spinner fa-spin fa-4x'></i></div>");
            popCats();
            $('#find_item').trigger('focus')
            // tableStock.clearAlert();
        });
    });

});

$(document).on('input', '#dateFrom, #dateTo', function (e) {
    PopInvoices({rptOpts: {mainRpt: 4, subRpt: 1, dateFrom: $("#dateFrom").val(), dateTo: $("#dateTo").val()}});
});

$(document).on('input keyup', '#quickInvoicesLookup [type="search"]', function (e) {
    let filters = [];
    _.map(tableQuickSalesInvoicesLookup.getColumns(), col => filters = [...filters, {field: col.getField(), type: "like", value: _.trim(e.target.value)}]);
    tableQuickSalesInvoicesLookup.setFilter([
        // {},
        // Nested filter OR Object
        filters
    ]);
    // console.log(searchedStockResults); 
    if(e.key == 13 || e.which == 13){
        $(e.target).val('');
    }
});

// REPRINT SALES INVOICE
$(document).on('click', '#btnInvoiceOpts', e => {
    !$("#overlay_invoiceOpts").is(":visible") ? notif.show({
        el: $(e.target).closest('button'), 
        title: `
                <ul id="overlay_invoiceOpts" style="margin: 0 5px; padding: 0 10px; display: grid;">
                    <li><a href="javascript:void(0);" id="btnReprintInvoice" class="no-udl clr-teal" style="display: block; padding: 10px 5px; border-bottom: solid 1px #ddd;">Reprint</a></li>
                    <li><a href="javascript:void(0);" id="btnRepeatInvoice" class="no-udl clr-teal" style="display: block; padding: 10px 5px; border-bottom: solid 1px #ddd;">Repeat</a></li>
                    <li><a href="javascript:void(0);" id="btnReturnInvoice" class="no-udl clr-teal" style="display: block; padding: 10px 5px;">Return</a></li>
                <ul>
        `, 
        styleName: 'invoice-opts',
        position: 'bottom left', 
        className: 'default',
        autoHide: false,
        clickToHide: false
    }) : notif.hide($('.notifyjs-invoice-opts-base'));
    $('.notifyjs-invoice-opts-base').css({'position': 'fixed', 'z-index': '1'});
});

const Reprint = () => {
    let invoices = _.map($('.transOpts:checked'), el => $(el).val()),
        trans = _.map($('.transOpts:checked'), el => $(el).data('invoiceDetails'));
    _.forEach(invoices, async invoice => {
        let data = new Array(), detail;
        await _.forEach(trans, tran => {
            detail = _.filter(tran, entry => entry.strans_id == invoice);
            _.map(detail, (entry, i) => {
                let { vat, discount } = JSON.parse(entry['vat_discount']),
                    netBill = _.sum(_.map(entry, amt => _.toNumber(amt['EXT_AMT'])));
                data = [...data, {
                    regdate: entry['regdate'],
                    item: entry['item'],
                    dim: entry['dim'],
                    priceLabel: entry['priceLabel'],
                    qty: entry['qty'],
                    rp: entry['sp'],
                    amt: entry['EXT_AMT'],
                    netTotalAmt: netBill + (vat.applied ? _.toNumber(vat.amount) : 0) - (discount.applied ? _.toNumber(discount.amount) : 0),
                    received: entry['received'],
                    balance: entry['balance'],
                    payment: entry['PAY_TYPE'],
                    extCartOpts: JSON.stringify({
                        vat: { type: vat.type, rate: vat.rate, amount: vat.amount, applied: vat.applied }, 
                        discount: { type: discount.type, rate: discount.rate, amount: discount.amount, applied: discount.applied }, 
                    }),
                    receiptPref: entry['receiptPref'],
                    customer: JSON.stringify({cust_id: entry['cust_id'], cust_name: entry['cust_name'], cust_phone: entry['cust_phone'], is_default: entry['is_default']}),
                    teller: entry.fullname
                }];
            });
        });
        receipt({ transID: myTransCodePrefix + moment(detail.regdate).format("YYMMDD") +  invoice, data });
    });
    $('.notifyjs-multi-reprint-invoice-prompt-base').closest('.notifyjs-wrapper').remove();
}

$(document).on('click', "#btnReprintInvoice", e => {
    let invoices = _.map($('.transOpts:checked'), el => $(el).val()),
        trans = _.map($('.transOpts:checked'), el => $(el).data('invoiceDetails'));
    // console.log(invoices, trans);
    if(_.size(invoices) > 0){
        if(_.size(invoices) > 1){
            notif.hide($('.notifyjs-multi-reprint-invoice-prompt-base'));
            notif.show({
                el: $(e.target),
                title: `<div style="overlay_multiReprintPrompt">
                            <small>Reprint ${_.size(invoices)} different invoice(s)</small>. <br/>
                            <br/>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <section>Proceed?</section>
                                <section>
                                    <button type="button" class="btn btn-info btn-sm" id="btnProceedReprint">Yes</button>
                                    <button type="button" class="btn btn-sm" id="btnAbortReprint">No</button>
                                </section>
                            </div>
                        </div> 
                `,
                styleName: "multi-reprint-invoice-prompt",
                className: "warning",
                position: "right center",
                autoHide: false,
                clickToHide: false
            });
        }
        else{
            Reprint();
        }
    }
    else{
        notif.show({ el: $(e.target), title: '<small>No invoice(s) selected.</small>', className: 'warning', styleName: 'no-invoice-selected-prompt', position: 'right center', autoHide: true, clickToHide: false });
    }
});

$(document).on('click', "#btnProceedReprint", e => {
    Reprint();
});

$(document).on('click', "#btnAbortReprint", e => {
    $('.notifyjs-multi-reprint-invoice-prompt-base').closest('.notifyjs-wrapper').remove();
});

const RepeatInvoice = () => {
    let invoices = _.map($('.transOpts:checked'), el => $(el).val()),
        trans = _.map($('.transOpts:checked'), el => $(el).data('invoiceDetails'));
    _.forEach(invoices, async invoice => {
        let detail;
        await _.forEach(trans, tran => {
            detail = _.filter(tran, entry => entry.strans_id == invoice);
            _.map(detail, (entry, i) => {
                entry.rate = entry['sp']
                AddToCart(activeCart, entry.prod_id, entry.item, entry.dim, entry.priceLabel, entry.qty, entry.cp, entry.rate, entry.EXT_AMT);

            });
        });
    });
    $('.notifyjs-unempty-repeat-invoice-active-cart-base').closest('.notifyjs-wrapper').remove();
}

$(document).on('click', "#btnRepeatInvoice", e => {  
    let invoices = _.map($('.transOpts:checked'), el => $(el).val());
    if(_.size(invoices) > 0){
        if(_.size(shoppingCart[activeCart]) > 0){
            notif.show({
                el: $(e.target),
                title: `<div style="overlay_salesReturnPrompt">
                            Cart has ${_.size(shoppingCart[activeCart])} item(s) already.<br/>
                            <br/>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <section>Add to list?</section>
                                <section>
                                    <button type="button" class="btn btn-info btn-sm" id="btnProceedAddToCart">Yes</button>
                                    <button type="button" class="btn btn-sm" id="btnAbortAddToCart">No</button>
                                </section>
                            </div>
                        </div> 
                `,
                styleName: "unempty-repeat-invoice-active-cart",
                className: "warning",
                position: "right center",
                autoHide: false,
                clickToHide: false
            });
        }
        else{
            RepeatInvoice();
        }
    }
    else{
        notif.show({ el: $(e.target), title: '<small>No invoice(s) selected.</small>', className: 'warning', styleName: 'no-invoice-selected-prompt', position: 'right center', autoHide: true, clickToHide: false });
    }
});

$(document).on('click', "#btnProceedAddToCart", e => {
    RepeatInvoice();    
});

$(document).on('click', "#btnAbortAddToCart", e => {
    $('.notifyjs-unempty-repeat-invoice-active-cart-base').closest('.notifyjs-wrapper').remove();
});

// const ReturnInvoice = () => {
//     let invoices = _.map($('.transOpts:checked'), el => $(el).val()),
//         trans = _.map($('.transOpts:checked'), el => $(el).data('invoiceDetails'));
//     _.forEach(invoices, async invoice => {
//         let detail;
//         await _.forEach(trans, tran => {
//             detail = _.filter(tran, entry => entry.strans_id == invoice);
//             _.map(detail, (entry, i) => {
//                 entry.rate = entry['sp']
//                 AddToCart(activeCart, entry.prod_id, entry.item, entry.dim, entry.priceLabel, entry.qty, entry.cp, entry.rate, entry.EXT_AMT);

//             });
//         });
//     });
//     $('.notifyjs-unempty-repeat-invoice-active-cart-base').closest('.notifyjs-wrapper').remove();
// }

// RETURN SALES INVOICE

$(document).on('click', "#btnReturnInvoice", e => {
    let selItemInvoices = _.groupBy(tableQuickSalesInvoicesLookup.getSelectedData(), 'strans_id'),
        selItems = tableQuickSalesInvoicesLookup.getSelectedData();
    
    notif.show({
        el: $(e.target),
        title: `<div style="overlay_salesReturnMultiInvoicePrompt">
                    ${_.size(selItemInvoices) > 0 ? `
                        <small>${_.size(selItemInvoices) > 1 ? `You're about to return sales for<br/> <b>${_.size(selItems)}</b> item(s) in <b>${_.size(selItemInvoices)}</b> invoice(s).` : `Reverse sale of ${_.size(selItems)} item(s).`}</small><br/><br/>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <section>Proceed?</section>
                            <section>
                                <button type="button" class="btn btn-info btn-sm" id="btnProceedReturnInvoice">Yes</button>
                                <button type="button" class="btn btn-sm" id="btnCancelReturnInvoice">No</button>
                            </section>
                        </div> 
                    ` 
                    : 
                    `<small>No item(s) selected.</small>`
                }
                </div> 
        `,
        styleName: "prompt-invoice-return",
        className: "warning",
        position: "right center",
        autoHide: _.size(selItemInvoices) > 0 ? false : true,
        clickToHide: _.size(selItemInvoices) > 0 ? false : true
    });    
});

$(document).on('click', "#btnProceedReturnInvoice", e => {
    let selItemInvoices = _.groupBy(tableQuickSalesInvoicesLookup.getSelectedData(), 'strans_id'),
        selItems = tableQuickSalesInvoicesLookup.getSelectedData();
    // console.log(selItemInvoices)
    $.post(`./cart.php?returnSale`, { selItems }, resp => {
        // console.log(resp);
        if(resp.returned){
            //run code after row has been deleted
            appSounds.oringz.play();
            alertify.success('Item successfully returned.');
            PopInvoices({rptOpts: {mainRpt: 4, subRpt: 1, dateFrom: $("#dateFrom").val(), dateTo: $("#dateTo").val()}});
            $("#btnReloadData").trigger('click');
            $('.notifyjs-prompt-invoice-return-base').closest('.notifyjs-wrapper').remove();
        }
        else{
            console.log(resp);
        }
    }, 'JSON');
});

$(document).on('click', "#btnCancelReturnInvoice", e => {
    $(e.target).closest('.notifyjs-wrapper').remove();
});

let stocks;
const popStock = async () => pop('../stock/crud.php?stocks&pop')      // LOAD STOCK
.then(resp => tableStock.setData(_.filter(resp.data, entry => entry.active != 0)).then(() => stocks = resp.data));

const popCats = async () => pop('../stock/categories/crud.php?pop')     // LOAD CATEGORIES
.then(resp => {
    $("main .right-sidebar #stock-pane #productCategories .swiper-wrapper").html('');
    resp.data && resp.data.map((entry, i) => {
        productCategoriesSwiper.appendSlide([`
            <a href='javascript:void(0);' class='swiper-slide item no-udl clr-inverse' style='background: ${entry.color}; color: #fff; padding: 5px; display: grid; justify-content: center; align-items: center;' data-cat-id="${entry['cat_id']}" data-cat-items='${JSON.stringify(_.filter(stocks, (stock) => stock['cat_id'] == entry['cat_id']))}'>
                ${(entry.cat_name).toUpperCase()}
                [${_.sum(_.map(stocks, (stock) => stock['cat_id'] == entry['cat_id']))}]
            </a>
        `]);
        productCategoriesSwiper.update();
    });
});

popStock()
.then(() => {
    $("main .right-sidebar #stock-pane #productCategories .swiper-wrapper").html("<div style='width: 100%; height: 100%; display: grid; justify-content: center; align-items: center;'><i class='fa fa-spinner fa-spin fa-3x'></i></div>");
    popCats();
});


//define Tabulator
var searchedStockResults, tableStock = new Tabulator("#stocks", {
    height: "calc(100vh - 160px)",
    layout: "fitColumns",    
    headerVisible: false,
    // data:cheeseData,
    initialSort: [             //set the initial sort order of the data
        // {column: "CAT", dir: "asc"},
        {column: "item", dir: "asc"},
    ],
    columns: [
        {title: "Description", field: "item", sorter: "string"},
    ],
    pagination: "local",       //paginate the data
    paginationSize: 50,         //allow 7 rows per page of data
    paginationButtonCount: 3,
    persistenceID: "persist_tableStock",
    paginationSizeSelector: true,
    persistence: {
        // filter: true, //persist filter
        // page: true, //persist pagination settings
        // columns: true, //persist column layout
    },
    persistenceReaderFunc: async (id, type) => {
        //id - tables persistence id
        //type - type of data being persisted ("sort", "filter", "group", "page" or "columns");
        var data = localStorage.getItem(id + "-" + type);
        // console.log(id, JSON.parse(data));
        return data ? JSON.parse(data) : false;
    },
    rowFormatter: async row => {
        var element = row.getElement(), data = row.getData(), cellContents = '';
        let ppq = sessionStorage.getItem('SortStockPPQ') == 'true' ? _.sortBy(JSON.parse(data.ppq), ['qty']) : JSON.parse(data.ppq);
        let { cat_name, color, prod_id, item, barcode, qty, cp, photos } = data;
        //clear current row data
        while(element.firstChild) element.removeChild(element.firstChild);
            // cellContents += `
            //                     <a href="javascript:void(0);" class="stock item no-udl clr-inverse" style="border-top: solid 2px ${data.color};" data-item-prop='${JSON.stringify(data)}'>
            //                         <div>
            //                             <div style="display: flex; gap: 5px;">  
            //                                 <img src="../uploads/${!_.isNull(photos) ? `stocks/${JSON.parse(photos)[0]}` : `no-photo.png`}" alt="${item} photos" style="padding: 5px; opacity: ${!_.isNull(photos) ? 1 : .5}; width: 70px; height: 65px;" />
            //                                 <section style="padding: 5px;">
            //                                     <span style="height: 15px; border-radius: 50%; background: ${data.color}; display: none;"></span> 
            //                                     ${datbutton.stock.toUpperCase()}
            //                                 </section>
            //                             </div>
            //                         </div>
            //                         <div>
            //                             <section style="display: grid; grid-template-columns: 50px 1fr 50px; justify-content: space-between;">
            //                                 <span title="${ppq[0]?.qty || 0}" id="dim" style="text-align: left; padding: 10px;">x<b>${ppq[0]?.qty || 0}</b></span>
            //                                 <span title="${data.qty || 0}" style="visibility: ${!pageRights.see_stockLevels && 'hidden'}; padding: 10px; text-align: center;">${data.qty || 0}</span>
            //                                 <span title="${ppq[0]?.rate || 0}" id="price_toggle" style="text-align: right; padding: 10px;">${thousandsSeperator(_.toNumber(ppq[0]?.rate)) || 0}</span>
            //                             </section>
            //                             <section style="height: 20px; white-space: wrap; overflow: hidden; text-overflow: ellipsis; padding: 2px 5px; background: rgba(0, 0, 0, .2); color: #cc11111; border-top: dashed 1px ${data.color};" title="${data.cat_name.toUpperCase()}"><small>${data.cat_name.toUpperCase() || ''}</small></section>
            //                         </div>
            //                     </a>
            // `;
            cellContents += `
                                <button href="javascript:void(0);" class="btn btn-default stock item no-udl clr-inverse" style="padding: 0; border-top: solid 2px ${data.color};" data-item-prop='${JSON.stringify(data)}'>
                                    <div style="height: 170px; position: relative;">
                                        <img src="../uploads/${!_.isNull(photos) ? `stocks/${JSON.parse(photos)[0]}` : `no-photo.png`}" alt="${item} photos" style="opacity: ${!_.isNull(photos) ? 1 : .5}; width: 100%; height: inherit; margin: 0 auto;" />
                                        <span title="${ppq[0]?.qty || 0}" id="dim" style="text-align: left; position: absolute; right: 0; bottom: 0; padding: 5px; margin: 5px; background: #f1f1f1; color: #000; border-radius: 7px; box-shadow: 0 0 10px 0 rgba(0, 0, 0, .2); font-size: 16px;">x<b>${ppq[0]?.qty || 0}</b></span>
                                        <span title="${qty || 0}" style="visibility: ${!pageRights.see_stockLevels && 'hidden'}; position: absolute; top 0; left: 0; padding: 5px; margin: 5px; background: #f1f1f1; color: #000; border-radius: 7px; box-shadow: 0 0 10px 0 rgba(0, 0, 0, .2); font-size: 16px;">${qty || 0}</span>
                                        <span title="${ppq[0]?.rate || 0}" id="price_toggle" style="position: absolute; top 0; right: 0; padding: 5px; margin: 5px; background: red; color: #fff; border-radius: 7px; box-shadow: 0 0 10px 0 rgba(0, 0, 0, .2); font-size: 16px;">${thousandsSeperator(_.toNumber(ppq[0]?.rate)) || 0}</span>
                                    </div>
                                    <div style="height: 35px; text-align: left; padding: 5px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; background: #f7f5ff;" title="${item.toUpperCase()}">
                                        ${item.toUpperCase()}
                                    </div>
                                </button>
            `;            
        $(".tabulator#stocks .tabulator-tableHolder .tabulator-table").addClass('stock_list');
        element.innerHTML += (cellContents);
    },
    columnDefaults: {
        resizable: false,
    },
    placeholder: "No Data Available", //display message to user on empty table
});

tableStock.on("tableBuilt", () => {
    window.matchMedia("(max-width: 568px)").matches ? tableStock.setHeight("calc(100vh - 205px)") : tableStock.setHeight("calc(100vh - 160px)"); 
});

tableStock.on("dataFiltered", async (filters, rows) => {
    searchedStockResults = await {filters, rows};
    // console.log(_.isNumber(e.target.value));    
});

//  ADD TO CART
$(document).on('click', 'button.stock.item', e => {
    var _itemTarget = $(e.target);
    let itemProp = $(e.target).closest('button.stock').data('itemProp');
    itemProp.priceDim = $(e.target).closest('button.stock.item').find('#dim').text().substring(1);
    let ppq = JSON.parse(itemProp.ppq), html = "";
    _.forEach(ppq, (entry, i) => {
        html += `
            <li style="width: 180px; padding: 5px 0; ${i > 0 ? 'border-top: solid 1px #ddd;' : ''}; display: flex; ${entry.rate <= 0 && "color: #777; text-decoration: line-through; cursor: not-allowed"}; display: flex; align-items: center;" onclick="$(event.target).closest('li').find('input').prop('checked', true).trigger('change');">
                <input ${thousandsSeperator(_.toNumber(entry.rate)) == $(e.target).closest('button.stock').find('#price_toggle').text() ? 'checked' : ''} ${entry.rate <= 0 ? "disabled" : ''} type="radio" name="price" id="${entry.lbl}" value="${entry.rate}" data-price-dim="${entry.qty || 0}" data-price-label="${entry.lbl}">
                <div style="display: grid; grid-template-columns: 90px 10px 40px; gap: 5px; align-items: center;">
                    <section style="text-align: left;">${_.startCase(entry.lbl)} <sup>x<b>${entry.qty}</b></sup></section>
                    <section>=</section> 
                    <section style="text-align: right;">${thousandsSeperator(_.toNumber(entry.rate))}</section>
                </div>
            </li>
        `;
    })
    notif.hide($(".notifyjs-multi-price-overlay-base"));
    if(e.target.id == "price_toggle"){
        notif.show({
            el: $(e.target).closest('button.stock.item').find('#price_toggle'), 
            title: _.size(ppq) > 0 ? `
                <ul style="margin: 0; padding: 0;">
                    ${html}
                </ul>
            ` : `No price to select`, 
            styleName: 'multi-price-overlay',
            position: 'bottom right', 
            className: _.size(ppq) > 0 ? 'default' : 'error',
            autoHide: false,
            clickToHide: false
        });
    }
    else {
        // Trigger-click on item price
        $(e.target).closest('button.stock.item').find('#price_toggle').trigger('click');
        
        itemProp.price = $(e.target).closest('button.stock.item').find('#price_toggle').text(); 
        
        // IF W/S, USE VENDOR UNIT COST ELSE CHECK PPQ, IF NOT W/S
        itemProp.priceLabel = _.toNumber($(e.target).closest('button.stock.item').find('#price_toggle').text()) > 0 ? $(e.target).closest('button.stock.item').find('input[name="price"]:checked').data('priceLabel') : 'pc';
        
        // FIND MAX PPQ AND COMPUTE COST PRICE
        let maxPPQ = _.max(_.map(ppq, entry => _.toNumber(entry.qty)));
        itemProp.cpq = ppq.length > 1 ? ((itemProp.cp/maxPPQ)*itemProp.priceDim).toFixed(2) : itemProp.cp;

        AddToCart(activeCart, itemProp.prod_id, itemProp.item, itemProp.priceDim, itemProp.priceLabel, 1, itemProp.cpq, itemProp.price, itemProp.price);
        $("#find_item").val("");
    }
});

//  PRICE SELECTOR
$(document).on('change', 'input[name="price"]', e => {
    if(e.target.checked){
        $(e.target).closest('button.stock.item').find('#price_toggle').text(thousandsSeperator(_.toNumber(e.target.value)));
        $(e.target).closest('button.stock.item').find('#dim').html(`x<b>${$(e.target).data('priceDim') || 0}</b>`);
        $(e.target).closest('button.stock.item').trigger('click');
    }    
});

//  FILTER / SEARCH STOCK
$(document).on('input keyup keydown', '#find_item', e => { 
    if(pageRights.filter_stock) {   
        let key = e.keyCode || e.which;
        tableStock.setFilter([
            // {},
            // Nested filter OR Object
            [
                {field: "item", type: "like", value: e.target.value},
                {field: "barcode", type: "like", value: e.target.value}
            ]
        ]);   
        if(key == 13){
            $(e.target).val('')
            searchedStockResults.rows.length > 0 && $(".tabulator#stocks .stock_list .item").length == 1 && $(".tabulator#stocks .stock_list .item").trigger('click');
        }
        searchedStockResults.rows.length < 1 && $(".tabulator#stocks .tabulator-placeholder").css({'background': 'red', 'color': '#fff'}).html(`<div style="margin: 0 auto;"><h2 class="txt-center"><p><i class="fa fa-search fa-3x"></i></p>No record match search query.<p>Please try again.</p></h2></div>`)
    }
    else{
        notif.show({ el: $(e.target), title: '<div class="txt-center"><small><i class="fa fa-warning fa-2x"></i>You are not allowed to filter stock.</small></div>', className: 'error', styleName: 'access-denied-filter-stock', position: 'bottom right', autoHide: true });
        return false;
    }    
});

// Disable receive input, and keypad on Page Load
$('#received, main .left-sidebar .cart-toolbar .calculator .keypad button').prop('disabled', true);   

let tableCustomers;

const popCustomers = async () => {
    let customers;;
    $("#payment_methods").html("<option value=''>--- Payment ---</option>");
    await pop(`../customers/crud.php?pop`)
    .then(resp => {
        // console.log(resp.data);
        customers = resp.data;
        if(_.size($("#customers-table.tabulator")) > 0){
            tableCustomers.replaceData(resp.data) 
            $(".tabulator-table.customer_table_row").css({'display': 'grid', 'grid-template-columns': 'repeat(2, 1fr)', 'grid': '10px'});
        }
    });
    return customers;
}

// TIE DEFAULT CUSTOMER TO CURRENT TRANSACTION ON PAGE LOAD
popCustomers()
.then(data => {
    if(_.size(data) > 0){
        let defaultCustomer = _.find(data, entry => entry.is_default == 1);
        sessionStorage.setItem('customer', JSON.stringify(defaultCustomer));
        $('#selCustomer').val(_.startCase(defaultCustomer.cust_name));
        let apm = JSON.parse(defaultCustomer.apm);
        $("#payment_methods").html("<option value=''>--- Payment ---</option>");
        if(_.size(apm)){
            _.filter(apm, pm => {
                _.find(PAYMENT_METHODS, pm2 => pm == pm2.id ? $("#payment_methods").append(`<option value="${pm2.id}">${pm2.title}</option>`) : null);
            });
            notif.hide($('.notifyjs-no-payment-methods-base'));
        }
    }
});

$(document).on('click', '#btnBillByCustomer', e => { 
    if(pageRights.bill_customer){
        !$("#overlay_billByCustomer").is(':visible') 
        ? notif.show({ 
            el: $("#selCustomer"), 
            title: `
                    <div id="overlay_billByCustomer" style="width: calc(100vw - 2.5vw); max-width: 500px; overflow-y: auto;">
                        <div class="txt-center" style="display: flex; justify-content: space-between; align-items: center;">
                            <section style="display: grid; grid-template-columns: auto auto; gap: 20px; padding: 10px;">
                                <a href="javascript:void(0);" class="close no-udl clr-default" onclick="$('#btnBillByCustomer').trigger('click');"><i class="fa fa-chevron-down"></i></a> 
                                <span>Bill Customer</span>
                            </section> 
                            <div class="form-group search-pane float-xs" style="margin: 0 10px 0 10px;">
                                <input type="search" id="search_customer" placeholder="Search customer...">
                                <label for="search_customer" style="cursor: pointer;"><i class="fa fa-search clr-primary" style="width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;"></i></label>
                            </div>                   
                        </div>
                        <div id="customers-table"></div>
                    </div>
            `, 
            styleName: 'bill-by-customer', 
            position: 'top-left',
            className: 'default', 
            autoHide: false,
            clickToHide: false
        })
        : notif.hide($(".notifyjs-bill-by-customer-base"));   
        
        tableCustomers = new Tabulator("#customers-table", {
            height: "calc(100vh - 150px)",
            layout: "fitColumns",            
            // headerVisible: false,
            initialSort: [             //set the initial sort order of the data
                // {column: "CAT", dir: "asc"},
                {column: "cust_name", dir: "asc"},
            ],        
            // addRowPos: "top",          //when adding a new row, add it to the top of the table
            // history: true,             //allow undo and redo actions on the table
            selectable: 1,
            // movableColumns: true,      //allow column order to be changed
            resizableRows: false,       //allow row order to be changed
            // resizable: false,
            // paginationSize: true,         //allow 7 rows per page of data
            initialSort: [             //set the initial sort order of the data
                // {column:"name", dir:"asc"},
            ],
            columns: [   
                // {formatter: "rowSelection", align: "center", headerSort: false, width: 20},             //define the table columns
                // {title:"#", field:"", formatter: "rownum", width: 20},
                // {title: "", field: "photo", formatter: (cell, formatterParams, onRendered) => `<img src="${cell.getData().photo && `../uploads/customers/${cell.getData().photo}` || "../assets/img/avatar.jpg"}" alt="${_.toUpper(cell.getData().cust_name)} Logo" width="50" height="40" />`, formatterParams: { width: 40, height: 40 }, align: "center", headerSort: false, width: 50 },
                {title: "", field: "cust_id", visible: false, print: false, download: false },
                {title:"COMPANY", field: "cust_name", formatter: (cell, formatterParams, onRendered) => {
                    let data = cell.getData(), addr = JSON.parse(data.addr), country = _.find(countries, country => country.id == addr.locationAddr['cust_country']);
                    // console.log(country)
                    return cell.getValue() && `
                        <div class="customer-card ${data.is_default == 1 ? 'active' : ''}" data-customer-prop='${JSON.stringify(data)}' style="border-top: solid 2px ${data.color}; width: 100%; display: grid; grid-template-columns: auto 1fr; gap: 10px; padding: 5px;">
                            <div id="avatar">
                                <img src="${data.photo && `../uploads/customers/${data.photo}` || "../assets/img/avatar.jpg"}" alt="${_.toUpper(data.cust_name)} Logo" width="100%" height="100%" />
                            </div>
                            <div>
                                <section style="display: grid; grid-template-columns: 1fr auto; gap: 5px;">
                                    <span class="row-ellipsis">${_.toUpper(data.cust_name)}</span>
                                    <span>${country?.emoji || 'N/A'}</span>
                                </section>
                                <hr style="width: 100%; border: solid 1px #ccc;" /> 
                                <section style="display: grid; grid-template-columns: repeat(3, auto); gap: 5px; justify-content: space-between;">
                                    <small><b>Phone</b><br/>${addr.contactAddr.cust_phone}</small>
                                    <small class="txt-right"><b>Visits</b><br/><i class="fa fa-clock"></i> ${data.CUST_VISITS || 0}</small>
                                    <small class="txt-right"><b>Cr. Lim</b><br/><span>${CEDIS(data.credit_limit || 0).format()}</span></small>
                                </section>
                            </div>               
                        </div>
                    ` || ``}, 
                },
                {title:"CREDIT LIMIT", field: "credit_limit", hozAlign: "right", width: 70, visible: false},
                {title:"VISITS", field: "CUST_VISITS", hozAlign: "right", width: 60, visible: false},
                {title:"QTY", field: "qty", hozAlign: "right", formatter: (cell, formatterParams, onRendered) => cell.getValue() && QIHRF(cell.getValue(), cell.getData().priceLabel, cell.getData().dim), bottomCalc: (values, data, bottomCalcParams) => _.sumBy(data, entry => _.toNumber(entry.dim)*_.toNumber(entry.qty)), formatterParams: { precision: 0 }, width: 55, visible: false},
                {title:"RATE", field: "rate", editor: false, hozAlign: "right", width: 65, visible: false},
                {title:"TILL", field: "CUST_TILL", formatter: (cell, formatterParams, onRendered) => !_.isUndefined(cell.getValue()) && `<a href="javascript:void(0)" class="clr-inverse">${thousandsSeperator(_.toNumber(cell.getValue()))}</a>`, hozAlign: "right", bottomCalc: (values, data, calcParams) => thousandsSeperator(_.sumBy(values, entry => _.toNumber(entry))), width: 90 }
            ],
            columnDefaults: {
                tooltip: true,            //show tool tips on cells
                vertAlign: "middle",
                resizable: false,
            },
            pagination: "local",       //paginate the data
            paginationSize: 50,         //allow 7 rows per page of data
            paginationButtonCount: 3,
            paginationSizeSelector: true,
            persistenceReaderFunc: function(id, type){
                //id - tables persistence id
                //type - type of data being persisted ("sort", "filter", "group", "page" or "columns");
                var data = localStorage.getItem(id + "-" + type);
                // console.log(id, JSON.parse(data));
                return data ? JSON.parse(data) : false;
            },
            rowFormatter: async row => {
                var element = row.getElement(), data = row.getData(), cellContents = '';
                // let addr = JSON.parse(data['addr']);
                if(!_.isUndefined(data.cust_id)){
                    return data.is_default == 1 && row.select()
                }
            },
            placeholder: "No Data Available", //display message to user on empty table
        });

        tableCustomers.on("dataFiltered", async(filters, rows) => {
            searchedStockResults = await {filters, rows};
            // console.log(_.isNumber(e.target.value));    
        });

        tableCustomers.on("rowClick", (e, row) => {
            if(!row.isSelected()){
                row.select();
                sessionStorage.setItem('customer', JSON.stringify(row.getData()));
                $('#selCustomer').val(_.startCase(row.getData().cust_name));
            }
        });

        tableCustomers.on("rowSelectionChanged", (data, rows) => {            
            if(_.size(rows) > 0){                
                let apm = JSON.parse(data[0].apm);
                $("#payment_methods").html("<option value=''>--- Payment ---</option>");
                if(_.size(apm)){
                    _.filter(apm, pm => {
                        _.find(PAYMENT_METHODS, pm2 => pm == pm2.id ? $("#payment_methods").append(`<option value="${pm2.id}">${pm2.title}</option>`) : null);
                    });
                    notif.hide($('.notifyjs-no-payment-methods-base'));
                }
            }
        })

        popCustomers();
    }
    else{
        notif.show({ el: $(e.target).closest('button'), title: `<div class="txt-center"><small><i class="fa fa-warning fa-2x"></i>You're not allowed to bill customers.</small></div>`, className: 'error', styleName: 'access-denied-bill-customer', position: 'right center', autoHide: true });
    }
});    

// Filter Customers
$(document).on('input', '#overlay_billByCustomer #search_customer', function (e) { 
    tableCustomers.setFilter([{field: 'cust_name', type: 'like', value: e.target.value}])
});


/*  Cart Checkout Extra Options
    *
    *
    * 
*/

let footerBottomCustomTextEditor = footerBottomCustomText({height: 120, scroll: true});

const totalBill = amt => _.join(_.split(shoppingCartTable.getCalcResults().bottom.amt, ','), '');

$("#payment_methods").val('');
$("#payment_methods").on('change', e => {
    let { credit_limit, CUST_TILL } = JSON.parse(sessionStorage.getItem('customer')),
    billToPay = totalBill();
    if(e.target.value){
        $("#btnCheckout").prop('disabled', false);
        if(e.target.value == 4 && credit_limit > 0){
            // console.log(credit_limit, CUST_TILL, billToPay)
            validateCreditSale({ credit_limit, CUST_TILL, billToPay });
        }
    }
    else{
        $("#btnCheckout").prop('disabled', true);
    }
});

let vat, discount, receiptPref, bill = 0, vat_amount = 0, discount_amount = 0;
const PREFS = () => systemPrefs.pop()
.then(config => {
    vat = JSON.parse(config.data[0].pref)['vat'];
    discount = JSON.parse(config.data[0].pref)['discount'];
    receiptPref = JSON.parse((config.data[1])['pref']);
    $("#toggleVAT").prop('checked', vat.rate > 0 ? true : false);
    $("#VAT_RATE").text(he.decode(vat.type) == '%' ? he.decode(vat.rate+vat.type) : he.decode(vat.type+vat.rate))
    $("#toggleDiscount").prop('checked', discount.rate > 0 ? true : false);
    $("#DISCOUNT_RATE").text(he.decode(discount.type) == '%' ? he.decode(discount.rate+discount.type) : he.decode(discount.type+discount.rate))
    // console.log(receiptPref);
    new Promise((resolve, reject) => {
        resolve([
            $("#toggleVAT").on('change', e => {
                if($(e.target).is(':checked')){
                    if(vat.before == 0){
                        bill = _.toNumber(_.toNumber(_.sumBy(shoppingCart[activeCart], entry => _.toNumber(entry['amt'])))),
                        discount_amount = thousandsSeperator(_.toNumber(calcVATDISCOUNTAMOUNT(discount.type, discount.rate, bill))),
                        vat_amount = thousandsSeperator(_.toNumber(calcVATDISCOUNTAMOUNT(vat.type, vat.rate, bill - _.toNumber(discount_amount))));
                        if($("#toggleDiscount").is(':checked')){
                            $('.tabulator#shopping-cart-table .tabulator-footer .tabulator-calcs-holder .tabulator-row .tabulator-cell:last-child').text(thousandsSeperator((bill - _.toNumber(discount_amount) + _.toNumber(vat_amount))));
                        }
                        else{
                            $('.tabulator#shopping-cart-table .tabulator-footer .tabulator-calcs-holder .tabulator-row .tabulator-cell:last-child').text(thousandsSeperator(bill + _.toNumber(vat_amount)));
                        }
                    }
                    else{
                        bill = _.toNumber(_.sumBy(shoppingCart[activeCart], entry => _.toNumber(entry['amt']))),
                        vat_amount = thousandsSeperator(_.toNumber(calcVATDISCOUNTAMOUNT(vat.type, vat.rate, bill))),
                        discount_amount = thousandsSeperator(_.toNumber(calcVATDISCOUNTAMOUNT(discount.type, discount.rate, bill)));
                        if($("#toggleDiscount").is(':checked')){
                            $('.tabulator#shopping-cart-table .tabulator-footer .tabulator-calcs-holder .tabulator-row .tabulator-cell:last-child').text(thousandsSeperator((bill - _.toNumber(discount_amount) + _.toNumber(vat_amount))));
                        }
                        else{
                            $('.tabulator#shopping-cart-table .tabulator-footer .tabulator-calcs-holder .tabulator-row .tabulator-cell:last-child').text(thousandsSeperator(bill + _.toNumber(vat_amount)));
                        }
                    }
                }
                else{
                    bill = _.toNumber(_.sumBy(shoppingCart[activeCart], entry => _.toNumber(entry['amt'])));
                    $('.tabulator#shopping-cart-table .tabulator-footer .tabulator-calcs-holder .tabulator-row .tabulator-cell:last-child').text(thousandsSeperator(_.toNumber($("#toggleDiscount").is(':checked') ? bill - calcVATDISCOUNTAMOUNT(discount.type, discount.rate, bill) : _.sumBy(shoppingCart[activeCart], entry => _.toNumber(entry['amt'])))));  
                }
                $("#vat_amount").text(vat_amount);
                $("#discount_amount").text(discount_amount);
            }),            

            $("#toggleDiscount").on('change', e => {
                if($(e.target).is(':checked')){
                    if(vat.before == 0){
                        bill =  _.toNumber(_.sumBy(shoppingCart[activeCart], entry => _.toNumber(entry['amt']))),
                        discount_amount =  thousandsSeperator(_.toNumber(calcVATDISCOUNTAMOUNT(discount.type, discount.rate, bill))),
                        vat_amount = thousandsSeperator(_.toNumber(calcVATDISCOUNTAMOUNT(vat.type, vat.rate, bill - _.toNumber(discount_amount))));                    
                        if($("#toggleVAT").is(':checked')){
                            $('.tabulator#shopping-cart-table .tabulator-footer .tabulator-calcs-holder .tabulator-row .tabulator-cell:last-child').text(thousandsSeperator((bill - _.toNumber(discount_amount) + _.toNumber(vat_amount))));
                        }
                        else{
                            $('.tabulator#shopping-cart-table .tabulator-footer .tabulator-calcs-holder .tabulator-row .tabulator-cell:last-child').text(thousandsSeperator((bill - _.toNumber(discount_amount))));
                        }
                    }
                    else{
                        bill =  _.toNumber(_.sumBy(shoppingCart[activeCart], entry => _.toNumber(entry['amt']))),
                        discount_amount =  thousandsSeperator(_.toNumber(calcVATDISCOUNTAMOUNT(discount.type, discount.rate, bill))),
                        vat_amount = thousandsSeperator(_.toNumber(calcVATDISCOUNTAMOUNT(vat.type, vat.rate, bill)));                    
                        if($("#toggleVAT").is(':checked')){
                            $('.tabulator#shopping-cart-table .tabulator-footer .tabulator-calcs-holder .tabulator-row .tabulator-cell:last-child').text(thousandsSeperator((bill - _.toNumber(discount_amount) + _.toNumber(vat_amount))));
                        }
                        else{
                            $('.tabulator#shopping-cart-table .tabulator-footer .tabulator-calcs-holder .tabulator-row .tabulator-cell:last-child').text(thousandsSeperator((bill - _.toNumber(discount_amount))));
                        }
                    }
                }
                else{
                    bill =  _.toNumber(_.sumBy(shoppingCart[activeCart], entry => _.toNumber(entry['amt']))),
                    vat_amount = thousandsSeperator(_.toNumber(calcVATDISCOUNTAMOUNT(vat.type, vat.rate, bill)));                    
                    if($("#toggleVAT").is(':checked')){
                        $('.tabulator#shopping-cart-table .tabulator-footer .tabulator-calcs-holder .tabulator-row .tabulator-cell:last-child').text(thousandsSeperator((bill + _.toNumber(vat_amount))));
                    }
                    else{
                        $('.tabulator#shopping-cart-table .tabulator-footer .tabulator-calcs-holder .tabulator-row .tabulator-cell:last-child').text(thousandsSeperator((bill)));
                    }
                }
                $("#vat_amount").text(vat_amount);
                $("#discount_amount").text(discount_amount); 
            })
        ]);
    })
    .then(() => {
        shoppingCartTable.getData().length && validateTotalBill();       
        // $('#btnBillByCustomer').trigger('click');
    });
    footerBottomCustomTextEditor.setHTML(he.decode(receiptPref.footer.bottom));

});
PREFS();

$(document).on('focusin input blur', "#custom_receipt_footer_text", function(e){
    if(e.type == 'focusin' || e.type == 'input'){      
        $("#receiptFrame #footer #custom-text").html(footerBottomCustomTextEditor.getHTML());
    }
    else{
        if(e.type == 'focusout'){
            if(receiptPref.footer.bottom != he.encode(footerBottomCustomTextEditor.getHTML())){
                let { module, pref } = JSON.parse(e.target.parentElement.dataset.pref);
                systemPrefs.update(module, pref, he.encode(footerBottomCustomTextEditor.getHTML()))
                .then(resp => {
                    if(resp.updated){
                        appSounds.oringz.play();
                        alertify.success("Receipt Footer Updated");
                        PREFS();
                    }
                    else{
                        console.error(resp.data);     
                    }
                })
                .catch(err => console.error("Oopss... ", err));
            }
        }
    }
});

/*  Window Resize Options
    *
    *
    * 
*/
$(window).on('resize', () => { 
    // var table = Tabulator.prototype.findTable("#employee-table")[0];
    // table.redraw();
    window.matchMedia("(max-width: 568px)").matches ? tableStock.setHeight("calc(100vh - 205px)") : tableStock.setHeight("calc(100vh - 160px)"); 
    window.matchMedia("(min-width: 768px)").matches && $(".ajax-page#billByCustomer .content #top #right").slideDown(); 
    window.matchMedia("(max-width: 768px)").matches ? tableQuickSalesInvoicesLookup.setHeight("calc(100vh - 210px)") :tableQuickSalesInvoicesLookup.setHeight("calc(100vh - 140px)"); 
    shoppingCartTable.redraw(true); //trigger full rerender including all data and rows
    setTimeout(() => showShoppingCartTableOpts(), 500)
});