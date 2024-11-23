#!/bin/bash

# Define the project name
PROJECT_NAME="TEV"

# Create a directory for the project and navigate into it
mkdir $PROJECT_NAME
cd $PROJECT_NAME

# Initialize the project as a monorepo
echo "Initializing monorepo..."
npm init -y
npm install -g @angular/cli

# Create the Angular application
echo "Creating Angular app..."
ng new frontend --routing --style=scss --skip-install
cd frontend
npm install

# Generate folder structure using Angular CLI
echo "Generating components, pages, and services..."
ng generate module shared/components --module app --flat
ng generate module shared/pages --module app --flat
ng generate module shared/services --module app --flat

# Generate example components, pages, and service
ng generate component shared/components/example-component --module shared/components
ng generate component shared/pages/example-page --module shared/pages
ng generate service shared/services/api --module shared/services

# Add an example API call in the generated service
cat <<EOL > src/app/shared/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getStatus(): Observable<any> {
    return this.http.get(\`\${this.baseUrl}/status\`);
  }
}
EOL

cd ..

# Create the backend folder for APIs
echo "Setting up backend folder for APIs..."
mkdir backend
cd backend
npm init -y
npm install express body-parser cors
cat <<EOL > server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/api/status', (req, res) => {
  res.json({ status: 'TEV API is running' });
});

const PORT = 3000;
app.listen(PORT, () => console.log(\`Server is running on port \${PORT}\`));
EOL
cd ..

# Install Angular Material (optional)
echo "Installing Angular Material..."
cd frontend
ng add @angular/material
cd ..

# Create a README file
cat <<EOL > README.md
# TEV Monorepo

## Structure
- \`frontend\`: Angular app for the frontend
- \`backend\`: Node.js Express API server

## Getting Started
1. Start the backend server:
   \`\`\`
   cd backend
   node server.js
   \`\`\`

2. Start the frontend Angular app:
   \`\`\`
   cd frontend
   ng serve
   \`\`\`

Access the app at [http://localhost:4200](http://localhost:4200).
EOL

# Initialize a Git repository
echo "Initializing Git repository..."
git init
git add .
git commit -m "Initial setup for TEV Monorepo"

echo "Setup complete! Navigate into the $PROJECT_NAME directory and follow the instructions in the README."
