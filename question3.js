const axios = require("axios");

async function parse(inputArray) {
  try {

    const response = await axios('https://api.fliplet.com/v1/widgets/assets');
    const { assets = {} } = response.data || {}; 
    

    const result = findAllAssetsPaths(assets, inputArray)

    return result;
  } catch(error) {
    console.log("Error:: fetching assets");
    throw error;
  }

}

function findAllAssetsPaths(assets, inputArray) {

  
  const filteredAsset = Object.keys(assets).filter(asset => inputArray.some(toParse => asset === toParse)).map(key => assets[key])
  
  const resultToSend = []
  if (!filteredAsset) return;

  for (const asset of filteredAsset) {
    const minimumVersion = Object.keys(asset.versions).reduce((p, c) => p > c ? p : c, '')

    resultToSend.push(asset.versions[minimumVersion])

    if (asset.dependencies) resultToSend.push(findAllAssetsPaths(assets, asset.dependencies).flat());
  }

  return removeDuplicates(resultToSend.flat());
}

function removeDuplicates(arr) {
  return arr.filter((el, index) => arr.indexOf(el) === index);
}

parse(['bootstrap', 'fliplet-core', 'moment', 'jquery']).then(function (assets) {
  /*
   
   assets is expected to be an array with the
   following values in the same order as here:
   
   [
   	 "fonts/glyphicons-halflings-regular.ttf",
		 "fonts/glyphicons-halflings-regular.woff",
		 "fonts/glyphicons-halflings-regular.woff2",
     'bootstrap-css.bundle.css',
     'bootstrap-js.bundle.js',
     'jquery.js',
   	 'fliplet-core.bundle.css',
		 'fliplet-core.bundle.js',
     'moment.min.js'
   ]
   
   */
   
   console.log('The list is', assets);
});