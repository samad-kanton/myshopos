import { Swiper, pop, activeUser, appSounds, Notif, setPrintHeader, AuditLogs } from './utils.js';
// import Manual from '../../components/manual/manual.js';
import { Tabulator, ResponsiveLayoutModule, PageModule, FormatModule, FilterModule, TooltipModule, PopupModule, EditModule, ColumnCalcsModule, ValidateModule, SortModule, InteractionModule, GroupRowsModule, SelectRowModule, ExportModule, PrintModule, DownloadModule } from '../plugins/tabulator-master/dist/js/tabulator_esm.min.js';
Tabulator.registerModule([ ResponsiveLayoutModule, PageModule, FormatModule, FilterModule, TooltipModule, PopupModule, EditModule, ColumnCalcsModule, ValidateModule, SortModule, InteractionModule, GroupRowsModule, SelectRowModule, ExportModule, PrintModule, DownloadModule ]);

const notif = new Notif();
// BIND notif variable to the Global scope(window)   
window.notif = notif;

try {
    if('serviceWorker' in navigator) {
        // navigator.serviceWorker.register('/sw.js')
        // .then(function() { console.log("Service Worker Registered"); })
        // .catch(error => console.error("Ooppsss.."));
    }   
    // else{
    //     alert("Your Browser does not support Service Workers");
    // } 
} catch (error) {
    console.error(error);
}

if(navigator.onLine) {
    console.log("You are online");
} else {
    console.log("You are offline");
}

// let shareData = {
//     title: 'MDN',
//     text: 'Learn web development on MDN!',
//     url: 'https://developer.mozilla.org',
// }
  
// if (!navigator.canShare) {
//     console.log('navigator.canShare() not supported.');
// }
// else if (navigator.canShare(shareData)) {
//     console.log('navigator.canShare() supported. We can use navigator.share() to send the data.');
// } else {
//     console.log('Specified data cannot be shared.');
// }

// $(document).on("click", async () => {
//     try {
//       await navigator.share({ title: "Example Page", url: "" });
//       console.log("Data was shared successfully");
//     } catch (err) {
//       console.error("Share failed:", err.message);
//     }
// });
  

// init new swiper for Main NavBar 
const swiper = new Swiper('.swiper#navMenuSwiper', {
    speed: 400,
    autoHeight: false,
    // spaceBetween: 100,
    // Responsive breakpoints
    initialSlide: location.pathname != '/' && $("header #navMenuSwiper .swiper-slide.active").index(),
    breakpoints: {
        // when window width is >= 480px
        480: {
            slidesPerView: 2,
            // spaceBetween: 30
        },
        // when window width is >= 640px
        640: {
            slidesPerView: 3,
            // spaceBetween: 40
        },
        768: {
            slidesPerView: 3,
            // spaceBetween: 40
        },
        957: {
            slidesPerView: 4,
            // spaceBetween: 40
        },
        1280: {
            slidesPerView: 6,
            // spaceBetween: 40
        }
        
    },
    on: {
        init: swiper => {
            // console.log(swiper);
        }
    }
}); 

