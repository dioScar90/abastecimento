import { TABELA_ABASTECIMENTOS_NAME } from "./TabelaAbastecimentos.js"
import { getCloneByTemplateId, getFormattedKm, getFormattedLiters, getItemFromStorage, getNumberIntoFormattedDecimalStyle, getOnlyNumbers, getTodayAsyyyyMMdd, putCursorOnEndOfText, removeItemFromStorage, setNewItemInStorage } from "./utils.js"

export const MODAL_ABASTECIMENTO_NAME = 'modal-abastecimento'

function handleInputKm(e) {
  const input = e.currentTarget
  input.value = getOnlyNumbers(input.value) || ''
}

function handleInputLiters(e) {
  const input = e.currentTarget

  input.value = getNumberIntoFormattedDecimalStyle(input.value, input.name === 'liters')
  putCursorOnEndOfText(input)
}

function handleInputIsFull(e) {
  const input = e.currentTarget
  const inputKm = input.form.elements.km

  inputKm.toggleAttribute('required', input.checked)
  inputKm.toggleAttribute('disabled', !input.checked)

  if (inputKm.disabled) {
    inputKm.value = null
  }
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

  values.km = values.km ? +values.km.replace(',', '.') : null
  values.liters = +values.liters.replace(',', '.')
  values.isFull = !!values.isFull
  
  const [valuesWithId, idBefore] = setNewItemInStorage(values)
  tabelaAbastecimentos.appendTr(valuesWithId, idBefore)

  setTimeout(() => alert('Abastecimento cadastrado com sucesso!'), 100)
}

export class ModalAbastecimento extends HTMLElement {
  #options
  #excluir
  #controller
  #signal
  
  constructor(id = null) {
    super()
    
    this.#options = getItemFromStorage(id) ?? {}
    this.#excluir = !!id
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
    const inputIsFull = clone.querySelector('[name=isFull]')
    const inputDate = clone.querySelector('[name=date]')

    inputDate.value = getTodayAsyyyyMMdd()
    inputDate.max = getTodayAsyyyyMMdd()
    
    if (this.#options.id && this.#excluir) {
      inputId.value = this.#options.id

      inputKm.value = this.#options?.km ? getFormattedKm(this.#options.km, true) : '---'
      inputLiters.value = getFormattedLiters(this.#options.liters, true)
      inputIsFull.checked = !!this.#options?.isFull
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
    inputLiters.addEventListener('input', handleInputLiters, { ...this.#signal })
    inputIsFull.addEventListener('change', handleInputIsFull, { ...this.#signal })
    
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
