import crypto from "crypto";

const isProduction = () => process.env.MIDTRANS_IS_PRODUCTION === "true";

// Evaluated lazily so dotenv has already populated process.env
const snapUrl = () =>
  isProduction()
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";

const apiBase = () =>
  isProduction() ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com";

// Verify the server key is accepted by Midtrans (401 = rejected, network error = unreachable)
export const checkConnection = async () => {
  if (!process.env.MIDTRANS_SERVER_KEY || !process.env.MIDTRANS_CLIENT_KEY) {
    return { ready: false, reason: "Kunci Midtrans belum diatur di backend/.env" };
  }
  try {
    const response = await fetch(`${apiBase()}/v2/kopikita-connection-check/status`, {
      headers: { Accept: "application/json", Authorization: authHeader() },
      signal: AbortSignal.timeout(8000),
    });
    if (response.status === 401) {
      return { ready: false, reason: "Server key Midtrans ditolak (401). Periksa MIDTRANS_SERVER_KEY." };
    }
    return { ready: true };
  } catch {
    return { ready: false, reason: "Tidak dapat terhubung ke Midtrans." };
  }
};

const authHeader = () =>
  "Basic " + Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString("base64");

// Create a Snap transaction → { token, redirect_url }
export const createSnapTransaction = async (payload) => {
  if (!process.env.MIDTRANS_SERVER_KEY) {
    throw new Error("MIDTRANS_SERVER_KEY belum diatur di .env");
  }
  const response = await fetch(snapUrl(), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      data.error_messages?.join(", ") || `Midtrans error (${response.status})`
    );
  }
  return data;
};

// signature_key = SHA512(order_id + status_code + gross_amount + ServerKey)
export const verifySignature = ({ order_id, status_code, gross_amount, signature_key }) => {
  const expected = crypto
    .createHash("sha512")
    .update(`${order_id}${status_code}${gross_amount}${process.env.MIDTRANS_SERVER_KEY}`)
    .digest("hex");
  return expected === signature_key;
};
