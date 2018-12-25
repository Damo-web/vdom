/**
 * Style Module
 */

let reflowForced = false;

//requestAnimationFrame兼容处理
const raf = (typeof window !== 'undefined' && window.requestAnimationFrame) || setTimeout;
const nextFrame = function (fn) {
  raf(function () {
    raf(fn);
  });
};

//pre style
function forceReflow() {
  reflowForced = false;
}

//设置下一帧
function setNextFrame(obj, prop, val){
  nextFrame(function() { 
    obj[prop] = val; 
  });
}

//create及update style
function updateStyle(oldVnode, vnode) {
  let cur, name;
  let elm = vnode.elm,
      oldStyle = oldVnode.data.style,
      style = vnode.data.style;

  //新旧style都不存在或相等不更新
  if (!oldStyle && !style) return;
  if (oldStyle === style) return;
  
  //容错处理
  oldStyle = oldStyle || {};
  style = style || {};

  let oldHasDel = 'delayed' in oldStyle;

  //new style中不存在，old style中存在
  //当old style存在css变量，直接移除
  //当old style不存在css变量，直接清空
  for (name in oldStyle) {
    if (!style[name]) {
      if (name[0] === '-' && name[1] === '-') {
        elm.style.removeProperty(name);
      } else {
        elm.style[name] = '';
      }
    }
  }

  //new style中存在，old style中不存在
  //当属性为 delayed 时，设置到下一帧进行渲染
  //当属性不为 remove 时，设置属性
  for (name in style) {
    cur = style[name];
    if (name === 'delayed' && style.delayed) {
      for (let name2 in style.delayed) {
        cur = style.delayed[name2];
        if (!oldHasDel || cur !== oldStyle.delayed[name2]) {
          setNextFrame(elm.style, name2, cur);
        }
      }
    } else if (name !== 'remove' && cur !== oldStyle[name]) {
      if (name[0] === '-' && name[1] === '-') {
        elm.style.setProperty(name, cur);
      } else {
        elm.style[name] = cur;
      }
    }
  }
}

//destroy style
function applyDestroyStyle(vnode) {
  let style, name;
  let elm = vnode.elm, s = vnode.data.style;

  //倘若style或style.destory不存在则destroyStyle不生效
  if (!s || !(style = s.destroy)) return;

  //绑定destroy style到元素
  for (name in style) {
    elm.style[name] = style[name];
  }
}

//remove style
function applyRemoveStyle(vnode, rm) {
  let s = vnode.data.style;
  //倘若style及style.remove不存在则removeStyle不生效
  if (!s || !s.remove) {
    rm();
    return;
  }
  //强制回流
  if(!reflowForced) {
    getComputedStyle(document.body).transform;
    reflowForced = true;
  }
  let name, elm = vnode.elm, compStyle,
      style = s.remove, amount = 0, applied;

  //记录transition-property
  for (name in style) {
    applied.push(name);
    elm.style[name] = style[name];
  }
  compStyle = getComputedStyle(elm);
  let props = compStyle['transition-property'].split(', ');
  for (let i = 0; i < props.length; ++i) {
    if(applied.indexOf(props[i]) !== -1){
      amount++;
    }
  }

  //transitionend执行完移除元素
  elm.addEventListener('transitionend', function (e) {
    if (e.target === elm){
      --amount;
    } 
    if (amount === 0){
      rm();
    }
  });
}

export default {
  pre: forceReflow,
  create: updateStyle,
  update: updateStyle,
  destroy: applyDestroyStyle,
  remove: applyRemoveStyle
};