import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { message, mode, model } = req.body;

      let response;
      if (model === 'gemini-pro') {
        const genModel = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await genModel.generateContent(message);
        response = result.response.text();
      } else {
        const completion = await openai.createChatCompletion({
          model: model,
          messages: [
            { role: "system", content: `You are in ${mode} mode. Adjust your responses accordingly.` },
            { role: "user", content: message }
          ],
        });
        response = completion.data.choices[0].message?.content;
      }

      res.status(200).json({ response });
    } catch (error) {
      res.status(500).json({ error: 'Error processing your request' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}