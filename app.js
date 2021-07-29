const express = require('express');
const app = express();
const PORT = 3000;
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer({});

proxy.on('proxyReq', function(proxyReq, req, res, options) {
  proxyReq.setHeader('X-Special-Proxy-Header', 'Super Special Proxy Header Thing');
});

app.use('/api/todo*', async (req, res, next) => {
	proxy.web(req, res, { target: 'http://localhost:3001/api/userboard/test' });
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))