let staffBioData;
const checkAuth = async params => {
    let myRights;
    await pop('../staff/crud.php?pop')
    .then(async resp => {
        staffBioData = await resp.data;

        let { access, rights } = authUserRights(staffBioData, params.currentUser, location.href.split('/').splice(-2)[0]);
        myRights = rights;
        
        let routeTo = location.href.split('/').splice(-2)[0];
        $(document.body).data('page') != 'login' && AuditLogs.log({plot: 'view', activity: `${_.startCase(_.toLower(activeUser.name))} visited the ${_.toUpper(routeTo)} page.`});
        
        if(!access && $(document.body).data('page') != 'login') {            
            alertify.alert("Access Denied!!!", "<div class='clr-danger'>You do not have sufficient rights to access this page.</div><br/>Please contact your System Administrator.").set({'frameless': true, 'closable': false});
            let restrictedTimeout = setTimeout(() => {
                window.clearTimeout(restrictedTimeout);
                window.history.go(-1);
            }, 3000);
        }    
    });
    localStorage.setItem('myRights', JSON.stringify(myRights));
    return myRights;
},
authUserRights = (staffBioData, currentUser, routeTo) => {
    let idx = _.findIndex(staffBioData, entry => entry.emp_id == currentUser.id),
        rights = staffBioData[idx] && JSON.parse(staffBioData[idx].rights),
        access = (_.has(rights, routeTo) && rights[routeTo][`view_${routeTo}`]);
    return { access, rights };
},
Logout = e => {
    let routeTo = location.href.split('/').splice(-2)[0];
    AuditLogs.log({plot: 'logout', activity: `${_.startCase(_.toLower(activeUser.name))} logged out from ${_.toUpper(routeTo)} page.`});

    localStorage.removeItem('authUser');
    location.href = "../";
},
pageRights = $(document.body).data('page') != 'login' && ((localStorage.getItem('myRights') != 'null' && localStorage.getItem('myRights') != 'undefined') ? JSON.parse(localStorage.getItem('myRights'))[_.split(location.href, '/')[3]] : Logout());

// CHECK USER RIGHTS ON PAGE LOAD
checkAuth({currentUser: activeUser});

$(document).on('click', 'header #navMenuSwiper > *', function(e){    
    let routeTo = $(e.target).closest('a')[0].href.split('/').splice(-1, 1)[0];
    // console.log(routeTo);
    let { access } = authUserRights(staffBioData, activeUser, routeTo);
    if(access || $(e.target).closest('a')[0].classList.contains('active')){
        return true;
    }
    alertify.alert("Access Denied!!!", "<div class='clr-danger'>You do not have sufficient rights to access this page.</div><br/>Please contact your System Administrator."); 
    return false;
});

if(location.pathname != "/"){ 
    var isLoggedin = setInterval(() => {
        // console.log(location)
        if ((!localStorage.getItem('authUser') || localStorage.getItem('authUser') == null)) {
            // console.log(localStorage.getItem('authUser'))
            clearInterval(isLoggedin);
            Logout();
        }
    }, 500);

    $("header div:last-child menu section:first-child small").html(`<i class="fa fa-circle clr-lime"></i> ${_.startCase(activeUser.name)}`); // Display LoggedIn Username
    $("header div:last-child .activeUser_avatar").prop('src', `../uploads/staff/${JSON.parse(activeUser.photos)[0] ?? 'avatar.jpg'}`); // Display LoggedIn User Avatar
}

$("#btnLogout").on('click', e => Logout());

var dt = new Date();
var s = dt.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    s = s.split('/').reverse();
    // console.log(`${s[0]}-${s[2]}-${s[1]}`);
    $('[type="date"]').val(`${s[0]}-${s[2]}-${s[1]}`);

$(window).on('resize', () => { 
    window.matchMedia("(max-width: 568px)").matches ? $("#carts button.active").addClass('withChevron') : $("#carts button.active").removeClass('withChevron');
});    

$('[type="search"]').val('');

// Dropdown hover effect
$(".dropdown").on("click", e => $(e.target).closest('button').find('.dropdown-menu').toggleClass('open'))

// Hide Dropdown menu when clicked outside
$(document).on('click', e => {
    if (!$(e.target).closest('.dropdown').length) {
        $('.dropdown-menu').removeClass('open');
    }
    if (!$(e.target).closest('header div:last-child').length) {
        $('header div:last-child menu, header div:last-child a:not(menu a) i').removeClass('open');
    }
}); 

$("header div:last-child a:not(menu a)").on('click', e => {
    $("header div:last-child menu, header div:last-child a:not(menu a) i").toggleClass('open');
});

$(document).on('click keydown keyup keypress', ".disabled", function (e) {
    e.stopPropagation();
    e.preventDefault();
    return false;
});

