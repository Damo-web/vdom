/**
 * Class Modules
 */
function updateClass(oldVnode, vnode) {
  let cur, name;
  let elm = vnode.elm,
      oldClass = oldVnode.data.class,
      newClass = vnode.data.class;
  //oldClass 与 newClass 不存在时不更新
  if (!oldClass && !newClass) return;
  //oldClass 与 newClass 相同时不更新
  if (oldClass === newClass) return;

  //兼容处理
  oldClass = oldClass || {};
  newClass = newClass || {};

  //new class中不存在，old class中存在，class直接移除
  for (name in oldClass) {
    if (!newClass[name]) {
      elm.classList.remove(name);
    }
  }

  //new class中class 与 old class中class 值相同时不做更新
  //new class中class 与 old class中class 值不同时
  //new class中class为true，则class添加
  //new class中class为false，则class移除
  for (name in newClass) {
    cur = newClass[name];
    if (cur !== oldClass[name]) {
      elm.classList[cur ? 'add' : 'remove'](name);
    }
  }
}

export default {create: updateClass, update: updateClass};