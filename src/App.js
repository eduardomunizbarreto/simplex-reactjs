import React from 'react'
import './App.css'
import Simplex from './models/Simplex'
import { Form, Button, ButtonToolbar, Container, Col, Row, Table } from 'react-bootstrap'

export default class App extends React.Component {
	matriz = []
	iteracoes = []
	state = {
		iteracoes: this.iteracoes,
		simplex: null,
		solucao: null,
		quantidadeVariaveis: '',
		quantidadeRestricoes: '',
		mostrarFormFuncaoObjetivoRestricoes: false
	}

	handleChange = (event) => {
		this.setState({
			[event.target.name]: event.target.value
		})
	}

	calcularSimplex() {
		if (this.state.solucao)
			return
		let iteracoes = this.state.iteracoes
		let simplex = new Simplex(JSON.parse(JSON.stringify(this.matriz)))
		simplex.resolver().map((iteracao) => iteracoes.push(iteracao))
		let solucao = "Solução: "

		for (let l = 1; l <= this.state.quantidadeRestricoes; l++) {
			for (let c = 1; c <= this.state.quantidadeVariaveis + this.state.quantidadeRestricoes; c++) {
				if (simplex.matriz[l][c] == 1) {
					if (l == this.state.quantidadeRestricoes) {
						solucao += `x${c} = ${simplex.matriz[l][simplex.colunas() - 1]}`
					}
					else {
						solucao += `x${c} = ${simplex.matriz[l][simplex.colunas() - 1]}, `
					}
					break;
				}
			}
		}

		solucao += ` e Z = ${simplex.matriz[0][simplex.colunas() - 1]}`;

		this.setState({
			iteracoes: iteracoes,
			simplex: simplex,
			solucao: solucao
		})
	}

	onStartButton() {
		if (!(this.state.quantidadeVariaveis > 0 && this.state.quantidadeRestricoes > 0))
			return

		this.setState({
			mostrarFormFuncaoObjetivoRestricoes: true,
			quantidadeVariaveis: Number(this.state.quantidadeVariaveis),
			quantidadeRestricoes: Number(this.state.quantidadeRestricoes)
		})
	}

	montarMatriz() {
		try {
			this.montarFuncaoObjetivoMatriz()
			this.montarDemaisValoresMatriz()
		} catch (error) {
			console.error(error)
		}
	}

	montarDemaisValoresMatriz() {
		let inputsB = document.querySelectorAll(".inputB");
		for (let l = 1; l <= this.state.quantidadeRestricoes; l++) {
			let linha = [0]
			let inputsR = document.querySelectorAll(".inputR" + l);
			for (let c = 0; c < this.state.quantidadeVariaveis; c++) {
				if (inputsR[c].value === '')
					throw new Error("Por favor preencha os valores corretamente")

				linha[c + 1] = Number(inputsR[c].value)
			}

			for (let o = 1; o <= this.state.quantidadeRestricoes; o++) {
				linha[o + this.state.quantidadeVariaveis] = (l === o) ? 1 : 0
			}
			
			linha[linha.length] = Number(inputsB[l - 1].value)
			this.matriz[l] = JSON.parse(JSON.stringify(linha))
		}

		this.calcularSimplex()
	}

	montarFuncaoObjetivoMatriz() {
		// Preencher matriz com valores da função objetivo
		let inputsZ = document.querySelectorAll(".inputZ");
		let indiceZ = 0
		let funcaoObjetivo = [1]
		for (let i = 0; i < this.state.quantidadeVariaveis + this.state.quantidadeRestricoes + 1; i++) {
			if (inputsZ[i] == undefined) {
				funcaoObjetivo[i + 1] = 0
				continue
			}

			if (inputsZ[i].value === '')
				throw new Error("Por favor preencha os valores corretamente")

			funcaoObjetivo[i + 1] = -1 * Number(inputsZ[i].value)
		}
		this.matriz[indiceZ] = funcaoObjetivo

		console.table(this.matriz)
	}

	mostrarBotoes() {
		return (
			<ButtonToolbar>
				<Button style={{ marginRight: '10px' }} disabled={this.state.solucao} size="sm" variant="primary" onClick={() => this.montarMatriz()}>Resolver</Button>
				<Button size="sm" variant="secondary">Novo</Button>
			</ButtonToolbar>
		)
	}

