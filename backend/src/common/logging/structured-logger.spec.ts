import { StructuredLogger } from './structured-logger';

describe('StructuredLogger', () => {
  let logger: StructuredLogger;
  let originalLog: typeof console.log;
  let originalWarn: typeof console.warn;
  let originalError: typeof console.error;

  beforeEach(() => {
    logger = new StructuredLogger();
    originalLog = console.log;
    originalWarn = console.warn;
    originalError = console.error;
  });

  afterEach(() => {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
  });

  it('should output valid JSON for log()', () => {
    let output = '';
    console.log = (msg?: any) => {
      output = String(msg);
    };

    logger.log('test_message', { context: 'TEST', foo: 'bar' });

    const parsed = JSON.parse(output);
    expect(parsed.level).toBe('log');
    expect(parsed.message).toBe('test_message');
    expect(parsed.context).toBe('TEST');
    expect(parsed.foo).toBe('bar');
    expect(typeof parsed.timestamp).toBe('string');
  });

  it('should output valid JSON for warn()', () => {
    let output = '';
    console.warn = (msg?: any) => {
      output = String(msg);
    };

    logger.warn('warn_message', { context: 'TEST_WARN' });

    const parsed = JSON.parse(output);
    expect(parsed.level).toBe('warn');
    expect(parsed.message).toBe('warn_message');
    expect(parsed.context).toBe('TEST_WARN');
  });

  it('should output valid JSON for error()', () => {
    let output = '';
    console.error = (msg?: any) => {
      output = String(msg);
    };

    logger.error('error_message', 'stack-trace', { context: 'TEST_ERROR' });

    const parsed = JSON.parse(output);
    expect(parsed.level).toBe('error');
    expect(parsed.message).toBe('error_message');
    expect(parsed.context).toBe('TEST_ERROR');
    expect(parsed.trace).toBe('stack-trace');
  });
});

