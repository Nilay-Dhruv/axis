import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../store/store'
import {
  fetchDepartments,
  fetchDepartmentById,
  setSearchQuery,
  setFilterType,
  clearSelected,
} from '../store/departmentSlice'
import type { Department } from '../types/department'

export function useDepartments() {
  const dispatch = useDispatch<AppDispatch>()
  const { list, selected, loading, detailLoading, error, searchQuery, filterType } =
    useSelector((state: RootState) => state.departments)

  useEffect(() => {
    if (list.length === 0) {
      dispatch(fetchDepartments())
    }
  }, [])

  const loadDepartment = (id: string) => {
    dispatch(fetchDepartmentById(id))
  }

  const search = (query: string) => {
    dispatch(setSearchQuery(query))
  }

  const filter = (type: string) => {
    dispatch(setFilterType(type))
  }

  const clearDetail = () => {
    dispatch(clearSelected())
  }

  const filteredList: Department[] = list.filter((dept) => {
    const matchesSearch =
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.type.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterType === 'all' || dept.type === filterType
    return matchesSearch && matchesFilter
  })

  return {
    departments: filteredList,
    allDepartments: list,
    selected,
    loading,
    detailLoading,
    error,
    searchQuery,
    filterType,
    loadDepartment,
    search,
    filter,
    clearDetail,
    refetch: () => dispatch(fetchDepartments()),
  }
}