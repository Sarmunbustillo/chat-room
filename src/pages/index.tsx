import type { NextPage } from 'next';
import Head from 'next/head';
import { trpc } from '../utils/trpc';
import { customAlphabet } from 'nanoid';
import { useRouter } from 'next/router';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvqwxyz0123456789', 4);

const Home: NextPage = () => {
    const router = useRouter();
    const createRoom = () => {
        const roomId = nanoid();
        router.push(`/rooms/${roomId}`);
    };
    return (
        <>
            <Head>
                <title>Chat Room</title>
                <meta name="description" content="Chat Room" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
                <div>
                    <h1 className="">
                        <button
                            className=" text-white bg-gray-800 text-lg  p-3 rounded hover:bg-gray-700"
                            onClick={createRoom}
                        >
                            Create chat room
                        </button>
                    </h1>
                </div>
            </main>
        </>
    );
};

export default Home;
