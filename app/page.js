
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import PlayList from './components/PlayLIst';
import AllPlaylist from './components/AllPlaylist';

async function checkAuth() {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
  
  if (!token) {
    redirect('/register');
  }
}

export default async function Home() {
  await checkAuth();
  
  return (
    <AllPlaylist/>
  );
}
