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
var linkMap = document.querySelector("#linkMap");

// Variabel elemen warna
var warnaMagnitudo = document.querySelector("#warnaMagnitudo");
var warnaDirasakan = document.querySelector("#warnaDirasakan");
var warnaPotensi = document.querySelector("#warnaPotensi");

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
        sumberData = "https://bmkg-content-inatews.storage.googleapis.com/datagempa.json"
        break;
        
        case 2:
        sumberData = "https://raw.githubusercontent.com/arraysyams/testingrepo/main/datagempa%20-%20inatews%20gempa%20normal.json"
        break;
    }
}

function statusUpdate (text) {
    if (networkDebug) {
        console.log(text);
    }
}

function displayUpdate (jsonGempa, sound = false) {
    let triggerAlert = false;
    let magColor = "biru"

    linkMap.href = "https://www.google.com/maps?q=" + reverseLatitude(jsonGempa.point.coordinates);
    spanDirasakan.innerText = jsonGempa.felt;
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
 fetchUpdate()
 autoUpdater()
