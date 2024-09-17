import { MODAL_ABASTECIMENTO_NAME, ModalAbastecimento } from "./ModalAbastecimento.js"
import { TabelaAbastecimentos } from "./TabelaAbastecimentos.js"

const MAIN_ROOT = document.querySelector('#root')

document.querySelector('button').addEventListener('click', () => {
  if (MAIN_ROOT.matches(`:has(${MODAL_ABASTECIMENTO_NAME})`)) {
    alert('Já existe um modal na página')
    return
  }

  MAIN_ROOT.append(new ModalAbastecimento())
})

document.querySelector('button:nth-of-type(2)').addEventListener('click', () => MAIN_ROOT.append(new TabelaAbastecimentos()))

// document.addEventListener('DOMContentLoaded', () => MAIN_ROOT.append(new TabelaAbastecimentos()))
