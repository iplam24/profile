import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 4173);

app.use(
  '/vnua-api',
  createProxyMiddleware({
    target: 'https://daotao.vnua.edu.vn',
    changeOrigin: true,
    secure: true,
    pathRewrite: {
      '^/vnua-api': '',
    },
    onProxyReq: (proxyReq) => {
      proxyReq.setHeader('origin', 'https://daotao.vnua.edu.vn');
      proxyReq.setHeader('referer', 'https://daotao.vnua.edu.vn/');
      proxyReq.setHeader('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36');
    },
  })
);

const distDir = path.join(__dirname, 'dist');
app.use(express.static(distDir));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Web thong tin + proxy dang chay tai http://localhost:${PORT}`);
});
