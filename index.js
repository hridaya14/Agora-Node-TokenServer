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

const generateAccessToken = (req, resp) => {
  // set response header
  resp.header('Access-Control-Allow-Origin', '*');
  // get channel name and other parameters from the request body
  const { channelName, uid, role, expireTime } = req.body;
  if (!channelName) {
    return resp.status(400).json({ 'error': 'Channel name is required' });
  }
  // set default values if not provided
  const roleValue = (role === 'publisher') ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
  const expireTimeValue = expireTime ? parseInt(expireTime, 10) : 3600;
  // calculate privilege expire time
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTimeValue;
  // build the token
  const token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, uid || 0, roleValue, privilegeExpireTime);
  // return the token
  return resp.json({ 'token': token });
}

app.post('/access_token', nocache, generateAccessToken);

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
