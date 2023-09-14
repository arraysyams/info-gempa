// Skrip ini dibuat secara khusus untuk memproses file xml yang digunakan pada website ini

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

function getTimezoneRegion(offset) {
    switch (offset) {
        case 7:
            return "WIB";
        case 8:
            return "WITA";
        case 9:
            return "WIT";
        default:
            let offsetDecimal = parseFloat("." + offset.toString().split(".")[1]);
            let offsetMins = "00";
            console.log(offsetDecimal)
            if (offsetDecimal) {
                offsetMins = getTwoDigit(parseFloat(offsetDecimal / 1 * 60));
            }
            if (offset >= 0) {
                offsetHour = Math.floor(offset).toString();
                return "(UTC+" + offsetHour + ":" + offsetMins + ")";
            } else {
                offsetHour = Math.ceil(offset).toString();
                return "(UTC" + offsetHour + ":" + offsetMins + ")";
            }
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
    localTime += " " + getTimezoneRegion(offset)

    let localDate = waktuGempa.getDate() + " " + getBulan(waktuGempa.getMonth()) + " " + waktuGempa.getFullYear();

    return [localTime, localDate];
}

function konversiUTC(strWaktuTanggal) {
    // Format "YYYY/MM/DD HH:MM:SS.000"
    let waktuXML = strWaktuTanggal.split(" ")[1].split(".")[0];
    let tanggalXML = strWaktuTanggal.split(" ")[0];
    tanggalXML = tanggalXML.replaceAll("/", "-");
    let waktuGempa = new Date(tanggalXML + "T" + waktuXML + "+00:00");
    let offset = waktuGempa.getTimezoneOffset() / -60;

    let localTime = getTwoDigit(waktuGempa.getHours()) + ":" + getTwoDigit(waktuGempa.getMinutes()) + ":" + getTwoDigit(waktuGempa.getSeconds());
    localTime += " " + getTimezoneRegion(offset);

    let localDate = waktuGempa.getDate() + " " + getBulan(waktuGempa.getMonth()) + " " + waktuGempa.getFullYear();

    return [localTime, localDate];
}