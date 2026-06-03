//var API_BASE_URL = import.meta.env.VITE_API_URL || '';
//API_BASE_URL = 'https://api.markensecondhand.com';
//API_BASE_URL = 'http://localhost:5000'
//API_BASE_URL = '';*/
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

console.log('API BASE URL:', API_BASE_URL);

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL ist nicht gesetzt');
}


async function handleResponse(response: Response) {
  if (!response.ok) {
    let message = 'Unbekannter Fehler';

    try {
      const error = await response.json();
      message = error.message || message;
    } catch {
      // absichtlich leer
    }

    throw new Error(message);
  }

  return response.json();
}

export async function fetchCustomers() {
  const response = await fetch(`${API_BASE_URL}/api/customers`);
  return handleResponse(response);
}

export async function createCustomer(customer: {
  customer_number: string;
  first_name: string;
  last_name: string;
  city: string;
  phone: string;
  email: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(customer),
  });

  return handleResponse(response);
}

export async function fetchItems() {
  const response = await fetch(`${API_BASE_URL}/api/items`);
  return handleResponse(response);
}


export async function createItem(item: {
  owner_customer_id: number;
  title: string;
  description?: string;
  category?: string;
  size?: string;
  brand?: string;
  color?: string;
  price: number;
  is_online_visible: number;
  image_url?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });

  return handleResponse(response);
}

export async function fetchSales() {
  const response = await fetch(`${API_BASE_URL}/api/sales`);
  return handleResponse(response);
}

export async function createSale(sale: {
  item_id: number;
  sale_price: number;
  sale_type: 'store' | 'online';
  payment_method: 'cash' | 'bank_transfer';
  notes?: string;
  buyer_customer_id: number;
}) {
  const response = await fetch(`${API_BASE_URL}/api/sales`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sale),
  });

  return handleResponse(response);
}

export async function fetchCustomerCredits() {
  const response = await fetch(`${API_BASE_URL}/api/customers/credits/overview`);
  return handleResponse(response);
}


/* ... deine bisherigen Admin-Funktionen ... */

export async function fetchShopOrders() {
  const response = await fetch(`${API_BASE_URL}/api/shop/orders`);
  return handleResponse(response);
}

export async function uploadItemImage(itemId: number, file: File) {
  const formData = new FormData();
  formData.append('image', file, file.name);

  const response = await fetch(`${API_BASE_URL}/api/items/${itemId}/image`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Bild-Upload fehlgeschlagen');
  }

  return response.json();
}

export async function deleteItemImage(itemId: number) {
  const response = await fetch(`/api/items/${itemId}/image`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Bild löschen fehlgeschlagen');
  }

  return response.json();
}

export async function updateItem(
  itemId: number,
  updates: { is_online_visible?: number }
) {
  const response = await fetch(`${API_BASE_URL}/api/items/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  return handleResponse(response);
}

