import { ModalAbastecimento } from "./ModalAbastecimento.js"

const MAIN_ROOT = document.querySelector('#root')

document.querySelector('button').addEventListener('click', () => {
  if (MAIN_ROOT.matches(':has(modal-abastecimento)')) {
    alert('Já existe um modal na página')
    return
  }

  MAIN_ROOT.append(new ModalAbastecimento())
})
