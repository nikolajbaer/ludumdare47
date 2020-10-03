export default Controls;
import Tween from "./Tween";

function Controls(extent) {
    this.schemes = [];
    this.schemes.push(function(ship) {  
        window.addEventListener("keypress", ev => {
            
            switch(ev.key) {
                case 'a':
                    ship.tweenX = new Tween(ship.mesh.position.x, -extent, ship.slide_speed);
                    break;
                case 'd':
                    ship.tweenX = new Tween(ship.mesh.position.x, extent, ship.slide_speed);
                    break;
            }
        });

        window.addEventListener("keyup", ev => {
            ship.tweenX = new Tween(ship.mesh.position.x, 0, ship.slide_speed);
        });
    });
}