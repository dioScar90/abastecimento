function getTodayAsyyyyMMdd() {
  const date = new Date()
  return date.toISOString().split('T')[0]
}

function getFragmentByTemplateId(id) {
  const template = document.querySelector(id)

  if (!(template instanceof HTMLTemplateElement)) {
    return null
  }

  return template.content.cloneNode(true)
}

function setValueAttribute(e) {
  // apply regex
  e.currentTarget.setAttribute('value', e.currentTarget.value)
}

function handleSubmit(e) {
  if (e.submitter.dataset.submitter !== 'main') {
    return
  }

  console.log(Object.fromEntries(new FormData(e.currentTarget)))
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
    const fragment = getFragmentByTemplateId('#form_item_template')

    const dialog = fragment.querySelector('dialog')
    const form = fragment.querySelector('form')
    const legend = fragment.querySelector('legend')
    const submitBtn = fragment.querySelector('button[type=submit]')

    const inputId = fragment.querySelector('[name=id]')
    const inputLiters = fragment.querySelector('[name=liters]')
    const inputPrice = fragment.querySelector('[name=price]')
    const inputDate = fragment.querySelector('[name=date]')

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
    shadow.append(fragment)

    dialog.showModal()
  }
}

customElements.define('modal-abastecimento', ModalAbastecimento)