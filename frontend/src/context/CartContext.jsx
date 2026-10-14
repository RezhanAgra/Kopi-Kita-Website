import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // item: { productId, name, size, ice, sweetness, toppings[], qty, unitPrice, image }
  const addItem = (item) => {
    setItems((prev) => [...prev, { ...item, cartId: crypto.randomUUID() }]);
    setIsCartOpen(true);
  };

  const removeItem = (cartId) => {
    setItems((prev) => prev.filter((i) => i.cartId !== cartId));
  };

  const updateQty = (cartId, qty) => {
    setItems((prev) =>
      prev.map((i) => (i.cartId === cartId ? { ...i, qty: Math.max(1, qty) } : i))
    );
  };

  const clearCart = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0),
    [items]
  );

  const totalQty = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        subtotal,
        totalQty,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
