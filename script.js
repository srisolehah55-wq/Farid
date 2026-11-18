
const nomorWA = "6281234567890";

function beli(nama, harga) {
    const pesan = "Halo, saya ingin membeli " +
        nama + " dengan harga Rp" + harga;

    const link = "https://wa.me/" +
        nomorWA + "?text=" +
        encodeURIComponent(pesan);

    window.open(link, "_blank");
}

function keProduk() {
    document.getElementById("produk")
        .scrollIntoView({
            behavior: "smooth"
        });
}

console.log("MarketPro berhasil berjalan!");
