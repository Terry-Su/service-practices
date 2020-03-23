var app = new Vue( {
    el  : '#app',
    data: {
        loginUsername            : undefined,
        loginPassword            : undefined,
        registerUsername         : undefined,
        registerPassword         : undefined,
        registerConfirmedPassword: undefined,

        // status
        isLogined: INIT_IS_LOGINED
    },
    methods: {
        handleClickLogin() {
            const loginData = {
                username: this.loginUsername,
                password: this.loginPassword
            }
            fetch( '/login', {
                method : 'POST',
                body   : JSON.stringify( loginData ),
                headers: {
                    "Content-Type": "application/json"
                  },
            } ).then( res => res.json() ).then( data => {
                if ( data.logined ) {
                    this.isLogined = true
                } else {
                    if ( data.reason ) {
                        alert( `${data.reason}, login failed` )
                    } else {
                        alert( `Login failed` )
                    }
                }
            } )
        },
        handleClickRegister() {
            if ( this.registerPassword !== this.registerConfirmedPassword ) {
                alert( `2 passwords are different, they should be same` )
                return
            }
            const signUpData = {
                username: this.registerUsername,
                password: this.registerPassword
            }
            fetch( '/sign-up', {
                method : 'POST',
                body   : JSON.stringify( signUpData ),
                headers: {
                    "Content-Type": "application/json"
                  },
            } ).then( res => res.json() ).then( data => {
                if ( data.signed ) {
                    alert( 'Sign succeeded!' )
                } else {
                    if ( data.reason ) {
                        alert( `${data.reason}, sign failed` )
                    } else {
                        alert( `Sign failed` )
                    }
                }
            } )
            
        },
        handleClickExitLogin() {
            fetch( '/exit-login', {
                method : 'POST',
                headers: {
                    "Content-Type": "application/json"
                  },
            } ).then( res => res.json() ).then( data => {
                if ( data.exited ) {
                    this.isLogined = false
                }
            } )
            
        },
    }
} )


