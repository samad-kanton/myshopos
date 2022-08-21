import { activeUser, appSounds, SystemPrefs, pop, popCountries, Swiper, thousandsSeperator, Notif, AuditLogs } from './assets/js/utils.js';
import { checkAuth as validateAuth } from './assets/js/event.js';
import auth from './auth.js';

const notif = new Notif();
$(() => {

    $(document).on('keydown', e => {
        let key = e.keyCode || e.which;
        // console.log("Key: ", key)
        if((key < 96 || key > 105) && (key < 48 || key > 57) && key != 8 && key != 116){
            e.preventDefault();
        }
        else{
            if(key == 8){
                $(`main .login-screen #keypad button.del`).trigger('click');
            }
            else{
                let keyLog = String.fromCharCode((key >= 96 && key <= 105) ? (key - 48) : key);
                $(`main .login-screen #keypad button`).find(`span:contains(${keyLog})`).trigger('click')
            }
        }
    });

    const pinCode = [], 
    mapDots = length => {
        $(`.login-screen #pincode span`).removeClass('paint')
        for (let i = 0; i < length; i++) {
            $(`.login-screen #pincode span`).eq(i).addClass('paint');            
        }
        pinCode.length < 1 && $(".login-screen #keypad button.del").css({'display': 'none'}) || $(".login-screen #keypad button.del").css({'display': 'grid'});         
    },
    resetPincode = () => {
        let resetInterval = setInterval(() => {
            $(`.login-screen #pincode span:nth-child(${pinCode.length})`).css({'background': 'red'}); 
            $("main .login-screen #keypad button.del").trigger('click');
            $("main .login-screen #keypad button:not(.del)").prop('disabled', true);
            if(pinCode.length <= 0){
                clearInterval(resetInterval);
                $("main .login-screen #keypad button:not(.del)").prop('disabled', false);
                $("main .login-screen #btnReset").fadeOut();
                $(".login-screen #pincode span").css({'background': ''});  
            }
        }, 100);
    },  
    checkAuth = pincode => {            
        // console.log(pincode);
        auth.auth(pincode)
        .then(resp => {
            // console.log((resp.photos))
            // console.log(AuditLogs.post({plot: 'login', activity: 'Logged into account'}));
            if (resp.access) {
                localStorage.setItem('authUser', JSON.stringify({id: resp.userId, name: resp.fullName, role: resp.uRole, photos: resp.photos}));
                validateAuth({currentUser: {id: resp.userId, name: resp.fullName, role: resp.uRole}})
                .then(data => {
                    let firstPageAccess = _.find(_.keys(data), entry => (data[entry][`view_${entry}`]) == true);
                    console.log(data, firstPageAccess);
                    if(!_.isUndefined(firstPageAccess)){
                        notif.show({ el: $(".login-screen #pincode"),  title: `<div style="display: flex; align-items: center;"><i class="fa fa-spin fa-spinner fa-3x" style="margin-right: 10px;"></i><section style="display: grid; gap: 5px;"><span style="display: flex;">Welcome, <span style="margin-left: 5px; width: 100px; maxWidth: ${$("#login-screen #pincode").width()}px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;"><b>${_.startCase(resp.fullName)}</b></span></span>Logging into your space ...</section></div>`,  className: 'success', styleName: 'zero-user-rights', position: 'top center', autoHide: false, clickToHide: false });
                        window.location.href = `./${firstPageAccess}`;
                    }
                    else{
                        resetPincode();
                        notif.show({ el: $(".login-screen #pincode"),  title: `<div style="display: flex;">Oopss..., <span style="margin-left: 5px; width: 100px; maxWidth: ${$("#login-screen #pincode").width()}px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;"><b>${_.startCase(resp.fullName)}</b></span></div> You don't have access to any page. <br/>Please contact your system admin.`,  className: 'warning', styleName: 'zero-user-rights', position: 'top center', autoHide: true, clickToHide: false });
                    }
                });
            }
            else {
                resetPincode();
                notif.show({ el: $(".login-screen #pincode"),  title: `Invalid credentials. Please retry.`,  className: 'error', styleName: 'invalid-login', position: 'top center', autoHide: true, clickToHide: false });
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    };

    // Create Dots To Map Pincodes Pressed
    for (let i = 0; i < 6; i++) {
        $(".login-screen #pincode").append(`<span></span>`);        
    }

    $(document).on('click', "main .login-screen #keypad button", e => {
        let keyPressed = $(e.target).closest('button').find('span').text();
        if($(e.target).closest('button').hasClass("del")){
            pinCode.splice(pinCode.length-1, 1);
            mapDots(pinCode.length); 
        }
        else{                    
            if(pinCode.length < 6){
                pinCode.push(keyPressed);           
                mapDots(pinCode.length); 
            }
            if(pinCode.length == 6){
                checkAuth(pinCode.toString().split(',').join(''));
            }
        }
    });

    // $(document).on('click', "#btnReset", e => {
    //     --i;
    //     $(`main .login-screen #pincode .pin:eq(${i})`).css({'background': ''});
    //     pincode.substr(0, i);
    //     i < 1 ? $("main .login-screen #btnReset").fadeOut() : '';
    // });
});