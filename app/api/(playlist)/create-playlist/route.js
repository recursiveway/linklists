import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import Playlist from "@/models/playlist";
import { cookies } from 'next/headers';
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    // Get token from cookies
    const cookieStore = cookies();
    const token =await cookieStore.get('token');

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    // Verify token and get userId
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Get request body
    const body = await request.json();
    console.log("Creating playlist",body);

    const { name, description, isPublic = true,posts } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Playlist name is required" },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await dbConnect();
    const linklistDb = db.connection.useDb('linklists-v1');
    const PlaylistModel = linklistDb.model('Playlist', Playlist.schema);

    // Create new playlist
    const playlist = await PlaylistModel.create({
      name,
      description,
      creator: userId,
      isPublic,
      links: posts
    });

    return NextResponse.json(
      { message: "Playlist created successfully", playlist },
      { status: 201 }
    );

  } catch (error) {
    console.error("Create playlist error:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create playlist" },
      { status: 500 }
    );
  }
}
