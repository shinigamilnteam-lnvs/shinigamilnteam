/* eslint-disable node/no-deprecated-api */
const cheerio = require('cheerio')
const loadJsonFile = require('load-json-file')
const axios = require('axios')
const URL = require('url')
const https = require('https')

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
})
axios.defaults.httpsAgent = httpsAgent

const fetch = async (url) => {
  try {
    const { data } = await axios.get(url)
    return data
  } catch (error) {
    await new Promise(resolve => setTimeout(resolve, 10000))
    return false
  }
}

const urls = async () => {
  let urls = []
  for (let index = 1; index <= 4; index++) {
    console.log('🚀 ~ index', index)
    const url = 'https://shinigamilnteam.com/moi-cap-nhat/tieu-thuyet/trang/' + index
    const html = await fetch(url)
    if (!html) {
      index--
      continue
    }
    const $ = cheerio.load(html)
    urls = [...urls, ...$('.glitem a.story').map(function list () {
      return `https://shinigamilnteam.com${$(this).attr('href')}`
    }).get()]
  }
  return urls
}

const updateURLs = async () => {
  let urls = []
  const url = 'https://shinigamilnteam.com/moi-cap-nhat/tieu-thuyet'
  const html = await fetch(url)
  const $ = cheerio.load(html)
  urls = [...urls, ...$('.glitem a.story').map(function list () {
    return `https://shinigamilnteam.com${$(this).attr('href')}`
  }).get()]
  return urls
}

const read = require('read-file')
const write = require('write-file-utf8')

const save = async () => {
  const urls = await loadJsonFile('docs/index.html')
  console.log(urls.length)
  for (let i = 0; i < urls.length; i++) {
    console.log(i)
    const url = urls[i]
    const qURL = URL.parse(url, true)
    const pathURL = 'docs' + qURL.pathname + '.html'
    try {
      const htmlFile = read.sync(pathURL)
      const html = await fetch(url)
      if (!html) {
        i--
        continue
      }

      // eslint-disable-next-line no-unused-vars
      const $File = cheerio.load(htmlFile)
      const $ = cheerio.load(html)
      const chapterURLs = $('a.chapter').map(function chapters () {
        return `https://shinigamilnteam.com${$(this).attr('href')}`
      }).get()
      await write(pathURL, html)

      for (let j = 0; j < chapterURLs.length; j++) {
        const chapterURL = chapterURLs[j]
        const qChapterURL = URL.parse(chapterURL, true)
        const pathChapterURL = 'docs' + qChapterURL.pathname + '.html'
        try {
          // eslint-disable-next-line no-unused-vars
          const htmlFile = read.sync(pathChapterURL)
        } catch (error) {
          console.log('🚀 update ~ i ~ j', i, j)
          const chapterHTML = await fetch(chapterURL)
          if (!chapterHTML) {
            i--
            continue
          }
          await write(pathChapterURL, chapterHTML)
        }
      }
    } catch (error) {
      const html = await fetch(url)
      if (!html) {
        i--
        continue
      }
      html && await write(pathURL, html)
      const $ = cheerio.load(html)
      const chapterURLs = $('a.chapter').map(function chapters () {
        return `https://shinigamilnteam.com${$(this).attr('href')}`
      }).get()
      for (let j = 0; j < chapterURLs.length; j++) {
        console.log('🚀 new ~ i ~ j', i, j)
        const chapterURL = chapterURLs[j]
        const qChapterURL = URL.parse(chapterURL, true)
        const pathChapterURL = 'docs' + qChapterURL.pathname + '.html'
        const chapterHTML = await fetch(chapterURL)
        if (!chapterHTML) {
          j--
          continue
        } else {
          chapterHTML && await write(pathChapterURL, chapterHTML)
        }
      }
    }
  }
}

const update = async () => {
  const urls = await updateURLs()
  await write('docs/update.html', JSON.stringify(_urls))
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    const qURL = URL.parse(url, true)
    const pathURL = 'docs' + qURL.pathname + '.html'
    try {
      const htmlFile = read.sync(pathURL)
      const html = await fetch(url)
      // eslint-disable-next-line no-unused-vars
      const $File = cheerio.load(htmlFile)
      const $ = cheerio.load(html)
      const chapterURLs = $('a.chapter').map(function chapters () {
        return `https://shinigamilnteam.com${$(this).attr('href')}`
      }).get()
      html && await write(pathURL, html)
      for (let j = 0; j < chapterURLs.length; j++) {
        const chapterURL = chapterURLs[j]
        const qChapterURL = URL.parse(chapterURL, true)
        const pathChapterURL = 'docs' + qChapterURL.pathname + '.html'
        try {
          // eslint-disable-next-line no-unused-vars
          const htmlFile = read.sync(pathChapterURL)
        } catch (error) {
          console.log('🚀 update ~ i ~ j', i, j)
          const chapterHTML = await fetch(chapterURL)
          chapterHTML && await write(pathChapterURL, chapterHTML)
        }
      }
    } catch (error) {
      const html = await fetch(url)
      if (!html) {
        i--
        continue
      }
      html && await write(pathURL, html)
      const $ = cheerio.load(html)
      const chapterURLs = $('a.chapter').map(function chapters () {
        return `https://shinigamilnteam.com${$(this).attr('href')}`
      }).get()
      for (let j = 0; j < chapterURLs.length; j++) {
        console.log('🚀 new ~ i ~ j', i, j)
        const chapterURL = chapterURLs[j]
        const qChapterURL = URL.parse(chapterURL, true)
        const pathChapterURL = 'docs' + qChapterURL.pathname + '.html'
        const chapterHTML = await fetch(chapterURL)
        if (!chapterHTML) {
          j--
          continue
        } else {
          chapterHTML && await write(pathChapterURL, chapterHTML)
        }
      }
    }
  }
}

const start = async () => {
  console.time('save')
    const _urls = await urls()
    await write('docs/index.html', JSON.stringify(_urls))
    await save()
  console.timeEnd('save')
}

start()