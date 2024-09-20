import { TABELA_ABASTECIMENTOS_NAME } from "./TabelaAbastecimentos.js"
import { getCloneByTemplateId, getFormattedCurrency, getFormattedKm, getFormattedLiters, getNumberIntoFormattedDecimalStyle, getOnlyNumbers, getTodayAsyyyyMMdd, removeItemFromStorage, setNewItemInStorage } from "./utils.js"

export const MODAL_ABASTECIMENTO_NAME = 'modal-abastecimento'

function handleInputKm(e) {
  e.currentTarget.value = getOnlyNumbers(e.currentTarget.value) || ''
}

function handleInput(e) {
  e.currentTarget.value = getNumberIntoFormattedDecimalStyle(e.currentTarget.value, e.currentTarget.name === 'liters')
}

function getTabelaAbastecimentos() {
  return document.querySelector(TABELA_ABASTECIMENTOS_NAME)
}

function handleEnterPress(e) {
  if (e.key === 'Enter') {
    e.preventDefault()
    e.currentTarget.querySelector('button:not([formnovalidate])').click()
  }
}

function handleSubmit(e) {
  if (e.submitter.formNoValidate) {
    return
  }

  const tabelaAbastecimentos = getTabelaAbastecimentos()
  const values = Object.fromEntries(new FormData(e.currentTarget))
  
  if (values.id && values.delete) {
    removeItemFromStorage(values.id)
    tabelaAbastecimentos.removeTr(values.id)

    setTimeout(() => alert('Abastecimento removido com sucesso!'), 100)
    return
  }

  values.km = +values.km.replace(',', '.')
  values.liters = +values.liters.replace(',', '.')
  values.price = +values.price.replace(',', '.') || null
  
  const [valuesWithId, idBefore] = setNewItemInStorage(values)
  tabelaAbastecimentos.appendTr(valuesWithId, idBefore)

  setTimeout(() => alert('Abastecimento cadastrado com sucesso!'), 100)
}

export class ModalAbastecimento extends HTMLElement {
  #options
  #excluir
  #controller
  #signal
  
  constructor(options = {}, excluir = false) {
    super()
    
    this.#options = { ...options }
    this.#excluir = excluir === true
    this.#controller = new AbortController()
    this.#signal = { signal: this.#controller.signal }
  }
  
  disconnectedCallback() {
    this.#controller?.abort()
  }

  connectedCallback() {
    const clone = getCloneByTemplateId('#form_item_template')

    const dialog = clone.querySelector('dialog')
    const form = clone.querySelector('form')
    const legend = clone.querySelector('legend')
    const fieldset = clone.querySelector('fieldset')
    const msgExcluir = clone.querySelector('.excluir')
    const submitBtn = clone.querySelector('button[data-submitter=main]')

    const inputId = clone.querySelector('[name=id]')
    const inputDelete = clone.querySelector('[name=delete]')
    const inputKm = clone.querySelector('[name=km]')
    const inputLiters = clone.querySelector('[name=liters]')
    const inputPrice = clone.querySelector('[name=price]')
    const inputDate = clone.querySelector('[name=date]')

    inputDate.value = getTodayAsyyyyMMdd()
    inputDate.max = getTodayAsyyyyMMdd()
    
    if (this.#options.id && this.#excluir) {
      inputId.value = this.#options.id

      inputKm.value = getFormattedKm(this.#options.km, true)
      inputLiters.value = getFormattedLiters(this.#options.liters, true)
      inputPrice.value = this.#options.price ? getFormattedCurrency(this.#options.price) : '---'
      inputDate.value = this.#options.date

      fieldset.disabled = true
      inputDelete.value = this.#excluir
      
      legend.innerHTML = 'Excluir'
      submitBtn.innerText = 'Excluir'
      submitBtn.part.replace('btn-success', 'btn-danger')
    } else {
      msgExcluir.remove()
    }

    inputKm.addEventListener('input', handleInputKm, { ...this.#signal })
    inputLiters.addEventListener('input', handleInput, { ...this.#signal })
    inputPrice.addEventListener('input', handleInput, { ...this.#signal })
    
    form.addEventListener('keydown', handleEnterPress, { ...this.#signal })
    form.addEventListener('submit', handleSubmit, { ...this.#signal })
    dialog.addEventListener('close', () => this.remove(), { ...this.#signal })
    
    const shadow = this.attachShadow({ mode: 'open' })
    shadow.append(clone)

    dialog.showModal()
    setTimeout(() => inputKm.focus(), 100)
  }
}

customElements.define(MODAL_ABASTECIMENTO_NAME, ModalAbastecimento)
