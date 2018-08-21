const express = require('express')
const got = require('got')
const { spawn } = require('child_process')

const app = express()

const vuepress = () => {
  const port = 9001
  spawn('yarn', ['docs:dev', '--port', port], { stdio: 'inherit' })

  return port
}

const webpack = () => {
  const port = 9002
  spawn('yarn', ['webpack:dev', '--port', port], { stdio: 'inherit' })

  return port
}

const webpackPort = webpack()
const vuepressPort = vuepress()

const sendBody = res => result => {
  res.status(200).send(result.body)
  res.end()
}

const failRequest = res => () => {
  res.status(404).send('Not Found')
  res.end()
}

const requestServer = async (port, req) => {
  const json = req.headers.accept === 'application/json'

  let result
  try {
    result = await got(`http://localhost:${port}${req.url}`, { json })
  } catch (err) {
    result = {
      statusCode: 404,
      body: 'Not Found'
    }
  }

  return result
}


app.use((req, res) => {
  const send = sendBody(res)
  const fail = failRequest(res)

  Promise.all([ requestServer(vuepressPort, req), requestServer(webpackPort, req) ])
    .then(([vuepressResponse, webpackResponse]) => {
      if (vuepressResponse.statusCode === 200) {
        return send(vuepressResponse)
      }

      if (webpackResponse.statusCode === 200) {
        return send(webpackResponse)
      }

      return fail()
    })
    .catch(fail)
})

app.listen(8080, () => console.log('Listening on port 8080'))
