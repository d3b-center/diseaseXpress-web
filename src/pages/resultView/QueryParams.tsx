import React, { Component } from 'react';
import { observer } from "mobx-react";
import styles from './styles.module.scss';
import ReactSelect from 'react-select';
import { QueryStore, ChartType, NORMALIZATIONS, SelectOption, NormalizationType, Normalization } from './QueryStore';
import { observable, computed, action } from 'mobx';
import { debounceAsync } from 'mobxpromise';
const Select = require('react-select');
import * as _ from 'lodash';

export interface IQueryParamsProps {
	store: QueryStore;
	handleParamsChange: (params:any) => void;
}

@observer
export class QueryParams extends React.Component<IQueryParamsProps, {}> {
	@observable selectedStudies: string[] = []
	@observable selectedNormalization = NORMALIZATIONS[0]
	@observable geneY: SelectOption
	@observable geneX: SelectOption

	constructor(props: IQueryParamsProps) {
		super(props);
		this.handleStudiesChange = this.handleStudiesChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);

		if(props.store.parameters.geneY){
			this.geneY = { value: props.store.parameters.geneY, label: props.store.parameters.geneY } 
		}

		if(props.store.parameters.geneX){
			this.geneX = { value: props.store.parameters.geneX, label: props.store.parameters.geneX } 
		}

		if(props.store.parameters.studies){
			this.selectedStudies = props.store.parameters.studies
		}

		if(props.store.parameters.normalization){
			this.selectedNormalization = NORMALIZATIONS.find(obj => obj.value == props.store.parameters.normalization.value) ||  NORMALIZATIONS[0]
		}
		this.handleSubmit(false)
	}

	@observable selectedParams: {
		geneY: string,
		geneX?: string,
		studies: string[],
		normalization: Normalization
	}

	@computed get submitEnabled() {
		let validGeneSymbols = false;

		if (this.geneY) {
			validGeneSymbols = true;
		}

		if (validGeneSymbols &&
			this.props.store.chartType === ChartType.SCATTER &&
			!this.geneX) {
				validGeneSymbols = false;
		}

		return (validGeneSymbols &&
			this.selectedStudies &&
			this.selectedStudies.length > 0 &&
			this.selectedNormalization &&
			(JSON.stringify({
				geneY: this.geneY.value,
				geneX: this.props.store.chartType === ChartType.SCATTER ? this.geneX.value : undefined,
				studies: this.selectedStudies,
				normalization: this.selectedNormalization
			}) !== JSON.stringify(this.selectedParams)));
	}

	private handleStudiesChange(selectedOption: any) {
		this.selectedStudies = _.map(selectedOption as SelectOption[], obj => obj.value);
		
	}

	@action private handleSubmit(updateRoute:boolean=true) {
		if(this.submitEnabled){
			if(updateRoute){
				this.props.handleParamsChange({
					geneY: this.geneY.value,
					geneX: this.props.store.chartType === ChartType.SCATTER ? this.geneX.value : undefined,
					studies: this.selectedStudies.join(','),
					normalization: this.selectedNormalization.value,
					tumorSubset:undefined
				})
			}
			this.selectedParams = {
				geneY: this.geneY.value,
				geneX: this.props.store.chartType === ChartType.SCATTER ? this.geneX.value : undefined,
				studies: this.selectedStudies,
				normalization: this.selectedNormalization
			}
			this.props.store.handleSubmit(this.selectedParams);
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
							value={this.geneY}
							onChange={(obj: SelectOption) => this.geneY = obj }
							loadOptions={this.invokeGenesLater}
							cache={false}
							valueKey={'value'}
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
								value={this.geneY}
								onChange={(obj: SelectOption) => { this.geneY = obj }}
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
								value={this.geneX}
								onChange={(obj: SelectOption) => { this.geneX = obj }}
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
						closeOnSelect={false}
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
				<button onClick={(event:any) => {this.handleSubmit()}}
					className='btn btn-primary'
					disabled={!this.submitEnabled} >
					Submit
			  </button>
			</div>

		</div>)
	}
}
