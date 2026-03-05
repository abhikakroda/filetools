# FileTools

A modern, browser-based file utility application that provides a suite of tools for working with images and PDFs — no server uploads required.

## Features

### Image Tools
- **Image Compress** — Reduce image file sizes without significant quality loss
- **Image Convert** — Convert images between common formats
- **Image Crop** — Crop images to custom dimensions
- **Image Resize** — Resize images to specific dimensions
- **Image to PDF** — Convert one or more images into a PDF document

### PDF Tools
- **PDF Compress** — Reduce PDF file sizes
- **PDF Merge** — Combine multiple PDF files into one
- **PDF Split** — Split a PDF into individual pages or page ranges
- **PDF to Image** — Extract pages from a PDF as image files

## Tech Stack

- [Vite](https://vitejs.dev/) — Fast development build tool
- [React](https://react.dev/) — UI library
- [TypeScript](https://www.typescriptlang.org/) — Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) — Accessible component library

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm (comes with Node.js)

### Installation

```sh
# Clone the repository
git clone https://github.com/abhikakroda/filetools.git

# Navigate to the project directory
cd filetools

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:8080`.

### Build for Production

```sh
npm run build
```

The production-ready files will be output to the `dist/` directory.

### Preview Production Build

```sh
npm run preview
```

## Contributing

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "Add your feature"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a pull request.

## License

This project is open source. See the [LICENSE](LICENSE) file for details.
