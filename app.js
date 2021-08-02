const express = require('express');
const app = express();
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer({});
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken')
const cors = require('cors')
require('dotenv').config();

/*
proxy.on('proxyReq', function(proxyReq, req, res, options) {
  proxyReq.setHeader('X-Special-Proxy-Header', 'Super Special Proxy Header Thing');
});
*/

app.use(cors())

proxy.on('proxyReq', async function (proxyReq, req, res, options) {

  jwt.verify(
    req.headers['authorization'],
    process.env.JWT_SECRET_KEY,
    function (err, decoded) {
      if (err) {
        console.log(err)
        proxyReq.removeHeader('x-user-id')
      }
      else proxyReq.setHeader('x-user-id', decoded.user.email);
    }
  );

});

app.use('/api/todo*', async (req, res, next) => {
	proxy.web(req, res, { target: 'http://localhost:3001/api/userboard' });
});

app.get('/api/login', async (req,res) => {
  const code = req.query.code;
  console.log(code);

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'},
    body: JSON.stringify({
      code,
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      redirect_uri: 'http://localhost:3000/api/login',
      grant_type: `authorization_code`,
    }),
  });

  const data = await response.json();
  
  const userInfo = jwt.decode(data.id_token);

  console.log(userInfo);

  let token = jwt.sign({user: userInfo}, process.env.JWT_SECRET_KEY,{
    expiresIn: 60 * 60,
  })

  console.log(token)

  res.status(201).json({ message: 'Logged In'});
});


module.exports = app;