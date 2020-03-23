const assert = require( 'assert' )
import '../src/server/controller'

describe( "Test", function() {
  this.timeout( 20000 )

  it( "Async unit ", done => {
    setTimeout( () => {
      done()
    }, 2000 )
  } )
} )