const getApiUrl = () =>
  process.env.USE_SANDBOX_PRINT === "true"
    ? "https://api.sandbox.prodigi.com/v4.0"
    : process.env.PRODIGI_API_URL || "https://api.prodigi.com/v4.0";

const getApiKey = () =>
  process.env.USE_SANDBOX_PRINT === "true"
    ? process.env.PRODIGI_SANDBOX_API_KEY || process.env.PRODIGI_API_KEY!
    : process.env.PRODIGI_API_KEY!;

type ProdigiAddress = {
  line1: string;
  line2?: string;
  postalOrZipCode: string;
  townOrCity: string;
  stateOrCounty?: string;
  countryCode: string;
};

type ProdigiQuoteRequest = {
  sku: string;
  copies: number;
  attributes: Record<string, string>;
  assets: { printArea: string; url: string }[];
  shippingMethod: string;
  destinationCountryCode: string;
};

type ProdigiOrderRequest = {
  shippingMethod: string;
  recipient: {
    name: string;
    address: ProdigiAddress;
  };
  items: {
    sku: string;
    copies: number;
    attributes: Record<string, string>;
    assets: { printArea: string; url: string }[];
  }[];
  idempotencyKey?: string;
};

async function prodigiRequest(
  method: string,
  path: string,
  body?: unknown
) {
  const response = await fetch(`${getApiUrl()}${path}`, {
    method,
    headers: {
      "X-API-Key": getApiKey(),
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`Prodigi API error ${response.status}:`, error);
    throw new Error(`Prodigi API error: ${response.status}`);
  }

  return response.json();
}

export async function getQuote(request: ProdigiQuoteRequest) {
  return prodigiRequest("POST", "/quotes", request);
}

export async function createOrder(request: ProdigiOrderRequest) {
  return prodigiRequest("POST", "/orders", request);
}

export async function getOrderStatus(orderId: string) {
  return prodigiRequest("GET", `/orders/${orderId}`);
}

export async function cancelOrder(orderId: string) {
  return prodigiRequest("POST", `/orders/${orderId}/actions/cancel`);
}
