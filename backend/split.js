const fs = require('fs');
const path = require('path');

const crudFilePath = path.join(__dirname, 'src', 'routes', 'crud.ts');
const crudFileContent = fs.readFileSync(crudFilePath, 'utf-8');

const crudDir = path.join(__dirname, 'src', 'routes', 'crud');
if (!fs.existsSync(crudDir)) {
  fs.mkdirSync(crudDir);
}

// Extract imports (top of the file before the first ====)
const firstSplitIndex = crudFileContent.indexOf('// =========================================================================');
let imports = crudFileContent.substring(0, firstSplitIndex);

// Add default exports to imports if not there
imports = imports.replace("const router = Router();", "const router = Router();\n");

const sections = crudFileContent.substring(firstSplitIndex).split(/\/\/ =========================================================================\n\/\/ \d+\. (.+) CRUD\n\/\/ =========================================================================\n/);

const routeFiles = [];

// sections[0] is empty or just the first separator. 
// sections is like ["", "STUDENTS", "content", "FACULTY", "content"]
for (let i = 1; i < sections.length; i += 2) {
    const title = sections[i].trim();
    const content = sections[i + 1];
    
    // Convert title to filename e.g. "STUDENTS" -> "students"
    let filename = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (title.includes('INTERNSHIPS')) filename = 'internships'; // Edge case for "(Recruiter / Admin)"
    
    routeFiles.push(filename);
    
    const fileContent = `${imports}

${content.trim()}

export default router;
`;
    fs.writeFileSync(path.join(crudDir, `${filename}.ts`), fileContent);
}

// Generate new crud.ts
let newCrudTs = `import { Router } from 'express';\nimport { authenticateToken } from '../middleware/auth';\n\n`;
routeFiles.forEach(f => {
    newCrudTs += `import ${f}Router from './crud/${f}';\n`;
});

newCrudTs += `\nconst router = Router();\n\n// Ensure all routes in this router are authenticated\nrouter.use(authenticateToken);\n\n`;

routeFiles.forEach(f => {
    newCrudTs += `router.use('/', ${f}Router);\n`;
});

newCrudTs += `\nexport default router;\n`;

fs.writeFileSync(crudFilePath, newCrudTs);

console.log("Successfully split crud.ts into " + routeFiles.length + " files: " + routeFiles.join(', '));
