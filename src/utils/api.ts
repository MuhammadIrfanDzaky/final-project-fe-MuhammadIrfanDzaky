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
  getCourts: () => request('/api/courts'),
  getCourtById: (id: string) => request(`/api/courts/${id}`),
  createCourt: (data: any) => request('/api/courts', { method: 'POST', body: JSON.stringify(data) }),
  updateCourt: (id: string, data: any) => request(`/api/courts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCourt: (id: string) => request(`/api/courts/${id}`, { method: 'DELETE' }),

  // Users
  getUsers: () => request('/api/users'),
  getUserById: (id: string) => request(`/api/users/${id}`),
  createUser: (data: any) => request('/api/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: any) => request(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteUser: (id: string) => request(`/api/users/${id}`, { method: 'DELETE' }),

  // Bookings
  getBookings: () => request('/api/bookings'),
  getBookingById: (id: string) => request(`/api/bookings/${id}`),
  createBooking: (data: { courtId: string; userId: string; date: string; time: string }) => request('/api/bookings', { method: 'POST', body: JSON.stringify(data) }),
  updateBooking: (id: string, data: any) => request(`/api/bookings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteBooking: (id: string) => request(`/api/bookings/${id}`, { method: 'DELETE' }),

  // Auth (example, adjust as needed)
  login: (data: { email: string; password: string }) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: { email: string; password: string; name: string; role: string; phone: string }) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
};
