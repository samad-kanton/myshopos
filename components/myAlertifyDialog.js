//define a new dialog
const myAlertfyDialog = params => {
    // console.log(params);
    !alertify[params.name] && alertify.dialog(`${params.name}`, function factory(){
        return {
            main: function(message){
                this.message = message;
            },
            setup: function(){
                return { 
                    buttons:[{text: "cool!", key: null}],
                    focus: { element:0 },
                    options: {
                        title: 'ABC',
                        basic: true,
                        frameless: true,
                        maximizable: false,
                        startMaximized: true, 
                        onshow: () => {
                                            
                        }, 
                        label:{text: "cool!", key: null /*Esc*/ },
                        // buttons:[{text: "cool!", key: null}],
                        // oncancel: (closeEvt) => alert()
                        ...params.setup
                    },
                };
            },
            prepare: function(){
                this.setContent(this.message);
            }
        }
    });
    return alertify[params.name](params.content)
}

export default myAlertfyDialog