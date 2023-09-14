// Variabel pengambilan data
var xmlhttp = new XMLHttpRequest();
var sumberData = "https://bmkg-content-inatews.storage.googleapis.com/datagempa.json";
var dataGempa;
var cekData = "";

// Variabel elemen teks
var spanWaktu = document.querySelector("#spanWaktu");
var spanTanggal = document.querySelector("#spanTanggal");
var spanKedalaman = document.querySelector("#spanKedalaman");
var spanMagnitudo = document.querySelector("#spanMagnitudo");
var spanWilayah = document.querySelector("#spanWilayah");
var spanDirasakan = document.querySelector("#spanDirasakan");
var spanPotensi = document.querySelector("#spanPotensi");
var spanTsunami = document.querySelector("#spanTsunami");
var linkOSM = document.querySelector("#linkOSM");
var linkGMap = document.querySelector("#linkGMap");

// Variabel elemen warna
var warnaMagnitudo = document.querySelector("#warnaMagnitudo");
var warnaDirasakan = document.querySelector("#warnaDirasakan");
var warnaTsunami = document.querySelector("#warnaTsunami");

// Variabel elemen card
var cardDirasakan = document.querySelector("#cardDirasakan");
var cardTsunami = document.querySelector("#cardTsunami");

// Variabel audio
var audInfo = document.querySelector("#audInfo");
var audAlert = document.querySelector("#audAlert");

// Variabel lain
var banner = document.querySelector("#banner");
var timeRefresh; // Variabel yg akan ditempati timer
var interval = 2500; // Jeda waktu dalam milisekon sebelum refresh
var firstState = true;

// Variabel peta
var map = L.map('map').setView([-3,118], 3);
L.tileLayer('https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=6uSx9gi4Qs2duIW6j3eT', {
    tileSize: 512,
    minZoom: 3,
    zoomOffset: -1,
    maxZoom: 8,
    attribution: '\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e',
    crossOrigin: true
}).addTo(map);
var marker;
var xmark = L.icon({
    iconUrl: 'assets/img/point_x_wide.png',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, 0],
    shadowUrl: '',
    shadowSize: [0, 0],
    shadowAnchor: [0, 0]
});
var faultStyle = {
    "color": "#F86F03",
    "weight": 1,
    "opacity": 1
};
var faultRequest = new XMLHttpRequest();
faultRequest.open("GET", "https://bmkg-content-inatews.storage.googleapis.com/indo_faults_lines.geojson", true);
faultRequest.send();
faultRequest.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        let faults = JSON.parse(this.responseText)
        L.geoJSON(faults, {
            style: faultStyle
        }).addTo(map);
    }
}

// Variabel debug
var networkDebug = false;

// Function untuk menguji coba perubahan data (keperluan debug)
function ubahData (data) {
    switch (data) {
        case 1:
        default:
        sumberData = "https://bmkg-content-inatews.storage.googleapis.com/datagempa.json";
        break;
        
        case 2:
        sumberData = "https://raw.githubusercontent.com/arraysyams/testingrepo/main/datagempa-inatews-gempanormal.json";
        break;
        
        case 3:
        sumberData = "https://raw.githubusercontent.com/arraysyams/testingrepo/main/datagempa-inatews-tsunamiadvisory.json";
        break;
            
        case 4:
        sumberData = "https://raw.githubusercontent.com/arraysyams/testingrepo/main/datagempa-inatews-gempabesar.json";
        break;
    }
}

function statusUpdate (text) {
    if (networkDebug) {
        console.log(text);
    }
}

function matchMultiple(text, arraymatches) {
    let found = false;
    for (let i = 0; i < arraymatches.length; i++) {
        let regex = new RegExp("\\b" + arraymatches[i] + "\\b", "gmi");
        if(text.match(regex)) {
            found = true;
        }
    }
    return found;
}

