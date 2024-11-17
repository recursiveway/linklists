'use client'
import React, { useEffect, useState } from 'react'
import PlayList from './PlayLIst'
import { signIn, useSession } from 'next-auth/react'

const LandingPage = () => {
  const session = useSession()
  
 console.log("session", session)


  return (
    <>
      {session ? (<PlayList />) : (<>
        <button onClick={() => signIn()}>Sign in with google</button>
      </>)}
    </>
  )
}

export default LandingPage