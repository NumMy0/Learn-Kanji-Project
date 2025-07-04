// Script para asegurar la carga correcta de favicons
document.addEventListener("DOMContentLoaded", () => {
  // Forzar recarga de favicons cambiando las URLs dinámicamente
  const refreshFavicons = () => {
    const timestamp = new Date().getTime();
    const iconLinks = document.querySelectorAll('link[rel*="icon"]');

    iconLinks.forEach((link) => {
      const originalHref = link.getAttribute("href");
      const cleanHref = originalHref.split("?")[0]; // Quitar query params existentes
      link.setAttribute("href", `${cleanHref}?v=${timestamp}`);
    });
  };

  // Intentar refrescar los favicons
  try {
    refreshFavicons();
    console.info("Favicon refresh completed");
  } catch (err) {
    console.warn("Error refreshing favicons:", err);
  }
});
