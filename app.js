const express = require('express');
const app = express();
const PORT = 3000;
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer({});
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken')

proxy.on('proxyReq', function(proxyReq, req, res, options) {
  proxyReq.setHeader('X-Special-Proxy-Header', 'Super Special Proxy Header Thing');
});



app.get('/api/login', async (req,res) => {
  const code = req.query.code;
  console.log(code);

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      client_id: `644408839831-00b0crm2af8o30hr55diqm36lfd0sv36.apps.googleusercontent.com`,
      client_secret: `sW-Omr2BCSnAjfWYa9KJDnGH`,
      redirect_uri: 'http://localhost:3000/api/login',
      grant_type: `authorization_code`,
    }),
  });

  const data = await response.json();
  
  const userInfo = jwt.decode(data.id_token);

  console.log(userInfo);

  res.status(201).json({ message: 'Logged In'});
});

app.use('/api/todo*', async (req, res, next) => {
	proxy.web(req, res, { target: 'http://localhost:3001/api/userboard/test' });
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))