# node-pdf-form-to-json [![GitHub version][gh-image]][gh-url]


> Extract fillable pdf form values to json

## Installation

```sh
$ npm install --save thinusn/node-pdf-form-to-json
```


## Dependencies 
This mudule requires `pdftk` to work, ensure it is available on your path. 


## Usage

```js
var nodePdfFormToJson = require('node-pdf-form-to-json');

nodePdfFormToJson.getDataFields('path/to/my-pdf.pdf', function(data){
  console.lof(data);
});
```

# TODO
- unit tests
- make improvements

## License
MIT

[gh-image]: https://badge.fury.io/gh/thinusn%2Fnode-pdf-form-to-json.svg
[gh-url]: https://github.com/thinusn/node-pdf-form-to-json
