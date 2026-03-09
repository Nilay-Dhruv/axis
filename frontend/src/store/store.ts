import { configureStore } from '@reduxjs/toolkit'
import authReducer       from './authSlice'
import departmentReducer from './departmentSlice'
import activityReducer   from './activitySlice'
import outcomeReducer    from './outcomeSlice'
import roleReducer       from './roleSlice'

export const store = configureStore({
  reducer: {
    auth:        authReducer,
    departments: departmentReducer,
    activities:  activityReducer,
    outcomes:    outcomeReducer,
    roles:       roleReducer,
  },
})

export type RootState   = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch