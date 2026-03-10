import { useLocation } from 'react-router-dom'
import { useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react'

interface Props { children: ReactNode }

export default function PageTransition({ children }: Props): ReactElement {
  const location  = useLocation()
  const [display, setDisplay] = useState(children)
  const [visible, setVisible] = useState(true)
  const prevKey   = useRef(location.key)

  useEffect(() => {
    if (location.key === prevKey.current) return
    prevKey.current = location.key

    // Fade out → swap content → fade in
    setVisible(false)
    const t = setTimeout(() => {
      setDisplay(children)
      setVisible(true)
    }, 120)
    return () => clearTimeout(t)
  }, [location.key, children])

  return (
    <div
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 0.18s ease, transform 0.18s ease',
        willChange: 'opacity, transform',
        minHeight:  '100%',
      }}
    >
      {display}
    </div>
  )
}