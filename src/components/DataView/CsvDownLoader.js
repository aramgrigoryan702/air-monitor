
import {isUndefined, isString, keyBy, sortBy} from "lodash";

function CsvDownLoader(columns, data, options) {
    const replaceDoubleQuoteInString = columnData =>
        typeof columnData === 'string' ? columnData.replace(/\"/g, '""') : columnData;

    const CSVHead =
        columns
            .reduce(
                (soFar, column) =>
                    column.download
                        ? soFar + '"' + replaceDoubleQuoteInString(column.label) + '"' + options.downloadOptions.separator
                        : soFar,
                '',
            )
            .slice(0, -1) + '\r\n';

    const CSVBody = data
        .reduce(
            (soFar, row) =>
                soFar +
                '"' +
                columns
                    .filter((field, index) => field.download)
                    .map(field => {
                        let val='';
                        if(field.getReportValue){
                            val= field.getReportValue(row.data);
                        } else if(field.filter){
                            val= field.filter(row.data);
                        } else if(field.render){
                            let renderedVal = field.render(row.data);
                            val= isString(renderedVal)? renderedVal: (row.data[field.name] ? row.data[field.name].toString(): '');
                        } else if(field.name){
                            val= row.data[field.name] ? row.data[field.name].toString(): '';
                        }
                        return replaceDoubleQuoteInString(val);
                    })
                    .join('"' + options.downloadOptions.separator + '"') +
                '"\r\n',
            [],
        )
        .trim();

    const csv = `${CSVHead}${CSVBody}`;
    const blob = new Blob([csv], { type: 'text/csv' });

    /* taken from react-csv */
    if (navigator && navigator.msSaveOrOpenBlob) {
        navigator.msSaveOrOpenBlob(blob, options.downloadOptions.filename);
    } else {
        const dataURI = `data:text/csv;charset=utf-8,${csv}`;

        const URL = window.URL || window.webkitURL;
        const downloadURI = typeof URL.createObjectURL === 'undefined' ? dataURI : URL.createObjectURL(blob);

        let link = document.createElement('a');
        link.setAttribute('href', downloadURI);
        link.setAttribute('download', options.downloadOptions.filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

export default CsvDownLoader;
