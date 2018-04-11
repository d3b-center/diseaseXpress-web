import React, { Component } from 'react';
import { DashboardPageStore } from './DashboardPageStore';
import { VictoryPie, VictoryContainer, VictoryTooltip, VictoryLabel } from 'victory';
import { observer } from "mobx-react";
import { computed, observable } from 'mobx';
import { TumorPlot } from './TumorPlot';
import ReactGA from 'react-ga';

import styles from './styles.module.scss';

interface IDashboardPageProps {
}

@observer
export default class DashboardPage extends React.Component<IDashboardPageProps, {}> {


  store:DashboardPageStore
  constructor() {
    super();
    this.store = new DashboardPageStore();
    (window as any).document.title = "DiseaseXpress::Home"
    ReactGA.pageview(window.location.hash)
  }


  render() {
    return (
      <div className={styles.ContentWidth}>
        <div className={styles.ColumnOne}>
          <p>Application to house RNA-Sequencing data from datasources 
            like Genotype-Tissue Expression (GTEx), 
            Therapeutically Applicable Research To Generate Effective Treatments (TARGET), 
            The Cancer Genome Atlas (TCGA) that has been processed and transformed through the 
            same pipeline. For each sample, gene and transcript level quantifications as well as sample 
            and clinical annotation is available.</p>
          <VictoryPie 
              containerComponent={<VictoryContainer responsive={false}  height={300} />}
              height={270}
              width={270}
              padding={{ top: 40, bottom: 80, left: 40, right: 40 }}
              data ={this.store.getStudyData}
              sortKey="x"
              startAngle={90}
              endAngle={450}
              colorScale="blue"
              labelComponent={<CustomTooltip/>}
              style={{
                labels: {
                  fontSize: 12
                }
              }}
            />

        </div>
        <div className={styles.ColumnTwo}>
          <div>
            <div className={styles.ChartHeader}>
              <span>Tumors</span>
            </div>
            <div>
              <TumorPlot 
                data={this.store.tumorData}
                yAxisLabel="Number of Samples"
                xAxisLabel="Disease"
                showLegend={true}/>
            </div>
          </div>
          <div>
            <div className={styles.ChartHeader}>
              <span>Normals</span>
            </div>
            <div>
              <TumorPlot 
                data={this.store.normalsData}
                yAxisLabel="Number of Samples"
                xAxisLabel="Tissue"
                showLegend={false}/>
            </div>
          </div>
        </div>
      </div>
      
    )
  }
}

class CustomTooltip extends React.Component {
  static defaultEvents = VictoryTooltip.defaultEvents
  render() {
    return (
      <g>
        <VictoryTooltip {...this.props}
                        pointerLength={0}
                        x={150}
                        y={220}
                        orientation ={"bottom"}
                        text={(d:any) => `Study : ${d.x}\nSamples : ${d.y} (${d.percentage}%)`}
                        renderInPortal={false}/>

        <VictoryLabel {...this.props} 
                      renderInPortal={false}/>
      </g>
    );
  }
}
