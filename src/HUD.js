

export default class HUD {
    constructor( health_el, flash_el, score_el){
        this.health_el = health_el
        this.flash_el = flash_el
        this.score_el = score_el
        this.flash_t = null;
    }

    flash(message, duration){
        this.flash_el.textContent = message;
        this.flash_el.style.display = "block"
        if( this.flash_t ){
            clearTimeout(this.flash_t);
        }
        this.flash_t = setTimeout( e => {
            this.flash_el.style.display = "none"
            this.flash_t = null;
        },duration)
    }

    update_health(health){
        this.health_el.textContent = `${health.toFixed(0)}%`
        this.health_el.style.width = `${health.toFixed(0)}%`
    }

    update_score(tracks_left,track){
        this.score_el.textContent = `${tracks_left} to go, ${track.collected}/${track.required} collected` 
    }
}