
export const logger = window.api.logger ?? console;

if (window.api.logger) {
  console.debug = logger.debug;
  console.log = logger.info;
  console.info = logger.info;
  console.warn = logger.warn;
  console.error = logger.error;
}

export default logger;
