import * as L from "leaflet";
import { splitMMIPlace } from "./mmi";
import { getMMIAssetURL } from "./mmi-assets";

// ======= Inisialisasi leaflet =======
var map = L.map("map", {
	center: [-3, 118],
	zoom: 3,
});
L.tileLayer(
	`https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}@2x.png?key=${
		import.meta.env.VITE_TILE_API_KEY
	}`,
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

// ======= Function update marker =======
import epicenterImage from "./images/epicenter_mark.png";
const markerImage = L.icon({
	iconUrl: epicenterImage,
	iconSize: [22, 22],
	iconAnchor: [11, 11],
	popupAnchor: [0, 0],
	shadowUrl: "",
	shadowSize: [0, 0],
	shadowAnchor: [0, 0],
});
let marker = L.marker([0, 0], { icon: markerImage });
async function updateMarker(lat: number, lng: number) {
	marker.setLatLng([lat, lng]);
	if (!marker.getElement()) {
		marker.addTo(map);
	}
}

// ======= Update tampilan =======
// Elemen HTML
const spanMagnitude = document.querySelector("span#magnitude")!;
const spanWaktu = document.querySelector("span#waktu")!;
const spanTanggal = document.querySelector("span#tanggal")!;
const spanKedalaman = document.querySelector("span#kedalaman")!;
const spanLokasi = document.querySelector("span#lokasi")!;
const spanInformasi = document.querySelector("span#informasi")!;
const cardMagnitudo = document.querySelector("#card-magnitude")!;

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
	informasi,
}: {
	magnitudo: string;
	datetime: string;
	kedalaman: string;
	koordinat: string;
	lokasi: string;
	dirasakan: string;
	informasi: string;
}) {
	// Magnitudo
	const magnitudoNumber = parseFloat(magnitudo);
	spanMagnitude.textContent = magnitudo
		? new Intl.NumberFormat("id-ID", {
				style: "decimal",
				minimumFractionDigits: 1,
		  }).format(magnitudoNumber)
		: "?";

	cardMagnitudo.classList.remove(
		"card__magnitude--low",
		"card__magnitude--medium",
		"card__magnitude--high"
	);
	if (magnitudoNumber >= 7) {
		cardMagnitudo.classList.add("card__magnitude--high");
	} else if (magnitudoNumber >= 5) {
		cardMagnitudo.classList.add("card__magnitude--medium");
	}

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
	} else {
		spanWaktu.textContent = "-";
		spanTanggal.textContent = "-";
	}

	spanKedalaman.textContent = kedalaman
		? `Kedalaman: ${kedalaman}`
		: "Kedalaman: -";

	// Lokasi dan titik gempa (episenter)
	spanLokasi.textContent = lokasi ?? "-";
	const [latString, lngString] = koordinat.split(",");
	const lat = parseFloat(latString.trim());
	const lng = parseFloat(lngString.trim());
	if (!isNaN(lat) && !isNaN(lng)) {
		updateMarker(lat, lng);
		map.setView([lat, lng], 5);
	}

	// Dirasakan
	updateDirasakan(dirasakan);

	// Informasi tambahan
	spanInformasi.textContent =
		informasi.trim() || "Tidak ada informasi tambahan";
}

// ======= Function khusus update MMI =======
const cardDirasakan = document.querySelector("#card-dirasakan")!;
const contentDirasakan = document.querySelector("#content-dirasakan")!;
const feltItemReference = document.querySelector("#felt-item-reference")!;
const feltItemTemplate = feltItemReference.cloneNode(true);
feltItemReference.remove();

async function updateDirasakan(dirasakan: string) {
	const dirasakanTrimmed = dirasakan.trim();
	if (dirasakanTrimmed.length < 1 || dirasakanTrimmed == "-") {
		cardDirasakan.classList.add("card--hidden");
		return;
	}
	contentDirasakan.innerHTML = "";

	const dirasakanSplit = dirasakanTrimmed.split(",");
	const kelompokIntensitas: {
		mmiIdentifier: string;
		mmiList: {
			text: string;
			value: number;
		}[];
		mmiAverage: number;
		locations: string;
	}[] = [];

	for (let i = 0; i < dirasakanSplit.length; i++) {
		const mmiPlaceString = dirasakanSplit[i];
		const daftarIntensitas = splitMMIPlace(mmiPlaceString);

		const mmiSorted = daftarIntensitas.mmi
			.slice()
			.sort((a, b) => a.value - b.value);
		let mmiAverage = null;
		let mmiIdentifier = "";
		// Hanya digunakan sebagai sarana perhitungan
		let mmiTotal = 0;
		let mmiLength = mmiSorted.length;

		mmiSorted.forEach((mmi) => {
			mmiIdentifier = mmiIdentifier ? mmiIdentifier + "-" + mmi.text : mmi.text;
			mmiTotal += mmi.value;
		});
		mmiAverage = mmiTotal / mmiLength;
		if (isNaN(mmiAverage)) {
			mmiAverage = 0;
		}

		const existingIntensity = kelompokIntensitas.find(
			(intensitas) => intensitas.mmiIdentifier == mmiIdentifier
		);
		if (existingIntensity) {
			existingIntensity.locations += ", " + daftarIntensitas.place;
		} else {
			kelompokIntensitas.push({
				mmiList: mmiSorted,
				mmiAverage: mmiAverage,
				mmiIdentifier: mmiIdentifier,
				locations: daftarIntensitas.place,
			});
		}
	}

	kelompokIntensitas
		.sort((a, b) => b.mmiAverage - a.mmiAverage)
		.forEach((intensitas) => {
			const feltItem = feltItemTemplate.cloneNode(true) as Element;

			// Set lokasi intensitas
			const feltLocationElement = feltItem.querySelector(
				".card__felt-location"
			)!;
			feltLocationElement.textContent = intensitas.locations;

			// Set gambar mmi
			const feltMMIContainer = feltItem.querySelector(
				".card__felt-mmi-container"
			)!;
			const feltMMIImageReference = feltItem.querySelector(".card__felt-mmi")!;
			const feltMMIImageTemplate = feltMMIImageReference.cloneNode(true);
			feltMMIImageReference.remove();

			if (intensitas.mmiList.length > 0) {
				intensitas.mmiList.forEach((mmi) => {
					const feltMMIImage = feltMMIImageTemplate.cloneNode(
						true
					) as HTMLImageElement;
					feltMMIImage.src = getMMIAssetURL(mmi.value);
					feltMMIImage.alt =
						mmi.value > 0 && mmi.value < 13
							? `${mmi.value}`
							: "Tidak diketahui";
					feltMMIContainer.appendChild(feltMMIImage);
				});
			} else {
				const feltMMIImage = feltMMIImageTemplate.cloneNode(
					true
				) as HTMLImageElement;
				feltMMIImage.src = getMMIAssetURL(0);
				feltMMIImage.alt = "Tidak diketahui";
				feltMMIContainer.appendChild(feltMMIImage);
			}

			contentDirasakan.appendChild(feltItem);
		});

	cardDirasakan.classList.remove("card--hidden");
}

// ======= Fetch API =======
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
					koordinat: dataGempa?.Coordinates ?? "-,-",
					dirasakan: dataGempa?.Dirasakan ?? "",
					informasi: dataGempa?.Potensi ?? "",
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
