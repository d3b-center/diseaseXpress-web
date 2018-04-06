import { remoteData } from "api/remoteData";
import client from "api/diseasexpressClientInstance";
import { computed } from "mobx";

export const COLORS = ['#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf ']

export class GlobalStores {

	@computed get samplesSet(): { [s: string]: { [id: string]: any } } {
		let data = this.samples.result
		return data.reduce((map: { [s: string]: { [id: string]: any } }, next: { [id: string]: any }) => {
			map[next['sample_id']] = next;
			return map;
		}, {});
	}

	readonly studies = remoteData(client.getStudies({}), []);

	readonly samples = remoteData<{ [id: string]: string }[]>(client.getAllSamples({}), []);

	readonly geneSymbols = remoteData(client.getGenesBySymbol({}), []);

	@computed get genes() {
		return this.geneSymbols.result.sort()
	}

}