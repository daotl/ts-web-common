import { hello } from './index.js'

test("hello('Nex') to equal 'Hello Nex!'", () => {
  expect(hello('Nex')).toBe(`Hello Nex!`)
})
