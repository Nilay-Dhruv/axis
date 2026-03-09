import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import departmentReducer from './departmentSlice'
import activityReducer from './activitySlice.ts'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    departments: departmentReducer,
    activities: activityReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch