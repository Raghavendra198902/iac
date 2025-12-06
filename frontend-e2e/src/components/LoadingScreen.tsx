export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center gradient-primary">
      <div className="text-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-white text-lg font-medium animate-pulse">
          Loading IAC Platform...
        </p>
      </div>
    </div>
  )
}
