# FileTools

A powerful, browser-based file utility application for working with images and PDFs — no uploads, no servers, all processing happens locally in your browser.

## Features

### Image Tools
- **Image Compress** – Reduce image file size while preserving quality
- **Image Resize** – Resize images to custom dimensions
- **Image Crop** – Crop images to a desired area
- **Image Convert** – Convert images between formats (PNG, JPEG, etc.)
- **Image to PDF** – Convert one or more images into a single PDF document

### PDF Tools
- **PDF Merge** – Combine multiple PDF files into one
- **PDF Split** – Split a PDF into individual pages or ranges
- **PDF Compress** – Reduce PDF file size
- **PDF to Image** – Export PDF pages as images

## Tech Stack

- **[React](https://react.dev/)** – UI library
- **[TypeScript](https://www.typescriptlang.org/)** – Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** – Fast build tool and dev server
- **[Tailwind CSS](https://tailwindcss.com/)** – Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** – Accessible component library
- **[pdf-lib](https://pdf-lib.js.org/)** – PDF manipulation
- **[pdfjs-dist](https://mozilla.github.io/pdf.js/)** – PDF rendering
- **[browser-image-compression](https://github.com/Donaldcwl/browser-image-compression)** – Client-side image compression

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (bundled with Node.js)

### Installation

```sh
# Clone the repository
git clone https://github.com/abhikakroda/filetools.git

# Navigate into the project directory
cd filetools

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`.

### Build for Production

```sh
npm run build
```

The production-ready files will be output to the `dist/` directory.

### Preview Production Build

```sh
npm run preview
```

## Project Structure

```
src/
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
├── pages/         # Page-level components (one per tool)
└── App.tsx        # Root application with routing
```

## Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is open source. See the [LICENSE](LICENSE) file for details.
