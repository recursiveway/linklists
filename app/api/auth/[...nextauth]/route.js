import jwt from "jsonwebtoken"
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { NextResponse } from "next/server"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.Google_ID,
      clientSecret: process.env.Google_Secret,
    }),
  ],
}

const handler = NextAuth(authOptions)

export const GET = handler
export const POST = handler