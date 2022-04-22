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
```

## Dev
Server made with typescript and compiled in an exe file with pkg.  
install dependencies : `npm i`  
start the server : `npm start`. If you want to give some parameters you can do so : `npm start -- -s -p 9090`  
build executables : `npm run build`

### TODO list
- add ngrok (and maybe other) over internet proxy

# FAQ
- Why my client websocket connection fail without error message?  
By default, most navigator will refuse connection for your websocket server if he have a self signed certificate (which is what we do with -s parameter). You will have an error message like this: `WebSocket connection to 'wss://localhost:8081/' failed: ` (for google). To fix that issue, visit https://localhost:8081 and accept the certificate. This solution is good for developpement but not for production.  
To avoid this error in production, you can generate a certificate from a certificate Authority (Let's encrypt is a free solution for this). This solution work for url with domain name and not for localhost. If your production environnement is on localhost anyway, you can use ngrok (https://ngrok.com/) to create a public url over your localhost which will be an url with a valid certificate. With ngrok, this is how you request will go : `client -> ngrok url -> localhost proxy -> endpoint`. To run ngrok on the proxy, do `ngrok http https://localhost:8081` and from your client, reach the ngrok url like this `wss://17f8-87-231-70-63.ngrok.io/`.