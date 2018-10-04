// example using express.js:
var excelToJson = require('convert-excel-to-json');
var writeJsonFile = require('write-json-file')
var _ = require('underscore');

var result = excelToJson({
  sourceFile: 'data/Book1.xlsx'
});

result = result.Sheet1;

result = result.filter(x=> x['A'].startsWith(2) || x['A'].startsWith(3))

var grouped = _.groupBy(result, function(x){
  var prop = x['A'];
  var reg = prop.substring(5, 14)
  return reg;
});

console.log(Object.keys(grouped).length);

(async () => {
  await writeJsonFile('foo.json', grouped);
})();

