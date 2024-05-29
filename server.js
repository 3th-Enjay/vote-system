const http = require('http');
const url = require('url');

let parties = []; // Simulate a database with an in-memory array

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;

    switch (path) {
        case '/parties':
            if (req.method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString(); // Convert Buffer to string
                });
                req.on('end', () => {
                    const partyName = JSON.parse(body).name;
                    if (!['APC', 'PDP', 'LP'].includes(partyName)) {
                        res.writeHead(400, {'Content-Type': 'text/plain'});
                        res.end('Invalid party name.');
                    } else {
                        parties.push({ name: partyName });
                        res.writeHead(201, {'Content-Type': 'text/plain'});
                        res.end('Party created successfully.');
                    }
                });
            } else if (req.method === 'GET') {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(parties));
            }
            break;
        case '/parties/:name':
            if (req.method === 'GET') {
                const party = parties.find(p => p.name === url.parse(req.url, true).pathname.split('/')[2]);
                if (party) {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify(party));
                } else {
                    res.writeHead(404, {'Content-Type': 'text/plain'});
                    res.end('Party not found.');
                }
            }
            break;
        case '/vote/:partyName':
            if (req.method === 'PUT') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString(); // Convert Buffer to string
                });
                req.on('end', () => {
                    const partyName = url.parse(req.url, true).pathname.split('/')[2];
                    const candidate = JSON.parse(body).candidate;
                    const party = parties.find(p => p.name === partyName);
                    if (party) {
                        console.log(`Voted for ${candidate} in ${party.name}`);
                        res.writeHead(200, {'Content-Type': 'text/plain'});
                        res.end('Vote cast successfully.');
                    } else {
                        res.writeHead(404, {'Content-Type': 'text/plain'});
                        res.end('Party not found.');
                    }
                });
            }
            break;
        case '/parties/:name':
            if (req.method === 'DELETE') {
                const partyIndex = parties.findIndex(p => p.name === url.parse(req.url, true).pathname.split('/')[2]);
                if (partyIndex!== -1) {
                    parties.splice(partyIndex, 1);
                    res.writeHead(200, {'Content-Type': 'text/plain'});
                    res.end('Party deleted successfully.');
                } else {
                    res.writeHead(404, {'Content-Type': 'text/plain'});
                    res.end('Party not found.');
                }
            }
            break;
        default:
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('Not Found');
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
