import { remoteData } from "api/remoteData";
import client from "api/diseasexpressClientInstance";
import { computed, observable, action } from "mobx";
import * as _ from 'lodash';
import { COLORS } from "shared/components/global/GlobalStores";

export type TumorData = {
    studyId?: string;
    disease?: string;
    x: string;
    y: number;
    fill?:string;
}
export type  category = {
    label: string;
    color: string;
    count: number;
    name: string;
    children?: category[];
    labelStyle?:any;
}

export type DashBoardBarData = TumorData

export class DashboardPageStore {

    readonly samples = remoteData<{ [id: string]: string }[]>(client.getAllSamples({}), []);

    @computed get studyMap() {
        return this.samples.result;
    }

    @computed get categoryData(): category{
        let data = this.samples.result
        let totalSamplesCount = data.length
        let i = -1

        let studies = _.groupBy(data,obj=>obj['study_id'])

        let children = Object.keys(studies).map(studyId => {
            i = i+1
            let samples = studies[studyId];
            let studySamplesCount = samples.length
            let subsets = _.groupBy(samples, sample => sample['disease']||sample['tissue'])
            let color = COLORS[i]
            let children:category[] = [] as any
            if((studySamplesCount/totalSamplesCount)*100>1){
                children = Object.keys(subsets).map(subsetType => {
                    let subsetSize = subsets[subsetType].length
                    let label = subsetType.length>9? subsetType.substring(0,8)+'...':subsetType
                    return {
                        label: (subsetSize/totalSamplesCount)*100>1 ? label : '',
                        color: color,
                        value: subsets[subsetType].length,
                        count:subsets[subsetType].length,
                        name: subsetType,
                        labelStyle: {
                            fontSize: 12
                        }
                    };
                });
            }
            
            return {
                label: studyId,
                color: color,
                count: samples.length,
                children:children,
                name: studyId,
                labelStyle: {
                    fontSize: 14,
                    fontWeight: 'bold'
                }
            };

        });

        return {
            label: "Total Samples",
            color: "#ffffff",
            count: data.length,
            children:children,
            name: "Total Samples"
        }
    }
}