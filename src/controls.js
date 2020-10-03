export default Controls;
import Tween from "./tween";


function Controls() {
    this.schemes = [];
    this.schemes.push(function(ship) {  
        window.addEventListener("keypress", ev => {
            
            switch(ev.key) {
                case 'a':
                    ship.tweenX = new Tween(ship.mesh.position.x, -5.5, 0.05);
                    break;
                case 'd':
                    ship.tweenX = new Tween(ship.mesh.position.x, 5.5, 0.05);
                    break;
            }
        });

        window.addEventListener("keyup", ev => {
            ship.tweenX = new Tween(ship.mesh.position.x, 0, 0.05);
        });
    });
}