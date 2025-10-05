# Stateful App

A beautiful, sleek, and sophisticated authentication application with a modern UI. Built with React, Node.js, PostgreSQL, and Docker.

## Features

- ✨ Modern, gradient-based UI design
- 🔐 Secure authentication (login/register)
- 📊 User dashboard with session tracking
- 🗄️ PostgreSQL database for persistent storage
- 🐳 Fully Dockerized for easy deployment
- 🎨 Responsive design with CSS modules

## Tech Stack

**Frontend:**
- React 18
- React Router
- Zustand (state management)
- Vite
- CSS Modules

**Backend:**
- Node.js + Express
- PostgreSQL
- JWT authentication
- bcrypt password hashing

**Infrastructure:**
- Docker & Docker Compose
- PostgreSQL 15

## Quick Start

### Prerequisites

- Docker Desktop installed
- Docker Compose installed

### Running the Application

1. Clone this repository

2. Start all services with Docker Compose:
```bash
docker-compose up --build
```

3. Access the application:
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:3000
   - **Database**: localhost:5432

### First Time Setup

1. Navigate to http://localhost:5173
2. Click "Sign up" to create a new account
3. Fill in your details and register
4. You'll be automatically logged in and redirected to the dashboard

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login with email/username and password

### User
- `GET /api/user/me` - Get current user profile (requires auth)
- `GET /api/user/sessions` - Get user's login sessions (requires auth)
- `PATCH /api/user/me` - Update user profile (requires auth)

### Health
- `GET /api/health` - Check API health status

## Environment Variables

The default configuration in `docker-compose.yml` includes:

**Backend:**
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens (change in production!)
- `PORT`: Server port (default: 3000)

**Frontend:**
- `VITE_API_URL`: Backend API URL

**Database:**
- `POSTGRES_USER`: admin
- `POSTGRES_PASSWORD`: secure_password
- `POSTGRES_DB`: stateful_app

⚠️ **Security Note**: Change the default passwords and JWT secret before deploying to production!

## Development

### Backend Development

```bash
cd backend
npm install
npm run dev
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   └── init.js          # Database initialization
│   │   ├── middleware/
│   │   │   └── auth.js          # JWT authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.js          # Auth routes
│   │   │   └── user.js          # User routes
│   │   └── index.js             # Express server
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Auth.module.css
│   │   │   └── Dashboard.module.css
│   │   ├── store/
│   │   │   └── authStore.js     # Zustand state management
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

## Database Schema

### Users Table
- `id` - Serial primary key
- `email` - Unique email address
- `username` - Unique username
- `password_hash` - Bcrypt hashed password
- `full_name` - Optional full name
- `avatar_url` - Optional avatar URL
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### Sessions Table
- `id` - Serial primary key
- `user_id` - Foreign key to users
- `ip_address` - Login IP address
- `user_agent` - Browser user agent
- `created_at` - Session creation timestamp

## Stopping the Application

```bash
docker-compose down
```

To remove all data (including database):
```bash
docker-compose down -v
```

## Build & Push Images (after local test)

Follow these steps once you’ve run locally and are ready to publish images to Docker Hub.

1) Backend
- Build: `cd backend && docker build -t <dockerhub-user>/devops-academy-storage-backend:latest .`
- Optional test locally: `docker run --rm -p 3000:3000 <dockerhub-user>/devops-academy-storage-backend:latest`
- Push: `docker push <dockerhub-user>/devops-academy-storage-backend:latest`

2) Frontend
- Build: `cd ../frontend && docker build -t <dockerhub-user>/devops-academy-storage-frontend:latest .`
- Optional test locally: `docker run --rm -p 8080:80 <dockerhub-user>/devops-academy-storage-frontend:latest`
- Push: `docker push <dockerhub-user>/devops-academy-storage-frontend:latest`

Tip: Use unique tags (e.g., dates or git SHAs) for repeatable deployments, and set those tags in Helm.

## Deploy to EKS with Helm

Prerequisites
- kubectl pointing at your EKS cluster
- Helm 3 installed
- NGINX Ingress Controller installed (internet-facing NLB), e.g.: `helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx -n ingress-nginx --create-namespace -f helm/ingress-nginx-values.eks.yaml`
- cert-manager installed for TLS: `helm upgrade --install cert-manager jetstack/cert-manager -n cert-manager --create-namespace --set crds.enabled=true`
- DNS record pointing your domain to the NGINX LoadBalancer hostname

Update images in Helm values
- Edit `helm/devops-academy/values.yaml` and set:
  - `backend.image.repository: <dockerhub-user>/devops-academy-storage-backend`
  - `backend.image.tag: <tag>` (use `latest` or your chosen tag)
  - `frontend.image.repository: <dockerhub-user>/devops-academy-storage-frontend`
  - `frontend.image.tag: <tag>`

Or override on the command line:
```
helm upgrade --install devops-academy ./helm/devops-academy -n default --dependency-update \
  --set backend.image.repository=<dockerhub-user>/devops-academy-storage-backend \
  --set backend.image.tag=<tag> \
  --set frontend.image.repository=<dockerhub-user>/devops-academy-storage-frontend \
  --set frontend.image.tag=<tag>
```

Install/Upgrade the release
```
helm upgrade --install devops-academy ./helm/devops-academy -n default --dependency-update -f helm/devops-academy/values.yaml
```

Verify
- `kubectl get pods,svc,ingress -n default`
- `kubectl get ingress devops-academy-ingress -n default -o wide`
- `kubectl -n default get certificate devops-academy-tls` (if using cert-manager)

## Helm Chart Overview

- Location: `helm/devops-academy`
- Dependencies: Bitnami PostgreSQL (declared in `Chart.yaml`); the chart uses `global.imageRegistry: public.ecr.aws` and pins Bitnami images to AWS Public ECR to avoid Docker Hub rate limits.
- Values (key excerpts in `values.yaml`):
  - `backend` and `frontend` images, resources, Services, and HPAs
  - `frontend.service.type: ClusterIP` so traffic goes only through Ingress
  - `ingress` with `className: nginx`, TLS via cert-manager annotations, and path routing (`/` to frontend, `/api` to backend)
  - `postgresql.primary.persistence.storageClass: gp3` for EBS volumes on EKS
- Templates:
  - Deployments/Services for backend and frontend
  - Ingress routing to services
  - Secret for `JWT_SECRET` (mounted from Helm values)
  - HPAs for autoscaling where enabled

Operational notes
- Ensure DNS host in `values.yaml` matches your public record
- Provide strong values for `postgresql.auth.password` and `backend.env.JWT_SECRET`
- Consider pinning image tags (avoid `latest`) for predictable rollouts

---

DevOps Academy — Practical Cloud Native Deployments

## License

MIT
