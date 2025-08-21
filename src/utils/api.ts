const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'API request failed');
  }
  return res.json();
}

export const api = {
  // Courts
  getCourts: () => request('/courts'),
  getCourtById: (id: string) => request(`/courts/${id}`),
  createCourt: (data: any) => request('/courts', { method: 'POST', body: JSON.stringify(data) }),
  updateCourt: (id: string, data: any) => request(`/courts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCourt: (id: string) => request(`/courts/${id}`, { method: 'DELETE' }),

  // Users
  getUsers: () => request('/users'),
  getUserById: (id: string) => request(`/users/${id}`),
  createUser: (data: any) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: any) => request(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteUser: (id: string) => request(`/users/${id}`, { method: 'DELETE' }),

  // Bookings
  getBookings: () => request('/bookings'),
  getBookingById: (id: string) => request(`/bookings/${id}`),
  createBooking: (data: any) => request('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  updateBooking: (id: string, data: any) => request(`/bookings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteBooking: (id: string) => request(`/bookings/${id}`, { method: 'DELETE' }),

  // Auth (example, adjust as needed)
  login: (data: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
};
