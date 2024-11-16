'use client'
import React, { useState, useEffect } from 'react'

const generateInstagramEmbed = (url) => {
  const instagramUrl = new URL(url);
  const postId = instagramUrl.pathname.split('/')[2];

  const embedCode = `
  <blockquote class="instagram-media" 
    data-instgrm-permalink="${url}" 
    data-instgrm-version="14" 
    style="
      background: #FFF;
      border: 1px solid #DBDBDB;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      margin: 0;
      width: 400px;
      min-width: 326px;
    ">
    <a href="${url}" target="_blank" style="text-decoration: none; color: inherit;">
      <!-- Media Section -->
      <div style="
        background: #EFEFEF;
        width: 100%;
        padding-top: 100%;
        position: relative;
        border-radius: 8px;
        overflow: hidden;">
        <img src="https://via.placeholder.com/540" 
          alt="Instagram Post Media" 
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;">
      </div>
    </a>
  </blockquote>
  <script async src="//www.instagram.com/embed.js"></script>
`;

  return embedCode;
}

const generateYoutubeEmbed = (url) => {
  let videoId;
  if (url.includes('shorts')) {
    videoId = url.split('/shorts/')[1].split('?')[0];
  } else {
    const urlParams = new URLSearchParams(new URL(url).search);
    videoId = urlParams.get('v');
  }
  return `
  <iframe 
    width="400px" 
    height="100%" 
    style="
      aspect-ratio: 9 / 16;
      margin: 0;
      border: 0; 
      border-radius: 8px; 
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.19);
    " 
    src="https://www.youtube.com/embed/${videoId}" 
    title="YouTube Video Player" 
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen
  ></iframe>`;
}

const PlayList = () => {
  const [playlists, setPlaylists] = useState([]);
  const [currentUrls, setCurrentUrls] = useState(['']); // Array to hold multiple URL inputs
  const [activePlaylist, setActivePlaylist] = useState(null);

  useEffect(() => {
    const storedPlaylists = JSON.parse(localStorage.getItem('playlists') || '[]');
    setPlaylists(storedPlaylists);
  }, []);

  useEffect(() => {
    if (activePlaylist) {
      loadInstagramEmbed();
    }
  }, [activePlaylist]);

  const loadInstagramEmbed = () => {
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    } else {
      const script = document.createElement('script');
      script.src = '//www.instagram.com/embed.js';
      script.async = true;
      script.onload = () => {
        if (window.instgrm) {
          window.instgrm.Embeds.process();
        }
      };
      document.body.appendChild(script);
    }
  };

  const handleAddUrlInput = () => {
    setCurrentUrls([...currentUrls, '']);
  };

  const handleUrlChange = (index, value) => {
    const newUrls = [...currentUrls];
    newUrls[index] = value;
    setCurrentUrls(newUrls);
  };

  const handleRemoveUrl = (index) => {
    const newUrls = currentUrls.filter((_, i) => i !== index);
    setCurrentUrls(newUrls);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const playlistName = e.target.playlistName.value;
    
    if (playlistName.trim()) {
      const embedCodes = currentUrls
        .filter(url => url.trim())
        .map(url => {
          if (url.includes('youtube.com') || url.includes('youtu.be')) {
            return generateYoutubeEmbed(url);
          } else {
            return generateInstagramEmbed(url);
          }
        });

      const newPlaylist = {
        id: Date.now(),
        name: playlistName,
        posts: embedCodes,
        postCount: embedCodes.length
      };

      const updatedPlaylists = [...playlists, newPlaylist];
      setPlaylists(updatedPlaylists);
      localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));

      setCurrentUrls(['']);
      e.target.reset();
      
      // Load embeds after adding new playlist
      setTimeout(() => {
        loadInstagramEmbed();
      }, 100);
    }
  };

  const handleDeleteAll = () => {
    localStorage.removeItem('playlists');
    setPlaylists([]);
    setActivePlaylist(null);
    const embedScripts = document.querySelectorAll('script[src*="instagram.com/embed.js"]');
    embedScripts.forEach(script => script.remove());
  };

  const togglePlaylist = (playlistId) => {
    setActivePlaylist(activePlaylist === playlistId ? null : playlistId);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Create Playlist</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="playlistName"
            placeholder="Enter playlist name"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          
          {currentUrls.map((url, index) => (
            <div key={index} className="flex mt-4 gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => handleUrlChange(index, e.target.value)}
                placeholder="Enter Instagram or YouTube URL"
                className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {currentUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveUrl(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={handleAddUrlInput}
            className="w-full mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            Add Another URL
          </button>

          <button
            type="submit"
            className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Create Playlist
          </button>
          
          <button
            type="button"
            onClick={handleDeleteAll}
            className="w-full mt-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Delete All Playlists
          </button>

          <div className="mt-8">
            {playlists.map(playlist => (
              <div key={playlist.id} className="mb-6">
                <button
                  onClick={() => togglePlaylist(playlist.id)}
                  className="w-full p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
                >
                  <span className="text-xl font-semibold">{playlist.name}</span>
                  <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm">
                    {playlist.postCount} posts
                  </span>
                </button>
                
                {activePlaylist === playlist.id && playlist.posts && (
                  <div className="mt-0">
                    {playlist.posts.map((content, index) => (
                      <div key={index} className="mb-0" dangerouslySetInnerHTML={{ __html: content }} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlayList;