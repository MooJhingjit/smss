export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
      {status}
    </span>
  )
}
