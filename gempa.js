// Bagaimana cara minta izin autoplay dari browser?
// Tombol untuk refresh data manual (keperluan debug)
// Link json untuk testing perubahan: sudah ada di ubahData()
// Lokasi shakemap: https://data.bmkg.go.id/DataMKG/TEWS/$Shakemap

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
var linkMap = document.querySelector("#linkMap");

// Variabel elemen warna
var warnaMagnitudo = document.querySelector("#warnaMagnitudo");
var warnaDirasakan = document.querySelector("#warnaDirasakan");
var warnaPotensi = document.querySelector("#warnaPotensi");
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

    linkMap.href = "https://www.google.com/maps?q=" + reverseLatitude(jsonGempa.point.coordinates);

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

    let wzarea = jsonGempa.wzarea;
    if (!wzarea || wzarea == "") {
        cardTsunami.hidden = true;
        spanTsunami.innerText = "-";
    } else {
        let areaTsunami = "";
        // ubahWarna(warnaTsunami, "kuning");
        for (let i = 0; i < wzarea.length; i++) {
            areaTsunami += (i + 1);
            areaTsunami += ". ";
            areaTsunami += wzarea[i]["district"];
            areaTsunami += " : ";
            areaTsunami += wzarea[i]["level"];
            areaTsunami += "\n";
        }
        spanTsunami.innerText = areaTsunami;
        if (areaTsunami.match(/\bWASPADA\b/gmi)) {
            ubahWarna(warnaTsunami, "kuning");
            triggerAlert = true;
        } 
        if (matchMultiple(areaTsunami, ["SIAGA", "AWAS"])) {
            ubahWarna(warnaTsunami, "merah");
            triggerAlert = true;
        }

        cardTsunami.hidden = false;
    }

    spanWaktu.innerText = jsonGempa.time;
    spanKedalaman.innerText = "Kedalaman: " + jsonGempa.depth;
    spanMagnitudo.innerText = jsonGempa.magnitude;
    spanPotensi.innerText = jsonGempa.instruction;
    spanTanggal.innerText = jsonGempa.date;
    spanWilayah.innerText = jsonGempa.area;


    let mag = Math.round(parseFloat(jsonGempa.magnitude));
    if (mag >= 4) {magColor = "kuning";}
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

function reverseLatitude(lat) {
    let temp = lat.split(",");
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
=======
// Cek update setiap 5s /done
// Konten teks hanya akan direfresh jika ada yang berubah / ada masalah
// Akan ada variabel baru sebagai pembanding /done
// Jika data gagal diakses, tampilkan teks berisi pesan offline
// Bagaimana cara minta izin autoplay dari browser?
// Tombol untuk refresh data manual (keperluan debug)
// Placeholder gambar
// Link json untuk testing perubahan: https://raw.githubusercontent.com/arraysyams/testingrepo/main/autogempa.json
// Link json dari bmkg: https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json
// Lokasi shakemap: https://data.bmkg.go.id/DataMKG/TEWS/$Shakemap
var xmlhttp = new XMLHttpRequest();
var sumberData = "https://bmkg-content-inatews.storage.googleapis.com/datagempa.json";
var dataGempa;
var cekData = "";
var txtDetail = document.getElementById("informasi");
var tblDetail = document.getElementsByClassName("tblGempa");
var imgDetail = document.getElementById("imgShakemap")
var txtLog = document.getElementById("txtLog");
var audWarn = document.getElementById("Warning")
var audAlert = document.getElementById("Alert")
var timeRefresh; // Variabel yg akan ditempati timer
var interval = 2500; // Jeda waktu dalam milisekon sebelum refresh
var firstState = true;

// Function untuk menguji coba perubahan data (keperluan debug)
function ubahData (data) {
    switch (data) {
        case 1:
        default:
        sumberData = "https://bmkg-content-inatews.storage.googleapis.com/datagempa.json";
        break;
        
        case 2:
        sumberData = "https://raw.githubusercontent.com/arraysyams/testingrepo/main/datagempa%20-%20inatews%20gempa%20normal.json";
        break;
    }
}


function statusUpdate (text) {
    txtLog.textContent = text;
}

function displayUpdate (dtGempa) {
//     let out = "Gempa bermagnitudo " + dtGempa.magnitude + " terjadi pada pukul " + dtGempa.time + " (" + dtGempa.date + "). " + dtGempa.area + ". " + dtGempa.instruction;
    let out = "Gempa Mag:" + dtGempa.magnitude + ", " + dtGempa.date + " " + dtGempa.time + ", Lok:" + dtGempa.latitude + "," + dtGempa.longitude + " (" + dtGempa.area + "), Kedalaman:" + dtGempa.depth + ", " + dtGempa.instruction;
    
    txtDetail.textContent = out;

    tblDetail.Bujur.textContent = dtGempa.longitude;
    tblDetail.Coordinates.textContent = dtGempa.point.coordinates;
    tblDetail.DateTime.textContent = dtGempa.timesent;
    tblDetail.Dirasakan.textContent = dtGempa.felt;
    tblDetail.Jam.textContent = dtGempa.time;
    tblDetail.Kedalaman.textContent = dtGempa.depth;
    tblDetail.Lintang.textContent = dtGempa.latitude;
    tblDetail.Magnitude.textContent = dtGempa.magnitude;
    tblDetail.Potensi.textContent = dtGempa.instruction;
    tblDetail.Tanggal.textContent = dtGempa.date;
    tblDetail.Wilayah.textContent = dtGempa.area;
    
    let locGambar = dtGempa.shakemap
    if (locGambar == undefined) {
        locGambar = "img/placeholder.mmi.jpg"
    } else {
        locGambar = "https://data.bmkg.go.id/DataMKG/TEWS/" + locGambar
    }

    imgDetail.src = locGambar
}

function autoUpdater() {
    statusUpdate("Mengecek pembaruan...");
    fetchUpdate();

    timeRefresh = setTimeout(autoUpdater, interval);
}

function fetchUpdate() {
    xmlhttp.open("GET", sumberData + "?t=" + Date.now(), true);
    xmlhttp.send();
}

xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        let stringData = JSON.stringify(this.responseText)
        if(cekData != stringData){
            cekData = stringData;
            dataGempa = JSON.parse(this.responseText);
            let mag = parseFloat(dataGempa.info.magnitude);
            displayUpdate(dataGempa.info);
            if (firstState) {
                statusUpdate("Berhasil memuat data")
                firstState = false
            } else {
                if (mag >= 6) { audAlert.play() } else { audWarn.play() }
                statusUpdate("Ada update");
            }
        } else {
            statusUpdate("Selesai");
        };

    } else if (this.status == 404) {
        statusUpdate("Tidak bisa mengakses file: 404")
    } else {
        statusUpdate("Sedang mengupdate... " + this.readyState + "/" + this.status)
    }
}

xmlhttp.onerror = function() {
    statusUpdate("Kesalahan jaringan?")
}

// Mentrigger pengambilan data setelah halaman dimuat
fetchUpdate()
autoUpdater()