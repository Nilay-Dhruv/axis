import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import outcomeService from '../services/outcomeService'
import type {
  OutcomesState,
  Outcome,
  Signal,
  OutcomeWithSignals,
  OutcomeSummary,
} from '../types/department'
import type { AxiosError } from 'axios'

// ─── Thunks ────────────────────────────────────────────────────────────────

export const fetchOutcomes = createAsyncThunk(
  'outcomes/fetchAll',
  async (departmentId: string | undefined, { rejectWithValue }) => {
    try {
      const data = await outcomeService.getAll(departmentId)
      return data.data.outcomes
    } catch (err) {
      const error = err as AxiosError<{ error: { message: string } }>
      return rejectWithValue(
        error.response?.data?.error?.message ?? 'Failed to load outcomes'
      )
    }
  }
)

export const fetchOutcomeById = createAsyncThunk(
  'outcomes/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await outcomeService.getById(id)
      return data.data
    } catch (err) {
      const error = err as AxiosError<{ error: { message: string } }>
      return rejectWithValue(
        error.response?.data?.error?.message ?? 'Failed to load outcome'
      )
    }
  }
)

export const fetchOutcomeSummary = createAsyncThunk(
  'outcomes/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const data = await outcomeService.getSummary()
      return data.data.summary
    } catch (err) {
      const error = err as AxiosError<{ error: { message: string } }>
      return rejectWithValue(
        error.response?.data?.error?.message ?? 'Failed to load summary'
      )
    }
  }
)

export const fetchAlerts = createAsyncThunk(
  'outcomes/fetchAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const data = await outcomeService.getAlerts()
      return data.data.alerts
    } catch (err) {
      const error = err as AxiosError<{ error: { message: string } }>
      return rejectWithValue(
        error.response?.data?.error?.message ?? 'Failed to load alerts'
      )
    }
  }
)

export const updateOutcome = createAsyncThunk(
  'outcomes/update',
  async (
    { id, data }: { id: string; data: Partial<Outcome> },
    { rejectWithValue }
  ) => {
    try {
      const result = await outcomeService.update(id, data)
      return result.data.outcome
    } catch (err) {
      const error = err as AxiosError<{ error: { message: string } }>
      return rejectWithValue(
        error.response?.data?.error?.message ?? 'Update failed'
      )
    }
  }
)

export const updateSignal = createAsyncThunk(
  'outcomes/updateSignal',
  async (
    {
      outcomeId,
      signalId,
      data,
    }: { outcomeId: string; signalId: string; data: Partial<Signal> },
    { rejectWithValue }
  ) => {
    try {
      const result = await outcomeService.updateSignal(outcomeId, signalId, data)
      return { signal: result.data.signal, outcomeId }
    } catch (err) {
      const error = err as AxiosError<{ error: { message: string } }>
      return rejectWithValue(
        error.response?.data?.error?.message ?? 'Signal update failed'
      )
    }
  }
)

// ─── Initial State ─────────────────────────────────────────────────────────

const initialState: OutcomesState = {
  list: [],
  selected: null,
  summary: null,
  alerts: [],
  loading: false,
  detailLoading: false,
  error: null,
  searchQuery: '',
  filterStatus: 'all',
  filterDept: 'all',
}

// ─── Slice ─────────────────────────────────────────────────────────────────

const outcomeSlice = createSlice({
  name: 'outcomes',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload
    },
    setFilterStatus(state, action: PayloadAction<string>) {
      state.filterStatus = action.payload
    },
    setFilterDept(state, action: PayloadAction<string>) {
      state.filterDept = action.payload
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
      .addCase(fetchOutcomes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOutcomes.fulfilled, (state, action: PayloadAction<Outcome[]>) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchOutcomes.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(fetchOutcomeById.pending, (state) => {
        state.detailLoading = true
      })
      .addCase(fetchOutcomeById.fulfilled, (state, action: PayloadAction<OutcomeWithSignals>) => {
        state.detailLoading = false
        state.selected = action.payload
      })
      .addCase(fetchOutcomeById.rejected, (state) => {
        state.detailLoading = false
      })

      .addCase(fetchOutcomeSummary.fulfilled, (state, action: PayloadAction<OutcomeSummary>) => {
        state.summary = action.payload
      })

      .addCase(fetchAlerts.fulfilled, (state, action: PayloadAction<Signal[]>) => {
        state.alerts = action.payload
      })

      .addCase(updateOutcome.fulfilled, (state, action: PayloadAction<Outcome>) => {
        const idx = state.list.findIndex((o) => o.id === action.payload.id)
        if (idx !== -1) state.list[idx] = action.payload
        if (state.selected?.outcome.id === action.payload.id) {
          state.selected.outcome = action.payload
        }
      })

      .addCase(updateSignal.fulfilled, (state, action) => {
        const { signal } = action.payload
        if (state.selected) {
          const idx = state.selected.signals.findIndex((s) => s.id === signal.id)
          if (idx !== -1) state.selected.signals[idx] = signal
        }
        // Update alerts list
        const alertIdx = state.alerts.findIndex((a) => a.id === signal.id)
        if (alertIdx !== -1) {
          if (signal.status === 'normal') {
            state.alerts.splice(alertIdx, 1)
          } else {
            state.alerts[alertIdx] = signal
          }
        }
      })
  },
})

export const {
  setSearchQuery,
  setFilterStatus,
  setFilterDept,
  clearSelected,
  clearError,
} = outcomeSlice.actions

export default outcomeSlice.reducer