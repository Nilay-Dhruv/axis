import { type ReactElement } from 'react'

interface Props {
  width?:        string | number
  height?:       number
  borderRadius?: number
  style?:        React.CSSProperties
}

export default function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: Props): ReactElement {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'var(--neu-bg)',
        boxShadow: 'var(--neu-shadow-in)',
        animation: 'pulse 1.4s ease-in-out infinite',
        ...style,
      }}
    />
  )
}