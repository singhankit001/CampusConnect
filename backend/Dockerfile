FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client and build TypeScript
RUN npx prisma generate
RUN npm run build

EXPOSE 5000

# Start script ensures migrations are run before starting the server
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
