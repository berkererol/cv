const handlebars = require('handlebars')
const fs = require('fs-extra')
const markdownHelper = require('./utils/helpers/markdown')
const templateData = require('./metadata/metadata')
const Puppeteer = require('puppeteer')
const getSlug = require('speakingurl')
const dayjs = require('dayjs')
const repoName = require('git-repo-name')
const username = require('git-username')

const srcDir = __dirname
const outputDir = __dirname + '/../dist'

// Clear dist dir
fs.emptyDirSync(outputDir)

// Copy assets
fs.copySync(srcDir + '/assets', outputDir)

// Build HTML
handlebars.registerHelper('markdown', markdownHelper)
const source = fs.readFileSync(srcDir + '/templates/index.html', 'utf-8')
const template = handlebars.compile(source)
const pdfFileName = `${getSlug(templateData.name)}_${getSlug(
  templateData.title1
)}_${getSlug(templateData.title2)}.pdf`
const html = template({
  ...templateData,
  baseUrl: `https://${username()}.github.io/${repoName.sync()}`,
  pdfFileName,
  updated: dayjs().format('MMMM D, YYYY'),
})
fs.writeFileSync(outputDir + '/index.html', html)

buildPdf = async function (inputFile, outputFile) {
  try {
    const browser = await Puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(`file://${inputFile}`, {
      waitUntil: 'networkidle0',
    })
    await page.pdf({
      path: outputFile,
      format: 'Letter',
      border: 0,
      margin: {
        top: '1cm',
        right: '0cm',
        bottom: '1cm',
        left: '0cm',
      },
    })
    await browser.close()
  } catch (error) {
    // Handle the error here
    console.error('An error occurred:', error)
  }
}

// Build PDF
buildPdf(`${outputDir}/index.html`, `${outputDir}/${pdfFileName}`)
