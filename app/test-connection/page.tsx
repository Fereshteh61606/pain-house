import { createClient } from "@/lib/supabase/server"

export default async function TestConnectionPage() {
  const supabase = await createClient()
  
  let connectionStatus = "❌ Not Connected"
  let tablesExist = false
  let roomCount = 0
  let error = null

  try {
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from("rooms")
      .select("count")
      .limit(1)

    if (testError) {
      error = testError.message
      if (testError.message.includes("relation") || testError.message.includes("does not exist")) {
        connectionStatus = "✅ Connected (but tables don't exist)"
      }
    } else {
      connectionStatus = "✅ Connected"
      tablesExist = true
      
      // Count rooms
      const { data: rooms, error: roomError } = await supabase
        .from("rooms")
        .select("*")
      
      if (!roomError && rooms) {
        roomCount = rooms.length
      }
    }
  } catch (e: any) {
    error = e.message
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border-2 border-purple-200 dark:border-purple-700">
          <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
            🔍 Connection Test
          </h1>

          <div className="space-y-6">
            {/* Connection Status */}
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-700">
              <h2 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-100">
                Supabase Connection
              </h2>
              <p className="text-2xl font-mono">{connectionStatus}</p>
            </div>

            {/* Tables Status */}
            <div className="bg-pink-50 dark:bg-pink-900/30 rounded-2xl p-6 border-2 border-pink-200 dark:border-pink-700">
              <h2 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-100">
                Database Tables
              </h2>
              <p className="text-2xl font-mono">
                {tablesExist ? "✅ Tables Exist" : "❌ Tables Don't Exist"}
              </p>
            </div>

            {/* Room Count */}
            <div className="bg-rose-50 dark:bg-rose-900/30 rounded-2xl p-6 border-2 border-rose-200 dark:border-rose-700">
              <h2 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-100">
                Rooms in Database
              </h2>
              <p className="text-2xl font-mono">
                {roomCount} rooms
              </p>
            </div>

            {/* Error Details */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 rounded-2xl p-6 border-2 border-red-200 dark:border-red-700">
                <h2 className="text-xl font-bold mb-3 text-red-800 dark:text-red-200">
                  Error Details
                </h2>
                <p className="text-sm font-mono text-red-700 dark:text-red-300 break-all">
                  {error}
                </p>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-rose-100 dark:from-purple-900/40 dark:via-pink-900/40 dark:to-rose-900/40 rounded-2xl p-6 border-2 border-purple-300 dark:border-purple-600">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                📋 What To Do Next
              </h2>
              
              {!tablesExist ? (
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                  <p className="font-semibold text-lg">⚠️ Tables don't exist yet!</p>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Open Supabase Dashboard → SQL Editor</li>
                    <li>Run <code className="bg-purple-200 dark:bg-purple-800 px-2 py-1 rounded">scripts/001_create_schema.sql</code></li>
                    <li>Run <code className="bg-purple-200 dark:bg-purple-800 px-2 py-1 rounded">scripts/002_seed_default_rooms.sql</code></li>
                    <li>Run <code className="bg-purple-200 dark:bg-purple-800 px-2 py-1 rounded">scripts/003_enable_realtime.sql</code></li>
                    <li>Refresh this page</li>
                  </ol>
                  <p className="mt-4 text-sm">
                    📖 See <strong>SETUP_NOW.md</strong> for detailed instructions
                  </p>
                </div>
              ) : roomCount === 0 ? (
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                  <p className="font-semibold text-lg">⚠️ No rooms found!</p>
                  <p>Run <code className="bg-purple-200 dark:bg-purple-800 px-2 py-1 rounded">scripts/002_seed_default_rooms.sql</code> to add default rooms.</p>
                </div>
              ) : (
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                  <p className="font-semibold text-lg text-green-700 dark:text-green-300">
                    ✅ Everything looks good!
                  </p>
                  <p>Your database is set up correctly with {roomCount} rooms.</p>
                  <a 
                    href="/" 
                    className="inline-block mt-4 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Go to Home Page →
                  </a>
                </div>
              )}
            </div>

            {/* Environment Check */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-100">
                🔐 Environment Variables
              </h2>
              <div className="space-y-2 text-sm font-mono">
                <p>
                  SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 
                    <span className="text-green-600 dark:text-green-400">✅ Set</span> : 
                    <span className="text-red-600 dark:text-red-400">❌ Missing</span>
                  }
                </p>
                <p>
                  SUPABASE_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
                    <span className="text-green-600 dark:text-green-400">✅ Set</span> : 
                    <span className="text-red-600 dark:text-red-400">❌ Missing</span>
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a 
              href="/"
              className="text-purple-600 dark:text-purple-400 hover:underline font-semibold"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
