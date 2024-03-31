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

function getMMIValue (mmi) {
    const romanVal = {
        "I": 1,
        "V": 5,
        "X": 10,
        "": 0,
    }
    if (typeof mmi == "string") {
        const mmiConv = mmi.toUpperCase();
        let mmiNum = 0;
        for (let i = 0; i < mmiConv.length; i++) {
            const nextChar = mmiConv.charAt(i + 1);
            const prevChar = mmiConv.charAt(i - 1);
            const currChar = mmiConv.charAt(i);
            // Jika huruf romawi selanjutnya memiliki nilai yang lebih besar
            // nilai huruf romawi sekarang (current) tidak perlu ditambahkan
            if (romanVal[nextChar] <= romanVal[currChar]) {
                mmiNum = mmiNum + romanVal[currChar];
            }
            // Kurangi nilai huruf romawi sekarang dengan huruf sebelumnya
            // jika nilai sekarang lebih besar
            // Contoh kasus: IV dan IX
            if (romanVal[prevChar] < romanVal[currChar]) {
                mmiNum = mmiNum - romanVal[prevChar];
            }
        }
        return mmiNum;
    } else {
        return 0;
    }
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
    
    // Konversi MMI yang menggunakan angka romawi menjadi angka biasa
    // supaya bisa diurutkan
    let nilaiAngkaMMI = {};
    Object.keys(daftarMMI).forEach(keyMMI => {
        const mmiGroup = keyMMI.split("-");
        if (mmiGroup.length == 1) {
            nilaiAngkaMMI[getMMIValue(keyMMI)] = keyMMI;
        } else {
            // Menggunakan rerata jika mmi lebih dari satu
            // Misalnya II-III --> 2-3 --> 2,5
            let mmiTotal = 0;
            let mmiCount = 0;
            mmiGroup.forEach(mmiRomawi => {
                mmiTotal += getMMIValue(mmiRomawi);
                mmiCount++
            });
            let mmiVal = mmiTotal / mmiCount;
            nilaiAngkaMMI[mmiVal] = keyMMI;
        }
    })
    
    // Mengurutkan mmi dari yang terbesar ke terkecil
    let nilaiUrutMMI = Object.keys(nilaiAngkaMMI).sort((a, b) => b - a);

    let outmmi = "";
    nilaiUrutMMI.forEach(mmiAngka => {
        // Ambil mmi asli (yang menggunakan sistem romawi)
        // sebagai key untuk mengambil data dari daftarMMI
        const mmiRomawi = nilaiAngkaMMI[mmiAngka];
        const mmiAngkaBulat = Math.ceil(parseFloat(mmiAngka));
        // Buat span baru
        outmmi += `<span class=\"badge badge-mmi\" style=\"`;
        // Ubah warnanya sesuai tingkat intensitas
        if (mmiAngkaBulat >= 9) {
            outmmi += `--my-mmi-color: #dc3545; --my-mmi-text: white;`;
        } else if (mmiAngkaBulat >= 7) {
            outmmi += `--my-mmi-color: #fd7e14; --my-mmi-text: white;`;
        } else if (mmiAngkaBulat >= 6) {
            outmmi += `--my-mmi-color: #ffc107; --my-mmi-text: black;`;
        } else {
            if (mmiAngkaBulat >= 3) {
                outmmi += `--my-mmi-color: #198754; --my-mmi-text: white;`;
            }
        }
        // Tutup tag span dan tambahkan nama tempat sesuai MMI
        outmmi += `\">${mmiRomawi}</span>${daftarMMI[mmiRomawi]}<br>`;
    })
    return outmmi;
}

function getTsunamiHTMLView(wzarea) {
    let areaTsunamiHTML = "";
    let statusDaerah = {
        "AWAS": [],
        "SIAGA": [],
        "WASPADA": [],
    }
    const temaStatus = {
        "AWAS": "text-bg-danger",
        "SIAGA": "text-bg-warning",
        "WASPADA": "text-bg-secondary",
    }
    
    // Masukkan data tiap wilayah yang terdampak pada statusnya masing-masing
    for (let i = 0; i < wzarea.length; i++) {
        const wzLevel = wzarea[i]["level"];
        let wzStatus = "";
        Object.keys(statusDaerah).forEach((status) => {
            const regex = new RegExp("\\b" + status + "\\b", "gmi");
            if (wzLevel.match(regex)) {
                statusDaerah[status].push(wzarea[i])
            }
        })
    }
    
    // Buat tabel untuk setiap status daerah
    Object.keys(statusDaerah).forEach((status) => {
        if (statusDaerah[status].length > 0) {
            areaTsunamiHTML += `<div class="table-responsive-md"><table class="table table-sm table-striped table-hover caption-top">
                                <tr><th>Kab/Kota (Provinsi)</th><th>Perkiraan tiba</th></tr>`
            areaTsunamiHTML += `<caption class="px-2 rounded-3 text-center ${temaStatus[status]}"><b>${status}</b></caption>`;
            statusDaerah[status].forEach((daerahTsunami, i) => {
                // Konversi WIB (tanpa eventid)
                const tanggalSplit = daerahTsunami.date.split("-");
                const tahun = tanggalSplit[2]; const bulan = tanggalSplit[1]; const hari = tanggalSplit[0];
                const waktuPerkiraan = new Date(`${tahun}-${bulan}-${hari}T${daerahTsunami.time.split(" ")[0]}+07:00`);
                const offset = waktuPerkiraan.getTimezoneOffset() / -60;
                const localTime = `${getTwoDigit(waktuPerkiraan.getHours())}:${getTwoDigit(waktuPerkiraan.getMinutes())} ${getTimezoneRegion(offset)}`;
                const localDate = `${getTwoDigit(waktuPerkiraan.getDate())}-${getTwoDigit(waktuPerkiraan.getMonth() + 1)}-${waktuPerkiraan.getFullYear()}`;

                areaTsunamiHTML += `<tr><td>${daerahTsunami.district} (${daerahTsunami.province})</td><td>${localDate}<br>${localTime}</td></tr>`;
            })
            areaTsunamiHTML += "</table></div>"
        }
    })
    
    return areaTsunamiHTML;
}