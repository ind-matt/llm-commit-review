# LLM Commit Reviewer

Designed to enhance your project's security by analyzing committed files for potential security issues before they make it into your codebase. Leveraging the power of LLM embeddings and OpenAI's GPT API, this tool automatically scans your commits, identifies vulnerabilities, and provides you with a detailed security report.

## Features

- **Automatic File Collection**: Collects files staged for commit.
- **LLM Embeddings**: Embeds collected files using language model embeddings, storing results in a vector database for efficient analysis.
- **OpenAI GPT Analysis**: Analyzes embedded files using OpenAI's GPT API to detect potential security vulnerabilities.
- **Security Reporting**: Generates a report detailing any discovered security issues, allowing for immediate action.

## Prerequisites

Before you begin, ensure you have the following:
- Node.js installed on your machine.
- An OpenAI API key.

## Installation

1. **Install the Package**:
   ```bash
   npm install llm-commit-review --save-dev

2. **Environment Configuration**:
Create a .env file in the root of your project and add your OpenAI API key:
    ```env
    OPENAI_KEY=your_openai_api_key_here

2. **Pre-commit Hook Setup**:
Install husky to manage Git hooks:
    ```bash
    npm install husky --save-dev
3. **Enable Git hooks with Husky**:

    ```bash
    npx husky init
   
4. **Add a pre-commit hook to run the Security Analysis Tool**:

    ```bash
    npx husky add .husky/pre-commit "npm run llm-commit-review"
   
5. **In your package.json, add a script to trigger the tool**:

    ```json
    "scripts": {
        "llm-commit-review": "node node_modules/llm-commit-review/src/server.mjs"
    }
   
## Usage
Once installed and configured, the analysis tool will automatically run every time you attempt to make a commit, analyzing any staged files for security vulnerabilities. If any issues are detected, the commit will be halted, and a report will be generated for review, ensuring that potential security risks are addressed promptly.


## License
This project is licensed under the MIT License.