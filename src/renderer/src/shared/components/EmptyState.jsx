export function EmptyState({ title, body }) {
  return (
    <div className="emptyState">
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  )
}
