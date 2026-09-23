# Interview Prep AI

An AI-powered interview preparation platform that analyzes a candidate's
**resume**, **self-description**, and a target **job description** to
generate a personalized interview-preparation report.

The application combines a React frontend, an Express/Node.js backend,
MongoDB persistence, Google Gemini for AI generation, PDF parsing, and
Puppeteer-based PDF generation. It is also containerized with Docker and
prepared for deployment using AWS services such as Amazon ECR and Amazon
ECS Fargate.

> **Important:** This README documents the project and its deployment
> architecture. It does **not** perform or require deployment.

------------------------------------------------------------------------

## Table of Contents

1.  [Project Overview](#1-project-overview)
2.  [Problem Statement](#2-problem-statement)
3.  [Key Features](#3-key-features)
4.  [How the Application Works](#4-how-the-application-works)
5.  [High-Level Architecture](#5-high-level-architecture)
6.  [Technology Stack](#6-technology-stack)
7.  [Project Structure](#7-project-structure)
8.  [Frontend Architecture](#8-frontend-architecture)
9.  [Backend Architecture](#9-backend-architecture)
10. [Authentication System](#10-authentication-system)
11. [AI Interview Report Generation](#11-ai-interview-report-generation)
12. [Resume PDF Processing](#12-resume-pdf-processing)
13. [Database Design](#13-database-design)
14. [API Documentation](#14-api-documentation)
15. [Request and Response Flow](#15-request-and-response-flow)
16. [Environment Variables](#16-environment-variables)
17. [Local Development Setup](#17-local-development-setup)
18. [Running the Frontend](#18-running-the-frontend)
19. [Running the Backend](#19-running-the-backend)
20. [Running the Complete Application with
    Docker](#20-running-the-complete-application-with-docker)
21. [Docker Architecture](#21-docker-architecture)
22. [Production Deployment
    Architecture](#22-production-deployment-architecture)
23. [AWS Deployment Components](#23-aws-deployment-components)
24. [AWS Deployment Plan](#24-aws-deployment-plan)
25. [Secrets Management](#25-secrets-management)
26. [Security Considerations](#26-security-considerations)
27. [Error Handling and Validation](#27-error-handling-and-validation)
28. [Important Implementation
    Details](#28-important-implementation-details)
29. [Common Development Issues](#29-common-development-issues)
30. [Testing Checklist](#30-testing-checklist)
31. [Production Checklist](#31-production-checklist)
32. [Future Improvements](#32-future-improvements)
33. [Learning Outcomes](#33-learning-outcomes)
34. [Project Summary](#34-project-summary)

------------------------------------------------------------------------

# 1. Project Overview

**Interview Prep AI** is a full-stack AI application designed to help
candidates prepare for job interviews.

A user provides:

-   A resume in PDF format
-   A self-description
-   A target job description

The backend extracts text from the uploaded resume and sends the
combined information to Google Gemini. The AI generates a structured
interview report containing:

-   Match score
-   Technical interview questions
-   Behavioral interview questions
-   Skill gaps
-   Severity of each skill gap
-   Day-wise preparation roadmap
-   Target job title

The generated report is stored in MongoDB and can later be viewed by the
authenticated user.

The application also supports generating a tailored resume PDF from an
existing interview report using AI-generated HTML and Puppeteer.

------------------------------------------------------------------------

# 2. Problem Statement

Candidates often prepare for interviews using generic question lists.
Generic preparation does not necessarily reflect:

-   The candidate's actual experience
-   The skills mentioned in the resume
-   The requirements of a particular job
-   Missing skills for the target role
-   The candidate's current preparation level

This project attempts to make interview preparation more personalized.

The system compares three major inputs:

``` text
Candidate Resume
       +
Self Description
       +
Target Job Description
       ↓
   AI Analysis
       ↓
Personalized Interview Report
```

------------------------------------------------------------------------

# 3. Key Features

## 3.1 User Registration

Users can create an account using:

-   Username
-   Email
-   Password

Passwords are hashed using `bcryptjs` before being stored in MongoDB.

------------------------------------------------------------------------

## 3.2 User Login

Users can authenticate using:

-   Email
-   Password

After successful authentication, the backend generates a JWT and stores
it in a cookie.

------------------------------------------------------------------------

## 3.3 Cookie-Based Authentication

The backend uses:

-   JSON Web Tokens
-   HTTP cookies
-   Authentication middleware
-   Token blacklist storage

Protected API endpoints require a valid authentication cookie.

------------------------------------------------------------------------

## 3.4 Resume Upload

Users can upload a resume in PDF form.

The backend:

1.  Receives the file using Multer.
2.  Stores the uploaded file temporarily in memory.
3.  Limits the upload size to 3 MB.
4.  Extracts text using `pdf-parse`.
5.  Sends the extracted text to the AI service.

------------------------------------------------------------------------

## 3.5 AI-Powered Interview Analysis

The system sends the following information to Google Gemini:

``` text
Resume
+
Self Description
+
Job Description
```

Gemini generates structured JSON containing:

``` text
Match Score
Technical Questions
Behavioral Questions
Skill Gaps
Preparation Plan
Job Title
```

The response is validated using Zod's schema structure and converted
into JSON Schema for Gemini's structured output configuration.

------------------------------------------------------------------------

## 3.6 Technical Interview Questions

Each technical question contains:

-   Question
-   Interviewer's intention
-   Suggested answer/answer approach

Example structure:

``` json
{
  "question": "...",
  "intention": "...",
  "answer": "..."
}
```

------------------------------------------------------------------------

## 3.7 Behavioral Interview Questions

Behavioral questions use the same structure:

``` json
{
  "question": "...",
  "intention": "...",
  "answer": "..."
}
```

------------------------------------------------------------------------

## 3.8 Skill Gap Analysis

Each skill gap contains:

``` text
skill
severity
```

Severity can be:

``` text
low
medium
high
```

------------------------------------------------------------------------

## 3.9 Personalized Preparation Roadmap

The AI generates a day-wise preparation plan.

Each day contains:

``` text
Day number
Focus
Tasks
```

Example structure:

``` json
{
  "day": 1,
  "focus": "Data Structures",
  "tasks": [
    "Review arrays",
    "Practice binary search"
  ]
}
```

------------------------------------------------------------------------

## 3.10 Match Score

The AI produces a score from:

``` text
0 to 100
```

The frontend visually presents the score.

------------------------------------------------------------------------

## 3.11 Interview Report History

Authenticated users can retrieve their previously generated interview
reports.

The application only retrieves reports belonging to the authenticated
user.

------------------------------------------------------------------------

## 3.12 AI-Generated Resume PDF

A saved interview report can be used to generate a tailored resume.

The flow is:

``` text
Stored Resume
      +
Self Description
      +
Job Description
      ↓
Google Gemini
      ↓
HTML Resume
      ↓
Puppeteer
      ↓
PDF
```

The resulting PDF is returned to the browser for download.

------------------------------------------------------------------------

# 4. How the Application Works

The complete workflow is:

``` text
1. User opens application
          ↓
2. User registers/logs in
          ↓
3. JWT is stored in cookie
          ↓
4. User opens interview preparation page
          ↓
5. User enters job description
          ↓
6. User enters self description
          ↓
7. User uploads resume PDF
          ↓
8. Frontend sends multipart/form-data
          ↓
9. Backend authenticates user
          ↓
10. Multer receives PDF in memory
          ↓
11. pdf-parse extracts resume text
          ↓
12. Backend sends data to Gemini
          ↓
13. Gemini generates structured report
          ↓
14. Report is stored in MongoDB
          ↓
15. Backend returns report
          ↓
16. Frontend displays report
          ↓
17. User can inspect questions,
    skill gaps and roadmap
          ↓
18. User can generate a tailored
    resume PDF
```

------------------------------------------------------------------------

# 5. High-Level Architecture

## Development Architecture

``` text
                         Browser
                            |
                 +----------+----------+
                 |                     |
                 v                     v
          React + Vite             Express API
          Frontend                 Backend
                                      |
                  +-------------------+------------------+
                  |                   |                  |
                  v                   v                  v
               MongoDB            Gemini API        Puppeteer
                  |
                  v
            Interview Reports
```

## Containerized Architecture

``` text
                         Browser
                            |
                            v
                 Docker Container
                 -----------------
                 React Static Files
                        +
                 Express Backend
                        |
              +---------+----------+
              |                    |
              v                    v
          MongoDB Atlas       Google Gemini
```

The Docker image uses a multi-stage build:

``` text
Frontend source
     ↓
Vite build
     ↓
dist/
     ↓
Copied into backend image
     ↓
Express serves frontend
```

------------------------------------------------------------------------

# 6. Technology Stack

## Frontend

  Technology       Purpose
  ---------------- -----------------------------------------
  React 19         UI development
  React Router 7   Client-side routing
  Axios            HTTP requests
  Sass             Styling
  Vite             Development server and production build

------------------------------------------------------------------------

## Backend

  Technology           Purpose
  -------------------- -----------------------------------------------
  Node.js              Runtime
  Express 5            REST API
  Mongoose             MongoDB ODM
  JWT                  Authentication
  bcryptjs             Password hashing
  cookie-parser        Cookie handling
  CORS                 Cross-origin configuration
  Multer               File upload
  pdf-parse            Resume PDF text extraction
  Puppeteer            HTML-to-PDF generation
  Zod                  Data/schema validation
  zod-to-json-schema   Converts Zod schemas for structured AI output

------------------------------------------------------------------------

## AI

The project uses:

``` text
Google Gemini
```

through:

``` text
@google/genai
```

The implementation currently configures:

``` text
gemini-3-flash-preview
```

for interview report generation and resume HTML generation.

------------------------------------------------------------------------

## Database

``` text
MongoDB
+
Mongoose
```

The connection is configured through:

``` text
MONGO_URI
```

------------------------------------------------------------------------

## Containerization

``` text
Docker
```

The project uses:

``` text
node:20-alpine
```

for both frontend build and backend runtime stages.

------------------------------------------------------------------------

## Planned/Target AWS Infrastructure

The project is prepared for an architecture using:

``` text
Amazon ECR
Amazon ECS Fargate
Application Load Balancer
AWS Secrets Manager
CloudWatch Logs
MongoDB Atlas
```

------------------------------------------------------------------------

# 7. Project Structure

``` text
Interview_Prep/
│
├── Backend/
│   │
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   │
│   └── src/
│       │
│       ├── app.js
│       │
│       ├── config/
│       │   └── database.js
│       │
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   └── interview.controller.js
│       │
│       ├── middlewares/
│       │   ├── auth.middleware.js
│       │   └── file.middleware.js
│       │
│       ├── models/
│       │   ├── blacklist.model.js
│       │   ├── interviewReport.model.js
│       │   └── user.model.js
│       │
│       ├── routes/
│       │   ├── auth.routes.js
│       │   └── interview.routes.js
│       │
│       └── services/
│           └── ai.service.js
│
├── Frontend/
│   │
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── index.html
│   ├── vite.config.js
│   │
│   └── src/
│       │
│       ├── App.jsx
│       ├── main.jsx
│       ├── app.routes.jsx
│       ├── style.scss
│       │
│       └── features/
│           │
│           ├── auth/
│           │   ├── auth.context.jsx
│           │   ├── authContext.js
│           │   ├── auth.form.scss
│           │   │
│           │   ├── components/
│           │   │   └── Protected.jsx
│           │   │
│           │   ├── hooks/
│           │   │   └── useAuth.js
│           │   │
│           │   ├── pages/
│           │   │   ├── Login.jsx
│           │   │   └── Register.jsx
│           │   │
│           │   └── services/
│           │       └── auth.api.js
│           │
│           └── interview/
│               ├── hooks/
│               │   └── useInterview.js
│               │
│               ├── interview.context.jsx
│               ├── interviewContext.js
│               │
│               ├── pages/
│               │   ├── Home.jsx
│               │   └── Interview.jsx
│               │
│               ├── services/
│               │   └── interview.api.js
│               │
│               └── style/
│                   ├── home.scss
│                   └── interview.scss
│
├── dockerfile
├── .dockerignore
└── README.md
```

------------------------------------------------------------------------

# 8. Frontend Architecture

The frontend is a React application built with Vite.

## Main Routes

``` text
/login
/register
/
/interview/:interviewId
```

The `/` and `/interview/:interviewId` routes are protected.

------------------------------------------------------------------------

## Authentication Feature

The authentication feature contains:

``` text
Login
Register
Protected Route
Authentication Context
Authentication API service
Authentication Hook
```

The API service communicates with:

``` text
/api/auth/register
/api/auth/login
/api/auth/logout
/api/auth/get-me
```

------------------------------------------------------------------------

## Interview Feature

The interview feature contains:

``` text
Home
Interview Report
Interview Context
Interview Hook
Interview API service
```

The frontend communicates with:

``` text
/api/interview/
/api/interview/report/:interviewId
/api/interview/resume/pdf/:interviewReportId
```

------------------------------------------------------------------------

## Axios Configuration

The frontend API services use Axios with:

``` text
withCredentials: true
```

This is required because authentication uses cookies.

The frontend currently reads:

``` text
VITE_API_URL
```

as the Axios base URL.

------------------------------------------------------------------------

# 9. Backend Architecture

The backend follows a layered structure:

``` text
Routes
  ↓
Middleware
  ↓
Controllers
  ↓
Services / Models
  ↓
External Services / Database
```

------------------------------------------------------------------------

## `server.js`

Responsibilities:

1.  Load environment variables.
2.  Import Express application.
3.  Connect to MongoDB.
4.  Start the HTTP server.
5.  Listen on `0.0.0.0`.

The server uses port:

``` text
5000
```

by default.

------------------------------------------------------------------------

## `app.js`

Responsibilities:

-   Express initialization
-   JSON parsing
-   Cookie parsing
-   CORS
-   Authentication routes
-   Interview routes
-   React static file serving
-   React Router fallback

------------------------------------------------------------------------

# 10. Authentication System

The authentication flow is:

``` text
Register/Login
      ↓
Validate credentials
      ↓
Hash/compare password
      ↓
Generate JWT
      ↓
Store JWT in cookie
      ↓
Protected request
      ↓
Authentication middleware
      ↓
Verify JWT
      ↓
Attach decoded user to req.user
```

------------------------------------------------------------------------

## Registration

Endpoint:

``` text
POST /api/auth/register
```

Body:

``` json
{
  "username": "username",
  "email": "user@example.com",
  "password": "password"
}
```

The password is hashed using:

``` text
bcrypt.hash(password, 10)
```

The user is then saved to MongoDB.

------------------------------------------------------------------------

## Login

Endpoint:

``` text
POST /api/auth/login
```

The backend:

1.  Finds the user by email.
2.  Compares the password.
3.  Creates JWT.
4.  Sends JWT through a cookie.

The token contains:

``` text
user ID
username
```

and expires after:

``` text
1 day
```

------------------------------------------------------------------------

## Protected Requests

The middleware reads:

``` text
req.cookies.token
```

It then:

1.  Checks whether a token exists.
2.  Checks whether the token is blacklisted.
3.  Verifies the JWT.
4.  Attaches decoded data to `req.user`.

------------------------------------------------------------------------

## Logout

Endpoint:

``` text
GET /api/auth/logout
```

The current token is:

1.  Added to the blacklist collection.
2.  Removed from the browser cookie.

------------------------------------------------------------------------

# 11. AI Interview Report Generation

The AI service is implemented in:

``` text
Backend/src/services/ai.service.js
```

The function:

``` text
generateInterviewReport()
```

accepts:

``` text
resume
selfDescription
jobDescription
```

------------------------------------------------------------------------

## Prompt Construction

The service builds a prompt containing:

``` text
Resume
Self Description
Job Description
```

The information is sent to Gemini.

------------------------------------------------------------------------

## Structured AI Output

The project defines a Zod schema containing:

``` text
matchScore
technicalQuestions
behavioralQuestions
skillGaps
preparationPlan
title
```

This schema is converted to JSON Schema using:

``` text
zod-to-json-schema
```

Gemini is configured to return:

``` text
application/json
```

------------------------------------------------------------------------

## Interview Report Structure

Conceptually:

``` json
{
  "matchScore": 85,
  "technicalQuestions": [],
  "behavioralQuestions": [],
  "skillGaps": [],
  "preparationPlan": [],
  "title": "Software Engineer"
}
```

The exact generated content depends on the supplied resume,
self-description and job description.

------------------------------------------------------------------------

# 12. Resume PDF Processing

The application supports PDF resumes.

## Upload Pipeline

``` text
Browser
  ↓
multipart/form-data
  ↓
Multer
  ↓
Memory Buffer
  ↓
pdf-parse
  ↓
Extracted Text
  ↓
Gemini
```

The upload middleware uses:

``` text
memoryStorage()
```

and a maximum file size of:

``` text
3 MB
```

------------------------------------------------------------------------

## Why Memory Storage?

The current implementation does not permanently store uploaded resume
files.

Instead:

``` text
PDF
 ↓
Memory
 ↓
Text extraction
 ↓
Database stores extracted resume text
```

This keeps the current implementation simple and avoids a separate
file-storage service.

------------------------------------------------------------------------

# 13. Database Design

MongoDB is used through Mongoose.

The project currently defines three main models.

------------------------------------------------------------------------

## 13.1 User

Collection/model:

``` text
users
```

Fields:

``` text
username
email
password
```

Username and email are configured as unique.

Passwords are stored as bcrypt hashes rather than plaintext.

------------------------------------------------------------------------

## 13.2 Interview Report

Model:

``` text
InterviewReport
```

Fields include:

``` text
jobDescription
resume
selfDescription
matchScore
technicalQuestions
behavioralQuestions
skillGaps
preparationPlan
user
title
createdAt
updatedAt
```

The `user` field references the authenticated user's MongoDB ObjectId.

------------------------------------------------------------------------

## 13.3 Blacklisted Tokens

Model:

``` text
blacklistTokens
```

Fields:

``` text
token
createdAt
updatedAt
```

It is used to invalidate logged-out JWTs.

------------------------------------------------------------------------

# 14. API Documentation

## Authentication APIs

### Register

``` http
POST /api/auth/register
```

Request:

``` json
{
  "username": "mahendra",
  "email": "mahendra@example.com",
  "password": "your-password"
}
```

------------------------------------------------------------------------

### Login

``` http
POST /api/auth/login
```

Request:

``` json
{
  "email": "mahendra@example.com",
  "password": "your-password"
}
```

------------------------------------------------------------------------

### Logout

``` http
GET /api/auth/logout
```

------------------------------------------------------------------------

### Get Current User

``` http
GET /api/auth/get-me
```

Authentication:

``` text
Required
```

------------------------------------------------------------------------

# Interview APIs

## Generate Interview Report

``` http
POST /api/interview/
```

Authentication:

``` text
Required
```

Content type:

``` text
multipart/form-data
```

Fields:

``` text
jobDescription
selfDescription
resume
```

The `resume` field must contain the uploaded PDF.

------------------------------------------------------------------------

## Get Interview Report

``` http
GET /api/interview/report/:interviewId
```

Authentication:

``` text
Required
```

------------------------------------------------------------------------

## Get All Interview Reports

``` http
GET /api/interview/
```

Authentication:

``` text
Required
```

The backend returns reports belonging to the authenticated user.

------------------------------------------------------------------------

## Generate Resume PDF

``` http
POST /api/interview/resume/pdf/:interviewReportId
```

Authentication:

``` text
Required
```

Response:

``` text
application/pdf
```

------------------------------------------------------------------------

# 15. Request and Response Flow

## Generate Report

``` text
React
  |
  | POST /api/interview/
  | multipart/form-data
  |
  v
Express
  |
  v
JWT Middleware
  |
  v
Multer
  |
  v
PDF Parser
  |
  v
AI Service
  |
  v
Google Gemini
  |
  v
Structured JSON
  |
  v
Mongoose
  |
  v
MongoDB
  |
  v
JSON Response
  |
  v
React
```

------------------------------------------------------------------------

# 16. Environment Variables

The backend uses environment variables for configuration.

Expected backend variables:

``` env
CLIENT_URL=http://localhost:5173
PORT=5000
MONGO_URI=<your-mongodb-connection-string>
GOOGLE_GENAI_API_KEY=<your-google-genai-api-key>
JWT_SECRET=<your-jwt-secret>
```

## Never commit these values

Do not commit:

``` text
.env
.env.*
```

to Git.

Do not place real credentials in:

-   README files
-   source code
-   Dockerfiles
-   public repositories
-   screenshots
-   issue reports

For cloud deployment, use a secrets-management system such as AWS
Secrets Manager instead of putting secret values directly into the task
definition.

------------------------------------------------------------------------

# 17. Local Development Setup

## Prerequisites

Install:

``` text
Node.js
npm
MongoDB / MongoDB Atlas
Google Gemini API key
Git
Docker
```

The project uses Node.js 20 in its Docker image.

------------------------------------------------------------------------

## Clone the Repository

``` bash
git clone <your-repository-url>
cd Interview_Prep
```

------------------------------------------------------------------------

## Backend Installation

``` bash
cd Backend
npm install
```

Create:

``` text
Backend/.env
```

with:

``` env
CLIENT_URL=http://localhost:5173
PORT=5000
MONGO_URI=<your-mongodb-uri>
GOOGLE_GENAI_API_KEY=<your-api-key>
JWT_SECRET=<your-secret>
```

Start the backend:

``` bash
node server.js
```

The backend runs on:

``` text
http://localhost:5000
```

------------------------------------------------------------------------

# 18. Running the Frontend

Open another terminal:

``` bash
cd Frontend
npm install
npm run dev
```

Vite normally starts the development server on:

``` text
http://localhost:5173
```

The frontend uses:

``` text
VITE_API_URL
```

for the API base URL.

For local development, configure the frontend environment according to
the API location used by the application.

------------------------------------------------------------------------

# 19. Running the Backend

From:

``` text
Interview_Prep/Backend
```

run:

``` bash
node server.js
```

For development with the existing script:

``` bash
npm run dev
```

The backend server is configured to listen on:

``` text
0.0.0.0
```

which is important when running inside Docker or another containerized
environment.

------------------------------------------------------------------------

# 20. Running the Complete Application with Docker

The project contains a root-level:

``` text
dockerfile
```

The Docker image performs both frontend building and backend execution.

Build:

``` bash
docker build -t interview-prep:local .
```

Run:

``` bash
docker run --name interview-prep-local \
  -p 5000:5000 \
  --env-file .\Backend\.env \
  interview-prep:local
```

Then open:

``` text
http://localhost:5000
```

The Express server serves the built React application.

------------------------------------------------------------------------

# 21. Docker Architecture

The Dockerfile contains two stages.

## Stage 1 --- Frontend Builder

Base image:

``` text
node:20-alpine
```

The frontend dependencies are installed:

``` bash
npm install
```

Then:

``` bash
npm run build
```

creates:

``` text
dist/
```

------------------------------------------------------------------------

## Stage 2 --- Backend

A second:

``` text
node:20-alpine
```

image is created.

Backend dependencies are installed using:

``` bash
npm install --omit=dev
```

The frontend build is copied into:

``` text
/app/public
```

The container exposes:

``` text
5000
```

and starts:

``` bash
node server.js
```

------------------------------------------------------------------------

## Why Use a Multi-Stage Build?

The approach separates:

``` text
Frontend build environment
```

from:

``` text
Backend runtime environment
```

The final runtime image does not need the frontend's development
tooling.

------------------------------------------------------------------------

# 22. Production Deployment Architecture

The intended production architecture is:

``` text
                         Internet
                            |
                            v
              Application Load Balancer
                            |
                            v
                     ECS Fargate
                            |
                            v
              Interview Prep Container
                  React + Express
                            |
              +-------------+-------------+
              |                           |
              v                           v
        MongoDB Atlas                Google Gemini
              |
              v
        Application Data
```

For secrets:

``` text
ECS Task
   |
   v
AWS Secrets Manager
   |
   +--> MONGO_URI
   +--> GOOGLE_GENAI_API_KEY
   +--> JWT_SECRET
```

For logging:

``` text
ECS Container
     |
     v
CloudWatch Logs
```

------------------------------------------------------------------------

# 23. AWS Deployment Components

The deployment plan uses the following AWS components.

## Amazon ECR

Stores the Docker image.

Repository:

``` text
interview-prep
```

Example image:

``` text
550427884595.dkr.ecr.ap-south-1.amazonaws.com/interview-prep:latest
```

------------------------------------------------------------------------

## Amazon ECS

Cluster:

``` text
interview-prep-cluster
```

The application is intended to run using:

``` text
AWS Fargate
```

------------------------------------------------------------------------

## ECS Task Definition

Task definition family:

``` text
interview-prep-task
```

The configured task size used during setup is:

``` text
CPU: 0.5 vCPU
Memory: 1 GiB
```

Container:

``` text
interview-prep-container
```

Container port:

``` text
5000
```

------------------------------------------------------------------------

## ECS Task Execution Role

The ECS task uses:

``` text
ecsTaskExecutionRole
```

The execution role is used by ECS for required task-level AWS operations
such as pulling the image and sending logs.

------------------------------------------------------------------------

## Application Load Balancer

The intended production architecture places an Application Load Balancer
in front of ECS.

``` text
Internet
   ↓
ALB
   ↓
Target Group
   ↓
ECS Fargate Task
   ↓
Port 5000
```

------------------------------------------------------------------------

## CloudWatch

Container logs can be sent to CloudWatch Logs.

Suggested log group:

``` text
/ecs/interview-prep
```

------------------------------------------------------------------------

# 24. AWS Deployment Plan

The project can be deployed in stages.

``` text
Phase 1
Local React + Express + MongoDB + Gemini

        ↓

Phase 2
Docker image

        ↓

Phase 3
Amazon ECR

        ↓

Phase 4
ECS Cluster

        ↓

Phase 5
ECS Task Definition

        ↓

Phase 6
AWS Secrets Manager

        ↓

Phase 7
ECS Service

        ↓

Phase 8
Application Load Balancer

        ↓

Phase 9
Security Groups / Networking

        ↓

Phase 10
CloudWatch Logs

        ↓

Phase 11
HTTPS with ACM

        ↓

Phase 12
Optional Route 53 domain

        ↓

Phase 13
GitHub Actions CI/CD
```

------------------------------------------------------------------------

# 25. Secrets Management

Production deployments should not place actual credentials directly
inside ECS environment-variable values.

Sensitive values include:

``` text
MONGO_URI
GOOGLE_GENAI_API_KEY
JWT_SECRET
```

A recommended architecture is:

``` text
AWS Secrets Manager
        |
        v
ECS Task Definition
        |
        v
Container Environment
```

Suggested secret names:

``` text
/interview-prep/MONGO_URI
/interview-prep/GOOGLE_GENAI_API_KEY
/interview-prep/JWT_SECRET
```

The actual secret values should never be documented in this README.

------------------------------------------------------------------------

# 26. Security Considerations

## 26.1 Never Commit `.env`

Use:

``` text
.env
.env.*
```

in `.gitignore` and `.dockerignore`.

------------------------------------------------------------------------

## 26.2 Rotate Exposed Credentials

If a real API key, database password or JWT secret has been exposed in:

-   Git
-   Docker image history
-   task definitions
-   screenshots
-   chat messages
-   logs

it should be replaced.

Do not assume that deleting a file from the latest Git commit makes a
secret safe.

------------------------------------------------------------------------

## 26.3 Password Hashing

Passwords are processed using:

``` text
bcryptjs
```

They should never be stored as plaintext.

------------------------------------------------------------------------

## 26.4 JWT Secret

The JWT signing secret must be:

-   Strong
-   Random
-   Private
-   Stored outside source control

------------------------------------------------------------------------

## 26.5 CORS

The backend uses:

``` text
credentials: true
```

because cookies are used for authentication.

The production `CLIENT_URL` should be restricted to the actual frontend
origin instead of allowing arbitrary origins.

------------------------------------------------------------------------

## 26.6 Cookie Security

For a production HTTPS deployment, cookie configuration should be
reviewed for:

``` text
Secure
HttpOnly
SameSite
```

The exact settings depend on the final frontend/backend origin
architecture.

------------------------------------------------------------------------

## 26.7 MongoDB Network Access

MongoDB Atlas should be configured so that database access is restricted
to the required application network/IP configuration rather than
allowing unrestricted access unless there is a specific reason.

------------------------------------------------------------------------

# 27. Error Handling and Validation

The current implementation performs validation in several layers.

## Registration Validation

The backend checks:

``` text
username
email
password
```

before creating a user.

It also checks whether the username or email already exists.

------------------------------------------------------------------------

## Authentication Validation

Login validates:

``` text
email
password
```

and returns an authentication error when credentials are invalid.

------------------------------------------------------------------------

## JWT Validation

Protected routes reject:

``` text
missing token
blacklisted token
invalid token
```

------------------------------------------------------------------------

## AI Output Validation

The AI service defines a Zod schema for the expected interview report
structure and requests structured JSON from Gemini.

------------------------------------------------------------------------

## Resume Size Validation

Multer limits the uploaded resume to:

``` text
3 MB
```

------------------------------------------------------------------------

# 28. Important Implementation Details

## Express 5

The backend uses:

``` text
express ^5.2.1
```

The React fallback is configured using:

``` text
app.get("/{*splat}", ...)
```

so client-side routes can resolve to the React application's
`index.html`.

------------------------------------------------------------------------

## MongoDB Connection

Database connection is handled in:

``` text
Backend/src/config/database.js
```

The application reads:

``` text
process.env.MONGO_URI
```

------------------------------------------------------------------------

## AI Service

The Google AI client is initialized with:

``` text
process.env.GOOGLE_GENAI_API_KEY
```

The AI service is separated from the controller layer.

This keeps AI-specific code out of the HTTP route implementation.

------------------------------------------------------------------------

## PDF Generation

Puppeteer launches Chromium with:

``` text
--no-sandbox
--disable-setuid-sandbox
--disable-dev-shm-usage
```

This configuration is especially relevant when Chromium runs inside a
container.

------------------------------------------------------------------------

## User Data Isolation

Interview reports are queried using both:

``` text
interviewReport ID
```

and:

``` text
authenticated user ID
```

for the report-fetching endpoint.

This prevents a logged-in user from retrieving another user's report
through the normal report endpoint.

------------------------------------------------------------------------

# 29. Common Development Issues

## Issue: Frontend cannot reach backend

Check:

``` text
VITE_API_URL
```

and confirm the backend is running.

------------------------------------------------------------------------

## Issue: 401 from `/api/auth/get-me`

Check:

1.  User is logged in.

2.  Browser is sending cookies.

3.  Axios has:

    ``` text
    withCredentials: true
    ```

4.  Backend CORS has:

    ``` text
    credentials: true
    ```

5.  The configured origin matches the frontend origin.

------------------------------------------------------------------------

## Issue: MongoDB connection fails

Check:

``` text
MONGO_URI
```

Then verify:

-   MongoDB Atlas credentials
-   Network access
-   Database availability
-   Correct connection string

------------------------------------------------------------------------

## Issue: Gemini request fails

Check:

``` text
GOOGLE_GENAI_API_KEY
```

and verify the API key is valid and has access to the configured Google
AI service/model.

------------------------------------------------------------------------

## Issue: PDF generation fails in Docker

Check Puppeteer/Chromium requirements and ensure the container has
sufficient memory.

The current Puppeteer launch configuration already includes
container-oriented flags.

------------------------------------------------------------------------

## Issue: ECS task cannot start

Check:

``` text
ECR image
Task execution role
Container port
Environment variables/secrets
CloudWatch logs
Security groups
Subnets
```

------------------------------------------------------------------------

# 30. Testing Checklist

## Authentication

-   [ ] Register a new user
-   [ ] Register with duplicate email
-   [ ] Register with duplicate username
-   [ ] Login with valid credentials
-   [ ] Login with invalid credentials
-   [ ] Fetch current user
-   [ ] Logout
-   [ ] Access protected route without login

------------------------------------------------------------------------

## Interview Generation

-   [ ] Login
-   [ ] Enter job description
-   [ ] Enter self description
-   [ ] Upload PDF resume
-   [ ] Generate report
-   [ ] Verify match score
-   [ ] Verify technical questions
-   [ ] Verify behavioral questions
-   [ ] Verify skill gaps
-   [ ] Verify preparation plan
-   [ ] Verify report is stored in MongoDB

------------------------------------------------------------------------

## Report Retrieval

-   [ ] Open report by ID
-   [ ] Retrieve all reports
-   [ ] Verify reports belong to current user

------------------------------------------------------------------------

## Resume Generation

-   [ ] Open an interview report
-   [ ] Generate tailored resume
-   [ ] Verify PDF response
-   [ ] Open generated PDF

------------------------------------------------------------------------

## Docker

-   [ ] Build Docker image
-   [ ] Start container
-   [ ] Open application
-   [ ] Register
-   [ ] Login
-   [ ] Generate interview report
-   [ ] Generate resume PDF

------------------------------------------------------------------------

# 31. Production Checklist

Before production deployment:

## Application

-   [ ] Production frontend URL configured
-   [ ] Production CORS configured
-   [ ] Production cookie settings reviewed
-   [ ] Error handling reviewed
-   [ ] Request validation reviewed
-   [ ] File upload validation reviewed

## Secrets

-   [ ] MongoDB credentials rotated if previously exposed
-   [ ] Gemini API key rotated if previously exposed
-   [ ] JWT secret regenerated
-   [ ] Secrets stored in AWS Secrets Manager
-   [ ] No secrets committed to Git

## Docker

-   [ ] Production image builds successfully
-   [ ] `.dockerignore` configured
-   [ ] Image pushed to ECR
-   [ ] Container starts successfully

## AWS

-   [ ] ECS cluster exists
-   [ ] Task definition created
-   [ ] Execution role configured
-   [ ] Secrets Manager configured
-   [ ] ECS service configured
-   [ ] Security group configured
-   [ ] ALB configured
-   [ ] Target group configured
-   [ ] Health check configured
-   [ ] CloudWatch logging configured

## HTTPS

-   [ ] ACM certificate created
-   [ ] HTTPS listener configured
-   [ ] HTTP-to-HTTPS redirect configured
-   [ ] Optional Route 53 record configured

## Monitoring

-   [ ] CloudWatch logs available
-   [ ] ECS service health monitored
-   [ ] ALB target health monitored
-   [ ] MongoDB monitoring enabled
-   [ ] Gemini API usage monitored

------------------------------------------------------------------------

# 32. Future Improvements

The current project can be extended with:

## Authentication

-   Refresh tokens
-   Better cookie security
-   Password reset
-   Email verification
-   Account deletion
-   OAuth/social login

------------------------------------------------------------------------

## Interview Intelligence

-   Interview difficulty selection
-   Role-specific question generation
-   Company-specific preparation
-   Interview simulation
-   Follow-up questions
-   Mock interview chat
-   Answer evaluation
-   Communication feedback
-   Coding interview mode

------------------------------------------------------------------------

## Resume Analysis

-   ATS score
-   Resume section analysis
-   Keyword matching
-   Missing keywords
-   Resume improvement suggestions
-   Multiple resume versions

------------------------------------------------------------------------

## Storage

The current application stores extracted resume text rather than the
uploaded PDF itself.

A future architecture could use:

``` text
Amazon S3
```

for persistent resume storage.

------------------------------------------------------------------------

## Scalability

Possible future architecture:

``` text
ALB
 |
ECS Service
 |
+---- Task 1
+---- Task 2
+---- Task 3
 |
MongoDB
```

The service could later use ECS auto scaling based on CPU, memory or
request load.

------------------------------------------------------------------------

## CI/CD

A GitHub Actions pipeline could automate:

``` text
Git push
   ↓
GitHub Actions
   ↓
Docker build
   ↓
Amazon ECR
   ↓
ECS deployment
   ↓
New task revision
```

------------------------------------------------------------------------

# 33. Learning Outcomes

This project demonstrates practical experience with:

### Frontend

-   React
-   Component-based UI
-   React Router
-   Context API
-   Axios
-   Protected routes
-   Form handling
-   File uploads
-   Sass

### Backend

-   Node.js
-   Express
-   REST APIs
-   Controllers
-   Routes
-   Middleware
-   Authentication
-   JWT
-   Cookies
-   Password hashing
-   Multipart form data

### Database

-   MongoDB
-   Mongoose
-   Schemas
-   Models
-   References
-   Queries
-   Sorting
-   User-specific data access

### AI Engineering

-   Google Gemini
-   Structured AI output
-   Zod
-   JSON Schema
-   Prompt construction
-   AI-generated interview plans
-   AI-generated resume content

### Document Processing

-   PDF text extraction
-   HTML generation
-   Puppeteer
-   PDF generation

### DevOps

-   Docker
-   Multi-stage Docker builds
-   Amazon ECR
-   Amazon ECS
-   AWS Fargate
-   Application Load Balancer
-   CloudWatch
-   AWS Secrets Manager

------------------------------------------------------------------------

# 34. Project Summary

**Interview Prep AI** is a full-stack AI-powered interview preparation
platform.

Its core pipeline is:

``` text
Resume PDF
     +
Self Description
     +
Job Description
     ↓
PDF Text Extraction
     ↓
Google Gemini
     ↓
Structured Interview Report
     ↓
MongoDB
     ↓
React Dashboard
```

The report contains:

``` text
Match Score
Technical Questions
Behavioral Questions
Skill Gaps
Preparation Roadmap
Job Title
```

The project also provides:

``` text
AI-generated tailored resume
        ↓
HTML
        ↓
Puppeteer
        ↓
PDF
```

The application is containerized using Docker and can be extended into a
production architecture based on:

``` text
Internet
   ↓
Application Load Balancer
   ↓
ECS Fargate
   ↓
Docker Container
   ↓
MongoDB Atlas
   +
Google Gemini
```

with:

``` text
AWS Secrets Manager
CloudWatch
Amazon ECR
ACM
Route 53
GitHub Actions
```

for security, observability, networking, HTTPS, domain management and
continuous deployment.

------------------------------------------------------------------------

## Author

**Mahendra Yadav**

Computer Science & Engineering

Project focus:

``` text
Full-Stack Development
AI Integration
REST APIs
Authentication
MongoDB
Docker
AWS Cloud Deployment
```

------------------------------------------------------------------------

## License

No explicit project license is currently defined in the source
repository. Add a license file if this project is intended to be
distributed publicly.
