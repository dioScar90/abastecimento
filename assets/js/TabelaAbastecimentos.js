import { GraficoAbastecimentos } from "./GraficoAbastecimentos.js"
import { ModalAbastecimento } from "./ModalAbastecimento.js"
import { RowAbastecimento } from "./RowAbastecimento.js"
import { MAIN_ROOT } from "./script.js"
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
  document.body.append(new ModalAbastecimento(tr.dataset.id))
}

let countTabelaAbastecimentos = 0

export class TabelaAbastecimentos extends HTMLElement {
  #root
  #items = []
  #controller
  #signal
  #chart

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
    this.#updateChart()
  }
  
  removeTr = (id) => {
    this.#getSpecificTr(id)?.remove()
    this.#updateChart()
  }

  #createChart() {
    this.#chart = new GraficoAbastecimentos()
    this.after(this.#chart)
  }

  #removeChart() {
    this.#chart?.remove()
    this.#chart = null
  }

  #updateItems() {
    this.#items = getItemsByStorage()
  }
  
  #updateChart() {
    this.#updateItems()

    if (!this.#items.length) {
      this.#removeChart()
      return
    }
    
    if (this.#chart) {
      this.#chart.updateChart()
    } else {
      this.#createChart()
    }
  }
  
  // disconnectedCallback() {}

  connectedCallback() {
    const clone = getCloneByTemplateId('#table_items_template')
    
    const buttonInsert = clone.querySelector('.btn-insert')
    const tbody = clone.querySelector('tbody')
    this.#items.forEach(item => tbody.append(new RowAbastecimento(item)))
    
    tbody.addEventListener('click', handleClickTbody, { ...this.#signal })
    buttonInsert.addEventListener('click', () => MAIN_ROOT.append(new ModalAbastecimento()), { ...this.#signal })
    
    this.#root = this.attachShadow({ mode: 'open' })
    this.#root.append(clone)

    if (this.#items?.length) {
      this.#createChart()
    }
  }
}

customElements.define(TABELA_ABASTECIMENTOS_NAME, TabelaAbastecimentos)
