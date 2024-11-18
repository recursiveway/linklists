import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import Playlist from "@/models/playlist";
import { cookies } from 'next/headers';
import jwt from "jsonwebtoken";

// This API will be accessible at: /api/get-playlist/{playlistId}
// Example: /api/get-playlist/507f1f77bcf86cd799439011
export async function GET(request, { params }) {
  try {
    const { playlistId } = params;

    // Connect to database
    const db = await dbConnect();
    const linklistDb = db.connection.useDb('linklists-v1');
    const PlaylistModel = linklistDb.model('Playlist', Playlist.schema);

    // Get playlist
    const playlist = await PlaylistModel.findById(playlistId);

    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    // If playlist is private, verify user has access
    if (!playlist.isPublic) {
      // Get token from cookies
      const cookieStore = cookies();
      const token = await cookieStore.get('token');

      if (!token) {
        return NextResponse.json(
          { error: "Unauthorized - Please login to view private playlist" },
          { status: 401 }
        );
      }

      // Verify token and get userId
      const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
      const userId = decoded.userId;

      // Check if user is the creator
      if (playlist.creator.toString() !== userId) {
        return NextResponse.json(
          { error: "Unauthorized - You don't have access to this playlist" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(playlist);

  } catch (error) {
    console.error("Get playlist error:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to get playlist" },
      { status: 500 }
    );
  }
}

