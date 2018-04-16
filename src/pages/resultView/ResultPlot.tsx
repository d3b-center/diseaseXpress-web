import React, { Component } from 'react';
import { Normalization, SelectOption, ChartType } from "./QueryStore";
import { observer } from "mobx-react";
import { observable, computed } from 'mobx';
import * as _ from 'lodash';
import jStat from 'jStat';
import styles from './styles.module.scss';
import ReactSelect from 'react-select';
import { ButtonGroup, Radio } from 'react-bootstrap';
import { COLORS } from 'shared/components/global/GlobalStores';
const Select = require('react-select');
import Plot from 'react-plotly.js';
import ReactTable from 'react-table'
import 'react-table/react-table.css'

export interface IBoxContentProps {
	queryParams:{
		geneY: string,
		geneX?: string,
		studies: string[],
		normalization: Normalization
	}
	handleParamsChange: (params:any) => void;
	chartType:string;
	data: {
        [sampleId: string]: {
            [id: string]: any;
        };
	};
	selections:{
		tumorSubset?:string,
		logScale?:boolean,
		category?:string,
		collapsedStudy?:string,
		reference?:string,
		correlation?:string
	}
}

export const CORRELATION = [{
	label: "Pearson",
	value: "pearson"
}, {
	label: "Spearman",
	value: "spearman"
}]

export const CATEGORIES = [{
	label: "Study",
	value: "study_id",
	value2: "study_id",
	showCollapseContorl: false,
	showInBoxPlot: true
}, {
	label: "Disease/Tissue",
	value: "disease",
	value2: "tissue",
	showCollapseContorl: true,
	showInBoxPlot: true
}, {
	label: "Tumor Subset",
	value: "definition",
	value2: "definition",
	showCollapseContorl: false,
	showInBoxPlot: false
}]

export const SAMPLE_SUBSET = [{
	label: "Primary",
	value: "primary"
}, {
	label: "Recurrent",
	value: "recurrent"
}, {
	label: "All",
	value: "all"
}]

@observer
export class ResultPlot extends React.Component<IBoxContentProps, {}> {


	private geneY:string;
	private geneX?:string;
	private studies:string[];
	private normalization:Normalization;
	

	constructor(props: IBoxContentProps) {
		super();
		this.geneY = props.queryParams.geneY
		this.geneX = props.queryParams.geneX
		this.studies = props.queryParams.studies;
		this.normalization = props.queryParams.normalization

		this.handleTumorSubsetChange = this.handleTumorSubsetChange.bind(this)
		this.logScaleChange = this.logScaleChange.bind(this)
		this.handleCollapseStudyChange = this.handleCollapseStudyChange.bind(this)
		this.handleCategoryChange = this.handleCategoryChange.bind(this)
		this.handleReferenceChange = this.handleReferenceChange.bind(this)

		if (props.selections.tumorSubset) {
			this.selectedTumorSubset = props.selections.tumorSubset;
		}
		if (!_.isUndefined(props.selections.logScale)) {
			this.logScale = props.selections.logScale;
		}
		if (props.selections.category) {
			this.selectedCategory = CATEGORIES.find(obj => obj.value == props.selections.category) || CATEGORIES[0];
		}
		if (props.selections.reference) {
			this.selectedReference = props.selections.reference;
		}
		if (props.selections.collapsedStudy) {
			this.selectedCollapsedStudy = props.selections.collapsedStudy;
		}

		if (props.selections.correlation) {
			this.selectedCorrelation =CORRELATION.find(obj => obj.value == props.selections.correlation) || CORRELATION[0];
		}

	}

	@observable private logScale: boolean = false;	
	@observable selectedCategory = CATEGORIES[0];
	@observable selectedCollapsedStudy: string|undefined
	@observable selectedTumorSubset = SAMPLE_SUBSET[0].value
	@observable selectedReference: string|undefined

	@observable selectedCorrelation = CORRELATION[0];


