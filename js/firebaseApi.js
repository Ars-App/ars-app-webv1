// js/firebaseApi.js

export const DB_ROOT = "https://arsapp-beta-v1-default-rtdb.europe-west1.firebasedatabase.app/veriler";

export function bulutaYukleTekil(kategori, veri) {
    fetch(`${DB_ROOT}/${kategori}.json`, {
        method: 'PUT',
        body: JSON.stringify(veri)
    }).catch(e => console.log("Buluta yüklenirken hata oldu."));
}

// Sadece veriyi çeker ve döndürür, kaydetme işine karışmaz.
export async function fetchBulutVeri() {
    try {
        const cevap = await fetch(`${DB_ROOT}.json`, { cache: 'no-store' });
        return await cevap.json();
    } catch (hata) {
        console.log("İnternetten veri çekilemedi, eski verilerle açılıyor.");
        return null;
    }
}