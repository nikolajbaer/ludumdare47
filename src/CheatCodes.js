import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const cheatCodes = [
    "idfreecamera",
    "idkfa",
    "idnloop"    
]

export default class CheatCodes {
    constructor(game){
        this.game = game;
        this.cheatString = "";
    }

    init(){
  
        window.addEventListener("idfreecamera", _e => {
            var controls = new OrbitControls( camera, renderer.domElement );
            controls.minDistance = 10;
            controls.maxDistance = 500;
        });
    
        window.addEventListener("idnloop", _e => {
            window.dispatchEvent(
                new CustomEvent('trackComplete', 
                    {detail: {track: this.game.getCurrentTrack()}}
                )
            );

        });

        window.addEventListener('keypress', ev => {
            this.cheatString += ev.key;
            var stillGood = false;
            cheatCodes.forEach(cheat => {
                if (cheat.indexOf(this.cheatString) !== -1) {
                    if (cheat == this.cheatString) {
                        window.dispatchEvent(new Event(cheat));
                    }
                    stillGood = true;
                    return;
                }
            });
            if (!stillGood) {
                console.log("restting cheat string");
                this.cheatString = "";
            }
        });
    
    }
}