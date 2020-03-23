const assert = require( 'assert' )
import '../src/server/controller'

describe( "Test", function() {
  this.timeout( 6000000 )

  it( "Async unit ", done => {
    setTimeout( () => {
      // done()
    }, 2000 )
  } )
} )