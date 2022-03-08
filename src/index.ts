import {
  SQSClient,
  Message,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs"
import { EventEmitter } from "events"

type MessageHandler = (message: Message) => Promise<void>

type Logger = Pick<Console, "info" | "error" | "debug">

type SQSWorkerOptions = {
  client?: SQSClient
  region?: string
  endpoint?: string
  logger?: Logger
  interval?: number
  queueUrl: string
  handleMessage: (message: Message) => Promise<void>
}

type RequiredSQSWorkerOptions = Required<
  Pick<
    SQSWorkerOptions,
    "client" | "logger" | "interval" | "queueUrl" | "handleMessage"
  >
>

export enum EVENTS {
  INTIALIZED = "sqs-worker.initialized",
  STARTED = "sqs-worker.started",
  STOPPED = "sqs-worker.stopped",
  RECEIVED = "sqs-worker.messa-received",
  ERROR = "sqs-worker.error",
}

export class SQSWorker extends EventEmitter {
  private readonly messageHandler: MessageHandler
  private readonly client: SQSClient
  private readonly interval: number
  private readonly queueUrl: string
  private readonly logger: Logger
  private runningInterval: ReturnType<typeof setTimeout>

  static forQueue(options: SQSWorkerOptions): SQSWorker {
    const {
      client: existingClient,
      region,
      endpoint,
      queueUrl,
      handleMessage,
      logger: loggerGiven,
      interval: intervalGiven,
    } = options
    const client = existingClient ?? new SQSClient({ region, endpoint })
    const interval = intervalGiven ?? 3000
    const logger = loggerGiven ?? console
    return new SQSWorker({ queueUrl, client, handleMessage, interval, logger })
  }

  constructor({
    queueUrl,
    client,
    handleMessage,
    interval,
    logger,
  }: RequiredSQSWorkerOptions) {
    super()

    this.queueUrl = queueUrl
    this.client = client
    this.messageHandler = handleMessage
    this.interval = interval
    this.logger = logger
    this.emit(EVENTS.INTIALIZED)
  }

  async listen(): Promise<void> {
    this.emit(EVENTS.STARTED)
    this.logger.info("Running SQS Worker")

    const receiveCommand = new ReceiveMessageCommand({
      QueueUrl: this.queueUrl,
    })

    const {
      $metadata: { httpStatusCode },
      Messages,
    } = await this.client.send(receiveCommand)

    if (httpStatusCode >= 400) {
      this.emit(EVENTS.ERROR, httpStatusCode)
    }

    try {
      if (Messages?.length) {
        const [rawMessage] = Messages
        this.emit(EVENTS.RECEIVED, rawMessage)
        this.logger.debug("message received", rawMessage)
        const { Body: message, ReceiptHandle } = rawMessage
        await this.messageHandler(JSON.parse(message))
        await this.client.send(
          new DeleteMessageCommand({ QueueUrl: this.queueUrl, ReceiptHandle })
        )
      }
    } catch (e) {
      this.emit(EVENTS.ERROR, e)
    } finally {
      this.runningInterval = setTimeout(async () => {
        await this.listen()
      }, this.interval)
    }
  }

  stop(): void {
    clearTimeout(this.runningInterval)
    this.logger.debug("stopping worker")
    this.emit(EVENTS.STOPPED)
  }
}