	mostrarFormFuncaoObjetivo() {
		let rows = []

		for (let i = 1; i <= this.state.quantidadeVariaveis; i++) {
			rows.push(i)
		}

		return (
			<Form>
				<h4>Função objetivo</h4>
				<Row noGutters>
					<span style={{ marginRight: '10px' }}> Z = </span>
					{rows.map(
						(i) => (
							<Col lg="1">
								<Form.Group style={{ 'display': 'flex' }}>
									<Form.Control style={{ 'width': '50%' }} className="inputZ" size="sm" onChange={this.handleChange} type="number" />
									<span>x{i}</span>
									{(i !== this.state.quantidadeVariaveis) && <span style={{ marginLeft: '10%' }}>+</span>}
								</Form.Group>
							</Col>
						)
					)}
				</Row>
			</Form>
		)
	}

	mostrarFormRestricoes() {
		let rows = []
		let variaveis = []
		for (let i = 1; i <= this.state.quantidadeRestricoes; i++) {
			rows.push(i)
		}

		for (let i = 1; i <= this.state.quantidadeVariaveis; i++) {
			variaveis.push(i)
		}

		return (
			<Form>
				{rows.map(
					(i) => (
						<div>
							<h4>Restrição {i}</h4>
							<Row noGutters>
								<Form.Group style={{ 'display': 'flex' }}>
									{variaveis.map(
										(j) => (
											<Row style={{ 'width': '20%', marginRight: '10px' }}>
												<Form.Control style={{ 'width': '50%' }} className={"inputR" + i} size="sm" onChange={this.handleChange} type="number" />
												<span>x{j}</span>
												{(j !== this.state.quantidadeVariaveis) && <span style={{ marginLeft: '10%' }}>+</span>}
											</Row>
										)
									)}
									<span style={{ marginRight: '5%' }}>{"<="}</span>
									<Form.Control style={{ 'width': '9%' }} className="inputB" size="sm" onChange={this.handleChange} type="number" />
								</Form.Group>
							</Row>
						</div>
					)
				)}
			</Form>
		)
	}

	mostrarVariaveis(iteracao) {
		let variaveisView = []
		for (let i = 1; i <= this.state.quantidadeVariaveis + this.state.quantidadeRestricoes; i++) {
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
						return (<td className={((indiceLinha === iteracao.linhaPivo) && (indiceValor === iteracao.colEntra)) && (iteracao.showBorder) ? 'elemento-pivo' : (indiceValor === iteracao.colEntra) && (iteracao.showBorder) ? 'col-entra' : ''} key={indiceLinha + "" + indiceValor}>{valor}</td>)
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
				<h2>Simplex</h2>
				<Form>
					<Form.Group as={Row}>
						<Form.Label column lg="2">
							Quantas variáveis?
    					</Form.Label>
						<Col lg="1">
							<Form.Control size="sm" name="quantidadeVariaveis" disabled={this.state.mostrarFormFuncaoObjetivoRestricoes} value={this.state.quantidadeVariaveis} onChange={this.handleChange} type="number" />
						</Col>
					</Form.Group>

					<Form.Group as={Row}>
						<Form.Label column lg="2">
							Quantas restrições?
    					</Form.Label>
						<Col lg="1">
							<Form.Control size="sm" name="quantidadeRestricoes" disabled={this.state.mostrarFormFuncaoObjetivoRestricoes} value={this.state.quantidadeRestricoes} onChange={this.handleChange} type="number" />
						</Col>
						<Button variant="primary" size="sm" disabled={this.state.mostrarFormFuncaoObjetivoRestricoes} onClick={() => this.onStartButton()}>OK</Button>
					</Form.Group>
				</Form>
				{this.state.mostrarFormFuncaoObjetivoRestricoes && this.mostrarFormFuncaoObjetivo()}
				{this.state.mostrarFormFuncaoObjetivoRestricoes && this.mostrarFormRestricoes()}
				{this.state.mostrarFormFuncaoObjetivoRestricoes && this.mostrarBotoes()}
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
