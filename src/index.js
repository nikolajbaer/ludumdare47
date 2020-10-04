import * as THREE from "three";
import * as CANNON from "cannon";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './style.css';
import Game from "./Game.js"

const cheatCodes = [
    "idfreecamera",
    "idkfa",
    "idspispopd"    
]

function init(){
    const game = new Game()
    game.init()
    document.body.appendChild( game.renderer.domElement )

    var cheatString = "";
  
    window.addEventListener("idfreecamera", _e => {
        var controls = new OrbitControls( camera, renderer.domElement );
        controls.minDistance = 10;
        controls.maxDistance = 500;
    });

    window.addEventListener("idspispopd", _e => {
        window.dispatchEvent(
            new CustomEvent('trackComplete', 
                {detail: {track: tracks[currentTrack]}}
            )
        );

    });
     
    window.addEventListener('keypress', ev => {
        cheatString += ev.key;
        var stillGood = false;
        cheatCodes.forEach(cheat => {
            if (cheat.indexOf(cheatString) !== -1) {
                if (cheat == cheatString) {
                    window.dispatchEvent(new Event(cheat));
                }
                stillGood = true;
                return;
            }
        });
        if (!stillGood) {
            console.log("restting cheat string");
            cheatString = "";
        }
    });

    game.startGame()
}


init();
