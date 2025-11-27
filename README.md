MSNS-LMS (Learning Management System)

A modern, web-based Learning Management System designed to streamline academic and administrative workflows within educational institutions. It provides role-specific dashboards for administrators, teachers, clerks, and students, enabling efficient management of academics, finances, assignments, and user data.

This project is bootstrapped using the T3 Stack.


---

📑 Table of Contents

1. Introduction


2. Features


3. User Roles


4. Technology Stack


5. Installation


6. Configuration


7. Usage


8. Deployment


9. Troubleshooting


10. Contributors


11. License




---

📝 Introduction

MSNS-LMS is a comprehensive Learning Management System tailored for schools and academic institutions. The platform supports core academic activities while also integrating finance management, user administration, and assignment workflows.

It supports secure authentication, cloud storage integrations, and PDF report generation.


---

🚀 Core Features

Based on the SRS, the system includes:

System Management

Role-based dashboards for Admin, Teacher, Clerk, and Student.

Full user management: create, view, edit, delete Students and Employees.

Academic configuration (sessions, classes, subjects).


Finance Management

Manage fee structures & student fee assignments.

Track all school expenses (salaries, utilities, maintenance, etc.).

Generate session-based profit/loss reports.

Clerks can record payments and apply discounts.


Assignments

Teachers create assignments for their classes.

Students upload submissions.

Grading interface for teachers.


File & Report Management

Secure file uploads using Google Cloud Storage.

PDF report generation (students, employees, fees, finances).



---

👥 User Roles

Admin

Full system control and configuration

Manages academic settings

Oversees financial operations


Teacher

Manages assigned classes & subjects

Creates assignments

Views enrolled students & submits grades


Clerk

Handles student fee collection

Records payments & expenses

Assists with student information management


Student

Views enrolled classes & fee history

Submits assignments

Views grades & academic progress



---

💻 Technology Stack

This project uses a modern, type-safe ecosystem aligned with the T3 Stack:

Layer	Technology

Framework	Next.js (App Router)
Language	TypeScript
API	tRPC
Database & ORM	Prisma with PostgreSQL/MySQL
Auth	NextAuth.js (Credentials Provider)
Styling	Tailwind CSS
UI Components	shadcn/ui
File Storage	Google Cloud Storage (signed URLs)
PDF Generation	pdf-lib



---

▶️ Getting Started

Clone the repository

git clone https://github.com/your-repo/msns-lms.git
cd msns-lms

Install dependencies

npm install
# or: yarn install | pnpm install

Set up environment variables

Copy .env.example → .env and supply:

DATABASE_URL

NEXTAUTH_SECRET

NEXTAUTH_URL

Google Cloud Storage credentials

Any other required secrets


Push the database schema

npx prisma db push

Run the development server

npm run dev

Visit: http://localhost:3000


---

⚙️ Configuration

Environment Variables

Your .env must include:

Database

DATABASE_URL=

Authentication

NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

Google Cloud Storage

GCP_BUCKET_NAME=
GCP_CLIENT_EMAIL=
GCP_PRIVATE_KEY=

Other required tRPC/Next.js/Prisma configs

(As specified in your .env.example)


---

📘 Usage

Once running:

Admin Dashboard: manage users, academics, finances

Teacher Dashboard: create assignments, grade submissions

Clerk Dashboard: manage fees & payments

Student Dashboard: submit assignments, view fees & grades


All dashboards are dynamically rendered based on user roles.


---

🚀 Deployment Guide

This project follows the T3 Stack deployment model.


---

🌐 Deploying to Vercel (Recommended)

1. Add environment variables

In Vercel Dashboard → Settings → Environment Variables
Copy everything from your local .env.

2. Set up a hosted SQL database

(Neon, Railway, Supabase, PlanetScale, etc.)

Run:

npx prisma migrate deploy

3. Deploy

Connect your GitHub → Click Deploy → Done.


---

🟦 Deploying to Netlify

Install Netlify adapter

npm install @netlify/next

Add netlify.toml

[build]
  command = "npm run build"
  publish = ".next"

Deploy

Push code → Netlify builds automatically.


---

🐳 Deploying with Docker

Create Dockerfile:

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]

Build and run:

docker build -t msns-lms .
docker run -p 3000:3000 --env-file .env msns-lms

Uses external hosted SQL database.


---

🛠 Troubleshooting

App builds but API fails

Check tRPC/NextAuth environment variables.

Database errors

Verify:

DATABASE_URL is populated

Your database service allows external connections

Prisma migrations were applied


File upload failures

Ensure:

Google Cloud Storage bucket exists

Service account has correct permissions

Private key is correctly escaped in .env


Auth issues

Verify:

Matching NEXTAUTH_URL

Valid NEXTAUTH_SECRET



---
