import { Session } from 'next-auth';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Message } from '../../constants/schema';
import { trpc } from '../../utils/trpc';
const MessageItem = ({
    message,
    session,
}: {
    message: Message;
    session: Session;
}) => {
    const baseStyles =
        'mb-4 text-md w-7/12 p-4 text-lg text-gray-700 border border-gray-700 font-semibold rounded-md flex flex-col';

    const liStyles =
        message.sender.name === session.user?.name
            ? baseStyles
            : baseStyles.concat(' self-end bg-gray-700 text-white');
    return (
        <li className={liStyles}>
            {message.message}

            <small className="flex self-end text-xs font-light">
                <time>
                    {message.sentAt.toLocaleTimeString('de-DE', {
                        timeStyle: 'short',
                    })}{' '}
                    - {message.sender.name}
                </time>
            </small>
        </li>
    );
};
const RoomPage = () => {
    const { query } = useRouter();
    const roomId = query.roomId as string;
    const { data: session } = useSession();

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);

    const { mutateAsync: sendMessageMutation } = trpc.useMutation([
        'room.send-message',
    ]);

    trpc.useSubscription(['room.onSendMessage', { roomId }], {
        onNext: (message) => {
            setMessages((m) => {
                return [...m, message];
            });
        },
    });

    if (!session) {
        return (
            <div className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
                <button
                    className=" text-white bg-gray-800 text-lg  p-3 rounded hover:bg-gray-700"
                    onClick={() => signIn()}
                >
                    Log in
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen p-4">
            <div className="flex-1">
                <ul className="flex flex-col ">
                    {messages.map((m) => {
                        return (
                            <MessageItem
                                message={m}
                                session={session}
                                key={m.id}
                            />
                        );
                    })}
                </ul>
            </div>
            <form
                className="flex"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (message.length < 1) return;
                    sendMessageMutation({ roomId, message });
                    setMessage('');
                }}
            >
                <textarea
                    className="black p-2.5 w-full text-gray-700 bg-gray-50 rounded-l-lg border border-gray-800"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What do you want to say"
                    name=""
                    id=""
                />
                <button
                    className="flex-1 text-white bg-gray-800  p-2.5 rounded-r-lg hover:bg-gray-700"
                    type="submit"
                >
                    Send message
                </button>
            </form>
        </div>
    );
};

export default RoomPage;
