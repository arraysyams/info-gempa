function ubahWarna(objek, warna) {
    objek.classList.remove("warna-biru", "warna-kuning", "warna-merah");
    if (warna) {
        objek.classList.add("warna-" + warna);
    }
}

const refCard = document.querySelector(".card-event")
const cloneCard = refCard.cloneNode(true)
refCard.remove()
let newCard = cloneCard
newCard.querySelector(".spanWaktu").innerText = "08:10:00 WIB"
newCard.querySelector(".spanTanggal").innerText = "12-08-23"
newCard.querySelector(".spanKedalaman").innerText = "Kedalaman: 10 km"
newCard.querySelector(".spanMagnitudo").innerText = "5.6"
ubahWarna(newCard.querySelector(".warna-magnitudo"), "kuning")
document.querySelector(".card-list").appendChild(newCard)