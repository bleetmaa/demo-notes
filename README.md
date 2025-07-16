# Demo Notes Application

A full-stack demo application built with Vue.js, Node.js, and PostgreSQL, deployed to Kubernetes.

## Project Structure

```
demo-notes/
├── frontend/         # Vue.js frontend application
├── backend/         # Node.js backend application
├── k8s/            # Kubernetes manifests
└── .github/        # GitHub Actions workflows
```

## Prerequisites

- Node.js 18+
- Docker
- Kubernetes cluster
- Azure subscription (for ACR and AKS)

## Local Development

1. Install dependencies:
```bash
npm run install:all
```

2. Start the development servers:
```bash
npm run dev
```

## Deployment

The application is automatically deployed to Kubernetes using GitHub Actions when changes are pushed to the main branch.

### Required Secrets

Add the following secrets to your GitHub repository:

- `KUBE_CONFIG`: Your Kubernetes cluster configuration file content (base64 encoded)
- `GITHUB_TOKEN`: Automatically provided by GitHub (used for container registry)

### Configuration

Update the following files with your specific values:

1. `.github/workflows/ci-cd.yaml`:
   - `CLUSTER_NAME`
   - Update the kubectl context name

2. Update Kubernetes manifests in `k8s/` directory as needed.

## Database

PostgreSQL is deployed as a pod in the Kubernetes cluster. The database configuration can be modified in `k8s/postgres.yaml`.
