// Tek noktadan API base URL.
// Yerelde çalışırken http://localhost:3000 kullanır.
// Yayında (docply / canlı) build sırasında .env dosyasına
//   VITE_API_URL=https://senin-backend-adresin.com
// koyduğun zaman otomatik onu kullanır.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";
