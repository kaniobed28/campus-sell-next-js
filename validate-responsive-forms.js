#!/usr/bin/env node

/**
 * Validation script for responsive form components
 * Tests the implementation against the requirements
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Validating Responsive Form Components Implementation...\n');

const componentsDir = path.join(__dirname, 'src', 'components', 'ui');
const examplesDir = path.join(__dirname, 'src', 'components', 'examples');

// Check if required files exist
const requiredFiles = [
  'src/components/ui/Button.jsx',
  'src/components/ui/Input.jsx',
  'src/components/ui/Textarea.jsx',
  'src/components/ui/FormField.jsx',
  'src/components/ui/FormLayout.jsx',
  'src/components/ui/FormValidation.jsx',
  'src/components/ui/Select.jsx',
  'src/components/ui/Checkbox.jsx',
  'src/components/ui/Radio.jsx',
  'src/components/examples/ResponsiveFormExample.jsx',
  'src/app/test-responsive-forms/page.js',
];

let allFilesExist = true;

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing!');
  process.exit(1);
}

// Check component implementations
console.log('\n🔍 Validating component implementations...');

// Check Button component for touch-friendly sizing
const buttonContent = fs.readFileSync(path.join(__dirname, 'src/components/ui/Button.jsx'), 'utf8');
const buttonChecks = [
  { check: buttonContent.includes('min-h-[44px]'), desc: 'Touch-friendly minimum height (44px)' },
  { check: buttonContent.includes('md:h-10'), desc: 'Responsive sizing for desktop' },
  { check: buttonContent.includes('touch:'), desc: 'Touch-specific size variant' },
];

console.log('🔘 Button Component:');
buttonChecks.forEach(({ check, desc }) => {
  console.log(`  ${check ? '✅' : '❌'} ${desc}`);
});

// Check Input component for responsive sizing
const inputContent = fs.readFileSync(path.join(__dirname, 'src/components/ui/Input.jsx'), 'utf8');
const inputChecks = [
  { check: inputContent.includes('h-12'), desc: 'Mobile-first sizing (h-12)' },
  { check: inputContent.includes('md:h-10'), desc: 'Desktop responsive sizing' },
  { check: inputContent.includes('min-h-[44px]'), desc: 'Touch target minimum height' },
  { check: inputContent.includes('text-base md:text-sm'), desc: 'Responsive text sizing' },
];

console.log('📝 Input Component:');
inputChecks.forEach(({ check, desc }) => {
  console.log(`  ${check ? '✅' : '❌'} ${desc}`);
});

// Check FormField component for validation display
const formFieldContent = fs.readFileSync(path.join(__dirname, 'src/components/ui/FormField.jsx'), 'utf8');
const formFieldChecks = [
  { check: formFieldContent.includes('role="alert"'), desc: 'Accessible error messages' },
  { check: formFieldContent.includes('aria-describedby'), desc: 'ARIA associations' },
  { check: formFieldContent.includes('svg'), desc: 'Visual error/success indicators' },
  { check: formFieldContent.includes('md:text-xs'), desc: 'Responsive text sizing' },
];

console.log('📋 FormField Component:');
formFieldChecks.forEach(({ check, desc }) => {
  console.log(`  ${check ? '✅' : '❌'} ${desc}`);
});

// Check FormLayout component for adaptive layouts
const formLayoutContent = fs.readFileSync(path.join(__dirname, 'src/components/ui/FormLayout.jsx'), 'utf8');
const formLayoutChecks = [
  { check: formLayoutContent.includes('grid-cols-1'), desc: 'Mobile-first single column' },
  { check: formLayoutContent.includes('md:grid-cols-2'), desc: 'Tablet two-column layout' },
  { check: formLayoutContent.includes('lg:grid-cols-3'), desc: 'Desktop multi-column layout' },
  { check: formLayoutContent.includes('FormSection'), desc: 'Form section component' },
  { check: formLayoutContent.includes('FormActions'), desc: 'Form actions component' },
];

console.log('📐 FormLayout Component:');
formLayoutChecks.forEach(({ check, desc }) => {
  console.log(`  ${check ? '✅' : '❌'} ${desc}`);
});

// Check Select component for touch-friendly interface
const selectContent = fs.readFileSync(path.join(__dirname, 'src/components/ui/Select.jsx'), 'utf8');
const selectChecks = [
  { check: selectContent.includes('min-h-[44px]'), desc: 'Touch-friendly dropdown options' },
  { check: selectContent.includes('searchable'), desc: 'Search functionality' },
  { check: selectContent.includes('multiple'), desc: 'Multiple selection support' },
  { check: selectContent.includes('aria-haspopup'), desc: 'Accessibility attributes' },
];

console.log('📋 Select Component:');
selectChecks.forEach(({ check, desc }) => {
  console.log(`  ${check ? '✅' : '❌'} ${desc}`);
});

// Check Checkbox component for touch targets
const checkboxContent = fs.readFileSync(path.join(__dirname, 'src/components/ui/Checkbox.jsx'), 'utf8');
const checkboxChecks = [
  { check: checkboxContent.includes('min-h-[44px]'), desc: 'Touch-friendly container height' },
  { check: checkboxContent.includes('cursor-pointer'), desc: 'Clickable labels' },
  { check: checkboxContent.includes('CheckboxGroup'), desc: 'Group component for related checkboxes' },
  { check: checkboxContent.includes('focus-within:ring'), desc: 'Focus indicators' },
];

console.log('☑️ Checkbox Component:');
checkboxChecks.forEach(({ check, desc }) => {
  console.log(`  ${check ? '✅' : '❌'} ${desc}`);
});

// Check CSS enhancements
const cssContent = fs.readFileSync(path.join(__dirname, 'src/app/globals.css'), 'utf8');
const cssChecks = [
  { check: cssContent.includes('.touch-target'), desc: 'Touch target utility class' },
  { check: cssContent.includes('min-height: 44px'), desc: 'Touch target minimum height' },
  { check: cssContent.includes('.form-grid-'), desc: 'Responsive form grid utilities' },
  { check: cssContent.includes('@media (max-width: 767px)'), desc: 'Mobile-specific form styles' },
];

console.log('🎨 CSS Enhancements:');
cssChecks.forEach(({ check, desc }) => {
  console.log(`  ${check ? '✅' : '❌'} ${desc}`);
});

// Check example implementation
const exampleContent = fs.readFileSync(path.join(__dirname, 'src/components/examples/ResponsiveFormExample.jsx'), 'utf8');
const exampleChecks = [
  { check: exampleContent.includes('FormLayout'), desc: 'Uses responsive form layout' },
  { check: exampleContent.includes('FormValidationSummary'), desc: 'Validation summary implementation' },
  { check: exampleContent.includes('size="md"'), desc: 'Responsive sizing configuration' },
  { check: exampleContent.includes('columns={2}'), desc: 'Multi-column form layouts' },
  { check: exampleContent.includes('FieldStrengthIndicator'), desc: 'Password strength indicator' },
];

console.log('📋 Example Implementation:');
exampleChecks.forEach(({ check, desc }) => {
  console.log(`  ${check ? '✅' : '❌'} ${desc}`);
});

// Requirements validation
console.log('\n📋 Requirements Validation:');

const requirements = [
  {
    id: '1.3',
    desc: 'Touch-friendly buttons and links (min 44px)',
    check: buttonContent.includes('min-h-[44px]') && inputContent.includes('min-h-[44px]')
  },
  {
    id: '2.3',
    desc: 'Touch and hover interactions for tablet',
    check: buttonContent.includes('hover:') && selectContent.includes('hover:')
  },
  {
    id: '3.1',
    desc: 'Multi-column layout for desktop',
    check: formLayoutContent.includes('lg:grid-cols-3') || formLayoutContent.includes('lg:grid-cols-4')
  },
  {
    id: '4.1',
    desc: 'Consistent functionality across devices',
    check: inputContent.includes('md:') && buttonContent.includes('md:')
  }
];

requirements.forEach(({ id, desc, check }) => {
  console.log(`  ${check ? '✅' : '❌'} Requirement ${id}: ${desc}`);
});

// Summary
const totalChecks = buttonChecks.length + inputChecks.length + formFieldChecks.length + 
                   formLayoutChecks.length + selectChecks.length + checkboxChecks.length + 
                   cssChecks.length + exampleChecks.length + requirements.length;

const passedChecks = [
  ...buttonChecks, ...inputChecks, ...formFieldChecks, ...formLayoutChecks,
  ...selectChecks, ...checkboxChecks, ...cssChecks, ...exampleChecks, ...requirements
].filter(check => check.check).length;

console.log(`\n📊 Summary: ${passedChecks}/${totalChecks} checks passed (${Math.round(passedChecks/totalChecks*100)}%)`);

if (passedChecks === totalChecks) {
  console.log('🎉 All responsive form components implemented successfully!');
  console.log('\n🚀 Next steps:');
  console.log('  1. Visit /test-responsive-forms to see the components in action');
  console.log('  2. Test on different screen sizes (mobile, tablet, desktop)');
  console.log('  3. Verify touch interactions on mobile devices');
  console.log('  4. Test keyboard navigation and accessibility');
} else {
  console.log('⚠️  Some checks failed. Please review the implementation.');
  process.exit(1);
}

console.log('\n✨ Responsive form components validation complete!');