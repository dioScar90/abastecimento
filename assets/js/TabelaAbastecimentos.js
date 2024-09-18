import { ModalAbastecimento } from "./ModalAbastecimento.js"
import { RowAbastecimento } from "./RowAbastecimento.js"
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

let countTabelaAbastecimentos = 0

customElements.define(TABELA_ABASTECIMENTOS_NAME, class T extends HTMLElement {
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
    const tr = this.#root.querySelector(`tr[data-id="${id}"]`)
    tr?.remove()
  }
  
  // disconnectedCallback() {}

  connectedCallback() {
    const clone = getCloneByTemplateId('#table_items_template')
    
    const tbody = clone.querySelector('tbody')
    // this.#items.forEach(item => tbody.append(T.#getNewTr(item)))
    this.#items.forEach(item => tbody.append(new RowAbastecimento(item)))

    tbody.addEventListener('click', handleClickTbody, { ...this.#signal })
    
    this.#root = this.attachShadow({ mode: 'open' })
    this.#root.append(clone)
  }
})
