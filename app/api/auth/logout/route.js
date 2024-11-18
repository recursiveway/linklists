import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// This API endpoint can be accessed at /logout
// Since this file is in app/(auth)/logout/route.js, Next.js will automatically
// create a route at /logout that handles GET requests
export async function GET() {
  // Delete the token cookie by setting it to expire in the past
  cookies().set('token', '', {
    expires: new Date(0), 
    path: '/'
  })

  return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 })
}
