import React, { Component } from 'react';
import { DashboardPageStore } from './DashboardPageStore';
import { VictoryPie, VictoryContainer, VictoryTooltip, VictoryLabel } from 'victory';
import { observer, inject } from "mobx-react";
import { computed, observable } from 'mobx';
import { TumorPlot } from './TumorPlot';
import ReactGA from 'react-ga';
import ReactFC from 'react-fusioncharts';
import FusionCharts from 'fusioncharts';
import Charts from 'fusioncharts/fusioncharts.charts';
import Powercharts from 'fusioncharts/fusioncharts.powercharts';
import {Sunburst} from 'react-vis';
Powercharts(FusionCharts);

import styles from './styles.module.scss';
import { GlobalStores } from 'shared/components/global/GlobalStores';

interface IDashboardPageProps {
	globalStores:GlobalStores;
}

@inject('globalStores')
@observer
export default class DashboardPage extends React.Component<IDashboardPageProps, {}> {


  store:DashboardPageStore
  constructor(props:IDashboardPageProps) {
    super(props);
    this.store = new DashboardPageStore();
    (window as any).document.title = "DiseaseXpress::Home"
    ReactGA.pageview(window.location.hash)
  }


  render() {
    const chartConfigs = {
      type: 'multilevelpie',
        width: '450',
        height: '450',
        dataFormat: 'json',
        dataSource: {
            "chart": {
                "bgColor": "#ffffff",
                "showBorder": "0",
                "showPercentValues": "1",
                "piefillalpha": "80",
          "pieborderthickness": "2",
          "piebordercolor": "#FFFFFF",
          "hoverfillcolor": "#CCCCCC",
          "plottooltext": "$label, $$valueK, $percentValue",
            },
            "category": [{
              "label": "Products",
              "color": "#ffffff",
              "value": "150",
              "category": [{
                "label": "Food & {br}Beverages",
                "color": "#f8bd19",
                "value": "55.5",
                "tooltext": "Food & Beverages, $$valueK, $percentValue",
                "category": [{
                  "label": "Breads",
                  "color": "#f8bd19",
                  "value": "11.1"
                }, {
                  "label": "Juice",
                  "color": "#f8bd19",
                  "value": "27.75"
                }, {
                  "label": "Noodles",
                  "color": "#f8bd19",
                  "value": "9.99"
                }, {
                  "label": "Seafood",
                  "color": "#f8bd19",
                  "value": "6.66"
                }]
              }, {
                "label": "Apparel &{br}Accessories",
                "color": "#33ccff",
                "value": "42",
                "tooltext": "Apparel & Accessories, $$valueK, $percentValue",
                "category": [{
                  "label": "Sun Glasses",
                  "color": "#33ccff",
                  "value": "10.08"
                }, {
                  "label": "Clothing",
                  "color": "#33ccff",
                  "value": "18.9"
                }, {
                  "label": "Handbags",
                  "color": "#33ccff",
                  "value": "6.3"
                }, {
                  "label": "Shoes",
                  "color": "#33ccff",
                  "value": "6.72"
                }]
              }, {
                "label": "Baby {br}Products",
                "color": "#ffcccc",
                "value": "22.5",
                "tooltext": "Baby Products, $$valueK, $percentValue",
                "category": [{
                  "label": "Bath &{br}Grooming",
                  "color": "#ffcccc",
                  "value": "9.45",
                  "tooltext": "Bath & Grooming, $$valueK, $percentValue"
                }, {
                  "label": "Food",
                  "color": "#ffcccc",
                  "value": "6.3"
                }, {
                  "label": "Diapers",
                  "color": "#ffcccc",
                  "value": "6.75"
                }]
              }, {
                "label": "Electronics",
                "color": "#ccff66",
                "value": "30",
                "category": [{
                  "label": "Laptops",
                  "color": "#ccff66",
                  "value": "8.1"
                }, {
                  "label": "Televisions",
                  "color": "#ccff66",
                  "value": "10.5"
                }, {
      
                  "label": "SmartPhones",
                  "color": "#ccff66",
                  "value": "11.4"
                }]
              }]
            }]
        }
      }
    
    let chartConfigs1 = {
      type: 'multilevelpie',
      width: '800',
      height: '800',
      dataFormat: 'json',
      dataSource: {
        "chart": {
          "bgColor": "#ecf0f5 ",
          bgAlpha:100,
          canvasBgColor:"#ecf0f5 ",
          "showBorder": "0",
          "showPercentValues": "1",
          "piefillalpha": "60",
          "pieborderthickness": "2",
          "piebordercolor": "#FFFFFF",
          plotFillHoverAlpha:100,
          plotHoverEffect:1,
         // "hoverfillcolor": "#CCCCCC",
          "plottooltext": "$label, $valueK, $percentValue",
        },
        "category": this.store.pieData
      }
    }
      return (
      <div className={styles.ContentWidth}>
        <div className={styles.ColumnOne}>
          <p>Application to house RNA-Sequencing data from datasources 
            like Genotype-Tissue Expression (GTEx), 
            Therapeutically Applicable Research To Generate Effective Treatments (TARGET), 
            The Cancer Genome Atlas (TCGA) that has been processed and transformed through the 
            same pipeline. For each sample, gene and transcript level quantifications as well as sample 
            and clinical annotation is available.</p>
          {/* <VictoryPie 
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
            /> */}

            {/* <div className={styles.donut}>
              <ReactFC {...chartConfigs1} fcLibrary={FusionCharts}/>
            </div> */}

        </div>
        <div className={styles.ColumnTwo}>
        <div className={styles.donut}>
              <ReactFC {...chartConfigs1} fcLibrary={FusionCharts}/>
            </div>
          {/* <div>
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
          </div> */}
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
