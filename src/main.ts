import * as L from "leaflet";

// ======= Inisialisasi leaflet =======
var map = L.map("map", {
	center: [-3, 118],
	zoom: 3,
});
L.tileLayer(
	"https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}@2x.png?key=6uSx9gi4Qs2duIW6j3eT",
	{
		tileSize: 512,
		minZoom: 3,
		zoomOffset: -1,
		maxZoom: 8,
		attribution:
			'\u003ca href="https://www.maptiler.com/copyright/" target="_blank"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href="https://www.openstreetmap.org/copyright" target="_blank"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e',
		crossOrigin: true,
	}
).addTo(map);

// ======= Update tampilan =======
// Elemen HTML
const spanMagnitude = document.querySelector("span#magnitude")!;
const spanWaktu = document.querySelector("span#waktu")!;
const spanTanggal = document.querySelector("span#tanggal")!;
const spanKedalaman = document.querySelector("span#kedalaman")!;
const spanLokasi = document.querySelector("span#lokasi")!;
const spanDirasakan = document.querySelector("span#dirasakan")!;
// Array nama bulan
const daftarBulan = [
	"Januari",
	"Februari",
	"Maret",
	"April",
	"Mei",
	"Juni",
	"Juli",
	"Agustus",
	"September",
	"Oktober",
	"November",
	"Desember",
];
// Cek zona waktu
const getTimezone = (offset: number) => {
	const hourOffset = offset / -60;
	switch (hourOffset) {
		case 7:
			return "WIB";
		case 8:
			return "WITA";
		case 9:
			return "WIT";
		default:
			const prefix = hourOffset >= 0 ? "UTC+" : "UTC";
			const hour =
				hourOffset >= 0 ? Math.floor(hourOffset) : Math.ceil(hourOffset);
			const minutes =
				(parseInt(hourOffset.toString().split(".")[1] ?? 0) / 100) * 60;
			if (!isNaN(hour) && !isNaN(minutes)) {
				return `(${prefix}${hour}:${formatTwoDigits(minutes)})`;
			} else {
				return "";
			}
	}
};
// Format dua digit angka
const formatTwoDigits = (number: number) => {
	return new Intl.NumberFormat("id-ID", { minimumIntegerDigits: 2 }).format(
		number
	);
};
// Function
async function updateTampilan({
	magnitudo,
	datetime,
	kedalaman,
	koordinat,
	lokasi,
	dirasakan,
}: {
	magnitudo: string;
	datetime: string;
	kedalaman: string;
	koordinat: string;
	lokasi: string;
	dirasakan: string;
}) {
	// Magnitudo
	spanMagnitude.textContent = magnitudo
		? new Intl.NumberFormat("id-ID", {
				style: "decimal",
				minimumFractionDigits: 1,
		  }).format(parseFloat(magnitudo))
		: "?";

	// Waktu dan tanggal
	const kejadian = new Date(datetime);
	if (!isNaN(kejadian.getTime()) && !isNaN(kejadian.getDate())) {
		const tanggal = `${kejadian.getDate()} ${
			daftarBulan[kejadian.getMonth()]
		} ${kejadian.getFullYear()}`;
		const waktu = `${formatTwoDigits(kejadian.getHours())}:`
			.concat(`${formatTwoDigits(kejadian.getMinutes())}:`)
			.concat(`${formatTwoDigits(kejadian.getSeconds())} `)
			.concat(`${getTimezone(kejadian.getTimezoneOffset())}`);
		spanWaktu.textContent = waktu;
		spanTanggal.textContent = tanggal;
	}

	spanDirasakan.textContent = dirasakan;
	spanKedalaman.textContent = kedalaman;
	spanLokasi.textContent = lokasi;

	const [latString, lngString] = koordinat.split(",");
	const lat = parseInt(latString.trim());
	const lng = parseInt(lngString.trim());

	map.setView([lat, lng]);
}

let currentData = "";
async function ambilDataGempa() {
	try {
		const res = await fetch(
			"https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json"
		);
		if (res.ok) {
			const data = await res.json();
			const dataGempa = data?.Infogempa?.gempa ?? {};
			const dataGempaStringified = JSON.stringify(dataGempa);
			if (currentData !== dataGempaStringified) {
				currentData = dataGempaStringified;
				updateTampilan({
					magnitudo: dataGempa?.Magnitude ?? "",
					datetime: dataGempa?.DateTime ?? "",
					kedalaman: dataGempa?.Kedalaman ?? "",
					lokasi: dataGempa?.Wilayah ?? "",
					koordinat: dataGempa?.Coordinates ?? "0,0",
					dirasakan: dataGempa?.Dirasakan ?? "",
				});
			}
		}
	} catch (error) {
		console.error(error);
	} finally {
		setTimeout(() => ambilDataGempa(), 5000);
	}
}

ambilDataGempa();
