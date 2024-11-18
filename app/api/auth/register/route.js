import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import User from "@/models/users";
import bcrypt from "bcryptjs";
export async function POST(request) {
  try {
    // Get request body
    const body = await request.json();
    const { name, username, email, password } = body;

    // Validate required fields
    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 } 
      );
    }

    // Connect to database
    const db = await dbConnect();
    const linklistDb = db.connection.useDb('linklists-v1');
    const UserModel = linklistDb.model('User', User.schema);

    // Check if email already exists
    const existingEmail = await UserModel.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    // Check if username already exists
    const existingUsername = await UserModel.findOne({ username });
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await UserModel.create({
      name,
      username,
      email,
      password: hashedPassword
    });

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return NextResponse.json(
      { message: "User registered successfully", user: userResponse },
      { status: 201 }
    );

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}
