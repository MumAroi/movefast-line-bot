'use strict';

const line = require('@line/bot-sdk');
const express = require('express');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: 'ECrceNAPz9o/sTtGoslmzNOQVNMN+8TkfedGMCz9FLIFijyT4ykwXFSQ6xd9g7WgCw6wG1NYZxAQLAAajRJNmrTtInWOBgSNROJO3GpjTIQIoIpAoPJm8xkXvzQly/J49U/0rByUFCDXrQ5Z9PUlwdB04t89/1O/w1cDnyilFU=',
  channelSecret: 'fb24bc53fffdcecfbb119f5d1cc5cc98',
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

app.get('/', (req,res)=>{
  res.send('<h1>This is homepage.</h1>');
});


// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => {
      line.middleware(config)
      return res.json(result)
    })
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  // create a echoing text message
  const echo = { type: 'text', text: event.message.text };

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});