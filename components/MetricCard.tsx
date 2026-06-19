export function MetricCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <article className="card flat metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {note ? <small className="kicker">{note}</small> : null}
    </article>
  );
}
