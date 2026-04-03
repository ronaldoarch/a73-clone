<template>
  <div
    v-if="!isFromSw"
    ref="xuanfu"
    class="box xuanfu touming"
    @touchstart.passive="onTouchStart"
    @touchmove.passive="onTouchMove"
    @touchend="onTouchEnd"
    @click="onTouchEnd"
  >
    <input
      type="checkbox"
      class="boxButton"
      :class="{ boxButton1: snapRight, boxButton2: snapLeft }"
      id="box-buttons"
      ref="boxButton"
      v-model="checked"
      @click.stop="onCheckboxClick"
    />
    <label class="circular" for="box-buttons"></label>
    <label class="fork" for="box-buttons"></label>
    <ul>
      <li class="box-item">
        <a @click.stop="doReload" style="display: flex; align-items: center; justify-content: center;">
          <svg fill="#ccc" width="50px" height="50px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path d="M27.1 14.313V5.396L24.158 8.34c-2.33-2.325-5.033-3.503-8.11-3.503C9.902 4.837 4.901 9.847 4.899 16c.001 6.152 5.003 11.158 11.15 11.16 4.276 0 9.369-2.227 10.836-8.478l.028-.122h-3.23l-.022.068c-1.078 3.242-4.138 5.421-7.613 5.421a8 8 0 0 1-5.691-2.359A7.993 7.993 0 0 1 8 16.001c0-4.438 3.611-8.049 8.05-8.049 2.069 0 3.638.58 5.924 2.573l-3.792 3.789H27.1z"/>
          </svg>
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'

const urlParams = new URLSearchParams(window.location.search)
const isFromSw = urlParams.get('fromEntry') === 'sw'

const xuanfu = ref(null)
const boxButton = ref(null)
const checked = ref(false)
const snapLeft = ref(false)
const snapRight = ref(false)

let startL = 0, startT = 0, startX = 0, startY = 0
let timer1 = null, timer2 = null

function hasParentWithClassName(element, className) {
  while (element && element !== document.body) {
    if (element.classList.contains(className)) return true
    element = element.parentElement
  }
  return false
}

function onTouchStart(e) {
  const el = xuanfu.value
  if (!el) return
  startL = el.offsetLeft
  startT = el.offsetTop
  startX = e.targetTouches[0].clientX
  startY = e.targetTouches[0].clientY
  el.classList.remove('touming')
}

function onTouchMove(e) {
  const el = xuanfu.value
  if (!el) return
  const cx = e.targetTouches[0].clientX
  const cy = e.targetTouches[0].clientY

  let newLeft = cx - (startX - startL)
  if (newLeft <= 0) newLeft = 0
  if (newLeft >= document.documentElement.clientWidth - el.offsetWidth)
    newLeft = document.documentElement.clientWidth - el.offsetWidth

  let newTop = cy - (startY - startT)
  if (newTop <= 0) newTop = 0
  if (newTop >= document.documentElement.clientHeight - el.offsetHeight)
    newTop = document.documentElement.clientHeight - el.offsetHeight

  el.style.left = newLeft + 'px'
  el.style.top = newTop + 'px'
}

function onTouchEnd() {
  const el = xuanfu.value
  if (!el) return

  clearTimeout(timer1)
  clearTimeout(timer2)
  el.style.transition = 'none'

  const middle = (document.documentElement.clientWidth - el.offsetWidth) / 2
  const left = el.offsetLeft
  const newLeft = left <= middle ? 0 : document.documentElement.clientWidth - el.offsetWidth
  el.style.left = newLeft + 'px'

  timer1 = setTimeout(() => {
    el.classList.add('touming')
  }, 6000)
  timer2 = setTimeout(() => {
    checked.value = false
    document.removeEventListener('touchstart', hideRefreshButton)
  }, 6000)
  document.addEventListener('touchstart', hideRefreshButton)
}

function hideRefreshButton(e) {
  if (!hasParentWithClassName(e.target, 'xuanfu')) {
    checked.value = false
  }
}

function onCheckboxClick(e) {
  const res = document.documentElement.clientWidth / 2
  if (e.clientX <= res) {
    snapLeft.value = true
    snapRight.value = false
  } else {
    snapLeft.value = false
    snapRight.value = true
  }
}

