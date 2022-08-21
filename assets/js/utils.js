import myAlertifyDialog from '../../components/myAlertifyDialog.js'
import Swiper from '../plugins/swiper/swiper-bundle.esm.browser.min.js'
import currency from '../plugins/currency.es.js'
import { DateTime, Duration, FixedOffsetZone, IANAZone, Info, Interval, InvalidZone, Settings, SystemZone, VERSION, Zone } from '../plugins/luxon.js'

const CEDIS = val => currency(val, { symbol: '¢', decimal: '.', thousand: ',' });

const activeUser = {
    id: localStorage.getItem('authUser') && JSON.parse(localStorage.getItem('authUser')).id, 
    name: localStorage.getItem('authUser') && JSON.parse(localStorage.getItem('authUser')).name,
    role: localStorage.getItem('authUser') && JSON.parse(localStorage.getItem('authUser')).role,
    photos: localStorage.getItem('authUser') && JSON.parse(localStorage.getItem('authUser')).photos
}

var appSounds = { definite: new Audio('../assets/tones/definite.mp3'),  oringz: new Audio('../assets/tones/oringz.mp3'),  martian_gun: new Audio('../assets/tones/martian-gun.mp3'),  pull_out: new Audio('../assets/tones/pull-out.mp3'),  attention_alert: new Audio('../assets/tones/attention_alert.mp3'),  removed_tone: new Audio('../assets/tones/oringz.mp3') }

class AuditLogs {
    static get = params => {
        try {
            $.get(`../../audit_logs.php?pop`, null, resp => {
                console.log(resp)
                return resp;
            }, 'json');
        } catch (error) {
            console.error(error);
            alert(error)
        }
    }

    static log = params => {
        const PLOTS = {
        //     view: `Viewed ${params.activity}`,
        //     create: 'Created',
        //     update: 'Updated',
        //     delete: 'Deleted',
        //     search: 'Searched',
        //     filter: 'filtered',
        //     print: 'Printed',
        //     download: 'Downloaded',
        //     upload: `Uploaded`
        }
        try {
            $.post(`../../audit_logs.php?new`, {...params, emp_id: activeUser.id}, resp => {
                console.log(resp)
            }, 'json');
            return `${params.activity}`
        } catch (error) {
            console.error(error);
            alert(error)
        }
    }
}

class SystemPrefs{
    pop = async () => {
        let req = await fetch(`../config/crud.php?prefs&pop`);
        return req.json();
    }
    update = async (module, pref, value) => {
        // console.log(module, pref, value)
        let req = await $.post(`/config/crud.php?prefs&set`, { module, pref, value }, resp => resp, 'json');
        return req;
    }
}

let myTransCodePrefix;
fetch(`../config/crud.php?prefs&pop`)
.then(resp => resp.json())
.then(resp => myTransCodePrefix = (JSON.parse(resp.data[1].pref).code.prefix))
// .then(resp => console.log(resp))
.catch(err => alert(`Couldn't fetch Transaction Prefix\n${err}`))

const thousandsSeperator = val => val && val.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

const QIHRF = (qty, priceLabel, dim) => {
    // console.log(qty, priceLabel, dim);
    return _.startCase((qty < 2 && dim > 1) ? priceLabel : `${qty + ' ' + (qty > 1 ? pluralize(priceLabel) : priceLabel)}`);
}

class Notif{
    show(params){
        $.notify.addStyle(params.styleName, {
            html: `
                    <div>
                        <div class="clearfix">
                            <div class="title" data-notify-html="title"/>
                            <div class="buttons">
                                ${params.buttons ? params.buttons : ''}
                            </div>
                        </div>
                    </div>
            `,
            classes: {
                base: {
                    "white-space": "nowrap",
                    "background-color": params.bgColor ?? "#f44336",
                    "padding": params.padding ?? "5px",
                    "text-align": params.textAlign ?? "left",
                    "font-family": params.fontFamily ?? "verdana",
                    "color": params.color ?? "#fff",
                    "border-radius": params.borderRadius ?? "5px",
                    "box-shadow": params.boxShadow ?? "0 0 10px rgba(0,0,0,0.5)",
                },
                default: {
                    "background-color": "#f7f7f7",
                    "color": "#000"
                },
                inverse: {
                    "background-color": "#292b2c",
                    "color": "#fff"
                },
                primary: {
                    "background-color": "#Primary",
                    "color": "#fff"
                },
                success: {
                    "background-color": "#5cb85c",
                    "color": "#fff"
                },
                info: {
                    "background-color": "#5bc0de",
                    "color": "#fff"
                },
                warning: {
                    "background-color": "#fcba03",
                    "color": "#000"
                },
                danger: {
                    "background-color": "#d9534f",
                    "color": "#fff"
                }
            }
        });
        params.el.notify(
            {
                title: params.title
            }, 
            { 
                style: params.styleName, 
                className: params.className, 
                position: params.position,
                autoHide: params.autoHide,
                clickToHide: params.clickToHide
            }
        );
    }
    hide(styleName){
        styleName.trigger('notify-hide');
    }
}

