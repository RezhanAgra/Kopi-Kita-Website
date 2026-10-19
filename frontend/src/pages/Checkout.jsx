import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import api, { formatRupiah } from "../api/client.js";

const DELIVERY_FEE = 9000;
const TAX_RATE = 0.1;

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderType, setOrderType] = useState("pickup");
  const [notes, setNotes] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [payConfig, setPayConfig] = useState(null); // null = checking
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const { data } = await api.get("/orders/payment-config");
        if (!data.ready) throw new Error(data.reason);
        await new Promise((resolve, reject) => {
          if (window.snap) return resolve();
          const script = document.createElement("script");
          script.src = data.snapJsUrl;
          script.setAttribute("data-client-key", data.clientKey);
          script.onload = resolve;
          script.onerror = () => reject(new Error("Gagal memuat Midtrans Snap."));
          document.body.appendChild(script);
        });
        if (!cancelled) setPayConfig({ ready: true });
      } catch (err) {
        if (!cancelled)
          setPayConfig({
            ready: false,
            reason:
              err.response?.data?.message || err.message || "Tidak dapat terhubung ke Midtrans.",
          });
      }
    };
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const tax = Math.round(subtotal * TAX_RATE);
  const deliveryFee = orderType === "delivery" ? DELIVERY_FEE : 0;
  const discount = appliedPromo?.discount || 0;
  const total = subtotal + tax + deliveryFee - discount;

  const applyPromo = async () => {
    setError("");
    if (!promoInput) return;
    try {
      const { data } = await api.post("/promos/validate", {
        code: promoInput,
        subtotal,
      });
      setAppliedPromo(data);
    } catch (err) {
      setAppliedPromo(null);
      setError(err.response?.data?.message || "Kode promo tidak valid");
    }
  };

  const handlePay = async () => {
    setError("");
    if (!name || phone.length < 8) {
      setError("Isi nama dan nomor WhatsApp (min. 8 digit) dulu ya.");
      return;
    }
    if (items.length === 0) {
      setError("Keranjang masih kosong.");
      return;
    }

    setLoading(true);
    try {
      let id = orderId;
      if (!id) {
        const { data: order } = await api.post("/orders", {
          customerName: name,
          phone,
          orderType,
          notes,
          promoCode: appliedPromo?.code || null,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            size: i.size,
            ice: i.ice,
            sweetness: i.sweetness,
            toppings: i.toppings,
            qty: i.qty,
          })),
        });
        id = order.orderId;
        setOrderId(id);
      }

      const { data: pay } = await api.post(`/orders/${id}/pay`);
      const finish = () => {
        clearCart();
        navigate(`/lacak?order=${id}`);
      };
      window.snap.pay(pay.token, {
        onSuccess: finish,
        onPending: finish,
        onError: () => setError("Pembayaran gagal. Silakan coba lagi."),
        onClose: () => setError("Pembayaran belum selesai. Klik tombol bayar untuk melanjutkan."),
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Gagal memproses pembayaran");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-gray-400">
          Keranjangmu kosong. Yuk pilih menu dulu di halaman Menu Minuman.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <p className="text-brand font-bold text-sm tracking-widest mb-1">CHECKOUT</p>
      <h1 className="text-2xl font-bold mb-8">Selesaikan Pesananmu</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ringkasan Pesanan */}
        <div className="bg-base-card border border-base-border rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Ringkasan Pesanan</h2>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.cartId} className="flex justify-between text-sm">
                <div>
                  <p className="font-medium">
                    {item.name} ×{item.qty}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {item.size} · {item.ice} · {item.sweetness}
                    {item.toppings?.length > 0 && ` · +${item.toppings.join(", ")}`}
                  </p>
                </div>
                <span className="text-brand font-medium">
                  {formatRupiah(item.unitPrice * item.qty)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-base-border pt-4 mb-4">
            <p className="text-xs text-gray-400 mb-2">KODE PROMO</p>
            <div className="flex gap-2">
              <input
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                placeholder="KOPIHEMAT20"
                className="flex-1 bg-black/30 border border-base-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
              />
              <button
                onClick={applyPromo}
                className="text-brand text-sm font-semibold px-3"
              >
                Pakai
              </button>
            </div>
            {appliedPromo && (
              <p className="text-xs text-green-400 mt-2">
                Kode {appliedPromo.code} diterapkan — hemat {formatRupiah(appliedPromo.discount)}
              </p>
            )}
          </div>

          <div className="border-t border-base-border pt-4 space-y-2 text-sm">
            <Row label="Subtotal" value={formatRupiah(subtotal)} />
            <Row label="PB1 Resto (10%)" value={formatRupiah(tax)} />
            <Row
              label="Ongkir"
              value={deliveryFee > 0 ? formatRupiah(deliveryFee) : "Gratis (ambil sendiri)"}
            />
            {discount > 0 && (
              <Row label="Diskon" value={`- ${formatRupiah(discount)}`} highlight />
            )}
            <div className="flex justify-between pt-2 border-t border-base-border">
              <span className="font-semibold">Total Pembayaran</span>
              <span className="text-brand font-bold text-lg">{formatRupiah(total)}</span>
            </div>
          </div>
        </div>

        {/* Data Penerima */}
        <div className="bg-base-card border border-base-border rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Data Penerima</h2>

          <Field label="Nama Lengkap">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Budi Santoso"
              className="input"
            />
          </Field>

          <Field label="Nomor WhatsApp">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="081234567890"
              className="input"
            />
          </Field>

          <div className="mb-4">
            <p className="text-sm text-gray-300 mb-2">Tipe Pesanan</p>
            <div className="flex gap-3">
              <button
                onClick={() => setOrderType("pickup")}
                className={`flex-1 border rounded-xl py-3 text-sm font-medium transition-colors ${
                  orderType === "pickup"
                    ? "border-brand text-brand bg-brand/10"
                    : "border-base-border text-gray-300"
                }`}
              >
                🏠 Ambil Sendiri
              </button>
              <button
                onClick={() => setOrderType("delivery")}
                className={`flex-1 border rounded-xl py-3 text-sm font-medium transition-colors ${
                  orderType === "delivery"
                    ? "border-brand text-brand bg-brand/10"
                    : "border-base-border text-gray-300"
                }`}
              >
                🚚 Diantar (+{formatRupiah(DELIVERY_FEE)})
              </button>
            </div>
          </div>

          <Field label="Catatan (opsional)">
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Less sugar, tanpa es untuk satu gelas..."
              className="input"
            />
          </Field>

          {payConfig && !payConfig.ready && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 text-xs rounded-xl p-3 mb-4">
              Pembayaran Midtrans tidak tersedia: {payConfig.reason}
            </div>
          )}

          {error && (
            <p className="bg-red-900/30 border border-red-700 text-red-300 text-sm rounded-lg p-3 mb-4">
              {error}
            </p>
          )}

          <button
            onClick={handlePay}
            disabled={loading || !payConfig?.ready}
            className="w-full bg-brand text-black font-semibold py-3 rounded-full hover:bg-brand-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? "Memproses..."
              : payConfig === null
              ? "Menghubungkan ke Midtrans..."
              : "Bayar via Midtrans"}
          </button>
          <p className="text-center text-xs text-gray-500 mt-3">
            Total dan diskon dihitung ulang oleh server — aman dari manipulasi harga.
          </p>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, highlight }) => (
  <div className="flex justify-between">
    <span className="text-gray-400">{label}</span>
    <span className={highlight ? "text-green-400" : ""}>{value}</span>
  </div>
);

const Field = ({ label, children }) => (
  <div className="mb-4">
    <p className="text-sm text-gray-300 mb-2">{label}</p>
    {children}
  </div>
);

export default Checkout;
