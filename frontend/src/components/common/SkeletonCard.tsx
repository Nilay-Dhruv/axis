import type { ReactElement } from 'react'

export default function SkeletonCard(): ReactElement {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: 20,
        overflow: 'hidden',
      }}
    >
      {/* Icon skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 8,
            background: 'var(--border)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            width: 60,
            height: 18,
            borderRadius: 3,
            background: 'var(--border)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      </div>

      {/* Title skeleton */}
      <div
        style={{
          height: 18,
          width: '70%',
          background: 'var(--border)',
          borderRadius: 4,
          marginBottom: 8,
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
      <div
        style={{
          height: 10,
          width: '40%',
          background: 'var(--border)',
          borderRadius: 4,
          marginBottom: 12,
          animation: 'pulse 1.5s ease-in-out infinite 0.1s',
        }}
      />

      {/* Description lines */}
      <div
        style={{
          height: 10,
          width: '100%',
          background: 'var(--border)',
          borderRadius: 4,
          marginBottom: 6,
          animation: 'pulse 1.5s ease-in-out infinite 0.2s',
        }}
      />
      <div
        style={{
          height: 10,
          width: '80%',
          background: 'var(--border)',
          borderRadius: 4,
          marginBottom: 14,
          animation: 'pulse 1.5s ease-in-out infinite 0.3s',
        }}
      />

      {/* Footer skeleton */}
      <div
        style={{
          paddingTop: 12,
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            height: 10,
            width: '40%',
            background: 'var(--border)',
            borderRadius: 4,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            height: 10,
            width: '20%',
            background: 'var(--border)',
            borderRadius: 4,
            animation: 'pulse 1.5s ease-in-out infinite 0.1s',
          }}
        />
      </div>
    </div>
  )
}