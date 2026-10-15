# Codesarge client

A small coding quiz used to test the Codeverity API end to end. Admins create
exams, add questions, and write a rubric for each one. Students take published
exams and get each answer marked against that rubric.

## Run

```
npm install
npm run dev
```

Opens on http://localhost:3001 (3000 is the Codeverity web app).

| Role    | Username  | Password   |
| ------- | --------- | ---------- |
| Admin   | `admin`   | `admin123` |
| Student | `demo`    | `demo123`  |
| Student | `student` | `password` |

## Pages

- `/admin`: list and create exams.
- `/admin/exams/{id}`: edit, publish or delete an exam, and manage its questions.
- `/admin/exams/{id}/questions/{id or new}`: question details and the rubric editor.
- `/quiz`, `/quiz/{exam}`, `/quiz/{exam}/{question}`: the student side.

The rubric editor checks the same rules as the Codeverity API (1 to 10
criteria, unique names, whole number weights that add up to 100, and the
length limits), so a saved question never gets a 422 when a student submits.

The student's grade is `rubric_score` (0 to 10). `score` rates the feedback,
not the code, and is shown as "feedback quality".

## Status

UI only for now. Exams and grades live in localStorage, so admin and student
must use the same browser. `lib/codeverity.ts` is a mock that returns the same
shapes as `POST /v1/assessments`, `GET /v1/assessments/{id}` and
`GET /v1/assessments/{id}/result`, and `lib/auth.ts` is a hardcoded user list.
