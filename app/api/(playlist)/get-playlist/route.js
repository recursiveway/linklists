import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import Playlist from "@/models/playlist";
import { cookies } from 'next/headers';
import jwt from "jsonwebtoken";

// Get all playlists for a user
export async function GET(request) {
  try {
    // Get token from cookies
    const cookieStore = cookies();
    const token = await cookieStore.get('token');

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
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

    // Get all playlists for user
    const playlists = await PlaylistModel.find({ creator: userId })
      .sort({ createdAt: -1 });

    return NextResponse.json(playlists);

  } catch (error) {
    console.error("Get playlists error:", error);
    
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

// Get paginated playlists
export async function POST(request) {
  try {
    const body = await request.json();
    const { page = 1 } = body;
    const limit = 25;
    const skip = (page - 1) * limit;

    // Connect to database
    const db = await dbConnect();
    const linklistDb = db.connection.useDb('linklists-v1');
    const PlaylistModel = linklistDb.model('Playlist', Playlist.schema);

    // Get paginated public playlists
    const playlists = await PlaylistModel.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await PlaylistModel.countDocuments({ isPublic: true });
    
    return NextResponse.json({
      playlists,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit
      }
    });

  } catch (error) {
    console.error("Get paginated playlists error:", error);
    return NextResponse.json(
      { error: "Failed to get playlists" },
      { status: 500 }
    );
  }
}
