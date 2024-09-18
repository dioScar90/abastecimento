import { getFormattedCurrency, getFormattedLiters, getFormattedLocaleDateString } from "./utils.js"
export const ROW_ABASTECIMENTOS_NAME = 'row-abastecimento'

export class RowAbastecimento extends HTMLTableRowElement {
  #values = {}

  constructor(values) {
    super()

    this.#values = { ...values }
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
			<td><button part="btn">Excluir</button></td>
    `

		const datasets = [
			['data-id', id],
			['data-date', date],
			['data-liters', liters],
			['data-price', price || ''],
		]
		
    return [datasets, template.content]
  }

  removeTr = () => this.remove()
  
  // disconnectedCallback() {}

  connectedCallback() {
    const [datasets, tds] = RowAbastecimento.#getNewTr(this.#values)
    
		this.setAttribute('is', ROW_ABASTECIMENTOS_NAME)
		datasets.forEach(([key, value]) => this.setAttribute(key, value))
		
    this.append(tds)
  }
}

customElements.define(ROW_ABASTECIMENTOS_NAME, RowAbastecimento, { extends: 'tr' })
