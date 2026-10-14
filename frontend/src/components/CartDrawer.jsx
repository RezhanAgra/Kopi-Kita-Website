import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { formatRupiah } from "../api/client.js";

const CartDrawer = () => {
  const { items, removeItem, updateQty, subtotal, isCartOpen, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const goCheckout = () => {
    setIsCartOpen(false);
    navigate("/checkout");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
      <div className="w-full max-w-md h-full bg-base-card border-l border-base-border flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-base-border">
          <h2 className="font-bold text-lg">Keranjang</h2>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 && (
            <p className="text-gray-500 text-sm text-center mt-10">
              Keranjang masih kosong. Yuk pilih menu favoritmu!
            </p>
          )}
          {items.map((item) => (
            <div key={item.cartId} className="flex gap-3 border-b border-base-border pb-4">
              <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-gray-400">
                  {item.size} · {item.ice} · {item.sweetness}
                  {item.toppings?.length > 0 && ` · +${item.toppings.join(", ")}`}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.cartId, item.qty - 1)}
                      className="w-6 h-6 rounded-full border border-base-border text-sm"
                    >
                      −
                    </button>
                    <span className="text-sm w-4 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.cartId, item.qty + 1)}
                      className="w-6 h-6 rounded-full border border-base-border text-sm"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-brand text-sm font-semibold">
                    {formatRupiah(item.unitPrice * item.qty)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeItem(item.cartId)}
                className="text-gray-500 hover:text-red-400 text-xs self-start"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="p-5 border-t border-base-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm">Subtotal</span>
              <span className="font-bold">{formatRupiah(subtotal)}</span>
            </div>
            <button
              onClick={goCheckout}
              className="w-full bg-brand text-black font-semibold py-3 rounded-full hover:bg-brand-light transition-colors"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
