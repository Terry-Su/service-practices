import PATH from 'path'
import fs from 'fs-extra'

const chunksDir = PATH.resolve(__dirname, 'files')
const chunkFileNames = fs.readdirSync(PATH.resolve(__dirname, 'files'))
const chunkFilePaths = chunkFileNames
  .sort((a, b) => +a.replace(/.*-/, '') - +b.replace(/.*-/, ''))
  .map(name => PATH.resolve(chunksDir, name))

const outputFilePath = PATH.resolve(__dirname, './output/file.txt')

let index = 0
const writingStream = fs.createWriteStream(outputFilePath)

const readingStream1 = fs.createReadStream(chunkFilePaths[index])
readingStream1.pipe(writingStream, { end: false })
readingStream1.on('end', () => {
  index++
  const readingStream2 = fs.createReadStream(chunkFilePaths[index])
  readingStream2.pipe(writingStream, { end: false })
})
