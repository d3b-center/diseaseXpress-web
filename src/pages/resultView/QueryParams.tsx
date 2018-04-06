import React, { Component } from 'react';
import { observer } from "mobx-react";
import styles from './styles.module.scss';
import ReactSelect from 'react-select';
import { QueryStore, ChartType, NORMALIZATIONS, SelectOption, NormalizationType, Normalization } from './QueryStore';
import { observable, computed } from 'mobx';
import { debounceAsync } from 'mobxpromise';
const Select = require('react-select');
import * as _ from 'lodash';

export interface IQueryParamsProps {
	store: QueryStore;
}

@observer
export class QueryParams extends React.Component<IQueryParamsProps, {}> {
	@observable selectedStudies: string[] = []
	@observable selectedNormalization = NORMALIZATIONS[0]
	@observable selectedGeneSymbol1: SelectOption
	@observable selectedGeneSymbol2: SelectOption

	constructor(props: IQueryParamsProps) {
		super();
		this.handleStudiesChange = this.handleStudiesChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	@observable queryParams: {
		geneSymbols: string[],
		studies: string[],
		normalizations: Normalization[]
	}

	@computed get submitEnabled() {
		let validGeneSymbols = false;
		let geneSymbols: string[] = []

		if (this.selectedGeneSymbol1) {
			validGeneSymbols = true;
			geneSymbols.push(this.selectedGeneSymbol1.value);
		}

		if (validGeneSymbols && this.props.store.chartType === ChartType.SCATTER) {
			if (this.selectedGeneSymbol2) {
				geneSymbols.push(this.selectedGeneSymbol2.value);
			} else {
				validGeneSymbols = false;
			}
		}

		return (validGeneSymbols &&
			this.selectedStudies &&
			this.selectedStudies.length > 0 &&
			this.selectedNormalization &&
			(JSON.stringify({
				geneSymbols: geneSymbols,
				studies: this.selectedStudies,
				normalizations: [this.selectedNormalization]
			}) !== JSON.stringify(this.queryParams)));
	}

	private handleStudiesChange(selectedOption: any) {
		this.selectedStudies = _.map(selectedOption as SelectOption[], obj => obj.value);
	}

	private handleSubmit() {
		if(this.submitEnabled){
			let geneSymbols = this.props.store.chartType === ChartType.SCATTER ? [this.selectedGeneSymbol1.value,this.selectedGeneSymbol2.value]:[this.selectedGeneSymbol1.value];
			let filters = {
				geneSymbols: geneSymbols,
				studies: this.selectedStudies,
				normalizations: [this.selectedNormalization]
			};
			this.queryParams = filters;
			this.props.store.handleSubmit(this.queryParams);
		}

	}

	private invokeGenesLater = debounceAsync(
		async (input: string): Promise<{ options: SelectOption[] }> => {
			input = input.toLowerCase();
			var data: { options: SelectOption[]} = { options: [] }
			if (input && input.length > 1) {
				let filteredGenes = []
				for (let geneSymbol of this.props.store.globalStores.genes) {
					if (geneSymbol.toLowerCase().includes(input)) {
						filteredGenes.push(geneSymbol)
					}
					if (filteredGenes.length === 10) {
						break;
					}
				}
				data.options = filteredGenes.map(gene => ({ label: gene, value: gene }));
			}
			return data;
		},
		300
	);
	render() {
		return (<div>
			{this.props.store.chartType === ChartType.BOX &&
				<div className={styles.flexRow}>
					<div className={styles.SectionHeader}><span>Gene Symbol</span></div>
					<div>
						<Select.Async
							className={styles.Select}
							value={this.selectedGeneSymbol1}
							onChange={(obj: SelectOption) => { this.selectedGeneSymbol1 = obj }}
							loadOptions={this.invokeGenesLater}
							cache={false}
						/>
					</div>
				</div>
			}
			{this.props.store.chartType === ChartType.SCATTER &&
				<div>
					<div className={styles.flexRow}>
						<div className={styles.SectionHeader}><span>Gene Symbol(y)</span></div>
						<div>
							<Select.Async
								className={styles.Select}
								value={this.selectedGeneSymbol1}
								onChange={(obj: SelectOption) => { this.selectedGeneSymbol1 = obj }}
								loadOptions={this.invokeGenesLater}
								cache={false}
							/>
						</div>
					</div>
					<div className={styles.flexRow}>
						<div className={styles.SectionHeader}><span>Gene Symbol(x)</span></div>
						<div>
							<Select.Async
								className={styles.Select}
								value={this.selectedGeneSymbol2}
								onChange={(obj: SelectOption) => { this.selectedGeneSymbol2 = obj }}
								loadOptions={this.invokeGenesLater}
								cache={false}
							/>
						</div>
					</div>
				</div>
			}

			<div className={styles.flexRow}>
				<div className={styles.SectionHeader}><span>Studies</span></div>
				<div>
					<ReactSelect
						className={styles.Select}
						value={jQuery.merge([], this.selectedStudies)}
						multi
						options={this.props.store.studiesOption}
						placeholder="Select Studies"
						onChange={this.handleStudiesChange} />
				</div>
			</div>

			<div className={styles.flexRow}>
				<div className={styles.SectionHeader}><span>Normalization</span></div>
				<div>
					<ReactSelect
						className={styles.Select}
						value={this.selectedNormalization.value}
						options={NORMALIZATIONS}
						placeholder="Select Normalization"
						onChange={(obj: Normalization) => { this.selectedNormalization = obj }}
						clearable={false} />
				</div>
			</div>

			<div className={styles.flexRow}>
				<button onClick={this.handleSubmit}
					className='btn btn-primary'
					disabled={!this.submitEnabled} >
					Submit
			  </button>
			</div>

		</div>)
	}
}
