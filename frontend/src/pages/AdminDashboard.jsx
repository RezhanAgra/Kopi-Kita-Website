import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import api, { formatRupiah } from "../api/client.js";
import OrdersTab from "../components/admin/OrdersTab.jsx";
import ProductsTab from "../components/admin/ProductsTab.jsx";
import PromosTab from "../components/admin/PromosTab.jsx";

const TABS = ["Pesanan", "Produk", "Promo"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState("Pesanan");
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("kopikita_admin_token");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    setAuthChecked(true);
    loadStats();
  }, []);

  const loadStats = () => {
    api
      .get("/admin/stats")
      .then((res) => setStats(res.data))
      .catch(() => {
        localStorage.removeItem("kopikita_admin_token");
        navigate("/admin/login");
      });
  };

  const logout = () => {
    localStorage.removeItem("kopikita_admin_token");
    navigate("/admin/login");
    window.location.reload();
  };

  const downloadReport = async () => {
    const res = await api.get("/admin/report.xlsx", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `laporan-penjualan-kopikita-${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (!authChecked) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-brand font-bold text-sm tracking-widest mb-1">ADMIN</p>
          <h1 className="text-2xl font-bold">Portal Pengelola KopiKita</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 border border-green-700 text-green-400 px-4 py-2 rounded-full text-sm font-medium hover:bg-green-900/20"
          >
            📊 Unduh Laporan Excel
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-2 border border-base-border px-4 py-2 rounded-full text-sm font-medium hover:border-gray-500"
          >
            ↪ Keluar
          </button>
        </div>
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard icon="💰" label="TOTAL PENDAPATAN" value={formatRupiah(stats.totalRevenue)} />
            <StatCard icon="✅" label="PESANAN LUNAS" value={stats.paidOrdersCount} />
            <StatCard icon="🍳" label="PERLU DIPROSES" value={stats.pendingCount} />
            <StatCard icon="🥤" label="PRODUK AKTIF" value={stats.activeProducts} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-base-card border border-base-border rounded-2xl p-6">
              <p className="text-sm font-semibold text-gray-300 mb-4">
                PENDAPATAN 7 HARI TERAKHIR
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={stats.revenueByDay}>
                  <CartesianGrid stroke="#2a2a2a" vertical={false} />
                  <XAxis dataKey="date" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: "#171717", border: "1px solid #2a2a2a" }}
                    formatter={(v) => formatRupiah(v)}
                  />
                  <Line type="monotone" dataKey="total" stroke="#f5940c" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-base-card border border-base-border rounded-2xl p-6">
              <p className="text-sm font-semibold text-gray-300 mb-4">MENU TERLARIS</p>
              <div className="space-y-3">
                {stats.topProducts.map((p) => {
                  const max = stats.topProducts[0]?.soldCount || 1;
                  return (
                    <div key={p._id} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-28 shrink-0 text-right">
                        {p.name}
                      </span>
                      <div className="flex-1 h-3 bg-black/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand rounded-full"
                          style={{ width: `${Math.max(6, (p.soldCount / max) * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              tab === t
                ? "bg-white text-black border-white"
                : "border-base-border text-gray-300 hover:border-gray-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-base-card border border-base-border rounded-2xl overflow-hidden">
        {tab === "Pesanan" && <OrdersTab onStatusChange={loadStats} />}
        {tab === "Produk" && <ProductsTab onChange={loadStats} />}
        {tab === "Promo" && <PromosTab />}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="bg-base-card border border-base-border rounded-2xl p-5">
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs font-semibold text-gray-400 tracking-wider">{label}</p>
      <span>{icon}</span>
    </div>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default AdminDashboard;
