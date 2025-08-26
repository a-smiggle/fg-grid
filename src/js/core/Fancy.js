// Get global object safely for different environments
const getGlobalObject = () => {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof window !== 'undefined') return window;
  if (typeof global !== 'undefined') return global;
  if (typeof self !== 'undefined') return self;
  throw new Error('Unable to locate global object');
};

// Get document object safely for different environments
const getDocumentObject = () => {
  const globalObj = getGlobalObject();
  return globalObj.document || {
    createElement: () => ({}),
    getElementById: () => null,
    querySelector: () => null,
    body: {
      appendChild: () => {},
      removeChild: () => {},
      querySelectorAll: () => [],
      addEventListener: () => {},
      removeEventListener: () => {}
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    execCommand: () => false
  };
};

const globalObj = getGlobalObject();
const documentObj = getDocumentObject();

const Fancy = {
  version: '0.9.6',
  isTouchDevice: 'ontouchstart' in globalObj,
  gridIdSeed: 0,
  gridsMap: new Map(),
  get(id){
    return this.gridsMap.get(id);
  },
  capitalizeFirstLetter(str){
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
  deepClone(obj){
    if (obj === null || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.map(item => Fancy.deepClone(item));
    }

    const clonedObj = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = Fancy.deepClone(obj[key]);
      }
    }

    return clonedObj;
  },
  getTranslateY(element) {
    const style = globalObj.getComputedStyle(element);
    const matrix = style.transform;

    if (!matrix || matrix === 'none') return 0;

    const values = matrix.match(/matrix.*\((.+)\)/);
    if (!values) return 0;

    const parts = values[1].split(', ').map(parseFloat);
    return parts.length === 6 ? parts[5] : 0;
  },
  typeOf(value) {
    if (value === null) return 'null';

    const type = typeof value;
    if(type === 'undefined' || type === 'string' || type === 'number' || type === 'boolean'){
      return type;
    }

    const toString = Object.prototype.toString,
      typeToString = toString.call(value);

    if (value.length !== undefined && typeof value !== 'function') return 'array';

    switch(typeToString){
      case '[object Array]': return 'array';
      case '[object Date]': return 'date';
      case '[object Boolean]': return 'boolean';
      case '[object Number]': return 'number';
      case '[object RegExp]': return 'regexp';
    }

    if (type === 'function') return 'function';
    if (type === 'object') return 'object';
  },
  // shortcut to create div
  /**
   * @param {String|Array} [cls]
   * @param {Object} [style]
   * @return HTMLElement
   */
  div(cls = [], style = {}){
    return Fancy.newElement('div', cls, style);
  },
  /**
   * @param {String|Array} [cls]
   * @param {Object} [style]
   * @return HTMLElement
   */
  span(cls = [], style = {}){
    return Fancy.newElement('span', cls, style);
  },
  /**
   * @param {String|Array} [cls]
   * @param {Object} [style]
   * @return HTMLElement
   */
  input(cls = [], style = {}){
    return Fancy.newElement('input', cls, style);
  },
  /**
   * @param {String} tag
   * @param {String|Array} cls
   * @param {Object} style
   * @return HTMLElement
   */
  newElement(tag, cls, style = {}){
    const el = documentObj.createElement(tag);

    if(Array.isArray(cls)){
      el.classList?.add(...cls);
    } else if(typeof cls === 'string'){
      el.classList?.add(cls);
    }

    for (let p in style) {
      if (style[p] === undefined) continue;

      if(el.style){
        el.style[p] = style[p];
      }
    }

    return el;
  },
  /**
   * @param {HTMLElement} dom
   * @return Element
   */
  EL(dom) {
    return new Fancy.Element(dom);
  }
};

(function() {
  class Element {
    constructor(dom) {
      this.dom = dom;
    }
    prop(property, value) {
      const style = this.dom.style;
      if(typeof value === undefined){
        return style.getProperty(property);
      } else {
        style.setProperty(property, value);
      }
    }
    on(eventName, handler, options = {}) {
      this.dom.addEventListener(eventName, handler, options);
    }
    un(eventName, handler) {
      this.dom.removeEventListener(eventName, handler);
    }
    cls(...classNames) {
      this.dom.classList.add(...classNames);
    }
    removeCls(...classNames) {
      this.dom.classList.remove(...classNames);
    }
    containCls(cls) {
      this.dom.classList.contains(cls);
    }
  }
  Fancy.Element = Element;
})();

// Safe global assignment for different environments
if (typeof globalObj !== 'undefined') {
  globalObj.Fancy = globalObj.Fancy || Fancy;
}
if (typeof window !== 'undefined') {
  window.Fancy = window.Fancy || Fancy;
}
