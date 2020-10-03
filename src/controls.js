export default Controls;

function Controls() {
    this.schemes = [];
    this.schemes.push(function(ship) {  
        window.addEventListener("keydown", ev => {
            switch(ev.key) {
                case 'a':
                    ship.targetPosition.x = -5.5;
                    ship.targetDuration.x = 0.5;
                    break;
                case 'd':
                    ship.targetPosition.x = 5.5;
                    ship.targetDuration.x = 0.5;
                    break;
            }
        });

        window.addEventListener("keyup", ev => {
            ship.targetPosition.x = 0;
        });
    });
}