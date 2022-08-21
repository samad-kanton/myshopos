import { activeUser, appSounds, SystemPrefs, pop, Swiper, myUploader, thousandsSeperator, Notif, headerMenu, footerBottomCustomText, setPrintHeader, scrollToBottom, displayFiles, AuditLogs } from '../assets/js/utils.js'
import { pageRights, printTableData, exportTableData } from '../assets/js/event.js'
import ItemModel from '../model/stock.js';
import Tagify from '../assets/plugins/tagify-master/dist/tagify.esm.js';
import { TabulatorFull as Tabulator } from '../assets/plugins/tabulator-master/dist/js/tabulator_esm.min.js';

console.log(pageRights);

const notif = new Notif(), systemPrefs = new SystemPrefs();

// BIND notif variable to the Global scope(window)   
window.notif = notif;

let companyProfile, currencies;
pop('../config/crud.php?pop')
.then(resp => companyProfile = resp.data);

pop('../config/crud.php?prefs&currencies')
.then(async resp => currencies = resp.data);

// new ImageZoom(document.querySelector("#img-container"), { zoomContainer: document.querySelector("#preview"), width: 400, zoomWidth: 500, offset: { vertical: 0, horizontal: 10 } });

$(() => {

    // Vars for Tables
    let tableCategories, tableStock;

    const pageTapSwiper = new Swiper('.swiper#pageTapSwiper', {
        // direction: 'vertical',
        speed: 400,
        autoHeight: true,
        allowTouchMove: false,
        simulateTouch: false,
        pagination: {
            el: '.swiper#pageTapSwiper .swiper-pagination',
            type: 'bullets',
            clickable: true,
            bulletElement: 'button',
            bulletActiveClass: 'activeTab',
            slidesPerView: 'auto',
            renderBullet: (index, className) => {
                // console.log(className);
                let tabs = [{title: 'Inventory', icon: 'list'}, {title: 'Categories', icon: 'list-ol'}, {title: 'Count', icon: 'refresh'}];
                return `<button type="button" class="tabs ${className}"><i class="fa fa-${tabs[index].icon} fa-2x"></i> ${tabs[index].title}</button>`;
            },
            init: () => {
                console.log('swiper initialized');
            },
            slideChange: swiper => {
                console.log(swiper.realIndex);
                // swiper.realIndex === 2 && popStockTake();
            },
            resize: swiper => {
                // console.log('resized');
            },
        },
    });

    const filterCardswiper = new Swiper('.swiper#filterCards', {
        // direction: 'vertical',
        speed: 400,
        autoHeight: true,
        // allowTouchMove: false,
        // simulateTouch: false,
        pagination: false,
        breakpoints: {
            0: { slidesPerView: 1 },
            768: { slidesPerView: 1 },
        },
        pagination: {
            el: '.swiper#filterCards .swiper-pagination',
            type: 'bullets',
            clickable: true,
            bulletElement: 'button',
            bulletActiveClass: 'activeTab',
            slidesPerView: 'auto',
            renderBullet: (index, className) => {
                // console.log(className);
                let tabs = [{title: 'Inventory', icon: 'list'}, {title: 'Categories', icon: 'list-ol'}, {title: 'Count', icon: 'refresh'}];
                return `<button type="button" class="tabs ${className}"><i class="fa fa-${tabs[index].icon} fa-2x"></i><br/> ${tabs[index].title}</button>`;
            },
        }
    });

    let unitMeasures;
    systemPrefs.pop()
    .then(config => {
        // console.log(JSON.parse(config.data[3].pref).unit_measures);
        unitMeasures = _.map(JSON.parse(config.data[3].pref).unit_measures, (value, key) => {
            return {
                id: key,
                um: value
            };
        });
    });

    let categoriesList;
    const popCategories = async () => {
        let data;
        await pop('./categories/crud.php?pop')
        .then(resp => {
            $("#overlay_crudStock .cat_id").html(`<option value="">--- select ---</option>`);
            if(_.size(resp.data) > 0){
                data = resp.data;
                categoriesList = resp.data;           
                $(".ajax-page#manageCategories .cat_name a span#categoriesCount").html(_.size(resp.data) || 0);
            }            
        });
        return data;
    }
    popCategories();
    
    tableCategories, tableStock = new Tabulator("#inventory-table", {
        height: "calc(100vh - 200px)",
        // reactiveData: true, //enable reactive data
        persistence: {
        //     sort: true, //persist column sorting
            filter: true, //persist filter sorting
            // group: true, //persist row grouping
            // page: true, //persist page
        //     columns: true, //persist columns
        }, // enable table persistence
        layout: "fitColumns",  
        // columnCalcs: "both",
        responsiveLayout: "collapse",  //hide columns that dont fit on the table    
        selectable: 1,
        addRowPos: "top",          //when adding a new row, add it to the top of the table
        // history: true,             //allow undo and redo actions on the table        
        sortOrderReverse: true,
        initialSort: [             //set the initial sort order of the data
            {column: "cat_name", dir: "asc"},
            {column: "item", dir: "asc"}
        ],
        index: "prod_id",
        groupBy: "cat_id",
        groupStartOpen: (value, count, data, group) => {
            //value - the value all members of this group share
            //count - the number of rows in this group
            //data - an array of all the row data objects in this group
            //group - the group component for the group
            // return count > 3; //all groups with more than three rows start open, any with three or less start closed
            return true;
        },
        groupHeader: (value, count, data, group) => {
            let matched = !_.isUndefined(value) && _.find(data, entry => entry.cat_id == value);
            return value ? _.toUpper(matched.cat_name) + `<span style='color: #d00; margin-left: 10px;'>(${count} ${count > 1 ? 'items' : 'item'})</span>` : '<span style="background: #000; color: lime;">TOTAL AMOUNT</span>';
        },
        columnCalcs: "both", //show column calculations at top and bottom of table and in groups
        groupClosedShowCalcs: true, //show column calculations when a group is closed
        groupToggleElement: "header", //toggle group on click anywhere in the group header
        columns: [                 
            // define the table columns
            {formatter: "rowSelection", titleFormatter: "rowSelection", hozAlign: "center", headerSort: false, width: 50},
            {formatter: "responsiveCollapse", headerSort: false, width: 10, print: false, },
            {title: "#", field: "sn", headerSort: false, formatter: "rownum", width: 50, responsive: 0,},
            {title: "Photo", field: "photos", headerSort: false, formatter: (cell, formatterParams, onRendered) => { return !_.isUndefined(cell.getData().prod_id) ? `<img src="${formatterParams.urlPrefix}/${cell.getValue() ? `stocks/${JSON.parse(cell.getValue())[0]}` : `no-photo.png`}" alt="${cell.getData().item} photos" width="${formatterParams.width}" height="${formatterParams.height}" /></div>` : ""; }, formatterParams: { width: "100%", height: 50, urlPrefix: '../uploads', }, width: 60, responsive: 0,},
            {title: "DESCRIPTION", field: "item", headerMenu, formatter: (cell, formatterParams, onRendered) => { let item = cell.getValue() ? _.toUpper(cell.getValue()) : ""; cell.getData().item = item; return item; }, minWidth: 100, responsive: 0 },
            {title: "CATEGORY", field: "cat_name", formatter: (cell, formatterParams, onRendered) => { let cat_name = cell.getValue() ? _.toUpper(cell.getValue()) : ""; cell.getData().cat_name = cat_name; return cat_name; }, minWidth: 200, visible: false },
            {title: "QTY", field: "qty", headerMenu, headerSort: false, hozAlign: 'right', formatter: "money", bottomCalc: "sum", width: 80 },
            {title: "PURCHASE VALUE", field: "", headerMenu, hozAlign: 'right', columns: [
                {title: "COST", field: "cp", hozAlign: 'right', formatter: "money", width: 100 },
                {title: "AMOUNT", field: "xcp", hozAlign: 'right', formatter: "money", bottomCalc: (values, data, bottomCalc) => thousandsSeperator(_.sumBy(values, entry => _.toNumber(entry))), width: 75 },
            ]},
            {title: "PPQ", field: "ppq", visible: false, print: false, download: false },
            {title: "WHOLESALE VALUE", field: "", hozAlign: 'right', columns: [
                {title: "PRICE", field: "wp", hozAlign: 'right', formatter: "money", width: 70, print: true, download: true },
                {title: "AMOUNT", field: "xwp", hozAlign: 'right', formatter: "money", bottomCalc: (values, data, bottomCalc) => thousandsSeperator(_.sumBy(values, entry => _.toNumber(entry))), width: 70, print: true, download: true },
                {title: "MARGIN", field: "mwp", hozAlign: 'right', formatter: "money", bottomCalc: (values, data, bottomCalc) => thousandsSeperator(_.sumBy(values, entry => _.toNumber(entry))), width: 75, print: true, download: true }
            ]},
            {title: "RETAIL VALUE", field: "", hozAlign: 'right', columns: [
                {title: "PRICE", field: "rp", hozAlign: 'right', formatter: "money", width: 70, print: true, download: true },
                {title: "AMOUNT", field: "xrp", hozAlign: 'right', formatter: "money", bottomCalc: (values, data, bottomCalc) => thousandsSeperator(_.sumBy(values, entry => _.toNumber(entry))), width: 80, print: true, download: true },
                {title: "MARGIN", field: "mrp", hozAlign: 'right', formatter: "money", bottomCalc: (values, data, bottomCalc) => thousandsSeperator(_.sumBy(values, entry => _.toNumber(entry))), width: 75, print: true, download: true }
            ]},
            // {title: "SELLING PRICE", field: "priceModels", headerMenu, formatter: (cell, formatterParams, onRendered) => {
            //     let { cp, xcp, qty, ppq } = cell.getData(), priceModels;
            //     if(!_.isUndefined(ppq) && _.size(JSON.parse(ppq)) > 0){
            //         priceModels = `<div style="">`;
            //         let min_ppq = _.minBy(JSON.parse(ppq), entry => _.toNumber(entry.qty)),
            //             max_ppq = _.maxBy(JSON.parse(ppq), entry => _.toNumber(entry.qty));                        
            //         _.forEach(JSON.parse(ppq), (entry, i) => {
            //             let { lbl: ppq_lbl, qty: ppq_qty, rate: ppq_rate } = entry;
            //             priceModels += `
            //                 <span><b>x${ppq_qty}</b>: ${thousandsSeperator(_.toNumber(ppq_rate))}</span> ${i < (_.size(JSON.parse(ppq))-1) ? '|' : ''}                                                                        
            //             `;
            //             // cell.getData().priceModels = `x${ppq_qty}: ${thousandsSeperator(_.toNumber(ppq_rate))} ${i < (_.size(JSON.parse(ppq))-1) ? '|' : ''}`;
            //             // <td style="border: solid 1px #ccc; padding: 2px 5px; display: none;">${thousandsSeperator(_.toNumber(ppq_rate))}</td>
            //             // <td style="border: solid 1px #ccc; padding: 2px 5px; display: none;">${(ppq_qty == min_ppq.qty) ? ItemModel.xrp({item: cell.getData()}) : (ppq_qty == max_ppq.qty) ? ItemModel.xwp({item: cell.getData()}) : thousandsSeperator((ppq_rate/ppq_qty)*qty)}</td>
            //             // <td style="border: solid 1px #ccc; padding: 2px 5px; display: none;">${(ppq_qty == max_ppq.qty) ? ItemModel.xwp({item: cell.getData()}) : ItemModel.xrp({item: cell.getData()})}</td>
            //             // <td style="border: solid 1px #ccc; padding: 2px 5px; display: none;">${(ppq_qty == min_ppq.qty) ? ItemModel.mrp({item: cell.getData()}) : (ppq_qty == max_ppq.qty) ? ItemModel.mwp({item: cell.getData()}) : thousandsSeperator(((ppq_qty/ppq_rate)*qty) - xcp)}</td>
            //         });
            //         console.log($(priceModels).text());
            //         priceModels += `</div>`;
            //     }
            //     else priceModels = '';                
            //     cell.getData().priceModels = $(priceModels).text()
            //     return priceModels;
            // }, responsive: 0, minWidth: 200 },
            {title: "BARCODE", field: "barcode", headerMenu, headerSort: false, width: 120 },
            {title: "RESTOCK", field: "restock", headerMenu, hozAlign: 'right', width: 80 },    
            {title: "EXPIRY", field: "expdate", headerMenu, hozAlign: 'right', width: 80 },    
            // {title: "CURRENCY", field: "currency", visible: false, print: false, download: false },
            {title: "ACTIVE", field: "active", headerMenu, width: 80, visible: false, print: false, download: false },
            {title: "", field: "", width: 30, headerSort: false, hozAlign: "center", tooltip: (e, cell, onRendered) => `Options for ${cell.getData().item && cell.getData().item.toUpperCase()}`, formatter: (cell, formatterParams, onRendered) => { return cell.getData().prod_id != undefined && "<i class='fa fa-ellipsis-v fa-2x clr-info'></i>" || ''; }, print: false, 
                cellClick: (e, cell) => {
                    let { prod_id, active } = cell.getData();   
                    
                    // Remove all overlay_moreOpts except 
                    $("*#overlay_moreOpts").closest('.notifyjs-wrapper').show().not($(e.target).closest('.tabulator-cell').prev('.notifyjs-wrapper')).closest('.notifyjs-wrapper').remove();              
                    
                    _.size($(e.target).closest('.tabulator-cell').prev('.notifyjs-wrapper')) < 1 ? notif.show({
                        el: $(e.target).closest('.tabulator-cell'),
                        title: `
                            <div id="overlay_moreOpts" style="display: grid; grid-template-columns: repeat(3, auto); gap: 10px; height: 50px;">
                                <a href="javascript:void(0);" id="btnTopupStock" data-row-data='${JSON.stringify(cell.getData())}' class="no-udl clr-info" style="height: inherit; display: flex; flex-flow: column; align-items: center; padding: 5px; border-right: solid 1px #ddd;"><i class="fa fa-plus-circle fa-2x"></i><small style="font-size: 10px;">Topup</small></a>
                                <a href="javascript:void(0);" id="btnUpdateStock" data-row-data='${JSON.stringify(cell.getData())}' class="no-udl clr-success" style="height: inherit; display: flex; flex-flow: column; align-items: center; padding: 5px; border-right: solid 1px #ddd;"><i class="fa fa-edit fa-2x"></i><small style="font-size: 10px;">Update</small></a>
                                <a href="javascript:void(0);" id="btnDeleteStock" data-row-data='${JSON.stringify(cell.getData())}' class="no-udl clr-danger" style="height: inherit; display: flex; flex-flow: column; align-items: center; padding: 5px;"><i class="fa fa-trash fa-2x"></i><small style="font-size: 10px;">Delete</small></a>
                            <div>
                        `, 
                        styleName: "stock-table-row-opts",
                        className: "default",
                        position: "left center",
                        autoHide: false,
                        clickToHide: false  
                    }) : $("#overlay_moreOpts:visible").closest('.notifyjs-wrapper').remove()
                },// frozen: true.
                responsive: 0,
            }
        ],   
        columnDefaults: {
            vertAlign: "middle",
            tooltip: true,
            headerTooltip: function(e, cell, onRendered){
                //e - mouseover event
                //cell - cell component
                //onRendered - onRendered callback registration function
                // console.log(cell)
                // var el = document.createElement("div");
                // el.style.backgroundColor = "red";
                // // el.innerText = column.getDefinition().title;
                // el.innerText = "hello world";
                return true; 
            },
        },
        rowFormatter: row => {
            var tr = row.getElement(), data = row.getData(), cellContents = '';
            //clear current row data
            // while(tr.firstChild) tr.removeChild(element.firstChild);
            if(!_.isUndefined(row.getData().prod_id)){
                data.active == 0 ? $(tr).css({'background': '#dc3545', 'color': '#fff'}) : $(tr).css({'background': '', 'color': ''});
            }
        },
        pagination: "local",  
        // paginationCounter:"rows",      //paginate the data
        paginationSize: 100,         //allow 7 rows per page of data
        paginationSizeSelector: [10, 25, 50, 100, 250, 500, true], //enable page size select element and generate list options
        printAsHtml: true, //enable html table printing
        printStyled: true, //copy Tabulator styling to HTML table
        printRowRange: "all",
        // printVisibleRows: false,
        // printHeader: `<center><h1 style="margin: 10px 0;">${1}</h1><p style="margin-top: 0">OPP. KEN CITY BUILDING, MADINA MARKET</p><p>GENERAL STOCK OVERVIEW</p></center>`,
        printFooter: `<div style="display: flex; justify-content: space-between; align-items: center;"><p>MyShop OS v0.2</p><p>Software By: Samad Kanton</p></center>`,
        placeholder: "No Data Available", //display message to user on empty table
        // footerElement: `<button>Custom Button</button>`, 
    });

    tableStock.on("tableBuilt", () => {
        $(window).on('resize', e => {
            window.matchMedia('(max-width: 768px)').matches ? tableStock.setHeight('calc(100vh - 250px)') : tableStock.setHeight('calc(100vh - 200px)');
            $("#overlay_crudStock #content").css({'height': `calc(100vh - ${window.matchMedia('(max-width: 768px)').matches ? 290 : 230})px`});
        });
        window.matchMedia('(max-width: 768px)').matches ? tableStock.setHeight('calc(100vh - 250px)') : tableStock.setHeight('calc(100vh - 200px)');
    });

    tableStock.on("rowClick", (e, row) => {
        //row - row component
        //e - click event
        !_.isUndefined(row.getData().prod_id) && !row.isSelected() && row.select();
    });

    // console.log(tableStock.modules.persistence.id);

    $(document).on('click', '#stockTableOpts', e => {    
        // $(e.target).closest('.search-pane').find('.fa-search');
        notif.show({
            el: $(e.target).closest('#stockTableOpts'),
            title: `
                <ul id="overlay_moreOpts" style="margin: 0 5px; padding: 0 10px; display: grid;">
                    <li><a href="javascript:void(0);" id="btnToggleStockGroupState" class="no-udl clr-teal" style="display: block; padding: 10px 5px; border-bottom: solid 1px #ddd;">Unfold Groups</a></li>
                    <li><a href="javascript:void(0);" id="btnShareStockData" class="no-udl clr-teal" style="display: block; padding: 10px 5px;">Share Data</a></li>
                <ul>
            `, 
            styleName: "stock-table-options",
            className: "default",
            position: "bottom left",
            autoHide: false,
            clickToHide: false
        })
    });

    $(document).on('click', '#btnToggleStockGroupState', e => {    
        // console.log(tableStock.modules.groupRows.getGroups());
        // console.log(_.size($("#inventory-table").find('.tabulator-group-visible')) < 1)
        // tableStock.setGroupStartOpen(true);
        // tableStock.setGroupBy();
        // tableStock.setGroupHeader((value, count, data, group) => {
        //     let matched = !_.isUndefined(value) && _.find(data, entry => entry.cat_id == value);
        //     return value ? _.toUpper(matched.cat_name) + `<span style='color:#d00; margin-left:10px;'>(${count} ${count > 1 ? 'items' : 'item'})</span>` : '<span style="background: #000; color: lime;">TOTAL AMOUNT</span>';
        // });
        // tableStock.setGroupHeaderDownload: (value, count, data, group) => {
        //     let matched = !_.isUndefined(value) && _.find(data, entry => entry.cat_id == value);
        //     return value ? _.toUpper(matched.cat_name) : '';
        // })
    });

    $(document).on('click', '#btnTopupStock', e => {    
        _.size($("#overlay_topupStock")) > 0 && $("#overlay_topupStock a.close").trigger("click");
        if(pageRights.restocking){ 
            let { prod_id, cp, qty, ppq } = $(e.target).closest('a').data('rowData');            
            notif.show({ 
                el: $("#createStock"), 
                title: `
                    <div id="overlay_topupStock" style="width: calc(100vw - 7vw); max-width: 768px;">
                        <div style="background: #fff; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 3px 10px 0 rgba(0, 0, 0, .4);">
                            <section style="display: grid; grid-template-columns: auto auto; gap: 20px; align-items: center;">
                                <a href="javascript:void(0);" class="close no-udl clr-default" style="transform: scale(1.5); padding: 10px;" onclick="$('#overlay_topupStock').closest('.notifyjs-wrapper').remove();"><i class="fa fa-chevron-left"></i></a> 
                                <form role="form" id="crudTopUpStock" style="margin-top: 15px;">
                                    <div class="row">
                                        <div class="cl-6 cm-6 cs-6 cx-6">
                                            <div class="form-group" style="margin: 0 20px 0 0; display: flex; align-items: center;">
                                                <input type="number" id="topup_cp" min=".01" step=".01" placeholder="Cost Price" required value="${cp}">
                                                <label for="topup_cp" class="floated-up-lbl" style="top: -5px;">New Unit Cost</label>
                                            </div>
                                        </div>
                                        <div class="cl-6 cm-6 cs-6 cx-6">
                                            <div class="form-group" style="margin: 0 20px 0 0; display: flex; align-items: center;">
                                                <input type="number" id="topup_qty" step="1" min="1" placeholder="in pcs" required>
                                                <label for="topup_qty" class="floated-up-lbl" style="top: -5px;">New Qty</label>
                                            </div>
                                        </div>
                                    </div>
                                    <button hidden type="submit" class="btn btn-default" id="btnSubmitForm">new</button>
                                </form>
                            </section>
                            <button type="button" class="btn clr-teal" onclick="$(event.target).closest('#overlay_topupStock').find('form#crudTopUpStock #btnSubmitForm').trigger('click');" style="margin: 0 10px; background: none; border: solid 1px teal; padding: 5px;"><i class="fa fa-long-arrow-up"></i><br/>Topup</button>
                        </div>
                        <div id="topupStock-table"></div>
                    </div>
                `, 
                className: 'info', 
                styleName: 'topup-stock', 
                position: 'bottom left', 
                autoHide: false,
                clickToHide: false 
            });

            var tableStockTopUp = new Tabulator("#overlay_topupStock #topupStock-table", {
                height: 'calc(100vh - 250px)',
                layout: "fitColumns",      //fit columns to width of table
                // responsiveLayout: "collapse",  //hide columns that dont fit on the table    
                addRowPos: "top",          //when adding a new row, add it to the top of the table
                history: true,             //allow undo and redo actions on the table        
                initialSort: [             //set the initial sort order of the data
                    {column: "regdate", dir: "desc"},
                    // {column: "item", dir: "asc"},
                ],
                groupBy: 'ORDER_DATE',
                groupHeader:[
                    (value, count, data) =>`<span style="color: #222;">${value !== undefined && `${moment(value).format('dddd, MMMM DD YYYY')}<span style="color: #f00;">(${count + (count > 1 ? ' items' : ' item')})</span>` || "TOTAL AMOUNT"}</span>`
                ],
                index: "order_id",
                // groupBy: "CAT",
                // autoColumns: true,        
                columns: [                 
                    //define the table columns
                    {title: "#", headerSort: false, formatter: "rownum", width: 30},
                    {title: "", field: "order_id", visible: false},
                    {title: "TIME", field: "regdate", formatter: (cell, formatterParms, onRendered) => cell.getValue() && moment(cell.getValue()).format('HH:mm'), hozAlign: 'right', width: 70, validator: "required", tooltip: (e, cell, onRendered) => cell.getValue() || 0, width: 50 },     
                    {title: "PPQ", field: "ppq", visible: false, print: false, download: false },
                    {title: "PREV QTY", field: "prev_qty", formatter: (cell, formatterParms, onRendered) => cell.getValue() &&  cell.getValue(), hozAlign: 'right', validator: "required", tooltip: (e, cell, onRendered) => cell.getValue() || 0, minWidth: 60 },
                    {title: "TOPUP QTY", field: "new_qty", editor: "", bottomCalc: 'sum', bottomCalcParams: { precision: 0 }, hozAlign: 'right', validator: "required", tooltip: (e, cell, onRendered) => cell.getValue() || 0, minWidth: 60  },
                    // {title: "CURRENT QTY", field: "CUR_QTY", formatter: 'money', formatterParams: {precision: 0}, hozAlign: 'right', tooltip: (e, cell, onRendered) => parseFloat(cell.getData()['prev_qty']) + parseFloat(cell.getData()['new_qty']) },
                    {title: "UNIT COST", field: "cp", editor: "", hozAlign: 'right', minWidth: 60 },     
                    {title: "EXT.", field: "xcp", hozAlign: 'right', formatter: (cell, formatterParams, onRendered) => { let ppq = cell.getData().ppq; if(!_.isUndefined(ppq)){ let xcp = ItemModel.xcp({item: cell.getData()}); cell.getData().xcp = xcp; return xcp; }else{ return cell.getData().xcp; } }, bottomCalc: (values, data, bottomCalcParams) => thousandsSeperator(_.sumBy(data, entry => _.toNumber(_.join(_.split(ItemModel.xcp({item: entry}), ','), '')))) || '', width: 70},   
                    {title: "", field: "", width: 30, headerSort: false, hozAlign: "center", tooltip: "Delete", formatter: (cell, formatterParams, onRendered) => { return cell.getData()['prod_id'] != undefined && "<i class='fa fa-trash fa-2x clr-danger' onclick=''></i>" || ''; }, print: false, cellClick: (e, cell) => {
                        let { prod_id, item, new_qty } = cell.getData(),
                            stockBalanceAfterTopUpDelete = _.toNumber(tableStock.getSelectedData()[0].qty) - _.toNumber(new_qty);
                        $('#overlay_topupStockDeletePrompt').closest('.notifyjs-wrapper').remove();
                        notif.show({
                            el: $(e.target).closest('.tabulator-cell'),
                            title: `<div id="overlay_topupStockDeletePrompt" style="min-width: 200px;">                        
                                        ${stockBalanceAfterTopUpDelete >= 0 ? `
                                            <small>Delete <b>${new_qty}</b> as restock for <b>${_.toUpper(item)}</b>.</small><br/><br/>
                                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                                <section>Proceed?</section>
                                                <section>
                                                    <button type="button" class="btn btn-info btn-sm" id="btnProceedDeleteStockTopup" data-key="${prod_id}">Yes</button>
                                                    <button type="button" class="btn btn-sm" id="btnCancelDeleteStockTopup">No</button>
                                                </section>
                                            </div>
                                        ` : `<small>Oops... You cannot undo topup quantity.<br/>Hint:<br/>Available quantity does not suffice action.</small>`}
                                    </div> 
                            `,
                            styleName: "prompt-topupQty-removal",
                            className: "warning",
                            position: "left center",
                            autoHide: stockBalanceAfterTopUpDelete >= 0 ? false : true,
                            clickToHide: stockBalanceAfterTopUpDelete >= 0 ? false : true
                        }); 

                        
                        $("#btnCancelDeleteStockTopup").on('click', e => $('#overlay_topupStockDeletePrompt').closest('.notifyjs-wrapper').remove());
                        
                        $("#btnProceedDeleteStockTopup").on('click', e => {
                            let { prod_id, order_id, new_qty: topupQty } = cell.getData(),
                                { qty: curQty } = tableStock.getSelectedData()[0];
                                $.post(`./crud.php?topup&delete`, { order_id, prod_id, topupQty }, resp => {
                                    if(resp.deleted){
                                        tableStockTopUp.deleteRow(order_id)
                                        .then(() => {
                                            appSounds.oringz.play();
                                            alertify.error('TopUp successfully reversed');
                                            tableStock.updateRow(prod_id, {qty: (_.toNumber(curQty) - _.toNumber(topupQty))});
                                            pop(`./crud.php?topup&pop&prod_id=${prod_id}`)
                                            .then(resp => tableStockTopUp.replaceData(resp.data));
                                        })
                                        .catch(error => console.log(error));
                                    }
                                    else{
                                        console.log(resp)
                                    }
                                }, 'JSON');
                            });
                        },
                    }
                ],
                columnDefaults: {
                    vertAlign: "middle"
                },
                cellEditCancelled: (e, cell, onRendered) => {
                    //cell - cell component
                    if(!cell.isEdited()){
                        // cell.getOldValue() != "" ? cell.setValue(cell.getInitialValue() - cell.getOldValue()) : cell.restoreInitialValue();
                        cell.clearValidation();
                    }
                },
                cellEdited: (e, cell, onRendered) => {
                    //cell - cell component
                    let prod_id = cell.getData().prod_id, order_id = cell.getData().order_id, 
                        refactor = parseFloat(cell.getValue()) > parseFloat(cell.getInitialValue()) && "add" || "subtract",
                        diff = parseFloat(cell.getValue()) - parseFloat(cell.getInitialValue());
                    if((cell.getField() == "new_qty" || cell.getField() == "rp") && cell.isValid()){
                        $.post(`./crud.php?topup&update&emp_id=${activeUser.id}`, {prod_id, order_id, refactor, diff, edited_topupQty: cell.getData().new_qty}, function (rsp) {
                            console.log(rsp);
                            // if (rsp.updated) {
                            //    appSounds.oringz.play();
                            //     alertify.success(rsp.saved && "Saved" || 'Updated');
                            //     pop('./crud.php?pop').then(resp => tableStock.replaceData(resp.data));
                            //     pop(`./crud.php?topup&pop&prod_id=${prod_id}`)
                            //     .then(resp => tableStockTopUp.setData(resp.data));
                            // }
                            // else {
                            //     console.log(rsp);
                            // }
                        }, 'JSON');
                    }
                },
                pagination: "local",       //paginate the data
                paginationSize: 100,         //allow 7 rows per page of data
                paginationSizeSelector: true, //enable page size select element and generate list options
                printAsHtml: true, //enable html table printing
                printStyled: true, //copy Tabulator styling to HTML table
                printRowRange: "all",
                placeholder: "No Data Available", //display message to user on empty table
            });  

            pop(`./crud.php?topup&pop&prod_id=${prod_id}`)
            .then(resp => {
                // console.log(resp.data);
                tableStockTopUp.setData(resp.data);
            });
            
            $('#crudTopUpStock').on('submit', e => {
                let { qty } = tableStock.getSelectedData()[0],
                    topupCP = $("#overlay_topupStock #topup_cp").val(),
                    topupQty = $("#overlay_topupStock #topup_qty").val();
                // console.log(prod_id, topupCP, topupQty);
                $(e.target).find('[type="submit"]').prop('disabled', true);
                $.post(`./crud.php?topup&increase&emp_id=${activeUser.id}`, { prod_id, qty, topupCP, topupQty }, rsp => {
                    if (rsp.updated) {
                        tableStock.updateRow(prod_id, {cp: topupCP, qty: (_.toNumber(qty) + _.toNumber(topupQty))});
                        tableStock.getRow(prod_id).reformat();
                        $('#overlay_topupStock').closest('.notifyjs-wrapper').remove();
                        pop(`./crud.php?topup&pop&prod_id=${prod_id}`)
                        .then(resp => {
                            // console.log(resp.data);
                            tableStockTopUp.replaceData(resp.data);
                            tableStockTopUp.addRow({
                                new_qty: _.sumBy(resp.data, entry => _.toNumber(entry['new_qty']) || 0),
                                EXT_AMT: _.sumBy(resp.data, entry => _.toNumber(entry['EXT_AMT']) || 0)
                            });                    
                        });
                        appSounds.oringz.play();
                        $(e.target)[0].reset();                        
                        alertify.success(rsp.saved && "Saved" || 'Updated');
                    }
                    else {
                        console.log(rsp);
                    }
                    $(e.target).find('[type="submit"]').prop('disabled', false);
                }, 'JSON');
                return false;
            });
        }
        else{
            notif.show({ el: $(e.target), title: `<div class="txt-center"><small><i class="fa fa-warning fa-2x"></i><br/>You are not allowed to restock.</small></div>`, className: 'error', styleName: 'access-denied-restock', position: 'bottom right', autoHide: true });
        }
    });

    $(document).on('click', '#btnUpdateStock', e => { 
        if(pageRights.update_stock){   
            let data = $(e.target).closest('a').data('rowData');
            $(".ajax-page#overlay_topupStock #topup_cp").val(data.cp);

            let { prod_id, cat_id, item, barcode, qty, cp, restock, expdate, active, currency, ppq, photos } = data; 
            ppq = JSON.parse(ppq);
            currency = currency || undefined;
            
            openCrudStockOverlay({target: $("#createStock"), position: 'bottom left', crudOpr: 'update', data });

            _.forEach(_.reverse(ppq), entry => {
                $("#overlay_crudStock #stockPPQ").prepend(PPQRow({data: entry}));
            });

            $("#crudStock #item").val(item.toUpperCase());
            $("#crudStock #cat_id").val(cat_id)
            $("#crudStock #qty").val(qty);
            $("#crudStock #cp").val(cp);
            $("#crudStock #restock").val(restock > 0 ? restock : '');
            $("#crudStock #expdate").val(moment(expdate).format("YYYY-MM-DD"));
            $("#crudStock #isActive").prop('checked', active == 1 ? true : false);
            _.size(JSON.parse(barcode)) > 0 && barcodeTags.addTags(JSON.parse(barcode));

            if(!_.isUndefined(currency)){
                let { id, exch_rate, factor } = JSON.parse(currency);
                $("#crudStock #currency").val(id);
                $("#crudStock #exch_rate").val(exch_rate);
                // SELECT RATE FACTOR IF EXIST, ELSE TREAT AS CUSTOM FACTOR VALUE
                _.size($(`#crudStock #rate_factor option[value='${factor}']`)) < 1 ? $(`#crudStock #rate_factor`).val("custom").trigger('change') : $(`#crudStock #rate_factor`).val(factor);
            }

            photos && displayFiles({instance: stockPhotos, data: JSON.parse(photos), loc: '../uploads/stocks'});
        }
        else{
            notif.show({ el: $(e.target), title: `<div class="txt-center"><small><i class="fa fa-warning fa-2x"></i><br/>You are not allowed to edit stock.</small></div>`, className: 'error', styleName: 'access-denied-edit-stock', position: 'bottom right', autoHide: true });
        }
    }); 

    $(document).on('click', '#btnDeleteStock', e => { 
        if(pageRights.delete_stock){    
            let { prod_id, item } = $(e.target).closest('a').data('rowData');
            pop(`./crud.php?stocks&deleteORdeactivate&everSold&prod_id=${prod_id}`)                    
            .then(everSold => {
                console.log("everSold: ", everSold.data);
                notif.show({
                    el: $(e.target).closest('#btnDeleteStock'),
                    title: `<div id="overlay_stockDeletePrompt" style="min-width: 280px; max-width: 20vw; white-space: initial; display: grid; grid-template-columns: 1fr 70px; gap: 5px;">                        
                                <div>
                                    ${_.size(everSold.data) > 0 ? `<small>Item is linked with other records like sales and orders. <br/>You might as well de-activate it temporarily.</small><br/>` : `<small>Delete <b>${_.toUpper(item)}</b>.? </p>This will remove record permanently!</small><br/>`}
                                </div>
                                <div>
                                    <section style="width: 100%; display: grid; gap: 5px;">
                                        ${_.size(everSold.data) > 0 ? `<button type="button" class="btn btn-info btn-sm" id="btnDeActivateStock" style="padding: 7px 0;">Deactivate</button>` : ''}
                                        ${_.size(everSold.data) < 1 ? `<button type="button" class="btn btn-danger btn-sm" id="btnProceedDeleteStock" data-key="${prod_id}" style="padding: 7px 0;">Delete</button>` : ''}
                                        <button type="button" class="btn btn-sm" id="btnCancelDeleteStock" style="padding: 7px 0;">Cancel</button>
                                    </section>
                                </div> 
                            </div> 
                    `,
                    styleName: "prompt-stock-removal",
                    className: "warning",
                    position: "left center",
                    autoHide: false,
                    clickToHide: false
                }); 
            }); 
        }
        else{
            notif.show({ el: $(e.target).closest('#btnDeleteStock'), title: `<div class="txt-center"><small><i class="fa fa-warning fa-2x"></i><br/>You are not allowed to remove stock</small></div>`, className: 'error', styleName: 'access-denied-delete-stock', position: 'bottom right', autoHide: true });
        }        
    }); 

    $(document).on('click', "#btnDeActivateStock, #btnProceedDeleteStock", e => {
        let { target } = e, { id } = target, { prod_id, photos } = tableStock.getSelectedData()[0];
        $.post(`./crud.php?stocks&deleteORdeactivate&${id == 'btnDeActivateStock' ? 'deactivate' : ''}`, { prod_id, photos }, resp => {
            // console.log(resp);
            if(resp.deleted){
                tableStock.deleteRow(prod_id)
                .then(() => {
                    appSounds.removed_tone.play();
                    alertify.error('Deleted');                    
                    _.size(_.filter(tableStock.getData('active'), row => row.prod_id)) < 1 && tableStock.clearFilter();     // CLEAR ALL FILTERS WHEN TABLE ROWS LENGTH IS LESS THAN ONE(1)
                });
            }
            else if(resp.deactivated){
                tableStock.updateRow(prod_id, { active: 0 });
                tableStock.getRow(prod_id).reformat();
            }
            else{
                console.error(resp);
            }
        }, 'JSON');
    });
    
    $(document).on('click', "#btnCancelDeleteStock", e => {
        $(e.target).closest('.notifyjs-wrapper').remove();
    });
    
    const loadDashboardFilters = params => {
        let data = _.filter(params.data, entry => entry.prod_id),
            stockValue = _.filter(data, entry => ItemModel.xcp({item: entry})),
            expiredStock = _.filter(data, entry => moment(entry.expdate).isBefore(moment().add('2', 'months'))),
            lowStock = _.filter(data, entry => entry.qty <= entry.restock),
            outOfStock = _.filter(data, entry => entry.qty <= 0),
            activeStock = _.filter(data, entry => entry.active == 1),
            inActiveStock = _.filter(data, entry => entry.active == 0)
        // console.log(_.map(params.data, entry => moment(entry.expdate).isBefore(moment().add('2', 'months'))), expiredStock, _.sumBy(expiredStock, entry => ItemModel.xcp({item: entry})))
        
        $("#stockValue samp").html(thousandsSeperator(_.sumBy(stockValue, entry => ItemModel.xcp({item: entry})))).parent().find('span').html(_.size(stockValue)).closest('button').on('click', e => tableStock.replaceData(stockValue));
        $("#stockExpired samp").html(thousandsSeperator(_.sumBy(expiredStock, entry => ItemModel.xcp({item: entry})))).parent().find('span').html(_.size(expiredStock)).closest('button').on('click', e => tableStock.replaceData(expiredStock));
        $("#stockLow samp").html(thousandsSeperator(_.sumBy(lowStock, entry => ItemModel.xcp({item: entry})))).parent().find('span').html(_.size(lowStock)).closest('button').on('click', e => tableStock.replaceData(lowStock));
        $("#stockFinished samp").html(thousandsSeperator(_.sumBy(outOfStock, entry => ItemModel.xcp({item: entry})))).parent().find('span').html(_.size(outOfStock)).closest('button').on('click', e => tableStock.replaceData(outOfStock));
        $("#stockActive samp").html(thousandsSeperator(_.sumBy(activeStock, entry => ItemModel.xcp({item: entry})))).parent().find('span').html(_.size(activeStock)).closest('button').on('click', e => tableStock.replaceData(activeStock));
        $("#stockInActive samp").html(thousandsSeperator(_.sumBy(inActiveStock, entry => ItemModel.xcp({item: entry})))).parent().find('span').html(_.size(inActiveStock)).closest('button').on('click', e => tableStock.replaceData(inActiveStock));

        return { stockValue, expiredStock, lowStock, outOfStock, activeStock, inActiveStock };
    }

    // Disable Stock Manipulation Btns
    $("#toolbar input, button").prop('disabled', true);
    // let tableStockData;  
    
    const reformTableStockData = params => {
        let tableStockData = _.map(params.data, (entry, i) => {
            entry.item = _.toUpper(entry.item);
            // entry.cp = _.toNumber(ItemModel.cp({item: entry}));
            entry.cp  = entry.cp,
            entry.xcp = _.toNumber(ItemModel.xcp({item: entry}))
            entry.wp = _.toNumber(ItemModel.wp({item: entry})) || ''
            entry.wp_qty = _.toNumber(ItemModel.xwp({item: entry})) || ''
            entry.xwp = _.toNumber(ItemModel.xwp({item: entry})) || ''
            entry.mwp = _.toNumber(ItemModel.mwp({item: entry})) || ''
            entry.rp = _.toNumber(ItemModel.rp({item: entry}))
            entry.xrp = _.toNumber(ItemModel.xrp({item: entry}))
            entry.mrp = _.toNumber(ItemModel.mrp({item: entry}))
            // entry.barcode = barcodes[_.size(barcodes)-1] || '';
            entry.restock = entry.restock > 0 ? entry.restock : '';
            entry.expdate = entry.expdate ? moment(entry.expdate).format('MMM DD, YYYY') : '';
            return entry;
        });
        tableStock.setData(tableStockData)        
        .then(() => {
            tableStock.addRow([{
                sn: '',
                qty: _.sumBy(tableStockData, entry => _.toNumber(entry.qty)),
                xcp: _.sumBy(tableStockData, entry => _.toNumber(_.join(_.split(entry.xcp, ','), ''))), 
                xwp: _.sumBy(tableStockData, entry => _.toNumber(_.join(_.split(entry.xwp, ','), ''))), 
                mwp: _.sumBy(tableStockData, entry => _.toNumber(_.join(_.split(entry.mwp, ','), ''))), 
                xrp: _.sumBy(tableStockData, entry => _.toNumber(_.join(_.split(entry.xrp, ','), ''))), 
                mrp: _.sumBy(tableStockData, entry => _.toNumber(_.join(_.split(entry.mrp, ','), '')))
            }], false);            
        });
    }
    
    pop('./crud.php?stocks&pop')
    .then(async resp => {
        console.log(resp);
        await reformTableStockData({data: resp.data});
    
        loadDashboardFilters({data: resp.data});

        // Re-enable CRUD buttons after loading stock data
        $("#toolbar input, button").prop('disabled', false);
    

        
        /* 
            MANAGE CATEGORIES SECTION             
        */    
        let prevActiveLblColor;
        const genColorLbls = flag => { 
            $("#colorBox").html('');
            let getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
            for (let i = 0; i < 5; i++) {
                //generate random red, green and blue intensity
                var r = getRandomInt(0, 255), g = getRandomInt(0, 255), b = getRandomInt(0, 255);
                $("#colorBox").append(`<section class="${i == 0 && 'active' || ''}" style="width: 50px; height: 50px; background: rgb(${r},${g},${b}); display: flex; justify-content: center; align-items: center; cursor: pointer;"></section>`);     
            }
            // $("#colorBox section.active").trigger('click');
            prevActiveLblColor = $("#colorBox section:first-child.active").css('backgroundColor');
            $("#colorBox section:first-child").addClass('active').html(`<span style="background: rgba(255, 255, 255, .5); padding: 2px 3px; border-radius: 50%;"><i class="fa fa-check clr-white"></i></span>`);
            
            $(document).on('click', "#colorBox section", e => {
                $("#colorBox section").removeClass('active').not($(e.target).closest("#colorBox section").addClass('active'));
                $("#colorBox section").html('').not($("#colorBox section.active").html(`<span style="background: rgba(255, 255, 255, .5); padding: 2px 3px; border-radius: 50%;"><i class="fa fa-check clr-white"></i></span>`));
            });
        },
        resetCrudCategories = prevActiveLblColor => {
            $("#colorBox section:first-child").css('background', prevActiveLblColor);
            $("#btnSaveCategory").removeClass('btn-success update').addClass('btn-primary new').text("Save");
            $("#cat_name").val('');
        }    

        const openCrudCategoriesOverlay = params => {        
            notif.show({ 
                el: params.target, 
                title: `    
                        <div id="overlay_crudCategories" style="width: 300px; max-width: 768px; overflow-y: auto; background: aliceblue;">
                            <div style="display: flex; justify-content: space-between; align-items: center; box-shadow: 0 3px 10px 0 rgba(0, 0, 0, .4);">
                                <section style="display: grid; grid-template-columns: auto auto; gap: 20px; align-items: center;">
                                    <a href="javascript:void(0);" class="close no-udl clr-default" style="transform: scale(1.5); padding: 10px;" onclick="notif.hide($('.notifyjs-crud-categories-base'));"><i class="fa fa-chevron-left"></i></a> 
                                    <span style="text-overflow: ellipsis; overflow: hidden; whitespace: nowrap;">${params.crudOpr == 'new' ? '<u>N</u>ew Category' : `<u>U</u>pdate <b>${_.toUpper(params.data.cat_name)}`}</b></span>
                                </section>
                                <button type="button" class="btn clr-${params.crudOpr == 'new' ? 'primary' : 'success'}" onclick="$(event.target).closest('#overlay_crudCategories').find('#btnSubmitForm').trigger('click');" style="margin: 0 10px; background: none; border: none;">${params.crudOpr == 'new' ? '<i class="fa fa-save"></i> Save' : '<i class="fa fa-pencil"></i> Update'}</button>
                            </div>
                            <form role="form" id="crudCategories" autocomplete="off">
                                <div class="form-group">
                                    <input autocomplete="off" type="text" maxlength="50" name="cat_name" id="cat_name" class="txt-u" value="${params.crudOpr == 'update' ? params.data.cat_name : ''}" placeholder="Type category name here..." required>
                                    <label for="cat_name" class="floated-up-lbl" style="top: -5px;">Title</label>
                                    <sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>
                                </div>

                                <div class="form-group">
                                    <label class="floated-up-lbl" style="top: 0px;">Label Color</label>
                                    <div id="colorBox"></div>
                                    <sup class="required"><a href="javascript:void(0);" id="btnResetCategories"><i class="fa fa-refresh"></i></a></sup>
                                </div>
                                <button hidden type="submit" class="btn btn-default ${params.crudOpr == 'new' ? 'new' : 'update'}" id="btnSubmitForm">${params.crudOpr}</button>
                            </form>
                            <div id="categories-table" style="margin: 10px 10px 0 10px;"></div>
                        </div>
                `, 
                styleName: 'crud-categories', 
                className: 'default', 
                autoHide: false, 
                clickToHide: false, 
                position: params.position 
            }); 
            genColorLbls(0);
            params.crudOpr == 'update' && $("#colorBox section:first-child").addClass('active').css('background', params.data.color).html(`<span style="background: rgba(255, 255, 255, .5); padding: 2px 3px; border-radius: 50%;"><i class="fa fa-check clr-white"></i></span>`);

            $("#btnResetCategories").on('click', e => {
                genColorLbls(0);
            });  
            
            $("form#crudCategories").on('submit', e => {
                let formData = {cat_name: $("#cat_name").val(), lblColor: $("#colorBox section.active").css('backgroundColor'), cat_id: tableCategories.getSelectedData()[0] && tableCategories.getSelectedData()[0].cat_id || null};
                $.post(`./categories/crud.php?${$(e.target).find('#btnSubmitForm').hasClass('new') && 'new' || 'update'}&emp_id=${activeUser.id}`, formData, resp => {
                    if (resp.saved || resp.updated) {
                        appSounds.oringz.play();
                        alertify.success(resp.saved && "Saved" || 'Updated.');
                        resp.updated && notif.hide($('.notifyjs-crud-categories-base'));
                        popCategories()
                        .then(data => { 
                            $(e.target)[0].reset();
                            tableCategories.setData(data);
                            resetCrudCategories(prevActiveLblColor);
                            $("#colorBox section:first-child").trigger('click');
                            genColorLbls(0);
                            $("#cat_name").trigger('focus');
                        });
                    }
                    else {
                        console.log(resp);
                        notif.show({ el: $("#cat_name"), title: `Duplicate found!`, styleName: 'duplicate-category-flag', className: 'danger', position: 'bottom center' });
                    }
                }, 'JSON');            
                return false;
            });
        };

        $('#createCategories').on('click', e => { 
            pageRights.manage_categories ? !$("#overlay_crudCategories").is(':visible') ? openCrudCategoriesOverlay({target: $(e.target).closest('button'), position: 'bottom left', crudOpr: 'new'}) : notif.hide($('.notifyjs-product-categories-base')) : notif.show({ el: $(e.target), title: `<div class="txt-center"><small><i class="fa fa-warning fa-2x"></i><br/>You are not allowed to manage stock.</small></div>`, className: 'error', styleName: 'access-denied-manage-stock', position: 'bottom left', autoHide: true });          
        }); 

        tableCategories = new Tabulator("#categories-table", {
            height: "calc(100vh - 200px)",
            // data: resp.data,           //load row data from array
            layout: "fitColumns",
            // responsiveLayout: "collapse",  //hide columns that dont fit on the table   
            addRowPos: "top",          //when adding a new row, add it to the top of the table
            history: true,             //allow undo and redo actions on the table        
            initialSort: [             //set the initial sort order of the data
                // {column: "CAT", dir: "asc"},
                {column: "cat_name", dir: "asc"},
            ],
            index: "cat_id",
            // groupBy: "CAT",
            // autoColumns: true,
            selectable: 1,
            columns: [                 
                //define the table columns
                {title: "#", headerSort: false, formatter: "rownum", width: 30},
                {title: "", field: "cat_id", visible: false},
                {title: "COLOR", field: "color", headerSort: false, hozAlign: 'right', formatter: "color", width: 50, download: false },
                {title: "CATEGORY", field: "cat_name", formatter: (cell, formatterParams) => cell.getValue() && `${_.toUpper(cell.getValue())}[&nbsp;<b>${_.size(tableStock.searchData("cat_id", "=", cell.getData().cat_id))}</b>&nbsp;]`, accessorDownload: (value, data, type, params, column) => value.toUpperCase(), minWidth: 115, validator: "required"},
                {title: "", field: "", width: 30, headerSort: false, hozAlign: "center", tooltip: "Delete", formatter: (cell, formatterParams, onRendered) => { return cell.getData()['cat_id'] != undefined && "<i class='fa fa-trash fa-2x clr-danger' onclick=''></i>" || ''; }, print: false, cellClick: (e, cell) => {
                    cell.getData()['cat_id'] != undefined &&
                    alertify.confirm("Confirm Delete", `<div class="txt-center">Are you sure you want to remove <br/><br/><b>${cell.getData().cat_name.toUpperCase()}</b><br/><br/> from this system ?</div>`, function () {
                    cell.getRow().select();
                    $.post(`./categories/crud.php?delete`, {key: cell.getData().cat_id}, resp => {
                        if(resp.deleted){
                            cell.getRow().toggleSelect();
                            tableCategories.deleteRow(cell.getData().cat_id)
                            .then(() => {
                                appSounds.oringz.play();
                                alertify.error('Deleted');
                                genColorLbls(0);
                                popCategories()
                                .then(data => {
                                    // console.log(data)     
                                    tableCategories.setData(data);
                                    $("#cat_name").trigger('focus');
                                });
                            })
                            .catch(error => {
                                //handle error deleting row
                                console.log(error);
                            });
                        }
                    }, 'JSON');
                }, function () { }).set('labels', { ok: `I Know, Proceed`, cancel: 'Huh, Abort!' });
                }},
            ],
            printRowRange: "all",
            placeholder: "No Data Available", //display message to user on empty table
        });        

        tableCategories.on("tableBuilding", () => {
            // alert("tableBuilding")
            $(".my-tabulator-buttons").addClass('disabled');
        });

        tableCategories.on("tableBuilt", () => {
            // alert("tableBuilt")
            $(".my-tabulator-buttons").removeClass('disabled');
        });

        tableCategories.on("rowSelected", row => {
            openCrudCategoriesOverlay({target: $("#createCategories"), position: 'bottom left', crudOpr: 'update', data: row.getData()});
        });

        tableCategories.on("rowDeselected", row => {
            resetCrudCategories(prevActiveLblColor);
            $("#cat_name").trigger('focus');
        })

        $(document).on('click', '#printCategories', e => {
            printTableData({table: tableCategories, title: "Stock Groups / Categories"});
        });

        $(document).on('click', '#exportCategories_excel', e => {
            exportTableData({table: tableCategories, type: "xlsx", fileName: "data.xlsx", opts: { sheetName: "My Data" } })
        });

        $(document).on('click', '#exportCategories_pdf', function(e){
            exportTableData({table: tableCategories, type: "pdf", fileName: "data.pdf", 
                opts: {
                    orientation: "portrait", //set page orientation to portrait
                    title: "Stock Groups / Categories", //add title to report
                    autoTable: { //advanced table styling
                        styles: {
                            // fillColor: [100, 255, 255]
                        },
                        columnStyles: {
                            // id: {fillColor: 255}
                        },
                        margin: {right: 5, bottom: 5, left:5},
                    },
                } 
            });
        }); 

        popCategories()
        .then(data => {
            // console.log(data)     
            tableCategories.setData(data);        
        });
    });

    const searchTableData = params => {
        let key = params.e.keyCode || params.e.which, filters = [];
        _.map(params.table.getColumns(), col => {
            filters = [...filters, {field: col.getField(), type: "like", value: _.trim(params.searchStr)}]
        });
        params.table.setFilter([
            // {},
            filters
        ]);     
        key == 13 && $(params.e.target).val('');
    }
    $('#search_categories, #search_stock').trigger('input keyup');
    
    $(document).on('input keyup', '#search_categories', e => {
        searchTableData({e, table: tableCategories, searchStr: e.target.value});
    });

    $(document).on('input keyup', '#search_stock', e => {
        searchTableData({e, table: tableStock, searchStr: e.target.value});
    });

    let barcodeTags, stockPhotos ;
    const openCrudStockOverlay = params => {
        // console.log(params);

        notif.show({ 
            el: params.target, 
            title: `    
                    <div id="overlay_crudStock" style="width: calc(100vw - 7vw); max-width: 768px; overflow-y: auto; background: aliceblue;">
                        <div style="display: flex; justify-content: space-between; align-items: center; box-shadow: 0 3px 10px 0 rgba(0, 0, 0, .4);">
                            <section style="display: grid; grid-template-columns: auto auto; gap: 20px; align-items: center;">
                                <a href="javascript:void(0);" class="close no-udl clr-default" style="transform: scale(1.5); padding: 10px;" onclick="notif.hide($('.notifyjs-crud-stock-base'));"><i class="fa fa-chevron-left"></i></a> 
                                <span style="text-overflow: ellipsis; overflow: hidden; whitespace: nowrap;">${params.crudOpr == 'new' ? '<u>N</u>ew Stock' : `<u>U</u>pdate <b>${_.toUpper(params.data.item)}`}</b></span>
                            </section>
                            <button type="button" class="btn clr-${params.crudOpr == 'new' ? 'primary' : 'success'}" onclick="$(event.target).closest('#overlay_crudStock').find('#btnSubmitForm').trigger('click');" style="margin: 0 10px; background: none; border: none;">${params.crudOpr == 'new' ? '<i class="fa fa-save"></i> Save' : '<i class="fa fa-pencil"></i> Update'}</button>
                        </div>
                        <div id="content" style="height: calc(100vh - ${window.matchMedia('(max-width: 768px)').matches ? 290 : 230}px); overflow-y: auto;">
                            <form role="form" id="crudStock" autocomplete="off">
                                <div class="row">
                                    <div class="cl-3 cm-3 cs-5 cx-12">
                                        <div class="form-group">
                                            <div class="select-container">
                                                <select name="cat_id" id="cat_id" class="cat_id" value="${params.crudOpr == 'update' ? params.data.cat_id : ''}" required>
                                                    <option value="">--- select ---</option>                                           
                                                </select>
                                                <label for="cat_id" class="floated-up-lbl" style="top: -5px;">Category</label>
                                                <sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="cl-5 cm-5 cs-7 cx-9">
                                        <div class="form-group">
                                            <input autocomplete="off" type="text" name="item" id="item" maxlength="50" class="txt-u auto-suggest" required>
                                            <label for="item" class="floated-up-lbl">Product Name</label>
                                            <sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>
                                        </div>
                                    </div>                                     
                                    <div class="cl-2 cm-2 cs-3 cx-3">
                                        <div class="form-group">
                                            <input autocomplete="off" type="number" step=".01" min="0" name="cp" id="cp" required>
                                            <label for="cp" class="floated-up-lbl">Unit Cost</label>
                                            <sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>
                                        </div>
                                    </div>                            
                                    <div class="cl-2 cm-2 cs-3 cx-4">
                                        <div class="form-group">
                                            <div>
                                                <input autocomplete="off" type="number" step=".01" min="0" name="qty" id="qty" required>
                                                <label for="qty" class="floated-up-lbl">Qty (pcs)</label>
                                                <sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>
                                            </div>
                                        </div>
                                    </div>                                    
                                    <div class="cl-1 cm-1 cs-2 cx-3">
                                        <div class="form-group">
                                            <input autocomplete="off" type="number" step="1" min="0" name="restock" id="restock" placeholder="pcs">
                                            <label for="restock" class="floated-up-lbl">Restock</label>
                                        </div>
                                    </div>
                                    <div class="cl-3 cm-3 cs-4 cx-5">
                                        <div class="form-group">
                                            <div class="date-container">
                                                <input type="date" name="expdate" id="expdate">
                                                <label for="expdate" class="floated-up-lbl" style="top: -5px;">Expiry Date</label>
                                            </div>
                                        </div>
                                    </div>                                        
                                    <div class="cl-3 cm-3 cs-5 cx-5">
                                        <div class="form-group">
                                            <div class="select-container">
                                                <select name="currency" id="currency" class="currency" required>                                          
                                                    ${_.map(currencies, currency => `<option value="${currency.currency_id}" ${currency.is_default == 1 ? 'selected' : ''}>${currency.code} (${currency.symbol}) ${currency.is_default == 1 ? ' - Default' : ''}</option>`)}
                                                </select>
                                                <label for="currency" class="floated-up-lbl" style="top: -5px;">Currency</label>
                                                <sup class="required"><i class="fa fa-asterisk clr-danger"></i></sup>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="cl-2 cm-2 cs-2 cx-2">
                                        <div class="form-group">
                                            <input readonly autocomplete="off" type="number" step=".01" min="0" name="exch_rate" id="exch_rate" value="${_.find(currencies, currency => currency.is_default == 1).exch_rate}">
                                            <label for="exch_rate" class="floated-up-lbl" style="top: -5px;">Exch. Rate</label>
                                        </div>
                                    </div>
                                    <div class="cl-2 cm-2 cs-3 cx-3">
                                        <div class="form-group">                                                    
                                            <div class="select-container">
                                                <select name="rate_factor" id="rate_factor" required>                                          
                                                    ${_.map(currencies, currency => currency.currency_id == currency.is_default && _.map(_.split(currency.factor, ','), factor => `<option value="${factor}">${factor}</option>`))}
                                                    <option value="custom">Custom</option>
                                                </select>
                                                <label for="rate_factor" class="floated-up-lbl" style="top: -5px;">Rate Factor</label>
                                            </div>
                                        </div>
                                    </div>  
                                    <div class="cl-1 cm-1 cs-2 cx-2">
                                        <div class="form-group">
                                            <div class="checkbox" style="padding-top: 15px;">
                                                <input hidden ${params.crudOpr == 'new' ? 'checked' : ''} type="checkbox" name="isActive" id="isActive" class="custom-checkbox" value="1"><label for="isActive" style='cursor: pointer;'>&nbsp;Yes</label>
                                            </div>
                                            <label for="isActive" class="floated-up-lbl" style="top: -5px;">Active?</label>
                                        </div>
                                    </div>                        
                                </div>
                                <button hidden type="submit" class="btn btn-default ${params.crudOpr == 'new' ? 'new' : 'update'}" id="btnSubmitForm">${params.crudOpr}</button>
                            
                                <div class="row">
                                    <div class="cl-4 cm-4 cs-4 cx-12">
                                        <small style="margin-left: 10px;"><b>Multi-barcodes</b>?</small> 
                                        <div class="form-group">
                                            <div class="simple-tags barcodes"></div>
                                            <label hidden for="barcode" class="floated-up-lbl" style="top: -5px;">Barcode</label>
                                        </div>  
                                        <div class="cl-12 cm-12 cs-12 cx-12">
                                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                                <small style="margin-left: 10px;"><b>Add Photos</b>?</small> 
                                                <a href="javascript:void(0);" style="margin-right: 10px;" id="toggleUppyTheme"><i class="fa fa-sun-o"></i></a>
                                            </div>
                                            <div class="form-group">
                                                <div id="uppy-stock-photos"></div>
                                            </div>
                                        </div>                                      
                                    </div>
                                    <div class="cl-8 cm-8 cs-8 cx-12">                                   
                                        <small style="margin-left: 10px;"><b>Price-Per-Quantity</b>? Set multiple prices:</small> 
                                        <div id="stockPPQ">
                                            ${PPQRow()}
                                        </div>
                                    </div>
                                    
                                    
                                    <button type="button" hidden id="btnOpenModalUppyFiles">Open Uppy</button>
                                </div>
                            </form>
                        </div>
                    </div>
            `, 
            styleName: 'crud-stock', 
            className: 'default', 
            autoHide: false, 
            clickToHide: false, 
            position: params.position 
        }); 
        
        stockPhotos = myUploader({
            uppyID: 'stockPhotos', 
            restrictions: {
                maxFileSize: 1024000,
                minFileSize: null,
                maxTotalFileSize: 3072000,
                maxNumberOfFiles: 3,
                minNumberOfFiles: null,
                allowedFileTypes: ['.jpg', '.jpeg', '.png'],
                requiredMetaFields: [],
            },
            plugins: {
                Dashboard: {
                    id: `Dashboard`,
                    theme: 'light',
                    trigger: '#btnOpenModalUppyFiles',
                    inline: true,
                    target: '#uppy-stock-photos',
                    showProgressDetails: true,
                    note: `Images only, 3 files, up to 1 MB`,
                    height: 'auto',
                    waitForThumbnailsBeforeUpload: true,
                    // showRemoveButtonAfterComplete: true,
                    doneButtonHandler: () => {},
                    browserBackButtonClose: false,
                    plugins: ['Webcam', 'ScreenCapture', 'ImageEditor', 'XHRUpload'],
                    proudlyDisplayPoweredByUppy: false,
                    waitForThumbnailsBeforeUpload: true,
                    validateStatus(statusCode, responseText, response){
                        console.log(statusCode, responseText, response)
                    },
                    hideUploadButton: true,
                    locale: {
                        strings: {
                            // dropPasteImportFiles: 'Drop files here, %{browseFiles} or import from:',
                            dropPasteImportFiles: `Drop files or %{browseFiles}`,
                        }
                    },
                },
                Webcam: { target: Uppy.Dashboard },
                ScreenCapture: { target: Uppy.Dashboard },
                ImageEditor: { target: Uppy.Dashboard },
                XHRUpload: { endpoint: './crud.php', bundle: true, formData: true, fieldName: 'files[]'},
                DropTarget: { target: document.body }
            },
            callbacks: {
                complete: result => {
                    console.log("Files Response: ", result.successful[0].response.body)
                    console.log("Upload complete! We've uploaded these files:", result.successful)
                }
            }
        });

        barcodeTags = new Tagify(
            document.querySelector('.barcodes'), 
            {
                placeholder: 'Scan barcode',
                delimiters: ",",           
            }
        );

        _.forEach(categoriesList, cat => {
            $("#overlay_crudStock .cat_id").append(`
                <option value="${cat.cat_id}">${_.toUpper(cat.cat_name)}</option>
            `);
        });        
    }
    
    $(document).on('click', "#overlay_crudStock a#toggleUppyTheme", e => {
        // console.log(uppyStockPhotos.getPlugin('Dashboard').opts.theme)
        let { theme } = stockPhotos.getPlugin('Dashboard').opts;
        $(e.target).closest('a#toggleUppyTheme').html(`<i class="fa fa-${theme == 'light' ? 'moon' : 'sun'}-o"></i>`);
        stockPhotos.getPlugin('Dashboard').setOptions({
            // width: 300,
            theme: theme == 'dark' ? 'light' : 'dark'
        })
    });

    $(document).on('focusin click', "#overlay_crudStock input, #overlay_crudStock select", e => {
        if(!$(e.target).hasClass('auto-suggest')){
            $("#table-auto-suggest").remove();
            $(".notifyjs-autoComplete-item-base").closest('.notifyjs-wrapper').slideUp();
        };
    });

    $(document).on('change', "#overlay_crudStock #currency", e => {
        // console.log($('#currency option:selected').prop('value'))
        let { exch_rate, factor, is_default } = _.find(currencies, currency => currency.currency_id == $('#currency option:selected').prop('value')),
            { factor: defaultFactor } = _.find(currencies, currency => currency.is_default);
        $('#overlay_crudStock #rate_factor').html('').append(_.map(_.split(factor, ','), factor => `<option value="${factor}">${factor}</option>`)).append(`<option value="custom">Custom</option>`);
        $('#overlay_crudStock #exch_rate').val(exch_rate);
        $("#overlay_crudStock #cp, #overlay_crudStock #ppq_rate").trigger('blur');
        $("#overlay_customRateFactor a.close").trigger('click');
    });

    // CALCULATE RATE PER RATE FACTOR
    const calcRATE = params => {
        console.log(currencies)
            let { exch_rate, is_default } = _.find(currencies, currency => currency.currency_id == $('#currency option:selected').prop('value')),
                factor = $("#overlay_customRateFactor").is(':visible') ? $('#overlay_customRateFactor #customRateFactor').val() : $('#overlay_crudStock #rate_factor').val();
        // console.log("is visible: ", $("#overlay_customRateFactor").is(':visible'), $('#overlay_customRateFactor #customRateFactor').val())
            return {
                exch_rate,
                is_default,
                factor,
                amt: (params.value * exch_rate).toFixed(2),
                amt_factor: (params.value * exch_rate).toFixed(2) * factor
            }
    }

    $(document).on('blur', "#overlay_crudStock #cp", e => {
        let { id, value } = e.target,
            { is_default, factor, amt, retail } = calcRATE({value}),
            price = amt;
        if(value != ""){
            $("#overlay_crudStock #cp").val(price);
            $("#overlay_crudStock #ppq_rate").val((_.toNumber($("#overlay_crudStock #cp").val()) * factor).toFixed(2));
        }
    });

    $(document).on('input', "#overlay_crudStock #cp", e => {
        let { is_default, amt, amt_factor } = calcRATE({value: e.target.value});
        $("#overlay_crudStock #ppq_rate").val(amt_factor.toFixed(2));
    });

    $(document).on('change', "#overlay_crudStock #rate_factor", e => {
        let { target } = e, { value } = target;
        if(value == "custom"){
            notif.show({
                el: $(target),
                title: `
                    <div id="overlay_customRateFactor" style="width: ${$(target).width()-10}px;">
                        <div class="" style="margin-top: 10px;">
                            <input autocomplete="off" type="number" step=".01" min="0" name="customRateFactor" id="customRateFactor">
                            <label for="customRateFactor" class="floated-up-lbl" style="top: -5px;">Value</label>
                            <a href="javascript:void(0);" class="close no-udl bg-default clr-danger" style="visibility: collapse; position: absolute; top: -17px; right: -7px; padding: 2px 5px; border-radius: 50%;" onclick="$(event.target).closest('.notifyjs-wrapper').remove();">&times;</a>
                        </div>
                    </div>
                `,
                styleName: 'custom-rateFactor',
                className: 'default',
                position: `top right`,
                autoHide: false,
                clickToHide: false
            });

            let sto = setTimeout(() => {
                clearTimeout(sto);
                $('#overlay_customRateFactor #customRateFactor').trigger('focus');
            }, 500);
        }
        else{
            $("#overlay_customRateFactor a.close").trigger('click')
        }
        $("#overlay_crudStock #cp").trigger('input');
    });

    $(document).on('input', '#overlay_customRateFactor #customRateFactor', e => {
        $("#overlay_crudStock #cp").trigger('input');
    });

    const autoSuggest = params => {
        // console.log(params); 
        if(params.eventType != "input" && params.eventType != "keyup"){
            $("#table-auto-suggest").remove();
            $(".notifyjs-autoComplete-item-base").closest('.notifyjs-wrapper').slideUp();
            notif.show({
                el: $(params.target),
                title: `
                    <div id="overlay_autoSuggest" style="width: ${$(params.target).width()-10}px;">
                        <div id="table-auto-suggest"></div>
                    </div>
                `,
                styleName: 'autoComplete-item',
                className: 'default',
                position: `${params.dataType == "item" ? 'bottom' : 'top'} left`,
                autoHide: false,
                clickToHide: false
            });
        }
        
        if(_.size($("#table-auto-suggest")) > 0) {
            let tableAutoSuggest = new Tabulator(`#table-auto-suggest`, {
                maxHeight: 80,
                layout: "fitColumns",
                placeholder: "No match found",
                headerVisible: false,
                rowClick: (e, row) => {
                    // let data = row.getData();
                    $(params.target).val(row.getData()[params.dataType]);
                    $("#table-auto-suggest").remove();
                    $(".notifyjs-autoComplete-item-base").closest('.notifyjs-wrapper').slideUp();
                },
                rowFormatter: row => {
                    let rowEl = row.getElement(), data = row.getData();
                    rowEl.style = params.dataType == "stocks" ? data.active == 1 ? '' : "color: red; opacity: 0.5;" : '';
                }
            }); 
            if(params.dataType == "item"){
                tableAutoSuggest.setColumns([
                    {title: "Product", field: "item", formatter: (cell, formatterParams, onRendered) => _.toUpper(cell.getValue())},
                    {title: "Status", field: "active", align: "right", width: 80, visible: false },
                ]);
                tableAutoSuggest.setData(tableStock.searchData('item', 'like', params.searchTerm));   
                tableAutoSuggest.setSort("item", "asc");
            }
            else if(params.dataType == "um"){
                tableAutoSuggest.setColumns([
                    {title: "Unit Measure", field: "um", formatter: (cell, formatterParams, onRendered) => _.toUpper(cell.getValue())}
                ]);
                tableAutoSuggest.setData(_.filter(unitMeasures, entry => entry.um.toLowerCase().includes(params.searchTerm.toLowerCase())));   
                tableAutoSuggest.setSort("um", "asc");
            }
        }
        else{
            $("#table-auto-suggest").remove()
        }
    }
    
    $(document).on('focusin keyup input', '#overlay_crudStock #item, #overlay_crudStock #ppq_lbl', e => { 
        e.target.id == "item" && autoSuggest({target: e.target, eventType: e.type, dataType: 'item', searchTerm: e.target.value});
        e.target.id == "ppq_lbl" && autoSuggest({target: e.target, eventType: e.type, dataType: 'um', searchTerm: e.target.value});
    });

    $('#createStock').on('click', e => { 
        pageRights.create_stock ? !$("#overlay_crudStock").is(':visible') ? openCrudStockOverlay({target: $(e.target).closest('button'), position: 'bottom left', crudOpr: 'new'}) : notif.hide($('.notifyjs-crud-stock-base')) : notif.show({ el: $(e.target), title: `<div class="txt-center"><small><i class="fa fa-warning fa-2x"></i><br/>You are not allowed to create stock.</small></div>`, className: 'error', styleName: 'access-denied-create-stock', position: 'bottom left', autoHide: true });      
    }); 
    
    const genBarcode = len => {
        // auto generate barcode of fixed length
        let barcode = "";
        let barcode_length = len;
        let barcode_chars = "0123456789";
        let barcode_chars_length = barcode_chars.length;
        for (let i = 0; i < barcode_length; i++) {
            barcode += barcode_chars.charAt(Math.floor(Math.random() * barcode_chars_length));
        }        
        $("#overlay_crudStock #barcode").val(barcode);
    }
    
    $(document).on('click', '#overlay_crudStock #btnGenBarcode', e => {
        genBarcode(13)
    });

    $(document).on('click', "#overlay_crudStock #btnRemovePPQ", e => {
        if(_.size($(e.target).closest('#stockPPQ').find('.row')) > 1){
            ppq.splice($(e.target).closest('.row').index(), 1)
            $(e.target).closest('.row').remove();       
        }
    });

    const PPQRow = params => {
        let { lbl, qty, rate } = params ? params.data : {};        
        return `
            <div class="row">
                <div class="cl-4 cm-4 cs-4 cx-4">
                    <div class="form-group">
                        <div>
                            <input autocomplete="off" type="text" class="auto-suggest" maxlength="10" name="ppq_lbl" id="ppq_lbl" value="${lbl ?? ''}">
                            <label for="ppq_lbl" class="floated-up-lbl">Price Label</label>
                        </div>
                        <small class="clr-primary"><i class="fa fa-exclamation-circle"></i> Max. Chars: 10</small>
                    </div>
                </div>
                <div class="cl-3 cm-3 cs-3 cx-3">
                    <div class="form-group">
                        <input autocomplete="off" type="number" step=".01" min="0" name="ppq_qty" id="ppq_qty" value="${qty}">
                        <label for="ppq_qty" class="floated-up-lbl">Quantity</label>
                    </div>
                </div>
                <div class="cl-3 cm-3 cs-3 cx-3">
                    <div class="form-group">
                        <input autocomplete="off" type="number" step=".01" min="0" name="ppq_rate" id="ppq_rate" value="${rate}">
                        <label for="ppq_rate" class="floated-up-lbl">Selling Price</label>
                    </div>
                </div>
                <div class="cl-2 cm-2 cs-2 cx-2">
                    <div class="form-group txt-right">
                        <a href="javascript:void(0);" class="no-udl clr-default" id="btnRemovePPQ" style="font-size: 2em; padding: 5px;">&times;</a>
                    </div>
                </div>
            </div>
        `;
    }
    
    $(document).on('blur', '#overlay_crudStock #stockPPQ input', e => {
        !_.filter($(e.target).closest('.row').find('input'), (input, i) => input.value == "").length && $(e.target).closest('.row').is(":last-child") && $(e.target).closest('#stockPPQ').append(PPQRow());
        scrollToBottom({el: $("#overlay_crudStock #content"), duration: 2000});
    });
    
    let ppq = [];
    const addToPPQ = nonEmptyRows => {
        _.forEach(_.filter(nonEmptyRows, row => row > -1), row => {
            let rowEl = $("#overlay_crudStock").find(`#stockPPQ .row:eq(${row})`);
            ppq[row] = { lbl: rowEl.find(`input:eq(${0})`).val(), qty: rowEl.find(`input:eq(${1})`).val(), rate: rowEl.find(`input:eq(${2})`).val()};
        });
        return ppq;
    },
    resetPPQ = () => {
        $("#overlay_crudStock").find('#stockPPQ .row').find('input').val('');
        $("#overlay_crudStock").find('#stockPPQ .row').not(':first-child').remove();
    } 

    $(document).on('submit', "#overlay_crudStock form#crudStock", e => {
        let nonEmptyRows = [];
        _.forEach($("#overlay_crudStock").find('#stockPPQ .row input'), (input, i) => input.value == "" ? $(input).closest('.row').remove() : nonEmptyRows.push($(input).closest('.row').index()))
        addToPPQ(_.uniq(nonEmptyRows));   
        
        let formData = new FormData(e.target),
            crud_type = $(e.target).find('[type="submit"]').hasClass('new') ? 'new' : 'update',
            { prod_id, photos } = crud_type != "new" ? tableStock.getSelectedData()[0] : {prod_id: null, photos: null},
            fileNames = _.map(stockPhotos.getFiles(), file => file.name);
            // console.log(prod_id, fileNames, JSON.parse(photos), _.xor(JSON.parse(photos), fileNames));

        // JSON fields
        formData.append('ppq', JSON.stringify(ppq));
        formData.append('currency', JSON.stringify({id: $("#overlay_crudStock #currency").val(), exch_rate: $("#overlay_crudStock #exch_rate").val(), factor: $("#overlay_customRateFactor").is(':visible') ? $('#overlay_customRateFactor #customRateFactor').val() : $('#overlay_crudStock #rate_factor').val()}));
        
        // ASSERT OPERATION TYPE FOR PRODUCT ID UPDATE
        if(crud_type == 'update'){
            formData.append('prod_id', prod_id);
            _.size(_.xor(fileNames, JSON.parse(photos))) > 0 && formData.append('oldFiles', JSON.stringify(_.xor(fileNames, JSON.parse(photos))));
        }
        
        // MAP ALL BARCODES TO ARRAY AND APPEND TO FORM DATA
        formData.append('barcode', JSON.stringify(_.map(barcodeTags.getTagElms(), el => _.toNumber(el.innerText))));

        // APPEND FILE OBJECT TO FORMDATA
        ((crud_type == "new" || _.size(_.difference(fileNames, JSON.parse(photos))) > 0)) && _.map(stockPhotos.getFiles(), (file, i) => formData.append(`files[${i}]`, file.data, file.name));
        // _.size(stockPhotos.getFiles()) > 0 && stockPhotos.upload()
        // .then((result) => {
        //     console.info('Successful uploads:', result.successful)
          
        //     if (result.failed.length > 0) {
        //       console.error('Errors:')
        //       result.failed.forEach((file) => {
        //         console.error(file.error)
        //       })
        //     }
        // });

        $.ajax({
            url: `./crud.php?stocks&${crud_type}&emp_id=${activeUser.id}`,
            type: "POST",
            dataType: 'JSON',
            data: formData,
            processData: false,
            contentType: false,
            cache: false,
            success: resp => {
                console.log("Crud Stock Response: ", resp);
                if (resp.saved || resp.updated) {
                    resp.updated && notif.hide($('.notifyjs-crud-stock-base')); 
                    if(resp.saved){
                        pop('./crud.php?stocks&pop')    // REQUERY ALL STOCKS FROM SERVER
                        .then(resp => {
                            tableStock.replaceData(resp.data);    // REPLACE TABLE DATA WITH RESPONSE DATA
                        }); 
                        // AuditLogs.post({plot: 'create', activity: `${_.startCase(_.toLower(activeUser.name))} created a New Stock item ${$("#overlay_crudStock #item").val()}.`}) 
                    }
                    else{
                        if(resp.updated){
                            notif.hide($('.notifyjs-crud-stock-base'));                  
                            let updatedDataSet = {};
                            for(let pair of formData.entries()){
                                updatedDataSet[pair[0]] = pair[1];
                                // console.log("updatedDataSet: ", pair[0], pair[1]);
                            }
                            updatedDataSet.active = _.isUndefined(updatedDataSet.isActive) ? 0 : 1;
                            
                            // IF D/F IN FILES, OVERWRITE PHOTOS COLUMN WITH STRINGIFIED PHOTOS OBJECT
                            _.size(_.xor(fileNames, JSON.parse(photos))) > 0 ? updatedDataSet.photos = JSON.stringify(!resp.is_uploaded_files ? (resp.updatePhotos == "NULL" ? undefined : JSON.parse(photos)) : resp.myFileUploaderFiles) : '';

                            let updatePricingRowData = {cp: updatedDataSet.cp, qty: updatedDataSet.qty, ppq: JSON.stringify(ppq)};     // GET ROW DATA OBJECT TO COMPUTE RETAIL PRICING FOR PRODUCT

                            updatedDataSet.xcp = _.toNumber(ItemModel.xcp({item: updatePricingRowData}))
                            updatedDataSet.wp = _.toNumber(ItemModel.wp({item: updatePricingRowData})) || ''
                            updatedDataSet.wp_qty = _.toNumber(ItemModel.xwp({item: updatePricingRowData})) || ''
                            updatedDataSet.xwp = _.toNumber(ItemModel.xwp({item: updatePricingRowData})) || ''
                            updatedDataSet.mwp = _.toNumber(ItemModel.mwp({item: updatePricingRowData})) || ''
                            updatedDataSet.rp = _.toNumber(ItemModel.rp({item: updatePricingRowData}))
                            updatedDataSet.xrp = _.toNumber(ItemModel.xrp({item: updatePricingRowData}))
                            updatedDataSet.mrp = _.toNumber(ItemModel.mrp({item: updatePricingRowData}))
                            
                            // console.log("updatedDataSet: ", updatedDataSet);

                            // SILENT UPDATE ROW DATA
                            tableStock.updateRow(prod_id, updatedDataSet);
                            tableStock.getRow(prod_id).reformat();
                            // tableStock.setGroupBy('cat_id');

                            appSounds.oringz.play();
                        }
                    }
                    alertify.success(resp.saved && "Saved" || 'Updated.');                        
                    loadDashboardFilters({data: resp.data});    // LOAD STOCK DASHBOARD METRICS    
                    $(e.target)[0].reset();     // RESET ALL FORM CONTROLS FOR STOCK C_U_
                    resetPPQ();
                    ppq.splice(0, _.size(ppq));
                    barcodeTags.removeAllTags();
                    stockPhotos.reset();                        
                    $("#overlay_customRateFactor a.close").trigger('click');    // CLOSE CUSTOM RATE-FACTOR OVERLAY
                }
                else {
                    // console.log(resp);
                    notif.show({  el: $(e.target).find('#item'), title: `<div>Item already exists.</div>`,  styleName: 'duplicate-stock-flag', className: 'danger', autoHide: false, clickToHide: true, position: 'bottom center' }); 
                }
                $(e.target).find('input, select, button').prop('disabled', false);
                barcodeTags.setDisabled(false);
                stockPhotos.getPlugin('Dashboard').setOptions({ disabled: false });
            },
            beforeSend: function () {
                barcodeTags.setDisabled(true);
                notif.hide($(".notifyjs-duplicate-stock-flag-base"));
                $(e.target).find('input, select, button').prop('disabled', true);
                stockPhotos.getPlugin('Dashboard').setOptions({ disabled: true });
            }
        });
        
        return false;
    });

    $(document).on('click', '#printStock', e => {
        printTableData({table: tableStock, title: "GENERAL STOCK OVERVIEW"});
    });

    $(document).on('click', '#exportStock_excel', e => {
        exportTableData({table: tableStock, type: "xlsx", fileName: `${_.toUpper(companyProfile[0].comp_name)} STOCKS.xlsx`, opts: { sheetName: "My Data" } })
    });

    $(document).on('click', '#exportStock_pdf', function(e){
        exportTableData({table: tableStock, type: "pdf", fileName: "data.pdf", 
            opts: {
                orientation: "portrait", //set page orientation to portrait
                title: "General Stock Report", //add title to report
                autoTable: { //advanced table styling
                    styles: {
                        // fillColor: [100, 255, 255]
                    },
                    columnStyles: {
                        // id: {fillColor: 255}
                    },
                    margin: {right: 5, bottom: 5, left:5},
                },
            } 
        }) 
    });
    
    $(document).on('click', '#btnToggleButtons', e => {
        // $(".btnGroup").find('button').css({'display': 'grid', 'grid-template-columns': 'repeat(5, auto)'})
        // $("#togleBtnsWrapper").toggleClass('open').html($(".btnGroup").html());
        // $("#togleBtnsWrapper").toggleClass('open').html($(".btnGroup").find("button:not(#btnToggleButtons)"));
    });




    /*** 
        * STOCK-TAKING *
    ***/
    for (let y = 2017; y <= moment().year(); y++) {
        $("#period_year").append(`<option value="${y}" ${y == moment().year() ? 'selected' : ''}>${y}</option>`);        
    }
    $(`#period_qtr option[value="${moment().quarter()}"]`).prop('selected', true);

    var tableStockCount = new Tabulator("#stockCount-table", {
        height: 'calc(100vh - 200px)',
        // data: resp.data,           //load row data from array
        layout: "fitColumns",  
        // responsiveLayout: "collapse",  //hide columns that dont fit on the table  
        addRowPos: "top",          //when adding a new row, add it to the top of the table
        history: true,             //allow undo and redo actions on the table        
        initialSort: [             //set the initial sort order of the data
            {column: "item", dir: "asc"},
            {column: "cat_name", dir: "asc"}
        ],
        groupHeader: (value, count, data, group) => {
            return value ? value.toUpperCase() + `<span style='color:#d00; margin-left:10px;'>(${count} ${count > 1 ? 'items' : 'item'})</span>` : '<span style="background: #000; color: lime;">TOTAL AMOUNT</span>';
        },
        index: "prod_id",
        groupBy: "cat_name",
        // autoColumns: true,        
        columns: [                 
            //define the table columns
            {title: "#", field: "sn", headerSort: false, formatter: "rownum", width: 50},
            {title: "", field: "prod_id", visible: false},
            {title: "CATEGORY", field: "cat_name", editableTitle:true, headerSort: false, width: 120, visible: false },
            {title: "DESCRIPTION", field: "item", editableTitle:true, formatter: (cell, formatterParams, onRendered) => cell.getValue() && cell.getValue().toUpperCase() || "" },
            {title: "BARCODE", field: "barcode", editableTitle:true, visible: false },
            {title: "SYSTEM QTY", field: "qty", editableTitle:true, formatter: 'money', formatterParams: { precision: 0 }, headerHozAlign: 'center', hozAlign: 'right', tooltip: true, bottomCalc: 'sum', },
            {title: "COUNT QTY", field: "physical_count", formatter: (cell, formatterParams, onRendered) => cell.getValue() > 0 ? cell.getValue() : '', editableTitle: true, editor: "number", editorParams:{ min:0, step: 1, elementAttributes:{ maxlength:"10" }}, headerHozAlign: 'center', hozAlign: 'right', bottomCalc: 'sum', },
            {title: "DAMAGED", field: "damaged_count", formatter: (cell, formatterParams, onRendered) => cell.getValue() > 0 ? cell.getValue() : '', editableTitle: true, editor: "number", editorParams:{ min:0, step: 1, elementAttributes:{ maxlength:"10" }}, headerHozAlign: 'center', hozAlign: 'right', bottomCalc: 'sum', },
            {title: "DIFFERENCE", field: "difference", editableTitle: true, headerHozAlign: 'center', hozAlign: 'right', },
            {title: "UNIT COST", field: "cp", editableTitle: true, formatter: 'money', hozAlign: 'right' },
            {title: "AMOUNT", field: "amt", editableTitle: true, formatter: (cell, formatterParams, onRendered) => cell.getValue() > 0 ? thousandsSeperator(cell.getValue()) : '', formatterParams: { precision: 2 }, hozAlign: 'right', bottomCalc: 'sum' },
        ],
        pagination: "local",       //paginate the data
        paginationSize: 100,         //allow 7 rows per page of data
        paginationSizeSelector: true, //enable page size select element and generate list options
        printAsHtml: true, //enable html table printing
        printStyled: true, //copy Tabulator styling to HTML table
        printRowRange: "all",
        // printVisibleRows: false,
        // printFooter: `<div style="display: flex; justify-content: space-between; align-items: center;"><p>MyShop OS v0.2</p><p>Software By: Samad Kanton</p></center>`,
        placeholder: "No Data Available", //display message to user on empty table
    }); 

    tableStockCount.on("cellEditCancelled", (e, cell, onRendered) => {
        //cell - cell component        
    });

    tableStockCount.on("cellEdited", (e, cell, onRendered) => {
        //cell - cell component
        if(cell.isValid()){
            let { prod_id, physical_count, damaged_count } = cell.getData();
            physical_count = physical_count || 0;
            damaged_count = damaged_count || 0;
            $.post(`./crud.php?stockTaking&count&emp_id=${activeUser.id}`, { col: cell.getField(), newValue: cell.getValue() || 0, prod_id, physical_count, damaged_count, period_qtr: $("#period_qtr").val(), period_year: $("#period_year").val() }, resp => {
                // console.log(resp);
                cell.getTable().updateRow(prod_id, { difference: (_.toNumber(physical_count || 0) + _.toNumber(damaged_count || 0)) - cell.getData().qty, amt: _.toNumber(physical_count || 0) * _.toNumber(cell.getData().cp) });
                if (resp.saved || resp.updated) {
                    appSounds.oringz.play();
                    alertify.success(resp.saved && "Saved" || 'Updated');
                    // cell.getTable().recalc();
                    // popStockTake();
                    cell.getRow().reformat();
                    // recalcStockCount();
                    // console.log(cell.getTable().recalc());
                }
                else {
                    console.log(resp);
                }
            }, 'JSON');
        }
    });
    
    const recalcStockCount = () => tableStockCount.recalc();
    
    const popStockTake = () => {
        $.post(`./crud.php?stockTaking&popCount&emp_id=${activeUser.id}`, { period_qtr: $("#period_qtr").val(), period_year: $("#period_year").val() }, async resp => {
            // console.log(resp.data);
            await (() => {
                if(resp.data.length){
                    let qty, cp, physical_count,damaged_count, difference, amt;
                    _.forEach(_.map(resp.data, 'prod_id'), prod_id => {
                        // console.log(tableStockCount.getRow(prod_id).getData())
                        if(tableStockCount.getRow(prod_id)){
                            qty = tableStockCount.getRow(prod_id).getData().qty;
                            cp = tableStockCount.getRow(prod_id).getData().cp;
                            physical_count = _.find(resp.data, entry => entry.prod_id == prod_id)['physical_count'];
                            damaged_count = _.find(resp.data, entry => entry.prod_id == prod_id)['damaged_count'];
                            difference = (physical_count > 0 || damaged_count > 0) ? (_.toNumber(physical_count) + _.toNumber(damaged_count)) - _.toNumber(qty) : '';
                            amt = (physical_count * cp)
                            tableStockCount.updateRow(
                                prod_id, 
                                { 
                                    physical_count, 
                                    damaged_count,
                                    difference,
                                    amt
                                }
                            );
                        }
                    });
                }
                else{
                    tableStockCount.clearData();
                    tableStockCount.replaceData(_.filter(tableStock.getData()));
                }
            })();

            tableStockCount.addRow([{
                sn: '',
                qty: _.sumBy(tableStockCount.getData(), entry => _.toNumber(entry['qty'] || 0)),
                physical_count: _.sumBy(tableStockCount.getData(), entry => _.toNumber(entry['physical_count'] || 0)),
                damaged_count: _.sumBy(tableStockCount.getData(), entry => _.toNumber(entry['damaged_count'] || 0)),
                amt: _.sumBy(tableStockCount.getData(), entry => _.toNumber(entry['amt'] || 0))
            }], false);
        }, 'JSON');
    }
    
    $(document).on('change', '#period_qtr, #period_year', async function(e){    
       popStockTake();
    });
    
    $(document).on('click', '#btnStockCount', async function(e){    
        $(".ajax-page#overlay_stockCount").addClass('open');
        await tableStockCount.replaceData(_.map(_.filter(tableStock.getData(), entry => !_.isUndefined(entry.item)), entry => {
            return { title: entry.cat_name, prod_id: entry.prod_id, item: entry.item, qty: entry.qty, cp: entry.cp };
        }));
        popStockTake();
    });

    $(document).on('input keyup', '#search_stockCount', e => {    
        let filters = [];
        _.map(tableStockCount.getColumns(), col => filters = [...filters, {field: col.getField(), type: "like", value: _.trim(e.target.value)}]);
        tableStockCount.setFilter([
            // {},
            // Nested filter OR Object
            filters
        ]);
        e.key == 13 || e.which == 13 && $(e.target).val('')
    });

    const getTableColumns = params => {
        _.forEach(_.filter(params.table.getColumns(), col => col.isVisible()), col => {
            let colRename = {
                item: 'Description',
                qty: 'Quantity',
                sn: 'Serial Number',
                physical_count: 'Physical Count',
                damaged_count: 'Damaged Count',
                rp: 'Retail Price',
                difference: 'Difference',
                amt: 'Amount'
            }
            $("#tableStockFieldsPrint").append(`
                <div class="form-group" style="margin-top: 10px;">
                    <div class="checkbox">
                        <input hidden type="checkbox" checked name="toggleStockCountColumns" id="${col.getField()}" value="${col.getField()}" class="custom-checkbox"><label for="${col.getField()}" style='cursor: pointer;'>&nbsp;${colRename[col.getField()]}</label>
                    </div>
                </div>
            `);
        });
    }

    $(document).on('click', '#printStockCount', e => {
        notif.show({
            el: $(e.target).closest('button'), 
            title: `
                <div class="">
                    <div>Choose Fields to Print</div>
                    <div id="tableStockFieldsPrint">
                    </div>
                    <hr/>
                    <div style="display: flex;">
                        <button type="button" class="btn btn-default" id="closeStockCountOverlay">Exit</button>
                        <button type="button" class="btn btn-info" id="printStockCountTable">Print</button>
                    </div>
                </div>
            `, 
            styleName: 'toggle-tableStock-cols',
            position: 'bottom center', 
            className: 'default',
            autoHide: false,
            clickToHide: false
        });

        $("#tableStockFieldsPrint").html('')

        getTableColumns({table: tableStockCount});

        $(document).on('change', '[name="toggleStockCountColumns"]', e => {
            tableStockCount.toggleColumn(e.target.value);
        });
        
        $(document).on('click', '#closeStockCountOverlay', e => {
            notif.hide($('.notifyjs-toggle-tableStock-cols-base'));
        });

        $(document).on('click', '#printStockCountTable', e => {
            notif.hide($('.notifyjs-toggle-tableStock-cols-base'));
            setPrintHeader({
                table: tableStockCount,
                content: `
                    <div style="font-family: verdana; display: grid; grid-template-columns: auto 1fr auto; justify-content: space-between;">
                        <section><img src='../uploads/${companyProfile[0]['logo']}' alt='${companyProfile[0]['comp_name']} Logo' width='120px' height='100px'></section>
                        <section style="text-align: center;"><h1 style="margin: 10px 0;">${companyProfile[0]['comp_name']}</h1><p style="margin-top: 0">${companyProfile[0]['addr']}</p><p style="margin-top: 0;">0${companyProfile[0]['phone']} / 0${companyProfile[0]['mobile']}</p><p style="display: flex; justify-content: space-between; font-weight: bold;"><span>STOCK-TAKING SHEET</span> <span>${$('#period_qtr option:selected').text() + ' of ' + $('#period_year').val()}</span></p></section>
                        <section><img src='../uploads/${companyProfile[0]['logo']}' alt='${companyProfile[0]['comp_name']} Logo' width='120px' height='100px'></section>
                    </div>
                `
            });
            getTableColumns({table: tableStockCount});
            tableStockCount.print("", true);
        });

    });

    $(document).on('click', '#exportStockCount_excel', e => tableStockCount.download("xlsx", "data.xlsx", {sheetName:"My Data"}));

    $(document).on('click', '#exportStockCount_pdf', function(e){    
        tableStockCount.download("pdf", "data.pdf", {
            orientation:"portrait", //set page orientation to portrait
            title: "General Stock Report", //add title to report
            autoTable:{ //advanced table styling
                styles: {
                    // fillColor: [100, 255, 255]
                },
                columnStyles: {
                    // id: {fillColor: 255}
                },
                margin: {right: 5, bottom: 5, left: 5},
            },
        });
    });
    
});


