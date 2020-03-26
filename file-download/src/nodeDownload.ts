import PATH from 'path'
import express from 'express'
import fetch from 'isomorphic-fetch'
import fs from 'fs-extra'
import http from 'http'
const PORT = 3100
// # file environment
const app = express()
app.use(express.static(PATH.resolve(__dirname, 'static')))
app.listen(PORT)

const downloadDir = PATH.resolve(__dirname, '../downloaded')
fs.ensureDirSync(downloadDir)

const downloadingUrl = `http://localhost:${PORT}/testDownloadFile.txt`
const filename = PATH.basename(downloadingUrl)
const outputFilePath = PATH.resolve(downloadDir, filename)

function downloadWithoutThirdParty () {
  http.get(downloadingUrl, (res) => {
    const writingStream = fs.createWriteStream(outputFilePath)
    res.pipe(writingStream)
  })
}

function downloadByFetch () {
  fetch(downloadingUrl).then(response => response.text()).then(text => {
    fs.writeFileSync(outputFilePath, text, { encoding: 'utf8' })
  })
}

downloadWithoutThirdParty()
// downloadByFetch()
