import http from 'http'
import fs from 'fs-extra'
import PATH from 'path'
import formidable from 'formidable'
import multiparty from 'multiparty'

const PORT = 3602
const htmlText = fs.readFileSync(
  PATH.resolve(__dirname, './client/upload.html'),
  { encoding: 'utf8' }
)
const PATH_UPLOADED = PATH.resolve(__dirname, '../uploaded')

fs.ensureDirSync(PATH_UPLOADED)

const UPLOADING_FILE_ID = 'myFile'

http
  .createServer((req, res) => {
    // # upload file
    if (req.url === '/upload-file' && req.method.toLowerCase() === 'post') {
      const form = formidable({
        multiples: true,
        maxFileSize: 5 * 1024 * 1024 * 1024
      })
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.log(err)
          res.end('Upload failed!')
        }
        const tmpFilePath = files[UPLOADING_FILE_ID].path
        const outputPath = PATH.resolve(
          PATH_UPLOADED,
          files[UPLOADING_FILE_ID].name
        )
        await fs.move(tmpFilePath, outputPath, { overwrite: true })
        res.end('Upload succeeded!')
      })
      return
    }

    // # upload multiple files
    if (
      req.url === '/upload-multiple-files' &&
      req.method.toLowerCase() === 'post'
    ) {
      const form = formidable({ multiples: true })
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.log(err)
          res.end('Upload failed!')
          return
        }
        const fileList = files[Object.keys(files)[0]]
        for (const file of fileList) {
          const tmpFilePath = file.path
          const outputPath = PATH.resolve(PATH_UPLOADED, file.name)
          await fs.move(tmpFilePath, outputPath, { overwrite: true })
        }
        res.end('Upload succeeded!')
      })
      return
    }

    // # upload big file
    if (req.url === '/upload-big-file' && req.method.toLowerCase() === 'post') {
      const form = new multiparty.Form()
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.log(err)
          res.end('Upload failed!')
          return
        }
        const [fileSlice] = files.fileSlice
        const [hash] = fields.hash
        const [filename] = fields.filename
        const chunkDir = PATH.resolve(PATH_UPLOADED, `.${filename}`)
        if (!fs.existsSync(chunkDir)) {
          fs.mkdirSync(chunkDir)
        }
        const outputHashFilePath = PATH.resolve(chunkDir, hash)
        await new Promise(resolve =>
          fs.move(
            fileSlice.path,
            outputHashFilePath,
            { overwrite: true },
            err => {
              if (err) {
                res.end('Upload failed!')
                console.log(err)
                return
              }
              resolve()
            }
          )
        )
        res.end('Upload succeeded!')
      })
      return
    }

    if (
      req.url === '/merge-big-file-slices' &&
      req.method.toLowerCase() === 'post'
    ) {
      const form = new multiparty.Form()
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.log(err)
          res.end('Merge failed!')
          return
        }
        const [filename] = fields.filename
        const chunkDir = PATH.resolve(PATH_UPLOADED, `.${filename}`)
        const chunkFileNames = fs.readdirSync(chunkDir)
        const chunkFilePaths = chunkFileNames
          .sort((a, b) => +a.replace(/.*-/, '') - +b.replace(/.*-/, ''))
          .map(name => PATH.resolve(chunkDir, name))
        const outputFilePath = PATH.resolve(PATH_UPLOADED, filename)

        const outputFileWritingStream = fs.createWriteStream(outputFilePath)
        for (const chunkFilePath of chunkFilePaths) {
          const chunkFileReadingStream = fs.createReadStream(chunkFilePath)
          await new Promise(resolve => {
            chunkFileReadingStream.on('end', () => {
              resolve()
            })
            chunkFileReadingStream.pipe(outputFileWritingStream, {
              end: false
            })
          })
        }
        // fs.removeSync( chunkDir )
      })
      return
    }

    res.end(htmlText)
  })
  .listen(PORT)
console.log(`listening on http://localhost:${PORT}`)
