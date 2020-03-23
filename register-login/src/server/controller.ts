import mysql from 'mysql'
import getLocalConfig from './utils/getLocalConfig'
import express from 'express'
import session from 'express-session'
import bodyParser from 'body-parser'
import PATH from 'path'

// login expiration time
const EXPIRATION_TIME = 1000

const PORT = 3610

const PATH_INDEX_PAGE = PATH.resolve( __dirname, '../client/index.ejs' )

const app = express()
app.engine( 'html', require( 'ejs' ).renderFile )
app.set( 'view engine', 'ejs' )

let connection


app.use( bodyParser.urlencoded( { extended: false } ) )
// parse application/json
app.use( bodyParser.json() )

app.use( express.static( PATH.resolve( __dirname, '../client' ) ) )

// session
app.use( session( {
  secret: 'register-login',
  cookie: { maxAge: EXPIRATION_TIME }
} ) )


app.get( '*', ( req, res, next ) => {
  if ( !req.session.logined ) {
    res.render( PATH_INDEX_PAGE, { isLogined: false,  } )
  } else {
    next()
  }
} )

app.get( `/`, ( req, res ) => {
  res.render( PATH_INDEX_PAGE , { isLogined: req.session.logined ? true : false,  } )
} )


app.post( `/sign-up`, ( req, res ) => {
  const { username, password } = req.body
  connection.query( `SELECT * FROM data.user WHERE username='${username}';`, function ( error, results, fields ) {
    if ( error ) {
      res.json( { signed: false } )
      throw error
    }
    if ( results.length === 0 ) {
      connection.query( `INSERT INTO user
      (username, password)
      VALUES
      ( '${username}', '${password}' )
      ;`, ( error, info ) => {
        if ( error ) {
          res.json( { signed: false } )
          throw error
        }
        if ( info.affectedRows === 1 ) {
          res.json( { signed: true } )
        } else {
          res.json( { signed: false } )
        }
      } )
    } else {
      res.json( { signed: false, reason: 'User Name has already been used' } )
    }
  } )
} )

app.post( `/login`, async ( req, res ) => {
  const { username, password } = req.body
  await new Promise( ( resolve, reject ) => {
    connection.query( `SELECT * FROM data.user WHERE username='${username}' AND password='${password}';`, ( error, results ) => {
      if ( error ) {
        res.json( { logined: false } )
        throw error
      }
      if ( results.length === 1 ) {
        req.session.logined = true
        res.json( { logined: true } )
      } else {
        res.json( { logined: false, reason: 'No matched username and password' } )
      }
    }  )
  } )
} )

app.post( `*`, ( req, res, next ) => {
  if ( !req.session.logined ) {
    res.render( PATH_INDEX_PAGE, { isLogined: true, } )
  } else {
    next()
  }
} )

app.post( `/exit-login`, ( req, res ) => {
  req.session.logined = false
  res.json( { exited: true } )
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
connection.connect()
// connection.end()




  
  