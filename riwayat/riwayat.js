var xmlhttp = new XMLHttpRequest();
var sumberData = "https://bmkg-content-inatews.storage.googleapis.com/last30event.xml";
var networkDebug = false;
const refCard = document.querySelector(".card-event");
const cloneCard = refCard.cloneNode(true);
refCard.remove();
const banner = document.querySelector("#banner");
const loadingCircle = document.querySelector(".loading-indicator");
var resultxml;

document.querySelector("select").addEventListener("change", function (event) {
    ubahData(event.target.value)
})

function firstStart () {
    let lastRiwayat = parseFloat(getCookie("lastriwayat"));
    document.querySelector(".card-list").style.visibility = "visible";
    if (!lastRiwayat || lastRiwayat == 0) {
        document.querySelector(".card-list").innerHTML = "<p>Silakan memilih data melalui dropdown di atas.</p>"
    } else {
        document.querySelector("select").selectedIndex = lastRiwayat;
        ubahData(lastRiwayat);
    }
}

function ubahData(value) {
    if (value == 1) {sumberData = "https://bmkg-content-inatews.storage.googleapis.com/last30event.xml"} else
    if (value == 2) {sumberData = "https://bmkg-content-inatews.storage.googleapis.com/last30feltevent.xml";} else
    if (value == 3) {sumberData = "https://bmkg-content-inatews.storage.googleapis.com/live30event.xml";} else
    if (value == 4) {sumberData = "https://bmkg-content-inatews.storage.googleapis.com/last30tsunamievent.xml";} else
    {return;}
    
    setCookieForever("lastriwayat", value.toString())
    rebuildPage();
}

function rebuildPage() {
    document.querySelector(".card-list").innerHTML = "";
    loadingCircle.style.visibility = "visible";
    loadingCircle.style.display = "flex";
    banner.style.visibility = "collapse";
    banner.style.display = "none";
    xmlhttp.open("GET", sumberData, true);
    xmlhttp.send();
}

function setCookieForever(cname, cvalue) {
    document.cookie = cname + "=" + cvalue + ";path=/";
}

function getCookie(cname) {
    cname = cname.toString() + "=";
    savedCookie = decodeURIComponent(document.cookie).split(";");
    for (let i = 0; i < savedCookie.length; i++) {
        let valCookie = savedCookie[i];
        // Used to remove trailing spaces
        valCookie = valCookie.trimStart();
        // Pick cookie value starting after "cname="
        if (valCookie.indexOf(cname) == 0) {
            return valCookie.substring(cname.length, valCookie.length);
        }
    }
    return "";
}

function tambahInfo(waktu, tanggal, eventid, kedalaman, magnitudo, lokasi, mmi, wzarea, obsarea, subject) {
    let newCard = cloneCard.cloneNode(true);
    newCard.querySelector(".spanWaktu").innerText = waktu;
    newCard.querySelector(".spanTanggal").innerText = tanggal;
    newCard.querySelector(".spanKedalaman").innerText = kedalaman;
    newCard.querySelector(".spanMagnitudo").innerText = magnitudo;
    newCard.querySelector(".spanLokasi").innerText = lokasi;
    newCard.querySelector(".spanLokasiBawah").innerText = lokasi;
    if (mmi) {
        if (typeof mmi == 'string' && mmi.trim() != "") {
            newCard.querySelector(".spanDirasakan").innerHTML = getMMIHTMLView(mmi);
            newCard.querySelector(".card-bawah").classList.remove("d-block", "d-md-none", "d-lg-none");
        }
    } else {
        newCard.querySelector(".spanParentDirasakan").remove();
        newCard.querySelector("hr.mmi").remove();
    }
    
    const pdt = getPDT(subject);
    let infoPDT = "-";
    switch (pdt.split(".")[0]) {
        case "1": infoPDT = "Peringatan dini tsunami (PDT-1)"; break;
        case "2": infoPDT = "Pemutakhiran peringatan dini tsunami (PDT-2)"; break;
        case "3": infoPDT = `Pemutakhiran peringatan tsunami serta pengamatan tinggi muka laut (PDT-${pdt})`; break;
        case "4": infoPDT = "Peringatan dini tsunami telah berakhir"; break;
        default: break;
    }

    if (pdt || (Array.isArray(wzarea) && wzarea.length > 0) || (Array.isArray(obsarea) && obsarea.length > 0)) {
        newCard.querySelector(".spanInfoPDT").innerHTML = infoPDT;
        newCard.querySelector(".spanInfoTsunami").innerHTML = getTsunamiHTMLView(wzarea, (pdt == "1" ? false : true));
        newCard.querySelector(".card-bawah").classList.remove("d-block", "d-md-none", "d-lg-none");
    } else {
        newCard.querySelector(".spanParentInfoTsunami").remove();
        newCard.querySelector("hr.tsunami").remove();
    }

    let mag = parseFloat(magnitudo);
    
    if (mag >= 7) {magColor = "merah";} else
    if (mag >= 5) {magColor = "kuning";} else
    {magColor = "biru";}
    
    ubahWarna(newCard.querySelector(".warna-magnitudo"), magColor);
    document.querySelector(".card-list").appendChild(newCard);
}

