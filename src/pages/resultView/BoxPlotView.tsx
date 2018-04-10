import React from 'react';
import { QueryStore, ChartType } from './QueryStore';
import { observer, inject } from "mobx-react";
import { reaction } from 'mobx';
import 'react-select/dist/react-select.css';
import styles from './styles.module.scss';
import * as _ from 'lodash';
import { GlobalStores } from 'shared/components/global/GlobalStores';
import { ResultPlot } from './ResultPlot';
import { QueryParams } from './QueryParams';
import {ThreeBounce} from 'better-react-spinkit';

export interface IResultsPageProps {
	routing: any;
	globalStores:GlobalStores;
}

@inject('routing')
@inject('globalStores')
@observer
export default class BoxPlotView extends React.Component<IResultsPageProps, {}> {

	store: QueryStore
	routing : any
	selections:{
		tumorSubset?:string,
		logScale?:boolean,
		category?:string,
		reference?:string,
		collapsedStudy?:string
	} = {}
	constructor(props:IResultsPageProps) {
		super();
		this.store = new QueryStore();
		this.store.chartType = ChartType.BOX;
		this.store.globalStores = props.globalStores;
		this.routing = props.routing
		this.handleParamsChange = this.handleParamsChange.bind(this)

		if(props.routing.location.query){
			let query = props.routing.location.query;
			if ('geneY' in query) {
				this.store.parameters.geneY = query.geneY;
			}
			if ('studies' in query) {
				this.store.parameters.studies = (query.studies as string).split(',');
			}
			if ('normalization' in query) {
				this.store.parameters.studies = (query.studies as string).split(',');
			}
			if ('tumorSubset' in query) {
				this.selections.tumorSubset = query.tumorSubset;
			}
			if ('logScale' in query) {
				this.selections.logScale = query.logScale;
			}
			if ('category' in query) {
				this.selections.category = query.category;
			}
			if ('reference' in query) {
				this.selections.reference = query.reference;
			}
			if ('collapsedStudy' in query) {
				this.selections.collapsedStudy = query.collapsedStudy;
			}
		}
	}

	private handleParamsChange(params:any) {
		this.props.routing.updateRoute(params);
		this.selections = {}
	}

  render() {
    return (
      <div className={styles.ContentWidth}>
			<div className={styles.ColumnOne}>
				{
					this.store.globalStores.geneSymbols.isComplete &&
					this.store.globalStores.studies.isComplete &&
					<QueryParams store={this.store} handleParamsChange={this.handleParamsChange}/>
				}
			</div>

			<div className={styles.ColumnTwo}>
				{
					this.store.geneData.isComplete && 
					!_.isEmpty(this.store.geneData.result) &&
					<ResultPlot
							queryParams={this.store.parameters}
							chartType ={this.store.chartType}
							data={this.store.geneData.result}
							handleParamsChange={this.handleParamsChange}
							selections={this.selections}/> 
				}
				{
					(this.store.geneData.isPending) &&
					(<ThreeBounce className="center-block text-center" />)
				}
			</div>
      </div>
    )
  }
}

