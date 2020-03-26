import http from 'http'
import fs from 'fs-extra'
import PATH from 'path'

const PORT = 3602
const htmlText = fs.readFileSync(
  PATH.resolve(__dirname, './client/download.html'),
  { encoding: 'utf8' }
)

const downloadingFilePath = PATH.resolve(
  __dirname,
  './static/testDownloadFile.txt'
)

http
  .createServer((req, res) => {
    // # upload file
    if (req.url === '/download-file' && req.method.toLowerCase() === 'get') {
      res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Content-Length': fs.statSync(downloadingFilePath).size
      })
      const readingStream = fs.createReadStream(downloadingFilePath)
      readingStream.pipe(res)
      return
    }

    res.end(htmlText)
  })
  .listen(PORT)
console.log(`listening on http://localhost:${PORT}`)
