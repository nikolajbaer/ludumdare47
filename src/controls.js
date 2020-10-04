export default class Controls {
    constructor(){
        this.gp = null;
    }
    
    checkAxis(ship) {
        if(this.gp == null){ return }
        
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

    connect(ship){  
        window.addEventListener("keypress", ev => {
            
            switch(ev.key) {
                case 'a':
                    ship.slideLeft();
                    break;
                case 'd':
                    ship.slideRight();
                    break;
            }
        });

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
    }
}