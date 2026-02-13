const http = require('http');
const url = require('url');
const path = require('path');
const PatientDao = require('./modules/patientDao');

class Server {
    constructor(port, origin) {
        this.port = port;
        this.origin = origin ?? "*";
        this.dao = new PatientDao();
    }

    start() {
        const instance = http.createServer((req, res) => { this.onReq(req, res) });
        instance.listen(this.port, "0.0.0.0");
        console.log(`Server running on http://localhost:${this.port}`);
    }

    async onReq(req, res) {

        res.setHeader("Access-Control-Allow-Origin", this.origin)

        switch (req.method) {
            case "OPTIONS":
                this.handleOptions(req, res)
                break;
            case "GET":
                await this.handleGet(req, res)
                break;
            case "POST":
                await this.handlePost(req, res)
                break;
            case "DELETE":
                await this.dao.deleteTable() //todo DELETE THIS
                break;
            default:
                res.writeHead(405, { 'Allow': 'GET, POST' });
        }

        return res.end();
    }

    handleOptions(req, res) {
        if (req["access-control-request-method"]) {
            res.writeHead(204, { "Access-Control-Allow-Methods": "POST, GET" });
        }
    }

    async handleGet(req, res) {
        try {
            const parsedUrl = url.parse(req.url, true)
            const query = decodeURIComponent(path.basename(parsedUrl.pathname))
            const [rows] = await this.dao.getPatients(query.replace(/^["'](.*)["']$/, '$1'))
            const body = JSON.stringify(rows)
            res.writeHead(200, "OK", { "Content-Type": "application/json", "Content-Length": body.length });
            res.write(body)
        }
        catch (e) {
            if (e.errno) {
                res.writeHead(400, `SQL Error: ${e.sqlMessage}`, { 'Content-Type': 'text/html' });
            } else {
                res.writeHead(500, `Unknown server error`, { 'Content-Type': 'text/html' });
            }
            console.error(e)
        }
    }

    async handlePost(req, res) {
        const stream = new Promise((rs, rj) => {
            let body = "";

            req.on('data', chunk => {
                body += chunk;
            });

            req.on('end', async () => {
                rs(body)
            });

            req.on('error', err => {
                rj(err)
            })
        })

        await stream.then(
            async (body) => {
                try {
                    const parsedData = JSON.parse(body);
                    const formatedData = parsedData.map((entry) => {
                        if (!(entry.name && entry.dateOfBirth)) {
                            throw new SyntaxError("Missing fields in request");
                        }
                        return [entry.name, entry.dateOfBirth]
                    })
                    await this.dao.insertPatients([formatedData])
                    res.writeHead(200, `OK`);
                } catch (e) {
                    if (e.errno) {
                        res.writeHead(400, `SQL Error: ${e.sqlMessage}`, { 'Content-Type': 'text/html' });
                    } else if (e instanceof SyntaxError) {
                        res.writeHead(400, `Bad request format`, { 'Content-Type': 'text/html' });
                    } else {
                        res.writeHead(500, `Unknown server error`, { 'Content-Type': 'text/html' });
                    }
                    console.error(e)
                }
            },
            (e) => {
                res.writeHead(500, `Unknown server error`, { 'Content-Type': 'text/html' });
                console.error(e);
            })
    }
}

new Server(80).start();