const compile = require('es6-template-strings/compile');
const fs = require('fs');
const resolveToString = require('es6-template-strings/resolve-to-string');

const versionFilePath = 'version.txt';
const generateFilesSpec = [
  {
    templatePath: 'templates/version-js.template',
    outputPath: 'src/common/version.js',
  },
  {
    templatePath: 'templates/umd-bootstrapper-js.template',
    outputPath: 'umd-bootstrapper.js',
  },
];

buildFileOutput = (semVersionString, buildVersion, template) => {
  const compiled = compile(template);
  return resolveToString(compiled, {semVersionString, buildVersion});
};

generateFile = (semVersionString, templateFile, outputFile) => {
  const buildVersion = process.env['BUILD_VERSION'] || 'dev';
  fs.exists(outputFile, (exists) => {
    if (exists) return console.log(`${outputFile} exists. Exiting...`);
    fs.readFile(templateFile, 'utf8', (error, contents) => {
      if (error) return console.log(error);
      const outputFileContents = buildFileOutput(
          semVersionString, buildVersion, contents);
      fs.writeFile(outputFile, outputFileContents, (error) => {
        if (error) return console.log(error);
        console.log(`Wrote ${outputFile} file!`);
      });
    });
  });
};

generateFiles = (filesSpec, semVersionString) => {
  filesSpec.forEach((fileSpec) => {
    const templateFile = fileSpec.templatePath;
    const outputFile = fileSpec.outputPath;
    generateFile(semVersionString, templateFile, outputFile);
  });
};


fs.exists(versionFilePath, (exists) => {
  if (!exists) {
    return console.log(`${versionFilePath} file not found. Exiting...`);
  }

  // Environment variable VERSION_TXT_OVERRIDE can be used to override the
  // contents of version.txt for testing
  if (process.env['VERSION_TXT_OVERRIDE']) {
    generateFiles(generateFilesSpec, process.env['VERSION_TXT_OVERRIDE']);
  } else {
    fs.readFile(versionFilePath, 'utf8', (error, contents) => {
      if (error) return console.log(error);
      generateFiles(generateFilesSpec, contents.trim());
    });
  }
});
