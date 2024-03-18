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

function getMMIHTMLView(mmi) {
    const daftarMMI = {};
    let splitMMI = mmi.split(",");
    splitMMI.forEach(mmiTempat => {
        // Format: "MMI Nama Tempat" --> "MMI", "Nama", "Tempat"
        // Format MMI: "II", "II-III", "II - III"
        // Hapus spasi agar hasil pertama split selalu MMI
        let reg = new RegExp("\\s*-\\s*", "g");
        mmiTempat = mmiTempat.replace(reg, "-");
        splitMMITempat = mmiTempat.trim().split(" ");
        // Ambil MMI
        let intensitas = splitMMITempat[0].toUpperCase();
        // Hapus variabel MMI dari array
        splitMMITempat.shift();
        // Ambil lokasi; "Nama", "Tempat" --> "Nama Tempat"
        let lokasi = splitMMITempat.join(" ");
        // Masukkan nama tempat pada intensitas yang tersedia pada daftar
        if (daftarMMI[intensitas]) {
            daftarMMI[intensitas] += `, ${lokasi}`;
        } else {
            // Jika intensitas tidak ada dalam daftar, tambah properti
            daftarMMI[intensitas] = lokasi;
        }
    });
    // Ambil properti MMI dari daftarMMI (II, III, ...)
    let propMMI = Object.keys(daftarMMI);
    let outmmi = "";
    propMMI.forEach(intensitas => {
        // Buat span baru
        outmmi += `<span class=\"badge badge-mmi\" style=\"`;
        // Ubah warnanya sesuai tingkat intensitas
        if (matchMultiple(intensitas, ["IX", "X", "XI", "XII"])) {
            outmmi += `--my-mmi-color: #dc3545; --my-mmi-text: white;`;
        } else if (matchMultiple(intensitas, ["VII", "VIII"])) {
            outmmi += `--my-mmi-color: #fd7e14; --my-mmi-text: white;`;
        } else if (matchMultiple(intensitas, ["VI"])) {
            outmmi += `--my-mmi-color: #ffc107; --my-mmi-text: black;`;
        } else if (matchMultiple(intensitas, ["III", "IV", "V"])) {
            outmmi += `--my-mmi-color: #198754; --my-mmi-text: white;`;
        } else {

        }
        // Tutup tag span dan tambahkan nama tempat sesuai MMI
        outmmi += `\">${intensitas}</span>${daftarMMI[intensitas]}<br>`;
    })
    return outmmi;
}