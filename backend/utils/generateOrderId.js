// Generates order IDs like KPK-9F3A21C7 (matches the KopiKita reference design)
const generateOrderId = () => {
  const random = Math.random().toString(16).slice(2, 10).toUpperCase();
  return `KPK-${random}`;
};

export default generateOrderId;
