// https://gist.github.com/HMarzban/03f2c6f732642b379a10a15f37af2ea2
module.exports.shortSequentialId = function () {
  const lowerAlphabet = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]
  const upperAlphabet = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"]

  const padNumber = (string, size) => {
    let s = String(string)
    while (s.length < (size || 2)) {
      s = '0' + s
    }
    return s
  }

  const findNextId = stringId => {
    const REGEX = /^(?=\d*[a-zA-Z]\d*$)(?=(?:[a-zA-Z]?\d)+[a-zA-Z]?$)[a-zA-Z0-9]+$/gm;
    if (!REGEX.test(stringId)) 
      throw new Error(`The input must contain one letter and several numbers`)

    let data = stringId.split('')
    const findAlphabetIndex = data.findIndex(x => isNaN(+x))
    const alphabetPart = data[findAlphabetIndex]

    if (lowerAlphabet.indexOf(alphabetPart) > -1) {
      if (alphabetPart === 'a' || alphabetPart !== 'z') {
        data[findAlphabetIndex] = lowerAlphabet[lowerAlphabet.indexOf(alphabetPart) + 1]
        return data.join('')
      }
      data[findAlphabetIndex] = 'A'
      return data.join('')
    }

    if (alphabetPart === 'A' || alphabetPart !== 'Z') {
      data[findAlphabetIndex] = upperAlphabet[upperAlphabet.indexOf(alphabetPart) + 1]
      return data.join('')
    }

    if (data[0] === 'Z') {
      const incrementalPadding = data.filter(x => !isNaN(+x))
      const numPad = incrementalPadding.length
      data = [...padNumber(+data.slice(1, numPad + 10).join('') + 1, numPad),'a']
      return data.join('')
    }
    data[findAlphabetIndex] = data[findAlphabetIndex - 1]
    data[findAlphabetIndex - 1] = 'a'
    return data.join('')
  }
  return Object.freeze({ findNextId })
}

exports.objectHasPath = (obj, prop) => {
  if (typeof obj === 'object' && obj !== null) { // only performs property checks on objects (taking care of the corner case for null as well)
    if (obj.hasOwnProperty(prop)) {              // if this object already contains the property, we are done
      return true;
    }
    for (var p in obj) {                         // otherwise iterate on all the properties of this object
      if (obj.hasOwnProperty(p) &&               // and as soon as you find the property you are looking for, return true
          hasOwnDeepProperty(obj[p], prop)) { 
        return true;
      }
    }
  }
  return false;                                  
}