import http from 'http'
import fs from 'fs-extra'
import PATH from 'path'
import formidable from 'formidable'
import multiparty from 'multiparty'

const PORT = 3601
const htmlText = fs.readFileSync(
  PATH.resolve(__dirname, './client/upload.html'),
  { encoding: 'utf8' }
)
const PATH_UPLOADED = PATH.resolve(__dirname, '../uploaded')

fs.ensureDirSync(PATH_UPLOADED)

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
        const fileId = Object.keys(files)[0]
        const tmpFilePath = files[fileId].path
        const filename = files[fileId].name
        if (filename.trim() === '') { res.end('Upload failed!'); return }
        const outputPath = PATH.resolve(PATH_UPLOADED, filename)
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

    // # upload file with progress displayed
    if (req.url === '/upload-progress-file' && req.method.toLowerCase() === 'post') {
      const form = formidable({ multiples: true, maxFileSize: 5 * 1024 * 1024 * 1024 })
      form.parse(req, (err, fields, files) => {
        if (err) { console.log(err); res.end('Upload failed!'); return }
        const file = files[Object.keys(files)[0]]
        const outputFilePath = PATH.resolve(PATH_UPLOADED, file.name)
        fs.moveSync(file.path, outputFilePath, { overwrite: true })
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
        fs.removeSync(chunkDir)
      })
      return
    }

    // # upload file immediately
    if (
      req.url === '/upload-not-immediately' &&
      req.method.toLowerCase() === 'post'
    ) {
      const form = formidable({ multiples: true, maxFileSize: 5 * 1024 * 1024 * 1024 })
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.log(err)
          res.end('Upload not immediately failed!')
        }
        const file = files[Object.keys(files)[0]]
        const hash = fields.hash
        const filename = fields.filename
        const targetFilePath = PATH.resolve(PATH_UPLOADED, `${filename}-${hash}`)
        fs.moveSync(file.path, targetFilePath, { overwrite: true })
        res.end('Upload not immediately succeeded!')
      })
      return
    }
    if (
      req.url === '/upload-immediately' &&
      req.method.toLowerCase() === 'post'
    ) {
      const form = formidable({ multiples: true })
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.log(err)
          res.end('Upload immediately failed!')
        }
        const hash = fields.hash
        const filename = fields.filename
        const targetFilePath = PATH.resolve(PATH_UPLOADED, `${filename}-${hash}`)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ data: fs.existsSync(targetFilePath) && fs.statSync(targetFilePath).isFile() }))
      })
      return
    }

    // # upload file by resume breakpoint
    if (req.url === '/upload-resume-breakpoint-chunk-immediately' && req.method.toLowerCase() === 'post') {
      const form = formidable()
      form.parse(req, (err, fields, files) => {
        if (err) { console.log(err); res.end('Upload failed!') }
        const { chunkName, filename } = fields
        const checkingFilePath = PATH.resolve(PATH_UPLOADED, `.${filename}/${chunkName}`)
        res.end(JSON.stringify({
          data: fs.existsSync(checkingFilePath) && fs.statSync(checkingFilePath).isFile()
        }))
      })
      return
    }
    if (req.url === '/upload-resume-breakpoint-chunk' && req.method.toLowerCase() === 'post') {
      const form = formidable({ multiples: true, maxFileSize: 5 * 1024 * 1024 * 1024 })
      form.parse(req, (err, fields, files) => {
        if (err) { console.log(err); res.end('Upload failed!') }
        const { chunkName, filename } = fields
        const file = files[Object.keys(files)[0]]
        const outputFilePath = PATH.resolve(PATH_UPLOADED, `.${filename}/${chunkName}`)
        fs.moveSync(file.path, outputFilePath, { overwrite: true })
        res.end('Upload succeeded!')
      })
      return
    }
    if (req.url === '/merge-resume-breakpoint-chunks' && req.method.toLowerCase() === 'post') {
      const form = formidable()
      form.parse(req, async (err, fields, files) => {
        if (err) { console.log(err); res.end('Upload failed!') }
        const { filename } = fields
        const outputFilePath = PATH.resolve(PATH_UPLOADED, filename)
        const writingStream = fs.createWriteStream(outputFilePath)
        const chunksdir = PATH.resolve(PATH_UPLOADED, `.${filename}`)
        const chunkFileNames = fs.readdirSync(chunksdir).sort((a, b) => +a.replace(/-.*/, '') - (+b.replace(/-.*/, '')))
        const chunkFilePaths = chunkFileNames.map(v => PATH.resolve(chunksdir, v))
        for (const chunkFilePath of chunkFilePaths) {
          const readingStream = fs.createReadStream(chunkFilePath)
          await new Promise(resolve => {
            readingStream.on('end', resolve)
            readingStream.pipe(writingStream, { end: false })
          })
        }
        fs.removeSync(chunksdir)
        res.end('Upload succeeded!')
      })
      return
    }

    res.end(htmlText)
  })
  .listen(PORT)
console.log(`listening on http://localhost:${PORT}`)
