export default Controls;

function Controls() {
    this.schemes = [];
    this.schemes.push(function(ship) {  
        window.addEventListener("keydown", ev => {
            switch(ev.key) {
                case 'a':
                    ship.mesh.position.x = -5.5;
                    break;
                case 'd':
                    ship.mesh.position.x = 5.5;
                    break;
            }
        });

        window.addEventListener("keyup", ev => {
            ship.mesh.position.x = 0;
        });
    });
}