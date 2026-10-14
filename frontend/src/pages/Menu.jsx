import { useEffect, useState } from "react";
import api from "../api/client.js";
import ProductCard from "../components/ProductCard.jsx";
import ProductModal from "../components/ProductModal.jsx";

const CATEGORY_TABS = [
  { key: "all", label: "Semua" },
  { key: "kopi-spesial", label: "Kopi Spesial" },
  { key: "non-kopi", label: "Non-Kopi" },
  { key: "boba", label: "Boba & Bubble Tea" },
];

const Menu = () => {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/products")
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    category === "all" ? products : products.filter((p) => p.category === category);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-1">Menu Minuman</h1>
      <p className="text-gray-400 mb-6">Pilih racikan favoritmu, atur sesuai selera.</p>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setCategory(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
              category === tab.key
                ? "bg-brand text-black border-brand"
                : "border-base-border text-gray-300 hover:border-gray-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-500">Memuat menu...</p>}

      {!loading && filtered.length === 0 && (
        <p className="text-gray-500">
          Belum ada produk. Jalankan <code>npm run seed</code> di folder backend untuk
          data contoh.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filtered.map((product) => (
          <ProductCard key={product._id} product={product} onSelect={setSelected} />
        ))}
      </div>

      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default Menu;
