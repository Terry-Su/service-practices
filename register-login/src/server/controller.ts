import mysql from 'mysql'
import getLocalConfig from './utils/getLocalConfig'

const connection = mysql.createConnection( getLocalConfig().default.connection )

connection.connect()

connection.query( `SELECT * FROM data.user;`, function ( error, results, fields ) {
    if ( error ) throw error
    console.log( `results`, results )
    console.log( `fields`, fields )
  } )
  
  connection.end()
  