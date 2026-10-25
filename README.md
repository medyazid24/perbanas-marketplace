# perbanas-marketplace
Proyek website Perbanas Marketplace dikembangkan untuk lomba Perbanas Technow Fest 2026 cabang Web Developmnet (E-Commerce)

## 👥 Identitas Tim
* **Nama Tim:** Wadimor Anti Gedor
* **Ketua Tim:** Rifky Achmad Yazid
* **Anggota 1:** Habibie Jenedi
* **Anggota 2:** Muammar Qaddafi

## 🛒 Deskripsi Proyek
Perbanas Marketplace adalah platform e-commerce yang berfokus pada jual beli barang antarmahasiswa Perbanas Institut seperti buku, perlengkapan kuliah, dan barang bekas. Proyek ini dirancang dengan antarmuka yang responsif untuk memudahkan proses transaksi secara digital maupun COD (Cash On Delivery) di wilayah Perbanas Institut.

## ✨ Fitur Utama
* Autentikasi Mahasiswa.
* Katalog Produk.
* Sistem Keranjang Belanja (Add to Cart).
* Simulasi Checkout dan perhitungan total harga.

## 💻 Teknologi yang Digunakan
* **Front-end:** HTML, CSS, JavaScript
* **Back-end:** Node.js
* **Database:** MongoDB Compass

## 🚀 Cara Menjalankan Proyek (Localhost)
Ikuti langkah-langkah berikut agar aplikasi dapat berjalan di komputer juri:

1. **Unduh Proyek:**
   Clone repository ini atau unduh sebagai ZIP lalu ekstrak.
2. **Persiapan Database:**
   * Buka aplikasi MongoDB Compass.
   * Aktifkan connection localhost.
   * Buat database baru bernama `[perbanas_marketplace]`.
   * Buat 2 connections baru bernama `[products]` dan `[users]`.
   * Impor file json `perbanas_marketplace.products` dan `perbanas_marketplace.users` dari folder `MongoDB` ke dalam document connection masing-masing.
3. **Konfigurasi Koneksi:**
   * Buka Visual Studio Code dan buka folder repository ini.
   * Buka terminal backend dan jalankan `node server.js`.
   * Jika sudah terhubung ke MongoDB biarkan terminal tetap terbuka.
4. **Jalankan Aplikasi:**
   * Klik dan jalankan file bernama `index.html` pada repository ini.

## 🔑 Akun Pengujian (Demo)
Sistem akan menyimpan akun secara automatis ke database `[users]`. Jadi pilih metode antara `NIM` atau `email perbanas` dengan mengisi **Nama Lengkap, NIM/Email Perbanas, Password** yang diinginkan.
