const assert = require( 'assert' )
import '../src/server/controller'

describe( "Test", () => {
  it( "Async unit ", done => {
    setTimeout( () => {
      done()
    }, 20000 )
  } )
} )