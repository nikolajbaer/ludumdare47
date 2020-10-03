export default Controls;

function Controls() {
    this.scheme_one = function(ship) {  
        window.addEventListener("keydown", ev => {
            switch(ev.key) {
                case 'a':
                    ship.position.x = -5.5;
                    break;
                case 'd':
                    ship.position.x = 5.5;
                    break;
            }
        });

        window.addEventListener("keyup", ev => {
            ship.position.x = 0;
        });
    };
}