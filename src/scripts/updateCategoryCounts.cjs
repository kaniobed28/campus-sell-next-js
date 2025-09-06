// updateCategoryCounts.cjs
// CommonJS script to update category product counts

const { exec } = require('child_process');

// Run the Next.js script using the Next.js environment
exec('npm run update-category-counts', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Stdout: ${stdout}`);
});