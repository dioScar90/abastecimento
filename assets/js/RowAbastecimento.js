import { getFormattedKm, getFormattedLiters, getFormattedLocaleDateString } from "./utils.js"
export const ROW_ABASTECIMENTOS_NAME = 'row-abastecimento'

export class RowAbastecimento extends HTMLTableRowElement {
  #values = {}

  constructor(values) {
    super()

    this.#values = { ...values }
  }

  static #getNewTr({ date, km, liters, isFull }) {
    const template = document.createElement('template')

    const data = getFormattedLocaleDateString(date)
    const quilometragem = getFormattedKm(km)
    const quantidade = getFormattedLiters(liters)
    const completou = !isFull ? '---' : 'Completou'

    template.innerHTML = `
			<td>${data}</td>
			<td>${quilometragem}</td>
			<td>${quantidade}</td>
			<td>${completou}</td>
			<td><button part="btn btn-danger">Excluir</button></td>
    `
    
    return template.content
  }

  removeTr = () => this.remove()
  
  // disconnectedCallback() {}

  connectedCallback() {
    const tds = RowAbastecimento.#getNewTr(this.#values)
    
		this.setAttribute('is', ROW_ABASTECIMENTOS_NAME)
		this.setAttribute('data-id', this.#values.id)
		
    this.append(tds)
  }
}

customElements.define(ROW_ABASTECIMENTOS_NAME, RowAbastecimento, { extends: 'tr' })
