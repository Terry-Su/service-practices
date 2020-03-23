import mysql from 'mysql'
import getLocalConfig from './utils/getLocalConfig'
import express from 'express'
import session from 'express-session'
import PATH from 'path'

const PORT = 3610

const app = express()

// app.use( express.static( PATH.resolve( __dirname, '../client' ) ) )

app.use( session( {
  secret: 'register-login',
  cookie: { maxAge: 60000 }
} ) )


app.get( '/', ( req, res, next ) => {
  // res.end( 'Hello Register Login!' )
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

const connection = mysql.createConnection( getLocalConfig().default.connection )

connection.connect()

// connection.query( `SELECT * FROM data.user;`, function ( error, results, fields ) {
//     if ( error ) throw error
//     console.log( `results`, results )
//     console.log( `fields`, fields )
//   } )
  
connection.end()
  