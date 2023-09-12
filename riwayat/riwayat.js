var xmlhttp = new XMLHttpRequest();
var sumberData = "https://bmkg-content-inatews.storage.googleapis.com/last30event.xml";
var networkDebug = true;
const refCard = document.querySelector(".card-event");
const cloneCard = refCard.cloneNode(true);
refCard.remove();
var resultxml;

document.querySelector("select").addEventListener("change", (event) => {
    if (event.target.value == 1) {
        sumberData = "https://bmkg-content-inatews.storage.googleapis.com/last30event.xml";
    } else if (event.target.value == 2) {
        sumberData = "https://bmkg-content-inatews.storage.googleapis.com/last30feltevent.xml";
    } else {
        return;
    }
    rebuildPage();
})

function rebuildPage() {
    document.querySelector(".card-list").innerHTML = ""
    xmlhttp.open("GET", sumberData, true);
    xmlhttp.send();
}

function ubahWarna(objek, warna) {
    objek.classList.remove("warna-biru", "warna-kuning", "warna-merah");
    if (warna) {
        objek.classList.add("warna-" + warna);
    }
}

function getTwoDigit(number) {
    numstr = number.toString()
    if (numstr.length < 2) {
        numstr = "0" + numstr;
    }
    return numstr;
}

function getBulan(month) {
    switch (month) {
        case 0: return "Januari";
        case 1: return "Februari";
        case 2: return "Maret";
        case 3: return "April";
        case 4: return "Mei";
        case 5: return "Juni";
        case 6: return "Juli";
        case 7: return "Agustus";
        case 8: return "September";
        case 9: return "Oktober";
        case 10: return "November";
        case 11: return "Desember";
        default: return "";
    }
}

function konversiWIB(strWaktu, strTanggal, strEventID) {
    // Format strWaktu   "HH:MM:SS WIB"
    // Format strTanggal "DD-MM-YY"
    // Format strEventID "YYYYMMDDHHMMSS"
    // return value      ["HH:MM:SS UTC", "DD MMMM YYYY"]

    let waktuXML = strWaktu.split(" ")[0];
    let tanggalXML = strTanggal.split("-")[0];
    let bulanXML = strTanggal.split("-")[1];
    let tahunXML = strTanggal.split("-")[2];
    let tahunKirimXML = strEventID.slice(0, 4);
    let tahunPerkiraan = parseFloat(tahunKirimXML.slice(0, 2) + tahunXML);
    let tahunSelisih = parseFloat(tahunKirimXML) - tahunPerkiraan;
    let tahunKejadian = 0;

    if (tahunSelisih >= 0) {
        tahunKejadian = tahunPerkiraan;
    } else {
        tahunKejadian = (parseFloat(tahunKirimXML.slice(0, 2)) - 1).toString() + tahunXML;
    }

    let waktuGempa = new Date(tahunKejadian + "-" + bulanXML + "-" + tanggalXML + "T" + waktuXML + "+07:00");
    let offset = waktuGempa.getTimezoneOffset() / -60;

    let localTime = getTwoDigit(waktuGempa.getHours()) + ":" + getTwoDigit(waktuGempa.getMinutes()) + ":" + getTwoDigit(waktuGempa.getSeconds());

    switch (offset) {
        case 7:
            localTime += " WIB"; break;
        case 8:
            localTime += " WITA"; break;
        case 9:
            localTime += " WIT"; break;
        default:
            if (offset >= 0) {
                localTime += " (UTC +" + offset + ")";
            } else {
                localTime += " (UTC " + offset + ")";
            }
            break;
    }

    let localDate = waktuGempa.getDate() + " " + getBulan(waktuGempa.getMonth()) + " " + waktuGempa.getFullYear();

    return [localTime, localDate];
}

function tambahInfo(waktu, tanggal, eventid, kedalaman, magnitudo, lokasi) {
    let newCard = cloneCard.cloneNode(true);
    let datetimeConvert = konversiWIB(waktu, tanggal, eventid)
    newCard.querySelector(".spanWaktu").innerText = datetimeConvert[0];
    newCard.querySelector(".spanTanggal").innerText = datetimeConvert[1];
    newCard.querySelector(".spanKedalaman").innerText = kedalaman;
    newCard.querySelector(".spanMagnitudo").innerText = magnitudo;
    newCard.querySelector(".spanLokasi").innerText = lokasi;
    newCard.querySelector(".spanLokasiBawah").innerText = lokasi;
    let mag = parseFloat(magnitudo);
    
    if (mag >= 7) {magColor = "merah";} else
    if (mag >= 5) {magColor = "kuning";} else
    {magColor = "biru";}
    
    ubahWarna(newCard.querySelector(".warna-magnitudo"), magColor);
    document.querySelector(".card-list").appendChild(newCard);
}

function buatDaftar(xmlGempa) {
    for (let i = 0; i < xmlGempa.length; i++) {
        let waktu = xmlGempa[i].querySelector("time").innerHTML;
        let tanggal = xmlGempa[i].querySelector("date").innerHTML;
        let kedalaman = "Kedalaman: " + xmlGempa[i].querySelector("depth").innerHTML;
        let magnitudo = xmlGempa[i].querySelector("magnitude").innerHTML;
        let lokasi = xmlGempa[i].querySelector("area").innerHTML;
        let eventid = xmlGempa[i].querySelector("eventid").innerHTML;
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
        buatDaftar(this.responseXML.getElementsByTagName("info"))
    } else if (this.status == 404) {
        statusUpdate("Tidak bisa mengakses file: 404");
    } else {
        statusUpdate("Sedang mengupdate... " + this.readyState + "/" + this.status);
    }
}

rebuildPage()