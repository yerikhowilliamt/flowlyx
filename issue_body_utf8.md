# FLOWLYX DEVELOPMENT PHASE

The Flowlyx Engineering Handbook is the Constitution of this repository.

Every implementation MUST comply with the handbook.

If any instruction conflicts with the handbook,

explain the conflict before proceeding.

Never violate the handbook unless explicitly instructed.

---

# CURRENT PHASE

Phase Number:
10

Phase Name:
User Management

Category:
Identity & Access

Target Branch:
dev

Feature Branch:
feature/phase-10-user-management

---

# PHASE OBJECTIVE

Implement the User Management module ensuring full compliance with Flowlyx Engineering Handbook.

---

# BUSINESS REQUIREMENTS

Provide core functionality for User Management as required by the Identity & Access phase.

---

# TECHNICAL REQUIREMENTS

Implement following the handbook.

Mandatory

- Clean Architecture
- SOLID
- Repository Pattern
- Dependency Injection
- Feature First Architecture
- DTO Validation
- Swagger
- Structured Logging
- Correlation ID
- Global Exception Handling
- Strong Typing
- No explicit any
- No business logic inside controllers
- Repository access only through repositories
- Global Validation
- Configuration Validation
- Health Checks
- Standardized API Response
- Error Handling

---

# LOGGING

Every implementation must include

- Structured Logging
- Correlation ID
- Request Context
- Error Logging
- Performance Logging
- Audit Logging where applicable

Never use

- console.log
- console.error
- console.warn
- console.debug

---

# SECURITY

Review the security impact.

Implement if applicable

- Authentication
- Authorization
- RBAC
- Input Validation
- Output Sanitization
- Rate Limiting
- Secure Cookies
- OWASP Best Practices

---

# DATABASE

Explain

- Schema Changes
- Migration Strategy
- Seed Strategy
- Rollback Strategy

If no database changes are required,

explicitly state that.

---

# API DESIGN

Explain

- Endpoints
- DTOs
- Validation
- Status Codes
- Error Responses
- Swagger Updates

---

# IMPLEMENTATION PLAN

Before writing code,

explain

1. Architecture

2. Folder Structure

3. Data Flow

4. Files to Create

5. Files to Modify

6. Dependencies

7. Risks

Wait for implementation only after the plan is complete.

---

# IMPLEMENTATION

Implement following every handbook standard.

Update

- Documentation
- Swagger
- Changelog
- Roadmap
- ADR (if architecture changes)

---

# TESTING

Generate

✅ Unit Tests

✅ Integration Tests

✅ E2E Tests (if applicable)

Explain

- What is tested
- Why it is tested
- Edge Cases
- Negative Cases

---

# QUALITY GATES

Verify

✅ ESLint

✅ Type Check

✅ Build

✅ Unit Test

✅ Integration Test

✅ E2E Test (if applicable)

Do not continue if any quality gate fails.

Fix every issue first.

---

# ERROR DOCUMENTATION

If any issue occurs,

create a new error documentation

docs/errors/

Use format

ERR-XXX.md

Include

- Symptoms
- Root Cause
- Investigation
- Solution
- Trade-offs
- Prevention
- References

---

# SELF REVIEW

Review the implementation against the Flowlyx Engineering Handbook.

Checklist

Architecture

Folder Structure

Naming Convention

Type Safety

Repository Pattern

Dependency Injection

DTO Validation

Logging

Security

Performance

Swagger

Testing

Documentation

Error Documentation

GitHub Actions

If any item fails,

fix it before completion.

---

# GIT WORKFLOW

Current Branch

feature/phase-10-user-management

Target Branch

dev

Never merge directly.

Always create a Pull Request.

---

# PULL REQUEST

Generate

1. Conventional Commit

2. Branch Name

3. Pull Request Title

4. Pull Request Description

5. Summary

6. Files Changed

7. Testing Evidence

8. Breaking Changes

9. Migration Notes

10. Rollback Plan

11. Reviewer Checklist

---

# DEFINITION OF DONE

The phase is complete only when

✅ Handbook followed

✅ Architecture approved

✅ Documentation updated

✅ Swagger updated

✅ Logging implemented

✅ Validation implemented

✅ Tests passing

✅ Build passing

✅ Type Check passing

✅ ESLint passing

✅ GitHub Actions passing

✅ Error Documentation updated (if needed)

✅ Pull Request generated

After everything is complete,

STOP.

Wait for the next phase.
