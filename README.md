# AWS Lambda PDF

An AWS Lambda function that will accept HTML as its input and return a PDF.

## Installation

```sh
npm i aws-lambda-pdf
```

## Usage

We'll be using [Serverless](https://www.serverless.com/framework/docs/getting-started) to deploy the function, so make sure you set up AWS credentials first.

Create a [serverless.yml](example/serverless.yml) file in the same folder as your package.json where you installed `aws-lambda-pdf`, then run:

```
npx serverless deploy
```

## Test

This will produce a PDF with the text "Hello world" in it:

```sh
curl https://replace-with-your-url.execute-api.us-east-1.amazonaws.com/dev/pdf \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/pdf' \
  --data-raw $'{"html":"<html><body><p>Hello world</p></body></html>"}' \
  --output hello-world.pdf
```
