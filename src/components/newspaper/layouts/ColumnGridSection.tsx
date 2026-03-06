import type { ColumnItem } from '../../../types/newspaper'

interface ColumnGridSectionProps {
  columns: ColumnItem[]
}

export function ColumnGridSection({ columns }: ColumnGridSectionProps) {
  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${Math.min(columns.length, 3)}, minmax(0, 1fr))` }}
    >
      {columns.map((column, index) => (
        <div
          key={column.title}
          className="flex flex-col"
        >
          {index > 0 && (
            <div className="border-l border-[var(--hud-border)] pl-3 h-full">
              <ColumnContent column={column} />
            </div>
          )}
          {index === 0 && <ColumnContent column={column} />}
        </div>
      ))}
    </div>
  )
}

function ColumnContent({ column }: { column: ColumnItem }) {
  return (
    <>
      {column.tag && (
        <span className="inline-block bg-[var(--tropical-teal)]/15 text-[var(--tropical-teal)] text-[0.55rem] px-1.5 py-0.5 rounded uppercase tracking-wider font-mono w-fit">
          {column.tag}
        </span>
      )}
      <h3 className="text-[var(--foreground)] font-bold text-[0.85rem] mt-1 leading-snug">
        {column.title}
      </h3>
      <p className="text-[var(--muted-foreground)] text-[0.7rem] mt-1.5 leading-relaxed line-clamp-4">
        {column.body}
      </p>
    </>
  )
}
