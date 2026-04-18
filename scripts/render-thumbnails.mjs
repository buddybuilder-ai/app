#!/usr/bin/env node
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises"
import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join, extname, basename } from "node:path"
import http from "node:http"
import puppeteer from "puppeteer"

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, "..")
const MODELS_DIR = join(PROJECT_ROOT, "public", "furniture_models")
const OUT_DIR = join(PROJECT_ROOT, "public", "furniture_thumbnails")
const HTML_FILE = join(__dirname, "render-thumbnails.html")

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
}

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url, "http://localhost")
        let path
        if (url.pathname === "/" || url.pathname === "/index.html") {
          path = HTML_FILE
        } else if (url.pathname.startsWith("/furniture_models/")) {
          path = join(PROJECT_ROOT, "public", url.pathname)
        } else {
          res.writeHead(404)
          res.end()
          return
        }
        const data = await readFile(path)
        const ext = extname(path).toLowerCase()
        res.writeHead(200, {
          "Content-Type": MIME[ext] ?? "application/octet-stream",
          "Access-Control-Allow-Origin": "*",
        })
        res.end(data)
      } catch (err) {
        res.writeHead(500)
        res.end(String(err))
      }
    })
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address()
      resolve({ server, port })
    })
  })
}

async function main() {
  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true })

  const entries = await readdir(MODELS_DIR)
  const models = entries.filter((f) => f.toLowerCase().endsWith(".glb"))
  console.log(`found ${models.length} models`)

  const { server, port } = await startServer()
  console.log(`static server on http://127.0.0.1:${port}`)

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-webgl",
      "--enable-unsafe-webgpu",
      "--ignore-gpu-blocklist",
      "--enable-features=Vulkan",
    ],
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 512, height: 512, deviceScaleFactor: 2 })
  page.on("pageerror", (err) => console.error("page error:", err.message))
  page.on("console", (msg) => {
    if (msg.type() === "error") console.error("console:", msg.text())
  })
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle0" })
  await page.waitForFunction("window.__ready === true", { timeout: 30000 })

  let ok = 0, fail = 0
  for (const model of models) {
    const name = basename(model, ".glb")
    const outPath = join(OUT_DIR, `${name}.png`)
    try {
      const dataUrl = await page.evaluate(
        (url) => window.renderThumbnail(url),
        `/furniture_models/${model}`
      )
      const b64 = dataUrl.split(",")[1]
      await writeFile(outPath, Buffer.from(b64, "base64"))
      console.log(`  ✓ ${name}.png`)
      ok++
    } catch (err) {
      console.error(`  ✗ ${name}: ${err.message}`)
      fail++
    }
  }

  await browser.close()
  server.close()
  console.log(`\ndone — ${ok} rendered, ${fail} failed`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
