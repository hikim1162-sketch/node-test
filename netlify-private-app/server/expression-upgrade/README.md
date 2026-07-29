# Expression Upgrade backend adapter

The current general-mode MVP is immediately usable through the existing profile-scoped browser store. This folder and `prisma/schema.prisma` define the durable PostgreSQL migration path without changing the existing Vercel runtime.

## Install and generate

```powershell
npm install @prisma/client zod
npm install -D prisma
$env:DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/value_time"
npx prisma migrate dev --name expression_upgrade
npx prisma generate
```

Create a singleton Prisma client and thin route adapters for the paths in `api-contract.md`. Each adapter must:

1. derive `userId` from the authenticated session (use `mock-user` only in local development);
2. validate path/body input;
3. call the functions in `service.js`;
4. map domain errors to the contract response;
5. never return hidden expressions or unpublished sets.

Seed conversion can import `../../src/expression-upgrade.js`: create six sets, five expressions per set, one example per expression, and three quiz items per quiz in a transaction. Call `validatePublishedSet` before changing a set to `published`.

## Existing MVP run

```powershell
cd D:\프로젝트\node-test\netlify-private-app
npm install
npm run dev
```

Open `http://localhost:5173/index.html#upgrade`, or open the general-mode home and select **표현 업그레이드**.

## Verification

```powershell
node --test tests/expression-upgrade.test.mjs
npm run build
```
