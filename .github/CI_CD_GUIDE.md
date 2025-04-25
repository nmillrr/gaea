# CI/CD Pipeline Guide

This document explains the Continuous Integration and Continuous Deployment (CI/CD) pipeline for the Cosmo application.

## Overview

The CI/CD pipeline automates the process of testing, building, and deploying the Cosmo application. It's configured using GitHub Actions and consists of three main stages:

1. **Lint**: Code quality checks
2. **Test**: Automated testing
3. **Build & Deploy**: Building and deploying Docker images

## Workflow Stages

### Lint

This stage checks the code quality using ESLint and Prettier for both backend and frontend code:

- Backend (Node.js/TypeScript): ESLint
- Frontend (React Native): ESLint and Prettier

If any linting errors are found, the workflow will fail, preventing the merge of code that doesn't meet quality standards.

### Test

This stage runs automated tests using Jest:

- **Backend Tests**: Unit and integration tests for the server
- **Frontend Tests**: Unit and snapshot tests for the mobile app

The test stage sets up necessary dependencies:
- PostgreSQL database with PostGIS extension
- Redis server for caching and rate limiting

Test coverage reports are generated and uploaded as artifacts, which can be downloaded from the GitHub Actions UI.

### Build & Deploy

This stage builds and pushes Docker images to a container registry:

- Builds the backend Docker image
- Tags the image with the commit SHA and branch name
- Pushes the image to GitHub Container Registry

For production deployments, this stage can also deploy the application to a production server (currently disabled by default).

## Workflow File

The workflow is defined in the `.github/workflows/main.yml` file. Here's a brief explanation of its structure:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  lint:
    # Lint job configuration
    
  test:
    # Test job configuration
    
  build-and-deploy:
    # Build and deploy job configuration
```

## Triggering the Workflow

The workflow is triggered automatically on:
- Push to the `main` branch
- Pull requests targeting the `main` branch

## Configuration

### Environment Variables

The workflow uses several environment variables:

- `REGISTRY`: The container registry to use (default: GitHub Container Registry)
- `BACKEND_IMAGE_NAME`: The name of the backend Docker image

### Services

The test job uses the following services:

- PostgreSQL with PostGIS extension for spatial data
- Redis for caching and rate limiting

### Secrets

The workflow uses the following GitHub secrets:

- `GITHUB_TOKEN`: Automatically provided by GitHub for pushing to GitHub Packages

For additional secrets required for deployments or using other registries, see the [SECRETS.md](./.github/SECRETS.md) file.

## Customizing the Workflow

### Using a Different Container Registry

By default, the workflow uses GitHub Container Registry. To use a different registry like Docker Hub:

1. Update the `REGISTRY` and `BACKEND_IMAGE_NAME` environment variables
2. Modify the login action to use your registry credentials
3. Set up the appropriate secrets in your GitHub repository

### Enabling Production Deployment

The production deployment step is disabled by default. To enable it:

1. Update the `if: false` condition to `if: true` in the deployment step
2. Implement your deployment script
3. Set up the required secrets for your deployment method

See [SECRETS.md](./.github/SECRETS.md) for more details on the required secrets.

## Troubleshooting

If the workflow fails, check the GitHub Actions logs for detailed error messages:

1. Navigate to the "Actions" tab in your GitHub repository
2. Click on the failed workflow run
3. Expand the job that failed
4. Look for error messages in the logs

Common issues include:
- Linting errors: Fix code style according to ESLint/Prettier rules
- Test failures: Fix failing tests or update snapshots
- Docker build errors: Check your Dockerfile for errors

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [Jest Testing Framework](https://jestjs.io/)
- [ESLint Documentation](https://eslint.org/)