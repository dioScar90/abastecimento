import { getCloneByTemplateId, getTodayAsyyyyMMdd, setNewItemInStorage } from "./utils.js"

export const MODAL_ABASTECIMENTO_NAME = 'modal-abastecimento'

function setValueAttribute(e) {
  // apply regex
  e.currentTarget.setAttribute('value', e.currentTarget.value)
}

function handleSubmit(e) {
  if (e.submitter.dataset.submitter !== 'main') {
    return
  }

  const values = Object.fromEntries(new FormData(e.currentTarget))

  values.price = +values.price || null
  values.liters = +values.liters

  // if (values.id) {
  //   // do stuff
  // }

  setNewItemInStorage(values)
  setTimeout(() => alert('Abastecimento cadastrado com sucesso!'), 100)
}

export class ModalAbastecimento extends HTMLElement {
  #options
  #controller
  #signal
  
  constructor(options = {}) {
    super()

    this.#options = { ...options }
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
    const submitBtn = clone.querySelector('button[type=submit]')

    const inputId = clone.querySelector('[name=id]')
    const inputLiters = clone.querySelector('[name=liters]')
    const inputPrice = clone.querySelector('[name=price]')
    const inputDate = clone.querySelector('[name=date]')

    inputDate.value = getTodayAsyyyyMMdd()

    legend.innerHTML = '<span slot="slot_legend">Modificar</span>'

    if (this.#options.id) {
      inputId.value = this.#options.id
      
      inputLiters.value = this.#options.liters
      inputPrice.value = this.#options.price ?? undefined

      inputDate.value = this.#options.date
      inputDate.setAttribute('readonly', '')

      submitBtn.innerHTML = '<span slot="slot_submit">Modificar</span>'
    }

    inputLiters.addEventListener('input', setValueAttribute, { ...this.#signal })
    inputPrice.addEventListener('input', setValueAttribute, { ...this.#signal })
    
    form.addEventListener('submit', handleSubmit, { ...this.#signal })
    dialog.addEventListener('close', () => this.remove(), { ...this.#signal })
    
    const shadow = this.attachShadow({ mode: 'open' })
    shadow.append(clone)

    dialog.showModal()
  }
}

customElements.define(MODAL_ABASTECIMENTO_NAME, ModalAbastecimento)