import { ModalAbastecimento } from "./ModalAbastecimento.js"
import { RowAbastecimento } from "./RowAbastecimento.js"
import { getCloneByTemplateId, getItemsByStorage } from "./utils.js"
export const TABELA_ABASTECIMENTOS_NAME = 'tabela-abastecimentos'

class AlreadyExistsTabelaAbastecimentosError extends Error {
  constructor() {
    const message = 'Tabela de abastecimentos já existe na página. Cadastre um novo item para preenchê-la.'
    super(message)
    setTimeout(() => alert(message), 100)
  }
}

function handleClickTbody(e) {
  const button = e.target.closest('button')

  if (!button) {
    return
  }

  e.stopPropagation()

  const tr = button.closest('tr')
  document.body.append(new ModalAbastecimento({ ...tr.dataset }, true))
}

let countTabelaAbastecimentos = 0

export class TabelaAbastecimentos extends HTMLElement {
  #root
  #items = []
  #controller
  #signal

  constructor() {
    if (countTabelaAbastecimentos > 0) {
      throw new AlreadyExistsTabelaAbastecimentosError()
    }

    super()
    this.#items = getItemsByStorage()
    this.#controller = new AbortController()
    this.#signal = { signal: this.#controller.signal }

    countTabelaAbastecimentos++
  }

  #getSpecificTr = id => this.#root.querySelector(`tr[data-id="${id}"]`)
  #getDefaultTr = () => this.#root.querySelector('tbody > tr.nada')

  appendTr = (values, idBefore) => {
    const trBefore = idBefore ? this.#getSpecificTr(idBefore) : this.#getDefaultTr()
    trBefore.after(new RowAbastecimento(values))
  }
  
  removeTr = id => this.#getSpecificTr(id)?.remove()
  
  // disconnectedCallback() {}

  connectedCallback() {
    const clone = getCloneByTemplateId('#table_items_template')
    
    const tbody = clone.querySelector('tbody')
    this.#items.forEach(item => tbody.append(new RowAbastecimento(item)))

    tbody.addEventListener('click', handleClickTbody, { ...this.#signal })
    
    this.#root = this.attachShadow({ mode: 'open' })
    this.#root.append(clone)
  }
}

customElements.define(TABELA_ABASTECIMENTOS_NAME, TabelaAbastecimentos)
