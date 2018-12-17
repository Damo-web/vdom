
//requestAnimationFrame兼容处理
const raf = (typeof window !== 'undefined' && window.requestAnimationFrame) || setTimeout;
const nextFrame = function (fn) {
  raf(function () {
    raf(fn);
  });
};