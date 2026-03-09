import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import departmentService from '../services/departmentService'
import type { DepartmentsState, Department, DepartmentDetail } from '../types/department'
import type { AxiosError } from 'axios'

// ─── Thunks ────────────────────────────────────────────────────────────────

export const fetchDepartments = createAsyncThunk(
  'departments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const data = await departmentService.getAll()
      return data.data.departments
    } catch (err) {
      const error = err as AxiosError<{ error: { message: string } }>
      return rejectWithValue(error.response?.data?.error?.message ?? 'Failed to load departments')
    }
  }
)

export const fetchDepartmentById = createAsyncThunk(
  'departments/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await departmentService.getById(id)
      return data.data
    } catch (err) {
      const error = err as AxiosError<{ error: { message: string } }>
      return rejectWithValue(error.response?.data?.error?.message ?? 'Failed to load department')
    }
  }
)

// ─── Initial State ─────────────────────────────────────────────────────────

const initialState: DepartmentsState = {
  list: [],
  selected: null,
  loading: false,
  detailLoading: false,
  error: null,
  searchQuery: '',
  filterType: 'all',
}

// ─── Slice ─────────────────────────────────────────────────────────────────

const departmentSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload
    },
    setFilterType(state, action: PayloadAction<string>) {
      state.filterType = action.payload
    },
    clearSelected(state) {
      state.selected = null
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDepartments.fulfilled, (state, action: PayloadAction<Department[]>) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(fetchDepartmentById.pending, (state) => {
        state.detailLoading = true
      })
      .addCase(fetchDepartmentById.fulfilled, (state, action: PayloadAction<DepartmentDetail>) => {
        state.detailLoading = false
        state.selected = action.payload
      })
      .addCase(fetchDepartmentById.rejected, (state, action) => {
        state.detailLoading = false
        state.error = action.payload as string
      })
  },
})

export const { setSearchQuery, setFilterType, clearSelected, clearError } =
  departmentSlice.actions
export default departmentSlice.reducer