function buatDaftar(xmlGempa) {
    for (let i = 0; i < xmlGempa.length; i++) {
        let eventid = xmlGempa[i].querySelector("eventid").innerHTML;
        let timedateConvert = konversiWIB(xmlGempa[i].querySelector("time").innerHTML, xmlGempa[i].querySelector("date").innerHTML, eventid);
        let waktu = timedateConvert[0];
        let tanggal = timedateConvert[1];
        let kedalaman = "Kedalaman: " + xmlGempa[i].querySelector("depth").innerHTML;
        let magnitudo = xmlGempa[i].querySelector("magnitude").innerHTML;
        let lokasi = xmlGempa[i].querySelector("area").innerHTML;
        let mmi;
        try {
            mmi = xmlGempa[i].querySelector("felt").innerHTML;
        } catch (error) {
            mmi = "";
        }

        let wzarealist = [];
        let wzareaxml = xmlGempa[i].querySelectorAll("wzarea");
        wzareaxml.length > 0 && wzareaxml.forEach((wz) => {
            let wzarea = {};
            wzarea["province"] = wz.querySelector("province").innerHTML;
            wzarea["district"] = wz.querySelector("district").innerHTML;
            wzarea["level"] = wz.querySelector("level").innerHTML;
            wzarea["date"] = wz.querySelector("date").innerHTML;
            wzarea["time"] = wz.querySelector("time").innerHTML;
            if (Object.keys(wzarea).length > 0) {
                wzarealist.push(wzarea);
            }
        })

        let obsarealist = [];
        let obsareaxml = xmlGempa[i].querySelectorAll("obsarea");
        obsareaxml.length > 0 && obsareaxml.forEach((obs) => {
            let obsarea = {};
            obsarea["location"] = obs.querySelector("location").innerHTML;
            obsarea["loclatitude"] = obs.querySelector("loclatitude").innerHTML;
            obsarea["loclongitude"] = obs.querySelector("loclongitude").innerHTML;
            obsarea["height"] = obs.querySelector("height").innerHTML;
            obsarea["date"] = obs.querySelector("date").innerHTML;
            obsarea["time"] = obs.querySelector("time").innerHTML;
            if (Object.keys(obsarea).length > 0) {
                obsarealist.push(obsarea);
            }
        })

        let subject = xmlGempa[i].querySelector("subject").innerHTML;

        tambahInfo(waktu, tanggal, eventid, kedalaman, magnitudo, lokasi, mmi, wzarealist, obsarealist, subject);
    }
}

function buatDaftarReal(xmlGempa) {
    for (let i = 0; i < xmlGempa.length; i++) {
        let eventid = xmlGempa[i].querySelector("eventid").innerHTML;
        let datetimeConvert = konversiUTC(xmlGempa[i].querySelector("waktu").innerHTML.replaceAll("  ", " "));
        let waktu = datetimeConvert[0];
        let tanggal = datetimeConvert[1];
        let kedalaman = "Kedalaman: " + xmlGempa[i].querySelector("dalam").innerHTML + " Km";
        let magnitudo = xmlGempa[i].querySelector("mag").innerHTML;
        let lokasi = xmlGempa[i].querySelector("area").innerHTML;
        tambahInfo(waktu, tanggal, eventid, kedalaman, magnitudo, lokasi);
    }
}

function statusUpdate (text) {
    if (networkDebug) {
        console.log(text);
    }
}

xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        if (this.responseXML.querySelector("info")) {
            buatDaftar(this.responseXML.getElementsByTagName("info"))
        } else {
            buatDaftarReal(this.responseXML.getElementsByTagName("gempa"))
        }
        loadingCircle.style.visibility = "collapse";
        loadingCircle.style.display = "none";
    } else if (this.status == 404) {
        statusUpdate("Tidak bisa mengakses file: 404");
    } else {
        statusUpdate("Sedang mengupdate... " + this.readyState + "/" + this.status);
    }
}

xmlhttp.onerror = function() {
    statusUpdate("Kesalahan jaringan?");
    banner.style.visibility = "visible";
    banner.style.display = "block";
    loadingCircle.style.visibility = "collapse";
    loadingCircle.style.display = "none";
}

firstStart()