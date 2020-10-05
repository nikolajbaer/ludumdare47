export default class Controls {
    constructor(){
        this.gp = null;
        this.active = false;
    }

    forceFeedback(t){
        if(this.gp == null){ return; }
        if(this.gp.vibrationActuator != undefined){
            gamepad.vibrationActuator.playEffect("dual-rumble", {
                startDelay: 0,
                duration: t,
                weakMagnitude: 1.0,
                strongMagnitude: 1.0
            });    
        }
    }

    checkAxis(ship) {
        if(this.gp == null || !this.active){ return }
        
        var gamepads = navigator.getGamepads()
        this.gp = gamepads[0];

        if(this.gp.axes[0] < -0.1){
            ship.slideLeft()
        }else if(this.gp.axes[0] > 0.1) {
            ship.slideRight()
        }else{
            ship.recenter()
        }
    }

    disconnect(){
        this.active = false;
    }

    connect(ship){  
        window.addEventListener("keydown", ev => {
            if( !this.active){ return }
            switch(ev.key) {
                case 'a':
                case 'ArrowLeft':
                    ship.slideLeft();
                    break;
                case 'd':
                case 'ArrowRight':
                    ship.slideRight();
                    break;
            }
        });

        window.addEventListener("touchstart", ev => {
            if( !this.active){ return }
            const x = ev.targetTouches[0].clientX;
            if( x < window.innerWidth/2){
                ship.slideLeft()
            }else{
                ship.slideRight()
            }
        })

        window.addEventListener("touchend", ev => {
            ship.recenter()
        })


        window.addEventListener("keyup", ev => {
            ship.recenter();
        });

        window.addEventListener("gamepadconnected", e => {
            if( this.gp == null ){
                this.gp = e.gamepad
                console.log("Gamepad connected")
            }
        });
        window.addEventListener("gamepaddisconnected", e => {
            if(e.gamepad == this.gp){
                this.gp = null
            }
        });
        this.active = true;
    }
}