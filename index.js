'use strict';

const line = require('@line/bot-sdk');
const express = require('express');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET 
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

  if (req.body.destination) {
    console.log("Destination User ID: " + req.body.destination);
  }

  // req.body.events should be an array of events
  if (!Array.isArray(req.body.events)) {
    return res.status(500).end();
  }
  
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
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
  
  if (event.replyToken === '00000000000000000000000000000000' ||
    event.replyToken === 'ffffffffffffffffffffffffffffffff') {
    return;
  }

  // create a echoing text message
  let echo =  { type: 'text', text: event.message.text };
  if(event.message.text == 'shop')
  {
    echo = { type: 'text', text: 'https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=1650015373&redirect_uri=https%3A%2F%2Foperation.dev.movefast.me%2Fline%2Fcallback&state=login&scope=profile%20openid&nonce=movefast_shop'}
  }

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});