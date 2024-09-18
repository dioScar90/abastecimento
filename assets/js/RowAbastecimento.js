import { ModalAbastecimento } from "./ModalAbastecimento.js"
import { getCloneByTemplateId, getFormattedCurrency, getFormattedLiters, getFormattedLocaleDateString, getItemsByStorage } from "./utils.js"
export const ROW_ABASTECIMENTOS_NAME = 'row-abastecimento'

function handleClickTbody(e) {
  const button = e.target.closest('button')

  if (!button) {
    return
  }

  e.stopPropagation()

  const tr = button.closest('tr')
  document.body.append(new ModalAbastecimento({ ...tr.dataset }, true))
}

export class RowAbastecimento extends HTMLTableRowElement {
  #root
  #values = {}
  #trs = new Map()
  #controller
  #signal

  constructor(values) {
    super()

    this.#values = { ...values }
    this.#controller = new AbortController()
    this.#signal = { signal: this.#controller.signal }
  }

  static #getNewTr({ id, date, liters, price }) {
    const template = document.createElement('template')

    const data = getFormattedLocaleDateString(date)
    const qtde = getFormattedLiters(liters)
    const preco = !price ? '---' : getFormattedCurrency(price)

    template.innerHTML = `
			<td>${data}</td>
			<td>${qtde}</td>
			<td>${preco}</td>
			<td><button>Excluir</button></td>
    `

		const datasets = [
			['data-id', id],
			['data-date', date],
			['data-liters', liters],
			['data-price', price || ''],
		]
		
    return [datasets, template.content]
  }

  removerTr = () => this.remove()
  
  // disconnectedCallback() {}

  connectedCallback() {
    const [datasets, tds] = RowAbastecimento.#getNewTr(this.#values)

    // tbody.addEventListener('click', handleClickTbody, { ...this.#signal })
    
    // this.#root = this.attachShadow({ mode: 'open' })
    // this.#root.append(clone)
		this.setAttribute('is', ROW_ABASTECIMENTOS_NAME)
		datasets.forEach(([key, value]) => this.setAttribute(key, value))
		
    this.append(tds)
  }
}

customElements.define(ROW_ABASTECIMENTOS_NAME, RowAbastecimento, { extends: 'tr' })
