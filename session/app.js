const express = require('express')
const session = require('express-session')

const PORT = 3612

const app = express()

app.use( session( {
  secret: 'register-login',
  cookie: { maxAge: 60000 }
} ) )


app.get( '/', ( req, res, next ) => {
  if ( req.session.views ) {
    req.session.views++
    res.setHeader( 'Content-Type', 'text/html' )
    res.write( '<p>views: ' + req.session.views + '</p>' )
    res.write( '<p>expires in: ' + ( req.session.cookie.maxAge / 1000 ) + 's</p>' )
    res.end()
  } else {
    req.session.views = 1
    res.end( 'welcome to the session demo. refresh!' )
  }
} )

app.listen( PORT, () => {
  console.log( `visit: http://localhost:${PORT}` )
} )
