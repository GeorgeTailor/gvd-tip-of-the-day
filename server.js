import http from 'http';
import fs from 'fs';
const port = process.argv[2] || 9000;

http.createServer(function (req, res) {
	console.log(`${req.method} ${req.url}`);

	const pathname = '/index.html';
	fs.readFile(pathname, function (err, data) {
		res.end(data);
	});
}).listen(parseInt(port));

console.log(`Server listening on port ${port}`);