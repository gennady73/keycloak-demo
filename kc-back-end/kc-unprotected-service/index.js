'use strict'

import app from './src/app.js'

app.listen(app.get('port'), app.get('host'), error => {
  if (error) console.log(error)

  if (app.get('env') === 'development') {
    console.log(`Online server in http://${app.get('host')}:${app.get('port')}`);
  }
})