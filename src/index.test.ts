import { hello } from './index.js'

// rome-ignore lint/correctness/noUndeclaredVariables:
test("hello('Nex') to equal 'Hello Nex!'", () => {
  // rome-ignore lint/correctness/noUndeclaredVariables:
  expect(hello('Nex')).toBe('Hello Nex!')
})
