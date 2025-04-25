# GitHub Secrets Configuration for CI/CD Pipeline

This document explains how to set up the required GitHub Secrets for the Cosmo application's CI/CD pipeline.

## Required Secrets

The following secrets need to be configured in your GitHub repository:

### Basic Authentication

| Secret Name | Description |
|-------------|-------------|
| `GITHUB_TOKEN` | Automatically provided by GitHub. Used for pushing Docker images to GitHub Container Registry. |

### Container Registry (If not using GitHub Packages)

If you're using Docker Hub instead of GitHub Container Registry, you'll need these additional secrets:

| Secret Name | Description |
|-------------|-------------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username. |
| `DOCKERHUB_TOKEN` | Your Docker Hub access token (not your password). |

### Production Deployment Secrets

When you enable production deployment, you'll need these secrets:

| Secret Name | Description |
|-------------|-------------|
| `PROD_SSH_KEY` | Private SSH key for accessing the production server. |
| `PROD_HOST` | Hostname or IP address of your production server. |
| `PROD_USER` | Username for SSH access to your production server. |

### Environment Variables

For deployment environments, you might need to set these secrets:

| Secret Name | Description |
|-------------|-------------|
| `PROD_ENV_FILE` | Base64-encoded content of a .env file for production. |
| `JWT_SECRET` | Secret key for JWT token generation and verification. |
| `S3_ACCESS_KEY` | AWS S3 access key or MinIO access key. |
| `S3_SECRET_KEY` | AWS S3 secret key or MinIO secret key. |
| `DB_PASSWORD` | Database password for production. |

## How to Set Up Secrets in GitHub

1. Navigate to your GitHub repository.
2. Go to **Settings** > **Secrets and variables** > **Actions**.
3. Click on **New repository secret**.
4. Enter the name of the secret and its value.
5. Click **Add secret**.

## Modifying the Workflow to Use These Secrets

If you need to use these secrets in the workflow, you can access them using the following syntax:

```yaml
${{ secrets.SECRET_NAME }}
```

For example, to use the `JWT_SECRET`:

```yaml
env:
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

## Switching to Docker Hub

If you want to use Docker Hub instead of GitHub Container Registry, you need to modify the `.github/workflows/main.yml` file:

1. Change the `REGISTRY` environment variable:

```yaml
env:
  REGISTRY: docker.io
  BACKEND_IMAGE_NAME: yourusername/cosmo-backend
```

2. Update the login action:

```yaml
- name: Log in to Docker Hub
  uses: docker/login-action@v2
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}
```

## Enabling Production Deployment

To enable the production deployment step, change the `if: false` to `if: true` in the deployment step and implement your deployment script.

```yaml
- name: Deploy to production
  if: true 
  run: |
    # Set up SSH key
    mkdir -p ~/.ssh
    echo "${{ secrets.PROD_SSH_KEY }}" > ~/.ssh/id_rsa
    chmod 600 ~/.ssh/id_rsa
    
    # Deploy using SSH
    ssh ${{ secrets.PROD_USER }}@${{ secrets.PROD_HOST }} "cd /path/to/app && docker-compose pull && docker-compose up -d"
```