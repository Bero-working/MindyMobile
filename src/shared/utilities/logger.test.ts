import { logger, setErrorReporter, type LogValue } from './logger';

afterEach(() => {
  jest.restoreAllMocks();
  Object.defineProperty(global, '__DEV__', { value: true, writable: true });
});

it('redacts sensitive keys in nested objects and arrays', () => {
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  logger.warn('request', {
    password: 'secret',
    nested: [
      {
        Token: 'secret',
        cookie: 'secret',
        'set-cookie': 'secret',
        authorization: 'secret',
      },
    ],
    safe: 'ok',
  });
  expect(warn).toHaveBeenCalledWith(expect.any(String), 'request', {
    password: '[REDACTED]',
    nested: [
      {
        Token: '[REDACTED]',
        cookie: '[REDACTED]',
        'set-cookie': '[REDACTED]',
        authorization: '[REDACTED]',
      },
    ],
    safe: 'ok',
  });
});

it('does not print debug or info in production', () => {
  const log = jest.spyOn(console, 'log').mockImplementation(() => {});
  const info = jest.spyOn(console, 'info').mockImplementation(() => {});
  Object.defineProperty(global, '__DEV__', { value: false, writable: true });
  logger.debug('debug');
  logger.info('info');
  expect(log).not.toHaveBeenCalled();
  expect(info).not.toHaveBeenCalled();
});

it('sends redacted context to the production reporter', () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  const reporter = jest.fn();
  setErrorReporter(reporter);
  Object.defineProperty(global, '__DEV__', { value: false, writable: true });
  const error = new Error('Failure');
  logger.error('failed', error, {
    password: 'secret',
    email: 'private@example.test',
  });
  expect(reporter).toHaveBeenCalledWith('failed', error, {
    password: '[REDACTED]',
    email: '[REDACTED]',
  });
});

it('redacts credential fields inside errors before printing or reporting', () => {
  const print = jest.spyOn(console, 'error').mockImplementation(() => {});
  const reporter = jest.fn();
  setErrorReporter(reporter);
  Object.defineProperty(global, '__DEV__', { value: false, writable: true });
  const error = Object.assign(new Error('Request failed'), {
    config: {
      headers: { Authorization: 'Bearer secret', Cookie: 'session=secret' },
      data: { password: 'secret', access_token: 'secret' },
    },
  });
  logger.error('failed', error, { nested: [error] });
  const safeError = expect.objectContaining({
    message: 'Request failed',
    config: {
      headers: { Authorization: '[REDACTED]', Cookie: '[REDACTED]' },
      data: { password: '[REDACTED]', access_token: '[REDACTED]' },
    },
  });
  expect(print).toHaveBeenCalledWith(expect.any(String), 'failed', safeError, {
    nested: [safeError],
  });
  expect(reporter).toHaveBeenCalledWith('failed', safeError, {
    nested: [safeError],
  });
  expect(error.config.data.password).toBe('secret');
});

it('handles circular diagnostic context without crashing', () => {
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  const context: { password: string; self?: LogValue } = { password: 'secret' };
  context.self = context;
  logger.warn('request', context);
  expect(warn).toHaveBeenCalledWith(expect.any(String), 'request', {
    password: '[REDACTED]',
    self: '[Circular]',
  });
});
