import { activeUser, pop, thousandsSeperator, QIHRF } from '../assets/js/utils.js'
import { TabulatorFull as Tabulator } from '../assets/plugins/tabulator-master/dist/js/tabulator_esm.min.js';
import env from '../env.js';

let qr = document.createElement('div');
        qr.id = "qr";
        document.querySelector('.cart-toolbar').prepend(qr);
        // qr.innerHTML = "<h1>Hello</h1>";  
        qr.style.display = "none";

let qrCode = new QRCode(qr, {
    text: 'ABC',
    width: 100,
    height: 100,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
});

let companyProfile;
pop('../config/crud.php?pop')
.then(resp => companyProfile = resp.data);

const Receipt = async opts => {
    // console.log(opts);  
    let { cust_id, cust_name, cust_phone, is_default } = JSON.parse(opts.data[0]['customer']);
    const { vat, discount } = JSON.parse(opts.data[0]['extCartOpts']);
    const receiptPref = JSON.parse(he.decode(opts.data[0]['receiptPref']));
    // console.log(receiptPref);
    qrCode.makeCode(opts.transID);  // Generate Transaction Code

    let receiptContainer = document.createElement('div');
        receiptContainer.id = "sales-receipt";
        document.body.append(receiptContainer);

    let tableReceipt = new Tabulator(receiptContainer, {
        layout: "fitColumns",      //fit columns to width of table
        data: opts.data,
        columns: [                 //define the table columns
            {title:"#", field:"", formatter: "rownum", width: 30},
            {title:"DESCRIPTION", field: "item", formatter: (cell, formatterParams, onRendered) => cell.getValue() && `${cell.getData().dim > 1 && cell.getValue().toUpperCase() + ' X ' + cell.getData().dim || cell.getValue().toUpperCase()}` || "" },
            {title:"DIM", field: "dim", hozAlign: "right", width: 55, visible: false, },
            {title:"P.LBL", field: "priceLabel", hozAlign: "right", width: 55, visible: false, },
            {title:"QTY", field: "qty", hozAlign: "right", formatter: (cell, formatterParams, onRendered) => (cell.getValue() && cell.getData().priceLabel) && QIHRF(cell.getValue(), cell.getData().priceLabel, cell.getData().dim), width: 55 },
            {title:"RATE", field: "rp", editor: false, hozAlign: "right", width: 65 },
            {title:"AMT", field: "amt", formatter: "money", hozAlign: "right", width: 70 },
        ],
        columnDefaults: {
            vertAlign: "middle",
        },
        printAsHtml: true, //enable html table printing
        printStyled: true, //copy Tabulator styling to HTML table
        printFormatter: (tableHolderElement, tableElement) => {
            //tableHolderElement - The element that holds the header, footer and table elements
            //tableElement - The table
            // console.log(tableElement);
            $(tableElement).length && JsBarcode("#barcode", opts.transID, {
                // displayValue: false,
                // width: .9
            })            
            $(tableElement).append(`
                <tfoot>                    
                    <td style="position: fixed; left: ${receiptPref.sticker.type == 'qr' ? -10 : -50}px;">
                        ${receiptPref.sticker.position == 'bottom' ?
                        `<div style="padding: 5px;">
                            <section style="display: flex; justify-content: end;">                            
                                ${                                
                                    receiptPref.sticker.visibility == 1 
                                    &&
                                    (receiptPref.sticker.type == 'qr' ? $('#qr').html() : $('#barcode-container').html())
                                }
                            </section>
                        </div>`
                    : ''}
                    </td>
                    <tr>
                        <td colspan="2">Sub Total</td>
                        <td style="border-left: none; border-right: none;">${_.sumBy(tableReceipt.getData(), entry => _.toNumber(entry.dim) * _.toNumber(entry.qty))}</td>
                        <td style="border: none;"></td>
                        <td style="border-left: none; border-right: none;">${thousandsSeperator(_.sumBy(tableReceipt.getData(), entry => parseFloat(entry['amt'])))}</td>
                    </tr>
                    <tr style="display: ${!vat.applied ? 'none' : ''};">
                        <td colspan="2">VAT/NHIL</td>
                        <td style="border-left: none; border-right: none;">${vat.type == '%' ? ((vat.rate > 0 ? vat.rate : 0) + vat.type) : (vat.type + (vat.rate > 0 ? vat.rate : 0))}</td>
                        <td style="border: none;"></td>
                        <td style="border-left: none; border-right: none;">${thousandsSeperator((vat.rate > 0 ? _.toNumber(vat.amount) : '0.00'), 2)}</td>
                    </tr>
                    <tr style="display: ${!discount.applied ? 'none' : ''};">
                        <td colspan="2">Discount</td>
                        <td style="border-left: none; border-right: none;">${discount.type == '%' ? ((discount.rate > 0 ? discount.rate : 0) + discount.type) : (discount.type + (discount.rate > 0 ? discount.rate : 0))}</td>
                        <td style="border: none;"></td>
                        <td style="border-left: none; border-right: none;">${thousandsSeperator((discount.rate > 0 ? _.toNumber(discount.amount) : '0.00'), 2)}</td>
                    </tr>
                    <tr hidden>
                        <td colspan="2">Net Total</td>
                        <td colspan="2" style="border: none;"></td>
                        <td style="border-left: none; border-right: none;">${thousandsSeperator(opts.data[0].netTotalAmt)}</td>
                    </tr>
                    <tr>
                        <td colspan="2">Payment</td>
                        <td style="text-align: left; border-left: none; border-right: none;">${opts.data[0]['payment']}</td>
                        <td style="border: none;"></td>
                        <td style="border-left: none; border-right: none;">${thousandsSeperator(_.toNumber(opts.data[0]['received']))}</td>
                    </tr>
                    <tr>
                        <td colspan="2">Balance</td>
                        <td colspan="2" style="border: none;"></td>
                        <td style="border-left: none; border-right: none;">${thousandsSeperator(_.toNumber(opts.data[0]['balance']))}</td>
                    </tr>
                </tfoot>
            `);
            $(tableElement).find('td:nth-child(3), td:nth-child(4), td:last-child').css({'text-align': 'right'});
            $(tableElement).find('thead th, tbody td').css({'font-size': `${receiptPref.font.size}px`, 'font-family': `${receiptPref.font.family}`, 'border': `${receiptPref.border.style} ${receiptPref.border.depth}px ${receiptPref.border.color}`, 'background': `${receiptPref.background.color} !important`});
            $(tableElement).find('tfoot').css({'text-align': 'right'});
            $(tableElement).find('tfoot td').css({'text-align': 'right', 'font-family': `${receiptPref.font.family}`, 'font-size': `${receiptPref.font.size}px`});
            $(tableElement).find('tfoot td:first-child').css({'border': 'none'});
        },
        printHeader: `
            <div style="font-family: ${receiptPref.font.family}; font-size: ${receiptPref.font.size};">
                <div style="display: grid; grid-template-columns: auto 1fr; justify-content: space-between;">
                    <section><img src='../uploads/${companyProfile[0]['logo']}' alt='${companyProfile[0]['comp_name']} Logo' width='100px' height='100px'></section>
                    <section style="text-align: center;"><h1 style="margin: 10px 0; font-size: 33px;">${companyProfile[0]['comp_name']}</h1><section style="margin-top: 0;"><b>LOC</b>: ${companyProfile[0]['addr']}</section><section style="margin-top: 5px;"><b>TEL</b>: ${companyProfile[0]['phone']} / ${companyProfile[0]['mobile']}</section><section></section></section>
                </div>
                <div style="margin: 15px 0; display: grid; grid-template-columns: ${receiptPref.sticker.visibility == 1 && receiptPref.sticker.position == 'top' ? '1fr auto;' : '1fr'}; gap: 20px;">
                    <div style="padding: 5px; border: dashed 3px #000; display: flex; flex-flow: column; justify-content: space-between;">
                        <section style="display: grid; grid-template-columns: auto auto; gap: 30px; justify-content: space-between;">
                            <span>Teller: </span>
                            <span>${opts.data[0].teller.toUpperCase()}</span>
                        </section>
                        <section style="display: grid; grid-template-columns: auto auto; gap: 30px; justify-content: space-between;">
                            <span>Trans ID: </span>
                            <span>${opts.transID.substring(0,3) + '-' + opts.transID.substring(9)} | ${moment(opts.data[0].regdate).format("MMM Do YY")} @ ${moment(opts.data[0].regdate).format("hh:mm a")}</span>
                        </section>
                        <section style="display: grid; grid-template-columns: auto auto; gap: 30px; justify-content: space-between;">
                            <span>Customer: </span>
                            <span>${(cust_name)} ${is_default != 1 ? `<br/><i class="fa fa-phone"></i>&nbsp;&nbsp;${cust_phone}` : ''}</span>
                        </section>
                    </div>
                    ${receiptPref.sticker.position == 'top' ?
                        `<div style="padding: 5px;">
                            <section style="display: flex; justify-content: end;">                            
                                ${                                
                                    receiptPref.sticker.visibility == 1 
                                    &&
                                    (receiptPref.sticker.type == 'qr' ? $('#qr').html() : $('#barcode-container').html())
                                }
                            </section>
                        </div>`
                    : ''}
                </div>
            </div>
        `,
        // printFooter: `
        //     <div style="margin: 10px 0; display: flex; justify-content: space-between;">
        //         <section>
        //             <span>Sub Total:</span>
        //             <span>${$(".tabulator#shopping-cart-table .tabulator-footer .tabulator-calcs-holder .tabulator-row .tabulator-cell:last-child").text()}</span>
        //         </section>
        //         <section style="">
        //             <span>Tax/NHIL:</span>
        //             <span>0.00</span>
        //         </section>      
        //         <section style="">
        //             <span>Discount:</span>
        //             <span>0.00</span>
        //         </section>    
        //     </div>
        //     <div style="margin: 10px 0; display: flex; justify-content: space-between;">
        //         <section>
        //             <span>Net Total:</span>
        //             <span>${$(".tabulator#shopping-cart-table .tabulator-footer .tabulator-calcs-holder .tabulator-row .tabulator-cell:last-child").text()}</span>
        //         </section>
        //         <section>
        //             <span>Paid: [${opts.data[0]['payment']}]</span>
        //             <span>${thousandsSeperator(parseFloat(opts.data[0]['received']))}</span>
        //         </section>
        //         <section style="">
        //             <span>Balance:</span>
        //             <span>${thousandsSeperator(parseFloat(opts.data[0]['balance']))}</span>
        //         </section>     
        //     </div>
        printFooter: `            
            <div style="margin: 0 auto; display: flex; flex-flow: column; justidy-content: center; align-items: center; font-family: ${receiptPref.font.family}; font-size: ${receiptPref.font.size};">
               ${receiptPref.footer.bottom}
            </div>
            <div style="margin: 10px 0; display: flex; justify-content: space-between;">
                <div style="">
                    <section>Software By:</section>
                    <section><b>${env.COMPANY.name}</b></section>
                </div>
                <div style="text-align: center;">
                    <section>Website:</section>
                    <section><b>${env.COMPANY.website.primary}</b></section>
                </div>      
                <div style="text-align: right;">
                    <section>Call / WhatsApp:</section>
                    <section><b>${env.COMPANY.phone.primary}</b></section>
                </div>    
            </div>
        `,  
        placeholder: "No Data Available", //display message to user on empty table
    });
    tableReceipt.on("tableBuilt", () => {
        tableReceipt.print();   
    });
    await qrCode.clear();
}

export default Receipt;