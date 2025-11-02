# Thise - AI Image Analysis Tool

A secure React application for analyzing images using Google's Gemini AI API.

## Features

- 🖼️ **Secure Image Upload** with comprehensive validation
- 🤖 **AI-Powered Analysis** using Google Gemini API
- 🔒 **Security-First** approach with environment variables
- 📱 **Responsive Design** with dark theme
- ⚡ **Performance Optimized** with code splitting
- 🛡️ **Type Safe** with comprehensive TypeScript support

## Security Features

- ✅ API keys stored in environment variables
- ✅ File upload validation (type, size, name security)
- ✅ XSS protection headers
- ✅ Input sanitization and validation
- ✅ Error handling without information leakage
- ✅ Content Security Policy ready

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

1. Clone the repository:
```bash
git clone https://github.com/csa09299-coderwe/thise.git
cd thise
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your Gemini API key in `.env`:
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

5. Start the development server:
```bash
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Required
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Optional (with defaults)
VITE_MAX_FILE_SIZE=10485760          # 10MB
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Security Considerations

### API Key Management
- Never commit API keys to version control
- Use environment variables for sensitive data
- Rotate API keys regularly

### File Upload Security
- File type validation (whitelist approach)
- File size limits
- Filename sanitization
- Timeout protection for file processing

### Production Deployment
- Enable HTTPS
- Configure proper CSP headers
- Use reverse proxy for additional security
- Monitor for suspicious activity

## Project Structure

```
thise/
├── components/          # React components
│   ├── Header.tsx
│   ├── ImageUpload.tsx
│   ├── PromptInput.tsx
│   ├── ResultCard.tsx
│   └── Loader.tsx
├── services/           # API services
│   └── geminiService.ts
├── types.ts           # TypeScript type definitions
├── App.tsx            # Main application component
├── dark.css           # Application styles
└── vite.config.ts     # Vite configuration
```

## Error Handling

The application implements comprehensive error handling:

- **Validation Errors**: User input validation failures
- **API Errors**: Gemini API communication issues
- **File Upload Errors**: File processing failures
- **Network Errors**: Connection and timeout issues

## Performance Optimizations

- Code splitting for vendor libraries
- Image optimization and lazy loading
- Memory leak prevention
- Efficient state management
- Production build optimizations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Security Issues

For security concerns, please create a private issue or contact the maintainer directly.

## Changelog

### v0.1.0
- Initial release with secure image analysis
- Comprehensive security fixes
- Production-ready configuration