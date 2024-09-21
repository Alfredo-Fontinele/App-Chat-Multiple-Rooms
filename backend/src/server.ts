import { App } from "./app"

const app = new App()

const PORT = 4444

app.server.listen(PORT, () => {
  console.log(`\nServer is running in http://localhost:${PORT}\n`)
})
