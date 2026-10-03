import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

import * as pdfParseModule from 'pdf-parse';
const pdfParse = (pdfParseModule as any).default || pdfParseModule;

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '20mb' }));

// Server-Side Gemini & Local PDF Text Extraction Route
app.post('/api/extract', async (req, res) => {
  const { fileName, docCategory, rawTextContent, fileBase64, mimeType } = req.body;

  let extractedPdfText = '';

  // Extract actual text content from PDF buffer if Base64 buffer provided
  if (fileBase64 && (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf'))) {
    try {
      const pdfBuffer = Buffer.from(fileBase64, 'base64');
      const pdfData = await pdfParse(pdfBuffer);
      extractedPdfText = (pdfData.text || '').trim();
    } catch (err: any) {
      console.warn(`[PDF Text Extraction Notice]: Could not parse PDF text stream for ${fileName}:`, err?.message);
    }
  }

  const combinedText = `${extractedPdfText} ${rawTextContent || ''}`.trim();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.json({
      success: true,
      mode: 'GEMINI_UNAVAILABLE',
      extraction: null,
      extractedPdfText,
      message: 'GEMINI_API_KEY unconfigured. Operating in Local PDF Text Rule Mode.',
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an expert Indian Government Procurement & GeM Bid Document Compliance Analyzer for CGPDTM / GeM Portal.
Analyze the attached document carefully and extract structured statutory fields.

File Name: ${fileName}
Category Hint: ${docCategory || 'Unknown'}
Raw Text Snippet: ${combinedText.slice(0, 2000) || 'None'}

Rules for Extraction:
1. ONLY extract information that is explicitly present in the document.
2. Return null for any field that is NOT present in the document. NEVER invent or fabricate missing values.
3. Classify documentType as one of: ["GST_CERTIFICATE", "PAN_CARD", "UDYAM_MSME", "MAKE_IN_INDIA_DECLARATION", "OEM_AUTHORIZATION", "EPFO_ESIC", "INCOME_TAX_ITR", "STARTUP_INDIA", "NSIC_CERTIFICATE", "OTHER_TENDER_DOC"].
4. Extract the verbatim evidenceText excerpt from the document supporting your findings.
5. If page number is explicitly known, set pageNumber as integer (1-indexed). Otherwise set pageNumber as null.

Output JSON format strictly without markdown backticks:
{
  "documentType": "GST_CERTIFICATE",
  "entityName": "Legal name of bidder/entity or null",
  "gstin": "15-character GSTIN or null",
  "pan": "10-character PAN or null",
  "udyamNumber": "UDYAM registration number or null",
  "localContentPercentage": null,
  "expiryDate": "YYYY-MM-DD or null",
  "evidenceText": "Verbatim excerpt from document or null",
  "pageNumber": null,
  "confidence": 0.95
}`;

    let contents: any = prompt;

    if (fileBase64 && mimeType) {
      contents = [
        prompt,
        {
          inlineData: {
            mimeType: mimeType,
            data: fileBase64,
          },
        },
      ];
    }

    const generateWithTimeout = async (model: string, timeoutMs: number = 12000) => {
      return Promise.race([
        ai.models.generateContent({
          model,
          contents,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Gemini model ${model} request timed out after ${timeoutMs / 1000}s`)), timeoutMs)
        ),
      ]);
    };

    const response = await generateWithTimeout('gemini-3.8-flash', 15000);

    const responseText = response.text || '';
    const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    let parsed: any = null;

    try {
      parsed = JSON.parse(cleanedJson);
    } catch {
      parsed = null;
    }

    if (!parsed) {
      return res.json({
        success: true,
        mode: 'EXTRACTION_FAILED',
        extraction: null,
        extractedPdfText,
        message: 'Gemini generated non-JSON or unparseable output.',
      });
    }

    return res.json({
      success: true,
      mode: 'GEMINI_SUCCESS',
      extraction: {
        ...parsed,
        sourceDocument: fileName,
        pageNumber: parsed.pageNumber || null,
      },
      extractedPdfText,
    });
  } catch (error: any) {
    console.error('[Gemini Extraction API Notice]:', error?.message || error);
    return res.json({
      success: false,
      mode: 'GEMINI_UNAVAILABLE',
      extraction: null,
      extractedPdfText,
      error: error?.message || 'Gemini API call returned quota limit or error',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[BidSure GeM Platform Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