	handleTumorSubsetChange(selectedOption: SelectOption) {
		this.selectedTumorSubset = selectedOption.value;
		this.props.handleParamsChange({tumorSubset:selectedOption.value})
	}

	logScaleChange(evt: any) {
		this.logScale = !this.logScale;
		this.props.handleParamsChange({logScale:this.logScale})
	}

	private handleCategoryChange(selection: any){
		this.selectedCategory = selection
		this.props.handleParamsChange({category:this.selectedCategory.value})
	}

	private handleCorrelationChange(selection: any){
		this.selectedCorrelation = selection
		this.props.handleParamsChange({correlation:this.selectedCorrelation.value})
	}

	handleCollapseStudyChange(selectedOption: SelectOption) {
		if(selectedOption)
			this.selectedCollapsedStudy = selectedOption.value;
		else
			this.selectedCollapsedStudy = undefined
		this.props.handleParamsChange({collapsedStudy:this.selectedCollapsedStudy})
	}

	handleReferenceChange(selectedOption: SelectOption) {
		if(selectedOption)
			this.selectedReference = selectedOption.value;
		else
			this.selectedReference = undefined

		this.props.handleParamsChange({reference:this.selectedReference})
	}


	//filter tumor subset
	@computed get stageData_1() {
		let data: { [id: string]: any }[] = [];
		let allowedDefinitions = ['normals', this.selectedTumorSubset];
		//TODO:use _.filter
		_.each(this.props.data,obj  => {
			let definition: string = obj['definition'];
			if (definition) {
				if ((this.selectedTumorSubset === "all")) {
					data.push(obj);
				} else {
					definition = definition.toLowerCase()
					let hasDefinitions = _.filter(allowedDefinitions, obj => {
						return definition.includes(obj);
					}).length>0;
					if (hasDefinitions) {
						data.push(obj);
					}
				}
			}
		});
		return data;
	}

	//apply log
	@computed get stageData_2() {
		return this.stageData_1.map(obj => {
			let toReturn = $.extend({},obj)
			toReturn.y = this.logScale ? Math.log2(obj[this.geneY] + 1) : obj[this.geneY];
			if(this.props.chartType===ChartType.SCATTER && this.geneX){
				toReturn.x = this.logScale ? Math.log2(obj[this.geneX] + 1) : obj[this.geneX];
			}
			return toReturn;
		})
	}

	//categorize
	@computed get stageData_3() {

		let groupedStudyData1 = _.groupBy(this.stageData_2, obj =>  obj[this.selectedCategory.value]|| obj[this.selectedCategory.value2])

		
		if(this.selectedCategory.showCollapseContorl && this.selectedCollapsedStudy){
			let groupedStudyData = _.groupBy(this.stageData_2, obj => obj["study_id"])
			let categorizedData:{ [id: string]: { [id: string]: any;}[]} = {}
			for (let studyId in groupedStudyData) {
				let samplesData = groupedStudyData[studyId];
				if(this.selectedCategory.showCollapseContorl){
					let groupedDiseaseData = _.groupBy(samplesData, obj => obj["disease"]||obj["tissue"])
					if(this.selectedCollapsedStudy && this.selectedCollapsedStudy === studyId){
	
						let toRet = []
						for (let disease in groupedDiseaseData) {
							let mean:number = jStat(_.map(groupedDiseaseData[disease], obj => obj['y'] as number)).mean()
							toRet.push({
								y:mean,
								disease:disease,
								study_id:studyId
							})
						}
						categorizedData[studyId] = toRet
					} else {
						categorizedData = $.extend(categorizedData, groupedDiseaseData);
					}
				} else {
					categorizedData[studyId] = samplesData;
				}
			}
			return categorizedData;

		} else {
			return _.groupBy(this.stageData_2, obj =>  obj[this.selectedCategory.value]|| obj[this.selectedCategory.value2]);
		}

	}

