import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";

import config from "./utils/config";
import { getPdf } from "./utils/pdf";
import { downloadRequestSchema } from "./utils/request";
import {
  ReasonPhrases,
  respondError,
  respondSuccess,
  StatusCodes,
} from "./utils/response";

type PdfEvent = Pick<APIGatewayProxyEventV2, "body">;

export const handler = async (
  event: PdfEvent,
): Promise<APIGatewayProxyStructuredResultV2> => {
  const { body = "" } = event;

  const request = downloadRequestSchema.safeParse(body);

  if (!request.success) {
    return respondError(ReasonPhrases.BAD_REQUEST, StatusCodes.BAD_REQUEST);
  }

  try {
    const pdf = await getPdf(request.data.html, {
      javaScriptEnabled: config.JAVASCRIPT_ENABLED,
      waitUntil: config.WAIT_UNTIL,
      pdfOptions: config.PDF_OPTIONS,
    });

    return respondSuccess(pdf);
  } catch (error) {
    console.error(error);

    return respondError(
      ReasonPhrases.INTERNAL_SERVER_ERROR,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};
