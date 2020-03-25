import PATH from 'path'
import fs from 'fs-extra'

const chunksDir = PATH.resolve(__dirname, 'files')
const chunkFileNames = fs.readdirSync(PATH.resolve(__dirname, 'files'))
const chunkFilePaths = chunkFileNames
  .sort((a, b) => +a.replace(/.*-/, '') - +b.replace(/.*-/, ''))
  .map(name => PATH.resolve(chunksDir, name))

const outputFilePath = PATH.resolve(__dirname, './output/testBigFile.txt')

const run = async () => {
  const outputFileWritingStream = fs.createWriteStream(outputFilePath)
  for (const chunkFilePath of chunkFilePaths) {
    const chunkFileReadingStream = fs.createReadStream(chunkFilePath)
    await new Promise((resolve, reject) => {
      chunkFileReadingStream.on('end', () => {
        resolve()
      })
      chunkFileReadingStream.pipe(outputFileWritingStream, { end: false })
    })
  }
}

run()
