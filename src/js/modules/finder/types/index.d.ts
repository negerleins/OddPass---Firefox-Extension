export default Module;
declare class Module {
    constructor(window: any, document: any);
    confirmer(fields: any): any;
    filter(fieldType: any): any;
    /**
     * Search all fields with the filter of a query
     *
     * @param {*} query
     * @returns
     */
    fields(query: any): Promise<any>;
    #private;
}
