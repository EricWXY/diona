export function listenDialogueBack(cb: (data: DialogueBackStream) => void, messageId: number) {
  let stop: (() => void) | void = window.api.onDialogueBack((stream: DialogueBackStream) => {
    cb(stream);
    if (!stream.data.isEnd) return;
    stop?.();
    stop = void 0;
  }, messageId);

  return stop;
}
