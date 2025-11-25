
export interface GeneBounds{
    min: number;
    max: number;

}

export interface GeneDetailsFromSearch{
    genomicinfo?: {
        chrstart: number;
        chrstop: number;
        strand?: string;
    }[];
    summary?: string;
    organism?: {
        scientificname: string;
        commonname: string;
    };
}

export async function fetchGeneDetails(geneId: string) : Promise<{
        geneDetails: GeneDetailsFromSearch | null ;
        geneBounds: GeneBounds | null;
        initialRange: { start: number; end: number } | null;
    }>
 {
    try {
        const getGeneDetailUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&id=${geneId}&retmode=json`

        const geneDetailsResponse = await fetch(getGeneDetailUrl)

        if(!geneDetailsResponse.ok){

            console.log("Error to fetch. Gene Detail ")
            return {geneDetails:null , geneBounds: null , initialRange:null}
        } 

        const detailData = await geneDetailsResponse.json()

        if (detailData.result && detailData.result[geneId]) {
            const detail = detailData.result[geneId];

            if (detail.genomicinfo && detail.genomicinfo.length > 0) {
                const info = detail.genomicinfo[0];

                const minPos = Math.min(info.chrstart, info.chrstop);
                const maxPos = Math.max(info.chrstart, info.chrstop);
                const bounds = { min: minPos, max: maxPos };

                const geneSize = maxPos - minPos;
                const seqStart = minPos;
                const seqEnd = geneSize > 10000 ? minPos + 10000 : maxPos;
                const range = { start: seqStart, end: seqEnd };

                return { geneDetails: detail, geneBounds: bounds, initialRange: range };
            }
        
        }
        return { geneDetails: null, geneBounds: null, initialRange: null };
    
        
    } catch (err) {
        return {geneDetails:null , geneBounds: null , initialRange:null}
        
    }
 }