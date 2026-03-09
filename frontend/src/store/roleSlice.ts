import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import roleService from '../services/roleService'
import type { RolesState, Role, PermissionMatrix } from '../types/department'
import type { AxiosError } from 'axios'

export const fetchRoles = createAsyncThunk(
  'roles/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const d = await roleService.getAll()
      return d.data.roles
    } catch (err) {
      const e = err as AxiosError<{ error: { message: string } }>
      return rejectWithValue(e.response?.data?.error?.message ?? 'Failed to load roles')
    }
  }
)

export const fetchPermissionMatrix = createAsyncThunk(
  'roles/fetchMatrix',
  async (_, { rejectWithValue }) => {
    try {
      const d = await roleService.getPermissions()
      return d.data.matrix
    } catch (err) {
      const e = err as AxiosError<{ error: { message: string } }>
      return rejectWithValue(e.response?.data?.error?.message ?? 'Failed to load matrix')
    }
  }
)

export const fetchMyPermissions = createAsyncThunk(
  'roles/fetchMyPermissions',
  async (_, { rejectWithValue }) => {
    try {
      const d = await roleService.getMyPermissions()
      return d.data.permissions
    } catch (err) {
      const e = err as AxiosError<{ error: { message: string } }>
      return rejectWithValue(e.response?.data?.error?.message ?? 'Failed')
    }
  }
)

const initialState: RolesState = {
  list:             [],
  selected:         null,
  permissionMatrix: {},
  myPermissions:    [],
  loading:          false,
  error:            null,
}

const roleSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    clearError(state) { state.error = null },
    clearSelected(state) { state.selected = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending,    (state) => { state.loading = true;  state.error = null })
      .addCase(fetchRoles.fulfilled,  (state, action: PayloadAction<Role[]>) => { state.loading = false; state.list = action.payload })
      .addCase(fetchRoles.rejected,   (state, action) => { state.loading = false; state.error = action.payload as string })
      .addCase(fetchPermissionMatrix.fulfilled, (state, action: PayloadAction<PermissionMatrix>) => { state.permissionMatrix = action.payload })
      .addCase(fetchMyPermissions.fulfilled,    (state, action: PayloadAction<string[]>)         => { state.myPermissions = action.payload })
  },
})

export const { clearError, clearSelected } = roleSlice.actions
export default roleSlice.reducer