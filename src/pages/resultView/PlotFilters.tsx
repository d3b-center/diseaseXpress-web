import React, { Component } from 'react';
import { observer } from "mobx-react";

export interface IPlotFiltersProps{
    chartType:string;
}

@observer
export default class PlotFilters extends React.Component<IPlotFiltersProps, {}> {
    constructor(props:IPlotFiltersProps) {
        super();
    }
    render() {
        return (<div></div>)
    }
}
