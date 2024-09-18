export const ABASTECIMENTOS_KEY = 'abastecimentos'

export function getCloneByTemplateId(id) {
  const template = document.querySelector(id)

  if (!(template instanceof HTMLTemplateElement)) {
    return null
  }

  return template.content.cloneNode(true)
}

export function getItemsByStorage() {
  try {
    const items = localStorage.getItem(ABASTECIMENTOS_KEY)
    return JSON.parse(items) || []
  } catch (err) {
    console.error(err)
    return []
  }
}

const getMaxCountOfDate = (items, dateToAppend) =>
  Math.max(items.reduce((acc, { date, countOfDate }) => [...acc, (date === dateToAppend ? countOfDate : 0)], []))

export function setNewItemInStorage(newItem) {
  const items = getItemsByStorage()

  newItem.id = crypto.randomUUID()
  newItem.countOfDate = getMaxCountOfDate(items, newItem.date) + 1

  const newItems = [...items, newItem].toSorted((a, b) => a.date.localeCompare(b.date) || a.countOfDate - b.countOfDate)
  localStorage.setItem(ABASTECIMENTOS_KEY, JSON.stringify(newItems))
}

export function removeItemFromStorage(id) {
  const items = getItemsByStorage()

  if (!items.length || !Array.isArray(items)) {
    return false
  }

  const index = items.findIndex(({ id: currId }) => currId === id)

  if (index === -1) {
    return false
  }

  const newItems = items.toSpliced(index, 1)
  localStorage.setItem(ABASTECIMENTOS_KEY, JSON.stringify(newItems))

  return true
}

export function getTodayAsyyyyMMdd() {
  const date = new Date()
  return date.toISOString().split('T')[0]
}

export function getFormattedLocaleDateString(date) {
  return new Date(date + 'T00:00').toLocaleDateString('pt-BR')
}

export function getFormattedCurrency(value, locale = 'pt-BR', currency = 'BRL') {
  return value.toLocaleString(locale, { style: 'currency', currency })
}

export function getFormattedLiters(value) {
  return value.toFixed(3) + ' L.'
}
