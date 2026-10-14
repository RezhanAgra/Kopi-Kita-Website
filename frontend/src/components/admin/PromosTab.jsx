import { useEffect, useState } from "react";
import api, { formatRupiah } from "../../api/client.js";

const emptyForm = {
  code: "",
  description: "",
  type: "percent",
  value: "",
  maxDiscount: "",
  minSubtotal: "",
};

const PromosTab = () => {
  const [promos, setPromos] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get("/promos").then((res) => setPromos(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/promos", {
      ...form,
      value: Number(form.value),
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
      minSubtotal: form.minSubtotal ? Number(form.minSubtotal) : 0,
    });
    setForm(emptyForm);
    load();
  };

  const toggleActive = async (p) => {
    await api.put(`/promos/${p._id}`, { isActive: !p.isActive });
    load();
  };

  const remove = async (id) => {
    if (!confirm("Hapus kode promo ini?")) return;
    await api.delete(`/promos/${id}`);
    load();
  };

  return (
    <div className="p-6">
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-6">
        <input
          className="input"
          placeholder="KODE"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          required
        />
        <select
          className="input"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="percent">Persen (%)</option>
          <option value="fixed">Potongan Tetap (Rp)</option>
        </select>
        <input
          type="number"
          className="input"
          placeholder="Nilai"
          value={form.value}
          onChange={(e) => setForm({ ...form, value: e.target.value })}
          required
        />
        <input
          type="number"
          className="input"
          placeholder="Maks diskon (opsional)"
          value={form.maxDiscount}
          onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
        />
        <input
          type="number"
          className="input"
          placeholder="Min. belanja"
          value={form.minSubtotal}
          onChange={(e) => setForm({ ...form, minSubtotal: e.target.value })}
        />
        <button className="bg-brand text-black font-semibold rounded-lg text-sm">
          + Tambah Promo
        </button>
        <input
          className="input md:col-span-6"
          placeholder="Deskripsi (mis. Diskon 20% maks Rp 15.000)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </form>

      {loading ? (
        <p className="text-gray-500">Memuat promo...</p>
      ) : (
        <div className="space-y-2">
          {promos.map((p) => (
            <div
              key={p._id}
              className="flex items-center justify-between bg-black/20 border border-base-border rounded-xl p-3"
            >
              <div>
                <p className="font-semibold text-brand">{p.code}</p>
                <p className="text-xs text-gray-400">
                  {p.description || (p.type === "percent" ? `Diskon ${p.value}%` : `Potongan ${formatRupiah(p.value)}`)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(p)}
                  className={`text-xs px-2 py-1 rounded-full ${
                    p.isActive ? "bg-green-900/40 text-green-400" : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {p.isActive ? "Aktif" : "Nonaktif"}
                </button>
                <button onClick={() => remove(p._id)} className="text-red-400 text-xs">
                  Hapus
                </button>
              </div>
            </div>
          ))}
          {promos.length === 0 && <p className="text-gray-500 text-center py-6">Belum ada kode promo.</p>}
        </div>
      )}
    </div>
  );
};

export default PromosTab;
