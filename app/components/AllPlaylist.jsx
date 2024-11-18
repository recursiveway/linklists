'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AllPlaylist = () => {
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await fetch('/api/get-allPlaylist');
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch playlists');
        }
        const data = await response.json();
        setPlaylists(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  if (loading) {
    return <div>Loading playlists...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">All Playlists</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {playlists.map((playlist) => (
          <div 
            key={playlist._id} 
            className="border rounded-lg p-4 shadow-md hover:shadow-lg cursor-pointer transition-shadow"
            onClick={() => router.push(`/playlist/${playlist._id}`)}
          >
            <h2 className="text-xl font-semibold mb-2">{playlist.name}</h2>
            <p className="text-gray-600 mb-2">{playlist.description}</p>
            <div className="text-sm text-gray-500">
              <p>Created: {new Date(playlist.createdAt).toLocaleDateString()}</p>
              <p>Last updated: {new Date(playlist.updatedAt).toLocaleDateString()}</p>
              <p>Links: {playlist.links.length}</p>
              <p>{playlist.isPublic ? 'Public' : 'Private'} playlist</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllPlaylist;
