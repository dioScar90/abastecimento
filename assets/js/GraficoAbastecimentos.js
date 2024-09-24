// import { Chart } from "./script.js"
import { getCloneByTemplateId, getItemsByStorage } from "./utils.js"

console.log({ Chart })

export const GRAFICO_ABASTECIMENTOS_NAME = 'grafico-abastecimentos'

function getBaseConfigForChart() {
  return {
    type: 'bar',
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    },
  }
}

function getBaseCssForChart() {
  return {
    backgroundColor: [
      'rgba(255, 99, 132, 0.2)',
      'rgba(255, 159, 64, 0.2)',
      'rgba(255, 205, 86, 0.2)',
      'rgba(75, 192, 192, 0.2)',
      'rgba(54, 162, 235, 0.2)',
      'rgba(153, 102, 255, 0.2)',
      'rgba(201, 203, 207, 0.2)'
    ],
    borderColor: [
      'rgb(255, 99, 132)',
      'rgb(255, 159, 64)',
      'rgb(255, 205, 86)',
      'rgb(75, 192, 192)',
      'rgb(54, 162, 235)',
      'rgb(153, 102, 255)',
      'rgb(201, 203, 207)'
    ],
    borderWidth: 1
  }
}

function getObjectForCreatingChart(data = [], labels = []) {
  return {
    ...getBaseConfigForChart(),
    data: {
      labels,
      datasets: [{
        label: 'Autonomia',
        data,
        ...getBaseCssForChart()
      }]
    }
  }
}

function getItemsForChart() {
  const values = getItemsByStorage()

  if (!values.length) {
    return getObjectForCreatingChart()
  }

  const itens = []

  let lastKm = values.at(-1).km
  let litros = 0

  for (let i = values.length - 1; i >= 0; i--) {
    lastKm = values[i].km > lastKm ? values[i].km : lastKm
    litros += values[i].liters

    if (values[i].full === true) {
      const percorrido = !itens.length ? lastKm : lastKm - itens.at(-1).lastKm
      const autonomia = percorrido / litros

      itens.push({ percorrido, lastKm, litros, autonomia, date: values[i].date })
      lastKm = litros = 0
    }
  }

  const labels = itens.map(({ date }) => date)
  const data = itens.map(({ autonomia }) => autonomia.toFixed(2))

  return getObjectForCreatingChart(data, labels)
}

export class GraficoAbastecimentos extends HTMLElement {
  #root
  #chart
  #chartValues
  #controller
  #signal

  constructor() {
    super()

    this.#chartValues = getItemsForChart()
    this.#controller = new AbortController()
    this.#signal = { signal: this.#controller.signal }
  }

  #getNewChart(canvas = null) {
    canvas ??= this.#root.querySelector('canvas')
    return new Chart(canvas.getContext('2d'), { ...this.#chartValues })
  }

  updateChart() {
    this.#chartValues = getItemsForChart()
    this.#getNewChart()
  }
  
  // disconnectedCallback() {}

  connectedCallback() {
    const clone = getCloneByTemplateId('#chart_template')
    
    const canvas = clone.querySelector('canvas')
    
    this.#root = this.attachShadow({ mode: 'open' })
    this.#root.append(clone)

    this.#chart = this.#getNewChart(canvas)
  }
}

customElements.define(GRAFICO_ABASTECIMENTOS_NAME, GraficoAbastecimentos)
