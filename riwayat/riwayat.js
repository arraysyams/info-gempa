var xmlhttp = new XMLHttpRequest();
var sumberData = "https://bmkg-content-inatews.storage.googleapis.com/last30event.xml";
var networkDebug = true;
const refCard = document.querySelector(".card-event");
const cloneCard = refCard.cloneNode(true);
refCard.remove();
var resultxml;

function ubahWarna(objek, warna) {
    objek.classList.remove("warna-biru", "warna-kuning", "warna-merah");
    if (warna) {
        objek.classList.add("warna-" + warna);
    }
}

function tambahInfo(waktu, tanggal, kedalaman, magnitudo, lokasi) {
    let newCard = cloneCard.cloneNode(true);
    newCard.querySelector(".spanWaktu").innerText = waktu;
    newCard.querySelector(".spanTanggal").innerText = tanggal;
    newCard.querySelector(".spanKedalaman").innerText = kedalaman;
    newCard.querySelector(".spanMagnitudo").innerText = magnitudo;
    newCard.querySelector(".spanLokasi").innerText = lokasi;
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
        tambahInfo(waktu, tanggal, kedalaman, magnitudo, lokasi);
    }
}

function statusUpdate (text) {
    if (networkDebug) {
        console.log(text);
    }
}

xmlhttp.open("GET", sumberData, true);
xmlhttp.send();

xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        buatDaftar(this.responseXML.getElementsByTagName("info"))
    } else if (this.status == 404) {
        statusUpdate("Tidak bisa mengakses file: 404");
    } else {
        statusUpdate("Sedang mengupdate... " + this.readyState + "/" + this.status);
    }
}