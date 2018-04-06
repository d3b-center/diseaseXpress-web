import * as request from "superagent";

type CallbackHandler = (err: any, res ? : request.Response) => void;
export type TranscriptInfo = {
    'transcript_id': string

    'start': number

    'end': number

    'biotype': string

    'entrez_ids' ? : Array < string >

        'refseq_mrna_ids' ? : Array < string >

        'refseq_protein_ids' ? : Array < string >

};
export type GeneInfo = {
    'gene_id': string

    'gene_symbol': string

    'start': number

    'end': number

    'biotype': string

    'chr': string

    'strand': string

    'transcripts': Array < TranscriptInfo >

};
export type TranscriptWithGeneInfo = {
    'transcript_id': string

    'start': number

    'end': number

    'biotype': string

    'entrez_ids' ? : Array < string >

        'refseq_mrna_ids' ? : Array < string >

        'refseq_protein_ids' ? : Array < string >

        'gene_id': string

    'gene_symbol': string

};
export type RsemIsoform = {
    'transcript_id': string

    'sample_id': string

    'length' ? : number

    'effective_length' ? : number

    'expected_count' ? : number

    'tpm' ? : number

    'fpkm' ? : number

    'isoform_percentage' ? : number

};
export type Abundance = {
    'transcript_id': string

    'sample_id': string

    'length' ? : number

    'effective_length' ? : number

    'expected_count' ? : number

    'tpm' ? : number

};
export type TranscriptData = {
    'transcript_id': string

    'sample_abundance' ? : Abundance

    'sample_rsem_isoform' ? : RsemIsoform

};
export type RsemGene = {
    'gene_id': string

    'sample_id': string

    'length' ? : number

    'effective_length' ? : number

    'expected_count' ? : number

    'tpm' ? : number

    'fpkm' ? : number

};
export type SampleData = {
    'sample_id': string

    'rsem' ? : RsemGene

    'transcripts' ? : Array < TranscriptData >

};
export type GeneData = {
    'gene_id': string

    'gene_symbol': string

    'data': Array < SampleData >

};

type Logger = {
    log: (line: string) => any
};

/**
 * DiseaseXpress
 * @class deAPI
 * @param {(string)} [domainOrOptions] - The project domain.
 */
export default class deAPI {

    private domain: string = "";
    private errorHandlers: CallbackHandler[] = [];

    constructor(domain ? : string, private logger ? : Logger) {
        if (domain) {
            this.domain = domain;
        }
    }

    getDomain() {
        return this.domain;
    }

    addErrorHandler(handler: CallbackHandler) {
        this.errorHandlers.push(handler);
    }
    private request(method: string, url: string, body: any, headers: any, queryParameters: any, form: any, reject: CallbackHandler, resolve: CallbackHandler) {
        let req = (new(request as any).Request(method, url) as request.Request)
            .query(queryParameters);
        Object.keys(headers).forEach(key => {
            req.set(key, headers[key]);
        });

        if (body) {
            req.send(body);
        }

        if (typeof(body) === 'object' && !(body.constructor.name === 'Buffer')) {
            req.set('Content-Type', 'application/json');
        }

        if (Object.keys(form).length > 0) {
            req.type('form');
            req.send(form);
        }

        req.end((error, response) => {
            if (error || !response.ok) {
                reject(error);
                this.errorHandlers.forEach(handler => handler(error));
            } else {
                resolve(response);
            }
        });
    }

