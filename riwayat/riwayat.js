const refCard = document.querySelector(".card-event");
const cloneCard = refCard.cloneNode(true);
refCard.remove();

function ubahWarna(objek, warna) {
    objek.classList.remove("warna-biru", "warna-kuning", "warna-merah");
    if (warna) {
        objek.classList.add("warna-" + warna);
    }
}

function tambahInfo(waktu, tanggal, kedalaman, magnitudo) {
    let newCard = cloneCard.cloneNode(true);
    newCard.querySelector(".spanWaktu").innerText = waktu;
    newCard.querySelector(".spanTanggal").innerText = tanggal;
    newCard.querySelector(".spanKedalaman").innerText = kedalaman;
    newCard.querySelector(".spanMagnitudo").innerText = magnitudo;

    let mag = parseFloat(magnitudo);
    
    if (mag >= 7) {magColor = "merah";} else
    if (mag >= 5) {magColor = "kuning";} else
    {magColor = "biru";}
    
    ubahWarna(newCard.querySelector(".warna-magnitudo"), magColor);
    document.querySelector(".card-list").appendChild(newCard);
}