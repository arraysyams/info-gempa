const urlParams = new URLSearchParams(window.location.search);
var xmlhttp = new XMLHttpRequest();
var cachexml = [];
networkDebug = true;

function statusUpdate (text) {
    if (networkDebug) {
        console.log(text);
    }
}

// xmlhttp.onreadystatechange = function() {
//     if (this.readyState == 4 && this.status == 200) {
//         if (this.responseXML.querySelector("info")) {
//             cachexml.push(this.responseXML.querySelector("alert"));
//         } else {
//             cachexml += this.responseXML.querySelector("Infogempa");
//         }
//     } else if (this.status == 404) {
//         statusUpdate("Tidak bisa mengakses file: 404");
//     } else {
//         statusUpdate("Sedang mengupdate... " + this.readyState + "/" + this.status);
//     }
// }

async function getXML(url) {
    const parser = new DOMParser();
    let result;
    try {
        let response = await fetch(url);
        result = await response.text();
    } catch (error) {
        result = `<error>${error}</error>`;
    }
    return parser.parseFromString(result, "text/xml");
}

async function displayStats() {
    // const parser = new DOMParser();
    let numsrc = urlParams.get("src");
    let eventid = urlParams.get("e");
    let realxml;

    if (parseFloat(numsrc) == 1) {
        let mag5xml = await getXML("https://bmkg-content-inatews.storage.googleapis.com/last30event.xml");
        let feltxml = await getXML("https://bmkg-content-inatews.storage.googleapis.com/last30feltevent.xml");
        
        let emag5 = mag5xml.querySelectorAll("eventid");
        let efelt = feltxml.querySelectorAll("eventid");
        let detailxml;

        // Search information on felt first for actual update
        for (let i = 0; i < efelt.length; i++) {
            if (efelt[i].innerHTML == eventid) {
                detailxml = efelt[i].parentElement;
            }
        }
        if (typeof(detailxml) == 'undefined') {
            for (let i = 0; i < emag5.length; i++) {
                if (emag5[i].innerHTML == eventid) {
                    detailxml = emag5[i].parentElement;
                }
            }
        }
        console.log(detailxml)

    } else if (parseFloat(numsrc) == 2) {
        xmlhttp.open("GET", "https://bmkg-content-inatews.storage.googleapis.com/live30event.xml", true);
        xmlhttp.send();
    } else {
        return;
    }

}