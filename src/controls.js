export default Controls;

function Controls(extent) {
    this.schemes = [];
    this.schemes.push(function(ship) {  
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
    });
}