import { ModalAbastecimento } from "./ModalAbastecimento.js"
import { getCloneByTemplateId, getFormattedCurrency, getFormattedLiters, getFormattedLocaleDateString, getItemsByStorage } from "./utils.js"
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

export class TabelaAbastecimentos extends HTMLElement {
  #items = []
  #trs = new Map()
  #controller
  #signal

  constructor() {
    if (document.body.matches(`:has(${TABELA_ABASTECIMENTOS_NAME})`)) {
      throw new AlreadyExistsTabelaAbastecimentosError()
    }

    super()
    this.#items = getItemsByStorage()
    this.#controller = new AbortController()
    this.#signal = { signal: this.#controller.signal }
  }

  static #getNewTr({ id, date, liters, price }) {
    const template = document.createElement('template')

    const data = getFormattedLocaleDateString(date)
    const qtde = getFormattedLiters(liters)
    const preco = !price ? '---' : getFormattedCurrency(price)

    template.innerHTML = `
      <tr data-id="${id}" data-date="${date}" data-liters="${liters}" data-price="${price || ''}">
        <td>${data}</td>
        <td>${qtde}</td>
        <td>${preco}</td>
        <td><button>Excluir</button></td>
      </tr>
    `

    return template.content
  }

  removerTr = id => {
    const tr = this.#trs.get(id)
    tr?.remove()
    this.#trs.delete(id)
  }
  
  // disconnectedCallback() {}

  connectedCallback() {
    const clone = getCloneByTemplateId('#table_items_template')
    
    const tbody = clone.querySelector('tbody')
    
    const trs = this.#items.map(TabelaAbastecimentos.#getNewTr)
    
    trs.forEach(tr => {
      tbody.append(tr)
      this.#trs.set(tbody.lastElementChild.dataset.id, tbody.lastElementChild)
    })

    tbody.addEventListener('click', handleClickTbody, { ...this.#signal })
    
    const shadow = this.attachShadow({ mode: 'open' })
    shadow.append(clone)
  }
}

customElements.define(TABELA_ABASTECIMENTOS_NAME, TabelaAbastecimentos)
