import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

const Navbar = () => {
  const { totalQty, setIsCartOpen } = useCart();

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive ? "text-brand" : "text-gray-300 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-base-bg/95 backdrop-blur border-b border-base-border">
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-lg">
            ☕
          </span>
          <span className="font-bold text-lg">KopiKita</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/menu" className={linkClass}>
            Menu Minuman
          </NavLink>
          <NavLink to="/lacak" className={linkClass}>
            Lacak Pesanan
          </NavLink>
          <NavLink to="/admin" className={linkClass}>
            Dashboard Admin
          </NavLink>
        </nav>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative w-10 h-10 rounded-full border border-base-border flex items-center justify-center hover:border-brand transition-colors"
        >
          🛍️
          {totalQty > 0 && (
            <span className="absolute -top-1 -right-1 bg-brand text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {totalQty}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
