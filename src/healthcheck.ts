import http from "node:http";

const { PORT = "3000" } = process.env;
const port = Number.parseInt(PORT, 10) || 3000;

const exitUnhealthy = () => process.exit(1);

const request = http.request(
  {
    host: "127.0.0.1",
    port,
    path: "/healthz",
    timeout: 5_000,
  },
  (response) => {
    process.exit(response.statusCode === 200 ? 0 : 1);
  },
);

request.on("error", exitUnhealthy);
request.on("timeout", () => {
  request.destroy();
  exitUnhealthy();
});

request.end();
