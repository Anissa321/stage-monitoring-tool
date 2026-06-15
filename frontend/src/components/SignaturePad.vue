<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  modelValue: String
})
const emit = defineEmits(['update:modelValue'])

const canvas = ref(null)
const isDrawing = ref(false)
const heeftGetekend = ref(false)

onMounted(() => {
  const ctx = canvas.value.getContext('2d')
  ctx.strokeStyle = '#0f172a'
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
})

function getPos(e) {
  const rect = canvas.value.getBoundingClientRect()
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  return {
    x: (clientX - rect.left) * (canvas.value.width / rect.width),
    y: (clientY - rect.top) * (canvas.value.height / rect.height)
  }
}

function start(e) {
  e.preventDefault()
  isDrawing.value = true
  const ctx = canvas.value.getContext('2d')
  const pos = getPos(e)
  ctx.beginPath()
  ctx.moveTo(pos.x, pos.y)
}

function draw(e) {
  if (!isDrawing.value) return
  e.preventDefault()
  const ctx = canvas.value.getContext('2d')
  const pos = getPos(e)
  ctx.lineTo(pos.x, pos.y)
  ctx.stroke()
  heeftGetekend.value = true
}

function stop() {
  if (!isDrawing.value) return
  isDrawing.value = false
  emit('update:modelValue', canvas.value.toDataURL('image/png'))
}

function wissen() {
  const ctx = canvas.value.getContext('2d')
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
  heeftGetekend.value = false
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="signature-wrap">
    <canvas
      ref="canvas"
      width="600"
      height="180"
      class="signature-canvas"
      @mousedown="start"
      @mousemove="draw"
      @mouseup="stop"
      @mouseleave="stop"
      @touchstart="start"
      @touchmove="draw"
      @touchend="stop"
    ></canvas>
    <div class="signature-actions">
      <span class="signature-hint">Teken je handtekening hierboven</span>
      <button type="button" class="clear-btn" @click="wissen">Wissen</button>
    </div>
  </div>
</template>

<style scoped>
.signature-wrap { width: 100%; }
.signature-canvas {
  width: 100%;
  height: 180px;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  background: white;
  cursor: crosshair;
  touch-action: none;
}
.signature-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.signature-hint { font-size: 12px; color: #94a3b8; }
.clear-btn { border: 1px solid #cbd5e1; background: white; color: #334155; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; }
.clear-btn:hover { background: #f8fafc; }
</style>