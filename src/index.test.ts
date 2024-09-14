import { greet } from './index';

test('greet returns a greeting message', () => {
  expect(greet('World')).toBe('Hello, World!');
});