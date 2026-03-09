import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import activityService from '../services/activityService'
import type {
  ActivitiesState,
  Activity,
  ActivityDetail,
  ActivityLog,
} from '../types/department'
import type { AxiosError } from 'axios'

// ─── Thunks ────────────────────────────────────────────────────────────────

export const fetchActivities = createAsyncThunk(
  'activities/fetchAll',
  async (departmentId: string | undefined, { rejectWithValue }) => {
    try {
      const data = await activityService.getAll(departmentId)
      return data.data.activities
    } catch (err) {
      const error = err as AxiosError<{ error: { message: string } }>
      return rejectWithValue(
        error.response?.data?.error?.message ?? 'Failed to load activities'
      )
    }
  }
)

export const fetchActivityById = createAsyncThunk(
  'activities/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await activityService.getById(id)
      return data.data
    } catch (err) {
      const error = err as AxiosError<{ error: { message: string } }>
      return rejectWithValue(
        error.response?.data?.error?.message ?? 'Failed to load activity'
      )
    }
  }
)

export const executeActivity = createAsyncThunk(
  'activities/execute',
  async (
    { id, notes, data }: { id: string; notes?: string; data?: Record<string, unknown> },
    { rejectWithValue }
  ) => {
    try {
      const result = await activityService.execute(id, notes, data)
      return result.data
    } catch (err) {
      const error = err as AxiosError<{ error: { message: string; code: string } }>
      return rejectWithValue(
        error.response?.data?.error?.message ?? 'Execution failed'
      )
    }
  }
)

export const fetchRecentLogs = createAsyncThunk(
  'activities/fetchRecentLogs',
  async (_, { rejectWithValue }) => {
    try {
      const data = await activityService.getRecentLogs(10)
      return data.data.logs
    } catch (err) {
      const error = err as AxiosError<{ error: { message: string } }>
      return rejectWithValue(
        error.response?.data?.error?.message ?? 'Failed to load logs'
      )
    }
  }
)

// ─── Initial State ─────────────────────────────────────────────────────────

const initialState: ActivitiesState = {
  list: [],
  recentLogs: [],
  selected: null,
  loading: false,
  executing: false,
  error: null,
  executeError: null,
  searchQuery: '',
  filterDept: 'all',
  filterType: 'all',
}

// ─── Slice ─────────────────────────────────────────────────────────────────

const activitySlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload
    },
    setFilterDept(state, action: PayloadAction<string>) {
      state.filterDept = action.payload
    },
    setFilterType(state, action: PayloadAction<string>) {
      state.filterType = action.payload
    },
    clearSelected(state) {
      state.selected = null
    },
    clearExecuteError(state) {
      state.executeError = null
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivities.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchActivities.fulfilled, (state, action: PayloadAction<Activity[]>) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(fetchActivityById.fulfilled, (state, action: PayloadAction<ActivityDetail>) => {
        state.selected = action.payload
      })

      .addCase(executeActivity.pending, (state) => {
        state.executing = true
        state.executeError = null
      })
      .addCase(executeActivity.fulfilled, (state, action) => {
        state.executing = false
        const payload = action.payload as { log: ActivityLog; activity: Activity }
        if (
          state.selected &&
          state.selected.activity.id === payload.activity.id
        ) {
          state.selected.logs = [payload.log, ...state.selected.logs]
          state.selected.log_count += 1
        }
        state.recentLogs = [payload.log, ...state.recentLogs.slice(0, 9)]
      })
      .addCase(executeActivity.rejected, (state, action) => {
        state.executing = false
        state.executeError = action.payload as string
      })

      .addCase(fetchRecentLogs.fulfilled, (state, action: PayloadAction<ActivityLog[]>) => {
        state.recentLogs = action.payload
      })
  },
})

export const {
  setSearchQuery,
  setFilterDept,
  setFilterType,
  clearSelected,
  clearExecuteError,
  clearError,
} = activitySlice.actions

export default activitySlice.reducer