async function pop(url, payLoad){
    // console.log(payLoad)
    let req = await (await fetch(url, payLoad)).json();
    // $(`.tabulator .tabulator-footer .tabulator-paginator .tabulator-page[data-page="first"]`).html(`<i class="fa fa-chevron-left"></i><i class="fa fa-chevron-left"></i>`);
    // $(`.tabulator .tabulator-footer .tabulator-paginator .tabulator-page[data-page="prev"]`).html(`<i class="fa fa-chevron-left"></i>`);
    // $(`.tabulator .tabulator-footer .tabulator-paginator .tabulator-page[data-page="next"]`).html(`<i class="fa fa-chevron-right"></i>`);
    // $(`.tabulator .tabulator-footer .tabulator-paginator .tabulator-page[data-page="last"]`).html(`<i class="fa fa-chevron-right"></i><i class="fa fa-chevron-right"></i>`);
    // $(`.tabulator .tabulator-footer .tabulator-paginator label`).html(`#`);
    return req;
}

const popCountries = async() => {
    let countries;
    await pop('../assets/plugins/countries-states-cities-database.json')
    // .then(countries => countries = _.map(countries, country => country.region.toLowerCase() == "africa"))
    .then(all_countries => countries = _.filter(all_countries, country => country.region.toLowerCase() == "africa"))
    .catch(err => console.error(err));
    return countries;
}

// const calcVAT = (type, rate, bill) => type == '%' ? ((rate / 100) * bill) + bill : (parseFloat(rate) + parseFloat(bill)), 
//   calcDISCOUNT = (type, rate, bill) => type == '%' ? bill - ((rate / 100) * bill) : (parseFloat(bill) - parseFloat(rate));
const calcVATDISCOUNTAMOUNT = (type, rate, bill) => he.decode(type) == '%' ? ((rate / 100) * bill): rate;

var footerBottomCustomText = params => new ysEditor({    
    // Editor wrapper
    wrapper: '#custom_receipt_footer_text',    
    // Toolbar options
    // toolbar: [
    //   'undo', 'redo', 'bold', 'italic', 'underline',
    //   'strikethrough', 'h1', 'h2', 'h3', 'p', 'quote',
    //   'left', 'center', 'right', 'justify',
    //   'ol', 'ul', 'sub', 'sup',
    //   'removeformat'
    // ],
    toolbar: [
        'bold', 'italic', 'underline', 'strikethrough'
    ],
    bottom: false,    
    // Content options
    height: params.height ?? 60,
    scroll: params.scroll ?? false,
    includeContent: true,    
    // Footer options
    footer: false,
});

const checkEmail = email => /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(email.value);
// console.log(checkEmail('kanton404@gmail.com'))

const uuid = params => {
    return 'xxx30xxx-xxxx-4xxx-yxxx-19xxxxxxxxxxxx93'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(32);
    });
}

const setPrintHeader = params => {
    params.table.options.printHeader = params.content;
},
PAYMENT_METHODS = [{id: 1, title: "Cash"}, {id: 2, title: "Mobile Pay"}, {id: 3, title: "POS"}, {id: 4, title: "Credit"}, {id: 5, title: "Debit"}, {id: 6, title: "Cheque"}, {id: 7, title: "Voucher"}, {id: 8, title: "Gift Card"}, {id: 9, title: "Paypal"}, {id: 10, title: "Other"}],
scrollToBottom = params => params.el.animate({ scrollTop: params.el.height() }, params.duration);

