# html2pdf

Create PDFs from HTML using an Express server and Playwright running in a Docker container.

The `audunru/html2pdf` Docker image will give you a web server that accepts POST requests to the `/pdf` endpoint. The submitted HTML will be returned as a PDF.

Note that any resources referred to in the HTML (JavaScript, CSS, images) will need to be reachable from where the container is running.

## Running

### docker

```bash
docker run -d -p 3000:3000 --name html2pdf audunru/html2pdf
```

### docker compose

```yml
services:
  html2pdf:
    image: audunru/html2pdf
    container_name: html2pdf
    restart: always
    ports:
      - "3000:3000"
    environment:
      ALLOW_ORIGIN: "https://domain.com"
      HSTS_HEADER: "max-age=63072000; includeSubDomains; preload"
      JAVASCRIPT_ENABLED: true
      WAIT_UNTIL: "domcontentloaded"
      PDF_OPTIONS: "{'landscape':true}"
      PORT: "3000"
      PAYLOAD_LIMIT: "100000"
```

## Turning HTML into a PDF

This will produce a PDF with the text "Hello world" in it.

### curl

```sh
curl http://localhost:3000/pdf --output hello-world.pdf \
  -F "file=@-" <<< "<html><body><p>Hello world3</p></body></html>"
```

### JavaScript

```js
const formData = new FormData();
const html = "<html><body><p>Hello world</p></body></html>";
const blob = new Blob([html], { type: "text/html" });
formData.append("file", blob);

const response = await fetch("http://localhost:3000/pdf", {
  method: "POST",
  body: formData,
});
```

## Development

### Build Docker image

You can build the Docker image locally and run it like so:

```bash
docker build -t html2pdf .
docker stop html2pdf
docker rm html2pdf
docker run -d -p 3000:3000 --name html2pdf html2pdf
```
