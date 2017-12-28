import promiseIpc from 'electron-promise-ipc';
import {IpcSubject} from './IpcSubject';
import {IpcEvent} from './IpcEvent';
import {EntitySerializerFactory} from '../entities/serializer/EntitySerializerFactory';
import {Logger, LogLevel} from '../dev/Logger';

const logger = Logger.getLogger('Ipc');
logger.setLevel(LogLevel.WARNING);

const eu = EntitySerializerFactory.newInstance();

export declare type IpcHandler = (event: IpcEvent) => any;

/**
 * Raw IPC message containing only serialized data
 * This kind of message allow to restore true objects
 * (with class types) when receiving them
 */
interface IpcInternalMessage {
    serializedData: string;
}

/**
 * Inter process communication tool, allow to communicate between main process
 * and renderer process.
 */
export class Ipc {
    private webContent: any;

    /**
     * Web content is mandatory if you want to use IPC from
     * main process
     *
     * @param webContent
     */
    constructor(webContent?: any) {
        logger.debug('New instance created');
        this.webContent = webContent;
    }

    /**
     * Register a handler. Handler should never return a promise.
     *
     * @param {IpcSubject} subject
     * @param {IpcHandler} handler
     */
    public listen(subject: IpcSubject, handler: IpcHandler): void {

        logger.debug(`Listening: subject=${JSON.stringify(subject)} handler=${JSON.stringify(handler)}`);

        promiseIpc.on(subject.id, async (message: IpcInternalMessage): Promise<IpcInternalMessage> => {

            logger.debug(`Message received: subject=${JSON.stringify(subject)} event=${JSON.stringify(message)}`);

            this.throwIfMessageIsInvalid(subject, message);
            const event = eu.deserializeIpcEvent(message.serializedData);

            const response = handler(event);
            if (response) {
                return await this.serializeIpcMessage(response);
            } else {
                return {serializedData: '{}'};
            }
        });
    }

    public send(subject: IpcSubject, event: IpcEvent = {}): Promise<any> {

        const serialized: IpcInternalMessage = {serializedData: eu.serialize(event)};

        logger.debug(`Send message: subject=${JSON.stringify(subject)} event=${JSON.stringify(event)}`);

        // send event from main process
        if (this.webContent) {
            return promiseIpc.send(subject.id, this.webContent, serialized)
                .then((message: IpcInternalMessage) => {
                    return this.deserializeIpcMessage(subject, message);
                });
        }
        // send event from renderer process
        else {
            return promiseIpc.send(subject.id, serialized)
                .then((message: IpcInternalMessage) => {
                    return this.deserializeIpcMessage(subject, message);
                });
        }
    }

    private deserializeIpcMessage(subject: IpcSubject, message: IpcInternalMessage) {
        this.throwIfMessageIsInvalid(subject, message);
        return eu.deserialize(message.serializedData);
    }

    private async serializeIpcMessage(data: any): Promise<IpcInternalMessage> {

        // response is a promise
        if (data.then) {
            const response = await data;
            return {serializedData: eu.serialize(response || {})};
        } else {
            return {serializedData: eu.serialize(data || {})};
        }

    }

    private throwIfMessageIsInvalid(subject: IpcSubject, message: IpcInternalMessage) {
        if (!message || !message.serializedData) {
            throw new Error(`Invalid message: ${JSON.stringify(message)} on subject: ${JSON.stringify(subject)}`);
        }
    }
}

