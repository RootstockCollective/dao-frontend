# DAO Frontend Helm Chart

Simple Helm chart for deploying dao-frontend to Kubernetes.

## Prerequisites

1. Kubernetes cluster (rscoll-dev) with External Secrets Operator installed
2. AWS Systems Manager Parameter Store parameters (already exist for all environments)
3. ECR images available in respective repositories

## Quick Deploy

### 1. Deploy with Helm

Deploy to specific environments using environment-specific values files.

**Note:** Each environment deploys to its own namespace:
- `dao-frontend-dev` for development
- `dao-frontend-qa` for QA
- `dao-frontend-cr-qa` for CR QA
- `dao-frontend-rc-testnet` for RC Testnet
- `dao-frontend-rc-mainnet` for RC Mainnet

```bash
# Deploy to dev
helm upgrade --install dao-frontend-dev ./helm -f helm/values-dev.yaml

# Deploy to DAO QA
helm upgrade --install dao-frontend-qa ./helm -f helm/values-qa.yaml

# Deploy to CR QA
helm upgrade --install dao-frontend-cr-qa ./helm -f helm/values-cr-qa.yaml

# Deploy to RC Testnet
helm upgrade --install dao-frontend-rc-testnet ./helm -f helm/values-rc-testnet.yaml

# Deploy to RC Mainnet
helm upgrade --install dao-frontend-rc-mainnet ./helm -f helm/values-rc-mainnet.yaml

# Override image tag for any environment
helm upgrade --install dao-frontend-dev ./helm \
  -f helm/values-dev.yaml \
  --set image.tag=<GIT_SHA>
```

## Environment Files

| File | Environment | ECR Repository | Latest Image (as of Jan 21, 2026) |
|------|-------------|----------------|-----------------------------------|
| `values-dev.yaml` | Development | `rscoll-dev-dao-dev` | `930eac4...` |
| `values-qa.yaml` | DAO QA | `rscoll-dev-dao-qa` | `14231be...` |
| `values-cr-qa.yaml` | CR QA | `rscoll-dev-bim-qa` | `615a41a...` |
| `values-rc-testnet.yaml` | RC Testnet | `rscoll-dev-dao-staging` | `639c687...` |
| `values-rc-mainnet.yaml` | RC Mainnet | `rscoll-dev-dao-rc-mainnet` | `639c687...` |

**Parameters are automatically pulled from AWS Systems Manager Parameter Store based on the environment.**

## Configuration

Key values in `values.yaml`:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `image.repository` | ECR repository | `886436934082.dkr.ecr.us-east-1.amazonaws.com/rscoll-dev-dao-dev` |
| `image.tag` | Image tag | `930eac49828502453196eb19cb032ae441c4b8a5` |
| `replicaCount` | Number of replicas | `2` |
| `namespace` | Kubernetes namespace | `dao-frontend` |
| `externalSecrets.parameterPaths` | Parameter Store paths | See environment-specific values files |
| `ingress.enabled` | Enable ingress | `false` |

## Common Commands

```bash
# Install (replace 'dev' with your environment)
ENVIRONMENT=dev
helm install dao-frontend-${ENVIRONMENT} ./helm -f helm/values-${ENVIRONMENT}.yaml

# Install with custom image tag
helm install dao-frontend-${ENVIRONMENT} ./helm -f helm/values-${ENVIRONMENT}.yaml --set image.tag=v1.2.3

# Upgrade
helm upgrade dao-frontend-${ENVIRONMENT} ./helm -f helm/values-${ENVIRONMENT}.yaml --set image.tag=v1.2.4

# Uninstall
helm uninstall dao-frontend-${ENVIRONMENT}

# View values
helm get values dao-frontend-${ENVIRONMENT}

# View manifest (for testing)
helm template dao-frontend-${ENVIRONMENT} ./helm -f helm/values-${ENVIRONMENT}.yaml

# Dry run
helm install dao-frontend-${ENVIRONMENT} ./helm -f helm/values-${ENVIRONMENT}.yaml --dry-run --debug
```

## CI/CD Usage

In your CI/CD pipeline:

```bash
# Build and push image (update ECR_REPO based on environment)
ECR_REPO=886436934082.dkr.ecr.us-east-1.amazonaws.com/rscoll-dev-dao-dev
docker build -t ${ECR_REPO}:${GITHUB_SHA} .
docker push ${ECR_REPO}:${GITHUB_SHA}

# Deploy to cluster
helm upgrade --install dao-frontend-dev ./helm \
  -f helm/values-dev.yaml \
  --set image.tag=${GITHUB_SHA} \
  --wait
```

## Verify Deployment

Each environment deploys to its own namespace:

```bash
# Check all dao-frontend environments
kubectl get namespaces | grep dao-frontend
kubectl get pods --all-namespaces | grep dao-frontend

# Check specific environment (replace 'dev' with qa, cr-qa, rc-testnet, or rc-mainnet)
ENVIRONMENT=dev

# Check release status
helm status dao-frontend-${ENVIRONMENT}

# Check pods
kubectl get pods -n dao-frontend-${ENVIRONMENT}

# Check service
kubectl get svc -n dao-frontend-${ENVIRONMENT}

# Check ingress
kubectl get ingress -n dao-frontend-${ENVIRONMENT}

# View logs
kubectl logs -n dao-frontend-${ENVIRONMENT} -l app.kubernetes.io/name=dao-frontend -f

# Check External Secret sync
kubectl get externalsecret -n dao-frontend-${ENVIRONMENT}
kubectl describe externalsecret dao-frontend-secrets -n dao-frontend-${ENVIRONMENT}
```

### Quick Commands by Environment:

```bash
# Dev
kubectl get pods -n dao-frontend-dev
kubectl logs -n dao-frontend-dev -l app.kubernetes.io/name=dao-frontend -f

# QA
kubectl get pods -n dao-frontend-qa
kubectl logs -n dao-frontend-qa -l app.kubernetes.io/name=dao-frontend -f

# CR QA
kubectl get pods -n dao-frontend-cr-qa
kubectl logs -n dao-frontend-cr-qa -l app.kubernetes.io/name=dao-frontend -f

# RC Testnet
kubectl get pods -n dao-frontend-rc-testnet
kubectl logs -n dao-frontend-rc-testnet -l app.kubernetes.io/name=dao-frontend -f

# RC Mainnet
kubectl get pods -n dao-frontend-rc-mainnet
kubectl logs -n dao-frontend-rc-mainnet -l app.kubernetes.io/name=dao-frontend -f
```

## Rollback

```bash
# View history (replace 'dev' with your environment)
ENVIRONMENT=dev
helm history dao-frontend-${ENVIRONMENT}

# Rollback to previous version
helm rollback dao-frontend-${ENVIRONMENT}

# Rollback to specific revision
helm rollback dao-frontend-${ENVIRONMENT} 2

# Examples for specific environments:
helm rollback dao-frontend-dev        # Rollback dev to previous
helm rollback dao-frontend-qa 3       # Rollback qa to revision 3
```
