import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/admin/login", { username, password });
      localStorage.setItem("kopikita_admin_token", data.token);
      navigate("/admin");
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal");
    }
  };

  return (
    <div className="max-w-sm mx-auto px-6 py-24">
      <h1 className="text-xl font-bold mb-1">Login Admin</h1>
      <p className="text-gray-400 text-sm mb-6">Masuk untuk mengelola KopiKita.</p>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          className="input"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="input"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button className="w-full bg-brand text-black font-semibold py-2.5 rounded-full hover:bg-brand-light transition-colors">
          Masuk
        </button>
        <p className="text-xs text-gray-500 text-center">
          Default demo: admin / admin123 (ubah di backend/.env)
        </p>
      </form>
    </div>
  );
};

export default AdminLogin;
