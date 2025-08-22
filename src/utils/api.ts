const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers && typeof options.headers === 'object' && !Array.isArray(options.headers) ? options.headers : {}) as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
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
  getCourtById: (id: number) => request(`/api/courts/${id}`),
  createCourt: (data: any) => request('/api/courts', { method: 'POST', body: JSON.stringify(data) }),
  updateCourt: (id: number, data: any) => request(`/api/courts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCourt: (id: number) => request(`/api/courts/${id}`, { method: 'DELETE' }),

  // Users
  getUsers: () => request('/api/users'),
  getUserById: (id: number) => request(`/api/users/${id}`),
  createUser: (data: any) => request('/api/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: number, data: any) => request(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteUser: (id: number) => request(`/api/users/${id}`, { method: 'DELETE' }),

  // Bookings
  getBookings: () => request('/api/bookings'),
  getBookingById: (id: number) => request(`/api/bookings/${id}`),
  createBooking: (data: { courtId: number; userId: number; date: string; time: string }) => request('/api/bookings', { method: 'POST', body: JSON.stringify(data) }),
  updateBooking: (id: number, data: any) => request(`/api/bookings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteBooking: (id: number) => request(`/api/bookings/${id}`, { method: 'DELETE' }),

  // Auth (example, adjust as needed)
  login: (data: { email: string; password: string }) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: { email: string; password: string; name: string; role: string; phone: string }) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
};