	//categorize
	@computed get stageData_4() {

		let categorizedData = this.stageData_3
		let boxes  = []
		let count = 0
		let legends: { [id: string]: string } = {}
		for (let category in categorizedData) {
			let ySeries = _.map(categorizedData[category], obj => obj['y'] as number)
			let studyId = categorizedData[category][0]['study_id']
			let legendgroup = this.selectedCategory.showCollapseContorl && this.props.chartType===ChartType.BOX ? studyId : category
			let showlegend = legends[legendgroup]?false:true;

			if(showlegend){
				legends[legendgroup]=COLORS[count]
				count = count+1;
				if(count === COLORS.length) count=0;
			}

			let xSeries = []
			if(this.props.chartType===ChartType.SCATTER ){
				xSeries = _.map(categorizedData[category], obj => obj['x'] as number)
			} else{
				for(var i=0; i<ySeries.length;i++){
					xSeries.push(category)
				}
			}
			
			let median:number = jStat(ySeries).median()
			boxes.push({
				y: ySeries,
				x:xSeries,
				median: median,
				name: legendgroup,
				category:category,
				marker:{
					color: legends[legendgroup]
				},
				legendgroup: legendgroup, 
				type: this.props.chartType===ChartType.SCATTER ? 'scattergl' : 'box',
				boxpoints: 'Outliers',
				mode: 'markers',
				showlegend: showlegend
			})
		}
		return boxes;
	}

	//reference
	@computed get stageData_5() {
		let ref = this.selectedReference
		
		let data = this.stageData_4
		if(this.props.chartType===ChartType.SCATTER) {
			return data;
		} else {
			let result:typeof data = []

			let filteredData:typeof data = []
			if(ref) {
				filteredData = data.filter(obj => {
					if(obj.category ==ref) {
						result.push(obj);
						return false;
					}
					return true;
				})
			} else {
				filteredData = data
			}
			return  [...result, ...filteredData.sort((a,b) => a.median-b.median)];
		}
	}

	@computed get correlationTableData() {
		let data = this.stageData_5;
		if (this.props.chartType === ChartType.SCATTER) {
			return data.map(obj => {
				let correlation: number;
				let pValue: number = 0;
				let fpValue: number = 0;
				if (this.selectedCorrelation.value == "spearman") {
					correlation = jStat.spearmancoeff(obj.x, obj.y);
				} else {
					correlation = jStat.corrcoeff(obj.x, obj.y);
				}
				let N = obj.x.length;
				let t = correlation * (Math.sqrt((N - 2) / (1 - (correlation * correlation))));
				pValue = jStat.ttest(t, N);

				return {
						name: obj.name,
						correlation: correlation.toFixed(4) as any,
						pValue: pValue.toExponential(4) as any
					};
			})
		} else {
			return [];
		}

	}

	@computed get collapsedStudies() {
		//TODO: normal dataset is hard-coded, make it dynamic
		let normalStudies = ["gtex"]
		let selectedNormalStudies = this.studies.filter(id => _.includes(normalStudies,id.toLowerCase()))
		return selectedNormalStudies.map(id => {
			return {
				label: id,
				value: id
			};
		});
	}

	@computed get referenceBoxes() {
		return this.stageData_4.map(obj => {
			return {
				label: obj.category,
				value: obj.category
			};
		});
	}

	@computed get categories(){
		let toReturn = CATEGORIES
		if(this.props.chartType === ChartType.BOX){
			toReturn = toReturn.filter(obj => obj.showInBoxPlot)
		}
		return toReturn;
	}

