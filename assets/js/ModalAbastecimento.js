import { TABELA_ABASTECIMENTOS_NAME } from "./TabelaAbastecimentos.js"
import { getCloneByTemplateId, getTodayAsyyyyMMdd, removeItemFromStorage, setNewItemInStorage } from "./utils.js"

export const MODAL_ABASTECIMENTO_NAME = 'modal-abastecimento'

function handleInput(e) {
  const isLiters = e.currentTarget.name === 'liters'
  const value = +e.currentTarget.value.replace(/\D/g, '')
  const options = { style: 'currency', currency: 'BRL', minimumFractionDigits: isLiters ? 3 : 2 }
  e.currentTarget.value = (value * (isLiters ? 0.001 : 0.01)).toLocaleString('pt-BR', { ...options }).replace('R$', '').trim()
}

function getTabelaAbastecimentos() {
  return document.querySelector(TABELA_ABASTECIMENTOS_NAME)
}

function handleSubmit(e) {
  if (e.submitter.dataset.submitter !== 'main') {
    return
  }

  const values = Object.fromEntries(new FormData(e.currentTarget))

  values.price = +values.price.replace(',', '.') || null
  values.liters = +values.liters.replace(',', '.')

  const tabelaAbastecimentos = getTabelaAbastecimentos()

  if (values.delete) {
    removeItemFromStorage(values.id)
    tabelaAbastecimentos.removeTr(values.id)

    setTimeout(() => alert('Abastecimento removido com sucesso!'), 100)
  } else {
    const [valuesWithId, idBefore] = setNewItemInStorage(values)
    tabelaAbastecimentos.appendTr(valuesWithId, idBefore)

    setTimeout(() => alert('Abastecimento cadastrado com sucesso!'), 100)
  }
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
    const msgExcluir = clone.querySelector('.excluir')
    const submitBtn = clone.querySelector('button[data-submitter=main]')

    const inputId = clone.querySelector('[name=id]')
    const inputDelete = clone.querySelector('[name=delete]')
    const inputLiters = clone.querySelector('[name=liters]')
    const inputPrice = clone.querySelector('[name=price]')
    const inputDate = clone.querySelector('[name=date]')

    inputDate.value = getTodayAsyyyyMMdd()
    inputDate.max = getTodayAsyyyyMMdd()
    
    if (this.#options.id) {
      legend.innerHTML = '<span slot="slot_legend">Modificar</span>'
      
      inputId.value = this.#options.id
      
      inputLiters.value = this.#options.liters
      inputPrice.value = this.#options.price ?? undefined

      inputDate.value = this.#options.date
      inputDate.setAttribute('readonly', '')

      submitBtn.innerHTML = '<span slot="slot_submit">Modificar</span>'
    }

    if (this.#excluir) {
      [inputLiters, inputPrice, inputDate].forEach(input => input.setAttribute('readonly', ''))
      inputDelete.value = this.#excluir
      legend.innerHTML = '<span slot="slot_legend">Excluir</span>'
      submitBtn.innerHTML = '<span slot="slot_submit">Excluir</span>'
    } else {
      msgExcluir.remove()
    }

    inputLiters.addEventListener('input', handleInput, { ...this.#signal })
    inputPrice.addEventListener('input', handleInput, { ...this.#signal })
    
    form.addEventListener('submit', handleSubmit, { ...this.#signal })
    dialog.addEventListener('close', () => this.remove(), { ...this.#signal })
    
    const shadow = this.attachShadow({ mode: 'open' })
    shadow.append(clone)

    dialog.showModal()
  }
}

customElements.define(MODAL_ABASTECIMENTO_NAME, ModalAbastecimento)