let companyProfile;
pop('../config/crud.php?pop')
.then(resp => companyProfile = resp.data);

const printTableData = params => {
    setPrintHeader({
        table: params.table,
        content: `
            <div style="font-family: verdana; display: grid; grid-template-columns: auto 1fr auto; justify-content: space-between;">
                <section><img src='../uploads/${companyProfile[0]['logo']}' alt='${companyProfile[0]['comp_name']} Logo' width='120px' height='100px'></section>
                <section style="text-align: center;"><h1 style="margin: 10px 0;">${companyProfile[0]['comp_name']}</h1><p style="margin-top: 0">${companyProfile[0]['addr']}</p><p style="margin-top: 0">${companyProfile[0]['phone']} / ${companyProfile[0]['mobile']}</p><p>${_.toUpper(params.title)}</p></section>
                <section><img src='../uploads/${companyProfile[0]['logo']}' alt='${companyProfile[0]['comp_name']} Logo' width='120px' height='100px'></section>
            </div>
        `
    });
    params.table.print("", true);
},
exportTableData = params => {
    params.table.download(params.type, params.fileName, params.opts)
};

let notifsData, notifs,
popNotifs = async () => {
    notifsData = [];
    let req = await pop(`../notifs.php`, null);
    // console.log(req);
    notifsData = [...notifsData, { 
        'zeroStock': req.data.zeroStock,
        'lowStock': req.data.lowStock, 
        'expiredStock': req.data.expiredStock, 
    }]
    return notifsData;
},
checkNotifs = async () => {
    // let reQuery = await setInterval(async () => {
        popNotifs()
        .then(data => {
            // console.log(data[0]);
            notifs = _.filter(_.map(data[0], entry => _.size(entry) > 0), entry => entry == true);
            // console.log(notifs);
            $("header #btnShowNotifs #badge").text(_.size(notifs)).css({'background': _.size(notifs) > 0 ? 'red' : '#ccc', 'color': _.size(notifs) > 0 ? '#fff' : '', 'width': _.size(notifs) < 9 ? '15px' : '25px'});
            // clearInterval(reQuery);
        });
    // }, 2000);
}
checkNotifs()

$("#btnShowNotifs").on('click', e => {
    if(!_.isUndefined(notifsData) && _.size(notifsData) > 0){
        // console.log(notifsData);
        notif.show({
            el: $(e.target).closest('header'), 
            title: `
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: solid 1px #eee;">
                    <small>Notifications [${_.size(notifs)}]</small>
                    <a href="javascript:void(0);" class="clr-inverse" onclick="$(event.target).closest('.notifyjs-wrapper').remove();"><i class="fa fa-times"></i></a>
                </div>
                <ul style="width: 300px; height: 200px; margin: 5px 15px; padding: 0;">
                    <li data-list="zeroStock" style="padding: 10px 5px; border-bottom: solid 1px #ccc;"><a href="javascript:void(0);" class="no-udl clr-inverse"><span class="clr-primary">${_.size(notifsData[0].zeroStock)}</span> ${_.size(notifsData[0].zeroStock) > 1 ? 'items are' : 'item is'} out of stock.</section></a></li>
                    <li data-list="lowStock" style="padding: 10px 5px; border-bottom: solid 1px #ccc;"><a href="javascript:void(0);" class="no-udl clr-inverse"><span class="clr-primary">${_.size(notifsData[0].lowStock)}</span> ${_.size(notifsData[0].lowStock) > 1 ? 'items are' : 'item is'} due for reorder.</section></a></li>
                    <li data-list="expiredStock" style="padding: 10px 5px; border-bottom: solid 1px #ccc;"><a href="javascript:void(0);" class="no-udl clr-inverse"><span class="clr-primary">${_.size(notifsData[0].expiredStock)}</span> ${_.size(notifsData[0].expiredStock) > 1 ? 'items are' : 'item is'} due for expiry(ed).</section></a></li>
                </ul>
            `, 
            styleName: 'system-notifs',
            position: 'bottom right', 
            className: 'default',
            autoHide: false,
            clickToHide: false
        });
        let wrapper = $('.notifyjs-system-notifs-base').closest('.notifyjs-wrapper')
        wrapper
        .css({'position': 'fixed', 'right': 'calc(100vw + 30px)'})
        .find('.notifyjs-container').css({'width': '320px', 'height': '200px'})
        wrapper.find('.notifyjs-arrow').css({'left': 'calc(100vw - 65px)'})
    }
});

