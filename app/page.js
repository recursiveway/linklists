import Image from "next/image";
import PlayLIst from "./components/PlayLIst";
import LandingPage from "./components/LandingPage";

export default function Home() {
  console.log(process.env.Google_ID)
  return (
  <LandingPage/>
  );
}
