# Codesarge client

A small coding quiz used to test the Codeverity API end to end. Students sign in,
pick a question, write a solution, and get it graded.

## Run

```
npm install
npm run dev
```

Opens on http://localhost:3001 (3000 is the Codeverity web app).

Demo logins: `demo / demo123` and `student / password`.

## Status

UI only for now. `lib/codeverity.ts` is a mock that returns the same shapes as
`POST /v1/assessments`, `GET /v1/assessments/{id}` and `GET /v1/assessments/{id}/result`,
and `lib/auth.ts` is a hardcoded user list. Both get swapped for real calls next.
