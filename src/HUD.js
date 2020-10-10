
import timeFormat from './Format.js'

export default class HUD {
    constructor( health_el, flash_el, score_el, clock_el) {
        this.health_el = health_el;
        this.flash_el = flash_el;
        this.score_el = score_el;
        this.clock_el = clock_el;
        this.flash_t = null;
        this.flash_i = null;
        this.flash_temp_t = null;
    }

    junkMessage(message) {
        var m = "";
        for (var i = 0; i < message.length; i++) {
            if (message.charCodeAt(i) == 32) {
                m += " ";
            } else {
                m += String.fromCodePoint(Math.floor(Math.random() * 90)+33);
            }
        }
        return m;
    }

    flash(message, duration){
        this.flash_el.style.display = "block"
        if (this.flash_i) {
            clearInterval(this.flash_i);
        }
        if( this.flash_t ){
            clearTimeout(this.flash_t);
        }
        if (this.flash_temp_t) {
            clearTimeout(this.flash_temp_t);
        }

        this.flash_i = setInterval(x => {
            this.flash_el.textContent = this.junkMessage(message);
        }, 10);

        this.flash_temp_t = setTimeout(e => {
            clearInterval(this.flash_i);
            this.flash_i = null;
            this.flash_el.textContent = message;
        }, Math.min(50, duration/10));

        this.flash_t = setTimeout( e => {
            this.flash_el.style.display = "none"
            this.flash_t = null;
            clearInterval(this.flash_i);
            this.flash_i = null;            
        },duration)

    }

    update_health(health){
        this.health_el.textContent = `${health.toFixed(0)}%`
        this.health_el.style.width = `${health.toFixed(0)}%`
    }

    update_score(tracks_left,track){
        if(track == null){ return }
        this.score_el.textContent = `${tracks_left} to go, ${track.collected}/${track.required} collected` 
    }

    update_clock(time) {
        if(this.clock_el) {
            this.clock_el.textContent = timeFormat(time);
        }
    }
}