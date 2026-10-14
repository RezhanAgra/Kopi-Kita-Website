import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api, { formatRupiah } from "../api/client.js";

const STEPS = [
  { key: "menunggu_konfirmasi", icon: "📋", title: "Pesanan Diterima", sub: "Menunggu Konfirmasi" },
  { key: "sedang_diracik", icon: "☕", title: "Sedang Diracik", sub: "Sedang Diracik" },
  { key: "siap_diambil_dikirim", icon: "📦", title: "Siap Diambil/Dikirim", sub: "Siap Diambil/Dikirim" },
  { key: "selesai", icon: "🎉", title: "Selesai", sub: "Selesai" },
];

const TrackOrder = () => {
  const [params] = useSearchParams();
  const [orderId, setOrderId] = useState(params.get("order") || "");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const lookup = async (id) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
    } catch (err) {
      setOrder(null);
      setError(err.response?.data?.message || "Pesanan tidak ditemukan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.get("order")) lookup(params.get("order"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentStepIndex = order
    ? STEPS.findIndex((s) => s.key === order.kitchenStatus)
    : -1;

  const sendToWhatsapp = () => {
    if (!order) return;
    const text = `*KOPIKITA* — Struk Pesanan%0A${order.orderId}%0ATotal: ${formatRupiah(
      order.total
    )}%0AStatus: ${STEPS[currentStepIndex]?.title}`;
    window.open(`https://wa.me/${order.phone}?text=${text}`, "_blank");
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <p className="text-brand font-bold text-sm tracking-widest mb-1">LACAK PESANAN</p>
      <h1 className="text-2xl font-bold mb-2">Pesananmu Sekarang Ada di Mana?</h1>
      <p className="text-gray-400 mb-6">
        Masukkan ID pesanan (contoh: KPK-XXXXXXXX) untuk melihat status terkini.
      </p>

      <div className="flex gap-3 mb-8">
        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value.toUpperCase())}
          placeholder="KPK-XXXXXXXX"
          className="input flex-1"
        />
        <button
          onClick={() => lookup(orderId)}
          className="bg-brand text-black font-semibold px-5 rounded-full hover:bg-brand-light transition-colors"
        >
          🔍 Lacak
        </button>
      </div>

      {loading && <p className="text-gray-500">Mencari pesanan...</p>}
      {error && (
        <p className="bg-red-900/30 border border-red-700 text-red-300 text-sm rounded-lg p-3">
          {error}
        </p>
      )}

      {order && (
        <div className="bg-base-card border border-base-border rounded-2xl p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="font-bold">{order.orderId}</p>
              <p className="text-sm text-gray-400">
                {order.customerName} ·{" "}
                {new Date(order.createdAt).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                })}
                , {new Date(order.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <span className="text-brand font-bold text-lg">{formatRupiah(order.total)}</span>
          </div>

          <div className="space-y-0">
            {STEPS.map((step, idx) => {
              const isDone = idx <= currentStepIndex;
              return (
                <div key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm border-2 ${
                        isDone
                          ? "bg-green-500/20 border-green-500 text-green-400"
                          : "bg-black/30 border-base-border text-gray-500"
                      }`}
                    >
                      {step.icon}
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div
                        className={`w-0.5 flex-1 min-h-[28px] ${
                          idx < currentStepIndex ? "bg-green-500" : "bg-base-border"
                        }`}
                      />
                    )}
                  </div>
                  <div className="pb-6">
                    <p className={`font-medium ${isDone ? "text-white" : "text-gray-500"}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={sendToWhatsapp}
            className="w-full border border-base-border rounded-full py-3 text-sm font-medium flex items-center justify-center gap-2 hover:border-brand transition-colors"
          >
            💬 Kirim Struk ke WhatsApp
          </button>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
