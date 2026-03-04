import { useEffect, useRef } from 'react'
import type { CountryInfo } from '../data/countries'

interface CountryModalProps {
  country: CountryInfo | null
  isOpen: boolean
  onClose: () => void
}

export function CountryModal({ country, isOpen, onClose }: CountryModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (country) {
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [country, onClose])

  if (!isOpen || !country) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        ref={modalRef}
        className="relative bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-scale-in"
      >
        {/* Header */}
        <div className="bg-[var(--primary)] px-6 py-4">
          <h2 className="text-xl font-bold text-[var(--primary-foreground)]">
            {country.name}
          </h2>
          <p className="text-sm text-[var(--primary-foreground)]/80">
            {country.continent}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          <InfoRow label="Capitale" value={country.capital} />
          <InfoRow label="Popolazione" value={country.population} />
          <InfoRow label="Superficie" value={country.area} />
          <InfoRow label="Valuta" value={country.currency} />
          <InfoRow label="Lingua" value={country.language} />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
          aria-label="Chiudi"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-[var(--muted-foreground)]">{label}</span>
      <span className="text-sm font-medium text-[var(--foreground)]">{value}</span>
    </div>
  )
}
