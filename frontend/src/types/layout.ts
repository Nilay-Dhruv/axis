export interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export interface HeaderProps {
  onMenuToggle: () => void
  isSidebarOpen: boolean
}

export interface BreadcrumbItem {
  label: string
  path?: string
}