import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import {
  DocumentInitParameters,
  PDFDataRangeTransport,
  TextItem,
  TypedArray,
} from "pdfjs-dist/types/src/display/api";

export const getPdfText = async (
  src: string | TypedArray | DocumentInitParameters | PDFDataRangeTransport,
): Promise<string> => {
  const pdf = await getDocument(src).promise;

  const pageNumberList = Array.from({ length: pdf.numPages }, (_, i) => i + 1);

  const pageList = await Promise.all(pageNumberList.map((i) => pdf.getPage(i)));

  const textList = await Promise.all(pageList.map((p) => p.getTextContent()));

  return textList
    .map(({ items }) => (items as TextItem[]).map(({ str }) => str).join(""))
    .join("");
};
