import * as fs from 'fs';
import * as path from 'path';
/**
 * Reads a large JSON file containing a flat array of objects, splits it into multiple files based on batch size,
 * and writes each batch as a JSON array to a separate output file.
 * @param inputFile - The path to the input JSON file.
 * @param batchSize - The number of objects per batch/file.
 */
export async function splitJsonFile(inputFile: string, batchSize: number = 40000) {
    try {
        // Step 1: Read the raw content of the file as a string
        const fileContent = fs.readFileSync(inputFile, 'utf-8');
        console.log(`File content read successfully.`);

        // Step 2: Parse the stringified JSON content into an array
        let data;
        try {
            data = JSON.parse(fileContent);  // Expecting the file to contain a valid JSON array
        } catch (parseError: any) {
            console.error(`Error parsing JSON file. Ensure it contains valid JSON. Error: ${parseError.message}`);
            return;
        }

        // Step 3: Ensure the parsed data is an array
        if (!Array.isArray(data)) {
            console.error('The JSON file should contain an array of objects.');
            return;
        }

        console.log(`Total number of records in the array: ${data.length}`);

        // Step 4: Loop through the array and split it into batches
        let fileIndex = 1;
        let totalFilesCreated = 0;

        let mongoImport = '';

        for (let startIndex = 0; startIndex < data.length; startIndex += batchSize) {
            // Calculate end index for the current batch
            const endIndex = Math.min(startIndex + batchSize, data.length);

            // Slice the array to get the batch of records from startIndex to endIndex
            const batchArray = data.slice(startIndex, endIndex);

            console.log(`Writing records from index ${startIndex} to ${endIndex - 1} (Total: ${batchArray.length} records)`);

            // Step 5: Write the batch to a separate output file as a JSON array
            const outputFileName = `data_${fileIndex}.json`;
            try {
                fs.writeFileSync(outputFileName, JSON.stringify(batchArray, null, 2));
                console.log(`Batch written to ${outputFileName} successfully.`);
                totalFilesCreated++;
            } catch (writeError: any) {
                console.error(`Error writing batch to file ${outputFileName}: ${writeError.message}`);
            }

            fileIndex++;
            mongoImport = mongoImport + `mongoimport --db your_database --collection words --file data_${fileIndex-1}.json --jsonArray\n`
       
        }

        console.log(`File splitting completed successfully.`);
        console.log(`Total files created: ${totalFilesCreated}`);

        console.log('');
        console.log(mongoImport)

  

    } catch (error: any) {
        console.error(`Error during the split operation: ${error.message}`);
    }
}