$(document).on('click', ".notifyjs-system-notifs-base ul li a", e => {
    notif.show({
        el: $(e.target).closest('li'), 
        title: `
            <div style="width: 320px; max-height: 300px;">
                <div id="notif-line-details-table"></div>
            </div>
        `, 
        styleName: 'notif-line-details',
        position: 'bottom left', 
        className: 'info',
        autoHide: false,
        clickToHide: false
    });

    let list = $(e.target).closest('li').data('list'), 
        columns = [], 
        printHeader = `<div>
            <div style="display: grid; grid-template-columns: auto 1fr; justify-content: space-between;">
                <section><img src='../uploads/${companyProfile[0]['logo']}' alt='${companyProfile[0]['comp_name']} Logo' width='100px' height='100px'></section>
                <section style="text-align: center;"><h1 style="margin: 10px 0; font-size: 33px;">${companyProfile[0]['comp_name']}</h1><section style="margin-top: 0;"><b>LOC</b>: ${companyProfile[0]['addr']}</section><section style="margin-top: 5px;"><b>TEL</b>: ${companyProfile[0]['phone']} / ${companyProfile[0]['mobile']}</section><section></section></section>
            </div>
        `;

    if(list == "zeroStock"){
        columns = [...columns, 
            {title:"#", field:"", formatter: "rownum", width: 20},
            {title:"DESCRIPTION", field: "item", formatter: (cell, formatterParams, onRendered) => cell.getValue() && `${cell.getData().dim > 1 && cell.getValue().toUpperCase() + ' X ' + cell.getData().dim || cell.getValue().toUpperCase()}` || "", },
            {title:"QTY", field: "qty", hozAlign: "right", formatter: 'money', formatterParams: { precision: 0 }, width: 55 }
        ];
        printHeader += `            
                <h3 class="txt-center" style="text-decoration: double dashed underline;">ZERO / OUT OF STOCK REPORT</h3>
            </div>
        `;
    }
    else if(list == "lowStock"){
        columns = [...columns, 
            {title:"#", field:"", formatter: "rownum", width: 20},
            {title:"DESCRIPTION", field: "item", formatter: (cell, formatterParams, onRendered) => cell.getValue() && `${cell.getData().dim > 1 && cell.getValue().toUpperCase() + ' X ' + cell.getData().dim || cell.getValue().toUpperCase()}` || "", },
            {title:"QTY", field: "qty", hozAlign: "right", formatter: 'money', formatterParams: { precision: 0 }, width: 55 },
            {title:"REORDER", field: "restock", hozAlign: "right", formatter: 'money', formatterParams: { precision: 0 }, width: 55 }
        ];
        printHeader += `            
                <h3 class="txt-center" style="text-decoration: double underline;">STOCK DUE FOR REORDER REPORT</h3>
            </div>
        `;
    }
    else if(list == "expiredStock"){
        columns = [...columns, 
            {title:"#", field:"", formatter: "rownum", width: 20},
            {title:"DESCRIPTION", field: "item", formatter: (cell, formatterParams, onRendered) => cell.getValue() && `${cell.getData().dim > 1 && cell.getValue().toUpperCase() + ' X ' + cell.getData().dim || cell.getValue().toUpperCase()}` || "", },
            // {title:"QTY", field: "qty", hozAlign: "right", formatter: 'money', formatterParams: { precision: 0 }, width: 55 },
            {title:"EXPIRY", field: "expdate", hozAlign: "right", formatter: 'datetimediff', formatterParams: { humanize: true, suffix: true }, width: 100 }
        ];
        printHeader += `            
                <h3 class="txt-center" style="text-decoration: double dashed underline;">DUE / EXPIRED STOCK REPORT</h3>
            </div>
        `;
    }

    let notifLineDetailsTable = new Tabulator(".notifyjs-notif-line-details-base #notif-line-details-table", {
        // width: '100vw',
        height: 250,
        // data: tabledata,           //load row data from array
        layout: "fitColumns",      //fit columns to width of table
        layoutColumnsOnNewData: true,
        // responsiveLayout: "hide",  //hide columns that dont fit on the table
        selectable: 1,
        // movableColumns: true,      //allow column order to be changed
        resizableRows: false,       //allow row order to be changed
        cellVertAlign: "middle",
        // paginationSize: true,         //allow 7 rows per page of data
        initialSort: [             //set the initial sort order of the data
            { column: "item", dir: "asc" },
        ],
        columns,
        selectableCheck: row => {
            //row - row component for the selected row
            return row.getData()['item'] !== undefined;
        },
        rowFormatter: row => {
            //row - row component for the selected row
            console.log(row.getData().expdate)
        },
        printFormatter: (tableHolderElement, tableElement) => {
            //tableHolderElement - The element that holds the header, footer and table elements
            //tableElement - The table
            // console.log(tableHolderElement)       
        },
        placeholder: "No data available in table",
        footerElement: `<div style="display: grid; grid-template-columns: 1fr auto auto; gap: 10px; justify-content: space-between;">
                            <div class="search-pane float-xs" style="position: relative;">
                                <input type="search" id="find_item" placeholder="Search item...">
                                <label for="find_item" style="cursor: pointer;"><i class="fa fa-search clr-primary" style="width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;"></i></label>
                            </div>
                            <button type="button" class="btn btn-default btn-sm" id="btnExportNotifData"><i class="fa fa-share-alt clr-primary"></i> Share</button>
                            <button type="button" class="btn btn-sm clr-danger" onclick="$(event.target).closest('.notifyjs-wrapper').remove();">Close</button>
                        </div>
        `,
        printHeader
    });
    
    notifLineDetailsTable.setData(notifsData[0][list]);

    $(document).on('input', '.notifyjs-notif-line-details-base #find_item', e =>{
        notifLineDetailsTable.setFilter([
            {field: "item", type: "like", value: e.target.value}
        ]);
    });

    $(document).on('click', '.notifyjs-notif-line-details-base #btnExportNotifData', e =>{
        // $(e.target).find('.notifyjs-export-data-base').remove();
        notif.show({
            el: $(e.target).closest('button'), 
            title: `<div style="margin: 5px 15px; padding: 0; display: grid;">
                        <a href="javascript:void(0);" class="no-udl clr-inverse" id="btnExportPrint" style="padding: 10px 5px; border-bottom: solid 1px #ccc;"><i class="fa fa-print"></i> Print</a></li>
                        <a href="javascript:void(0);" class="no-udl clr-success" id="btnExportExcel" style="padding: 10px 5px;"><i class="fa fa-file-excel-o"></i> Excel</a></li>
                    </div>
            `, 
            styleName: 'export-data',
            position: 'top center', 
            className: 'default',
            autoHide: false,
            clickToHide: false
        });

        $('.notifyjs-notif-line-details-base #btnExportPrint').on('click', e =>{
            notifLineDetailsTable.print();
        });
    
        $('.notifyjs-notif-line-details-base #btnExportExcel').on('click', e =>{
            notifLineDetailsTable.download("xlsx", "data.xlsx", {sheetName: "MyData"});
        });
    });


});  

