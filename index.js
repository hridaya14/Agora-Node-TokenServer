const express = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 8080;
const APP_ID = String(process.env.APP_ID);
const APP_CERTIFICATE = String(process.env.APP_CERTIFICATE);

const app = express();
app.use(bodyParser.json());

const nocache = (req, resp, next) => {
  resp.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  resp.header('Expires', '-1');
  resp.header('Pragma', 'no-cache');
  next();
}

// Middleware to handle CORS preflight requests
const handleOptions = (req, resp, next) => {
  resp.header('Access-Control-Allow-Origin', '*');
  resp.header('Access-Control-Allow-Methods', 'GET,POST');
  resp.header('Access-Control-Allow-Headers', 'Content-Type');
  resp.status(200).end();
}

const generateAccessToken = (req, resp) => {
  resp.header('Access-Control-Allow-Origin', '*');
  
  const { channelName, uid, role, expireTime } = req.body;
  if (!channelName) {
    return resp.status(400).json({ 'error': 'Channel name is required' });
  }
  
  const roleValue = (role === 'publisher') ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
  const expireTimeValue = expireTime ? parseInt(expireTime, 10) : 3600;
  
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTimeValue;
 
  const token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, uid || 0, roleValue, privilegeExpireTime);
  
  return resp.json({ 'token': token });
}

app.options('/access_token', handleOptions);
app.post('/access_token', nocache, generateAccessToken);

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
