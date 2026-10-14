import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Product from "./models/Product.js";
import Promo from "./models/Promo.js";

dotenv.config();
connectDB();

const sizeOptions = [
  { name: "Reguler (12 oz)", extraPrice: 0 },
  { name: "Large (16 oz)", extraPrice: 5000 },
];

const toppingOptions = [
  { name: "Brown Sugar Boba", price: 4000 },
  { name: "Cheese Foam", price: 5000 },
  { name: "Cincau (Grass Jelly)", price: 3000 },
  { name: "Egg Pudding", price: 4000 },
  { name: "Coffee Jelly", price: 4000 },
];

const products = [
  {
    name: "Kopi Susu Gula Aren",
    category: "kopi-spesial",
    description: "Espresso double shot, susu segar, dan gula aren asli Nusantara. Signature KopiKita.",
    basePrice: 24000,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600",
    sizes: sizeOptions,
    toppings: toppingOptions,
  },
  {
    name: "Espresso Tonic",
    category: "kopi-spesial",
    description: "Double espresso dituang di atas tonic dingin dengan segmen jeruk segar.",
    basePrice: 28000,
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600",
    sizes: sizeOptions,
    toppings: toppingOptions,
  },
  {
    name: "Vanilla Cold Brew",
    category: "kopi-spesial",
    description: "Cold brew diseduh 18 jam, sirup vanila madu, dan sedikit krim.",
    basePrice: 30000,
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=601",
    sizes: sizeOptions,
    toppings: toppingOptions,
  },
  {
    name: "Kyoto Matcha Latte",
    category: "non-kopi",
    description: "Matcha ceremonial grade dari Kyoto dicampur susu segar dingin.",
    basePrice: 28000,
    image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=600",
    sizes: sizeOptions,
    toppings: toppingOptions,
  },
  {
    name: "Dark Belgian Chocolate",
    category: "non-kopi",
    description: "Cokelat Belgia pekat yang meleleh sempurna dengan susu lembut.",
    basePrice: 26000,
    image: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600",
    sizes: sizeOptions,
    toppings: toppingOptions,
  },
  {
    name: "Red Velvet Latte",
    category: "non-kopi",
    description: "Manis lembut khas red velvet dengan busa krim di atasnya.",
    basePrice: 25000,
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600",
    sizes: sizeOptions,
    toppings: toppingOptions,
  },
  {
    name: "Brown Sugar Boba Milk",
    category: "boba",
    description: "Susu segar dengan pearls karamel gula aren yang kenyal dan wangi.",
    basePrice: 26000,
    image: "https://images.unsplash.com/photo-1558857563-b371033873b8?w=600",
    sizes: sizeOptions,
    toppings: toppingOptions,
  },
  {
    name: "Roasted Cheese Milk Tea",
    category: "boba",
    description: "Tea hitam panggang dengan cheese foam asin-gurih di atasnya.",
    basePrice: 28000,
    image: "https://images.unsplash.com/photo-1546039907-7fa05f864c02?w=600",
    sizes: sizeOptions,
    toppings: toppingOptions,
  },
  {
    name: "Taro Boba Fusion",
    category: "boba",
    description: "Taro creamy berpadu dengan boba kenyal dan sedikit susu.",
    basePrice: 27000,
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600",
    sizes: sizeOptions,
    toppings: toppingOptions,
  },
];

const promos = [
  {
    code: "BOBA10",
    description: "Diskon 10% semua menu",
    type: "percent",
    value: 10,
    maxDiscount: 15000,
    minSubtotal: 0,
  },
  {
    code: "GRATIS5K",
    description: "Potongan langsung Rp 5.000",
    type: "fixed",
    value: 5000,
    minSubtotal: 20000,
  },
  {
    code: "KOPIHEMAT20",
    description: "Diskon 20% (maks Rp 15.000)",
    type: "percent",
    value: 20,
    maxDiscount: 15000,
    minSubtotal: 0,
  },
];

const importData = async () => {
  try {
    await Product.deleteMany();
    await Promo.deleteMany();
    await Product.insertMany(products);
    await Promo.insertMany(promos);
    console.log("Data contoh berhasil dimasukkan (products + promos)");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

importData();
