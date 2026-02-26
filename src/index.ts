import dotenv from 'dotenv';

dotenv.config();

// This is a main entry point for your AI application
async function main() {
  console.log('Welcome to AI Development Environment');
  console.log('=====================================');
  console.log('');
  console.log('Available examples:');
  console.log('1. ChatGPT Example: npm run chatgpt-example');
  console.log('2. Claude Example: npm run claude-example');
  console.log('');
  console.log('Setup Instructions:');
  console.log('1. Copy .env.example to .env');
  console.log('2. Add your API keys to .env');
  console.log('3. Run: npm install');
  console.log('4. Try the examples above');
}

main().catch(console.error);
