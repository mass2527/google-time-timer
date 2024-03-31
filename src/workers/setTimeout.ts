let interval: number | undefined;
let elapsedTimeInMs = 0;

self.onmessage = (
  event:
    | { data: { type: "start"; timeout: number } }
    | { data: { type: "clear" } }
) => {
  const { data } = event;
  switch (data.type) {
    case "start": {
      interval = setInterval(() => {
        elapsedTimeInMs = elapsedTimeInMs + data.timeout;
        self.postMessage(elapsedTimeInMs);
      }, data.timeout);
      break;
    }
    case "clear": {
      clearInterval(interval);
      elapsedTimeInMs = 0;
      break;
    }
  }
};
