function uploadScript() { 
    let fileInput = $('#fileInput');
    let fileLabel = $('#fileLabel');
    let uploadButton = $('#upload-btn');
    let downloadButton = $('#download-btn');
    let uploadedFile;

    fileInput.on('change', event => {
        $('#result-container').empty(); // Remove previous messages

        uploadedFile = event.target.files[0];
        let fileName = event.target.files[0].name;
        fileLabel.text(fileName);
    });

    uploadButton.on('click', event => {
        if (correctFile(uploadedFile)) {
            uploadProcessedFile(uploadedFile);
        }
    });

    downloadButton.on('click', event => {
        if (correctFile(uploadedFile)) {    
             downloadProcessedFile(uploadedFile);
        }
    });
}

function uploadProcessedFile(uploadedFile) {
    let loading = $('#loading-div');
    loading.removeClass("invisible")

    readFileAsync(uploadedFile)
        .then( (file) => {
            let processed_content = processHAR(file);

            if (processed_content) {
                // Get client IP from IP-API.
                $.getJSON('http://ip-api.com/json?callback=?', function(data) {
                    processed_content.ip_info = data; 
                }).then(() => {
                    // POST to server.
                    let data = JSON.stringify(processed_content);
                    $.ajax({
                        type: 'POST',
                        url: '/dashboard/api/upload',
                        ContentType: 'application/json',
                        data: {'data': data}
                    }).done(error => {
                        loading.addClass("invisible");
                        showUploadErrors(error);
                    });
                })    
            }
            else {
                loading.addClass("invisible");
                showUploadErrors('File could not be read. Please try another file!');
            }
        });
}

function downloadProcessedFile(uploadedFile) {
    let new_file_name = uploadedFile.name.split('.')[0] + '_processed.har';
    readFileAsync(uploadedFile)
        .then( (file) => {
            processed_content = processHAR(file);
            const blob = new Blob([ JSON.stringify(processed_content) ], { type: 'application/json' });
            downloadBlob(blob, new_file_name);
        });  
}

function correctFile(file) {
    if (!file) {
        alert('Please choose a file first.');
        return false;
    }

    if (!file.name.includes('.har')) {
        alert('File must have HAR extension.');
        return false;
    }

    return true;
}

function processHAR(file) {
    processed_content = {
        processed: true,
        entries: []
    };

    try {
        let json_file = JSON.parse(file);
        if (json_file.processed) {
            return json_file;
        }
        let entries = json_file.log.entries;
        entries.forEach(entry => {
            let new_entry = createEntry(entry);
            processed_content.entries.push(new_entry);
        });
    } catch (error) {
        console.log(error);
        processed_content = null;
    }
    
    return processed_content;
}

function readFileAsync(inputFile) {
    const temporaryFileReader = new FileReader();

    return new Promise((resolve, reject) => {
        temporaryFileReader.onerror = () => {
            temporaryFileReader.abort();
            reject(new DOMException("Problem parsing input file."));
        };

        temporaryFileReader.onload = () => {
            resolve(temporaryFileReader.result);
        };
        temporaryFileReader.readAsText(inputFile);
    });
}

// Keep only required data (not personal info)
function createEntry(entry) {
    let entry_result = {
        startedDateTime: entry.startedDateTime,
        serverIPAddress: entry.serverIPAddress,
        timings_wait: entry.timings.wait,
        request: {
            method: entry.request.method,
            url: keepDomainUrl(entry.request.url),
            headers: unwrapHeaders(entry.request.headers)
        },
        response: {
            status: entry.response.status,
            statusText: entry.response.statusText,
            headers: unwrapHeaders(entry.response.headers)
        }
    }

    return entry_result;
}

function keepDomainUrl(url) {
    return new URL(url).hostname;
}

function unwrapHeaders(headers) {
    // Find header values if they exist
    const findHeaderValue = (header_name) => {
        let header = headers.find(header => header.name == header_name)
        if (header) {
            if (header_name == 'content-type') {
                return header.value.split(';')[0];
            }
            else {
                return header.value;
            } 
        }
        return null;
    }
    
    let headers_result = {
        content_type: findHeaderValue('content-type'),
        cache_control: findHeaderValue('cache-control'),
        pragma: findHeaderValue('pragma'),
        expires: findHeaderValue('expires'),
        age: findHeaderValue('age'),
        last_modified: findHeaderValue('last-modified'),
        host: findHeaderValue('host')
    }

    return headers_result;
}

function downloadBlob(blob, filename) {
  // Create an object URL for the blob object
  const url = URL.createObjectURL(blob);
  
  // Create a new anchor element
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  
  // Click handler that releases the object URL after the element has been clicked
  const clickHandler = () => {
    setTimeout(() => {
      URL.revokeObjectURL(url);
      this.removeEventListener('click', clickHandler);
    }, 150);
  };

  a.addEventListener('click', clickHandler, false);
  a.click();
}

function showUploadErrors(error) {
    let result_container = $('#result-container');
    result_container.empty();

    if (error.length === 0) {
        result_container.append('<p class="alert alert-success text-center">Upload Succesful.</p>')
    }
    else {
        result_container.append(`<p class="alert alert-danger text-center">${error}</p>`)
    }
}