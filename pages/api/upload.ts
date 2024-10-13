import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm();
    form.uploadDir = path.join(process.cwd(), 'uploads');
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Error parsing form data' });
      }

      const file = files.file as formidable.File;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      try {
        let text = '';
        if (path.extname(file.originalFilename || '').toLowerCase() === '.pdf') {
          const dataBuffer = fs.readFileSync(file.filepath);
          const pdfData = await pdf(dataBuffer);
          text = pdfData.text;
        } else {
          text = fs.readFileSync(file.filepath, 'utf8');
        }

        // Here you would typically process the text, store it in a database, etc.
        // For this example, we'll just send it back in the response
        res.status(200).json({ message: 'File uploaded and processed successfully', text });
      } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ error: 'Error processing file' });
      } finally {
        // Clean up the uploaded file
        fs.unlinkSync(file.filepath);
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}