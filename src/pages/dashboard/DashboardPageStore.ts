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

export type DashBoardBarData = TumorData

export class DashboardPageStore {

    readonly samples = remoteData<{ [id: string]: string }[]>(client.getAllSamples({}), []);

    @computed get studyMap() {
        return this.samples.result;
    }

    @computed get tumorData() {
        let data = this.samples.result

        let tumorSamples = data.filter(obj => !!obj['disease'])

        let studyGroups: { [studyId: string]: { [id: string]: string }[] } = _.groupBy(tumorSamples, sample => sample['study_id'])
        let result:TumorData[] = [];
        Object.keys(studyGroups).map((studyId,key) => {
            let studySamples = studyGroups[studyId];
            let temp: { [studyId: string]: { [id: string]: string }[] } = _.groupBy(studySamples, sample => sample['disease']);
            
            for (const disease in temp) {
                let tumorData:TumorData = {
                    x: disease,
                    disease:disease,
                    studyId: studyId,
                    y: temp[disease].length,
                    fill: COLORS[key]
                }
                result.push(tumorData)
            }
        });

        return _.sortBy(result, obj=>obj.y);
    }

    @computed get normalsData() {
        let data = this.samples.result

        let normalSamples = data.filter(obj => _.isUndefined(obj['disease']))

        let tissueGroups: { [tissue: string]: { [id: string]: string }[] } = _.groupBy(normalSamples, sample => sample['tissue'])
        let result:TumorData[] = [];
        let index=0;
        Object.keys(tissueGroups).map(tissue => {
            let tissueSamples = tissueGroups[tissue];
            let tumorData:TumorData = {
                x: tissue,
                y: tissueSamples.length,
            }
            result.push(tumorData)
            index++;
        });

        return _.sortBy(result, obj=>obj.y);
    }

    @computed get getStudies() {
        let result: {[id:string]:number} = 
        this
          .studyMap
          .reduce((obj:{[id:string]:number},next)=>{
            if(obj[next['study_id']]){
              obj[next['study_id']] = obj[next['study_id']] +1
            } else{
              obj[next['study_id']] = 1
            }
            return obj;
          },{});
        return result;
      }
    
      @computed get getStudyData(): { x: string; y: number; }[] {
        let data = this.getStudies;
        let totalSampleCount = Object.keys(data).reduce((sum, id) => sum + data[id], 0)/100;
        return Object.keys(data).map(x=>{return {x:x,y:data[x],percentage:(data[x]/totalSampleCount).toFixed(3)}});
      }

}