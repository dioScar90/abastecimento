import { getCloneByTemplateId, getFormattedLocaleDateString, getItemsByStorage } from "./utils.js"

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
      'rgba(201, 203, 207, 0.2)',
    ],
    borderColor: [
      'rgb(201, 203, 207)',
      'rgb(255, 99, 132)',
      'rgb(255, 159, 64)',
      'rgb(255, 205, 86)',
      'rgb(75, 192, 192)',
      'rgb(54, 162, 235)',
      'rgb(153, 102, 255)',
    ],
    borderWidth: 1
  }
}

function getObjectForCreatingChart({ labels, data }) {
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

function getLabelsAndDataProps() {
  const values = getItemsByStorage()

  if (!values.length) {
    return { labels: [], data: [] }
  }

  const itens = []

  let lastKm = 0
  let litros = 0
  
  for (let i = 0; i < values.length; i++) {
    if (i === 0 && values[i].isFull) {
      lastKm = values[i].km
      continue
    }

    litros += values[i].liters

    if (values[i].isFull) {
      const percorrido = values[i].km - lastKm
      const autonomia = percorrido / litros

      itens.push({ percorrido, lastKm, litros, autonomia, date: values[i].date })

      lastKm = values[i].km
      litros = 0
    }
  }
  
  return {
    labels: itens.map(({ date }) => getFormattedLocaleDateString(date)),
    data: itens.map(({ autonomia }) => autonomia.toFixed(2)),
  }
}

function getInitialObjectForChart() {
  return getObjectForCreatingChart({ ...getLabelsAndDataProps() })
}

export class GraficoAbastecimentos extends HTMLElement {
  #root
  #obj
  #chart
  
  constructor() {
    super()
    this.#obj = getInitialObjectForChart()
  }

  #getNewChart() {
    const canvas = this.#root.querySelector('canvas')
    return new Chart(canvas.getContext('2d'), { ...this.#obj })
  }

  updateChart() {
    if (!this.#chart) {
      this.#chart = this.#getNewChart()
    }

    const { labels, data } = getLabelsAndDataProps()

    this.#chart.data.labels = labels
    this.#chart.data.datasets[0].data = data

    this.#chart.update()
  }
  
  // disconnectedCallback() {}

  connectedCallback() {
    const clone = getCloneByTemplateId('#chart_template')
    
    this.#root = this.attachShadow({ mode: 'open' })
    this.#root.append(clone)

    this.updateChart()
  }
}

customElements.define(GRAFICO_ABASTECIMENTOS_NAME, GraficoAbastecimentos)
