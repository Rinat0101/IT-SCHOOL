This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Requirements

1. Need to create .env.local in root folder
2. Add to .env.local two variables DATOCMS_API_KEY with API key to access the Project data and NEXTAUTH_SECRET to work auth

## GraphQL Queries

{
  allCourses {
    name
    url
    enabled
  }
  allModules {
    name
    enabled
    orderColumn
    course {
      id
    }
  }
  allWeeks {
    name
    orderColumn
    module {
      id
    }
  }
  allDays {
    name
    orderColumn
    week {
      id
    }
  }
  allLessons {
    name
    enabled
    content {
      __typename
    }
    day {
      id
    }
  }
}