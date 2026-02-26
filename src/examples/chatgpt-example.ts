import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

async function chatgptExample() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set in .env file');
  }

  const client = new OpenAI({ apiKey });

  try {
    const message = await client.messages.create({
      model: 'gpt-3.5-turbo',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: 'What is Node.js and how can it be used with AI APIs?',
        },
      ],
    });

    console.log('ChatGPT Response:');
    console.log('================');
    if (message.content[0].type === 'text') {
      console.log(message.content[0].text);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
  }
}

chatgptExample();
