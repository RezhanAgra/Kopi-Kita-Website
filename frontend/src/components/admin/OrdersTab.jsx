import { useEffect, useState } from "react";
import api, { formatRupiah } from "../../api/client.js";

const STATUS_OPTIONS = [
  { value: "menunggu_konfirmasi", label: "Menunggu Konfirmasi" },
  { value: "sedang_diracik", label: "Sedang Diracik" },
  { value: "siap_diambil_dikirim", label: "Siap Diambil/Dikirim" },
  { value: "selesai", label: "Selesai" },
];

const OrdersTab = ({ onStatusChange }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get("/orders").then((res) => setOrders(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id, kitchenStatus) => {
    await api.patch(`/orders/${id}/status`, { kitchenStatus });
    load();
    onStatusChange?.();
  };

  const sendReceipt = (order) => {
    const text = `*KOPIKITA* — Struk Pesanan%0A${order.orderId}%0ATotal: ${formatRupiah(order.total)}`;
    window.open(`https://wa.me/${order.phone}?text=${text}`, "_blank");
  };

  if (loading) return <p className="p-6 text-gray-500">Memuat pesanan...</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400 border-b border-base-border">
            <th className="p-4 font-medium">Pesanan</th>
            <th className="p-4 font-medium">Item</th>
            <th className="p-4 font-medium">Total</th>
            <th className="p-4 font-medium">Pembayaran</th>
            <th className="p-4 font-medium">Status Dapur</th>
            <th className="p-4 font-medium">Struk</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id} className="border-b border-base-border/60 hover:bg-black/20">
              <td className="p-4">
                <p className="font-semibold">{o.orderId}</p>
                <p className="text-xs text-gray-500">
                  {o.customerName} ·{" "}
                  {new Date(o.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })},{" "}
                  {new Date(o.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="text-xs text-gray-500">{o.orderType === "delivery" ? "Diantar" : "Ambil sendiri"}</p>
              </td>
              <td className="p-4 max-w-[220px] truncate">
                {o.items.map((i) => `${i.name} x${i.qty}`).join(", ")}
              </td>
              <td className="p-4 text-brand font-semibold">{formatRupiah(o.total)}</td>
              <td className="p-4">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    o.paymentStatus === "paid"
                      ? "bg-green-900/40 text-green-400"
                      : "bg-yellow-900/40 text-yellow-400"
                  }`}
                >
                  {o.paymentStatus === "paid" ? "Lunas" : "Menunggu Bayar"}
                </span>
              </td>
              <td className="p-4">
                <select
                  value={o.kitchenStatus}
                  onChange={(e) => updateStatus(o._id, e.target.value)}
                  className="bg-black/30 border border-base-border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-brand"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </td>
              <td className="p-4">
                <button
                  onClick={() => sendReceipt(o)}
                  className="text-xs border border-green-700 text-green-400 px-3 py-1.5 rounded-full hover:bg-green-900/20"
                >
                  💬 Kirim
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && (
        <p className="p-6 text-gray-500 text-center">Belum ada pesanan masuk.</p>
      )}
    </div>
  );
};

export default OrdersTab;
