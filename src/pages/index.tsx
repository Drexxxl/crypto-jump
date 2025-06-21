import Head from 'next/head'
import { MainMenu } from '../components/MainMenu'

export default function Home() {
  return (
    <>
      <Head>
        <title>SpaceJump</title>
      </Head>
      <MainMenu />
    </>
  )
}
