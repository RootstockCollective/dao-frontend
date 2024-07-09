This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, be sure that you are using Node Version 18+

Then

```bash
npm i
```

Then, run the development server:

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

## Deployments

Storybook GitHub pages (can vary): https://vigilant-guacamole-p8v5w3k.pages.github.io/

Main APP URL: https://frontend.testnet.dao.rif.technology

Backend URL: https://dao-backend.testnet.rifcomputing.net/api-docs

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


## E2E Testing with Cypress

Cypress is a tool to help you execute tests on a functional website.

It has been installed as the default test suite for all of our end-to-end test necessities.

The default baseUrl that it'll use is ```http://localhost:3000```, this can change in the future.

### Open cypress together with Next.js

You can open both instances at the same using the following command:

```bash
npm run e2e-open
```

This should start up Next.js server using ```npm run dev``` and then ```npm run cypress open --e2e```

This command will open cypress and will allow you to choose the desired browser for testing purposes.


### Run cypress tests

You can run the tests using:

```bash
npm run e2e-test
```

This will start Next.js, and cypress, and will then automatically execute the *.cy files in the project.

If everything is successfully, you'll get a "All specs passed!" green message.


### Default file

A default file ```health-spec.cy.ts``` has been created to make sure that cypress is running accordingly.

This can be removed in the future.


## GitHub Workflows

### End-to-end testing (e2e)

This workflow uses https://github.com/cypress-io/github-action

