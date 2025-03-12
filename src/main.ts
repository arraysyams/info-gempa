import * as L from "leaflet";

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
