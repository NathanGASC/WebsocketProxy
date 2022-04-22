# Websocket proxy
Is a server which handle et proxy websockets to a given endpoint.

## How to use
Download the latest release for your OS from github and launch the executable file.

### Arguments
* -e --endpoint : the url which will receive all forward socket (default: ws://localhost:8081)
* -p --port : the port of the proxy server (default: 8080)
* -s --secure : generate autosigned certificate to run the server on wss instead of ws

## Dev
Server made with typescript and compiled in an exe file with pkg.  
install dependencies : `npm i`  
start the server : `npm start`. If you want to give some parameters you can do so : `npm start -- -s -p 9090`  
build executables : `npm run build`