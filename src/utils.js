const {
  entries,
  setPrototypeOf,
  isFrozen,
  getPrototypeOf,
  getOwnPropertyDescriptor,
} = Object;

let { freeze, seal, create } = Object; // eslint-disable-line import/no-mutable-exports
let { apply, construct } = typeof Reflect !== 'undefined' && Reflect;

if (!freeze) {
  freeze = function (x) {
    return x;
  };
}

if (!seal) {
  seal = function (x) {
    return x;
  };
}

if (!apply) {
  apply = function (fun, thisValue, args) {
    return fun.apply(thisValue, args);
  };
}

if (!construct) {
  construct = function (Func, args) {
    return new Func(...args);
  };
}

const arrayForEach = unapply(Array.prototype.forEach);
const arrayIndexOf = unapply(Array.prototype.indexOf);
const arrayPop = unapply(Array.prototype.pop);
const arrayPush = unapply(Array.prototype.push);
const arraySlice = unapply(Array.prototype.slice);

const stringToLowerCase = unapply(String.prototype.toLowerCase);
const stringToString = unapply(String.prototype.toString);
const stringMatch = unapply(String.prototype.match);
const stringReplace = unapply(String.prototype.replace);
const stringIndexOf = unapply(String.prototype.indexOf);
const stringTrim = unapply(String.prototype.trim);

const objectHasOwnProperty = unapply(Object.prototype.hasOwnProperty);

const regExpTest = unapply(RegExp.prototype.test);

const typeErrorCreate = unconstruct(TypeError);

/**
 * Creates a new function that calls the given function with a specified thisArg and arguments.
 *
 * @param {Function} func - The function to be wrapped and called.
 * @returns {Function} A new function that calls the given function with a specified thisArg and arguments.
 */
function unapply(func) {
  return (thisArg, ...args) => apply(func, thisArg, args);
}

/**
 * Creates a new function that constructs an instance of the given constructor function with the provided arguments.
 *
 * @param {Function} func - The constructor function to be wrapped and called.
 * @returns {Function} A new function that constructs an instance of the given constructor function with the provided arguments.
 */
function unconstruct(func) {
  return (...args) => construct(func, args);
}

/**
 * Add properties to a lookup table
 *
 * @param {Object} set - The set to which elements will be added.
 * @param {Array} array - The array containing elements to be added to the set.
 * @param {Function} transformCaseFunc - An optional function to transform the case of each element before adding to the set.
 * @returns {Object} The modified set with added elements.
 */
function addToSet(set, array, transformCaseFunc = stringToLowerCase) {
  if (setPrototypeOf) {
    // Make 'in' and truthy checks like Boolean(set.constructor)
    // independent of any properties defined on Object.prototype.
    // Prevent prototype setters from intercepting set as a this value.
    setPrototypeOf(set, null);
  }

  let l = array.length;
  while (l--) {
    let element = array[l];
    if (typeof element === 'string') {
      const lcElement = transformCaseFunc(element);
      if (lcElement !== element) {
        // Config presets (e.g. tags.js, attrs.js) are immutable.
        if (!isFrozen(array)) {
          array[l] = lcElement;
        }

        element = lcElement;
      }
    }

    set[element] = true;
  }

  return set;
}

/**
 * Clean up an array to harden against CSPP
 *
 * @param {Array} array - The array to be cleaned.
 * @returns {Array} The cleaned version of the array
 */
function cleanArray(array) {
  for (let index = 0; index < array.length; index++) {
    const isPropertyExist = objectHasOwnProperty(array, index);

    if (!isPropertyExist) {
      array[index] = null;
    }
  }

  return array;
}

/**
 * Shallow clone an object
 *
 * @param {Object} object - The object to be cloned.
 * @returns {Object} A new object that copies the original.
 */
function clone(object) {
  const newObject = create(null);

  for (const [property, value] of entries(object)) {
    const isPropertyExist = objectHasOwnProperty(object, property);

    if (isPropertyExist) {
      if (Array.isArray(value)) {
        newObject[property] = cleanArray(value);
      } else if (
        value &&
        typeof value === 'object' &&
        value.constructor === Object
      ) {
        newObject[property] = clone(value);
      } else {
        newObject[property] = value;
      }
    }
  }

  return newObject;
}

/**
 * This method automatically checks if the prop is function or getter and behaves accordingly.
 *
 * @param {Object} object - The object to look up the getter function in its prototype chain.
 * @param {String} prop - The property name for which to find the getter function.
 * @returns {Function} The getter function found in the prototype chain or a fallback function.
 */
function lookupGetter(object, prop) {
  while (object !== null) {
    const desc = getOwnPropertyDescriptor(object, prop);

    if (desc) {
      if (desc.get) {
        return unapply(desc.get);
      }

      if (typeof desc.value === 'function') {
        return unapply(desc.value);
      }
    }

    object = getPrototypeOf(object);
  }

  function fallbackValue() {
    return null;
  }

  return fallbackValue;
}

export {
  // Array
  arrayForEach,
  arrayIndexOf,
  arrayPop,
  arrayPush,
  arraySlice,
  // Object
  entries,
  freeze,
  getPrototypeOf,
  getOwnPropertyDescriptor,
  isFrozen,
  setPrototypeOf,
  seal,
  clone,
  create,
  objectHasOwnProperty,
  // RegExp
  regExpTest,
  // String
  stringIndexOf,
  stringMatch,
  stringReplace,
  stringToLowerCase,
  stringToString,
  stringTrim,
  // Errors
  typeErrorCreate,
  // Other
  lookupGetter,
  addToSet,
  // Reflect
  unapply,
  unconstruct,
};
