const request = require('request');

module.exports = async (req, res) => {
    let encryptedPath = req.url.split('?')[1];
    
    if (!encryptedPath) {
        // 암호화된 주소가 없으면 메인화면(index.html)을 보여줌
        const fs = require('fs');
        const path = require('path');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8'));
    }

    try {
        let base64 = encryptedPath.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) { base64 += '='; }
        const targetUrl = Buffer.from(base64, 'base64').toString('utf8');

        const proxyHeaders = { ...req.headers };
        delete proxyHeaders.host;
        delete proxyHeaders.connection;

        const proxyRequest = request({
            url: targetUrl,
            method: req.method,
            headers: proxyHeaders,
            followRedirect: true,
            strictSSL: false
        });

        proxyRequest.on('error', () => res.status(500).send('Proxy Connection Error'));
        req.pipe(proxyRequest).pipe(res);

    } catch (err) {
        res.status(400).send('Invalid Address');
    }
};