console.log(_.split(location.href, '/')[3]);

// console.log(Manual)
$("#btnHelp").on('click', e => {
    $('body').css({'overflow': 'hidden'})
    $('menu').removeClass('open');
    notif.show({
        el: $(e.target).closest('header'), 
        title: `
            <div style="min-width: calc(100vw - 10px); height: 100vh; background: #fafafa;">                
                <div class="row">
                    <div class="cl-4 cm-4 cs-4 cx-6">
                        <div class="form-group" style="margin-left: 0;">                                            
                            <section style="display: flex; padding-top: 5px;">
                                <label for="urole" class="floated-up-lbl" style="position: absolute; top: -2px; font-size: 12px;">Filter Docs</label>
                                <div class="radiobox">
                                    <input checked type="radio" name="filter_docs" id="all" class="custom-checkbox" value="all"><label for="all" style="cursor: pointer;">&nbsp;All</label>
                                </div>&nbsp;&nbsp;
                                <div class="radiobox">
                                    <input type="radio" name="filter_docs" id="page" class="custom-checkbox" value="page"><label for="page" style="cursor: pointer;">&nbsp;Page</label>
                                </div>
                            </section>
                        </div>
                    </div>
                    <div class="cl-4 cm-4 cs-4 cx-6">
                        <button class="btn btn-teal" id="btnPrintDocs"><i class="fa fa-print"></i> Print</button>
                    </div>
                    <div class="cl-4 cm-4 cs-4 cx-6 search-pane">
                        <div class="form-group" style="margin: 0; position: relative;">
                            <input type="search" id="search_docs"placeholder="Search Docs...">
                            <label for="search_docs" style="cursor: pointer;"><i class="fa fa-search clr-primary" style="width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;"></i></label>
                        </div>
                    </div>
                </div>
                <div id="table-docs"></div>
            </div>
        `, 
        styleName: 'account-help',
        position: 'bottom left', 
        className: 'default',
        autoHide: false,
        clickToHide: false
    });

    // $(".notifyjs-account-help-base").closest('.notifyjs-wrapper').css({'position': 'fixed', 'z-index': '2'});

    // console.log($("#pageTapSwiper").length)
   
    let tableDocs = new Tabulator('#table-docs', {
        // width: '100%',
        height: _.size($("#pageTapSwiper")) > 0 ? "calc(100vh - 175px)" : "calc(100vh - 120px)",
        layout: "fitColumns",      //fit columns to width of table
        cellVertAlign: "middle",
        responsiveLayout: "collapse",  //hide columns that dont fit on the table    
        // movableColumns: true,  
        headerVisible: false,
        resizableColumns: true,
        history: true,
        // selectable: 1,
        data: Manual,
        groupBy: ['chapter'],
        groupHeader: [
            (value, count, data, group) => {
                return `<span style="font-weight: bold;">${value}</span>`;
            }
            // (value, count, data, group) => {
            //     console.log(value[0].title, count, data, group);
            //     return `<span style="font-weight: bold;">${value[0].title}</span>`;
            // }
        ],
        groupToggleElement: "header", //toggle group on click anywhere in the group header
        columns: [
            // {title: "", field: "", formatter: "rownum" || "", headerSort: false, hozAlign: "center", width: 30},
            {title: "Chapter", field: "chapter", hozAlign: "center", width: 120, visible: false },
            {title: "Title", field: "title", hozAlign: "left", vertAlign: 'top', formatter: (cell, formatterParams, onRendered) => { 
                let { module, title, topics } = cell.getData();
                topics = _.join(_.map(topics, topic => `<li>
                    <a href="#${_.toLower(_.join(_.split(topic, ' '), '_'))}" title="${topic}" class="no-udl subTitle" style="display: block; padding: 5px 0; color: #444;">
                        ${topic}
                    </a>
                </li>`), '');
                return `<div>
                            <ul style="margin: 0; padding: 0 20px;">${topics}</ul>
                        </div>
                `;
             }, width: 120, },
            {title: "Content", field: "content", formatter: (cell, formatterParams, onRendered) => { 
                return cell.getValue();
                // let { module, title, sub } = cell.getData();
                // sub = _.join(_.map(sub, s => s.content), '');
                // return sub;
            }, hozAlign: "left", vertAlign: 'top' },
        ],
        rowFormatter: row => {
            let rowEl = row.getElement(), data = row.getData(), cellContents = '';
            // while(rowEl.firstChild) rowEl.removeChild(rowEl.firstChild);
            // cellContents += `              
                
            //         <a href="javascript:void(0);">${data.title}</a>
            //         <section>
            //             ${data.content}
            //         </section>
            // `;
            // rowEl.innerHTML += (cellContents);
        },
        // pagination: "local",       //paginate the data
        // paginationSize: 100,         //allow 7 rows per page of data
        // paginationButtonCount: 2,
        placeholder: "No Data Available", //display message to user on empty table
    });
    {/* <img src="../../assets/img/cart.bmp" alt="" width="200px" height="200px" /> */}
    $('#table-docs').find('.tabulator-row').css({'background': '#fff'})
    // .find('.tabulator-cell:nth-child(3)').css({'display': '', 'height': ''});
    .find('.tabulator-cell:nth-child(3)').css({'display': '', 'height': ''});    
      
    const genContent = params => {
        let content = _.forEach(Manual, entry => _.find(entry.sub, entry2 => {
            console.log(_.toLower(_.join(_.split(entry2.chapter, ' '), '_')) == _.toLower(_.join(_.split(params.chapter, ' '), '_')))
            if(_.toLower(_.join(_.split(entry2.chapter, ' '), '_')) == _.toLower(_.join(_.split(params.chapter, ' '), '_'))) {
                $(event.target).closest('.tabulator-row').find('.tabulator-cell:nth-child(3)').prop('title', entry2.content).html(entry2.content);
            }
        }))
        console.log(content)
        $(event.target).closest('.tabulator-row').find('.tabulator-cell:nth-child(3)').css({'height': '100vh', 'white-space': 'initial'});
    } 

    $(".subTitle").on('click', e => {
        genContent({title: e.target.getAttribute('title')});
    });

    $("#search_docs").on('input', e => {
        tableDocs.setFilter([
            {},
            [
                { field: "chapter", type: "like", value: e.target.value },
                { field: "content", type: "like", value: e.target.value }
            ]
        ]); 
    });
    
    $("#btnPrintDocs").on('click', e => {
        printTableData({table: tableDocs, title: 'SOFTWARE MANUAL'}); //print table data
    });
});

/* ************                     ************ 
                    SHARED_CODE
/* ************                     ************ */

// EXPAND COLLAPSIBLE SEARCHBAR
$(document).on('input focus keydown', 'input[type="search"]', e => {
    // console.log(e.target);
    if(window.matchMedia("(max-width: 500px)").matches && $(e.target).closest('.search-pane').hasClass('float-xs') && !$('.search-pane').hasClass('open') && !$(e.target).is(':disabled')){
        $(e.target).closest('.search-pane.float-xs').addClass('open');
        // $('.ajax-page.open').removeClass('open');
    }
});

$(document).on('blur', 'input[type="search"]', e => $(e.target).closest('.search-pane').find('label').click());

$(document).on('click', '.search-pane label', e => $('.search-pane').hasClass('open') && $('.search-pane input[type="search"]').prop('disabled', true) && $('.search-pane').removeClass('open') && setTimeout(() => $('.search-pane input[type="search"]').prop('disabled', false), 1) || $(e.target).closest('.search-pane.float-xs').addClass('open'));
    
    // $('header section:nth-child(2) a').fadeIn();
// });

export {
    // editorCustomReceiptText
    staffBioData,
    printTableData,
    exportTableData,
    checkAuth, 
    pageRights
}