//define column header menu as column visibility toggle
let headerMenu = function(e) {
    // console.log(_.map(this.getColumns(), col => col.getDefinition().visible != false && (col.getDefinition().title != '' && !_.isUndefined(col.getDefinition().title))));
    let menu = [], columns = _.filter(this.getColumns(), col => col.getDefinition().visible != false && (col.getDefinition().title != '' && !_.isUndefined(col.getDefinition().title)));

    for(let column of columns){
        //create checkbox element using font awesome icons
        let icon = document.createElement("i"), label = document.createElement("span"), title = document.createElement("span");
            icon.classList.add("fa");
            icon.classList.add(column.isVisible() ? "fa-check-square" : "fa-square");

        title.textContent = " " + column.getDefinition().title;

        label.appendChild(icon);
        label.appendChild(title);

        //create menu item
        menu.push({
            label,
            action: e => {
                //prevent menu closing
                e.stopPropagation();

                //toggle current column visibility
                column.toggle();

                //change menu item icon
                if(column.isVisible()){
                    icon.classList.remove("fa-square");
                    icon.classList.add("fa-check-square");
                }else{
                    icon.classList.remove("fa-check-square");
                    icon.classList.add("fa-square");
                }
            }
        });
    }

    return menu;
};

const myUploader = params => {
    let uppy = new Uppy.Core({
        id: params.uppyID,
        debug: true,
        autoProceed: false,
        allowMultipleUploadBatches: true,
        restrictions: params.restrictions,
        meta: {},
        onBeforeFileAdded: (currentFile, files) => currentFile,
        onBeforeUpload: (files) => {},
        locale: {},
        // store: new DefaultStore(),
        logger: Uppy.debugLogger,
        infoTimeout: 5000,
    })
    // console.log("Plugins: ", _.size(params.plugins), params.plugins, _.keys(params.plugins))
    // LOOP THROUGH THE PLUGINS PARAM
    _.map(_.keys(params.plugins), (plugin, i) => {
        // console.log(plugin, {...params.plugins.Webcam})
        uppy.use(Uppy[plugin], {...params.plugins[plugin]})
    });
    _.map(_.keys(params.callbacks), (callback, i) => {
        // console.log(callback, params.callbacks[callback])
        uppy.on(`${callback}`, params.callbacks[callback]);
    });

    return uppy;
}

const displayFiles = async params => {
    let file;
    await _.map(params.data, filename => {
        fetch(`${params.loc}/${filename}`)
        .then(resp => resp.blob())
        .then(data => {
            // console.log(data)
            file = data;
            params.instance.addFile({
                name: filename,
                type: `image/${(/[.]/.exec(filename)) ? /[^.]+$/.exec(filename) : undefined}`,
                // data: new Blob(filename, {type: `image/${(/[.]/.exec(filename)) ? /[^.]+$/.exec(filename) : undefined}`}),
                data,
                // data: new Blob([filename], {type: `image/${(/[.]/.exec(filename)) ? /[^.]+$/.exec(filename) : undefined}`}),
                meta: {
                    // optional, store the directory path of a file so Uppy can tell identical files in different directories apart.
                    // relativePath: webkitFileSystemEntry.relativePath,
                },
                source: 'Local',
                isRemote: false
            });
        })
    });
    return file;
}

const uploadFiles = params => {
    console.log(params)
    let uppy = new Uppy.Core({
        // debug: true,
        autoProceed: params.autoProceed,
        restrictions: params.restrictions,
        ...params.methods,
    })
    .use(Uppy.Webcam)
    .use(Uppy.ScreenCapture)
    .use(Uppy.ImageEditor, { target: params.target })
    .use(Uppy.Dashboard, {
        theme: params.theme || 'light',
        height: params.dashboard.height,
        // thumbnailWidth: 100,
        inline: params.inline || true,
        target: params.target,
        waitForThumbnailsBeforeUpload: true,
        showRemoveButtonAfterComplete: params.showRemoveButtonAfterComplete || true,
        note: params.dashboard.note,
        proudlyDisplayPoweredByUppy: false,
        doneButtonHandler: params.dashboard.doneButtonHandler,
        plugins: params.dashboard.plugins,
        hideUploadButton: params.dashboard.hideUploadButton,
        metaFields: params.dashboard.metaFields,
        locale: params.dashboard.locale,
        browserBackButtonClose: false
    })    
    return uppy;
}

