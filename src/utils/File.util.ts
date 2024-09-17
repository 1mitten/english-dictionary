import * as fs from 'fs';
import * as path from 'path';

/**
 * Reads a large JSON file where all records are nested inside one top-level object, 
 * splits it into multiple files based on batch size, and writes each batch to a separate output file.
 * @param inputFile - The path to the input JSON file.
 * @param batchSize - The number of top-level objects (key-value pairs) per batch/file.
 */
export async function splitJsonFile(inputFile: string, batchSize: number = 40000) {
    try {
        // Step 1: Read the raw content of the file as a string
        const fileContent = fs.readFileSync(inputFile, 'utf-8');
        console.log(`File content read successfully.`);

        // Step 2: Parse the stringified JSON content into a JavaScript object
        let data;
        try {
            data = JSON.parse(fileContent);  // Expecting the file to contain a valid JSON object
        } catch (parseError: any) {
            console.error(`Error parsing JSON file. Ensure it contains valid JSON. Error: ${parseError.message}`);
            return;
        }

        // Step 3: Assume that all the records are inside data[0] as a single object
        if (!Array.isArray(data) || !data[0]) {
            console.error('The JSON file should contain an array with a top-level object at data[0].');
            return;
        }

        const topLevelObject = data[0];  // Assuming all records are within this object

        // Step 4: Convert the top-level object into an array of key-value pairs
        const entries = Object.entries(topLevelObject);  // This creates an array of [key, value] pairs
        console.log(`Total number of records (key-value pairs) in the object: ${entries.length}`);

        // Step 5: Loop through the entries and split them into batches
        let fileIndex = 1;
        let totalFilesCreated = 0;

        for (let startIndex = 0; startIndex < entries.length; startIndex += batchSize) {
            // Calculate end index for the current batch
            const endIndex = Math.min(startIndex + batchSize, entries.length);

            // Slice the array to get the batch of records from startIndex to endIndex
            const batchEntries = entries.slice(startIndex, endIndex);

            // Convert batch back to an object
            const batchObject = Object.fromEntries(batchEntries);

            console.log(`Writing records from index ${startIndex} to ${endIndex - 1} (Total: ${batchEntries.length} records)`);

            // Step 6: Write the batch to a separate output file
            const outputFileName = `data_${fileIndex}.json`;
            try {
                fs.writeFileSync(outputFileName, JSON.stringify(batchObject, null, 2));
                console.log(`Batch written to ${outputFileName} successfully.`);
                totalFilesCreated++;
            } catch (writeError: any) {
                console.error(`Error writing batch to file ${outputFileName}: ${writeError.message}`);
            }

            fileIndex++;
        }

        console.log(`File splitting completed successfully.`);
        console.log(`Total files created: ${totalFilesCreated}`);
    } catch (error: any) {
        console.error(`Error during the split operation: ${error.message}`);
    }
}
