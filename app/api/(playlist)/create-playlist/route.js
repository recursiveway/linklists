import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import Playlist from "@/models/playlist";
import { cookies } from 'next/headers';
import jwt from "jsonwebtoken";

// Create new playlist
export async function POST(request) {
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

    // Get request body
    const body = await request.json();

    const { name, description, isPublic = true, posts } = body;

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

// Add URLs to playlist
export async function PUT(request) {
  try {
    const cookieStore = cookies();
    const token = await cookieStore.get('token');

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const body = await request.json();
    const { playlistId, urls } = body;

    if (!playlistId || !urls || !Array.isArray(urls)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    const db = await dbConnect();
    const linklistDb = db.connection.useDb('linklists-v1');
    const PlaylistModel = linklistDb.model('Playlist', Playlist.schema);

    const playlist = await PlaylistModel.findOne({ _id: playlistId, creator: userId });
    
    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist not found or unauthorized" },
        { status: 404 }
      );
    }

    playlist.links.push(...urls);
    await playlist.save();

    return NextResponse.json(
      { message: "URLs added successfully", playlist },
      { status: 200 }
    );

  } catch (error) {
    console.error("Add URLs error:", error);
    return NextResponse.json(
      { error: "Failed to add URLs" },
      { status: 500 }
    );
  }
}

// Remove URLs from playlist
export async function DELETE(request) {
  try {
    const cookieStore = cookies();
    const token = await cookieStore.get('token');

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const body = await request.json();
    const { playlistId, urls } = body;

    if (!playlistId || !urls || !Array.isArray(urls)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    const db = await dbConnect();
    const linklistDb = db.connection.useDb('linklists-v1');
    const PlaylistModel = linklistDb.model('Playlist', Playlist.schema);

    const playlist = await PlaylistModel.findOne({ _id: playlistId, creator: userId });
    
    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist not found or unauthorized" },
        { status: 404 }
      );
    }

    playlist.links = playlist.links.filter(link => !urls.includes(link));
    await playlist.save();

    return NextResponse.json(
      { message: "URLs removed successfully", playlist },
      { status: 200 }
    );

  } catch (error) {
    console.error("Remove URLs error:", error);
    return NextResponse.json(
      { error: "Failed to remove URLs" },
      { status: 500 }
    );
  }
}