// pop('../model/conn.php?sales_corrections')
// .then(resp => {
//     console.log(resp.data);
//     console.log(_.map(resp.data, entry => ({prod_id: entry.prod_id, item: entry.item, cp: entry.dim < 2 ? (entry.cp >= entry.sp ? entry.UNIT_COST/(_.maxBy(JSON.parse(entry.ppq), 'qty').qty) : entry) : entry.UNIT_COST, sp: entry.sp == 0 ? _.maxBy(JSON.parse(entry.ppq), 'qty').rate : _.find(JSON.parse(entry.ppq), entry2 => entry2.qty == entry.dim)?.rate || _.maxBy(JSON.parse(entry.ppq), 'qty').rate})));
    // $.ajax({
    //     url: '../model/conn.php?update',
    //     method: 'POST',
    //     // data: {list: _.map(resp.data, entry => ({prod_id: entry.prod_id, item: entry.item, cp: entry.dim < 2 ? entry.UNIT_COST/(_.maxBy(JSON.parse(entry.ppq), 'qty').qty) : entry.UNIT_COST, sp: entry.sp == 0 ? _.maxBy(JSON.parse(entry.ppq), 'qty').rate : _.find(JSON.parse(entry.ppq), entry2 => entry2.qty == entry.dim)?.rate || _.maxBy(JSON.parse(entry.ppq), 'qty').rate}))},
    //     data: {list: _.map(resp.data, entry => ({prod_id: entry.prod_id, item: entry.item, cp: entry.dim < 2 ? entry.UNIT_COST/(_.maxBy(JSON.parse(entry.ppq), 'qty').qty) : entry.UNIT_COST, sp: entry.sp == 0 ? _.maxBy(JSON.parse(entry.ppq), 'qty').rate : _.find(JSON.parse(entry.ppq), entry2 => entry2.qty == entry.dim)?.rate || _.maxBy(JSON.parse(entry.ppq), 'qty').rate}))},
    //     success: resp => {
    //         console.log("ORI_RESP: ", resp);
    //         console.info("RESP: ", JSON.parse(resp).data, "\nUPDATED: ", resp.updated)
    //     },
    //     error: error => {
    //         console.error(error);
    //     },
    //     // timeout: 1,
    // })
// });

// UPDATE `stock` set ppq=JSON_SET(ppq, '$[0].rate', FORMAT((JSON_VALUE(ppq, '$[0].rate') / 8.01), 2)) WHERE prod_id=1;