	controls = () => {
		return(
			<div>
				<div className={styles.flexRow}>
					<div className={styles.SectionHeader}>
						<span>Tumor Subset</span>
					</div>
					<div>
					<ReactSelect
						className={styles.Select}
						value={this.selectedTumorSubset}
						options={SAMPLE_SUBSET}
						placeholder="Select Tumor Subset"
						onChange={this.handleTumorSubsetChange}
						clearable={false} />
					</div>
				</div>

				<div className={styles.flexRow}>
					<div className={styles.SectionHeader}>
						<span>Log-Scale</span>
					</div>
					<div>
					<input
						type="checkbox"
						checked={this.logScale}
						onChange={this.logScaleChange}
					/>
					</div>
				</div>
				<div className={styles.flexRow}>
					<div className={styles.SectionHeader}>
						<span>Categorization</span>
					</div>
					<ButtonGroup>
						{
							this.categories.map((option, i) => {
								return <Radio 	checked={option.value === this.selectedCategory.value}
												onChange={(event)=>this.handleCategoryChange(option) }
												inline
												key={i}>{option.label}</Radio>
							})
						}
					</ButtonGroup>
				</div>
				{ (this.props.chartType === ChartType.BOX) &&
					<div>
						{
							this.collapsedStudies.length>0 && 
							this.selectedCategory.showCollapseContorl && 
							<div className={styles.flexRow}>
								<div className={styles.SectionHeader}>
									<span>Collpase</span>
								</div>
								<div>
								<ReactSelect  	className={styles.Select}
												value={this.selectedCollapsedStudy}
												options={this.collapsedStudies}
												placeholder="Select Study"
												onChange={this.handleCollapseStudyChange} />
								</div>
							</div>
						}
						{
							this.referenceBoxes.length>1 && 
							<div className={styles.flexRow}>
								<div className={styles.SectionHeader}>
									<span>Reference</span>
								</div>
								<div>
								<ReactSelect  	className={styles.Select}
												value={this.selectedReference}
												options={this.referenceBoxes}
												placeholder="Select Study"
												onChange={this.handleReferenceChange} />
								</div>
							</div>
						}
					</div>
					
				}{
					(this.props.chartType === ChartType.SCATTER) && 
					<div>
						<div className={styles.flexRow}>
							<div className={styles.SectionHeader}>
								<span>Correlation</span>
							</div>
							<ButtonGroup>
									{
									CORRELATION.map((option, i) => {
										return <Radio
											checked={option.value === this.selectedCorrelation.value}
											onChange={(event)=>this.handleCorrelationChange(option) }
											//onChange={(event) => this.selectedCorrelation = option }
											inline
											key={i}
										>{option.label}</Radio>
									})
								}
							</ButtonGroup>
						</div>
					</div>

				}
			</div>
		)
	}
	
	render()
	{
		  const columns = [{
			Header: this.normalization.label,
			accessor: 'name',
			filterMethod: (filter:any, row:any) =>
                    row[filter.id].toLowerCase().includes(filter.value.toLowerCase()),
			filterable: true
		  }, {
			Header: 'Correlation',
			accessor: 'correlation'
		  }, {
			Header: 'P-value',
			accessor: 'pValue'
		  }]
		let data = this.stageData_5
		let xTitle = this.selectedCategory.label

		if(this.props.chartType === ChartType.SCATTER){
			xTitle =`${this.geneX}, ${this.normalization.label}${this.logScale ? '(Log2)' : ''}`;
		}
		var layout = {
			//title: `${this.props.gene1} ${this.props.normalization.label}${this.logScale ? '(Log2)' : '' } vs ${this.selectedCategory.label}`,
			xaxis:{
				automargin :true,
				title: xTitle
			},
			yaxis: {
				title: `${this.geneY}, ${this.normalization.label}${this.logScale ? '(Log2)' : ''}`
			},
			autosize:true
		};

		if(data.length>0){
			return (
				<div>
					{ this.controls() }
					<Plot
					    className={styles.boxPlot}
						data={data}
						layout={layout}
						useResizeHandler={true} />
					{
						(this.props.chartType === ChartType.SCATTER) &&
						<ReactTable
							data={this.correlationTableData}
							columns={columns}
							defaultPageSize={5}
							minRows={0}
							className={styles.table}
							defaultSorted={[ { id: "name" } ]} />
					}
				</div>
			)
		}
		return (<div></div>)
	}

}
