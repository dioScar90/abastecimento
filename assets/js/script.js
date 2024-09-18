import { ModalAbastecimento } from "./ModalAbastecimento.js"

const MAIN_ROOT = document.querySelector('#root')

document.querySelector('button').addEventListener('click', () => MAIN_ROOT.append(new ModalAbastecimento()))
