# AWS Lambda PDF

An AWS Lambda function that will accept HTML as its input and return a PDF.

This is a work in progress.

## Example

This will produce a PDF with the text "Hello world" in it:

```sh
curl https://your-lambda-url \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/pdf' \
  --data-raw $'{"html":"<html><body><p>Hello world</p></body></html>"}' \
  --output production.pdf
```
