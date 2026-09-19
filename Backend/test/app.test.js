// Dummy values so the app can load without a real .env (these tests never call Gemini)
process.env.GOOGLE_GENAI_API_KEY ??= "test-key"
process.env.JWT_SECRET ??= "test-secret"

const { test, before, after } = require("node:test")
const assert = require("node:assert")
const app = require("../src/app")

let server
let baseUrl

before(async () => {
    server = app.listen(0) // port 0 = any free port
    await new Promise((resolve) => server.once("listening", resolve))
    baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(() => {
    server.closeAllConnections()
    server.close()
})

test("register rejects a request with missing fields", async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "someone@example.com" })
    })

    assert.strictEqual(res.status, 400)
})

test("interview routes reject requests without a login token", async () => {
    const res = await fetch(`${baseUrl}/api/interview/`)

    assert.strictEqual(res.status, 401)
})