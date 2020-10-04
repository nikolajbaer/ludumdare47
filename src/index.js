import * as THREE from "three";
import * as CANNON from "cannon";
import './style.css';
import Game from "./Game.js"
import CheatCodes from "./CheatCodes.js"

function start(){
    const game = new Game()
    const cheats = new CheatCodes(game)
    game.init()
    document.body.appendChild( game.renderer.domElement )
    game.startGame()
}

function main(){
    document.getElementById("startGame").addEventListener("click", e =>{
        document.getElementById("title").style.display = "none"
        document.getElementById("overlay").style.display = "block"
        start()
    })
}
main();
