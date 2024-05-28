This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Sample Health Check

A health check has been created to verify that your instance is running.

Go to /health to see a "Page is OK!" text rendered.

## Deploy on Vercel

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Storybook

This project contains storybook installed in it, which is a tool to render UI components and test them visually.

Page used for installation: [Storybook Getting Started](https://storybook.js.org/docs/get-started/nextjs#getting-started)

## How to run Storybook

In order to run storybook, just do:

```bash
npm run storybook
```

The deployer will launch an instance of storybook in [Localhost Port 6000](http://localhost:6000)

### Notes

Storybook has been configured to use Tailwind CSS.
