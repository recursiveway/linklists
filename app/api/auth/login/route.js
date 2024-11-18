import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import User from "@/models/users";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    // Get request body
    const body = await request.json();
    const { login, password } = body; // login can be email or username

    // Validate required fields
    if (!login || !password) {
        
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await dbConnect();
    const linklistDb = db.connection.useDb('linklists-v1');
    const UserModel = linklistDb.model('User', User.schema);

    // Find user by email or username
    const user = await UserModel.findOne({
      $or: [
        { email: login.toLowerCase() },
        { username: login }
      ]
    });

    if (!user) {

      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log("Login route called", token);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    // Set token in HTTP-only cookie
    const response = NextResponse.json(
      { message: "Login successful", user: userResponse },
      { status: 200 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400 // 24 hours in seconds
    });

    return response;

  } catch (error) {
    console.log("Login error:", error);
    return NextResponse.json(
      { error: "Failed to login" },
      { status: 500 }
    );
  }
}
