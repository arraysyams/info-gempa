// Used to watch for dark theme preference
function changeColorScheme(theme) {
    document.querySelector("html").setAttribute("data-bs-theme", theme)
}

// Automatically change the color scheme as the page loads
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    changeColorScheme("dark")
} else {
    changeColorScheme("light")
}

// Automatically change the color scheme after the page loaded
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    const newColorScheme = event.matches ? "dark" : "light";
    changeColorScheme(newColorScheme)
});