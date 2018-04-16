import React from "react";
import { VictoryChart, VictoryBar, VictoryTooltip, VictoryLabel, VictoryLegend, VictoryVoronoiContainer, VictoryAxis, VictoryTheme } from 'victory';
import { observer } from "mobx-react";
import { DashBoardBarData } from "./DashboardPageStore";
import * as _ from 'lodash';
import { computed } from "mobx";

type ITumorPlotProps = {
  data:DashBoardBarData[];
  xAxisLabel:string;
  yAxisLabel:string;
  showLegend:boolean

}

@observer
export class TumorPlot extends React.Component<ITumorPlotProps, {}> {

  constructor(props: ITumorPlotProps) {
    super(props);
  }

  @computed
  private get legends() {
    let result: {[id:string]:{}} = this.props.data.reduce((obj: {[id:string]:{}},next)=>{
      if(next.studyId && !obj[next.studyId]){
        obj[next.studyId] = { name: next.studyId, symbol: { fill: next.fill } }
      }
      return obj
    },{})
    return Object.keys(result).map(key => result[key]);
  }

  render() {
    return (
      <div>
          <VictoryChart
              domainPadding      = {25}
              height             = {420}
              width              = {1100}
              padding            = {{ top: 20, bottom: 120, left: 60, right:120 }}
              containerComponent = {<VictoryVoronoiContainer responsive={false}/>} >

              {/* x-axis */}
              <VictoryAxis
                  style     = {{ticks      : { size: 3, stroke: "black" },
                                tickLabels : { height:10, width:10,  fontSize: 8, fill: "black", angle:-45,  overflow: "hidden", textLength:10, lengthAdjust:"spacingAndGlyphs"},
                                axisLabel  : { padding: 45, fill: "black" },
                                grid       : { opacity: 0 },
                                axis       : { stroke: "black", strokeWidth: 1} }}
                  crossAxis = {false}
                  label     = {this.props.xAxisLabel}
                  tickLabelComponent={<CustomTooltip/>}
                  />
              
              {/* y-axis */}
              <VictoryAxis 
                  label         = {this.props.yAxisLabel}
                  dependentAxis = {true}
                  style         = {{ticks      : { size: 3, stroke: "black" },
                                    tickLabels : { fontSize: 8, fill: "black" },
                                    axisLabel  : { padding: 35, fill: "black" },
                                    grid       : { opacity: 0 },
                                    axis       : { stroke: "black", strokeWidth: 1} }}
                  crossAxis     = {false} />
                  
              <VictoryBar
                  width          = {900}
                  height         = {320}
                  data           = {this.props.data}
                  theme          = {VictoryTheme.grayscale}
                  labels         = {(d:DashBoardBarData) => `(${d.x}, ${d.y})${d.studyId||''}`}
                  labelComponent = {<VictoryTooltip/>} />
                  
              {this.props.showLegend && 
               this.legends.length>0 && 
                  <VictoryLegend
                      x           = {1000}
                      y           = {40}
                      orientation = "vertical"
                      data        = {this.legends} />}
          </VictoryChart>
      </div>
    );
  }
}


class CustomTooltip extends React.Component {
  static defaultEvents = VictoryTooltip.defaultEvents
  render() {
    const d:any = this.props;
    let labelText:string = d.text
    labelText = labelText.length > 12 ? labelText.substring(0,12)+'...' : labelText
    return (
      <g>
        <VictoryLabel
            {...this.props} 
            text={labelText}
            renderInPortal={false}/>
      </g>
    );
  }
}