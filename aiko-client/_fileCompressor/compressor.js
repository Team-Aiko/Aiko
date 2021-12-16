import JSZip from 'jszip';
import JSZipUtils from 'jszip-utils';
import { saveAs } from 'file-saver';

export function compressFiles(zipName, urls) {
    try {
        const zip = new JSZip();
        let cnt = 0;

        urls.forEach((url) => {
            JSZipUtils.getBinaryContent(url, (err, data) => {
                if (err) throw err;

                zip.file(fileName, data, { binary: true });
                cnt += 1;

                if (cnt === fileNames.length) {
                    zip.generateAsync({ type: 'blob' }).then((content) => {
                        saveAs(content, zipName);
                    });
                }
            });
        });
    } catch (err) {
        console.error(err);
        throw err;
    }
}
