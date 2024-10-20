# AWS Lambda PDF

An AWS Lambda function that will accept HTML as its input and return a PDF.

## Example

This will produce a PDF with the text "Hello world" in it:

```sh
curl https://your-lambda-url \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/pdf' \
  --data-raw $'{"html":"<html><body><p>Hello world</p></body></html>"}' \
  --output production.pdf
```

## Caveats

- JavaScript is disabled
- PDF generation occurs after [domcontentloaded](https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event)
- CSS must be embedded as style tags
