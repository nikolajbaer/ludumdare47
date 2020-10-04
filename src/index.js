import * as THREE from "three";
import * as CANNON from "cannon";
import './style.css';
import Game from "./Game.js"
import CheatCodes from "./CheatCodes.js"

var game = null;

function start(){
    game = new Game()
    const cheats = new CheatCodes(game)
    game.init();
    cheats.init();
    document.body.appendChild( game.renderer.domElement )
    game.startGame()
    window.GAME = game;
}

function onWindowResize(e){
    if(game != null){
        game.handleResize()
    }
}

function main(){
    // Start Game Button
    document.getElementById("startGame").addEventListener("click", e =>{
        document.getElementById("title").style.display = "none"
        document.getElementById("overlay").style.display = "block"
        start();
    });
    // track resize events
    window.addEventListener( 'resize', onWindowResize, false );

    // Prevent default touch drag behaviour
    function preventBehavior(e) {
        e.preventDefault(); 
    };    
    document.addEventListener("touchmove", preventBehavior, {passive: false});
}
main();
