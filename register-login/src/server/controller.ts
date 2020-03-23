import mysql from 'mysql'
import getLocalConfig from './utils/getLocalConfig'
import express from 'express'
import session from 'express-session'
import bodyParser from 'body-parser'
import PATH from 'path'

const PORT = 3610

const app = express()

let connection

app.use( bodyParser.urlencoded( { extended: false } ) )
// parse application/json
app.use( bodyParser.json() )

app.use( express.static( PATH.resolve( __dirname, '../client' ) ) )

// session
app.use( session( {
  secret: 'register-login',
  cookie: { maxAge: 60000 }
} ) )

app.post( `/sign-up`, ( req, res ) => {
  const { username, password } = req.body
  connection.connect()
  connection.query( `SELECT * FROM data.user WHERE username='${username}';`, function ( error, results, fields ) {
    if ( error ) throw error
    console.log( `results`, results )
    console.log( `fields`, fields )
  } )
  connection.end()
} )

// app.get( '/', ( req, res, next ) => {
//   // res.end( 'Hello Register Login!' )
//   if ( req.session.views ) {
//     req.session.views++
//     res.setHeader( 'Content-Type', 'text/html' )
//     res.write( '<p>views: ' + req.session.views + '</p>' )
//     res.write( '<p>expires in: ' + ( req.session.cookie.maxAge / 1000 ) + 's</p>' )
//     res.end()
//   } else {
//     req.session.views = 1
//     res.end( 'welcome to the session demo. refresh!' )
//   }
// } )

app.listen( PORT, () => {
  console.log( `visit: http://localhost:${PORT}` )
} )

connection = mysql.createConnection( getLocalConfig().default.connection )



  
  