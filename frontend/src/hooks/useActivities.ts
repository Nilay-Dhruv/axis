import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../store/store'
import {
  fetchActivities,
  fetchActivityById,
  executeActivity,
  fetchRecentLogs,
  setSearchQuery,
  setFilterDept,
  setFilterType,
  clearSelected,
  clearExecuteError,
} from '../store/activitySlice.ts'
import type { Activity } from '../types/department'

export function useActivities(autoLoad = true) {
  const dispatch = useDispatch<AppDispatch>()

  const list           = useSelector((s: RootState) => s.activities.list)
  const recentLogs     = useSelector((s: RootState) => s.activities.recentLogs)
  const selected       = useSelector((s: RootState) => s.activities.selected)
  const loading        = useSelector((s: RootState) => s.activities.loading)
  const executing      = useSelector((s: RootState) => s.activities.executing)
  const error          = useSelector((s: RootState) => s.activities.error)
  const executeError   = useSelector((s: RootState) => s.activities.executeError)
  const searchQuery    = useSelector((s: RootState) => s.activities.searchQuery)
  const filterDept     = useSelector((s: RootState) => s.activities.filterDept)
  const filterType     = useSelector((s: RootState) => s.activities.filterType)
  const departments    = useSelector((s: RootState) => s.departments.list)

  useEffect(() => {
    if (autoLoad && list.length === 0) {
      dispatch(fetchActivities(undefined))
      dispatch(fetchRecentLogs())
    }
  }, [autoLoad])

  const filteredList: Activity[] = list.filter((a: Activity) => {
    const matchSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.type.toLowerCase().includes(searchQuery.toLowerCase())
    const matchType = filterType === 'all' || a.type === filterType
    const matchDept = filterDept === 'all' || a.department_id === filterDept
    return matchSearch && matchType && matchDept
  })

  const grouped = filteredList.reduce<Record<string, Activity[]>>((acc, activity) => {
    const key = activity.department_id
    if (!acc[key]) acc[key] = []
    acc[key].push(activity)
    return acc
  }, {})

  const getDeptName = (deptId: string): string =>
    departments.find((d) => d.id === deptId)?.name ?? 'Unknown'

  const getDeptColor = (deptId: string): string =>
    departments.find((d) => d.id === deptId)?.config?.color ?? 'var(--cyan)'

  return {
    list,
    recentLogs,
    selected,
    loading,
    executing,
    error,
    executeError,
    searchQuery,
    filterDept,
    filterType,
    filteredList,
    grouped,
    departments,
    getDeptName,
    getDeptColor,
    load: (deptId?: string) => dispatch(fetchActivities(deptId)),
    loadById: (id: string) => dispatch(fetchActivityById(id)),
    execute: (id: string, notes?: string, data?: Record<string, unknown>) =>
      dispatch(executeActivity({ id, notes, data })),
    loadLogs: () => dispatch(fetchRecentLogs()),
    search: (q: string) => dispatch(setSearchQuery(q)),
    filterByDept: (id: string) => dispatch(setFilterDept(id)),
    filterByType: (t: string) => dispatch(setFilterType(t)),
    clearDetail: () => dispatch(clearSelected()),
    clearExecError: () => dispatch(clearExecuteError()),
    refetch: () => {
      dispatch(fetchActivities(undefined))
      dispatch(fetchRecentLogs())
    },
  }
}