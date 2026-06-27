import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import api from '../../utils/axios'
import { RootState } from '../store'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
  
// Types
interface User {
  id: number
  name: string
  email: string
  mobile: string
  csp_id: number
  csp_code: string
  wallet_balance: number
  status: string
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null
  admin: AdminUser | null
  isAuthenticated: boolean
  isAdminAuthenticated: boolean
  loading: boolean
  adminLoading: boolean
  error: string | null
  adminError: string | null
  otpSent: boolean
  otpMobile: string | null
  resetStep: 'send' | 'verify' | 'done'
}

// CSP Login — accepts CSP code + mobile (public site) OR email (legacy).
export interface LoginCSPPayload {
  csp_code?: string
  mobile?: string
  email?: string
  password: string
  remember_me?: boolean
}

export const loginCSP = createAsyncThunk(
  'auth/loginCSP',
  async (data: LoginCSPPayload, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', data)
      const { access_token, refresh_token, user } = res.data.data
      // Sessions last one day, then re-authentication is required.
      const ONE_DAY = 60 * 60 * 24
      localStorage.setItem('csp_access_token', access_token)
      localStorage.setItem('csp_refresh_token', refresh_token)
      localStorage.setItem('csp_login_expires_at', String(Date.now() + ONE_DAY * 1000))
      // Middleware gates /dashboard on this cookie, so set it on every login.
      if (typeof document !== 'undefined') {
        document.cookie = `token=${access_token}; path=/; max-age=${ONE_DAY}`
      }
      return user as User
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'CSP Login failed')
    }
  }
)

export const loginAdmin = createAsyncThunk(
  'auth/loginAdmin',
  async (data: { email: string; mobile?: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await res.json();
      
      if (!res.ok || !result.success) {
        return rejectWithValue(result.message || 'Admin login failed');
      }
      
      // Store token correctly from YOUR API response structure
      localStorage.setItem('admin_token', result.data.access_token);
      
      // Return admin profile data
      return result.data.admin as AdminUser;
      
    } catch (e: any) {
      return rejectWithValue('Network error');
    }
  }
);

// Fetch CSP Profile
export const fetchMe = createAsyncThunk('auth/fetchMeCSP', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me')
    return res.data.data as User
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message)
  }
})

// Fetch Admin Profile
export const fetchAdminProfile = createAsyncThunk(
  'auth/fetchAdminProfile', 
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('admin_token')
      const res = await fetch(`${API_BASE_URL}/admin/profile`, {
        headers: { 'Authorization': `Bearer ${token!}` }
      })
      if (!res.ok) throw new Error('Failed to fetch profile')
      return (await res.json()).data as AdminUser
    } catch {
      localStorage.removeItem('admin_token')
      return rejectWithValue('Admin session expired')
    }
  }
)

// Logout CSP
export const logoutCSP = createAsyncThunk('auth/logoutCSP', async () => {
  try {
    const rt = localStorage.getItem('csp_refresh_token')
    await api.post('/auth/logout', { refresh_token: rt })
  } catch {}
  localStorage.removeItem('csp_access_token')
  localStorage.removeItem('csp_refresh_token')
  localStorage.removeItem('csp_login_expires_at')
  if (typeof document !== 'undefined') {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }
})

