# html2pdf

Create PDFs using an Express server and Playwright running in a Docker container

## Running

### docker

*todo*

### docker compose

*todo*

## Development

### Build Docker image

You can build the Docker image locally and run it like so:

```bash
docker build -t playwright-pdf .
docker stop playwright-pdf
docker rm playwright-pdf
docker run -d -p 3000:3000 --name playwright-pdf playwright-pdf
```

This will produce a PDF with the text "Hello world" in it:

```sh
curl http://localhost:3000/pdf \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/pdf' \
  --data-raw $'{"html":"<html><body><p>Hello world</p></body></html>"}' \
  --output hello-world.pdf
```
