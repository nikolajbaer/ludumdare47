function pad(str, amt, chr) {
    chr = chr || "0";
    var sAmt = str.length;
    for (var i = sAmt; i < amt; i++) {
        str = chr + str;
    }
    return str;
}

export default function formatTime(num) {
    var millis = Math.floor(num * 1000);
    var minutes = Math.floor(millis / 60000);
    var seconds = Math.floor(millis % 60000 / 1000);
    var fractions = Math.floor(millis % 1000);
    
    return pad(minutes.toString(10),2) + ":" + pad(seconds.toString(10),2) + "." + pad(fractions.toString(10),3);
}