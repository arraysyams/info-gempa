// Variabel pengambilan data
var xmlhttp = new XMLHttpRequest();
var sumberData = "https://bmkg-content-inatews.storage.googleapis.com/lastQL.json";
var dataGempa;
var cekData = "";

// Variabel elemen teks
var spanWaktu = document.querySelector("#spanWaktu");
var spanTanggal = document.querySelector("#spanTanggal");
var spanKedalaman = document.querySelector("#spanKedalaman");
var spanMagnitudo = document.querySelector("#spanMagnitudo");
var spanWilayah = document.querySelector("#spanWilayah");
var linkOSM = document.querySelector("#linkOSM");
var linkGMap = document.querySelector("#linkGMap");

// Variabel elemen warna
var warnaMagnitudo = document.querySelector("#warnaMagnitudo");

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
L.tileLayer('https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}@2x.png?key=6uSx9gi4Qs2duIW6j3eT', {
    tileSize: 512,
    minZoom: 3,
    zoomOffset: -1,
    maxZoom: 8,
    attribution: '\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e',
    crossOrigin: true
}).addTo(map);
var marker;
var xmark = L.icon({
    iconUrl: '../assets/img/point_x_wide.png',
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

function statusUpdate (text) {
    if (networkDebug) {
        console.log(text);
    }
}

function displayUpdate (jsonGempa, sound = false) {
    let triggerAlert = false;
    let magColor = "biru";
    let coordinates = jsonGempa.geometry.coordinates;
    let lat = parseFloat(coordinates[1]);
    let lon = parseFloat(coordinates[0]);
    let mag = Math.round(parseFloat(jsonGempa.properties.mag) * 10) / 10;
    let timedateConvert = konversiUTC(jsonGempa.properties.time);
    let localTime = timedateConvert[0]
    let localDate = timedateConvert[1]

    map.setView([lat,lon],5)
    linkGMap.href = "https://www.google.com/maps?q=" + lat + ", " + lon;
    linkOSM.href = "https://www.openstreetmap.org/?mlat=" + lat + "&mlon=" + lon + "#map=12/" + lat + "/" + lon;
    if (typeof marker !== 'undefined') {
        marker.setLatLng([lat,lon]);
    } else {
        marker = L.marker([lat,lon], {icon: xmark}).addTo(map);
    }

    spanWaktu.innerText = localTime;
    spanKedalaman.innerText = "Kedalaman: " + Math.round(parseFloat(jsonGempa.properties.depth)) + " km";
    spanMagnitudo.innerText = mag;
    spanTanggal.innerText = localDate;
    spanWilayah.innerText = jsonGempa.properties.place;

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
                displayUpdate(dataGempa.features[0], false);
                statusUpdate("Berhasil memuat data");
                firstState = false;
            } else {
                displayUpdate(dataGempa.features[0], true);
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