export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { dispatch, getState }) => {    
    const state = getState() as { auth: RootState['auth'] };
    const adminToken = localStorage.getItem('admin_token');
    const cspToken = localStorage.getItem('csp_access_token');
    console.log('Initializing auth with tokens:', { adminToken, cspToken });
    
    // Skip if already authenticated
    if (state.auth.isAuthenticated || state.auth.isAdminAuthenticated) {
      return;
    }
    
    if (adminToken) {
      await dispatch(fetchAdminProfile());
    } else if (cspToken) {
      await dispatch(fetchMe());
    }
  }
)
// Logout Admin
export const logoutAdmin = createAsyncThunk('auth/logoutAdmin', async () => {
  try {
    const token = localStorage.getItem('admin_token')
    await fetch(`${API_BASE_URL}/admin/auth/logout`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
  } catch {}
  localStorage.removeItem('admin_token')
})

// Existing thunks (unchanged)
export const registerCSP = createAsyncThunk(
  'auth/registerCSP',
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/register', data)
      return res.data
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Registration failed')
    }
  }
)

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async (data: { mobile: string; otp: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/verify-otp', data)
      return res.data
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message)
    }
  }
)

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (data: { mobile: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/forgot-password', data)
      return { ...res.data, mobile: data.mobile }
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message)
    }
  }
)

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data: { mobile: string; otp: string; new_password: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/reset-password', data)
      return res.data
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    admin: null,
    isAuthenticated: typeof window !== 'undefined' && !!localStorage.getItem('csp_access_token'),
    isAdminAuthenticated: typeof window !== 'undefined' && !!localStorage.getItem('admin_token'),
    loading: false,
    adminLoading: false,
    error: null,
    adminError: null,
    otpSent: false,
    otpMobile: null,
    resetStep: 'send',
  } as AuthState,
  reducers: {
    clearError: (state) => { 
      state.error = null 
      state.adminError = null 
    },
    clearAdminError: (state) => { state.adminError = null },
    setOtpMobile: (state, action: PayloadAction<string>) => { state.otpMobile = action.payload },
    setResetStep: (state, action: PayloadAction<'send' | 'verify' | 'done'>) => { state.resetStep = action.payload },
    updateWalletBalance: (state, action: PayloadAction<number>) => {
      if (state.user) state.user.wallet_balance = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // CSP Login
      .addCase(loginCSP.pending, (state) => { state.loading = true; state.error = null })
      .addCase(loginCSP.fulfilled, (state, action) => { 
        state.loading = false; 
        state.isAuthenticated = true; 
        state.user = action.payload 
      })
      .addCase(loginCSP.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload as string 
      })
      
      // Admin Login
      .addCase(loginAdmin.pending, (state) => { state.adminLoading = true; state.adminError = null })
      .addCase(loginAdmin.fulfilled, (state, action) => { 
        state.adminLoading = false; 
        state.isAdminAuthenticated = true; 
        state.admin = action.payload;
      })
      .addCase(loginAdmin.rejected, (state, action) => { 
        state.adminLoading = false; 
        state.adminError = action.payload as string 
      })
      
      // CSP Profile
      .addCase(fetchMe.fulfilled, (state, action) => { 
        state.user = action.payload; 
        state.isAuthenticated = true 
      })
      .addCase(fetchMe.rejected, (state) => { 
        state.isAuthenticated = false; 
        state.user = null 
      })
      
      // Admin Profile
      .addCase(fetchAdminProfile.fulfilled, (state, action) => { 
        state.admin = action.payload 
      })
      .addCase(fetchAdminProfile.rejected, (state) => { 
        state.isAdminAuthenticated = false; 
        state.admin = null 
        localStorage.removeItem('admin_token') 
      })
      
      // CSP Logout
      .addCase(logoutCSP.fulfilled, (state) => { 
        state.user = null; 
        state.isAuthenticated = false;
          localStorage.removeItem('csp_access_token');

      })
      
      // Admin Logout
      .addCase(logoutAdmin.fulfilled, (state) => { 
        state.admin = null; 
        state.isAdminAuthenticated = false;
        localStorage.removeItem('admin_token');
      })
      
      // Other existing cases
      .addCase(registerCSP.pending, (state) => { state.loading = true; state.error = null })
      .addCase(registerCSP.fulfilled, (state, action) => { 
        state.loading = false; 
        state.otpSent = true; 
        state.otpMobile = action.meta.arg.mobile 
      })
      .addCase(registerCSP.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload as string 
      })
      .addCase(verifyOTP.fulfilled, (state) => { state.loading = false; state.otpSent = false })
      .addCase(forgotPassword.fulfilled, (state, action) => { 
        state.loading = false; 
        state.otpSent = true; 
        state.otpMobile = action.payload.mobile; 
        state.resetStep = 'verify' 
      })
      .addCase(resetPassword.fulfilled, (state) => { state.loading = false; state.resetStep = 'done' })
      .addCase(initializeAuth.fulfilled, (state) => {})
  },
})

export const { 
  clearError, 
  clearAdminError, 
  setOtpMobile, 
  setResetStep, 
  updateWalletBalance 
} = authSlice.actions

export default authSlice.reducer