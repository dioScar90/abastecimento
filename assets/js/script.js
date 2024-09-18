import { ModalAbastecimento } from "./ModalAbastecimento.js"
// import { TabelaAbastecimentos } from "./TabelaAbastecimentos.js"

const MAIN_ROOT = document.querySelector('#root')

document.querySelector('button').addEventListener('click', () => MAIN_ROOT.append(new ModalAbastecimento()))
// document.addEventListener('DOMContentLoaded', () => MAIN_ROOT.append(new TabelaAbastecimentos()))
