import { useMemo } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
  opacity: number
}

export function AnimatedBackground() {
  // Generate random particles
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 4 + 6,
      opacity: Math.random() * 0.5 + 0.1,
    }))
  }, [])

  // Generate gradient orbs
  const orbs = useMemo(() => {
    return Array.from({ length: 3 }, (_, i) => ({
      id: i,
      x: 20 + i * 30,
      y: 30 + i * 20,
      size: 300 + i * 100,
      delay: i * 2,
    }))
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 80%, rgba(91, 192, 190, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(111, 255, 233, 0.05) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(58, 80, 107, 0.1) 0%, transparent 70%),
            linear-gradient(180deg, #0b132b 0%, #1c2541 100%)
          `
        }}
      />

      {/* Floating orbs */}
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className="absolute rounded-full animate-drift"
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, rgba(91, 192, 190, 0.08) 0%, transparent 70%)`,
            animationDelay: `${orb.delay}s`,
            filter: 'blur(40px)',
          }}
        />
      ))}

      {/* Star particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-twinkle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.id % 3 === 0 ? '#6fffe9' : particle.id % 3 === 1 ? '#5bc0be' : '#8ba5b5',
            opacity: particle.opacity,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}

      {/* Subtle grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(91, 192, 190, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(91, 192, 190, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Vignette effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 0%, rgba(11, 19, 43, 0.4) 100%)`
        }}
      />
    </div>
  )
}
