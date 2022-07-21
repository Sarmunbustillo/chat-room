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
    return <li>{message.message}</li>;
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
            <div>
                <button onClick={() => signIn()}>Log in</button>
            </div>
        );
    }

    return (
        <div>
            <ul>
                {messages.map((m) => {
                    return (
                        <MessageItem message={m} session={session} key={m.id} />
                    );
                })}
            </ul>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    sendMessageMutation({ roomId, message });
                    setMessage('');
                }}
            >
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What do you want to say"
                    name=""
                    id=""
                />
                <button type="submit">Send message</button>
            </form>
        </div>
    );
};

export default RoomPage;
