import { formatRupiah } from "../api/client.js";

const CATEGORY_LABEL = {
  "kopi-spesial": "KOPI SPESIAL",
  "non-kopi": "NON-KOPI",
  boba: "BOBA & BUBBLE TEA",
};

const ProductCard = ({ product, onSelect }) => {
  return (
    <div className="bg-base-card border border-base-border rounded-2xl overflow-hidden flex flex-col hover:border-brand/60 transition-colors">
      <div className="relative h-44">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <span className="absolute top-3 left-3 text-[10px] font-bold tracking-wider bg-black/70 text-brand px-2 py-1 rounded">
          {CATEGORY_LABEL[product.category] || product.category}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-base mb-1">{product.name}</h3>
        <p className="text-sm text-gray-400 flex-1 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-brand font-bold">{formatRupiah(product.basePrice)}</span>
          <button
            onClick={() => onSelect(product)}
            className="flex items-center gap-1 bg-brand text-black text-sm font-semibold px-3 py-1.5 rounded-full hover:bg-brand-light transition-colors"
          >
            + Tambah
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
