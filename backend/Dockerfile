# syntax=docker/dockerfile:1

# Use an official Node.js runtime as a parent image
FROM node:22.3.0-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of your application code to the working directory
COPY . .

# Build the files
RUN npx tsc

# Expose the port that the application listens on.
EXPOSE 3001

# Run the application.
CMD npm run dev
