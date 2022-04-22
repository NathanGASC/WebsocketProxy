# Websocket proxy
Is a server which handle and proxy websockets to a given endpoint.

## How to use
Download the latest release for your OS from github and launch the executable file.

### Arguments
You can run the executable with arguments using bash/terminal. To do so execute `websocketproxy-win.exe -s --port 8085 --e wss://localhost:8081`
```
-e --endpoint : the url which will receive all forward socket (default: ws://localhost:8081)
-p --port : the port of the proxy server (default: 8080)
-s --secure : generate autosigned certificate to run the server on wss instead of ws
-t --tunnel : create a tunnel which you can use to access the proxy from internet. Go on http(s)://localhost:[port] to see the tunnel url
```

## Dev
Server made with typescript and compiled in an exe file with pkg.  
install dependencies : `npm i`  
start the server : `npm start`. If you want to give some parameters you can do so : `npm start -- -s -p 9090`  
build executables : `npm run build`