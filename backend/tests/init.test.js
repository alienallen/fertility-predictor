describe('Backend Initialization', () => {
  test('should have package.json with required dependencies', () => {
    const fs = require('fs');
    const path = require('path');

    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    expect(packageJson.name).toBe('fertility-predictor-backend');
    expect(packageJson.dependencies).toHaveProperty('express');
    expect(packageJson.dependencies).toHaveProperty('mongoose');
    expect(packageJson.dependencies).toHaveProperty('dotenv');
  });

  test('should have db.js config file', () => {
    const fs = require('fs');
    const path = require('path');

    const dbConfigPath = path.join(__dirname, '..', 'src', 'config', 'db.js');
    expect(fs.existsSync(dbConfigPath)).toBe(true);
  });

  test('should have app.js entry file', () => {
    const fs = require('fs');
    const path = require('path');

    const appPath = path.join(__dirname, '..', 'src', 'app.js');
    expect(fs.existsSync(appPath)).toBe(true);
  });
});