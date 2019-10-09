/* eslint-disable no-useless-constructor */
export default class Simplex {
	matriz = [[]]
	colEntra
	linhaPivo
	elementoPivo

	constructor(matriz) {
		this.matriz = matriz
	}

	resolver() {
		let iteracoes = []

		while (!this.solucaoOtima()) {
			this.colEntra = this.colQueEntra()
			this.linhaPivo = this.acharLinhaPivo(this.colEntra)
			this.elementoPivo = this.matriz[this.linhaPivo][this.colEntra]
			let iteracao = {
				descricao: 'Identificando coluna que deve entrar na base (vermelho), linha pivô (verde) e elemento pivô (azul)',
				colEntra: this.colEntra,
				linhaPivo: this.linhaPivo,
				elementoPivo: this.elementoPivo,
				showBorder: true,
				matriz: JSON.parse(JSON.stringify(this.matriz))
			}
			iteracoes.push(iteracao)
			iteracoes.push(this.calcularNovaLinhaPivo())
			this.calcularNovasLinhas().map((iteracao) => iteracoes.push(iteracao))
		}
		
		return iteracoes
	}

	solucaoOtima() {
		for (let i = 0; i < this.matriz[0].length; i++) {
			if (this.matriz[0][i] < 0)
				return false
		}
		return true
	}

	linhas() {
		return this.matriz.length
	}

	colunas() {
		return this.matriz[0].length
	}

	calcularNovasLinhas() {
		let iteracoes = []
		for (let i = 0; i < this.matriz.length; i++) {
			if (i === this.linhaPivo)
				continue

			let multiplicador = (this.matriz[i][this.colEntra] !== 0) ? -1 * this.matriz[i][this.colEntra] : 0
			for (let j = 0; j < this.matriz[i].length; j++) {
				this.matriz[i][j] = (this.matriz[this.linhaPivo][j] * multiplicador) + this.matriz[i][j]
			}

			let iteracao = {
				descricao: `Linha ${i + 1} = (${multiplicador} * Linha ${this.linhaPivo + 1}) + Linha ${i + 1}`,
				showBorder: false,
				matriz: JSON.parse(JSON.stringify(this.matriz))
			}

			iteracoes.push(iteracao)
		}
		return iteracoes
	}

	calcularNovaLinhaPivo() {
		for (let i = 0; i < this.matriz[this.linhaPivo].length; i++) {
			this.matriz[this.linhaPivo][i] = this.matriz[this.linhaPivo][i] / this.elementoPivo
		}
		let iteracao = {
			descricao: `Calculando nova linha pivo, divindo todos os elementos da linha pivô: ${this.linhaPivo + 1} pelo elemento pivô: ${this.elementoPivo}`,
			showBorder: false,
			matriz: JSON.parse(JSON.stringify(this.matriz))
		}
		return iteracao
	}

	acharLinhaPivo(colEntra) {
		let indiceMenor = 0
		let menor = Number.MAX_VALUE
		for (let l = 1; l < this.matriz.length; l++) {
			let b = this.matriz[l][this.matriz[l].length - 1]
			let x = this.matriz[l][colEntra]
			let div = b / x
			if (div > 0 && (div < menor)) {
				menor = div
				indiceMenor = l
			}
		}
		return indiceMenor
	}

	colQueEntra() {
		let indiceZ = 0
		let indiceEntra;
		let maiorAbs = this.matriz[indiceZ][1]
		for (let i = 0; i < this.matriz[indiceZ].length; i++) {
			let valor = this.matriz[indiceZ][i]
			if (valor < 0) {
				let valorAbs = Math.abs(this.matriz[indiceZ][i])
				if (valorAbs >= maiorAbs) {
					maiorAbs = valorAbs
					indiceEntra = i
				}
			}
		}
		return indiceEntra
	}

	print() {
		console.table(this.matriz)
	}
}