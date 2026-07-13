'use strict';

const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extracts printable ASCII characters from old Word binary format (.doc).
 * 
 * @param {Buffer} buffer 
 * @returns {string}
 */
function extractDocText(buffer) {
  const text = buffer.toString('binary');
  const clean = text.replace(/[^ -~\n\r\t]/g, ' ');
  return clean.replace(/\s+/g, ' ').trim();
}

/**
 * Extracts raw string text from PDF, DOC, and DOCX files.
 * 
 * @param {string} filePath 
 * @param {string} mimeType 
 * @returns {Promise<string>}
 */
async function extractTextFromFile(filePath, mimeType) {
  if (!fs.existsSync(filePath)) {
    throw new Error('File not found for extraction: ' + filePath);
  }

  const buffer = fs.readFileSync(filePath);

  if (mimeType === 'application/pdf' || filePath.toLowerCase().endsWith('.pdf')) {
    const data = await pdfParse(buffer);
    return data.text || '';
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    filePath.toLowerCase().endsWith('.docx')
  ) {
    const data = await mammoth.extractRawText({ buffer });
    return data.value || '';
  } else if (
    mimeType === 'application/msword' ||
    filePath.toLowerCase().endsWith('.doc')
  ) {
    return extractDocText(buffer);
  }

  throw new Error('Unsupported file format. Please upload PDF, DOC, or DOCX.');
}

module.exports = { extractTextFromFile };
