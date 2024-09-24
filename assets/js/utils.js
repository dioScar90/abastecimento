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

export function setNewItemInStorage(values) {
  const items = getItemsByStorage()

  const newItem = { ...values }
  newItem.id = crypto.randomUUID()
  
  const newItems = [...items, { ...newItem }]
    .toSorted((a, b) => a.date.localeCompare(b.date) || !b.isFull || a.liters - b.liters)
  
  localStorage.setItem(ABASTECIMENTOS_KEY, JSON.stringify(newItems))

  const currentIdx = newItems.findIndex(({ id }) => id === newItem.id)
  const idBefore = currentIdx === 0 ? null : newItems[currentIdx - 1].id
  return [newItem, idBefore]
}

export function getItemFromStorage(id) {
  const items = getItemsByStorage()

  if (!items.length) {
    return null
  }

  return items.find(item => item.id === id) ?? null
}

export function removeItemFromStorage(id) {
  const items = getItemsByStorage()

  if (!items.length) {
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

export function getToday() {
  return new Date(new Date().setHours(12))
}

export function getTodayAsyyyyMMdd() {
  const date = getToday()
  return date.toISOString().split('T')[0]
}

export function getFormattedLocaleDateString(date) {
  return new Date(date + 'T12:00').toLocaleDateString('pt-BR')
}

export function getFormattedCurrency(value, locale = 'pt-BR', currency = 'BRL') {
  return value.toLocaleString(locale, { style: 'currency', currency })
}

export function getFormattedKm(value, km = false) {
  const newValue = value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).replace('R$', '').trim()
  return km ? newValue + ' Km' : newValue
}

export function getFormattedLiters(value) {
  value = typeof value === 'number' ? value : +value
  return value.toFixed(3).replace('.', ',') + ' L'
}

export function getOnlyNumbers(value) {
  return value.replace(/\D/g, '')
}

export function getNumberIntoFormattedDecimalStyle(value, threeDigits = false) {
  value = +getOnlyNumbers(value)
  const options = { style: 'currency', currency: 'BRL', minimumFractionDigits: threeDigits ? 3 : 2 }
  return (value * (threeDigits ? 0.001 : 0.01)).toLocaleString('pt-BR', { ...options }).replace('R$', '').trim()
}
