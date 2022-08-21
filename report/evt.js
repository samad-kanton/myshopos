import { pop, popCountries, thousandsSeperator, QIHRF, Notif, headerMenu, myProgressLoader } from '../assets/js/utils.js'
import myAlertifyDialog from "../components/myAlertifyDialog.js";
import ApexCharts from '../assets/plugins/apexcharts.esm.js'
import { DateTime, Duration, FixedOffsetZone, IANAZone, Info, Interval, InvalidZone, Settings, SystemZone, VERSION, Zone } from '../assets/plugins/luxon.js'
import { printTableData, exportTableData } from '../assets/js/event.js'
import ItemModel from '../model/stock.js'
import { TabulatorFull as Tabulator } from '../assets/plugins/tabulator-master/dist/js/tabulator_esm.min.js';

const notif = new Notif();

let companyProfile;
pop('../config/crud.php?pop')
.then(resp => {
    companyProfile = resp.data;
      
    $(document).on('input', '#date_from', function () {
        // $('#date_to').val('');
        $('#date_to').closest('.form-group').find('[type="date"]').css({ 'color': '', 'border-bottom': '' });
        $('#date_to').closest('.form-group').find('label').css({ 'color': '' });
    });

    $(document).on('input', '#date_to', function () {
        if($(this).val() < $('#date_from').val()){
            alertify.error("Invalid Date Interval");
            $(this).closest('.form-group').find('[type="date"]').css({'color':'red', 'border-bottom':'solid 1px red'});
            $(this).closest('.form-group').find('label').css({'color': 'red'});
        }
        else{
            $(this).closest('.form-group').find('[type="date"]').css({'color':'', 'border-bottom':''});
            $(this).closest('.form-group').find('label').css({'color': ''});
        }
    });
    

    let africanCountries;
    popCountries()
    .then(countries => africanCountries = countries);

    let dynamicColumns, dynamicIndex;
    const PopSubMenu = (main, sub) => {
        let supplier_sub = ["Supplier Profile", "Top Suppliers"],
            purchase_sub = ["Orders", "Returns"],
            // inventory_sub = ["Detailed Information", "Low Stock", "Zero / No Stock", "Movement(Warehouse to Salesfloor)", "Faulty Products"],
            inventory_sub = ["Value", "Low Stock", "Zero / No Stock", "Due / Expired"],
            sales_sub = ["Summary", "Call-over", "Fast-Moving", "Markup", "Return"],
            accounts_sub = ["Cash Book Archives", "Cash On Hand", "Bank Statement"],
            employee_sub = ["Bio Data"],
            customers_sub = ["Profile", "Till"];
        $(sub).html('');
        if($(main).val() == 1){
            supplier_sub.forEach((item, index) => $(sub).append(`<option value="${index}">${item}</option`));
        }
        else if ($(main).val() == 2) {
            purchase_sub.forEach((item, index) => $(sub).append(`<option value="${index}">${item}</option`));
        }
        else if ($(main).val() == 3) {
            inventory_sub.forEach((item, index) => $(sub).append(`<option value="${index}">${item}</option`));
        }
        else if ($(main).val() == 4) {
            sales_sub.forEach((item, index) => $(sub).append(`<option value="${index}">${item}</option`));
        }
        else if ($(main).val() == 5) {
            accounts_sub.forEach((item, index) => $(sub).append(`<option value="${index}">${item}</option`));
        }
        else if ($(main).val() == 6) {
            employee_sub.forEach((item, index) => $(sub).append(`<option value="${index}">${item}</option`));
        }
        else if ($(main).val() == 7) {
            customers_sub.forEach((item, index) => $(sub).append(`<option value="${index}">${item}</option`));
        }
    }

    $("#main_rpt").on('change', e => {
        PopSubMenu(e.target, '#sub_rpt');
        $('#preview_rpt').html('');
        $('#frm_gen_rpt').trigger('submit')
    });

    const getDaysBetweenDates = (startDate, endDate) => {
        var now = startDate.clone(), dates = [];
        while (now.isSameOrBefore(endDate)) {
            dates = [...dates, now.format('YYYY-MM-DD')];
            now.add(1, 'days');
        }
        return dates;
    };

    const filterStock = params => {
        // console.log(params.filters);
        tableReports.setFilter([
            _.map(params.filters, f => JSON.parse(f.clause))
        ]);
        // tableStock.setFilter((data, filterParams) => {
        //     console.log(data.qty <= data.restock ? { item: data.item, qty: data.qty, restock: data.restock } : '');
        //     return data.qty < 5;
        // });
        // console.log(tableStock.getFilters()[0])
    }

    $('#btnFilterStock').on('click', e => { 
        !$("#overlay_filterStock").is(':visible') 
        ? notif.show({ 
            el: $(e.target),
            title: `    
                    <div id="overlay_filterStock" style="width: 150px; overflow-y: auto; background: aliceblue;">
                        <div id="table-filterStock"></div>
                    </div>
            `, 
            styleName: 'filter-stock', 
            className: 'default', 
            autoHide: false, 
            clickToHide: false, 
            position: "bottom right" 
        })
        : notif.hide($('.notifyjs-filter-stock-base'));  
        
        let stockFilterData = [
            // {field: '', clause: 'all', label: 'All Filters'},
            {field: 'active', label: 'Active Stock', clause: JSON.stringify({field: "active", type: "=", value: 1}) },
            {field: 'inactive', label: 'Inactive Stock', clause: JSON.stringify({field: "active", type: "=", value: 0}) },
            // {field: 'low', label: 'Low Stock', clause: JSON.stringify({field: "qty", type: "<=", value: "restock"}) },
            {field: 'zero', label: 'Zero Stock', clause: JSON.stringify({field: "qty", type: "=", value: 0}) },
            // { label: 'Expired Stock', clause: JSON.stringify({field: "active", type: "=", value: 1}) }
        ];
        
        // localStorage.removeItem('tableStockFilters');
        let tableFilterStock = new Tabulator("#table-filterStock", {
            layout: "fitColumns",
            data: stockFilterData,
            selectable: true,
            placeholder: "No Data Set",   
            // headerVisible: false,         
            columns: [
                {formatter: "rowSelection", titleFormatter: "rowSelection", headerSort: false, width: 10 },
                {title: "Clause", field: "clause", visible: false },
                {title: "", field: "label" },
            ],
            rowFormatter: row => {
                // if(row.getData().clause != ""){
                //     console.log(row.getTable().getDataCount());
                //     if(_.size(tableStockFilters) < 1){
                //         for (let i = 0; i < row.getTable().getDataCount(); i++) {
                //         }
                //     }
                // }
                // console.log(tableStockFilters)
                row.select();
            },
            rowClick: (e, row) => {

            },
            rowSelectionChanged: (data, rows) => {
                // console.log(rows[0]);
                // let clause = rows[0].getData().clause;
                // if(data.clause != ""){
                    // tableStockFilters = [...tableStockFilters, JSON.stringify(tableStock.getFilters()[0])];
                    // console.log(tableStockFilters);
                    // localStorage.setItem('stockTableFilters', JSON.stringify(tableStock.getFilters()[0]));
                    filterStock({ filters: _.map(data) });                
                // }
            }
        });

    });
    
    var controller = new AbortController(), signal = controller.signal;

    const genReport = async rptOpts => {
        // console.log(Object.values(rptOpts)[0]);
        if ($('#date_to').val() < $('#date_from').val()) {
            alertify.error("Invalid Date Interval");
            $('#date_to').closest('.form-group').find('[type="date"]').css({ 'color': 'red', 'border-bottom': 'solid 1px red' });
            $('#date_to').closest('.form-group').find('label').css({ 'color': 'red' });
        }
        else {
            $('#date_to').closest('.form-group').find('[type="date"]').css({ 'color': '', 'border-bottom': '' });
            $('#date_to').closest('.form-group').find('label').css({ 'color': '' });

            if(Object.values(rptOpts)[0].mainRpt != ""){
                myProgressLoader.load();
                controller = new AbortController(), signal = controller.signal;
                pop(`./rpt_func.php?mainRpt=${Object.values(rptOpts)[0].mainRpt}&subRpt=${Object.values(rptOpts)[0].subRpt}&df=${$("#date_from").val()}&dt=${$("#date_to").val()}&groupBy=${Object.values(rptOpts)[0].groupBy}&allTime=${Object.values(rptOpts)[0].allTime}`, { signal }).then(resp => {
                    console.log(resp);

                    myProgressLoader.stop();
                    $(".tabulator-placeholder").css({'background': 'red', 'color': '#fff'}).html(`<div style="margin: 0 auto;"><h2 class="txt-center">Ooppsss.... No Data found!</h2></div>`);
                    tableReports.setGroupBy(false);

                    // SUPPLIERS/VENDORS REPORT
                    if(Object.values(rptOpts)[0].mainRpt == 1){
                        
                    }
                    // PURCHASES REPORT
                    else if(Object.values(rptOpts)[0].mainRpt == 2){
                        if(Object.values(rptOpts)[0].subRpt == 0){
                            tableReports.setColumns([
                                {title: "S/N", field: "", formatter: "rownum" || "", headerMenu, headerSort: false, hozAlign: "center", width: 30},
                                {title: "ORDER ID", field: "order_id", headerMenu, hozAlign: "center", width: 50, visible: false },
                                {title: "DATE", field: "ORDER_DATE", headerMenu, hozAlign: "center", width: 100, visible: false },
                                {title: "TIME", field: "ORDER_TIME", headerMenu, hozAlign: "center", width: 100 },
                                {title: "DESCRIPTION", field: "item", headerMenu, formatter: (cell, formatterParams, onRendered) => cell.getValue() && _.toUpper(cell.getValue()) || "", minWidth: 200 },
                                {title: "PPQ", field: "ppq", visible: false, print: false, download: false },
                                {title: "QTY", field: "qty", headerMenu, formatter: "money", formatterParams: { precision: false, thousand: ",", }, bottomCalc: (values, data, calcParams) => _.sumBy(values, sum => parseInt(sum || thousandsSeperator(0.00))), hozAlign: "right", width: 90 },
                                // {title: "COST", field: "cp", headerMenu, formatter: (cell, formatterParams, onRendered) => { let { cp, xcp, qty, ppq } = cell.getData(); if(!_.isUndefined(ppq) && _.size(JSON.parse(ppq)) > 0){ let cp =  }else{ } }, formatterParams: { precision: 2 }, formatter: "money", hozAlign: "right", width: 80 },
                                {title: "COST", field: "cp", headerMenu, formatter: "money", formatter: "money", hozAlign: "right", width: 80 },
                                {title: "EXT.", field: "xcp", headerMenu, formatter: "money", bottomCalc: (values, data, bottomCalc) => thousandsSeperator(_.sumBy(values, entry => _.toNumber(entry || thousandsSeperator(0.00)))), hozAlign: "right", width: 100 },
                                {title: "RETAIL", field: "rp", headerMenu, formatter: "money", hozAlign: "right", width: 80 },
                                {title: "EXT.", field: "xrp", headerMenu, formatter: "money", bottomCalc: (values, data, calcParams) => thousandsSeperator(_.sumBy(values, sum => parseFloat(sum || thousandsSeperator(0.00)))), bottomCalcParams: { precision: 2}, hozAlign: "right", width: 100},
                                {title: "MARKUP", field: "mrp", headerMenu, formatter: "money", bottomCalc: (values, data, calcParams) => thousandsSeperator(_.sumBy(values, sum => parseFloat(sum || thousandsSeperator(0.00)))), bottomCalcParams: { precision: 2 }, hozAlign: "right", width: 100}
                            ]);
                            // tableReports.setData(_.uniqBy(_.filter(resp.data, entry => entry['ORDER_DATE'] = moment(entry['ORDER_DATE']).format("YYYY-MM-DD")), 'prod_id'));
                            let reformedData = _.map(resp.data, (entry, i) => {
                                entry.item = _.toUpper(entry.item);
                                entry.cp = thousandsSeperator(_.toNumber(entry.cp));
                                entry.xcp = _.toNumber(entry.qty) * _.toNumber(entry.cp) || ''
                                entry.rp = entry.ppq && _.minBy(JSON.parse(entry.ppq), entry => _.toNumber(entry.qty)).rate || ''
                                entry.xrp = _.toNumber(entry.qty) * _.toNumber(entry.rp) || ''
                                entry.mrp = _.toNumber(entry.xrp) - _.toNumber(entry.xcp) || ''
                                entry.ORDER_TIME = moment(entry.ORDER_DATE).format("LTS")
                                entry.ORDER_DATE = moment(entry.ORDER_DATE).format("YYYY-MM-DD")
                                return entry;
                            })
                            // console.log(reformedData);
                            tableReports.setData(reformedData);
                            // console.log(tableReports.getData());
                            tableReports.setSort([{column: "ORDER_DATE", dir: "desc"}]);
                            tableReports.setGroupBy(["ORDER_DATE", "emp_id"]);
                            tableReports.setGroupHeader([
                                (value, count, data) => {
                                    return value && moment(value).format("dddd, MMMM Do YYYY") || "TOTAL AMOUNT"
                                },
                                (value, count, data) => {
                                    let matched = _.find(data, entry => entry.emp_id == value);
                                    return value ? `${value && matched['fullname'].toUpperCase()} <span style="color: #d00; margin-left: 5px;">( ${count} ${count > 1 && "items" || "item"} )</span>` : '';
                                }
                            ]);
                            tableReports.addRow([{
                                sn: '',
                                qty: _.sumBy(reformedData, entry => _.toNumber(entry.qty)),
                                xcp: _.sumBy(reformedData, entry => _.toNumber(_.join(_.split(entry.xcp, ','), ''))),
                                xrp: _.sumBy(reformedData, entry => _.toNumber(_.join(_.split(entry.xrp, ','), ''))), 
                                mrp: _.sumBy(reformedData, entry => _.toNumber(_.join(_.split(entry.mrp, ','), '')))
                            }], false); 
                        }
                        
                    }
                    //INVENTORY REPORT
                    else if(Object.values(rptOpts)[0].mainRpt == 3){ 
                        if(Object.values(rptOpts)[0].subRpt == 0){
                            tableReports.setColumns([
                                {formatter: "responsiveCollapse", headerSort: false, width: 10, print: false, },
                                {title: "#", field: "sn", headerMenu, headerSort: false, formatter: "rownum", width: 50},
                                {title: "DESCRIPTION", field: "item", headerMenu, formatter: (cell, formatterParams, onRendered) => { let item = cell.getValue() ? _.toUpper(cell.getValue()) : ""; cell.getData().item = item; return item; }, minWidth: 200},
                                {title: "CATEGORY", field: "cat_name", headerMenu, formatter: (cell, formatterParams, onRendered) => { let cat_name = cell.getValue() ? _.toUpper(cell.getValue()) : ""; cell.getData().cat_name = cat_name; return cat_name; }, minWidth: 200, visible: false },
                                {title: "QTY", field: "qty", headerMenu, headerSort: false, hozAlign: 'right', formatter: "money", formatterParams: { precision: 0 }, bottomCalc: (values, data, bottomCalcParams) => _.sumBy(values, entry => _.toNumber(_.join(_.split(entry, ','), ''))) },
                                {title: "UNIT COST", field: "", headerMenu, hozAlign: 'right', columns: [
                                    {title: "PRICE", field: "cp", hozAlign: 'right', formatter: "money" },
                                    {title: "EXT.", field: "xcp", hozAlign: 'right', formatter: "money", bottomCalc: (values, data, bottomCalc) => thousandsSeperator(_.sumBy(values, entry => _.toNumber(entry))), width: 100},
                                ]},
                                {title: "PPQ", field: "ppq", visible: false, print: false, download: false },
                                {title: "WHOLESALE VALUE", field: "", hozAlign: 'right', columns: [
                                    // {title: "QTY", field: "wp_qty", hozAlign: 'right', formatter: (cell, formatterParams, onRendered) => { let wp_qty = ItemModel.wp_qty({item: cell.getData()}); cell.getData().wp_qty = wp_qty; return wp_qty; }, print: true, download: true },
                                    {title: "PRICE", field: "wp", hozAlign: 'right', formatter: "money", width: 70, print: true, download: true },
                                    {title: "AMOUNT", field: "xwp", hozAlign: 'right', formatter: "money", bottomCalc: (values, data, bottomCalc) => thousandsSeperator(_.sumBy(values, entry => _.isNaN(_.toNumber(entry)) ? 0 : _.toNumber(entry))), width: 70, print: true, download: true },
                                    {title: "MARGIN", field: "mwp", hozAlign: 'right', formatter: "money", bottomCalc: (values, data, bottomCalc) => thousandsSeperator(_.sumBy(values, entry => _.toNumber(entry))), width: 75, print: true, download: true }
                                ]},
                                {title: "RETAIL VALUE", field: "", hozAlign: 'right', columns: [
                                    {title: "PRICE", field: "rp", hozAlign: 'right', formatter: "money", width: 70, print: true, download: true },
                                    {title: "AMOUNT", field: "xrp", hozAlign: 'right', formatter: "money", bottomCalc: (values, data, bottomCalc) => thousandsSeperator(_.sumBy(values, entry => _.toNumber(entry))), width: 80, print: true, download: true },
                                    {title: "MARGIN", field: "mrp", hozAlign: 'right', formatter: "money", bottomCalc: (values, data, bottomCalc) => thousandsSeperator(_.sumBy(values, entry => _.toNumber(entry))), width: 75, print: true, download: true }
                                ]},
                                // {title: "PRICING", field: "", headerMenu, hozAlign: 'right', formatter: (cell, formatterParams, onRendered) => {
                                //     let { cp, xcp, qty, ppq } = cell.getData(), priceModels;
                                //     if(!_.isUndefined(ppq) && _.size(JSON.parse(ppq)) > 0){
                                //         priceModels = `
                                //                 <table style="width: 100%; border: solid 1px #000; border-collapse:collapse;">
                                //                     <thead>
                                //                         <tr>
                                //                             <th style="text-align: left; border: solid 1px #ccc; padding: 2px 5px;">LABEL</th>
                                //                             <th style="border: solid 1px #ccc; padding: 2px 5px;">QTY</th>
                                //                             <th style="border: solid 1px #ccc; padding: 2px 5px;">RATE</th>
                                //                             <th style="border: solid 1px #ccc; padding: 2px 5px;">AMT</th>
                                //                             <th style="border: solid 1px #ccc; padding: 2px 5px;">MARGIN</th>
                                //                         </tr>
                                //                     </thead>
                                //                     <tbody>
                                //         `;
                    
                                //         let min_ppq = _.minBy(JSON.parse(ppq), entry => _.toNumber(entry.qty)),
                                //             max_ppq = _.maxBy(JSON.parse(ppq), entry => _.toNumber(entry.qty));
                                            
                                //             _.forEach(JSON.parse(ppq), (entry, i) => {
                                //                 let { lbl: ppq_lbl, qty: ppq_qty, rate: ppq_rate } = entry;
                                //                 priceModels += `
                                //                             <tr>
                                //                                 <td style="text-align: left; border: solid 1px #ccc; padding: 2px 5px;">${_.startCase(ppq_lbl)}</td>
                                //                                 <td style="border: solid 1px #ccc; padding: 2px 5px;">${ppq_qty}</td>
                                //                                 <td style="border: solid 1px #ccc; padding: 2px 5px;">${thousandsSeperator(_.toNumber(ppq_rate))}</td>
                                //                                 <td style="border: solid 1px #ccc; padding: 2px 5px;" hidden>${(ppq_qty == min_ppq.qty) ? ItemModel.xrp({item: cell.getData()}) : (ppq_qty == max_ppq.qty) ? ItemModel.xwp({item: cell.getData()}) : thousandsSeperator((ppq_rate/ppq_qty)*qty)}</td>
                                //                                 <td style="border: solid 1px #ccc; padding: 2px 5px;">${(ppq_qty == max_ppq.qty) ? ItemModel.xwp({item: cell.getData()}) : ItemModel.xrp({item: cell.getData()})}</td>
                                //                                 <td style="border: solid 1px #ccc; padding: 2px 5px;">${(ppq_qty == min_ppq.qty) ? ItemModel.mrp({item: cell.getData()}) : (ppq_qty == max_ppq.qty) ? ItemModel.mwp({item: cell.getData()}) : thousandsSeperator(((ppq_qty/ppq_rate)*qty) - xcp)}</td>
                                //                                 <td style="border: solid 1px #ccc; padding: 2px 5px;" hidden>${(ppq_qty == max_ppq.qty) ? ItemModel.mwp({item: cell.getData()}) : ItemModel.mrp({item: cell.getData()})}</td>
                                //                             </tr>                                    
                                //                 `;
                                //             });
                                //         priceModels += `</tbody>
                                //         </table>`;
                                //     }
                                //     return priceModels;
                                // }, width: 290, responsive: 0 },
                                // {title: "EXPIRY", field: "expdate", formatter: (cell, formatterParams, onRendered) => { let expdate = !_.isNull(cell.getValue()) ? cell.getValue() : ''; cell.getData().expdate = expdate; return expdate; }, width: 80 },
                                {title: "ACTIVE", field: "active", width: 80, visible: false },
                            ]);
                            tableReports.setGroupBy("cat_id");
                            tableReports.setSort([
                                {column: "item", dir: "asc"},
                                {column: "cat_name", dir: "asc"}
                            ]);
                            tableReports.setGroupHeader([
                                (value, count, data) => {
                                    let matched = _.find(data, entry => entry.cat_id == value);
                                    console.log(matched)
                                    return value && !_.isUndefined(matched) ? _.toUpper(matched.cat_name) + `<span style='color:#d00; margin-left:10px;'>(${count} ${count > 1 ? 'items' : 'item'})</span>` : '<span style="background: #000; color: lime;">TOTAL AMOUNT</span>';
                                }
                            ]);
                            // tableReports.setGroupHeaderDownload([
                            //     (value, count, data, group) => {
                            //         let matched = !_.isUndefined(value) && _.find(data, entry => entry.cat_id == value);
                            //         return value ? _.toUpper(matched.cat_name) : '';
                            // }]);
                            let tableReportsData = _.map(resp.data, (entry, i) => {
                                entry.item = _.toUpper(entry.item);
                                entry.xcp = _.toNumber(ItemModel.xcp({item: entry}))
                                entry.wp = _.toNumber(ItemModel.wp({item: entry})) || ''
                                entry.wp_qty = _.toNumber(ItemModel.xwp({item: entry})) || ''
                                entry.xwp = _.toNumber(ItemModel.xwp({item: entry})) || ''
                                entry.mwp = _.toNumber(ItemModel.mwp({item: entry})) || ''
                                entry.rp = _.toNumber(ItemModel.rp({item: entry}))
                                entry.xrp = _.toNumber(ItemModel.xrp({item: entry}))
                                entry.mrp = _.toNumber(ItemModel.mrp({item: entry}))
                                entry.restock = entry.restock > 0 ? entry.restock : '';
                                entry.expdate = entry.expdate ? moment(entry.expdate).format('MMM DD, YYYY') : '';
                                return entry;
                            });
                            tableReports.setData(tableReportsData)        
                            .then(() => {
                                tableReports.addRow([{
                                    sn: '',
                                    qty: _.sumBy(tableReportsData, entry => _.toNumber(entry.qty)),
                                    xcp: _.sumBy(tableReportsData, entry => _.toNumber(_.join(_.split(entry.xcp, ','), ''))), 
                                    xwp: _.sumBy(tableReportsData, entry => _.toNumber(_.join(_.split(entry.xwp, ','), ''))), 
                                    mwp: _.sumBy(tableReportsData, entry => _.toNumber(_.join(_.split(entry.mwp, ','), ''))), 
                                    xrp: _.sumBy(tableReportsData, entry => _.toNumber(_.join(_.split(entry.xrp, ','), ''))), 
                                    mrp: _.sumBy(tableReportsData, entry => _.toNumber(_.join(_.split(entry.mrp, ','), '')))
                                }], false);            
                            });
                        }
                        else if(Object.values(rptOpts)[0].subRpt == 1){
                            tableReports.setColumns([
                                {title: "S/N", field: "", formatter: "rownum" || "", headerSort: false, hozAlign: "center", width: 30},
                                {title: "DESCRIPTION", field: "item", formatter: (cell, formatterParams, onRendered) => cell.getValue() && `${_.toUpper(cell.getValue())}` || ""},
                                {title: "QUANTITIES", field: "", headerSort: false, headerHozAlign: "center", formatter: "money", formatterParams: { precision: 0 },
                                columns: [
                                    {title: "ORDERED", field: "ORDERED", headerSort: false, headerHozAlign: "center", hozAlign: 'right', formatter: "money", formatterParams: { precision: 0 }},
                                    {title: "SOLD", field: "SOLD", headerSort: false, headerHozAlign: "center", hozAlign: 'right', formatter: "money", formatterParams: { precision: 0 }},
                                    {title: "REMAINED", field: "REMAINING", headerSort: false, headerHozAlign: "center", hozAlign: 'right', formatter: "money", formatterParams: { precision: 0 }}
                                ]},
                                // {title: "COST", field: "cp", editor: "input", hozAlign: 'right', formatter: "money", formatterParams: {}, validator: ["required", "min: 0", "numeric"], width: 80},     
                                // {title: "WHOLE", field: "wp", editor: "input", hozAlign: 'right', formatter: "money", formatterParams: {}, validator: ["min: 0", "numeric"], width: 80},     
                                // {title: "RATE", field: "rp", editor: "input", hozAlign: 'right', formatter: "money", formatterParams: {}, validator: ["required", "min: 0", "numeric"], width: 80},        
                                // {title: "EXPIRY", field: "expdate", headerSort: false, width: 80}
                            ]);
                            var data = [];
                            var getDaysArray = function(s, e) {
                                for(var a = [], d = new Date(s); d<=e; d.setDate(d.getDate()+1)){ 
                                    a.push(new Date(d));
                                }
                                return a;
                            };
                            var daylist = getDaysArray(new Date($("#date_from").val()), new Date($("#date_to").val()));
                            // console.log(daylist.map((v)=>v.toISOString().slice(0,10)).join(""))
                            daylist.map((v) => {
                                v.toISOString().slice(0,10)
                                console.log(v.toISOString().slice(0,10))
                                data.push({regdate: v.toISOString().slice(0,10), prod_id: "1", item: "2 LUVS LARGE 24X55g", REMAINING: "357", SOLD: "5", ORDERED: "9"});
                            });

                            // console.log($("#date_from").val(), $("#date_to").val());
                            tableReports.setData(_.reverse(data));
                            tableReports.setSort([{column: "regdate", dir: "desc"}]);
                            tableReports.setGroupBy(["regdate"]);
                            // tableReports.setGroupHeader([
                            //     (value, count, data) => {
                            //         return value && value.toUpperCase() + `<span style='color:#d00; margin-left:10px;'>(${count} ${count > 1 ? 'items' : 'item'})</span>`;
                            //     }
                            // ]);
                        }
                        else if(Object.values(rptOpts)[0].subRpt == 2){
                            tableReports.setColumns([
                                {title: "S/N", field: "", headerMenu, formatter: "rownum" || "", headerSort: false, hozAlign: "center", width: 30},
                                {title: "DESCRIPTION", field: "item", headerMenu, formatter: (cell, formatterParams, onRendered) => cell.getValue() && _.toUpper(cell.getValue()) || ""},
                                {title: "QTY", field: "qty", headerMenu, formatter: "money", formatterParams: { precision: 0 }, hozAlign: "right", width: 70},
                                {title: "RESTOCK", field: "restock", headerMenu, formatter: "money", formatterParams: { precision: 0 }, hozAlign: "right", width: 70},
                            ]);
                            tableReports.setData(resp.data);
                        }
                        else if(Object.values(rptOpts)[0].subRpt == 3){
                            tableReports.setColumns([
                                {title: "S/N", field: "", headerMenu, formatter: "rownum" || "", headerSort: false, hozAlign: "center", width: 30},
                                {title: "DESCRIPTION", field: "item", headerMenu, formatter: (cell, formatterParams, onRendered) => cell.getValue() && _.toUpper(cell.getValue()) || ""},
                                {title: "QTY", field: "qty", headerMenu, formatter: "money", formatterParams: { precision: 0 }, hozAlign: "right", width: 70},
                            ]);
                            tableReports.setData(resp.data);
                        }
                    }
                    // SALES REPORT
                    else if(Object.values(rptOpts)[0].mainRpt == 4){
                        if(Object.values(rptOpts)[0].subRpt == 0){
                            tableReports.setColumns([
                                {title: "S/N", field: "sn", headerMenu, formatter: "rownum", headerSort: false, hozAlign: "center", width: 30},
                                {title: "REG DATE", field: "regdate", headerMenu, hozAlign: "center", width: 100, visible: false},
                                {title: "TRANS DATE", field: "TRANS_DATE", headerMenu, hozAlign: "center", width: 100, visible: false},
                                {title: "TELLER", field: "fullname", headerMenu, formatter: (cell, formatterParams, onRendered) => cell.getValue() && _.toUpper(cell.getValue()) || "", minWidth: 200 },
                                {title: "CASH", field: "CASH_TILL", headerMenu, formatter: (cell, formatterParams, onRendered) => cell.getValue() && thousandsSeperator(parseFloat(cell.getValue())) || thousandsSeperator(0.00), bottomCalc: (values, data, calcParams) => thousandsSeperator(_.sumBy(values, sum => parseFloat(sum || thousandsSeperator(0)))), bottomCalcParams: {precision: 2}, hozAlign: "right", minWidth: 100 },
                                {title: "MOMO", field: "MOMO_TILL", headerMenu, formatter: (cell, formatterParams, onRendered) => cell.getValue() && thousandsSeperator(parseFloat(cell.getValue())) || thousandsSeperator(0.00), bottomCalc: (values, data, calcParams) => thousandsSeperator(_.sumBy(values, sum => parseFloat(sum || thousandsSeperator(0)))), bottomCalcParams: {precision: 2}, accessorPrint: (value, data, type, params, column, row) => value && value.split(',').join('') || "", hozAlign: "right", minWidth: 100 },
                                {title: "POS", field: "POS_TILL", headerMenu, formatter: (cell, formatterParams, onRendered) => cell.getValue() && thousandsSeperator(parseFloat(cell.getValue())) || thousandsSeperator(0.00), bottomCalc: (values, data, calcParams) => thousandsSeperator(_.sumBy(values, sum => parseFloat(sum || thousandsSeperator(0)))), bottomCalcParams: {precision: 2}, accessorPrint: (value, data, type, params, column, row) => value && value.split(',').join('') || "", hozAlign: "right", minWidth: 100 },
                                {title: "CREDIT", field: "CREDIT_TILL", headerMenu, formatter: (cell, formatterParams, onRendered) => cell.getValue() && thousandsSeperator(parseFloat(cell.getValue())) || thousandsSeperator(0.00), bottomCalc: (values, data, calcParams) => thousandsSeperator(_.sumBy(values, sum => parseFloat(sum || thousandsSeperator(0)))), bottomCalcParams: {precision: 2}, accessorPrint: (value, data, type, params, column, row) => value && value.split(',').join('') || "", hozAlign: "right", minWidth: 100 },
                                {title: "VAT", field: "VAT_TILL", headerMenu, formatter: (cell, formatterParams, onRendered) => cell.getValue() && thousandsSeperator(parseFloat(cell.getValue())) || thousandsSeperator(0.00), bottomCalc: (values, data, calcParams) => thousandsSeperator(_.sumBy(values, sum => parseFloat(sum || thousandsSeperator(0)))), bottomCalcParams: {precision: 2}, accessorPrint: (value, data, type, params, column, row) => value && value.split(',').join('') || "", hozAlign: "right", minWidth: 100 },
                                {title: "DISCOUNT", field: "DISCOUNT_TILL", headerMenu, formatter: (cell, formatterParams, onRendered) => cell.getValue() && thousandsSeperator(parseFloat(cell.getValue())) || thousandsSeperator(0.00), bottomCalc: (values, data, calcParams) => thousandsSeperator(_.sumBy(values, sum => parseFloat(sum || thousandsSeperator(0)))), bottomCalcParams: {precision: 2}, accessorPrint: (value, data, type, params, column, row) => value && value.split(',').join('') || "", hozAlign: "right", minWidth: 100 },
                                {title: "TILL", field: "TOTAL_TILL", headerMenu, formatter: "money", bottomCalc: (values, data, calcParams) => thousandsSeperator(_.sumBy(values, entry => parseFloat(entry))) || thousandsSeperator(0.00), bottomCalcParams: {precision: 2}, hozAlign: "right", minWidth: 100, responsive: 0 },
                            ]);
                            tableReports.setData(resp.data);
                            tableReports.setSort([{column: "regdate", dir: "desc"}]);
                            tableReports.setGroupBy(["TRANS_DATE"]);
                            tableReports.setGroupHeader([
                                (value, count, data) => `${value !== undefined ? `${ $("[name='groupBy'] option:selected").val() == 'weekly' ? `${moment().week(value).format("wo")} Week : ${moment().week(value).startOf('isoWeek').format("ddd ll")} - ${moment().week(value).endOf('isoWeek').add(1, 'd').format("ddd ll")}` : value}<span>(${_.size(data) > 1 ? `${_.size(data)} Tellers` : `${_.size(data)} Teller`})</span>` : '<span style="background: #000; color: lime;">TOTAL AMOUNT</span>'}`
                            ]);
                            tableReports.addRow([{
                                sn: '',
                                CASH_TILL: _.sumBy(tableReports.getData(), entry => parseFloat(entry['CASH_TILL'] || 0)), 
                                MOMO_TILL: _.sumBy(tableReports.getData(), entry => parseFloat(entry['MOMO_TILL'] || 0)), 
                                POS_TILL: _.sumBy(tableReports.getData(), entry => parseFloat(entry['POS_TILL'] || 0)), 
                                CREDIT_TILL: _.sumBy(tableReports.getData(), entry => parseFloat(entry['CREDIT_TILL'] || 0)), 
                                VAT_TILL: _.sumBy(tableReports.getData(), entry => parseFloat(entry['VAT_TILL'] || 0)), 
                                DISCOUNT_TILL: _.sumBy(tableReports.getData(), entry => parseFloat(entry['DISCOUNT_TILL'] || 0)), 
                                TOTAL_TILL: _.sumBy(tableReports.getData(), entry => parseFloat(entry['TOTAL_TILL'] || 0))
                            }], false);
                            // console.log(tableReports.options);
                        }
                        else if(Object.values(rptOpts)[0].subRpt == 1){
                            tableReports.setColumns([
                                {title: "", field: "", headerMenu, formatter: "rownum" || "", headerSort: false, hozAlign: "center", width: 30},
                                {title: "DATE", field: "TRANS_DATE", headerMenu, hozAlign: "center", width: 100, visible: false},
                                {title: "", field: "prod_id", headerMenu, visible: false },
                                {title: "TRANS_ID", field: "strans_id", headerMenu, formatter: (cell, formatterParams, onRendered) => !_.isUndefined(cell.getData()?.receiptPref) && JSON.parse(cell.getData()?.receiptPref)?.code?.prefix + moment(cell.getData()?.regdate).format("YYMMDD") + cell.getValue(), visible: false },
                                {title: "TELLER", field: "fullname", headerMenu, visible: false },
                                {title: "PAY_TYPE", field: "PAY_TYPE", headerMenu, visible: false },
                                {title: "CUSTOMER NAME", field: "cat_name", headerMenu, formatter: (cell, formatterParams, onRendered) => cell.getValue() && _.toUpper(cell.getValue()) || "", minWidth: 100, visible: false },
                                {title: "DESCRIPTION", field: "item", headerMenu, formatter: (cell, formatterParams, onRendered) => cell.getValue() && `${cell.getData().dim > 1 && cell.getValue().toUpperCase() + ' X ' + cell.getData().dim || cell.getValue().toUpperCase()}` || "", },
                                {title: "DIM", field: "dim", headerMenu, hozAlign: "right", width: 55, visible: false, },
                                {title: "UNIT", field: "um", headerMenu, hozAlign: "right", width: 55, visible: false, },
                                {title: "P.LBL", field: "priceLabel", headerMenu, hozAlign: "right", width: 55, visible: false, },
                                {title: "QTY", field: "qty", headerMenu, hozAlign: "right", formatter: (cell, formatterParams, onRendered) => (cell.getValue() && cell.getData().priceLabel) && QIHRF(cell.getValue(), cell.getData().priceLabel, cell.getData().dim), width: 55 },
                                {title: "RATE", field: "sp", headerMenu, formatter: "money", hozAlign: "right", width: 55 },
                                {title: "EXT", field: "EXT_AMT", headerMenu, bottomCalc: (values, data, calcParams) => thousandsSeperator(_.sumBy(values, entry => parseFloat(entry || thousandsSeperator(0.00)))), bottomCalcParams: {precision: 2}, hozAlign: "right", width: 60 }
                            ]);
                            tableReports.setData(resp.data);
                            tableReports.setSort([{column: "strans_id", dir: "desc"}]);
                            tableReports.setGroupBy(["TRANS_DATE", "emp_id", "strans_id"]);
                            tableReports.setGroupHeader([
                                (value, count, data) => {                                    
                                    let numTellers = _.size(_.filter(_.uniqBy(resp.data, 'emp_id'), entry => entry.TRANS_DATE == value)),
                                        numInvoices = _.size(_.filter(_.uniqBy(resp.data, 'strans_id'), entry => entry.TRANS_DATE == value));
                                    return value ? moment(value).format('ddd, LL') + `<span style='color:#d00; margin: 0 10px;'> - &nbsp;&nbsp; ${numTellers + (numTellers > 1 ? ' Tellers' : ' Teller')}</span> | <span>${numInvoices + (numInvoices > 1 ? ' Invoices' : ' Invoice')}</span> &nbsp;&nbsp;| <span>${count + (count > 1 ? ' Items' : ' Item')}</span>` : '<span style="background: #000; color: lime;">TOTAL AMOUNT</span>';
                                },
                                (value, count, data) => {
                                    let matched = _.find(resp.data, entry2 => entry2.emp_id == value),    
                                        numInvoices = _.size(_.filter(_.uniqBy(resp.data, 'strans_id'), entry => entry.emp_id == value)),
                                        tellerTill = _.sum(_.map(_.uniqBy(resp.data, 'strans_id'), entry => _.sumBy(resp.data, entry2 => (entry2.strans_id == entry.strans_id && entry2.emp_id == value) ? _.toNumber(entry2.EXT_AMT) : 0))),
                                        vat_amount = _.sumBy(_.uniqBy(resp.data, 'strans_id'), entry => (entry.emp_id == value) && _.toNumber(JSON.parse(entry.vat_discount).vat.amount || 0)),
                                        discount_amount = _.sumBy(_.uniqBy(resp.data, 'strans_id'), entry => (entry.emp_id == value) && _.toNumber(JSON.parse(entry.vat_discount).discount.amount || 0));
                                    return value ? _.toUpper(matched?.fullname) + `<span style='color:#d00; margin-left:10px;'> - &nbsp;&nbsp; ${numInvoices + (numInvoices > 1 ? ' Invoices' : ' Invoice')}</span> = ${thousandsSeperator(tellerTill)}&nbsp;&nbsp; | &nbsp;<span style="color: maroon;">VAT = ${thousandsSeperator(vat_amount)}</span>&nbsp; | &nbsp;<span style="color: teal;">Discount = ${thousandsSeperator(discount_amount)}</span>` : '';
                                },
                                (value, count, data) => {
                                    let matched = _.find(resp.data, entry2 => entry2.strans_id == value),
                                        { vat, discount } = !_.isUndefined(matched) && JSON.parse(matched.vat_discount);
                                        // return matched ? `${JSON.parse(matched?.receiptPref)?.code?.prefix + moment(matched?.regdate).format("YYMMDD") + value} @ <span style="color: blue;">${moment(matched?.regdate).format("LTS")}</span>
                                        return matched ? `${value} @ <span style="color: blue;">${moment(matched?.regdate).format("LTS")}</span>
                                                        &nbsp;&nbsp; => <span style='color: #d00; margin-left:10px;'>(${count + (count > 1 ? ' Items' : ' Item')})</span>
                                                        <span style='color: purple; margin-left:10px;'>${_.toUpper(matched?.cust_name)}</span>
                                                        &nbsp;&nbsp; | <span style='color: teal;'>${matched?.PAY_TYPE}</span><span style="">VAT: ${thousandsSeperator(_.toNumber(vat.amount))}</span> &nbsp;&nbsp;| <span style="color: green;">Discount: ${thousandsSeperator(_.toNumber(discount.amount))}</span>
                                                        <div style="display: flex; justify-content: space-between; align-items: center; margin: 5px 0 0 20px;">
                                                            <p style="margin: 0;">
                                                                <section>Paid:<span>${thousandsSeperator(_.toNumber(matched?.received))}</span></section>
                                                                &nbsp;|&nbsp;
                                                                <section>Balance:<span>${thousandsSeperator(matched?.balance)}</span></section>
                                                            </p>
                                                            <p style="margin: 0;">
                                                                <button type="button" class="btn-default btn-sm" id="btnReprintInvoice" data-invoice-id="${value}" data-invoice-details='${JSON.stringify(data)}' title="Reprint Invoice\n${value}"><i class="fa fa-print"></i> </button>
                                                                <button type="button" class="btn-wheat btn-sm" id="btnReturnInvoice" data-invoice-id="${value}" data-invoice-details='${JSON.stringify(data)}' title="Return Invoice\n${value}"><i class="fa fa-reply"></i> </button>
                                                            </p>
                                                        </div>
                                                ` 
                                                 : ''
                                    ;
                                } 
                            ]);
                            tableReports.addRow([{
                                sn: '',
                                EXT_AMT: thousandsSeperator(_.sumBy(tableReports.getData(), entry => parseFloat(entry['EXT_AMT'] || 0)))
                            }], false);
                        }
                        else if(Object.values(rptOpts)[0].subRpt == 2){
                            tableReports.setColumns([
                                {title: "S/N", field: "sn", headerMenu, formatter: "rownum" || "", headerSort: false, hozAlign: "center", width: 30},
                                {title: "DATE", field: "TRANS_DATE", headerMenu, hozAlign: "center", width: 100, visible: false},
                                {title: "DESCRIPTION", field: "item", headerMenu, formatter: (cell, formatterParams, onRendered) => cell.getValue() && _.toUpper(cell.getValue()) || "", minWidth: 100},
                                {title: "QTY", field: "QTY_SOLD", headerMenu, formatter: "money", formatterParams: {precision:false}, bottomCalc: (values, data, calcParams) => _.sumBy(values, sum => parseInt(sum || thousandsSeperator(0))), hozAlign: "right", width: 65},
                                {title: "RATE", field: "sp", headerMenu, formatter: "money", hozAlign: "right", width: 70},
                                {title: "EXT", field: "EXT_AMT", headerMenu, bottomCalc: (values, data, calcParams) => thousandsSeperator(_.sumBy(values, sum => parseFloat(sum || thousandsSeperator(0)))), bottomCalcParams: {precision: 2}, hozAlign: "right", width: 80},
                            ]);
                            tableReports.setData(resp.data);
                            tableReports.setSort([{column: "QTY_SOLD", dir: "desc"}]);                        
                        }
                        else if(Object.values(rptOpts)[0].subRpt == 3){ 
                             tableReports.setColumns([
                                {title: "S/N", field: "", headerMenu, formatter: "rownum", headerSort: false, hozAlign: "center", width: 30},
                                {title: "DATE", field: "TRANS_DATE", headerMenu, hozAlign: "center", width: 100, visible: false},
                                {title: "DESCRIPTION", field: "item", headerMenu, formatter: (cell, formatterParams, onRendered) => cell.getValue() && `${_.toUpper(cell.getValue()) + (cell.getData()['dim'] > 1 ? ` X ${cell.getData()['dim']}` : '')}` || ""},
                                {title: "QTY", field: "QTY", headerMenu, hozAlign: "right", width: 55},
                                {title: "UNIT COST", field: "cp", headerMenu, formatter: "money", hozAlign: "right"},
                                {title: "RATE", field: "sp", headerMenu, formatter: "money", hozAlign: "right"},
                                {title: "COGS", field: "COGS", headerMenu, formatter: "money", hozAlign: "right", bottomCalc: 'sum', bottomCalcParams: { precision: 2 } },
                                {title: "REVENUE", field: "REVENUE", headerMenu, formatter: "money", hozAlign: "right",  bottomCalc: 'sum', bottomCalcParams: { precision: 2 } },
                                {title: "GROSS MARKUP", field: "PROFIT", headerMenu, formatter: "money", formatterParams: { precision: 2 }, bottomCalc: 'sum', bottomCalcParams: { precision: 2 }, hozAlign: "right"}
                            ]);
                            tableReports.setData(resp.data);
                            tableReports.setSort([{column: "TRANS_DATE", dir: "desc"}]);
                            tableReports.setGroupBy(["TRANS_DATE"]);  
                            tableReports.setGroupHeader([
                                (value, count, data) => {
                                    return `<span>${value !== undefined && moment(value).format('dddd, MMMM DD YYYY') || "TOTAL AMOUNT"}</span>`
                                },
                                (value, count, data) => ""
                            ]);
                            tableReports.addRow({
                                COGS: _.sumBy(resp.data, entry => parseFloat(entry['COGS']) || 0),
                                REVENUE: _.sumBy(resp.data, entry => parseFloat(entry['REVENUE']) || 0),
                                PROFIT: _.sumBy(resp.data, entry => parseFloat(entry['PROFIT']) || 0)
                            });
                            console.log(resp)
                        }
                        else if(Object.values(rptOpts)[0].subRpt == 4){
                            tableReports.clearData();
                            tableReports.setColumns([
                                {title: "S/N", field: "", headerMenu, formatter: "rownum", headerSort: false, hozAlign: "center", width: 30},
                                {title: "DATE", field: "TRANS_DATE", headerMenu, hozAlign: "center", width: 100, visible: false },
                                {title: "TIME", field: "TRANS_TIME", headerMenu, hozAlign: "center", width: 50 },
                                // {title: "PAYMENT", field: "cat_name", hozAlign: "center", width: 100},
                                {title: "DESCRIPTION", field: "item", headerMenu, formatter: (cell, formatterParams, onRendered) => cell.getValue() && _.toUpper(cell.getValue()) || "", minWidth: 100},
                                {title: "QTY", field: "qty", headerMenu, formatter: "money", formatterParams: {precision:false}, bottomCalc: (values, data, calcParams) => _.sumBy(values, sum => parseInt(sum || thousandsSeperator(0))), hozAlign: "right", width: 65},
                                {title: "RATE", field: "sp", headerMenu, formatter: "money", hozAlign: "right", width: 70},
                                {title: "EXT", field: "EXT_AMT", headerMenu, bottomCalc: (values, data, calcParams) => thousandsSeperator(_.sumBy(values, sum => parseFloat(sum || thousandsSeperator(0)))), bottomCalcParams: {precision: 2}, hozAlign: "right", width: 80}
                            ]);
                            tableReports.setData(resp.data);
                            tableReports.setSort([{column: "TRANS_DATE", dir: "desc"}]);
                            tableReports.setGroupBy(["TRANS_DATE", "emp_id", "strans_id"]);  
                            tableReports.setGroupHeader([
                                (value, count, data) => {                                    
                                    let numTellers = _.size(_.filter(_.uniqBy(resp.data, 'emp_id'), entry => entry.TRANS_DATE == value)),
                                        numInvoices = _.size(_.filter(_.uniqBy(resp.data, 'strans_id'), entry => entry.TRANS_DATE == value));
                                    return value ? moment(value).format('ddd, LL') + `<span style='color:#d00; margin: 0 10px;'> - &nbsp;&nbsp; ${numTellers + (numTellers > 1 ? ' Tellers' : ' Teller')}</span> | <span>${numInvoices + (numInvoices > 1 ? ' Invoices' : ' Invoice')}</span> &nbsp;&nbsp;| <span>${count + (count > 1 ? ' Items' : ' Item')}</span>` : '<span style="background: #000; color: lime;">TOTAL AMOUNT</span>';
                                },
                                (value, count, data) => {
                                    let matched = _.find(resp.data, entry2 => entry2.emp_id == value),    
                                        numInvoices = _.size(_.filter(_.uniqBy(resp.data, 'strans_id'), entry => entry.emp_id == value)),
                                        tellerTill = _.sumBy(_.uniqBy(resp.data, 'strans_id'), entry => (entry.emp_id == value) && _.toNumber(entry.EXT_AMT));
                                        console.log(matched?.fullname)
                                        // return '<span></span>';
                                        return value ? _.toUpper(matched?.fullname) + `<span style='color:#d00; margin-left:10px;'> - &nbsp;&nbsp; ${numInvoices + (numInvoices > 1 ? ' Invoices' : ' Invoice')}</span> = ${thousandsSeperator(tellerTill)}</span>` : '';
                                },
                                (value, count, data) => {
                                    let matched = _.find(resp.data, entry2 => entry2.strans_id == value);
                                    // return '<span></span>';
                                    // return `${value && `${value} <span style="color: #d00; margin-left: 5px; font-size: 14px;">(${count}${count > 1 && " Items" || " Item"})</span>` || ""}`
                                    return matched ? `${JSON.parse(matched?.receiptPref)?.code?.prefix + moment(matched?.regdate).format("YYMMDD") + value}` : '';                                    
                                }
                            ]);
                            // tableReports.footerElement = "<button>Custom Button</button>",
                            tableReports.addRow([{
                                sn: '',
                                qty: _.sumBy(tableReports.getData(), entry => parseFloat(entry['qty'] || 0)),
                                EXT_AMT: thousandsSeperator(_.sumBy(tableReports.getData(), entry => parseFloat(entry['EXT_AMT'] || 0)))
                            }], false);                    
                        }
                    }
                    // FINANCE REPORT
                    else if(Object.values(rptOpts)[0].mainRpt == 5){
                        
                    }  
                    // STAFF REPORT
                    else if(Object.values(rptOpts)[0].mainRpt == 6){
                        if(Object.values(rptOpts)[0].subRpt == 0){
                            tableReports.setColumns([
                                {title: "S/N", field: "", headerMenu, formatter: "rownum", headerSort: false, hozAlign: "center", width: 30},
                                {title: "FULL NAME", field: "fullname", headerMenu, formatter: (cell, formatterParams, onRendered) => cell.getValue() && _.toUpper(cell.getValue()) || "", minWidth: 100},
                                {title: "ROLE", field: "urole", headerMenu, width: 75},
                                {title: "PHONE", field: "phone", headerMenu, width: 100}
                            ]);
                            tableReports.setData(resp.data);   
                            tableReports.setSort([{column: "fullname", dir: "asc"}]);                 
                        } 
                    } 
                    // CUSTOMERS REPORT
                    else if(Object.values(rptOpts)[0].mainRpt == 7){
                        if(Object.values(rptOpts)[0].subRpt == 0){
                            tableReports.setColumns([
                                {title: "S/N", field: "", headerMenu, formatter: "rownum", headerSort: false, hozAlign: "center", width: 30},
                                // {title: "PHOTO", field: "photo", formatter: (cell, formatterParams, onRendered) => `../uploads/customers/${cell.getValue()}`, formatterParams: { width:"100%", height:"50px", urlPrefix: "" }, width: 65},
                                {title: "PHOTO", field: "PHOTO_PATH", headerMenu, formatter: 'image', formatterParams: { width:"100%", height:"50px", urlPrefix: "../uploads/customers/" }, width: 65},
                                {title: "CUSTOMER NAME", field: "cat_name", headerMenu, formatter: (cell, formatterParams, onRendered) => cell.getValue() && _.toUpper(cell.getValue()) || "", minWidth: 100},
                                {title: "TIN", field: "tin", headerMenu, formatter: "money", formatterParams: {precision:false}, hozAlign: "right", width: 65},
                                {title: "CREDIT LIMIT", field: "credit_limit", headerMenu, formatter: "money", hozAlign: "right", width: 70},
                                {title: "PHONE", field: "phone", headerMenu, formatter: (cell, formatterParams, onRendered) => JSON.parse(cell.getData()['addr'])['contactAddr']['cust_phone'], hozAlign: "right", width: 100},
                                {title: "ADDRESS", field: "addr", headerMenu, formatter: (cell, formatterParams, onRendered) => { let { cust_street, cust_city, cust_country } = JSON.parse(cell.getData()['addr'])['locationAddr']; return cust_street + ',' + cust_city + ', ' +  _.find(africanCountries, country => country.id == cust_country)['name']; }, width: 150}
                            ]);
                            tableReports.setData(resp.data);
                            tableReports.setSort([{column: "cat_name", dir: "asc"}]); 
                            tableReports.setGroupBy(["cat_name"]); 
                            tableReports.setGroupHeader([
                                (value, count, data) => `${value && `<span style="color: #d00; margin-left: 10px">${_.startCase(value)} (${count} ${count > 1 && "Persons" || "Person"})</span>`}`
                            ]);
                        }
                        else if(Object.values(rptOpts)[0].subRpt == 1){
                            tableReports.setColumns([
                                {title: "S/N", field: "", headerMenu, formatter: "rownum", headerSort: false, hozAlign: "center", width: 30},
                                {title: "CUSTOMER NAME", field: "cat_name", headerMenu, formatter: (cell, formatterParams, onRendered) => cell.getValue() && _.toUpper(cell.getValue()) || "", visible: false, minWidth: 100},
                                {title: "DESCRIPTION", field: "item", headerMenu, formatter: (cell, formatterParams, onRendered) => cell.getValue() && _.toUpper(cell.getValue()) || "", minWidth: 100},
                                {title:"QTY", field: "qty", headerMenu, formatter: (cell, formatterParams, onRendered) => cell.getValue() && cell.getData()['priceLabel'] && `${((cell.getData()['priceLabel'] == "quarter" || cell.getData()['priceLabel'] == "half") && cell.getData()['priceLabel'].toUpperCase() || cell.getValue())} ` + (cell.getData()['priceLabel'] == "retail" && (cell.getValue() < 2 && "Pc" || "Pcs") || (cell.getValue() < 2 && cell.getData()['um'] || `${cell.getData()['um']}s`)) || cell.getValue(), editor: "input", editable: cell => cell.getData()['priceLabel'] == "retail", hozAlign: "right", width: 55 },
                                {title: "RATE", field: "sp", headerMenu, formatter: "money", hozAlign: "right", width: 70},
                                {title: "EXT", field: "EXT_AMT", headerMenu, bottomCalc: (values, data, calcParams) => thousandsSeperator(_.sumBy(values, sum => parseFloat(sum || 0))), bottomCalcParams: {precision: 2}, hozAlign: "right", width: 80}
                            ]);
                            tableReports.setData(resp.data);
                            tableReports.setSort([{column: "item", dir: "asc"}]); 
                            tableReports.setGroupBy(["TRANS_DATE", "cat_name"]); 
                            tableReports.setGroupHeader([
                                (value, count, data) => `${value && `<span style="color: #d00; margin-left: 10px">${moment(value).format('dllll')}</span>` || '<span style="background: #000; color: lime;">TOTAL AMOUNT</span>'}`,
                                (value, count, data) => `${value && `<span style="color: #d00; margin-left: 10px"><span style="color: #000;">${_.startCase(value)}</span> (${count} ${count > 1 && "Items" || "Item"})</span>` || ''}`
                            ]);
                            tableReports.addRow([{
                                sn: '',
                                qty: _.sumBy(tableReports.getData(), entry => parseFloat(entry['qty'] || 0)),
                                EXT_AMT: thousandsSeperator(_.sumBy(tableReports.getData(), entry => parseFloat(entry['EXT_AMT'] || 0)))
                            }], false); 
                        }
                    } 
                    // tableReports.setData(resp.data);
                    tableReports.options.printHeader = `
                        <div style="font-family: verdana; display: grid; grid-template-columns: auto 1fr auto; justify-content: space-between;">
                            <section><img src='../uploads/${companyProfile[0]['logo']}' alt='${companyProfile[0]['comp_name']} Logo' width='160px' height='150px'></section>
                            <section style="text-align: center;"><h1 style="margin: 10px 0;">${companyProfile[0]['comp_name']}</h1><p style="margin-top: 0">${companyProfile[0]['addr']}</p><p style="margin-top: 0">0${companyProfile[0]['phone']} / 0${companyProfile[0]['mobile']}</p><p style="font-weight: bolder;">${$(`#main_rpt option:eq(${Object.values(rptOpts)[0].mainRpt})`).text().toUpperCase()} ${$(`#sub_rpt option:eq(${Object.values(rptOpts)[0].subRpt})`).text().toUpperCase()} REPORT</p></section>
                            <section><img src='../uploads/${companyProfile[0]['logo']}' alt='${companyProfile[0]['comp_name']} Logo' width='160px' height='150px'></section>
                        </div>
                    `;
                });
            }        
            else{
                $(".tabulator-placeholder").css({'background': '', 'color': '#ccc'}).html(`<div style="margin: 0 auto;"><h2 class="txt-center">No Data Available</h2></div>`);
                myProgressLoader.stop();
            }
        }
    }

    $(document).on('submit', '#frm_gen_rpt', function(){
        try {
            tableReports.clearData();
            controller.abort();
            genReport({rptOpts: {mainRpt: $("#main_rpt").val(), subRpt: $("#sub_rpt").val(), date_from: $("#date_from").val(), date_to: $("#date_to").val(), groupBy: $('[name="groupBy"] option:selected').val(), allTime: $("#allTime").is(":checked")}})
            // .then(() => myProgressLoader.stop())
        } catch (error) {
            console.error(error)
        }
        return false;
    });
    
    $(document).on('change', '[name="groupBy"]', function(e){
        // console.log(e.target.value)
        $('#frm_gen_rpt').trigger('submit');
    });
    
    $(document).on('change', '#allTime', e => {
        e.target.checked ? $('#date_from, #date_to').prop('disabled', true) : $('#date_from, #date_to').prop('disabled', false);
    });

    var filteredResults, tableReports = new Tabulator("#reports-table", {
        // width: '100%',
        height: "calc(100vh - 130px)",
        // minHeight: 311,
        // data: ,           //load row data from array
        layout: "fitColumns",   
        responsiveLayout: "collapse",  //hide columns that dont fit on the table    
        // movableColumns: true,          //show tool tips on cells
        // addRowPos: "top",          //when adding a new row, add it to the top of the table
        history: true,
        selectable: 1,
        columnDefaults: {
            headerTooltip: true,
            vertAlign: "middle"
        },
        // groupHeaderDownload,
        pagination: "local",       //paginate the data
        paginationSize: 100,         //allow 7 rows per page of data
        paginationButtonCount: 2,
        // paginationSizeSelector: true, //enable page size select element and generate list options
        printAsHtml: true, //enable html table printing
        // printFormatter: (tableHolderElement, tableElement) => {
        //     //tableHolderElement - The element that holds the header, footer and table elements
        //     //tableElement - The table
        //     console.log(tableHolderElement, tableElement);
        //     tableElement.innerHTML = `
        //         <div class="txt-center">
        //             <h2>${$("#main_rpt").val()}</h2>
        //             <h3>${$("#sub_rpt").val()}</h3>
        //             <h4>${$("#date_from").val()} - ${$("#date_to").val()}</h4>
        //         </div>  
        //         <div class="txt-center">
        //             <h4>${$("#allTime").is(":checked") ? "All Time" : "Date Range"}</h4>
        //         </div>
        //     `;
        // },
        printStyled: true, //copy Tabulator styling to HTML table
        printRowRange: "all",
        printFooter: `<div style="display: flex; justify-content: space-between; align-items: center;"><p><b>Powered By</b>: MyshopOS v0.7</p><p><b>Visit</b>: www.myshopos.com</p></center>`,
        placeholder: "No Data Available", //display message to user on empty table
    });

    tableReports.on("dataLoading", data => {
        //data - the data loading into the table
        // $("#reports-table").html("<i class='fa fa-spinner fa-spin'></i>");
        // tableReports.options.placeholder.innerHTML = `<center><div class="txt-center"><i class="fa fa-spinner fa-spin fa-3x"></i></div></center>`
        $(".my-tabulator-buttons").addClass('disabled');
        // console.log("loading...");
        $(".tabulator-placeholder").css({'background': '', 'color': '#ccc'}).html(`<div style="margin: 0 auto;"><h2 class="txt-center"><i class="fa fa-spinner fa-spin fa-3x"></i></div>`);
    });

    tableReports.on("dataLoaded", data => {
        //data - all data loaded into the table
        // $("#reports-table").html(data);
        // $(".my-tabulator-buttons").removeClass('disabled');
        data.length > 0 && $("#search_reports").prop("disabled", false);
        // console.log("loaded...", filteredResults.rows.length);
        $(".tabulator-placeholder").css({'background': '', 'color': '#ccc'}).html(`<div style="margin: 0 auto;"><h2 class="txt-center">No Data Available</h2></div>`);
    });

    tableReports.on("dataFiltered", (filters, rows) => {
        filteredResults = {filters, rows};
    });

    // = `<div class="tabulator-placeholder" tabulator-render-mode="virtual" style="width: 0px;"><span>No Data Available</span></div>`

    let series = [], categories = [], options = {
        // series: [
        //     { name: 'PRODUCT A', data: [44, 55, 41, 67, 22, 43] }, 
        //     { name: 'PRODUCT B', data: [13, 23, 20, 8, 13, 27] }, 
        //     { name: 'PRODUCT C', data: [11, 17, 15, 15, 21, 14] }, 
        //     { name: 'PRODUCT D', data: [21, 7, 25, 13, 22, 8] }
        // ],
        series,
        chart: {
            type: 'bar',
            height: 350,
            stacked: true,
            toolbar: { show: true },
            zoom: { enabled: true }
        },
        responsive: [{
            breakpoint: 480,
            options: {
                legend: {
                    position: 'bottom',
                    offsetX: -10,
                    offsetY: 0
                }
            }
        }],
        plotOptions: {
            bar: {
                borderRadius: 8,
                horizontal: false,
            },
        },
        title: {
            // text: 'CandleStick Chart - Category X-axis',
            // text: `${$("#main_rpt").val()} REPORT`,
            align: 'left'
        },
        xaxis: {
            type: 'datetime',
            // categories: ['01/01/2011 GMT', '01/02/2011 GMT', '01/03/2011 GMT', '01/04/2011 GMT',
            //   '01/05/2011 GMT', '01/06/2011 GMT'
            // ],
            categories
        },
        yaxis: {
            labels: {
                // formatter: function (value) {
                //   return `${thousandsSeperator(value)}`;
                // }
            },
        },
        legend: {
            position: 'right',
            offsetY: 40
        },
        fill: {
            opacity: 1
        }
    };

    // var rpt_chart = new ApexCharts(document.querySelector("#chart-container"), options);
    // rpt_chart.render();

    $("#main_rpt").val('');
    $(".bottomTabs .tabs a").on('click', e => {
        // if(filteredResults.rows.length > 0){
        if($("#main_rpt").val() != ""){
            $(".overlay").removeClass('open');
            if($(e.target).closest('a').hasClass('active')){
                $(e.target).closest('a').removeClass('active');
                $(".notifyjs-print-table-data-base").closest('.notifyjs-wrapper').remove();
            }
            else{
                $(".bottomTabs .tabs a").removeClass('active').not($(e.target).closest('a').addClass('active'));
                if($(e.target).closest('a').attr('id') == "search_overlay"){
                    if(filteredResults.rows.length > 0){
                        $(".overlay#search").toggleClass('open');
                        $("section#helper-block").html('');
                        $('#search_reports').val('').focus();
                    }
                    else{
                        $(e.target).closest('a').removeClass('active');
                        alertify.error("There are no results to search.");
                    }
                }
                else if($(e.target).closest('a').attr('id') == "date_overlay"){
                    // tableReports.print("", true);
                    $(".overlay#date_overlay").toggleClass('open');
                }
                else if($(e.target).closest('a').attr('id') == "exportToExcel_overlay"){
                    if(filteredResults.rows.length > 0){
                        notif.show({
                            el: $(e.target).closest('a#exportToExcel_overlay'),
                            title: `<ul id="overlay_moreOpts" style="margin: 0 5px; padding: 0 10px; display: grid;">
                                        <li><a href="javascript:void(0);" id="btnExportPrint" class="no-udl clr-teal" style="display: block; padding: 10px 5px; border-bottom: solid 1px #ddd;">Printer</a></li>
                                        <li><a href="javascript:void(0);" id="btnExportExcel" class="no-udl clr-teal" style="display: block; padding: 10px 5px;">Excel</a></li>
                                        <li><a href="javascript:void(0);" id="btnExportPDF" class="no-udl clr-teal" style="display: block; padding: 10px 5px;">PDF</a></li>
                                    <ul>
                            `,
                            styleName: 'print-table-data',
                            className: 'default',
                            position: 'top center',
                            autoHide: false,
                            clickToHide: false
                        })   
                        $("#btnExportPrint").on('click', e => tableReports.print("", true));
                        
                        $("#btnExportExcel").on('click', e => tableReports.download("xlsx", `MyshopOS - ${$(`#main_rpt option:selected`).text().toUpperCase()} ${$(`#sub_rpt option:selected`).text().toUpperCase()} REPORT.xlsx`, {sheetName: `${moment($("#date_from").val()).format("ddd D-MM-YY")} To ${moment($("#date_to").val()).format("ddd D-MM-YY")}`}));
                        
                        $("#btnExportPDF").on('click', e => {
                            // tableReports.download("pdf", "data.pdf", {
                            //     orientation:"portrait", //set page orientation to portrait
                            //     title: `${_.toUpper($("#main_rpt").val()) + ' ' + _.toUpper($("#sub_rpt").val())}`, //add title to report
                            //     jsPDF:{
                            //         unit:"in", //set units to inches
                            //     },
                            //     autoTable:{ //advanced table styling
                            //         styles: {
                            //             fillColor: [100, 255, 255]
                            //         },
                            //         columnStyles: {
                            //             id: {fillColor: 255}
                            //         },
                            //         margin: {top: 60},
                            //     },
                            //     documentProcessing: (doc) => {
                            //         //carry out an action on the doc object
                            //     }
                            // });
                            tableReports.download("pdf", "data.pdf", {
                                orientation: "portrait", //set page orientation to portrait
                                title: `${_.toUpper($("#main_rpt").val()) + ' ' + _.toUpper($("#sub_rpt").val())}`, //add title to report
                                autoTable: doc => {
                                    //doc - the jsPDF document object
                            
                                    //add some text to the top left corner of the PDF
                                    doc.text(_.toUpper($("#main_rpt option:selected").text()) + ' ' + _.toUpper($("#sub_rpt option:selected").text()), 10, 20) + ` REPORT<br/>PERIOD FROM: ${$("#date_from").val()} TO: ${$("#date_to").val()}`;
                            
                                    //return the autoTable config options object
                                    return {
                                        styles: {
                                            // fillColor: [200, 0, 0]
                                        },
                                        // margin: {top: 60},
                                    };
                                },
                            });
                        });
                    }
                    else{
                        $(e.target).closest('a').removeClass('active');
                        alertify.error("There are no results to print.");
                    }                
                }
                else if($(e.target).closest('a').attr('id') == "chart_overlay"){                    
                    if(filteredResults.rows.length > 0){
                        $(".overlay#chart_overlay").toggleClass('open');    
                        // var options = {
                        //     series: [{
                        //     name: 'Servings',
                        //     data: [44, 55, 41, 67, 22, 43, 21, 33, 45, 31, 87, 65, 35]
                        //   }],
                        //     annotations: {
                        //     points: [{
                        //       x: 'Bananas',
                        //       seriesIndex: 0,
                        //       label: {
                        //         borderColor: '#775DD0',
                        //         offsetY: 0,
                        //         style: {
                        //           color: '#fff',
                        //           background: '#775DD0',
                        //         },
                        //         text: 'Bananas are good',
                        //       }
                        //     }]
                        //   },
                        //   chart: {
                        //     height: 350,
                        //     type: 'bar',
                        //   },
                        //   plotOptions: {
                        //     bar: {
                        //       borderRadius: 10,
                        //       columnWidth: '50%',
                        //     }
                        //   },
                        //   dataLabels: {
                        //     enabled: false
                        //   },
                        //   stroke: {
                        //     width: 2
                        //   },                      
                        //   grid: {
                        //     row: {
                        //       colors: ['#fff', '#f2f2f2']
                        //     }
                        //   },
                        //   xaxis: {
                        //     labels: {
                        //       rotate: -45
                        //     },
                        //     categories: ['Apples', 'Oranges', 'Strawberries', 'Pineapples', 'Mangoes', 'Bananas',
                        //       'Blackberries', 'Pears', 'Watermelons', 'Cherries', 'Pomegranates', 'Tangerines', 'Papayas'
                        //     ],
                        //     tickPlacement: 'on'
                        //   },
                        //   yaxis: {
                        //     title: {
                        //       text: 'Servings',
                        //     },
                        //   },
                        //   fill: {
                        //     type: 'gradient',
                        //     gradient: {
                        //       shade: 'light',
                        //       type: "horizontal",
                        //       shadeIntensity: 0.25,
                        //       gradientToColors: undefined,
                        //       inverseColors: true,
                        //       opacityFrom: 0.85,
                        //       opacityTo: 0.85,
                        //       stops: [50, 0, 100]
                        //     },
                        //   }
                        // };
                        let i=0;
                        if($("#main_rpt").val() == 4 && $("#sub_rpt").val() == 0){  
                            series.splice(0, series.length), categories.splice(0, categories.length); 
                            // series = [
                            //     { name: 'PRODUCT A', data: [44, 55, 41, 67, 22, 43] }, 
                            //     { name: 'PRODUCT B', data: [13, 23, 20, 8, 13, 27] }, 
                            //     { name: 'PRODUCT C', data: [11, 17, 15, 15, 21, 14] }, 
                            //     { name: 'PRODUCT D', data: [21, 7, 25, 13, 22, 8] }
                            // ];
                            // categories = ['01/01/2011 GMT', '01/02/2011 GMT', '01/03/2011 GMT', '01/04/2011 GMT', '01/05/2011 GMT', '01/06/2011 GMT' ];
                            // console.log(series, categories);
                            categories = _.map(_.uniqBy(tableReports.getData(), 'TRANS_DATE'), entry => moment(entry['TRANS_DATE']).format('L'));
                            console.log(categories)
                            _.forEach(_.uniqBy(tableReports.getData(), 'emp_id'), (value, key) => {
                                console.log(key, value['TRANS_DATE'])
                                // series.push({name: value['fullname'], data: [value['TOTAL_TILL']]})
                                // console.log(categories[key])
                                series.push({
                                    name: value['fullname'], 
                                    // data: _.map(tableReports.getData(), entry => entry['fullname'] == value['fullname'] ? value['TOTAL_TILL'] : 0)
                                    data: _.map(tableReports.getData(), entry => entry['fullname'] == value['fullname'] && value['TOTAL_TILL'])
                                });
                                // console.log(_.indexOf(_.map(series, 'name')));
                            });
                            // series = _.map(_.groupBy(tableReports.getData(), 'TRANS_DATE'))
                            console.log(series)
                            // updateOptions({xaxis: {categories: months}, series: [{data: purchases}, {data: sales}, {data: profits}]}, {redrawPaths: true});
                            rpt_chart.updateOptions({xaxis: {categories}, series}, {redrawPaths: true});
                        }
                    }
                    else{
                        $(e.target).closest('a').removeClass('active');
                        alertify.error("There are no results to display.");
                    }         
                }
                else{

                }
                // $(".bottomTabs .tabs a").removeClass('active').not($(e.target).closest('a').addClass('active'));
            }
        }
        else{
            alertify.alert("MyShop OS", "Please select report parameters");
        }
    });

    $(document).on('input', '#search_reports', async e => {
        // tableReports.reformat();
        // await _.map(tableReports.getRows(), (row, key) => row.reformat());
        let filters = [];
        _.map(_.filter(tableReports.getColumns(), col => col.getField() != ""), col => filters = [...filters, {field: col.getField(), type: "like", value: _.trim(e.target.value)}]);
        console.log(filters);
        tableReports.setFilter([
            // {},
            // Nested filter OR Object
            filters
        ]);
        if(!e.target.value){
            tableReports.clearFilter();
            $("section#helper-block").html("");
        }
        else{
            filteredResults.rows.length < 1 && $(".tabulator-placeholder").css({'background': 'red', 'color': '#fff'}).html(`<div style="margin: 0 auto;"><h2 class="txt-center"><p><i class="fa fa-search fa-3x"></i></p>No record match search query.<p>Please try again...</p></h2></div>`);
            $("section#helper-block").html(`<h3 class="txt-center"><span class="clr-f05">${filteredResults.rows.length}</span> ${filteredResults.rows.length > 1 && "results" ||"result" }</h3>`).show();
        }
        // console.log(filteredResults.rows.length);
    });
    $('#search_stock').val() && $('#search_stock').trigger('input');

    // window.matchMedia("(max-width: 500px)").matches ? tableReports.setHeight("calc(100vh - 220px)") : window.matchMedia("(min-width: 768px)").matches ? tableReports.setHeight("calc(100vh - 130px)") : tableReports.setHeight("calc(100vh - 230px)") ; 
    $(window).on('resize', function(){ 
        var table = Tabulator.prototype.findTable("#reports-table")[0];
        table.redraw();
        window.matchMedia("(max-width: 500px)").matches ? tableReports.setHeight("calc(100vh - 220px)") : window.matchMedia("(min-width: 768px)").matches ? tableReports.setHeight("calc(100vh - 130px)") : tableReports.setHeight("calc(100vh - 230px)") ; 
    });
});

// pop(`https://krunchycreme.myshopos.com/stock/crud.php?pop`).then(resp => console.log(resp.data))

// var req = fetch('https://krunchycreme.myshopos.com/stock/crud.php?pop', {
//     method: "GET",
//     headers: {
//         'Content-Type': 'application/json',
//         // mode: 'cors',
//     }
// });

// req.then(resp => resp.json()).then(data => console.log(data)).catch(error => console.error(error));