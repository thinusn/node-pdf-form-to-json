# node-pdf-form-to-json [![GitHub version][gh-image]][gh-url]


> Extract fillable pdf form values to json either as raw key value pairs or serialised json objects based on (this)[https://github.com/marioizquierdo/jquery.serializeJSON]

## Installation

```sh
$ npm install --save thinusn/node-pdf-form-to-json
```


## Dependencies 
This module requires `pdftk` to work, ensure it is available on your path. 


## Usage

```js
var nodePdfFormToJson = require('node-pdf-form-to-json');

nodePdfFormToJson.getDataFields('path/to/my-pdf.pdf', function(data){
  console.log(data);
});

nodePdfFormToJson.getDataFieldsSerialized('path/to/my-pdf.pdf', function(data){
  console.log(data);
});
```

## Example form and what gets returned
### Form 1
##### Layout of pdf
text box with name of `userFirstName` value `Harry`
text box with name of `userLastName` value `Potter`
##### Returns
###### `getDataFields` will return 
```
{
  userFirstName : 'Harry',
  userLastName : 'Potter'
}
```
###### `getDataFieldsSerialized` will return 
```
{
  userFirstName : 'Harry',
  userLastName : 'Potter'
}
```
### Form Example 2
##### Layout of pdf
text box with name of `user[firstName]` value `Harry`
text box with name of `user[lastName]` value `Potter`
##### Returns
###### `getDataFields` will return 
```
{
 'user[firstName]' : 'Harry',
 'user[lastName]' : 'Potter'
}
```
###### `getDataFieldsSerialized` will return 
```
{
 user: {
   firstName : 'Harry',
   lastName : 'Potter'
 }
}
```



# TODO
- unit tests
- make improvements

## License
MIT

[gh-image]: https://badge.fury.io/gh/thinusn%2Fnode-pdf-form-to-json.svg
[gh-url]: https://github.com/thinusn/node-pdf-form-to-json