function doReload() {
  location.reload()
}

onBeforeUnmount(() => {
  clearTimeout(timer1)
  clearTimeout(timer2)
  document.removeEventListener('touchstart', hideRefreshButton)
})
</script>

<style scoped>
.box {
  --item-translateX: -100px;
}

.boxButton + .circular,
.boxButton + .circular + .fork,
.boxButton,
.box-item {
  position: absolute;
  top: 200px;
  right: -20px;
}

.boxButton {
  display: block;
  width: 30px;
  height: 30px;
  z-index: 2;
  opacity: 0;
  cursor: pointer;
}

.boxButton + .circular {
  width: 30px;
  height: 30px;
  display: block;
  z-index: 1;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 10px rgba(255, 255, 255, 0.2);
  margin: 10px;
  transition: all 0.5s;
  transform-origin: 50% 50%;
}

.boxButton:checked + .circular + .fork {
  width: 30px;
  height: 30px;
  display: block;
  z-index: 1;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 10px rgba(255, 255, 255, 0.2);
  margin: 10px;
  transition: all 0.5s;
}

.boxButton:checked + .circular + .fork::after,
.boxButton:checked + .circular + .fork::before {
  content: "";
  width: 30px;
  height: 3px;
  display: block;
  z-index: 1;
  border-radius: 2.5px;
  transition: all 0.5s;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.boxButton:checked + .circular + .fork {
  transform: rotate(360deg);
}

.boxButton:checked + .circular + .fork::after {
  transform: translate(-50%, -50%) rotate(45deg);
}

.boxButton:checked + .circular + .fork::before {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.boxButton:checked + .circular {
  width: 0;
  height: 0;
  border: 0;
  box-shadow: none;
}

.boxButton:checked ~ ul .box-item {
  opacity: 1;
}

.box-item:nth-child(1) {
  transform: rotate(90deg);
}
.box-item:nth-child(2) {
  transform: rotate(45deg);
}
.box-item:nth-child(3) {
  transform: rotate(0deg);
}
.box-item:nth-child(4) {
  transform: rotate(315deg);
}
.box-item:nth-child(5) {
  transform: rotate(270deg);
}

.box-item:nth-child(1) a {
  transform: rotate(0deg);
}
.box-item:nth-child(2) a {
  transform: rotate(-45deg);
}
.box-item:nth-child(3) a {
  transform: rotate(0deg);
}
.box-item:nth-child(4) a {
  transform: rotate(45deg);
}
.box-item:nth-child(5) a {
  transform: rotate(90deg);
}

.boxButton1:checked ~ ul .box-item:nth-child(1) {
  transform: rotate(45deg) translateX(var(--item-translateX));
}
.boxButton1:checked ~ ul .box-item:nth-child(2) {
  transform: rotate(0deg) translateX(var(--item-translateX));
}
.boxButton1:checked ~ ul .box-item:nth-child(3) {
  transform: rotate(-45deg) translateX(var(--item-translateX));
}

.boxButton:checked ~ ul .box-item a {
  pointer-events: auto;
}

.boxButton + .circular::before {
  top: 10px;
}
.boxButton + .circular::after {
  top: -10px;
}

.box-item {
  display: block;
  width: 60px;
  height: 60px;
  opacity: 0;
  transition: 0.5s;
}

.box-item a {
  display: block;
  width: inherit;
  height: inherit;
  line-height: 60px;
  color: rgba(255, 255, 255, 0.65);
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  text-align: center;
  text-decoration: none;
  font-size: 30px;
  pointer-events: none;
  transition: 0.2s;
  cursor: pointer;
}

.touming {
  opacity: 0.2;
}

.xuanfu {
  position: absolute;
}

.boxButton2:checked ~ ul .box-item:nth-child(1) {
  transform: rotate(135deg) translateX(var(--item-translateX));
}
.boxButton2:checked ~ ul .box-item:nth-child(2) {
  transform: rotate(180deg) translateX(var(--item-translateX));
}
.boxButton2:checked ~ ul .box-item:nth-child(3) {
  transform: rotate(225deg) translateX(var(--item-translateX));
}

.box {
  position: fixed;
  top: 200px;
  right: -20px;
  z-index: var(--z-float, 9999);
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
