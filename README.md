# Leswise

Leswise is a modern education platform for teachers and students to easily create, share, complete, and manage worksheets.

## Contents

- [Product Requirements Document (PRD)](docs/PRD.md)
- [Functional Breakdown](docs/FUNCTIONAL_BREAKDOWN.md)
- [Sprint Planning](docs/SPRINT_PLANNING.md)

## Project Structure

```
leswise/
├── docs/           # Project documentation
├── scripts/        # Automation scripts
├── web/            # Next.js frontend + Supabase integration
│   ├── src/
│   │   ├── app/           # Next.js app directory (routes, pages)
│   │   ├── components/    # Reusable React components
│   │   └── utils/         # Utility functions (e.g., Supabase client)
│   ├── public/            # Static assets
│   ├── package.json       # Dependencies & scripts
│   └── ...                # Config files (Jest, ESLint, etc.)
└── README.md       # This file
```

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ozkan66/leswise.git
   cd leswise/web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a `.env.local` file**
   - Copy the example file:
     ```bash
     cp .env.example .env.local
     ```
   - Fill in your Supabase credentials (see [DEPLOYMENT.md](DEPLOYMENT.md) for details)

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will run at [http://localhost:3000](http://localhost:3000) by default.

## Deployment

This project includes automated CI/CD deployment to Vercel. See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions.

### Quick Deployment Setup
1. Configure GitHub repository secrets for Supabase and Vercel
2. Push to `main` branch for automatic deployment
3. Monitor deployment status in GitHub Actions

## Testing

- **Run all tests:**  
  ```bash
  npm run test
  ```
- **Run tests in watch mode:**  
  ```bash
  npm run test:watch
  ```
- **Test coverage report:**  
  ```bash
  npm run test:coverage
  ```

## Linting & Formatting

- **Lint the code:**  
  ```bash
  npm run lint
  ```
- *(Optional: add Prettier for automatic code formatting)*

## Contributing

- See [CONTRIBUTING.md](docs/CONTRIBUTING.md) (if available) for guidelines.
- Issues and pull requests are welcome!

## Contact

For questions or contributions: [Ozkan66](https://github.com/Ozkan66)

---

> **Tip:** See `web/README.md` for frontend-specific instructions.
