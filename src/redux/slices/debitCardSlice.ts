import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import api from '@/utils/axios'

const API_BASE = '/csp/debit-card-requests'

export interface CustomerSearchResult {
  id: number
  name: string
  mobile: string
  account_number: string
  aadhar_number: string
  address: string
  pin_code: string
  account_type: string
  ifsc: string
  opening_balance: string
  bank_id: number
  bank_name: string
  bank_code: string
  branch_name: string
}

export interface DebitCardRequest {
  id: string
  user_id: number
  customer_id: number | null
  bank_id: number
  status: string
  request_data: Record<string, any>
  pdf_generated: boolean
  pdf_file_path: string | null
  submitted_at: string
  created_at: string
  updated_at: string
  bank_name?: string
  bank_code?: string
  customer_name?: string
  customer_mobile?: string
  account_number?: string
}

export interface DebitCardFormData {
  branchName: string
  place: string
  accountNumber: string
  cardRequestType: string
  cardType: string
  nameOnCard: string
  deliveryAddress: string
  atmUsage: string
  posUsage: string
  mobileNumber: string
}

interface DebitCardState {
  step: 'customer' | 'form' | 'review' | 'done'
  customerSearchResults: CustomerSearchResult[]
  customerSearchLoading: boolean
  selectedCustomer: CustomerSearchResult | null
  formData: DebitCardFormData
  submitting: boolean
  pdfGenerating: boolean
  pdfDownloadUrl: string | null
  submitResult: DebitCardRequest | null
  requests: DebitCardRequest[]
  requestsLoading: boolean
  currentRequest: DebitCardRequest | null
  error: string | null
}

const initialFormData: DebitCardFormData = {
  branchName: '',
  place: '',
  accountNumber: '',
  cardRequestType: '',
  cardType: '',
  nameOnCard: '',
  deliveryAddress: '',
  atmUsage: '',
  posUsage: '',
  mobileNumber: '',
}

const initialState: DebitCardState = {
  step: 'customer',
  customerSearchResults: [],
  customerSearchLoading: false,
  selectedCustomer: null,
  formData: { ...initialFormData },
  submitting: false,
  pdfGenerating: false,
  pdfDownloadUrl: null,
  submitResult: null,
  requests: [],
  requestsLoading: false,
  currentRequest: null,
  error: null,
}

export const searchCustomers = createAsyncThunk(
  'debitCard/searchCustomers',
  async (query: string, { rejectWithValue }) => {
    try {
      const res = await api.get('/csp/customers/search', { params: { q: query } })
      return res.data?.data || []
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to search customers')
    }
  }
)

export const submitDebitCardRequest = createAsyncThunk(
  'debitCard/submitDebitCardRequest',
  async (payload: { bankId: number; customerId: number; requestData: DebitCardFormData }, { rejectWithValue }) => {
    try {
      const res = await api.post(`${API_BASE}?generatePdf=true`, payload)
      return res.data?.data || null
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to submit request')
    }
  }
)

export const fetchMyDebitCardRequests = createAsyncThunk(
  'debitCard/fetchMyDebitCardRequests',
  async (params: { status?: string } = {}, { rejectWithValue }) => {
    try {
      const res = await api.get(API_BASE, { params })
      return res.data?.data || []
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to fetch requests')
    }
  }
)

export const fetchDebitCardRequest = createAsyncThunk(
  'debitCard/fetchDebitCardRequest',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`${API_BASE}/${id}`)
      return res.data?.data || null
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to fetch request')
    }
  }
)

const debitCardSlice = createSlice({
  name: 'debitCard',
  initialState,
  reducers: {
    setStep(state, action: PayloadAction<'customer' | 'form' | 'review' | 'done'>) {
      state.step = action.payload
    },
    selectCustomer(state, action: PayloadAction<CustomerSearchResult | null>) {
      state.selectedCustomer = action.payload
      if (action.payload) {
        state.formData.branchName = action.payload.branch_name || ''
        state.formData.accountNumber = action.payload.account_number || ''
        state.formData.mobileNumber = action.payload.mobile || ''
      }
    },
    clearCustomerSearch(state) {
      state.customerSearchResults = []
    },
    updateFormData(state, action: PayloadAction<Partial<DebitCardFormData>>) {
      state.formData = { ...state.formData, ...action.payload }
    },
    resetForm(state) {
      state.step = 'customer'
      state.formData = { ...initialFormData }
      state.submitResult = null
      state.currentRequest = null
      state.selectedCustomer = null
      state.customerSearchResults = []
      state.pdfGenerating = false
      state.pdfDownloadUrl = null
      state.error = null
    },
    setCurrentRequest(state, action: PayloadAction<DebitCardRequest | null>) {
      state.currentRequest = action.payload
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchCustomers.pending, (state) => {
        state.customerSearchLoading = true
        state.error = null
      })
      .addCase(searchCustomers.fulfilled, (state, action) => {
        state.customerSearchLoading = false
        state.customerSearchResults = action.payload
      })
      .addCase(searchCustomers.rejected, (state, action) => {
        state.customerSearchLoading = false
        state.error = action.payload as string
      })

      .addCase(submitDebitCardRequest.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(submitDebitCardRequest.fulfilled, (state, action) => {
        state.submitting = false
        state.submitResult = action.payload
        state.currentRequest = action.payload
      })
      .addCase(submitDebitCardRequest.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload as string
      })

      .addCase(fetchMyDebitCardRequests.pending, (state) => {
        state.requestsLoading = true
        state.error = null
      })
      .addCase(fetchMyDebitCardRequests.fulfilled, (state, action) => {
        state.requestsLoading = false
        state.requests = action.payload
      })
      .addCase(fetchMyDebitCardRequests.rejected, (state, action) => {
        state.requestsLoading = false
        state.error = action.payload as string
      })

      .addCase(fetchDebitCardRequest.pending, (state) => {
        state.error = null
      })
      .addCase(fetchDebitCardRequest.fulfilled, (state, action) => {
        state.currentRequest = action.payload
      })
      .addCase(fetchDebitCardRequest.rejected, (state, action) => {
        state.error = action.payload as string
      })

  },
})

export const {
  setStep,
  selectCustomer,
  clearCustomerSearch,
  updateFormData,
  resetForm,
  setCurrentRequest,
  clearError,
} = debitCardSlice.actions

export default debitCardSlice.reducer
