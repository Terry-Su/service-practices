// import '../src/index'
import '../src/actual-example/index'
const assert = require('assert')

describe('Test', function () {
  this.timeout(2000000)
  it('Async unit ', done => {
    setTimeout(() => {
      // done()
    }, 1000)
  })
})
