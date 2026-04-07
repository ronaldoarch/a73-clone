/**
 * Priority-based async task queue.
 * Manages sequential execution of tasks with priority levels, retry, timeout, and pause/resume.
 */

const PRIORITY_ORDER = { busy: 1, normal: 2, idle: 3 }

export class TaskQueue {
  constructor() {
    this.queue = []
    this.isRunning = false
    this.isPaused = false
    this.cleanupCallbacks = []
    this.listeners = new Map([
      ['start', []],
      ['complete', []],
      ['error', []]
    ])
  }

  /**
   * Add a task to the queue.
   * @param {Function} task - Async function to execute
   * @param {string} [priority='normal'] - 'busy' | 'normal' | 'idle'
   * @param {Object} [options] - { timeout, retries }
   * @returns {TaskQueue} this (for chaining)
   */
  run(task, priority = 'normal', options = {}) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    this.insertTask({
      task,
      priority,
      id,
      timeout: options.timeout,
      retries: options.retries || 0
    })
    return this
  }

  /**
   * Add a wait/delay task.
   */
  wait(ms, priority = 'normal') {
    this.insertTask({
      task: () => new Promise(resolve => setTimeout(resolve, ms)),
      priority,
      id: `wait-${Date.now()}`
    })
    return this
  }

  insertTask(entry) {
    const idx = this.queue.findIndex(
      item => PRIORITY_ORDER[item.priority] > PRIORITY_ORDER[entry.priority]
    )
    if (idx === -1) this.queue.push(entry)
    else this.queue.splice(idx, 0, entry)
  }

  async execute() {
    if (this.isRunning) return
    this.isRunning = true
    this.emit('start', { queueLength: this.queue.length })

    try {
      while (this.queue.length && !this.isPaused) {
        const task = this.queue.shift()
        await this.executeTask(task)
      }
    } catch (err) {
      this.emit('error', { error: err })
      throw err
    } finally {
      if (!this.isPaused) {
        this.isRunning = false
        this.emit('complete', { remaining: this.queue.length })
        this.clear()
      }
    }
  }

  async executeTask(entry) {
    let attempts = entry.retries + 1
    while (attempts > 0) {
      try {
        const taskPromise = entry.priority === 'idle' && 'requestIdleCallback' in window
          ? this.runIdleTask(entry.task)
          : entry.task(entry.priority)

        const timeoutPromise = entry.timeout
          ? new Promise((_, reject) => setTimeout(() => reject(new Error('Task timed out')), entry.timeout))
          : null

        await (timeoutPromise ? Promise.race([taskPromise, timeoutPromise]) : taskPromise)
        return
      } catch (err) {
        attempts--
        if (attempts === 0) {
          console.error(`Task ${entry.id} failed after retries:`, err)
          this.emit('error', { taskId: entry.id, error: err })
          return
        }
        await new Promise(resolve => setTimeout(resolve, attempts * 100))
      }
    }
  }

  runIdleTask(task) {
    return new Promise((resolve, reject) => {
      const run = async () => {
        try {
          await task('idle')
          resolve()
        } catch (err) {
          reject(err)
        }
      }
      const handle = 'requestIdleCallback' in window
        ? window.requestIdleCallback(run)
        : setTimeout(run, 0)

      this.cleanupCallbacks.push(() => {
        'requestIdleCallback' in window
          ? window.cancelIdleCallback(handle)
          : clearTimeout(handle)
      })
    })
  }

  pause() {
    if (this.isRunning && !this.isPaused) {
      this.isPaused = true
    }
  }

  resume() {
    if (this.isPaused) {
      this.isPaused = false
      this.execute()
    }
  }

  cancel(id) {
    const idx = this.queue.findIndex(t => t.id === id)
    if (idx !== -1) this.queue.splice(idx, 1)
  }

  clear() {
    this.cleanupCallbacks.forEach(cb => cb())
    this.cleanupCallbacks = []
    this.queue = []
  }

  on(event, handler) {
    const handlers = this.listeners.get(event)
    if (handlers) handlers.push(handler)
    return this
  }

  emit(event, data) {
    const handlers = this.listeners.get(event)
    if (handlers) handlers.forEach(h => h(data))
  }
}

export const appTaskQueue = new TaskQueue()
