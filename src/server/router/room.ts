import { randomUUID } from 'crypto';
import {
    messageSubSchema,
    sendMessageSchema,
    Message,
} from '../../constants/schema';
import { Events } from '../../constants/events';
import { createRouter } from './context';
import * as trpc from '@trpc/server';

export const roomRouter = createRouter()
    .mutation('send-message', {
        input: sendMessageSchema,
        resolve({ ctx, input }) {
            const message: Message = {
                ...input,
                sentAt: new Date(),
                id: randomUUID(),
                sender: {
                    name: ctx.session?.user?.name || 'unknown',
                },
            };

            ctx.eventEm.emit(Events.SEND_MESSAGE, message);
            return true;
        },
    })
    .subscription('onSendMessage', {
        input: messageSubSchema,
        resolve({ ctx, input }) {
            return new trpc.Subscription<Message>((emit) => {
                function onMessage(data: Message) {
                    if (input.roomId === data.roomId) {
                        emit.data(data);
                    }
                }

                ctx.eventEm.on(Events.SEND_MESSAGE, onMessage);
                return () => {
                    ctx.eventEm.off(Events.SEND_MESSAGE, onMessage);
                };
            });
        },
    });
