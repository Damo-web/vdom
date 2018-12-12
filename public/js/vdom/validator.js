/**
 * 辅助函数 Validator
 * @param {Boolean}isArray                是否为数组
 * @param {Boolean}isUndef                为undefined
 * @param {Boolean}isDef                  不为undefined
 * @param {Boolean}isStrOrNum             是否为字符串或数字
 */

const Validator = {
  isArray: Array.isArray,
  isUndef: (val) => {
    return val === undefined;
  },
  isDef: (val) => {
    return val !== undefined;
  },
  isStrOrNum: (val) => {
    return typeof val === 'string' || typeof val === 'number';
  }
}

export default Validator;