# AI Development Environment

Node.js development environment with ChatGPT and Claude API integration.

## Features

- **ChatGPT Integration**: Use OpenAI's GPT models via the OpenAI API
- **Claude Integration**: Use Anthropic's Claude models via the Anthropic API  
- **TypeScript Support**: Full TypeScript configuration for type-safe development
- **Environment Configuration**: Secure API key management with `.env` files

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Keys

Copy `.env.example` to `.env` and add your API keys:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 3. Run Examples

**ChatGPT Example:**
```bash
npm run chatgpt-example
```

**Claude Example:**
```bash
npm run claude-example
```

## Development

Build TypeScript:
```bash
npm run build
```

Run in development mode:
```bash
npm run dev
```

## Project Structure

```
src/
├── index.ts                 # Main entry point
└── examples/
    ├── chatgpt-example.ts   # ChatGPT API usage example
    └── claude-example.ts    # Claude API usage example
```

## API Documentation

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic Claude API Documentation](https://docs.anthropic.com)

## Getting API Keys

- **OpenAI**: Visit [OpenAI Platform](https://platform.openai.com/api-keys)
- **Anthropic**: Visit [Anthropic Console](https://console.anthropic.com)

## License

MIT
