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
var sumberData = "https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json";
var dataGempa;
var cekData = "";
var txtDetail = document.getElementById("informasi");
var tblDetail = document.getElementsByClassName("tblGempa");
var imgDetail = document.getElementById("imgShakemap")
var txtLog = document.getElementById("txtLog");
var audWarn = document.getElementById("Warning")
var audAlert = document.getElementById("Alert")
var timeRefresh; // Variabel yg akan ditempati timer
var interval = 5000; // Jeda waktu dalam milisekon sebelum refresh
var firstState = true;

function statusUpdate (text) {
    txtLog.textContent = text;
}

function displayUpdate (inputDataGempa) {
    let out = "Gempa bermagnitudo " + inputDataGempa.Magnitude + " terjadi pada pukul " + inputDataGempa.Jam + " (" + inputDataGempa.Tanggal + "). " + inputDataGempa.Wilayah + ". " + inputDataGempa.Potensi;
    


    txtDetail.textContent = out;

    tblDetail.Bujur.textContent = inputDataGempa.Bujur;
    tblDetail.Coordinates.textContent = inputDataGempa.Coordinates;
    tblDetail.DateTime.textContent = inputDataGempa.DateTime;
    tblDetail.Dirasakan.textContent = inputDataGempa.Dirasakan;
    tblDetail.Jam.textContent = inputDataGempa.Jam;
    tblDetail.Kedalaman.textContent = inputDataGempa.Kedalaman;
    tblDetail.Lintang.textContent = inputDataGempa.Lintang;
    tblDetail.Magnitude.textContent = inputDataGempa.Magnitude;
    tblDetail.Potensi.textContent = inputDataGempa.Potensi;
    tblDetail.Tanggal.textContent = inputDataGempa.Tanggal;
    tblDetail.Wilayah.textContent = inputDataGempa.Wilayah;
    
    locGambar = inputDataGempa.Shakemap
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
    xmlhttp.open("GET", sumberData, true);
    xmlhttp.send();
}

xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        let stringData = JSON.stringify(this.responseText)
        if(cekData != stringData){
            cekData = stringData;
            dataGempa = JSON.parse(this.responseText);
            let mag = parseFloat(dataGempa.Infogempa.gempa.Magnitude);
            displayUpdate(dataGempa.Infogempa.gempa);
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