'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await fetch('/api/get-playlist', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include' // Include cookies for authentication
        })

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login')
            return
          }
          throw new Error('Failed to fetch playlists')
        }

        const data = await response.json()
        setPlaylists(data || [])
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchPlaylists()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Playlists</h1>
      
      {playlists.length === 0 ? (
        <div className="text-center text-gray-500">
          <p>You haven't created any playlists yet.</p>
          <button 
            onClick={() => router.push('/create-playlist')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Create Your First Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <div 
              key={playlist._id}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/playlist/${playlist._id}`)}
            >
              <h2 className="text-xl font-semibold mb-2">{playlist.name}</h2>
              <p className="text-gray-600 mb-4">
                {playlist.description || 'No description'}
              </p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{playlist.links?.length || 0} links</span>
                <span>{new Date(playlist.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <button
                  className="text-blue-600 hover:text-blue-800"
                >
                  View Playlist →
                </button>
                <span className={`text-sm ${playlist.isPublic ? 'text-green-600' : 'text-red-600'}`}>
                  {playlist.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
