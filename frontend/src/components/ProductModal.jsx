import { useMemo, useState } from "react";
import { formatRupiah } from "../api/client.js";
import { useCart } from "../context/CartContext.jsx";

const ProductModal = ({ product, onClose }) => {
  const { addItem } = useCart();
  const [size, setSize] = useState(product.sizes?.[0]?.name || "Reguler");
  const [ice, setIce] = useState(product.iceLevels?.[0] || "Es Normal");
  const [sweetness, setSweetness] = useState(
    product.sweetnessLevels?.[0] || "Manis 100%"
  );
  const [toppings, setToppings] = useState([]);

  const toggleTopping = (name) => {
    setToppings((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  const totalPrice = useMemo(() => {
    const sizeExtra = product.sizes?.find((s) => s.name === size)?.extraPrice || 0;
    const toppingsTotal = toppings.reduce((sum, tName) => {
      const t = product.toppings?.find((pt) => pt.name === tName);
      return sum + (t ? t.price : 0);
    }, 0);
    return product.basePrice + sizeExtra + toppingsTotal;
  }, [product, size, toppings]);

  const handleAdd = () => {
    addItem({
      productId: product._id,
      name: product.name,
      image: product.image,
      size,
      ice,
      sweetness,
      toppings,
      qty: 1,
      unitPrice: totalPrice,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 overflow-y-auto">
      <div className="bg-base-card border border-base-border rounded-2xl w-full max-w-md mt-10 mb-10 overflow-hidden">
        <div className="relative h-40">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="p-5">
          <p className="text-[11px] font-bold text-brand tracking-wider mb-1">
            {product.category?.toUpperCase()}
          </p>
          <h2 className="text-xl font-bold mb-1">{product.name}</h2>
          <p className="text-sm text-gray-400 mb-5">{product.description}</p>

          {product.sizes?.length > 0 && (
            <Section title="UKURAN">
              {product.sizes.map((s) => (
                <OptionPill
                  key={s.name}
                  active={size === s.name}
                  onClick={() => setSize(s.name)}
                >
                  {s.name} {s.extraPrice > 0 && `+${formatRupiah(s.extraPrice)}`}
                </OptionPill>
              ))}
            </Section>
          )}

          <Section title="LEVEL ES">
            {product.iceLevels.map((lvl) => (
              <OptionPill key={lvl} active={ice === lvl} onClick={() => setIce(lvl)}>
                {lvl}
              </OptionPill>
            ))}
          </Section>

          <Section title="LEVEL MANIS">
            {product.sweetnessLevels.map((lvl) => (
              <OptionPill
                key={lvl}
                active={sweetness === lvl}
                onClick={() => setSweetness(lvl)}
              >
                {lvl}
              </OptionPill>
            ))}
          </Section>

          {product.toppings?.length > 0 && (
            <Section title="TAMBAHAN TOPPING">
              {product.toppings.map((t) => (
                <OptionPill
                  key={t.name}
                  active={toppings.includes(t.name)}
                  onClick={() => toggleTopping(t.name)}
                >
                  {toppings.includes(t.name) && "✓ "}
                  {t.name} +{formatRupiah(t.price)}
                </OptionPill>
              ))}
            </Section>
          )}

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-base-border">
            <div>
              <p className="text-xs text-gray-400">Total Harga</p>
              <p className="text-lg font-bold text-brand">{formatRupiah(totalPrice)}</p>
            </div>
            <button
              onClick={handleAdd}
              className="bg-brand text-black font-semibold px-6 py-2.5 rounded-full hover:bg-brand-light transition-colors"
            >
              Tambah
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="mb-5">
    <p className="text-xs font-semibold text-gray-400 tracking-wider mb-2">{title}</p>
    <div className="flex flex-col gap-2">{children}</div>
  </div>
);

const OptionPill = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`text-left text-sm px-3 py-2 rounded-lg border transition-colors ${
      active
        ? "border-brand text-brand bg-brand/10 font-medium"
        : "border-base-border text-gray-300 hover:border-gray-500"
    }`}
  >
    {children}
  </button>
);

export default ProductModal;
