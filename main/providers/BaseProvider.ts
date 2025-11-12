
export abstract class BaseProvider {
  abstract chat(messages: DialogueMessageProps[], modelName: string): Promise<AsyncIterable<UniversalChunk>>
}
