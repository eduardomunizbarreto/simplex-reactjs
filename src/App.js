import React from 'react'
import './App.css'
import Simplex from './models/Simplex'
import { Container, Col, Row, Table } from 'react-bootstrap'

export default class App extends React.Component {
	quantidadeVariaveis = 2
	quantidadeRestricoes = 3
	matriz = [
		[1, -3, -5, 0, 0, 0, 0],
		[0, 2, 4, 1, 0, 0, 10],
		[0, 6, 1, 0, 1, 0, 20],
		[0, 1, -1, 0, 0, 1, 30],
	]
	iteracoes = []
	state = {
		iteracoes: this.iteracoes,
		simplex: null,
		solucao: null
	}

	componentDidMount() {
		let iteracoes = this.state.iteracoes
		let simplex = new Simplex(JSON.parse(JSON.stringify(this.matriz)))
		simplex.resolver().map((iteracao) => iteracoes.push(iteracao))

		let solucao = "Solução: "
		for (let l = 1; l <= this.quantidadeVariaveis; l++) {
			let valor = 0
			for (let c = 0; c <= this.quantidadeRestricoes; c++) {
				if (simplex.matriz[l][c] === 1) {
					valor = simplex.matriz[c][simplex.colunas() - 1];
					break;
				}
			}
			if (l === this.quantidadeVariaveis) {
				solucao += "x" + l + " = " + valor;
			} else {
				solucao += "x" + l + " = " + valor + ", ";
			}
		}
		solucao += " e Z = " + simplex.matriz[0][simplex.colunas() - 1];

		this.setState({
			iteracoes: iteracoes,
			simplex: simplex,
			solucao: solucao
		})
	}

	mostrarVariaveis(iteracao) {
		let variaveisView = []
		for (let i = 1; i <= this.quantidadeVariaveis + this.quantidadeRestricoes; i++) {
			variaveisView.push(<th className={(i === iteracao.colEntra) && (iteracao.showBorder) ? 'col-entra' : ''} key={"v" + i}>x{i}</th>)
		}
		return variaveisView;
	}

	mostrarSolucao() {
		return (<h3 className="pb-5">{this.state.solucao}</h3>)
	}

	mostrarMatriz(iteracao) {
		return iteracao.matriz.map((linha, indiceLinha) => {
			return (
				<tr className={(indiceLinha === iteracao.linhaPivo) && (iteracao.showBorder) ? 'linha-pivo' : ''} key={indiceLinha}>
					{linha.map((valor, indiceValor) => {
						return (<td className={(valor === iteracao.elementoPivo) && (iteracao.showBorder) ? 'elemento-pivo' : (indiceValor === iteracao.colEntra) && (iteracao.showBorder) ? 'col-entra' : ''} key={indiceLinha + "" + indiceValor}>{valor}</td>)
					})}
				</tr>
			)
		})
	}

	mostrarIteracoes() {
		return this.state.iteracoes.map(
			(iteracao) => {
				return (
					<Row className="pt-2">
						<Col>
							<div className="App">
								<h5 className="text-muted">{iteracao.descricao}</h5>
								<Table striped bordered hover>
									<thead>
										<tr>
											<th>Z</th>
											{this.mostrarVariaveis(iteracao)}
											<th>b</th>
										</tr>
									</thead>
									<tbody>
										{this.mostrarMatriz(iteracao)}
									</tbody>
								</Table>
							</div>
						</Col>
					</Row>
				)
			}
		)
	}

	render() {
		return (
			<Container className="pt-5">
				{this.state.simplex &&
					(
						<div>
							<h3>Resolução</h3>
							<hr></hr>
							{this.mostrarIteracoes()}
							<hr></hr>
							{this.state.solucao && this.mostrarSolucao()}
						</div>
					)
				}
			</Container>
		)
	}
}
