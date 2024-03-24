import { Router } from 'express'

const route = Router()

route.get('/', (req, res) => {
  res.json({
    message: {
      appName: process.env.npm_package_name,         
      appVer: process.env.npm_package_version
      }
  })
})

route.get('/messages', (req, res) => {
  res.json({
    message: 'Welcome! from unprotected resource.'
  })
})

export default route