#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Starting deployment of Demo Notes application...${NC}"

# Create namespace if it doesn't exist
echo -e "${YELLOW}Creating namespace...${NC}"
kubectl create namespace demo-notes --dry-run=client -o yaml | kubectl apply -f -

# Create PostgreSQL password secret
echo -e "${YELLOW}Creating PostgreSQL secret...${NC}"
POSTGRES_PASSWORD=$(openssl rand -base64 32)
kubectl create secret generic demo-notes-secrets \
  --from-literal=POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
  -n demo-notes --dry-run=client -o yaml | kubectl apply -f -

# Apply Kubernetes manifests in the correct order
echo -e "${YELLOW}Applying Kubernetes manifests...${NC}"
kubectl apply -f k8s/postgres-pvc.yaml -n demo-notes
kubectl apply -f k8s/postgres.yaml -n demo-notes
kubectl apply -f k8s/backend.yaml -n demo-notes
kubectl apply -f k8s/frontend.yaml -n demo-notes

# Wait for pods to be ready
echo -e "${YELLOW}Waiting for pods to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=postgres -n demo-notes --timeout=120s
kubectl wait --for=condition=ready pod -l app=backend -n demo-notes --timeout=120s
kubectl wait --for=condition=ready pod -l app=frontend -n demo-notes --timeout=120s

# Get the frontend service URL
echo -e "${YELLOW}Getting application URL...${NC}"
FRONTEND_IP=$(kubectl get service frontend -n demo-notes -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo -e "${GREEN}Application is deployed!${NC}"
echo -e "${GREEN}You can access the application at: http://$FRONTEND_IP${NC}"

# Show pods status
echo -e "${YELLOW}Current pod status:${NC}"
kubectl get pods -n demo-notes
