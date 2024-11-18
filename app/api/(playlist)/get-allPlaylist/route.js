import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import Playlist from "@/models/playlist";
import { cookies } from 'next/headers';
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    // Get token from cookies
    const cookieStore = cookies();
    const token = await cookieStore.get('token');

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - Please login to view playlists" },
        { status: 401 }
      );
    }

    // Verify token and get userId
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Connect to database
    const db = await dbConnect();
    const linklistDb = db.connection.useDb('linklists-v1');
    const PlaylistModel = linklistDb.model('Playlist', Playlist.schema);

    // Get all playlists that are either public or created by the user
    const playlists = await PlaylistModel.find({
      $or: [
        { isPublic: true },
        { creator: userId }
      ]
    }).sort({ updatedAt: -1 }); // Sort by most recently updated

    return NextResponse.json(playlists);

  } catch (error) {
    console.error("Get all playlists error:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to get playlists" },
      { status: 500 }
    );
  }
}
