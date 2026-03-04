import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface SentimentGaugeProps {
  score: number // -1 to 1
  sentiment: 'positive' | 'negative' | 'neutral'
}

export function SentimentGauge({ score, sentiment }: SentimentGaugeProps) {
  // Converti score da [-1, 1] a [0, 100]
  const normalizedScore = Math.round((score + 1) * 50)
  
  // Dati per il gauge semicircolare
  const data = [
    { name: 'score', value: normalizedScore },
    { name: 'remaining', value: 100 - normalizedScore },
  ]

  const colors = {
    positive: '#10b981',
    negative: '#ef4444',
    neutral: '#f59e0b',
  }

  const color = colors[sentiment]
  const bgColor = 'rgba(255,255,255,0.1)'

  const sentimentLabel = {
    positive: 'Positivo',
    negative: 'Negativo',
    neutral: 'Neutro',
  }[sentiment]

  return (
    <div className="relative w-64 h-40">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={70}
            outerRadius={90}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={color} />
            <Cell fill={bgColor} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center text */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center pb-2">
        <p 
          className="text-3xl font-bold"
          style={{ color }}
        >
          {score >= 0 ? '+' : ''}{score.toFixed(2)}
        </p>
        <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wide">
          {sentimentLabel}
        </p>
      </div>

      {/* Scale labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-[var(--muted-foreground)]">
        <span>-1.0</span>
        <span>+1.0</span>
      </div>
    </div>
  )
}
