export default function StatusBadge({ status, isWarning, isSuccess }: { status: string, isWarning?: boolean, isSuccess?: boolean}) {

  if (isWarning) {
    return (
      <span className="whitespace-nowrap inline-flex items-center rounded-md bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
        {status}
      </span>
    )
  }

  if (isSuccess) {
    return (
      <span className="whitespace-nowrap inline-flex items-center rounded-md bg-green-100 px-2 py-0.5 text-xs text-green-700">
        {status}
      </span>
    )
  }

  return (
    <span className="whitespace-nowrap inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
      {status}
    </span>
  )
}
