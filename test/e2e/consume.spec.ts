import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs"
import { expect, use } from "chai"
import sinon from "ts-sinon"
import * as sinonChai from "sinon-chai"
import * as chaiAsPromised from "chai-as-promised"
import { SQSWorker } from "../../src"
import { setTimeout } from "timers/promises"
use(sinonChai)
use(chaiAsPromised)

describe("SQS consumption", () => {
  const queue = "test-queue"
  const region = "us-east-1"
  const endpoint = "http://localstack:4566"

  const client = new SQSClient({ region, endpoint })
  const message = { foo: "bar" }
  const queueUrl = "http://localstack:4566/000000000000/test-queue"
  const newMessageCmd = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(message),
  })

  const handleMessage = sinon.stub()
  const worker = SQSWorker.forQueue({
    client,
    queueUrl,
    handleMessage,
  })

  beforeEach(async () => {
    await worker.listen()
    try {
      await client.send(newMessageCmd)
    } catch (e) {
      console.error(e)
    }
  })

  afterEach(() => {
    worker.stop()
  })

  it("consumes a message", async () => {
    expect(handleMessage).to.have.been.calledOnceWith(message)
  })
})
