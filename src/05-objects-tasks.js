/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable comma-dangle */
/* eslint-disable operator-linebreak */
/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */

/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  this.width = width;
  this.height = height;
  this.getArea = () => this.width * this.height;
}

/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}

/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const result = Object.create(proto);
  Object.assign(result, JSON.parse(json));
  return result;
}

/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

const cssSelectorBuilder = {
  path: [],
  string: '',

  element(value) {
    const res = Object.create(cssSelectorBuilder);
    Object.assign(res, this);

    if (this.path.includes('element')) {
      throw new Error(
        // eslint-disable-next-line comma-dangle
        'Element, id and pseudo-element should not occur more then one time inside the selector'
      );
    }
    res.path = [...this.path, 'element'];
    res.string += value;

    res.checkOrder();
    return res;
  },

  id(value) {
    const res = Object.create(cssSelectorBuilder);
    Object.assign(res, this);

    if (this.path.includes('id')) {
      throw new Error(
        // eslint-disable-next-line comma-dangle
        'Element, id and pseudo-element should not occur more then one time inside the selector'
      );
    }
    res.path = [...this.path, 'id'];
    res.string += `#${value}`;

    res.checkOrder();
    return res;
  },

  class(value) {
    const res = Object.create(cssSelectorBuilder);
    Object.assign(res, this);

    res.path = [...this.path, 'class'];
    res.string += `.${value}`;

    res.checkOrder();
    return res;
  },

  attr(value) {
    const res = Object.create(cssSelectorBuilder);
    Object.assign(res, this);

    res.path = [...this.path, 'attr'];
    res.string += `[${value}]`;

    res.checkOrder();
    return res;
  },

  pseudoClass(value) {
    const res = Object.create(cssSelectorBuilder);
    Object.assign(res, this);

    res.path = [...this.path, 'pseudoClass'];
    res.string += `:${value}`;

    res.checkOrder();
    return res;
  },

  pseudoElement(value) {
    const res = Object.create(cssSelectorBuilder);
    Object.assign(res, this);

    if (this.path.includes('pseudoElement')) {
      throw new Error(
        // eslint-disable-next-line comma-dangle
        'Element, id and pseudo-element should not occur more then one time inside the selector'
      );
    }
    res.path = [...this.path, 'pseudoElement'];
    res.string += `::${value}`;

    res.checkOrder();
    return res;
  },

  checkOrder() {
    const order = [
      'element',
      'id',
      'class',
      'attr',
      'pseudoClass',
      'pseudoElement',
    ];

    const keys = this.path.map((el) => order.indexOf(el));

    for (let i = 1; i < keys.length; i += 1) {
      if (keys[i] < keys[i - 1]) {
        throw new Error(
          // eslint-disable-next-line comma-dangle
          'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element'
        );
      }
    }
  },

  combine(selector1, combinator, selector2) {
    const res = Object.create(cssSelectorBuilder);
    Object.assign(res, this);

    res.string = `${this.string}${selector1.string} ${combinator} ${selector2.string}`;

    return res;
  },

  stringify() {
    return this.string;
  },
};

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