function displayUpdate (jsonGempa, sound = false) {
    let triggerAlert = false;
    let magColor = "biru";
    let coordinates = reverseCoordinates(jsonGempa.point.coordinates);
    let lat = parseFloat(coordinates.split(",")[0]);
    let lon = parseFloat(coordinates.split(",")[1]);
    let waktuWIB = jsonGempa.time.split(" ")[0];
    let tanggalWIB = jsonGempa.date.split("-")[0];
    let bulanWIB = jsonGempa.date.split("-")[1];
    // let eventid = jsonGempa.eventid
    let tahunWIB = jsonGempa.eventid.toString().slice(0, 2) + jsonGempa.date.split("-")[2];
    let quakeTime = new Date(tahunWIB + "-" + bulanWIB + "-" + tanggalWIB + "T" + waktuWIB + "+07:00");
    let offset = quakeTime.getTimezoneOffset() / -60;
    let localTime = getTwoDigit(quakeTime.getHours()) + ":" + getTwoDigit(quakeTime.getMinutes()) + ":" + getTwoDigit(quakeTime.getSeconds());
    let localDate = quakeTime.getDate() + " " + getBulan(quakeTime.getMonth()) + " " + quakeTime.getFullYear();

    map.setView([lat,lon],5);
    linkGMap.href = "https://www.google.com/maps?q=" + coordinates;
    linkOSM.href = "https://www.openstreetmap.org/?mlat=" + lat + "&mlon=" + lon + "#map=12/" + lat + "/" + lon;
    if (typeof marker !== 'undefined') {
        marker.setLatLng([lat,lon]);
    } else {
        marker = L.marker([lat,lon], {icon: xmark}).addTo(map);
    }

    let mmi = jsonGempa.felt;
    if (!mmi || mmi == "") {
        cardDirasakan.hidden = true;
        spanDirasakan.innerText = "-";
    } else {
        spanDirasakan.innerText = mmi;
        ubahWarna(warnaDirasakan);
        if (matchMultiple(mmi, ["V", "VI", "VII"])) {
            ubahWarna(warnaDirasakan, "kuning");
        }
        if (matchMultiple(mmi, ["VIII", "IX", "X", "XI", "XII"])) {
            ubahWarna(warnaDirasakan, "merah");
            triggerAlert = true;
        }
        cardDirasakan.hidden = false;
    }

    let tsunamiStatus = jsonGempa.subject.split(".")[0]
    if (matchMultiple(tsunamiStatus, ["PD-1", "PD-2", "PD-3"])) {
        let wzarea = jsonGempa.wzarea;
        let areaTsunami = "";
        let daerahAwas = [];
        let daerahSiaga = [];
        let daerahWaspada = [];
        // ubahWarna(warnaTsunami, "kuning");
        for (let i = 0; i < wzarea.length; i++) {
            if (wzarea[i]["level"].match(/\bWASPADA\b/gmi)) {
                daerahWaspada.push("(" + wzarea[i]["province"] + ") " + wzarea[i]["district"]);
            } else if (wzarea[i]["level"].match(/\bSIAGA\b/gmi)) {
                daerahSiaga.push("(" + wzarea[i]["province"] + ") " + wzarea[i]["district"]);
            } else {
                if (wzarea[i]["level"].match(/\bAWAS\b/gmi)) {
                    daerahAwas.push("(" + wzarea[i]["province"] + ") " + wzarea[i]["district"]);
                }
            }
        }
            
        if (daerahAwas.length > 0) {
            areaTsunami += "<span style=\"color:#B31312; font-weight:bold\">=== AWAS ===</span><br>";
            for (let i = 0; i < daerahAwas.length; i++) {
                areaTsunami += (i + 1) + ". " + daerahAwas[i] + "<br>";
            }
            areaTsunami += "<br>"
        }
        if (daerahSiaga.length > 0) {
            areaTsunami += "<span style=\"color:#E57C23; font-weight:bold\">=== SIAGA ===</span><br>";
            for (let i = 0; i < daerahSiaga.length; i++) {
                areaTsunami += (i + 1) + ". " + daerahSiaga[i] + "<br>";
            }
            areaTsunami += "<br>"
        }
        if (daerahWaspada.length > 0) {
            areaTsunami += "<span style=\"font-weight:bold\">=== WASPADA ===</span><br>";
            for (let i = 0; i < daerahWaspada.length; i++) {
                areaTsunami += (i + 1) + ". " + daerahWaspada[i] + "<br>";
            }
        }

        spanTsunami.innerHTML = areaTsunami;
        if (areaTsunami.match(/\bWASPADA\b/gmi)) {
            ubahWarna(warnaTsunami, "kuning");
            triggerAlert = true;
        } 
        if (matchMultiple(areaTsunami, ["SIAGA", "AWAS"])) {
            ubahWarna(warnaTsunami, "merah");
            triggerAlert = true;
        }

        cardTsunami.hidden = false;
    } else if(tsunamiStatus.match(/\bPD-4\b/gmi)) {
        ubahWarna(warnaTsunami, "biru");
        spanTsunami.innerHTML = "Peringatan dini tsunami telah dinyatakan <span style=\"font-weight:bold\">BERAKHIR</span> untuk seluruh wilayah Indonesia";
        cardTsunami.hidden = false;
    } else {
        ubahWarna(warnaTsunami);
        cardTsunami.hidden = true;
        spanTsunami.innerText = "-";
    }

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

    spanWaktu.innerText = localTime;
    spanKedalaman.innerText = "Kedalaman: " + jsonGempa.depth;
    spanMagnitudo.innerText = jsonGempa.magnitude;
    spanPotensi.innerText = jsonGempa.instruction;
    spanTanggal.innerText = localDate;
    spanWilayah.innerText = jsonGempa.area;

    let mag = parseFloat(jsonGempa.magnitude);
    if (mag >= 5) {magColor = "kuning";}
    if (mag >= 7) {magColor = "merah"; triggerAlert = true;}
    
    ubahWarna(warnaMagnitudo, magColor);

    if (sound) {
        if (triggerAlert) {
            audAlert.play();
        } else {
            audInfo.play();
        }

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

function reverseCoordinates(coordinates) {
    let temp = coordinates.split(",");
    return temp[1] + "," + temp[0];
}

function ubahWarna(objek, warna) {
    objek.classList.remove("warna-biru", "warna-kuning", "warna-merah");
    if (warna) {
        objek.classList.add("warna-" + warna);
    }
}

function autoUpdater() {
    statusUpdate("Mengecek pembaruan...");
    fetchUpdate();

    timeRefresh = setTimeout(autoUpdater, interval);
}

function fetchUpdate() {
    xmlhttp.open("GET", sumberData, true);
    xmlhttp.send();
}

xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
    if (!banner.hidden) {
        banner.hidden = true;
    }
        let stringData = JSON.stringify(this.responseText)
        if(cekData != stringData){
            cekData = stringData;
            dataGempa = JSON.parse(this.responseText);
            
            if (firstState) {
                displayUpdate(dataGempa.info, false);
                statusUpdate("Berhasil memuat data");
                firstState = false;
            } else {
                displayUpdate(dataGempa.info, true);
                statusUpdate("Ada update");
            }
        } else {
            statusUpdate("Selesai");
        };

    } else if (this.status == 404) {
        statusUpdate("Tidak bisa mengakses file: 404");
        banner.hidden = false;
    } else {
        statusUpdate("Sedang mengupdate... " + this.readyState + "/" + this.status);
    }
}

xmlhttp.onerror = function() {
    statusUpdate("Kesalahan jaringan?");
    banner.hidden = false;
}

// Mentrigger pengambilan data setelah halaman dimuat
 fetchUpdate();
 autoUpdater();
