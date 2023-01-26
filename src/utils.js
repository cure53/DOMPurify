const {
  entries,
  setPrototypeOf,
  isFrozen,
  getPrototypeOf,
  getOwnPropertyDescriptor,
} = Object;

let { freeze, seal, create } = Object; // eslint-disable-line import/no-mutable-exports
let { apply, construct } = typeof Reflect !== 'undefined' && Reflect;

if (!apply) {
  apply = function (fun, thisValue, args) {
    return fun.apply(thisValue, args);
  };
}

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

const regExpTest = unapply(RegExp.prototype.test);

const typeErrorCreate = unconstruct(TypeError);

export function unapply(func) {
  return (thisArg, ...args) => apply(func, thisArg, args);
}

export function unconstruct(func) {
  return (...args) => construct(func, args);
}

/* Add properties to a lookup table */
export function addToSet(set, array, transformCaseFunc) {
  transformCaseFunc = transformCaseFunc ? transformCaseFunc : stringToLowerCase;
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

/* Shallow clone an object */
export function clone(object) {
  const newObject = create(null);

  for (const [property, value] of entries(object)) {
    newObject[property] = value;
  }

  return newObject;
}

/* This method automatically checks if the prop is function
 * or getter and behaves accordingly. */
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

  function fallbackValue(element) {
    console.warn('fallback value for', element);
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
};
