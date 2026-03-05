interface Particle {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
  opacity: number
}

const particles: Particle[] = Array.from({ length: 35 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 5,
  duration: Math.random() * 4 + 6,
  opacity: Math.random() * 0.3 + 0.05,
}))

const orbs = Array.from({ length: 2 }, (_, i) => ({
  id: i,
  x: 25 + i * 35,
  y: 35 + i * 18,
  size: 280 + i * 120,
  delay: i * 2,
}))

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 80%, rgba(91, 192, 190, 0.03) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(58, 80, 107, 0.08) 0%, transparent 70%),
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
            background: `radial-gradient(circle, rgba(91, 192, 190, 0.03) 0%, transparent 70%)`,
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
            opacity: Math.min(particle.opacity, 0.35),
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
