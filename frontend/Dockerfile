# Frontend Dockerfile
FROM node:18-alpine as build

# Accept build arguments for environment variables
ARG REACT_APP_API_BASE_URL
ARG REACT_APP_ENVIRONMENT
ARG REACT_APP_VERSION

# Set environment variables for the build process
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
ENV REACT_APP_ENVIRONMENT=$REACT_APP_ENVIRONMENT
ENV REACT_APP_VERSION=$REACT_APP_VERSION

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the app with environment variables
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 