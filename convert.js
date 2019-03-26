const fs = require('fs');
const path = require('path');
const btoa = require('btoa');

const ConvertFileSuffix = ['.less', '.css']
const SvgRegex = /(?:['"])(.*?\.svg)(?:["'])/g;

const hasSvgInLine = line => /.*\.svg/.test(line);

const convert = folder => {
  let processed = false;
  fs.readdir(folder, (error, files) => {
    files && files.filter(file => ConvertFileSuffix.some(suffix => file.endsWith(suffix)))
      .forEach(file => {
        fs.readFile(path.join(folder, file), 'utf8', (error, data) => {
          const convertedData = data.split("\n").map(line => {
            if (hasSvgInLine(line)) {
              const matched = line.match(SvgRegex);
              const results = matched
                .map(svg => svg.replace(/['"]/g, ""))
                .forEach(svg => {
                  const svgString = fs.readFileSync(path.join(folder, svg), 'utf8');
                  line = line.replace(svg, `data:image/svg+xml;base64,${btoa(svgString)}`)
                });
              processed = true;
            }
            return line;
          }).join('\n');
          fs.writeFile(path.join(folder, file), convertedData, error => {
            error && console.error(error)
          })
          processed && console.log("Successfully convert file", file);
          processed = false;
        })
      })
  })
}
const args = require('minimist')(process.argv.slice(2));

if (args.f) {
  convert(args.f);
} else {
  console.log("Please pass folder name parameter like '-f ./dist'");
}