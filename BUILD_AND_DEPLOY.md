# Build and Deploy Guide for EKS

## Prerequisites

1. Docker installed and running
2. AWS CLI configured
3. kubectl installed
4. Helm 3 installed
5. Docker Hub account

## Step 1: Build and Push Docker Images

### Backend
```bash
cd backend

# Build the image
docker build -t your-dockerhub-username/devops-academy-backend:latest .
docker build -t ivykiera/devops-academy-storage-frontend:latest .


# Push to Docker Hub
docker push your-dockerhub-username/devops-academy-backend:latest
```

### Frontend
```bash
cd ../frontend

# Build the image
docker build -t your-dockerhub-username/devops-academy-frontend:latest .

# Push to Docker Hub
docker push your-dockerhub-username/devops-academy-frontend:latest
```

## Step 2: Update Helm Values

Edit `helm/devops-academy/values.yaml`:

```yaml
backend:
  image:
    repository: your-dockerhub-username/devops-academy-backend  # Change this

frontend:
  image:
    repository: your-dockerhub-username/devops-academy-frontend  # Change this

ingress:
  hosts:
    - host: your-domain.com  # Change this
  tls:
    - secretName: devops-academy-tls
      hosts:
        - your-domain.com  # Change this
```

## Step 3: Connect to EKS Cluster

```bash
aws eks update-kubeconfig --region us-east-1 --name your-cluster-name
```

## Step 4: Add Bitnami Helm Repository

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
```

## Step 5: Install the Helm Chart

```bash
# Install with default values
helm install devops-academy ./helm/devops-academy

# Or install with custom values
helm install devops-academy ./helm/devops-academy \
  --set backend.image.repository=your-dockerhub-username/devops-academy-backend \
  --set frontend.image.repository=your-dockerhub-username/devops-academy-frontend \
  --set postgresql.auth.password=your-secure-password \
  --set backend.env.JWT_SECRET=your-super-secret-jwt-key
```

## Step 6: Verify Deployment

```bash
# Check pods
kubectl get pods

# Check services
kubectl get svc

# Check ingress
kubectl get ingress

# Watch deployment
kubectl get pods -w
```

## Step 7: Get Application URL

### If using LoadBalancer:
```bash
kubectl get svc frontend
# Copy the EXTERNAL-IP
```

### If using Ingress:
```bash
kubectl get ingress
# Use the configured domain
```

## Step 8: Update DNS (if using Ingress)

Point your domain to the Load Balancer created by the Ingress controller.

## Useful Commands

### View Logs
```bash
# Backend logs
kubectl logs -l app=backend -f

# Frontend logs
kubectl logs -l app=frontend -f

# PostgreSQL logs
kubectl logs -l app.kubernetes.io/name=postgresql -f
```

### Scale Deployments
```bash
kubectl scale deployment backend --replicas=3
kubectl scale deployment frontend --replicas=3
```

### Update Deployment
```bash
# After pushing new images
helm upgrade devops-academy ./helm/devops-academy

# Or force rollout
kubectl rollout restart deployment backend
kubectl rollout restart deployment frontend
```

### Uninstall
```bash
helm uninstall devops-academy
```

## Troubleshooting

### Pod Not Starting
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Database Connection Issues
```bash
# Check PostgreSQL service
kubectl get svc | grep postgresql

# Test connection from backend pod
kubectl exec -it <backend-pod-name> -- sh
# Inside pod: nc -zv devops-academy-postgresql 5432
```

### Image Pull Errors
- Ensure images are public on Docker Hub, or
- Create image pull secret for private repos:
```bash
kubectl create secret docker-registry regcred \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username=your-username \
  --docker-password=your-password
```

Then add to values.yaml:
```yaml
imagePullSecrets:
  - name: regcred
```

## Production Considerations

1. **Secrets Management**: Use AWS Secrets Manager or Sealed Secrets instead of plain values
2. **SSL/TLS**: Configure cert-manager for automatic SSL certificates
3. **Monitoring**: Add Prometheus and Grafana for monitoring
4. **Backup**: Set up PostgreSQL backups to S3
5. **Resource Limits**: Adjust based on actual usage patterns
6. **Autoscaling**: Configure cluster autoscaler for EKS
