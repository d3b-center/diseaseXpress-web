import React, { Component } from 'react';
import { DashboardPageStore } from './DashboardPageStore';
import { observer, inject } from "mobx-react";
import { computed, observable, action } from 'mobx';
import ReactGA from 'react-ga';
import { Sunburst, LabelSeries, Hint } from 'react-vis';
import * as _ from 'lodash';
import '../../../node_modules/react-vis/dist/main.scss'

import styles from './styles.module.scss';
import { GlobalStores } from 'shared/components/global/GlobalStores';

interface IDashboardPageProps {
  globalStores: GlobalStores;
}

@inject('globalStores')
@observer
export default class DashboardPage extends React.Component<IDashboardPageProps, {}> {


  store: DashboardPageStore
  constructor(props: IDashboardPageProps) {
    super(props);
    this.store = new DashboardPageStore();
    (window as any).document.title = "DiseaseXpress::Home";
    ReactGA.pageview(window.location.hash);
    this.onValueMouseOver = this.onValueMouseOver.bind(this);
    this.onValueMouseOut = this.onValueMouseOut.bind(this);
  }

  @observable path: string[] = [];
  @observable hoveredCell: any | undefined = undefined;

  private getKeyPath(node: any): any {
    if (!node.parent) {
      return ['Total Samples'];
    }
    return [node.data && node.data.name || node.name].concat(this.getKeyPath(node.parent));
  }

  private updateData(data: any, keyPath: { [id: string]: boolean }): any {
    if (data.children) {
      data.children.map((child: any) => this.updateData(child, keyPath));
    }
    // add a fill to all the uncolored cells
    if (!data.color) {
      data.style = {
        fill: '#ecf0f5'
      };
    }
    data.style = {
      ...data.style,
      fillOpacity: !_.isEmpty(keyPath) && !keyPath[data.name] ? 0.2 : 1
    };

    return data;
  }

  @computed get pathValue() {
    return this.path.join(' > ');
  }

  @computed get pathAsMap(): { [id: string]: boolean } {
    return this.path.reduce((res: { [id: string]: boolean }, row: any) => {
      res[row] = true;
      return res;
    }, {});
  }

  @computed get chartData() {
    return this.updateData(this.store.categoryData, this.pathAsMap);
  }

  @computed get centerLabels() {
    let toReturn = [{ x: 0, y: -20, label: this.store.categoryData.label, style: { fontSize: '1.3em', textAnchor: 'middle', userSelect: 'none' } },
    { x: 0, y: 40, label: this.store.categoryData.count, style: { fontSize: '2.5em', textAnchor: 'middle', userSelect: 'none' } }];

    if (this.hoveredCell) {
      let percentageLabel = `${((this.hoveredCell.count / this.store.categoryData.count) * 100).toFixed(2)}% of ${this.store.categoryData.count}`
      toReturn = [{ x: 0, y: -45, label: this.hoveredCell.name, style: { fontSize: '1.3em', textAnchor: 'middle', userSelect: 'none' } },
      { x: 0, y: -25, label: percentageLabel, style: { fontSize: '1.3em', textAnchor: 'middle', userSelect: 'none' } },
      { x: 0, y: 40, label: this.hoveredCell.count, style: { fontSize: '2.5em', textAnchor: 'middle', userSelect: 'none' } }];
    }
    return toReturn;
  }

  @action
  private onValueMouseOver(node: any) {
    this.path = this.getKeyPath(node).reverse();
    this.hoveredCell = node;
  }
  @action
  private onValueMouseOut() {
    this.path = [];
    this.hoveredCell = undefined;
  }

  @computed get hoveredValuePosition() {
    const { radius, radius0, angle, angle0 } = this.hoveredCell;
    const truedAngle = (angle + angle0) / 2;
    return {
      x: radius * Math.sin(truedAngle),
      y: radius0 * Math.cos(truedAngle)
    };
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
        </div>
        <div className={styles.ColumnTwo}>
          {/* <div style={{height:'50px'}}>{this.pathValue}</div> */}
          { this.chartData &&
            this.chartData.children.length>0 &&
            <Sunburst
              animation
              hideRootNode
              data={this.chartData}
              style={{ stroke: '#fff', 'stroke-width': 1.5 }}
              height={700}
              getLabel={(d: any) => d.label}
              getSize={(d: any) => d.value}
              getColor={(d: any) => d.color}
              width={700}
              onValueMouseOver={(node: any) => {
                this.onValueMouseOver(node)
              }}
              onValueMouseOut={() => this.onValueMouseOut()
              } >

              {
                <LabelSeries data={this.centerLabels} />
              }
              {this.hoveredCell &&
                <Hint value={this.hoveredValuePosition}>
                  <div className={styles.tipStyle}>
                    {this.hoveredCell.name}
                  </div>
                </Hint>
              }
            </Sunburst>
          }
        </div>
      </div>
    )
  }
}
