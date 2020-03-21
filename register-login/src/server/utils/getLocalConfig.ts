import FS from 'fs-extra'
import PATH from 'path'

export default function getLocalConfig() {
  try {
      const customConfigFilePath = PATH.resolve( __dirname, "../../../localConfig.ts" )
      if ( FS.pathExistsSync( customConfigFilePath ) ) {
          return require( customConfigFilePath )
      }
    } catch( e ) {}
  return {}
}