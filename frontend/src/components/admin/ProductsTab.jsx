import { useEffect, useState } from "react";
import api, { formatRupiah } from "../../api/client.js";

const emptyForm = {
  name: "",
  category: "kopi-spesial",
  description: "",
  basePrice: "",
  image: "",
  isActive: true,
};

const ProductsTab = ({ onChange }) => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get("/products?all=true").then((res) => setProducts(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, basePrice: Number(form.basePrice) };
    if (editingId) {
      await api.put(`/products/${editingId}`, payload);
    } else {
      await api.post("/products", payload);
    }
    resetForm();
    load();
    onChange?.();
  };

  const edit = (p) => {
    setForm({
      name: p.name,
      category: p.category,
      description: p.description,
      basePrice: p.basePrice,
      image: p.image,
      isActive: p.isActive,
    });
    setEditingId(p._id);
  };

  const remove = async (id) => {
    if (!confirm("Hapus produk ini?")) return;
    await api.delete(`/products/${id}`);
    load();
    onChange?.();
  };

  const toggleActive = async (p) => {
    await api.put(`/products/${p._id}`, { isActive: !p.isActive });
    load();
    onChange?.();
  };

  return (
    <div className="p-6">
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-6">
        <input
          className="input md:col-span-2"
          placeholder="Nama produk"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <select
          className="input"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="kopi-spesial">Kopi Spesial</option>
          <option value="non-kopi">Non-Kopi</option>
          <option value="boba">Boba & Bubble Tea</option>
        </select>
        <input
          type="number"
          className="input"
          placeholder="Harga dasar"
          value={form.basePrice}
          onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
          required
        />
        <input
          className="input md:col-span-2"
          placeholder="URL gambar"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
        />
        <input
          className="input md:col-span-4"
          placeholder="Deskripsi singkat"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="flex gap-2 md:col-span-2">
          <button className="flex-1 bg-brand text-black font-semibold rounded-lg text-sm">
            {editingId ? "Simpan Perubahan" : "+ Tambah Produk"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="px-3 border border-base-border rounded-lg text-sm">
              Batal
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="text-gray-500">Memuat produk...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-base-border">
                <th className="py-2 font-medium">Nama</th>
                <th className="py-2 font-medium">Kategori</th>
                <th className="py-2 font-medium">Harga</th>
                <th className="py-2 font-medium">Terjual</th>
                <th className="py-2 font-medium">Status</th>
                <th className="py-2 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-base-border/60">
                  <td className="py-2 font-medium">{p.name}</td>
                  <td className="py-2 text-gray-400">{p.category}</td>
                  <td className="py-2 text-brand">{formatRupiah(p.basePrice)}</td>
                  <td className="py-2">{p.soldCount}</td>
                  <td className="py-2">
                    <button
                      onClick={() => toggleActive(p)}
                      className={`text-xs px-2 py-1 rounded-full ${
                        p.isActive ? "bg-green-900/40 text-green-400" : "bg-gray-800 text-gray-400"
                      }`}
                    >
                      {p.isActive ? "Aktif" : "Nonaktif"}
                    </button>
                  </td>
                  <td className="py-2 space-x-2">
                    <button onClick={() => edit(p)} className="text-brand text-xs">Edit</button>
                    <button onClick={() => remove(p._id)} className="text-red-400 text-xs">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductsTab;