class MyProgressLoader {
    load(){
        myAlertifyDialog({
            name: 'loadingBills', 
            content: `
                <div style="display: flex; gap: 20px; justify-content: center; align-items: center;">
                    <i class="fa fa-spinner fa-spin fa-3x"></i>
                    <span>Waiting for response...</spanpspan>
                </div>
            `,
            setup: {
                startMaximized: false,
                closable: false,
                resizable: false,
                // modal: false
            }
        }).resizeTo(100, 120)
    }
    stop(){
        alertify.loadingBills().close();
    }
}

const toolbarOptions = [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    
    // [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    // ['blockquote', 'code-block'],
  
    // [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    // [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
    // [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
    // [{ 'direction': 'rtl' }],                         // text direction
  
    // [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    // [{ 'font': [] }],
    // [{ 'align': [] }],
  
    // ['clean']                                         // remove formatting button
], 
rte = params => new Quill(params.el, {
    // debug: 'info',
    modules: {
      toolbar: params.toolbarOptions || toolbarOptions
    },
    placeholder: params.placeholder,
    readOnly: params.readOnly || false,
    theme: params.theme || 'snow'
});

class TagsInput {
    set = params => params.el.addTags(params.data)

    // get = params => JSON.stringify(_.map(params.el.getTagElms(), el => _.toNumber(el.innerText)));
    get = params => JSON.stringify(_.map(params.el.getTagElms(), el => el.innerText));
}

const myProgressLoader = new MyProgressLoader();

let expTimer = params => {
    let current = params.current, deadline = params.deadline, remain = params.remain,
        timer = params.timer,
        expAlert = params => alertify.alert("Subscription Reminder", params.msg || `<h1>You have <b style="color: red;">${remain} days</b> left on your subscription plan. <br/><br/>Please activate now.</h1>`)
        .set({
            // 'frameless': true,
            'closable': false,
            'closableByDimmer': false,  
            'label': 'Activate Now',  
            'onok': () => {
                window.open(`https://paystack.com/pay/ztgh1y8c--`, "_blank");
            },       
            onclose: () => { 
                sessionStorage.setItem('waiting', true);
                // Reset the timer
                timer = 0;
                // Re-trigger(show) Subscription Modal after every hour
                expTimer({timer: (60000 * (remain > 7 ? 60 : 1))});
            },
            ...params
        }),
        interval = setTimeout(() => {
            clearTimeout(interval);
            if(current < deadline && current > deadline.minus({months: 1})){
                expAlert({});
            }
            else if(current > deadline){
                expAlert({
                    msg: `<h1 style="text-align: center;"><img src="/assets/img/expired.png" alt="Expired Photo" width="350px" /></p><span><b style="color: red;">Expired!</b></p><small style="font-size: 18px;">Your license is expired.</small></p><small style="font-size: 18px;">Please activate now.</small></span></h1>`,
                    // 'frameless': true,                        
                    onclosing: () => {
                        return false;
                    },
                    onclose: () => { 
                        sessionStorage.setItem('waiting', true);
                        // Reset the timer
                        timer = 0;
                        // Re-trigger(show) Subscription Modal after every hour
                        expTimer({timer: (60000 * (remain > 7 ? 60  : 1))});
                    },
                });
            }
        }, timer);
}

// SUBSCRIPTION REMINDER    
// let current = DateTime.now().startOf('day'), deadline = DateTime.fromISO("2022-06-15"), remain = deadline.diff(current, 'days').as('days');   
// location.pathname != "/" && (sessionStorage.getItem('waiting') && expTimer({timer: 1000, current, deadline, remain}));


export {
    AuditLogs,
    uuid,
    rte,
    myUploader,
    uploadFiles,
    displayFiles,
    expTimer,
    myProgressLoader,
    CEDIS,
    activeUser,
    appSounds,
    SystemPrefs,
    myTransCodePrefix,
    Swiper,
    thousandsSeperator,
    Notif,
    pop,
    popCountries,
    calcVATDISCOUNTAMOUNT,
    footerBottomCustomText,
    // ReceiptFrame,
    setPrintHeader,
    QIHRF,
    PAYMENT_METHODS,
    scrollToBottom,
    headerMenu,
    TagsInput,
}