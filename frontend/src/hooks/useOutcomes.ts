import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../store/store'
import {
  fetchOutcomes,
  fetchOutcomeById,
  fetchOutcomeSummary,
  fetchAlerts,
  updateOutcome,
  updateSignal,
  setSearchQuery,
  setFilterStatus,
  setFilterDept,
  clearSelected,
} from '../store/outcomeSlice'
import type { Outcome, Signal } from '../types/department'

export function useOutcomes(autoLoad = true) {
  const dispatch = useDispatch<AppDispatch>()

  const list          = useSelector((s: RootState) => s.outcomes.list)
  const selected      = useSelector((s: RootState) => s.outcomes.selected)
  const summary       = useSelector((s: RootState) => s.outcomes.summary)
  const alerts        = useSelector((s: RootState) => s.outcomes.alerts)
  const loading       = useSelector((s: RootState) => s.outcomes.loading)
  const detailLoading = useSelector((s: RootState) => s.outcomes.detailLoading)
  const error         = useSelector((s: RootState) => s.outcomes.error)
  const searchQuery   = useSelector((s: RootState) => s.outcomes.searchQuery)
  const filterStatus  = useSelector((s: RootState) => s.outcomes.filterStatus)
  const filterDept    = useSelector((s: RootState) => s.outcomes.filterDept)
  const departments   = useSelector((s: RootState) => s.departments.list)

  useEffect(() => {
    if (autoLoad && list.length === 0) {
      dispatch(fetchOutcomes(undefined))
      dispatch(fetchOutcomeSummary())
      dispatch(fetchAlerts())
    }
  }, [autoLoad])

  const filteredList: Outcome[] = list.filter((o: Outcome) => {
    const matchSearch = o.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = filterStatus === 'all' || o.status === filterStatus
    const matchDept   = filterDept === 'all' || o.department_id === filterDept
    return matchSearch && matchStatus && matchDept
  })

  const grouped = filteredList.reduce<Record<string, Outcome[]>>((acc, o) => {
    if (!acc[o.department_id]) acc[o.department_id] = []
    acc[o.department_id].push(o)
    return acc
  }, {})

  const getDeptName = (id: string) =>
    departments.find((d) => d.id === id)?.name ?? 'Unknown'

  const getDeptColor = (id: string) =>
    departments.find((d) => d.id === id)?.config?.color ?? 'var(--cyan)'

  const getProgress = (outcome: Outcome): number => {
    if (!outcome.target_value || !outcome.current_value) return 0
    return Math.min((outcome.current_value / outcome.target_value) * 100, 100)
  }

  return {
    list,
    filteredList,
    grouped,
    selected,
    summary,
    alerts,
    loading,
    detailLoading,
    error,
    searchQuery,
    filterStatus,
    filterDept,
    departments,
    getDeptName,
    getDeptColor,
    getProgress,
    load: (deptId?: string) => dispatch(fetchOutcomes(deptId)),
    loadById: (id: string) => dispatch(fetchOutcomeById(id)),
    loadSummary: () => dispatch(fetchOutcomeSummary()),
    loadAlerts: () => dispatch(fetchAlerts()),
    update: (id: string, data: Partial<Outcome>) =>
      dispatch(updateOutcome({ id, data })),
    patchSignal: (outcomeId: string, signalId: string, data: Partial<Signal>) =>
      dispatch(updateSignal({ outcomeId, signalId, data })),
    clearDetail: () => dispatch(clearSelected()),
    search: (q: string) => dispatch(setSearchQuery(q)),
    filterByStatus: (s: string) => dispatch(setFilterStatus(s)),
    filterByDept: (id: string) => dispatch(setFilterDept(id)),
    refetch: () => {
      dispatch(fetchOutcomes(undefined))
      dispatch(fetchOutcomeSummary())
      dispatch(fetchAlerts())
    },
  }
}