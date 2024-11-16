'use client'
import React from 'react'
import PlayList from './PlayLIst'
import { signIn, useSession } from 'next-auth/react'



const LandingPage = () => {
const {data}=useSession()
console.log("data",data)

  return (
 <>
    {data ? (<PlayList/>) : (<>
        <button onClick={()=>signIn('google')}>SIgn in with google</button>
        
        </>)}
    
 </>
  )
}

export default LandingPage