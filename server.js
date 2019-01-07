"use strict"

var http = require('http'),
    httpProxy = require('http-proxy');

// Load options for proxy server configurtion
var proxyOptions = {
    //////////////
    //   target : <url string to be parsed with the url module>
    target: 'http://127.0.0.1:5060',
    //   forward: <url string to be parsed with the url module>
    //   agent  : <object to be passed to http(s).request>
    //   ssl    : <object to be passed to https.createServer()>
    //   ws     : <true/false, if you want to proxy websockets>
    //   xfwd   : <true/false, adds x-forward headers>
    //   secure : <true/false, verify SSL certificate>
    //   toProxy: <true/false, explicitly specify if we are proxying to another proxy>
    //   prependPath: <true/false, Default: true - specify whether you want to prepend the target's path to the proxy path>
    //   ignorePath: <true/false, Default: false - specify whether you want to ignore the proxy path of the incoming request>
    //   localAddress : <Local interface string to bind for outgoing connections>
    //   changeOrigin: <true/false, Default: false - changes the origin of the host header to the target URL>
    //   preserveHeaderKeyCase: <true/false, Default: false - specify whether you want to keep letter case of response header key >
    //   auth   : Basic authentication i.e. 'user:password' to compute an Authorization header.
    //   hostRewrite: rewrites the location hostname on (301/302/307/308) redirects, Default: null.
    //   autoRewrite: rewrites the location host/port on (301/302/307/308) redirects based on requested host/port. Default: false.
    //   protocolRewrite: rewrites the location protocol on (301/302/307/308) redirects to 'http' or 'https'. Default: null.//
    //   NOTE: `options.ws` and `options.ssl` are optional.
    //    `options.target and `options.forward` cannot be
    //    both missing
    /////////////
};

// Create a proxy server with options
var proxy = httpProxy.createProxyServer();


// Register proxy event
proxy.on('proxyReq', function (proxyReq, req, res, options) {
    proxyReq.setHeader('X-Special-Proxy-Header', 'foobar');
});

proxy.on('proxyRes', function (proxyRes, req, res) {
    console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
});

proxy.on('error', function (err, req, res) {
    res.writeHead(500, {
        'Content-Type': 'text/plain'
    });

    res.end('Something went wrong. And we are reporting a custom error message.');
});

var server = http.createServer(function (req, res) {
    // You can define here your custom logic to handle the request
    // and then proxy the request.
    console.log(req.rawHeaders);
    proxy.web(req, res, proxyOptions);
});

console.log("listening on port 5050")
server.listen(5050);

//
// Create your target server
//
http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('request successfully proxied!' + '\n' + JSON.stringify(req.headers, true, 2));
    res.end();
}).listen(5060);
