/// <reference types="node" />
import { SQSClient, Message } from "@aws-sdk/client-sqs";
import { EventEmitter } from "events";
declare type Logger = Pick<Console, "info" | "error" | "debug">;
declare type SQSWorkerOptions = {
    client?: SQSClient;
    region?: string;
    endpoint?: string;
    logger?: Logger;
    interval?: number;
    queueUrl: string;
    handleMessage: (message: Message) => Promise<void>;
};
declare type RequiredSQSWorkerOptions = Required<Pick<SQSWorkerOptions, "client" | "logger" | "interval" | "queueUrl" | "handleMessage">>;
export declare enum EVENTS {
    INTIALIZED = "sqs-worker.initialized",
    STARTED = "sqs-worker.started",
    STOPPED = "sqs-worker.stopped",
    RECEIVED = "sqs-worker.messa-received",
    ERROR = "sqs-worker.error"
}
export declare class SQSWorker extends EventEmitter {
    private readonly messageHandler;
    private readonly client;
    private readonly interval;
    private readonly queueUrl;
    private readonly logger;
    private runningInterval;
    static forQueue(options: SQSWorkerOptions): SQSWorker;
    constructor({ queueUrl, client, handleMessage, interval, logger, }: RequiredSQSWorkerOptions);
    listen(): Promise<void>;
    stop(): void;
}
export {};
