import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const cheatCodes = [
    "idfreecamera",
    "idkfa",
    "idnloop",
    "idnmusic",
    "idpause",
    "idgodmode"
]

export default class CheatCodes {
    constructor(game){
        this.game = game;
        this.cheatString = "";
    }

    init(){

        window.addEventListener("idgodmode", _e => {
            this.game.ship.invincible = true;
        })
        window.addEventListener("idpause", _e => {
            this.game.paused = !this.game.paused;
        });
  
        window.addEventListener("idfreecamera", _e => {
            var controls = new OrbitControls(this.game.camera, window.document.getElementsByTagName('canvas')[0]);
            controls.minDistance = 10;
            controls.maxDistance = 500;
        });

        window.addEventListener("idnmusic", _e => {
            console.log('music off');
            this.game.sounds.stopMusic();
        })
    
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
                    stillGood = true;
                    if (cheat == this.cheatString) {
                        window.dispatchEvent(new Event(cheat));
                        stillGood = false;
                    }                    
                    return;
                }
            });
            if (!stillGood) {
                //console.log("restting cheat string");
                this.cheatString = "";
            }
        });
    
    }
}