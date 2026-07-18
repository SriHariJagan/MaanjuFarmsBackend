# State Management Guide

## Recommended Approach

For this project, **Zustand** or **Redux Toolkit** would work well. Zustand is recommended for simplicity.

---

## Store Structure

### Auth Store

```javascript
// stores/authStore.js
{
  user: {
    id: string,
    name: string,
    email: string,
    role: 'user' | 'admin',
  } | null,
  token: string | null,
  isAuthenticated: boolean,
  isAdmin: boolean,
  loading: boolean,

  actions: {
    login(email, password): Promise<void>,
    signup(name, email, password): Promise<void>,
    logout(): void,
    getMe(): Promise<void>,
    setToken(token): void,
  }
}
```

**Persistence:** Store token in `localStorage`. Hydrate store on app load.

**On Logout:** Remove token from localStorage, reset user state.

---

### Cart Store

```javascript
// stores/cartStore.js
{
  items: [
    {
      product: Product,
      quantity: number,
      _id: string
    }
  ],
  loading: boolean,

  actions: {
    fetchCart(): Promise<void>,
    addToCart(productId, quantity): Promise<void>,
    removeFromCart(productId): Promise<void>,
    clearCart(): void,
  }
}
```

**Behavior:**
- Fetch cart on app load if user is authenticated
- Optimistic updates optional
- Cart is stored server-side (in User model), so always fetch latest

---

### UI Store

```javascript
// stores/uiStore.js
{
  theme: 'light' | 'dark',
  sidebarOpen: boolean,
  notifications: [{ id, type, message }],
  loading: {
    global: boolean,
    [key: string]: boolean
  }
}
```

---

## API Layer

### Using React Query (Recommended)

```javascript
// hooks/useProducts.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/api/products'),
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/api/products/${id}`),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/api/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}
```

### Axios Instance

```javascript
// lib/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## Caching Strategy

| Data | Cache Strategy | Stale Time |
|---|---|---|
| Products | Cache until invalidated | 5 minutes |
| Rooms | Cache until invalidated | 5 minutes |
| Cart | Always fetch fresh | 0 (stale immediately) |
| Orders | Fetch fresh on mount | 0 |
| Bookings | Fetch fresh on mount | 0 |
| Gallery | Cache until invalidated | 10 minutes |
| User Profile | Cache until invalidated | Session |
| Pincode Check | Don't cache | — |

---

## Authentication State Flow

```
App Load
  ├─ Check localStorage for token
  │   ├─ Token found → GET /api/auth/me
  │   │   ├─ Success → Set user in auth store
  │   │   └─ Error (401) → Clear token, redirect to login
  │   └─ No token → Set isAuthenticated = false
  │
  ├─ Login
  │   ├─ POST /api/auth/login
  │   ├─ Store token in localStorage
  │   ├─ Set user in auth store
  │   └─ Redirect to home / previous page
  │
  └─ Logout
      ├─ Clear token from localStorage
      ├─ Reset auth store
      ├─ Invalidate all queries
      └─ Redirect to home
```

---

## URL State (Query Params)

For filters, search, and pagination, use URL search params:

```
/villas?page=2&search=olive&minPrice=2000&maxPrice=5000&type=cottage
```

This allows:
- Bookmarkable URLs
- Browser back/forward navigation
- Shareable links

Use `useSearchParams` from React Router or `nuqs` library.
