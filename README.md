## BACKEND SETUP

Create .env file under /api directory, add this:

    DATABASE_URL="file:./dev.db"



```
cd api
npm install
npx prisma migrate dev
npx prisma generate
npm run setup:data
npm run dev
```
### Backend runs on http://localhost:4000

### Some useful commands for backend

```
npm run seed:devices
npm run seed:users
npm run ingest
npx prisma studio
```

## FRONT END SETUP

Create .env.local file under /web directory, add this:

    NEXT_PUBLIC_API_URL=http://localhost:4000

```
cd web
npm run dev
```
### Frontend runs on http://localhost:3000/alerts