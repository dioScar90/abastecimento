import { getCloneByTemplateId, getFormattedCurrency, getFormattedLiters, getFormattedLocaleDateString, getItemsByStorage } from "./utils.js"
export const TABELA_ABASTECIMENTOS_NAME = 'tabela-abastecimentos'

class AlreadyExistsTabelaAbastecimentosError extends Error {
  constructor() {
    const message = 'Tabela de abastecimentos já existe na página. Cadastre um novo item para preenchê-la.'
    super(message)
    setTimeout(() => alert(message), 100)
  }
}

export class TabelaAbastecimentos extends HTMLElement {
  #items = []

  constructor() {
    if (document.body.matches(`:has(${TABELA_ABASTECIMENTOS_NAME})`)) {
      throw new AlreadyExistsTabelaAbastecimentosError()
    }

    super()
    this.#items = getItemsByStorage()
  }

  static #getNewTr({ id, date, liters, price }) {
    const template = document.createElement('template')

    const data = getFormattedLocaleDateString(date)
    const qtde = getFormattedLiters(liters)
    const preco = !price ? '---' : getFormattedCurrency(price)

    template.innerHTML = `
      <tr data=id="${id}" data=date="${date}" data=liters="${liters}" data=price="${price || ''}">
        <td>${data}</td>
        <td>${qtde}</td>
        <td>${preco}</td>
      </tr>
    `

    return template.content
  }
  
  // disconnectedCallback() {}

  connectedCallback() {
    const clone = getCloneByTemplateId('#table_items_template')
    
    const tbody = clone.querySelector('tbody')
    
    const trs = this.#items.map(TabelaAbastecimentos.#getNewTr)
    trs.forEach(tr => tbody.append(tr))
    
    const shadow = this.attachShadow({ mode: 'open' })
    shadow.append(clone)
  }
}

customElements.define(TABELA_ABASTECIMENTOS_NAME, TabelaAbastecimentos)
