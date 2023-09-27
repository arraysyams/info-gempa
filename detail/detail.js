const urlParams = new URLSearchParams(window.location.search);
var xmlhttp = new XMLHttpRequest();
var cachexml = [];
networkDebug = true;

function statusUpdate (text) {
    if (networkDebug) {
        console.log(text);
    }
}

xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        if (this.responseXML.querySelector("info")) {
            cachexml.push(this.responseXML.querySelector("alert"));
        } else {
            cachexml += this.responseXML.querySelector("Infogempa");
        }
    } else if (this.status == 404) {
        statusUpdate("Tidak bisa mengakses file: 404");
    } else {
        statusUpdate("Sedang mengupdate... " + this.readyState + "/" + this.status);
    }
}

async function displayStats() {
    let numsrc = urlParams.get("src");
    let eventid = urlParams.get("e");

    if (parseFloat(numsrc) == 1) {
        let mag5xml, feltxml;
        try {
            let response = await fetch("https://bmkg-content-inatews.storage.googleapis.com/last30event.xml");
            mag5xml = response;
        } catch (error) {
            mag5xml = "";
        }
        xmlhttp.open("GET", "https://bmkg-content-inatews.storage.googleapis.com/last30event.xml", true);
        xmlhttp.send();
    // } else if (parseFloat(numsrc) == 2) {
        xmlhttp.open("GET", "https://bmkg-content-inatews.storage.googleapis.com/last30feltevent.xml", true);
        xmlhttp.send();
    } else if (parseFloat(numsrc) == 2) {
        xmlhttp.open("GET", "https://bmkg-content-inatews.storage.googleapis.com/live30event.xml", true);
        xmlhttp.send();
    } else {
        return;
    }

}