const urlParams = new URLSearchParams(window.location.search);
var xmlhttp = new XMLHttpRequest();
var cachexml = [];
networkDebug = true;

function statusUpdate (text) {
    if (networkDebug) {
        console.log(text);
    }
}

async function getXML(url) {
    const parser = new DOMParser();
    let result;
    try {
        let response = await fetch(url);
        if (!response.ok) {
            throw new Error(response.status);
        }
        result = await response.text();
    } catch (error) {
        result = `<eventid><error>${error}</error></eventid>`;
    }
    return parser.parseFromString(result, "text/xml");
}

async function displayStats() {
    // const parser = new DOMParser();
    let numsrc = urlParams.get("src");
    let eventid = urlParams.get("e");

    if (!navigator.onLine) {
        console.log("No internet connection");
        return;
    }

    if (parseFloat(numsrc) == 1) {
        let mag5xml = await getXML("https://bmkg-content-inatews.storage.googleapis.com/last30event.xml");
        let feltxml = await getXML("https://bmkg-content-inatews.storage.googleapis.com/last30feltevent.xml");

        let emag5 = mag5xml.querySelectorAll("eventid");
        let efelt = feltxml.querySelectorAll("eventid");
        let detailxml;

        // Search information on feltxml
        for (let i = 0; i < efelt.length; i++) {
            if (efelt[i].innerHTML == eventid) {
                detailxml = efelt[i].parentElement;
            }
        }
        // If nothing's found, search on mag5xml
        if (typeof(detailxml) == 'undefined') {
            for (let i = 0; i < emag5.length; i++) {
                if (emag5[i].innerHTML == eventid) {
                    detailxml = emag5[i].parentElement;
                }
            }
        }
        // Throw an error message since there's no matching eventid
        if (typeof(detailxml) == 'undefined') {
            let errout = "";
            err1 = emag5[0].querySelector("error").innerHTML;
            err2 = efelt[0].querySelector("error").innerHTML;
            if (err1 == err2) {
                errout = err1;
            } else {
                errout = `${err1}\n${err2}`;
            }
            console.log(errout);
        } else {
            console.log(detailxml);
        }

    } else if (parseFloat(numsrc) == 2) {
        let realxml = await getXML("https://bmkg-content-inatews.storage.googleapis.com/live30event.xml");
        let ereal = realxml.querySelectorAll("eventid");
        
        for (let i = 0; i < ereal.length; i++) {
            if (ereal[i].innerHTML == eventid) {
                detailxml = ereal[i].parentElement;
            }
        }
        if (typeof(detailxml) == 'undefined') {
            let errout = ereal[0].querySelector("error").innerHTML;
            console.log(errout);
        } else {
            console.log(detailxml);
        }
    } else {
        return;
    }
}