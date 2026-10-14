import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";

const Home = () => {
  const [promos, setPromos] = useState([]);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    // Public promo list — falls back gracefully if endpoint requires admin.
    api
      .get("/promos/active")
      .then((res) => setPromos(res.data))
      .catch(() => setPromos([]));
  }, []);

  const copyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(""), 1500);
  };

  return (
    <div>
      <section
        className="relative min-h-[560px] flex items-center bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(13,13,13,0.55), rgba(13,13,13,0.85)), url(https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1400)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-20 w-full">
          <p className="text-brand font-bold tracking-widest text-sm mb-4">
            KOPI · NON-KOPI · BOBA
          </p>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight max-w-2xl mb-6">
            Racikan Kopi Nusantara &{" "}
            <span className="text-brand">Boba Kekinian</span>
          </h1>
          <p className="text-gray-300 max-w-xl mb-8">
            Diseduh segar setiap pesanan — dari espresso gula aren sampai brown
            sugar boba. Pesan sekarang, ambil di kasir atau minta diantar.
          </p>
          <div className="flex gap-4">
            <Link
              to="/menu"
              className="bg-brand text-black font-semibold px-6 py-3 rounded-full hover:bg-brand-light transition-colors"
            >
              Pesan Sekarang →
            </Link>
            <Link
              to="/lacak"
              className="border border-white/30 px-6 py-3 rounded-full font-semibold hover:border-white transition-colors"
            >
              Lacak Pesanan
            </Link>
          </div>
        </div>
      </section>

      {promos.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 -mt-10 relative z-10 pb-16">
          <div className="bg-base-card border border-base-border rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-3 shrink-0">
              <span className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center text-brand text-lg">
                🎟️
              </span>
              <div>
                <p className="text-[11px] font-bold text-brand tracking-wider">
                  PROMO HARI INI
                </p>
                <p className="font-semibold">Pakai kode ini biar lebih hemat</p>
                <p className="text-xs text-gray-500">
                  Ketuk kode untuk menyalin, lalu tempel di halaman pembayaran.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 md:ml-auto">
              {promos.map((p) => (
                <button
                  key={p.code}
                  onClick={() => copyCode(p.code)}
                  className="text-left bg-black/30 border border-base-border rounded-xl px-4 py-2 hover:border-brand transition-colors"
                >
                  <p className="text-brand font-bold text-sm flex items-center gap-1">
                    ✓ {p.code}
                  </p>
                  <p className="text-xs text-gray-400">
                    {copied === p.code ? "Tersalin!" : p.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
