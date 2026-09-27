# Week 4: Building the Backend: Express 2


### 2.2 Implementing the Authentication System

```
Implement the JWT authentication (registration and login) system for this backend. Build the following:

1. Routes and controllers for the registration and login endpoints in routes/auth.js and controllers/authController.js
2. The service layer in services/authService.js with the business logic for user registration and login. Use the createAppError utility for error handling
3. Authentication middleware in middleware/authHandler.js to protect the routes that require an authenticated user. 

Propose a plan first. Ask me any clarifying questions. Do not generate any code yet.
```

```
Implement the above plan.
```


### 2.3 Securing the Backend with AI

```
Analyze this codebase and perform a **comprehensive security audit**. The codebase is built to be a production-grade web application with user accounts and protected routes.

## Your Objectives

1. Analyze the code for security vulnerabilities and misconfigurations across the following areas:
    - Authentication & Session Security
    - Authorization & Access Control
    - Input Validation & Injection Risks
    - API & Transport Security
    - Data Protection
    - Dependency & Configuration Issues
2. Order the identified issues in decreasing order of seriousness (Critical, High, Medium, Low).
3. For each issue, mention the location in the codebase where this occurs and suggest a fix for the same.
4. Do not generate any code as of now, only help identify the security vulnerabilities.
```

```
I want to fix the following critical vulnerabilities:
1. SQL Injection in the /api/posts endpoint
2. Missing authentication on the /api/posts/:id endpoint

Suggest a plan to fix this vulnerability, avoid including code snippets unless absolutely necessary. I want to understand the steps I need to take to fix this.
```

```
Implement the above plan.
```

### 2.4 Custom Agent for Generating Tests

```
Generate tests for the /api/threads endpoint.
```

```
Help me set up a test script in my package.json to run the generated tests using Vitest
```

### 2.5 Documenting the codebase with AI

```
Generate a README file for my project. Use the project code and structure to infer all necessary details.
```

