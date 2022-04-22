import path from 'path';
import { createServer } from 'https';
import { readFileSync } from 'fs';
import { WebSocket, WebSocketServer } from 'ws';
import ChildProcess, { execSync } from "child_process";
import fs from "fs";
import fse from 'fs-extra';
import localtunnel from "localtunnel"

/**
 * -e --endpoint : the url which will receive all forward socket (default: ws://localhost:8081)
 * -p --port : the port of the proxy server (default: 8080)
 * -s --secure : generate autosigned certificate to run the server on wss instead of ws
 * -t --tunnel : open the server proxy to internet
 */
let e = "ws://localhost:8081";
let p = "8080";
let s = false;
let t = false;

const opensslPathVirtual = path.join(__dirname, "/../OpenSSL-Win64/bin/openssl.exe");
const opensslPathVirtualFullDirectory = path.join(__dirname, "/../OpenSSL-Win64");
const opensslPathReal = path.join(process.cwd(), "/OpenSSL-Win64/bin/openssl.exe");
const opensslPathRealFullDirectory = path.join(process.cwd(), "/OpenSSL-Win64");

const logPath = path.join(process.cwd(), "./log.txt");
const certPath = path.join(process.cwd(), './cert.pem');
const keyPath = path.join(process.cwd(), './key.pem');
try {
    process.argv.forEach((arg, i) => {
        switch (arg) {
            case "-p":
            case "--port":
                p = process.argv[i + 1] || p;
                break;
            case "-e":
            case "--endpoint":
                e = process.argv[i + 1] || e;
                break;
            case "-s":
            case "--secure":
                s = true;
                break;
            case "-t":
            case "--tunnel":
                t = true;
                break;
            default:
                break;
        }
    })

    //if don't exist, it's mean we are in pkg exe file
    if (!fs.existsSync(opensslPathReal)) {
        if (s) {
            log("Create openssl folder")
            try {
                fse.copySync(opensslPathVirtualFullDirectory, opensslPathRealFullDirectory, { overwrite: true });
            } catch (e) {
                log("ERROR: error on openssl folder creation", e);
            }
        }
    }

    if (s) {
        generatePem();
    }
    start();

    async function start() {
        let conf = {}

        let tunnel: localtunnel.Tunnel;
        if (t) {
            try {
                tunnel = await localtunnel(parseInt(p), {
                    local_https: s ? true : false,
                    allow_invalid_cert: true
                });
                log("tunnel open on", tunnel.url);
            } catch (e) {
                log("ERROR: (localtunnel) can't create tunnel");
            }
        }

        conf = {}
        if (s) {
            conf = {
                cert: readFileSync(certPath),
                key: readFileSync(keyPath),
            };
        }

        const server = createServer(conf, (req, res) => {
            if (req.method == "GET") {
                res.end(JSON.stringify({ tunnel: tunnel.url }));
            }
        });

        const wss = new WebSocketServer({ server });
        let id = 0;

        wss.on('connection', function connection(ws) {
            const socket = new WebSocket(e);
            const socketID = "@" + id++;
            socket.addEventListener("error", (e) => {
                log(socketID, "on error :", e.message)
                ws.close(4000, `The proxy can't reach the endpoint ${e.message}.`);
            })

            ws.on('message', (data) => {
                log(socketID, "forward message :", data.toString("utf-8"))
                socket.send(data.toString("utf-8"));
            });

            ws.on('close', (code, reason) => {
                log(socketID, "forward close :", code, ":", reason.toString("utf-8"))
                try {
                    socket.close();
                } catch (e: any) {
                    log(`ERROR: socket closed with an error ${id} : ${e}`)
                }
            });

            ws.on('error', (args) => {
                log(socketID, "on error :", args)
            });

            ws.on('ping', (data) => {
                log(socketID, "forward ping :", data.toString("utf-8"))
                socket.ping(data.toString("utf-8"));
            })

            ws.on('pong', (data) => {
                log(socketID, "forward pong :", data.toString("utf-8"))
                socket.pong(data.toString("utf-8"));
            })

            ws.on('unexpected-response', (req, res) => {
                log(socketID, "on error (unexpected-response):", req, res)
                console.error("ERROR (unexpected-response):", req, res);
            })

            ws.on("upgrade", (req) => {
                log(socketID, "forward upgrade", req)
                socket.send(req);
            })
        });

        server.listen(p, () => {
            let logMsg = `Proxy run on port 'ws://localhost:${p}' and will forward sockets to '${e}'`;
            if (s) logMsg = logMsg.replace("ws://", "wss://");
            log(logMsg);
        });
    }

    function generatePem() {
        var isWin = process.platform === "win32";

        if (isWin) {
            log("start certificate generation...")
            const cmd = ChildProcess.spawnSync(opensslPathReal, [
                "req",
                "-x509",
                "-nodes",
                "-new",
                "-keyout",
                keyPath,
                "-out",
                certPath,
                "-days",
                "365",
                "-subj",
                "/C=aa/ST=aa/L=aa/O=aa/OU=aa/CN=aa"
            ], {
                "stdio": "pipe"
            });

            try {
                log(cmd.stdout.toString("utf-8"));
                log(cmd.stderr.toString("utf-8"));
            } catch (e) {
                console.log(cmd, e)
            }
        } else {
            log("start certificate generation...")
            ChildProcess.spawnSync("openssl", [
                "req",
                "-x509",
                "-nodes",
                "-new",
                "-keyout",
                keyPath,
                "-out",
                certPath,
                "-days",
                "365",
                "-subj",
                "/C=aa/ST=aa/L=aa/O=aa/OU=aa/CN=aa"
            ], {
                "stdio": "pipe"
            });
        }

        if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
            log("certificate generated successfully");
        } else {
            log("ERROR: an error occured during certificate generation");
            while (true) {

            }
        }
    }
} catch (e) {
    log("Unhandled exception:", e)
}

function log(...msg: any[]) {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();
    console.log(`${year}/${month}/${day} ${h}:${m}:${s}     `, ...msg);
    fs.appendFileSync(logPath, `${year}/${month}/${day} ${h}:${m}:${s}      ${msg.join(" ")} \n`, {})
}