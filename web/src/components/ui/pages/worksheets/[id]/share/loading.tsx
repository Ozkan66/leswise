export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </header>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="h-64 bg-white rounded-lg border animate-pulse"></div>
        <div className="h-32 bg-white rounded-lg border animate-pulse"></div>
        <div className="h-48 bg-white rounded-lg border animate-pulse"></div>
      </div>
    </div>
  )
}
