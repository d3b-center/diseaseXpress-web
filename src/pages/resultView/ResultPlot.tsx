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
const Plot = require('react-plotly.js');

export interface IBoxContentProps {
	queryParams: {
		geneSymbols: string[],
		studies: string[],
		normalizations: Normalization[]
	}
	chartType:string;
	data: {
        [sampleId: string]: {
            [id: string]: any;
        };
    };
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


	@observable gene1:string;
	@observable gene2:string;
	@observable studies:string[];
	@observable normalization:Normalization;
	

	constructor(props: IBoxContentProps) {
		super();
		let genes = props.queryParams.geneSymbols;
		if(genes.length==2){
			this.gene1 = genes[0]
			this.gene2 = genes[1]
		} else{
			this.gene1 = genes[0]
		}
		this.studies = props.queryParams.studies;
		this.normalization = props.queryParams.normalizations[0]

		this.handleTumorSubsetChange = this.handleTumorSubsetChange.bind(this)
		this.logScaleChange = this.logScaleChange.bind(this)
		this.handleCollapseStudyChange = this.handleCollapseStudyChange.bind(this)
		this.handlePivotChange = this.handlePivotChange.bind(this)
		this.handleReferenceChange = this.handleReferenceChange.bind(this)
	}

	@observable private logScale: boolean = false;	
	@observable selectedCategory = CATEGORIES[0];
	@observable selectedCollapsedStudy: string|null
	@observable selectedTumorSubset = SAMPLE_SUBSET[0].value
	@observable selectedReference: string|null

	@observable selectedCorrelation = CORRELATION[0];


	handleTumorSubsetChange(selectedOption: SelectOption) {
		this.selectedTumorSubset = selectedOption.value;
	}

	logScaleChange(evt: any) {
		this.logScale = !this.logScale;
	}

	public handlePivotChange(selection: any){
		this.selectedCategory = selection
	}

	handleCollapseStudyChange(selectedOption: SelectOption) {
		if(selectedOption)
			this.selectedCollapsedStudy = selectedOption.value;
		else
			this.selectedCollapsedStudy = null
	}

	handleReferenceChange(selectedOption: SelectOption) {
		if(selectedOption)
			this.selectedReference = selectedOption.value;
		else
			this.selectedReference = null
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
			toReturn.y = this.logScale ? Math.log2(obj[this.gene1] + 1) : obj[this.gene1];
			if(this.props.chartType===ChartType.SCATTER){
				toReturn.x = this.logScale ? Math.log2(obj[this.gene2] + 1) : obj[this.gene2];
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
			let name = this.selectedCategory.showCollapseContorl && this.props.chartType===ChartType.BOX ? studyId : category
			let showlegend = legends[name]?false:true;

			if(showlegend){
				legends[name]=COLORS[count]
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
				name: name,
				category:category,
				marker:{
					color: legends[name]
				},
				legendgroup: studyId, 
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
												onChange={(event) => this.selectedCategory = option }
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
											onChange={(event) => this.selectedCorrelation = option }
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
		let data = this.stageData_5
		let xTitle = this.selectedCategory.label

		if(this.props.chartType === ChartType.SCATTER){
			xTitle =`${this.gene2}, ${this.normalization.label}${this.logScale ? '(Log2)' : ''}`;
		}
		var layout = {
			//title: `${this.props.gene1} ${this.props.normalization.label}${this.logScale ? '(Log2)' : '' } vs ${this.selectedCategory.label}`,
			xaxis:{
				automargin :true,
				title: xTitle
			},
			yaxis: {
				title: `${this.gene1}, ${this.normalization.label}${this.logScale ? '(Log2)' : ''}`
			},
			autosize:true
		};

		if(data.length>0){
			return (
				<div>
					{ this.controls() }
					<Plot className={styles.boxPlot}
								data={data}
								layout={layout}
								useResizeHandler={true} />
					</div>
			)
		}
		return (<div></div>)
	}

}