    getGeneIdsURL(parameters: {
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/api/genes/ids';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                queryParameters[parameterName] = parameters.$queryParameters[parameterName];
            });
        }

        let keys = Object.keys(queryParameters);
        return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    }

    /**
     * Returns List of Gene Ids
     * @method
     * @name deAPI#getGeneIds
     */
    getGeneIds(parameters: {
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < string >
        >
        {
            const domain = parameters.$domain ? parameters.$domain : this.domain;
            let path = '/api/genes/ids';
            let body: any;
            let queryParameters: any = {};
            let headers: any = {};
            let form: any = {};
            return new Promise((resolve, reject) => {
                headers['Accept'] = 'application/json';

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                        queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                    });
                }

                this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve);
            }).then(function(response: request.Response) {
                return response.body;
            });
        };

    getGeneInfoByIdsURL(parameters: {
        'geneIds': string,
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/api/genes/ids/{gene_ids}';

        path = path.replace('{gene_ids}', parameters['geneIds'] + '');

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                queryParameters[parameterName] = parameters.$queryParameters[parameterName];
            });
        }

        let keys = Object.keys(queryParameters);
        return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    }

    /**
     * Returns Gene information
     * @method
     * @name deAPI#getGeneInfoByIds
     * @param {string} geneIds - DiseaseXpress
     */
    getGeneInfoByIds(parameters: {
            'geneIds': string,
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < GeneInfo >
        >
        {
            const domain = parameters.$domain ? parameters.$domain : this.domain;
            let path = '/api/genes/ids/{gene_ids}';
            let body: any;
            let queryParameters: any = {};
            let headers: any = {};
            let form: any = {};
            return new Promise((resolve, reject) => {
                headers['Accept'] = 'application/json, text/tab-separated-values';

                path = path.replace('{gene_ids}', parameters['geneIds'] + '');

                if (parameters['geneIds'] === undefined) {
                    reject(new Error('Missing required  parameter: geneIds'));
                    return;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                        queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                    });
                }

                this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve);
            }).then(function(response: request.Response) {
                return response.body;
            });
        };

    getGenesBySymbolURL(parameters: {
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/api/genes/symbols';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                queryParameters[parameterName] = parameters.$queryParameters[parameterName];
            });
        }

        let keys = Object.keys(queryParameters);
        return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    }

    /**
     * Returns List of Gene Symbols
     * @method
     * @name deAPI#getGenesBySymbol
     */
    getGenesBySymbol(parameters: {
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < string >
        >
        {
            const domain = parameters.$domain ? parameters.$domain : this.domain;
            let path = '/api/genes/symbols';
            let body: any;
            let queryParameters: any = {};
            let headers: any = {};
            let form: any = {};
            return new Promise((resolve, reject) => {
                headers['Accept'] = 'application/json';

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                        queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                    });
                }

                this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve);
            }).then(function(response: request.Response) {
                return response.body;
            });
        };

    getGeneInfoBySymbolsURL(parameters: {
        'geneSymbols': string,
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/api/genes/symbols/{gene_symbols}';

        path = path.replace('{gene_symbols}', parameters['geneSymbols'] + '');

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                queryParameters[parameterName] = parameters.$queryParameters[parameterName];
            });
        }

        let keys = Object.keys(queryParameters);
        return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    }

    /**
     * Returns Gene information
     * @method
     * @name deAPI#getGeneInfoBySymbols
     * @param {string} geneSymbols - DiseaseXpress
     */
    getGeneInfoBySymbols(parameters: {
            'geneSymbols': string,
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < GeneInfo >
        >
        {
            const domain = parameters.$domain ? parameters.$domain : this.domain;
            let path = '/api/genes/symbols/{gene_symbols}';
            let body: any;
            let queryParameters: any = {};
            let headers: any = {};
            let form: any = {};
            return new Promise((resolve, reject) => {
                headers['Accept'] = 'application/json, text/tab-separated-values';

                path = path.replace('{gene_symbols}', parameters['geneSymbols'] + '');

                if (parameters['geneSymbols'] === undefined) {
                    reject(new Error('Missing required  parameter: geneSymbols'));
                    return;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                        queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                    });
                }

                this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve);
            }).then(function(response: request.Response) {
                return response.body;
            });
        };

    getStudiesURL(parameters: {
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/api/studies';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                queryParameters[parameterName] = parameters.$queryParameters[parameterName];
            });
        }

        let keys = Object.keys(queryParameters);
        return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    }

    /**
     * Returns List of Studies
     * @method
     * @name deAPI#getStudies
     */
    getStudies(parameters: {
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < string >
        >
        {
            const domain = parameters.$domain ? parameters.$domain : this.domain;
            let path = '/api/studies';
            let body: any;
            let queryParameters: any = {};
            let headers: any = {};
            let form: any = {};
            return new Promise((resolve, reject) => {
                headers['Accept'] = 'application/json';

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                        queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                    });
                }

                this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve);
            }).then(function(response: request.Response) {
                return response.body;
            });
        };

    getAllSamplesURL(parameters: {
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/api/samples';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                queryParameters[parameterName] = parameters.$queryParameters[parameterName];
            });
        }

        let keys = Object.keys(queryParameters);
        return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    }

    /**
     * Returns List of Sample Data
     * @method
     * @name deAPI#getAllSamples
     */
    getAllSamples(parameters: {
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < {} >
        >
        {
            const domain = parameters.$domain ? parameters.$domain : this.domain;
            let path = '/api/samples';
            let body: any;
            let queryParameters: any = {};
            let headers: any = {};
            let form: any = {};
            return new Promise((resolve, reject) => {
                headers['Accept'] = 'application/json, text/tab-separated-values';

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                        queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                    });
                }

                this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve);
            }).then(function(response: request.Response) {
                return response.body;
            });
        };

    getSamplesURL(parameters: {
        'studyIds': string,
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/api/samples/{study_ids}';

        path = path.replace('{study_ids}', parameters['studyIds'] + '');

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                queryParameters[parameterName] = parameters.$queryParameters[parameterName];
            });
        }

        let keys = Object.keys(queryParameters);
        return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    }

    /**
     * Returns List of Sample Data
     * @method
     * @name deAPI#getSamples
     * @param {string} studyIds - DiseaseXpress
     */
    getSamples(parameters: {
            'studyIds': string,
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < {} >
        >
        {
            const domain = parameters.$domain ? parameters.$domain : this.domain;
            let path = '/api/samples/{study_ids}';
            let body: any;
            let queryParameters: any = {};
            let headers: any = {};
            let form: any = {};
            return new Promise((resolve, reject) => {
                headers['Accept'] = 'application/json, text/tab-separated-values';

                path = path.replace('{study_ids}', parameters['studyIds'] + '');

                if (parameters['studyIds'] === undefined) {
                    reject(new Error('Missing required  parameter: studyIds'));
                    return;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                        queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                    });
                }

                this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve);
            }).then(function(response: request.Response) {
                return response.body;
            });
        };

    getTranscriptIdsURL(parameters: {
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/api/transcripts';

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                queryParameters[parameterName] = parameters.$queryParameters[parameterName];
            });
        }

        let keys = Object.keys(queryParameters);
        return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    }

    /**
     * Returns List of Transcript Ids
     * @method
     * @name deAPI#getTranscriptIds
     */
    getTranscriptIds(parameters: {
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < string >
        >
        {
            const domain = parameters.$domain ? parameters.$domain : this.domain;
            let path = '/api/transcripts';
            let body: any;
            let queryParameters: any = {};
            let headers: any = {};
            let form: any = {};
            return new Promise((resolve, reject) => {
                headers['Accept'] = 'application/json';

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                        queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                    });
                }

                this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve);
            }).then(function(response: request.Response) {
                return response.body;
            });
        };

    getTranscriptInfoURL(parameters: {
        'transcriptIds': string,
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/api/transcripts/{transcript_ids}';

        path = path.replace('{transcript_ids}', parameters['transcriptIds'] + '');

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                queryParameters[parameterName] = parameters.$queryParameters[parameterName];
            });
        }

        let keys = Object.keys(queryParameters);
        return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    }

    /**
     * Returns Transcript information
     * @method
     * @name deAPI#getTranscriptInfo
     * @param {string} transcriptIds - DiseaseXpress
     */
    getTranscriptInfo(parameters: {
            'transcriptIds': string,
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < TranscriptWithGeneInfo >
        >
        {
            const domain = parameters.$domain ? parameters.$domain : this.domain;
            let path = '/api/transcripts/{transcript_ids}';
            let body: any;
            let queryParameters: any = {};
            let headers: any = {};
            let form: any = {};
            return new Promise((resolve, reject) => {
                headers['Accept'] = 'application/json, text/tab-separated-values';

                path = path.replace('{transcript_ids}', parameters['transcriptIds'] + '');

                if (parameters['transcriptIds'] === undefined) {
                    reject(new Error('Missing required  parameter: transcriptIds'));
                    return;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                        queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                    });
                }

                this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve);
            }).then(function(response: request.Response) {
                return response.body;
            });
        };

    getDataByGeneIdsURL(parameters: {
        'geneIds': string,
        'projection' ? : "summary" | "detailed",
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/api/data/genes/ids/{gene_ids}';

        path = path.replace('{gene_ids}', parameters['geneIds'] + '');
        if (parameters['projection'] !== undefined) {
            queryParameters['projection'] = parameters['projection'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                queryParameters[parameterName] = parameters.$queryParameters[parameterName];
            });
        }

        let keys = Object.keys(queryParameters);
        return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    }

    /**
     * Returns expression data for given gene entrez ids
     * @method
     * @name deAPI#getDataByGeneIds
     * @param {string} geneIds - Comma separated list of gene entrez ids. e.g. ENSG00000136997.14,ENSG00000000003.14
     * @param {string} projection - Projection type summary or detailed
     */
    getDataByGeneIds(parameters: {
            'geneIds': string,
            'projection' ? : "summary" | "detailed",
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < GeneData >
        >
        {
            const domain = parameters.$domain ? parameters.$domain : this.domain;
            let path = '/api/data/genes/ids/{gene_ids}';
            let body: any;
            let queryParameters: any = {};
            let headers: any = {};
            let form: any = {};
            return new Promise((resolve, reject) => {
                headers['Accept'] = 'application/json, text/tab-separated-values';

                path = path.replace('{gene_ids}', parameters['geneIds'] + '');

                if (parameters['geneIds'] === undefined) {
                    reject(new Error('Missing required  parameter: geneIds'));
                    return;
                }

                if (parameters['projection'] !== undefined) {
                    queryParameters['projection'] = parameters['projection'];
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                        queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                    });
                }

                this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve);
            }).then(function(response: request.Response) {
                return response.body;
            });
        };

    getDataByGeneIdsAndStudiesURL(parameters: {
        'geneIds': string,
        'studies': string,
        'projection' ? : "summary" | "detailed",
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/api/data/genes/ids/{gene_ids}/studies/{studies}';

        path = path.replace('{gene_ids}', parameters['geneIds'] + '');

        path = path.replace('{studies}', parameters['studies'] + '');
        if (parameters['projection'] !== undefined) {
            queryParameters['projection'] = parameters['projection'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                queryParameters[parameterName] = parameters.$queryParameters[parameterName];
            });
        }

        let keys = Object.keys(queryParameters);
        return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    }

    /**
     * Returns expression data for given gene entrez ids and studies
     * @method
     * @name deAPI#getDataByGeneIdsAndStudies
     * @param {string} geneIds - Comma separated list of gene entrez ids. e.g. ENSG00000136997.14,ENSG00000000003.14
     * @param {string} studies - Comma separated list of study ids. e.g. PNOC,TARGET
     * @param {string} projection - Projection type summary or detailed
     */
    getDataByGeneIdsAndStudies(parameters: {
            'geneIds': string,
            'studies': string,
            'projection' ? : "summary" | "detailed",
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < GeneData >
        >
        {
            const domain = parameters.$domain ? parameters.$domain : this.domain;
            let path = '/api/data/genes/ids/{gene_ids}/studies/{studies}';
            let body: any;
            let queryParameters: any = {};
            let headers: any = {};
            let form: any = {};
            return new Promise((resolve, reject) => {
                headers['Accept'] = 'application/json, text/tab-separated-values';

                path = path.replace('{gene_ids}', parameters['geneIds'] + '');

                if (parameters['geneIds'] === undefined) {
                    reject(new Error('Missing required  parameter: geneIds'));
                    return;
                }

                path = path.replace('{studies}', parameters['studies'] + '');

                if (parameters['studies'] === undefined) {
                    reject(new Error('Missing required  parameter: studies'));
                    return;
                }

                if (parameters['projection'] !== undefined) {
                    queryParameters['projection'] = parameters['projection'];
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                        queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                    });
                }

                this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve);
            }).then(function(response: request.Response) {
                return response.body;
            });
        };

    getDataByGeneIdsAndNormalizationsURL(parameters: {
        'geneIds': string,
        'normalizations': Array < "rsem" | "sample_abundance" | "sample_rsem_isoform" >
            ,
        'projection' ? : "summary" | "detailed",
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/api/data/genes/ids/{gene_ids}/normalizations/{normalizations}';

        path = path.replace('{gene_ids}', parameters['geneIds'] + '');

        path = path.replace('{normalizations}', parameters['normalizations'] + '');
        if (parameters['projection'] !== undefined) {
            queryParameters['projection'] = parameters['projection'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                queryParameters[parameterName] = parameters.$queryParameters[parameterName];
            });
        }

        let keys = Object.keys(queryParameters);
        return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    }

    /**
     * Returns expression data for given gene entrez ids
     * @method
     * @name deAPI#getDataByGeneIdsAndNormalizations
     * @param {string} geneIds - Comma separated list of gene entrez ids. e.g. ENSG00000136997.14,ENSG00000000003.14
     * @param {array} normalizations - Comma separated list of normalization methods
     * @param {string} projection - Projection type summary or detailed
     */
    getDataByGeneIdsAndNormalizations(parameters: {
            'geneIds': string,
            'normalizations': Array < "rsem" | "sample_abundance" | "sample_rsem_isoform" >
                ,
            'projection' ? : "summary" | "detailed",
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < GeneData >
        >
        {
            const domain = parameters.$domain ? parameters.$domain : this.domain;
            let path = '/api/data/genes/ids/{gene_ids}/normalizations/{normalizations}';
            let body: any;
            let queryParameters: any = {};
            let headers: any = {};
            let form: any = {};
            return new Promise((resolve, reject) => {
                headers['Accept'] = 'application/json, text/tab-separated-values';

                path = path.replace('{gene_ids}', parameters['geneIds'] + '');

                if (parameters['geneIds'] === undefined) {
                    reject(new Error('Missing required  parameter: geneIds'));
                    return;
                }

                path = path.replace('{normalizations}', parameters['normalizations'] + '');

                if (parameters['normalizations'] === undefined) {
                    reject(new Error('Missing required  parameter: normalizations'));
                    return;
                }

                if (parameters['projection'] !== undefined) {
                    queryParameters['projection'] = parameters['projection'];
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                        queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                    });
                }

                this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve);
            }).then(function(response: request.Response) {
                return response.body;
            });
        };

    getDataByGeneIdsAndStudiesAndNormalizationsURL(parameters: {
        'geneIds': string,
        'studies': string,
        'normalizations': Array < "rsem" | "sample_abundance" | "sample_rsem_isoform" >
            ,
        'projection' ? : "summary" | "detailed",
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/api/data/genes/ids/{gene_ids}/studies/{studies}/normalizations/{normalizations}';

        path = path.replace('{gene_ids}', parameters['geneIds'] + '');

        path = path.replace('{studies}', parameters['studies'] + '');

        path = path.replace('{normalizations}', parameters['normalizations'] + '');
        if (parameters['projection'] !== undefined) {
            queryParameters['projection'] = parameters['projection'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                queryParameters[parameterName] = parameters.$queryParameters[parameterName];
            });
        }

        let keys = Object.keys(queryParameters);
        return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    }

    /**
     * Returns expression data for given gene entrez ids and studies
     * @method
     * @name deAPI#getDataByGeneIdsAndStudiesAndNormalizations
     * @param {string} geneIds - Comma separated list of gene entrez ids. e.g. ENSG00000136997.14,ENSG00000000003.14
     * @param {string} studies - Comma separated list of study ids. e.g. PNOC,TARGET
     * @param {array} normalizations - Comma separated list of normalization methods
     * @param {string} projection - Projection type summary or detailed
     */
    getDataByGeneIdsAndStudiesAndNormalizations(parameters: {
            'geneIds': string,
            'studies': string,
            'normalizations': Array < "rsem" | "sample_abundance" | "sample_rsem_isoform" >
                ,
            'projection' ? : "summary" | "detailed",
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < GeneData >
        >
        {
            const domain = parameters.$domain ? parameters.$domain : this.domain;
            let path = '/api/data/genes/ids/{gene_ids}/studies/{studies}/normalizations/{normalizations}';
            let body: any;
            let queryParameters: any = {};
            let headers: any = {};
            let form: any = {};
            return new Promise((resolve, reject) => {
                headers['Accept'] = 'application/json, text/tab-separated-values';

                path = path.replace('{gene_ids}', parameters['geneIds'] + '');

                if (parameters['geneIds'] === undefined) {
                    reject(new Error('Missing required  parameter: geneIds'));
                    return;
                }

                path = path.replace('{studies}', parameters['studies'] + '');

                if (parameters['studies'] === undefined) {
                    reject(new Error('Missing required  parameter: studies'));
                    return;
                }

                path = path.replace('{normalizations}', parameters['normalizations'] + '');

                if (parameters['normalizations'] === undefined) {
                    reject(new Error('Missing required  parameter: normalizations'));
                    return;
                }

                if (parameters['projection'] !== undefined) {
                    queryParameters['projection'] = parameters['projection'];
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                        queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                    });
                }

                this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve);
            }).then(function(response: request.Response) {
                return response.body;
            });
        };

    getDataByGeneSymbolsURL(parameters: {
        'geneSymbols': string,
        'projection' ? : "summary" | "detailed",
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/api/data/genes/symbols/{gene_symbols}';

        path = path.replace('{gene_symbols}', parameters['geneSymbols'] + '');
        if (parameters['projection'] !== undefined) {
            queryParameters['projection'] = parameters['projection'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                queryParameters[parameterName] = parameters.$queryParameters[parameterName];
            });
        }

        let keys = Object.keys(queryParameters);
        return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    }

    /**
     * Returns expression data for given gene symbols
     * @method
     * @name deAPI#getDataByGeneSymbols
     * @param {string} geneSymbols - Comma separated list of gene symbols. e.g. MYCN,TP53
     * @param {string} projection - Projection type summary or detailed
     */
    getDataByGeneSymbols(parameters: {
            'geneSymbols': string,
            'projection' ? : "summary" | "detailed",
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < GeneData >
        >
        {
            const domain = parameters.$domain ? parameters.$domain : this.domain;
            let path = '/api/data/genes/symbols/{gene_symbols}';
            let body: any;
            let queryParameters: any = {};
            let headers: any = {};
            let form: any = {};
            return new Promise((resolve, reject) => {
                headers['Accept'] = 'application/json, text/tab-separated-values';

                path = path.replace('{gene_symbols}', parameters['geneSymbols'] + '');

                if (parameters['geneSymbols'] === undefined) {
                    reject(new Error('Missing required  parameter: geneSymbols'));
                    return;
                }

                if (parameters['projection'] !== undefined) {
                    queryParameters['projection'] = parameters['projection'];
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                        queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                    });
                }

                this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve);
            }).then(function(response: request.Response) {
                return response.body;
            });
        };

    getDataByGeneSymbolsAndNormalizationsURL(parameters: {
        'geneSymbols': string,
        'normalizations': Array < "rsem" | "sample_abundance" | "sample_rsem_isoform" >
            ,
        'projection' ? : "summary" | "detailed",
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/api/data/genes/symbols/{gene_symbols}/normalizations/{normalizations}';

        path = path.replace('{gene_symbols}', parameters['geneSymbols'] + '');

        path = path.replace('{normalizations}', parameters['normalizations'] + '');
        if (parameters['projection'] !== undefined) {
            queryParameters['projection'] = parameters['projection'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                queryParameters[parameterName] = parameters.$queryParameters[parameterName];
            });
        }

        let keys = Object.keys(queryParameters);
        return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    }

    /**
     * Returns expression data for given gene symbols
     * @method
     * @name deAPI#getDataByGeneSymbolsAndNormalizations
     * @param {string} geneSymbols - Comma separated list of gene symbols. e.g. MYCN,TP53
     * @param {array} normalizations - Comma separated list of normalization methods
     * @param {string} projection - Projection type summary or detailed
     */
    getDataByGeneSymbolsAndNormalizations(parameters: {
            'geneSymbols': string,
            'normalizations': Array < "rsem" | "sample_abundance" | "sample_rsem_isoform" >
                ,
            'projection' ? : "summary" | "detailed",
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < GeneData >
        >
        {
            const domain = parameters.$domain ? parameters.$domain : this.domain;
            let path = '/api/data/genes/symbols/{gene_symbols}/normalizations/{normalizations}';
            let body: any;
            let queryParameters: any = {};
            let headers: any = {};
            let form: any = {};
            return new Promise((resolve, reject) => {
                headers['Accept'] = 'application/json, text/tab-separated-values';

                path = path.replace('{gene_symbols}', parameters['geneSymbols'] + '');

                if (parameters['geneSymbols'] === undefined) {
                    reject(new Error('Missing required  parameter: geneSymbols'));
                    return;
                }

                path = path.replace('{normalizations}', parameters['normalizations'] + '');

                if (parameters['normalizations'] === undefined) {
                    reject(new Error('Missing required  parameter: normalizations'));
                    return;
                }

                if (parameters['projection'] !== undefined) {
                    queryParameters['projection'] = parameters['projection'];
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                        queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                    });
                }

                this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve);
            }).then(function(response: request.Response) {
                return response.body;
            });
        };

    getDataByGeneSymbolsAndStudiesURL(parameters: {
        'geneSymbols': string,
        'studies': string,
        'projection' ? : "summary" | "detailed",
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/api/data/genes/symbols/{gene_symbols}/studies/{studies}';

        path = path.replace('{gene_symbols}', parameters['geneSymbols'] + '');

        path = path.replace('{studies}', parameters['studies'] + '');
        if (parameters['projection'] !== undefined) {
            queryParameters['projection'] = parameters['projection'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                queryParameters[parameterName] = parameters.$queryParameters[parameterName];
            });
        }

        let keys = Object.keys(queryParameters);
        return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    }

    /**
     * Returns expression data for given gene symbols and studies
     * @method
     * @name deAPI#getDataByGeneSymbolsAndStudies
     * @param {string} geneSymbols - Comma separated list of gene symbols. e.g. MYCN,TP53
     * @param {string} studies - Comma separated list of study ids. e.g. PNOC,TARGET
     * @param {string} projection - Projection type summary or detailed
     */
    getDataByGeneSymbolsAndStudies(parameters: {
            'geneSymbols': string,
            'studies': string,
            'projection' ? : "summary" | "detailed",
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < GeneData >
        >
        {
            const domain = parameters.$domain ? parameters.$domain : this.domain;
            let path = '/api/data/genes/symbols/{gene_symbols}/studies/{studies}';
            let body: any;
            let queryParameters: any = {};
            let headers: any = {};
            let form: any = {};
            return new Promise((resolve, reject) => {
                headers['Accept'] = 'application/json, text/tab-separated-values';

                path = path.replace('{gene_symbols}', parameters['geneSymbols'] + '');

                if (parameters['geneSymbols'] === undefined) {
                    reject(new Error('Missing required  parameter: geneSymbols'));
                    return;
                }

                path = path.replace('{studies}', parameters['studies'] + '');

                if (parameters['studies'] === undefined) {
                    reject(new Error('Missing required  parameter: studies'));
                    return;
                }

                if (parameters['projection'] !== undefined) {
                    queryParameters['projection'] = parameters['projection'];
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                        queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                    });
                }

                this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve);
            }).then(function(response: request.Response) {
                return response.body;
            });
        };

    getDataByGeneSymbolsAndStudiesAndNormalizationsURL(parameters: {
        'geneSymbols': string,
        'studies': string,
        'normalizations': Array < "rsem" | "sample_abundance" | "sample_rsem_isoform" >
            ,
        'projection' ? : "summary" | "detailed",
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/api/data/genes/symbols/{gene_symbols}/studies/{studies}/normalizations/{normalizations}';

        path = path.replace('{gene_symbols}', parameters['geneSymbols'] + '');

        path = path.replace('{studies}', parameters['studies'] + '');

        path = path.replace('{normalizations}', parameters['normalizations'] + '');
        if (parameters['projection'] !== undefined) {
            queryParameters['projection'] = parameters['projection'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                queryParameters[parameterName] = parameters.$queryParameters[parameterName];
            });
        }

        let keys = Object.keys(queryParameters);
        return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    }

    /**
     * Returns expression data for given gene symbols and studies
     * @method
     * @name deAPI#getDataByGeneSymbolsAndStudiesAndNormalizations
     * @param {string} geneSymbols - Comma separated list of gene symbols. e.g. MYCN,TP53
     * @param {string} studies - Comma separated list of study ids. e.g. PNOC,TARGET
     * @param {array} normalizations - Comma separated list of normalization methods
     * @param {string} projection - Projection type summary or detailed
     */
    getDataByGeneSymbolsAndStudiesAndNormalizations(parameters: {
            'geneSymbols': string,
            'studies': string,
            'normalizations': Array < "rsem" | "sample_abundance" | "sample_rsem_isoform" >
                ,
            'projection' ? : "summary" | "detailed",
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < GeneData >
        >
        {
            const domain = parameters.$domain ? parameters.$domain : this.domain;
            let path = '/api/data/genes/symbols/{gene_symbols}/studies/{studies}/normalizations/{normalizations}';
            let body: any;
            let queryParameters: any = {};
            let headers: any = {};
            let form: any = {};
            return new Promise((resolve, reject) => {
                headers['Accept'] = 'application/json, text/tab-separated-values';

                path = path.replace('{gene_symbols}', parameters['geneSymbols'] + '');

                if (parameters['geneSymbols'] === undefined) {
                    reject(new Error('Missing required  parameter: geneSymbols'));
                    return;
                }

                path = path.replace('{studies}', parameters['studies'] + '');

                if (parameters['studies'] === undefined) {
                    reject(new Error('Missing required  parameter: studies'));
                    return;
                }

                path = path.replace('{normalizations}', parameters['normalizations'] + '');

                if (parameters['normalizations'] === undefined) {
                    reject(new Error('Missing required  parameter: normalizations'));
                    return;
                }

                if (parameters['projection'] !== undefined) {
                    queryParameters['projection'] = parameters['projection'];
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                        queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                    });
                }

                this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve);
            }).then(function(response: request.Response) {
                return response.body;
            });
        };

    getDataByTranscriptIdsURL(parameters: {
        'transcriptIds': string,
        'projection' ? : "summary" | "detailed",
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/api/data/transcripts/ids/{transcript_ids}';

        path = path.replace('{transcript_ids}', parameters['transcriptIds'] + '');
        if (parameters['projection'] !== undefined) {
            queryParameters['projection'] = parameters['projection'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                queryParameters[parameterName] = parameters.$queryParameters[parameterName];
            });
        }

        let keys = Object.keys(queryParameters);
        return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    }

    /**
     * Returns expression data for given transcript ids
     * @method
     * @name deAPI#getDataByTranscriptIds
     * @param {string} transcriptIds - Comma separated list of transcript ids. e.g. ENST00000373031.4,ENST00000514373.2
     * @param {string} projection - Projection type summary or detailed
     */
    getDataByTranscriptIds(parameters: {
            'transcriptIds': string,
            'projection' ? : "summary" | "detailed",
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < GeneData >
        >
        {
            const domain = parameters.$domain ? parameters.$domain : this.domain;
            let path = '/api/data/transcripts/ids/{transcript_ids}';
            let body: any;
            let queryParameters: any = {};
            let headers: any = {};
            let form: any = {};
            return new Promise((resolve, reject) => {
                headers['Accept'] = 'application/json, text/tab-separated-values';

                path = path.replace('{transcript_ids}', parameters['transcriptIds'] + '');

                if (parameters['transcriptIds'] === undefined) {
                    reject(new Error('Missing required  parameter: transcriptIds'));
                    return;
                }

                if (parameters['projection'] !== undefined) {
                    queryParameters['projection'] = parameters['projection'];
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                        queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                    });
                }

                this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve);
            }).then(function(response: request.Response) {
                return response.body;
            });
        };

    getDataByTranscriptIdsAndStudiesURL(parameters: {
        'transcriptIds': string,
        'studies': string,
        'projection' ? : "summary" | "detailed",
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/api/data/transcripts/ids/{transcript_ids}/studies/{studies}';

        path = path.replace('{transcript_ids}', parameters['transcriptIds'] + '');

        path = path.replace('{studies}', parameters['studies'] + '');
        if (parameters['projection'] !== undefined) {
            queryParameters['projection'] = parameters['projection'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                queryParameters[parameterName] = parameters.$queryParameters[parameterName];
            });
        }

        let keys = Object.keys(queryParameters);
        return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    }

    /**
     * Returns expression data for given transcript ids and studies
     * @method
     * @name deAPI#getDataByTranscriptIdsAndStudies
     * @param {string} transcriptIds - Comma separated list of transcript ids. e.g. ENST00000373031.4,ENST00000514373.2
     * @param {string} studies - Comma separated list of study ids. e.g. PNOC,TARGET
     * @param {string} projection - Projection type summary or detailed
     */
    getDataByTranscriptIdsAndStudies(parameters: {
            'transcriptIds': string,
            'studies': string,
            'projection' ? : "summary" | "detailed",
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < GeneData >
        >
        {
            const domain = parameters.$domain ? parameters.$domain : this.domain;
            let path = '/api/data/transcripts/ids/{transcript_ids}/studies/{studies}';
            let body: any;
            let queryParameters: any = {};
            let headers: any = {};
            let form: any = {};
            return new Promise((resolve, reject) => {
                headers['Accept'] = 'application/json, text/tab-separated-values';

                path = path.replace('{transcript_ids}', parameters['transcriptIds'] + '');

                if (parameters['transcriptIds'] === undefined) {
                    reject(new Error('Missing required  parameter: transcriptIds'));
                    return;
                }

                path = path.replace('{studies}', parameters['studies'] + '');

                if (parameters['studies'] === undefined) {
                    reject(new Error('Missing required  parameter: studies'));
                    return;
                }

                if (parameters['projection'] !== undefined) {
                    queryParameters['projection'] = parameters['projection'];
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                        queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                    });
                }

                this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve);
            }).then(function(response: request.Response) {
                return response.body;
            });
        };

    getDataByTranscriptIdsAndNormalizationsURL(parameters: {
        'transcriptIds': string,
        'normalizations': Array < "rsem" | "sample_abundance" | "sample_rsem_isoform" >
            ,
        'projection' ? : "summary" | "detailed",
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/api/data/transcripts/ids/{transcript_ids}/normalizations/{normalizations}';

        path = path.replace('{transcript_ids}', parameters['transcriptIds'] + '');

        path = path.replace('{normalizations}', parameters['normalizations'] + '');
        if (parameters['projection'] !== undefined) {
            queryParameters['projection'] = parameters['projection'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                queryParameters[parameterName] = parameters.$queryParameters[parameterName];
            });
        }

        let keys = Object.keys(queryParameters);
        return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    }

    /**
     * Returns expression data for given transcript ids
     * @method
     * @name deAPI#getDataByTranscriptIdsAndNormalizations
     * @param {string} transcriptIds - Comma separated list of transcript ids. e.g. ENST00000373031.4,ENST00000514373.2
     * @param {array} normalizations - Comma separated list of normalization methods
     * @param {string} projection - Projection type summary or detailed
     */
    getDataByTranscriptIdsAndNormalizations(parameters: {
            'transcriptIds': string,
            'normalizations': Array < "rsem" | "sample_abundance" | "sample_rsem_isoform" >
                ,
            'projection' ? : "summary" | "detailed",
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < GeneData >
        >
        {
            const domain = parameters.$domain ? parameters.$domain : this.domain;
            let path = '/api/data/transcripts/ids/{transcript_ids}/normalizations/{normalizations}';
            let body: any;
            let queryParameters: any = {};
            let headers: any = {};
            let form: any = {};
            return new Promise((resolve, reject) => {
                headers['Accept'] = 'application/json, text/tab-separated-values';

                path = path.replace('{transcript_ids}', parameters['transcriptIds'] + '');

                if (parameters['transcriptIds'] === undefined) {
                    reject(new Error('Missing required  parameter: transcriptIds'));
                    return;
                }

                path = path.replace('{normalizations}', parameters['normalizations'] + '');

                if (parameters['normalizations'] === undefined) {
                    reject(new Error('Missing required  parameter: normalizations'));
                    return;
                }

                if (parameters['projection'] !== undefined) {
                    queryParameters['projection'] = parameters['projection'];
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                        queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                    });
                }

                this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve);
            }).then(function(response: request.Response) {
                return response.body;
            });
        };

    getDataByTranscriptIdsAndStudiesAndNormalizationsURL(parameters: {
        'transcriptIds': string,
        'studies': string,
        'normalizations': Array < "rsem" | "sample_abundance" | "sample_rsem_isoform" >
            ,
        'projection' ? : "summary" | "detailed",
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/api/data/transcripts/ids/{transcript_ids}/studies/{studies}/normalizations/{normalizations}';

        path = path.replace('{transcript_ids}', parameters['transcriptIds'] + '');

        path = path.replace('{studies}', parameters['studies'] + '');

        path = path.replace('{normalizations}', parameters['normalizations'] + '');
        if (parameters['projection'] !== undefined) {
            queryParameters['projection'] = parameters['projection'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                queryParameters[parameterName] = parameters.$queryParameters[parameterName];
            });
        }

        let keys = Object.keys(queryParameters);
        return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    }

    /**
     * Returns expression data for given transcript ids and studies
     * @method
     * @name deAPI#getDataByTranscriptIdsAndStudiesAndNormalizations
     * @param {string} transcriptIds - Comma separated list of transcript ids. e.g. ENST00000373031.4,ENST00000514373.2
     * @param {string} studies - Comma separated list of study ids. e.g. PNOC,TARGET
     * @param {array} normalizations - Comma separated list of normalization methods
     * @param {string} projection - Projection type summary or detailed
     */
    getDataByTranscriptIdsAndStudiesAndNormalizations(parameters: {
            'transcriptIds': string,
            'studies': string,
            'normalizations': Array < "rsem" | "sample_abundance" | "sample_rsem_isoform" >
                ,
            'projection' ? : "summary" | "detailed",
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < GeneData >
        >
        {
            const domain = parameters.$domain ? parameters.$domain : this.domain;
            let path = '/api/data/transcripts/ids/{transcript_ids}/studies/{studies}/normalizations/{normalizations}';
            let body: any;
            let queryParameters: any = {};
            let headers: any = {};
            let form: any = {};
            return new Promise((resolve, reject) => {
                headers['Accept'] = 'application/json, text/tab-separated-values';

                path = path.replace('{transcript_ids}', parameters['transcriptIds'] + '');

                if (parameters['transcriptIds'] === undefined) {
                    reject(new Error('Missing required  parameter: transcriptIds'));
                    return;
                }

                path = path.replace('{studies}', parameters['studies'] + '');

                if (parameters['studies'] === undefined) {
                    reject(new Error('Missing required  parameter: studies'));
                    return;
                }

                path = path.replace('{normalizations}', parameters['normalizations'] + '');

                if (parameters['normalizations'] === undefined) {
                    reject(new Error('Missing required  parameter: normalizations'));
                    return;
                }

                if (parameters['projection'] !== undefined) {
                    queryParameters['projection'] = parameters['projection'];
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                        queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                    });
                }

                this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve);
            }).then(function(response: request.Response) {
                return response.body;
            });
        };

    getDataByGeneSymbolsAndTagsAndNormalizationsURL(parameters: {
        'geneSymbols': string,
        'normalizations': Array < "rsem" | "sample_abundance" | "sample_rsem_isoform" >
            ,
        'projection' ? : "summary" | "detailed",
        'payload': {},
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/api/data/api/tags/data/genes/symbols/{gene_symbols}/normalizations/{normalizations}';

        path = path.replace('{gene_symbols}', parameters['geneSymbols'] + '');

        path = path.replace('{normalizations}', parameters['normalizations'] + '');
        if (parameters['projection'] !== undefined) {
            queryParameters['projection'] = parameters['projection'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                queryParameters[parameterName] = parameters.$queryParameters[parameterName];
            });
        }

        queryParameters = {};

        let keys = Object.keys(queryParameters);
        return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    }

    /**
    * Returns expression data for given transcript ids and studies
    * @method
    * @name deAPI#getDataByGeneSymbolsAndTagsAndNormalizations
         * @param {string} geneSymbols - Comma separated list of gene symbols. e.g. MYCN,TP53
         * @param {array} normalizations - Comma separated list of normalization methods
         * @param {string} projection - Projection type summary or detailed
         * @param {} payload - Its a JSON payload currently supports the following operations
    Logical Operators             : $and, $not, $nor, $or
    Comparison Operators : $eq, $gt, $gte, $in, $lt, $lte, $ne, $nin
    Example:                           
    {
    &emsp; \"$and\": [
    &emsp;&emsp;&emsp; { \"$eq\": { \"mycn_status\":\"amplified\" } },
    &emsp;&emsp;&emsp; { \"$in\": { \"risk\": [\"high\",\"low\"] } },
    &emsp;&emsp;&emsp; { \"$not\": { \"$eq\": { \"stage\": 4 } } },
    &emsp;&emsp;&emsp; { \"$lt\": { \"stage\": 4 } },
    &emsp;&emsp;&emsp; { \"$or\": [
    &emsp;&emsp;&emsp;&emsp;&emsp; { \"$eq\": { \"mycn_status\":\"amplified\" } },
    &emsp;&emsp;&emsp;&emsp;&emsp; { \"stage\": \"4\" } ]
    &emsp;&emsp;&emsp; }
    &emsp;]
    }

    */
    getDataByGeneSymbolsAndTagsAndNormalizations(parameters: {
            'geneSymbols': string,
            'normalizations': Array < "rsem" | "sample_abundance" | "sample_rsem_isoform" >
                ,
            'projection' ? : "summary" | "detailed",
            'payload': {},
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < GeneData >
        >
        {
            const domain = parameters.$domain ? parameters.$domain : this.domain;
            let path = '/api/data/api/tags/data/genes/symbols/{gene_symbols}/normalizations/{normalizations}';
            let body: any;
            let queryParameters: any = {};
            let headers: any = {};
            let form: any = {};
            return new Promise((resolve, reject) => {
                headers['Accept'] = 'application/json, text/tab-separated-values';

                path = path.replace('{gene_symbols}', parameters['geneSymbols'] + '');

                if (parameters['geneSymbols'] === undefined) {
                    reject(new Error('Missing required  parameter: geneSymbols'));
                    return;
                }

                path = path.replace('{normalizations}', parameters['normalizations'] + '');

                if (parameters['normalizations'] === undefined) {
                    reject(new Error('Missing required  parameter: normalizations'));
                    return;
                }

                if (parameters['projection'] !== undefined) {
                    queryParameters['projection'] = parameters['projection'];
                }

                if (parameters['payload'] !== undefined) {
                    body = parameters['payload'];
                }

                if (parameters['payload'] === undefined) {
                    reject(new Error('Missing required  parameter: payload'));
                    return;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                        queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                    });
                }

                form = queryParameters;
                queryParameters = {};

                this.request('POST', domain + path, body, headers, queryParameters, form, reject, resolve);
            }).then(function(response: request.Response) {
                return response.body;
            });
        };

    getDataByGeneIdsAndTagsAndNormalizationsURL(parameters: {
        'geneIds': string,
        'normalizations': Array < "rsem" | "sample_abundance" | "sample_rsem_isoform" >
            ,
        'projection' ? : "summary" | "detailed",
        'payload': {},
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/api/data/api/tags/data/genes/ids/{gene_ids}/normalizations/{normalizations}';

        path = path.replace('{gene_ids}', parameters['geneIds'] + '');

        path = path.replace('{normalizations}', parameters['normalizations'] + '');
        if (parameters['projection'] !== undefined) {
            queryParameters['projection'] = parameters['projection'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                queryParameters[parameterName] = parameters.$queryParameters[parameterName];
            });
        }

        queryParameters = {};

        let keys = Object.keys(queryParameters);
        return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    }

    /**
    * Returns expression data for given transcript ids and studies
    * @method
    * @name deAPI#getDataByGeneIdsAndTagsAndNormalizations
         * @param {string} geneIds - Comma separated list of gene entrez ids. e.g. ENSG00000136997.14,ENSG00000000003.14
         * @param {array} normalizations - Comma separated list of normalization methods
         * @param {string} projection - Projection type summary or detailed
         * @param {} payload - Its a JSON payload currently supports the following operations
    Logical Operators             : $and, $not, $nor, $or
    Comparison Operators : $eq, $gt, $gte, $in, $lt, $lte, $ne, $nin
    Example:                           
    {
    &emsp; \"$and\": [
    &emsp;&emsp;&emsp; { \"$eq\": { \"mycn_status\":\"amplified\" } },
    &emsp;&emsp;&emsp; { \"$in\": { \"risk\": [\"high\",\"low\"] } },
    &emsp;&emsp;&emsp; { \"$not\": { \"$eq\": { \"stage\": 4 } } },
    &emsp;&emsp;&emsp; { \"$lt\": { \"stage\": 4 } },
    &emsp;&emsp;&emsp; { \"$or\": [
    &emsp;&emsp;&emsp;&emsp;&emsp; { \"$eq\": { \"mycn_status\":\"amplified\" } },
    &emsp;&emsp;&emsp;&emsp;&emsp; { \"stage\": \"4\" } ]
    &emsp;&emsp;&emsp; }
    &emsp;]
    }

    */
    getDataByGeneIdsAndTagsAndNormalizations(parameters: {
            'geneIds': string,
            'normalizations': Array < "rsem" | "sample_abundance" | "sample_rsem_isoform" >
                ,
            'projection' ? : "summary" | "detailed",
            'payload': {},
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < GeneData >
        >
        {
            const domain = parameters.$domain ? parameters.$domain : this.domain;
            let path = '/api/data/api/tags/data/genes/ids/{gene_ids}/normalizations/{normalizations}';
            let body: any;
            let queryParameters: any = {};
            let headers: any = {};
            let form: any = {};
            return new Promise((resolve, reject) => {
                headers['Accept'] = 'application/json, text/tab-separated-values';

                path = path.replace('{gene_ids}', parameters['geneIds'] + '');

                if (parameters['geneIds'] === undefined) {
                    reject(new Error('Missing required  parameter: geneIds'));
                    return;
                }

                path = path.replace('{normalizations}', parameters['normalizations'] + '');

                if (parameters['normalizations'] === undefined) {
                    reject(new Error('Missing required  parameter: normalizations'));
                    return;
                }

                if (parameters['projection'] !== undefined) {
                    queryParameters['projection'] = parameters['projection'];
                }

                if (parameters['payload'] !== undefined) {
                    body = parameters['payload'];
                }

                if (parameters['payload'] === undefined) {
                    reject(new Error('Missing required  parameter: payload'));
                    return;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                        queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                    });
                }

                form = queryParameters;
                queryParameters = {};

                this.request('POST', domain + path, body, headers, queryParameters, form, reject, resolve);
            }).then(function(response: request.Response) {
                return response.body;
            });
        };

    getDataByTranscriptIdsAndTagsAndNormalizationsURL(parameters: {
        'transcriptIds': string,
        'normalizations': Array < "rsem" | "sample_abundance" | "sample_rsem_isoform" >
            ,
        'projection' ? : "summary" | "detailed",
        'payload': {},
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/api/data/api/tags/data/transcripts/ids/{transcript_ids}/normalizations/{normalizations}';

        path = path.replace('{transcript_ids}', parameters['transcriptIds'] + '');

        path = path.replace('{normalizations}', parameters['normalizations'] + '');
        if (parameters['projection'] !== undefined) {
            queryParameters['projection'] = parameters['projection'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                queryParameters[parameterName] = parameters.$queryParameters[parameterName];
            });
        }

        queryParameters = {};

        let keys = Object.keys(queryParameters);
        return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    }

    /**
    * Returns expression data for given transcript ids and studies
    * @method
    * @name deAPI#getDataByTranscriptIdsAndTagsAndNormalizations
         * @param {string} transcriptIds - Comma separated list of transcript ids. e.g. ENST00000373031.4,ENST00000514373.2
         * @param {array} normalizations - Comma separated list of normalization methods
         * @param {string} projection - Projection type summary or detailed
         * @param {} payload - Its a JSON payload currently supports the following operations
    Logical Operators             : $and, $not, $nor, $or
    Comparison Operators : $eq, $gt, $gte, $in, $lt, $lte, $ne, $nin
    Example:                           
    {
    &emsp; \"$and\": [
    &emsp;&emsp;&emsp; { \"$eq\": { \"mycn_status\":\"amplified\" } },
    &emsp;&emsp;&emsp; { \"$in\": { \"risk\": [\"high\",\"low\"] } },
    &emsp;&emsp;&emsp; { \"$not\": { \"$eq\": { \"stage\": 4 } } },
    &emsp;&emsp;&emsp; { \"$lt\": { \"stage\": 4 } },
    &emsp;&emsp;&emsp; { \"$or\": [
    &emsp;&emsp;&emsp;&emsp;&emsp; { \"$eq\": { \"mycn_status\":\"amplified\" } },
    &emsp;&emsp;&emsp;&emsp;&emsp; { \"stage\": \"4\" } ]
    &emsp;&emsp;&emsp; }
    &emsp;]
    }

    */
    getDataByTranscriptIdsAndTagsAndNormalizations(parameters: {
            'transcriptIds': string,
            'normalizations': Array < "rsem" | "sample_abundance" | "sample_rsem_isoform" >
                ,
            'projection' ? : "summary" | "detailed",
            'payload': {},
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < GeneData >
        >
        {
            const domain = parameters.$domain ? parameters.$domain : this.domain;
            let path = '/api/data/api/tags/data/transcripts/ids/{transcript_ids}/normalizations/{normalizations}';
            let body: any;
            let queryParameters: any = {};
            let headers: any = {};
            let form: any = {};
            return new Promise((resolve, reject) => {
                headers['Accept'] = 'application/json, text/tab-separated-values';

                path = path.replace('{transcript_ids}', parameters['transcriptIds'] + '');

                if (parameters['transcriptIds'] === undefined) {
                    reject(new Error('Missing required  parameter: transcriptIds'));
                    return;
                }

                path = path.replace('{normalizations}', parameters['normalizations'] + '');

                if (parameters['normalizations'] === undefined) {
                    reject(new Error('Missing required  parameter: normalizations'));
                    return;
                }

                if (parameters['projection'] !== undefined) {
                    queryParameters['projection'] = parameters['projection'];
                }

                if (parameters['payload'] !== undefined) {
                    body = parameters['payload'];
                }

                if (parameters['payload'] === undefined) {
                    reject(new Error('Missing required  parameter: payload'));
                    return;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                        queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                    });
                }

                form = queryParameters;
                queryParameters = {};

                this.request('POST', domain + path, body, headers, queryParameters, form, reject, resolve);
            }).then(function(response: request.Response) {
                return response.body;
            });
        };

    getDataByTagsAndNormalizationsURL(parameters: {
        'normalizations': Array < "rsem" | "sample_abundance" | "sample_rsem_isoform" >
            ,
        'projection' ? : "summary" | "detailed",
        'payload': {},
        $queryParameters ? : any,
        $domain ? : string
    }): string {
        let queryParameters: any = {};
        const domain = parameters.$domain ? parameters.$domain : this.domain;
        let path = '/api/data/normalizations/{normalizations}';

        path = path.replace('{normalizations}', parameters['normalizations'] + '');
        if (parameters['projection'] !== undefined) {
            queryParameters['projection'] = parameters['projection'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                queryParameters[parameterName] = parameters.$queryParameters[parameterName];
            });
        }

        queryParameters = {};

        let keys = Object.keys(queryParameters);
        return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '');
    }

    /**
    * Returns expression data for given sample tags and normalizations
    * @method
    * @name deAPI#getDataByTagsAndNormalizations
         * @param {array} normalizations - Comma separated list of normalization methods
         * @param {string} projection - Projection type summary or detailed
         * @param {} payload - Its a JSON payload currently supports the following operations
    Logical Operators             : $and, $not, $nor, $or
    Comparison Operators : $eq, $gt, $gte, $in, $lt, $lte, $ne, $nin
    Example:                           
    {
    &emsp; \"$and\": [
    &emsp;&emsp;&emsp; { \"$eq\": { \"mycn_status\":\"amplified\" } },
    &emsp;&emsp;&emsp; { \"$in\": { \"risk\": [\"high\",\"low\"] } },
    &emsp;&emsp;&emsp; { \"$not\": { \"$eq\": { \"stage\": 4 } } },
    &emsp;&emsp;&emsp; { \"$lt\": { \"stage\": 4 } },
    &emsp;&emsp;&emsp; { \"$or\": [
    &emsp;&emsp;&emsp;&emsp;&emsp; { \"$eq\": { \"mycn_status\":\"amplified\" } },
    &emsp;&emsp;&emsp;&emsp;&emsp; { \"stage\": \"4\" } ]
    &emsp;&emsp;&emsp; }
    &emsp;]
    }

    */
    getDataByTagsAndNormalizations(parameters: {
            'normalizations': Array < "rsem" | "sample_abundance" | "sample_rsem_isoform" >
                ,
            'projection' ? : "summary" | "detailed",
            'payload': {},
            $queryParameters ? : any,
            $domain ? : string
        }): Promise < Array < GeneData >
        >
        {
            const domain = parameters.$domain ? parameters.$domain : this.domain;
            let path = '/api/data/normalizations/{normalizations}';
            let body: any;
            let queryParameters: any = {};
            let headers: any = {};
            let form: any = {};
            return new Promise((resolve, reject) => {
                headers['Accept'] = 'application/json, text/tab-separated-values';

                path = path.replace('{normalizations}', parameters['normalizations'] + '');

                if (parameters['normalizations'] === undefined) {
                    reject(new Error('Missing required  parameter: normalizations'));
                    return;
                }

                if (parameters['projection'] !== undefined) {
                    queryParameters['projection'] = parameters['projection'];
                }

                if (parameters['payload'] !== undefined) {
                    body = parameters['payload'];
                }

                if (parameters['payload'] === undefined) {
                    reject(new Error('Missing required  parameter: payload'));
                    return;
                }

                if (parameters.$queryParameters) {
                    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
                        queryParameters[parameterName] = parameters.$queryParameters[parameterName];
                    });
                }

                form = queryParameters;
                queryParameters = {};

                this.request('POST', domain + path, body, headers, queryParameters, form, reject, resolve);
            }).then(function(response: request.Response) {
                return response.body;
            });
        };

}