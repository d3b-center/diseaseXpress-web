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

export interface IScatterPlotViewProps {
	routing: any;
	globalStores:GlobalStores;
}

@inject('routing')
@inject('globalStores')
@observer
export default class ScatterPlotView extends React.Component<IScatterPlotViewProps, {}> {

	store: QueryStore
	constructor(props:IScatterPlotViewProps) {
		super();

		const reaction1 = reaction(
			() => props.routing.location.query,
			query => {
				this.store = new QueryStore();
				this.store.chartType = ChartType.SCATTER;
				this.store.globalStores = props.globalStores;
			},
			{ fireImmediately:true }
	);
	}

  render() {
    return (
      <div className={styles.ContentWidth}>
	  	<div className={styles.ColumnOne}>
	  		<QueryParams store={this.store}/>
		</div>

        <div className={styles.ColumnTwo}>
			{
				this.store.geneData.isComplete && 
				!_.isEmpty(this.store.geneData.result) &&
				<ResultPlot
				    queryParams={this.store.parameters}
						chartType ={this.store.chartType}
						data={this.store.geneData.result} /> 
			}
        </div>
      </div>

    )
  }
}

