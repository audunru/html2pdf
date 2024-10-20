import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";

import config from "./config";

enum MimeType {
  PDF = "application/pdf",
  JSON = "application/json",
}

export enum ReasonPhrases {
  BAD_REQUEST = "Bad Request",
  INTERNAL_SERVER_ERROR = "Internal Server Error",
}

export enum StatusCodes {
  OK = 200,
  BAD_REQUEST = 400,
  INTERNAL_SERVER_ERROR = 500,
}

interface RespondProps extends APIGatewayProxyStructuredResultV2 {
  contentType: MimeType;
  statusCode: StatusCodes;
}

const respond = ({
  body,
  contentType,
  statusCode,
  isBase64Encoded,
}: RespondProps): APIGatewayProxyStructuredResultV2 => ({
  statusCode,
  headers: {
    "Content-type": contentType,
    ...(config.ALLOW_ORIGIN && {
      "Access-Control-Allow-Origin": config.ALLOW_ORIGIN,
    }),
    ...(config.HSTS_HEADER && {
      "Strict-Transport-Security": config.HSTS_HEADER,
    }),
  },
  body,
  isBase64Encoded,
});

export const respondSuccess = (
  body: APIGatewayProxyStructuredResultV2["body"],
): APIGatewayProxyStructuredResultV2 =>
  respond({
    body,
    contentType: MimeType.PDF,
    statusCode: StatusCodes.OK,
    isBase64Encoded: true,
  });

export const respondError = (
  body: ReasonPhrases,
  statusCode: StatusCodes = StatusCodes.INTERNAL_SERVER_ERROR,
): APIGatewayProxyStructuredResultV2 =>
  respond({
    body,
    contentType: MimeType.JSON,
    statusCode,
  });
