console.log("--- SCRIPT.JS STARTED ---");

function getJsonData(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        try {
            return JSON.parse(element.textContent || element.innerText);
        } catch (e) {
            console.error(`Error parsing JSON from #${elementId}:`, e);
            return null;
        }
    }
    console.error(`Element #${elementId} not found for JSON data.`);
    return null;
}

const appLocalesData = getJsonData("localesData");
const languageData = getJsonData("languageData");

const L = appLocalesData || {};
const currentLang = (languageData && languageData.currentLang) ? languageData.currentLang : "ru";

console.log("Loaded locales:", L);
console.log("Current language:", currentLang);

document.addEventListener('DOMContentLoaded', function () {
    console.log("--- DOMCONTENTLOADED ---");
    // ... (все const объявления элементов остаются такими же)
    const form = document.getElementById('testgenForm');
    const requirementsText = document.getElementById('requirementsText');
    const charCount = document.getElementById('charCount');
    const pdfFile = document.getElementById('pdfFile');
    const customPromptTextarea = document.getElementById('customPrompt');
    const textInputContainer = document.getElementById('textInputContainer');
    const fileInputContainer = document.getElementById('fileInputContainer');
    const chooseFileLabel = document.getElementById('chooseFileLabel');
    const selectedFileInfo = document.getElementById('selectedFileInfo');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const removeFileButton = document.getElementById('removeFileButton');
    const fileProcessingIndicator = document.querySelector('.file-processing-indicator');
    const processingText = document.getElementById('processingText');
    const selectedFileIsText = document.getElementById('selectedFileIsText'); // Для текста "Выбран файл:"

    const generateButton = document.getElementById('generateButton');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessages = document.getElementById('errorMessages');
    
    const resultsSection = document.getElementById('resultsSection');
    const resultsTableBody = document.getElementById('resultsTable')?.getElementsByTagName('tbody')[0];
    const typeFilter = document.getElementById('typeFilter');
    
    const advancedOptionsToggle = document.getElementById('advancedOptionsToggle');
    const promptSection = document.getElementById('promptSection');

    // Обновляем placeholder если он не был установлен через Jinja (на всякий случай)
    if (customPromptTextarea && L.custom_prompt_placeholder_example) {
         if (!customPromptTextarea.placeholder) customPromptTextarea.placeholder = L.custom_prompt_placeholder_example;
    }
    // Обновляем текст кнопки, если он не был установлен через Jinja
    if (chooseFileLabel && L.choose_file_button && chooseFileLabel.textContent.trim() === "Файл не выбран") { // Проверяем, чтобы не перезаписать, если уже локализовано
        chooseFileLabel.textContent = L.choose_file_button;
    }
    if (processingText && L.file_processing_text && processingText.textContent.trim() === "Обработка...") {
        processingText.textContent = L.file_processing_text;
    }
     if (selectedFileIsText && L.selected_file_is && selectedFileIsText.textContent.trim() === "Выбран файл:") {
        selectedFileIsText.textContent = L.selected_file_is;
    }


    let allTestCases = [];
    let currentSortColumn = null;
    let currentSortOrder = 'asc';

    function switchToTextInputMode() {
        console.log("Attempting to switch to Text Input Mode");
        if (textInputContainer) textInputContainer.classList.remove('hidden');
        if (fileInputContainer) fileInputContainer.classList.remove('hidden');
        
        if (chooseFileLabel) {
            chooseFileLabel.classList.remove('hidden');
            chooseFileLabel.textContent = L.choose_file_button || 'Файл не выбран'; // Используем локаль
        }
        
        if (selectedFileInfo) selectedFileInfo.style.display = 'none';
        
        if (pdfFile) pdfFile.value = '';
        clearErrors();
        console.log(" switchToTextInputMode FINISHED");
    }

    function switchToFileInputMode(fileName) {
        console.log("Attempting to switch to File Input Mode with file:", fileName);
        if (textInputContainer) textInputContainer.classList.add('hidden');
        if (requirementsText) requirementsText.value = '';
        if (charCount) charCount.textContent = (L.char_counter_template || '{count} / 5000').replace('{count}', '0');


        if (fileInputContainer) fileInputContainer.classList.remove('hidden');
        if (chooseFileLabel) chooseFileLabel.classList.add('hidden');
        
        if (selectedFileInfo) selectedFileInfo.style.display = 'block';
        if (fileNameDisplay) fileNameDisplay.textContent = fileName;
        
        if (fileProcessingIndicator) {
            fileProcessingIndicator.style.display = 'flex';
            fileProcessingIndicator.classList.remove('success');
            const spinnerEl = fileProcessingIndicator.querySelector('.spinner');
            if (spinnerEl) spinnerEl.style.display = 'inline-block';
            if (processingText) processingText.textContent = L.file_processing_text || 'Обработка...';
        }
        
        setTimeout(() => {
            console.log("Inside switchToFileInputMode setTimeout");
            if (fileProcessingIndicator) {
                const spinnerEl = fileProcessingIndicator.querySelector('.spinner');
                if (spinnerEl) spinnerEl.style.display = 'none';
                if (processingText) processingText.textContent = L.file_chosen_text || 'Файл выбран!';
                fileProcessingIndicator.classList.add('success');
            }
        }, 700);
        clearErrors();
        console.log("switchToFileInputMode FINISHED");
    }

    if (requirementsText && charCount) { // Добавил charCount в проверку
        requirementsText.addEventListener('input', () => {
            const count = requirementsText.value.length;
            charCount.textContent = (L.char_counter_template || '{count} / 5000').replace('{count}', count);
            if (count > 0) {
                if (selectedFileInfo && selectedFileInfo.style.display === 'block') {
                    switchToTextInputMode();
                }
            }
        });
        // Инициализация счетчика символов
        charCount.textContent = (L.char_counter_template || '{count} / 5000').replace('{count}', requirementsText.value.length);

    }

    if (pdfFile) {
        pdfFile.addEventListener('change', (event) => {
            const files = event.target.files;
            if (files && files.length > 0) {
                switchToFileInputMode(files[0].name);
            } else {
                if (selectedFileInfo && selectedFileInfo.style.display === 'block') {
                    switchToTextInputMode();
                }
            }
        });
    }

    if (removeFileButton) {
        removeFileButton.addEventListener('click', () => {
            switchToTextInputMode();
        });
    }
    
    // --- Advanced Options Toggle ---
    if (advancedOptionsToggle && promptSection) {
        // ... (код без изменений)
         advancedOptionsToggle.addEventListener('click', () => {
            const isHidden = promptSection.style.display === 'none' || !promptSection.style.display;
            promptSection.style.display = isHidden ? 'block' : 'none';
            const toggleIcon = advancedOptionsToggle.querySelector('.toggle-icon');
            if (toggleIcon) toggleIcon.textContent = isHidden ? '▴' : '▾';
        });
        const toggleIcon = advancedOptionsToggle.querySelector('.toggle-icon');
         if (toggleIcon && promptSection && promptSection.style.display === 'none') {
            toggleIcon.textContent = '▾';
        } else if (toggleIcon) {
            toggleIcon.textContent = '▴';
        }
    }

    // --- Form Submission ---
    if (form) {
        form.addEventListener('submit', async function (event) {
            // ... (логика проверки и formData без изменений) ...
            event.preventDefault();
            clearErrors();
            if (resultsSection) resultsSection.style.display = 'none';
            if (resultsTableBody) resultsTableBody.innerHTML = '';
            allTestCases = [];

            const textContent = requirementsText ? requirementsText.value.trim() : '';
            const fileIsSelectedAndActive = pdfFile && pdfFile.files && pdfFile.files.length > 0 &&
                selectedFileInfo && selectedFileInfo.style.display === 'block';

            let sourceIsText = false;
            let sourceIsFile = false;

            if (fileIsSelectedAndActive) {
                sourceIsFile = true;
            } else if (textContent.length > 0) {
                sourceIsText = true;
            }

            if (!sourceIsText && !sourceIsFile) {
                showError((L.error_no_input || 'Пожалуйста, введите текст требований или загрузите PDF файл.'));
                return;
            }

            if (sourceIsText && textContent.length > 5000) {
                 showError((L.error_text_too_long_5000 || 'Текст требований не должен превышать 5000 символов.'));
                return;
            }
            // ... (остальная часть submit без изменений в логике, но можно обновить сообщения об ошибках ниже)

            if (loadingIndicator) loadingIndicator.style.display = 'block';
            if (generateButton) generateButton.disabled = true;
            const btnTextSpan = generateButton?.querySelector('.btn-text');
            const btnLoaderSpan = generateButton?.querySelector('.btn-loader');
            if (btnTextSpan) btnTextSpan.style.display = 'none';
            if (btnLoaderSpan) btnLoaderSpan.style.display = 'inline-block';

            const formData = new FormData();
            if (sourceIsText) {
                formData.append('requirements_text', textContent);
            } else if (sourceIsFile) {
                formData.append('pdf_file', pdfFile.files[0]);
            }
            formData.append('lang', currentLang); // Отправляем текущий язык на бэкенд

            let userPrompt = customPromptTextarea ? customPromptTextarea.value.trim() : '';
            if (userPrompt) formData.append('custom_prompt', userPrompt);

            try {
                const response = await fetch('/generate', {
                    method: 'POST',
                    body: formData,
                });
                if (!response.ok) {
                    const errorDetail = await response.json().catch(() => ({ detail: 'Unknown server error.' }));
                    // Ошибка уже должна быть локализована бэкендом
                    throw new Error(errorDetail.detail || 'Server error'); 
                }
                const data = await response.json();
                 if (data.message && !data.test_cases?.length) { // Если есть сообщение от бэкенда (например, о неудачном парсинге)
                    showError(data.message); // Показываем локализованное сообщение от бэкенда
                    allTestCases = [];
                } else {
                    allTestCases = data.test_cases || [];
                }
                displayTestCases(allTestCases);
                if (resultsSection && allTestCases.length > 0) resultsSection.style.display = 'block';
                else if (!allTestCases.length && !data.message) { // Если нет тест-кейсов и нет сообщения об ошибке парсинга
                     showError(L.no_test_cases_found || "Тест-кейсы не найдены или не удалось сгенерировать.");
                }

            } catch (error) {
                const errorGeneratingText = (L.error_generating || "Ошибка при генерации: {error_message}");
                showError(errorGeneratingText.replace('{error_message}', error.message));
            } finally {
                if (loadingIndicator) loadingIndicator.style.display = 'none';
                if (generateButton) generateButton.disabled = false;
                if (btnTextSpan) btnTextSpan.style.display = 'inline';
                if (btnLoaderSpan) btnLoaderSpan.style.display = 'none';
            }
        });
    }

    function displayTestCases(testCases) {
        if (!resultsTableBody) return;
        resultsTableBody.innerHTML = '';
        if (!testCases || testCases.length === 0) {
            // Если есть сообщение об ошибке (например, от бэкенда о неудачном парсинге), оно уже показано
            // Если нет, показываем стандартное "не найдено"
            if (!errorMessages.textContent) { 
                const row = resultsTableBody.insertRow();
                const cell = row.insertCell();
                cell.colSpan = 4;
                cell.textContent = L.no_test_cases_found || "Тест-кейсы не найдены или не удалось сгенерировать.";
                cell.style.textAlign = 'center';
            }
            return;
        }
        // ... (остальная часть displayTestCases без изменений)
        testCases.forEach(tc => {
            const row = resultsTableBody.insertRow();
            row.insertCell().innerHTML = tc['Название'] ? tc['Название'].replace(/\n/g, '<br>') : '-';
            const stepsCell = row.insertCell();
            if (tc['Шаги']) {
                const stepsList = document.createElement('ol');
                stepsList.style.paddingLeft = '20px';
                stepsList.style.margin = '0';
                const stepsArray = tc['Шаги'].split('\n').map(step => step.trim()).filter(step => step);
                stepsArray.forEach(stepText => {
                    const cleanedStepText = stepText.replace(/^[\d\*\-\+\.]+\s*/, '');
                    if (cleanedStepText) {
                        const listItem = document.createElement('li');
                        listItem.textContent = cleanedStepText;
                        stepsList.appendChild(listItem);
                    }
                });
                if (stepsList.children.length > 0) stepsCell.appendChild(stepsList);
                else stepsCell.textContent = '-';
            } else {
                stepsCell.textContent = '-';
            }
            row.insertCell().innerHTML = tc['Ожидаемый результат'] ? tc['Ожидаемый результат'].replace(/\n/g, '<br>') : '-';
            row.insertCell().textContent = tc['Тип'] || (L.filter_option_undefined || 'Не определен'); // Локализуем "Не определен" если нужно
        });
    }

    if (typeFilter) {
        // Обновляем тексты опций фильтра при загрузке
        const options = typeFilter.options;
        if (options[0]) options[0].textContent = L.filter_option_all || "Все";
        // Значения "Позитивный", "Негативный", "Не определен" используются для фильтрации данных,
        // поэтому их не меняем, только отображаемый текст, если это разные вещи.
        // В данном случае, они совпадают с ключами локализации, поэтому можно обновить.
        if (options[1]) options[1].textContent = L.filter_option_positive || "Позитивные";
        if (options[2]) options[2].textContent = L.filter_option_negative || "Негативные";
        if (options[3]) options[3].textContent = L.filter_option_undefined || "Не определен";


        typeFilter.addEventListener('change', function () {
            const filterValue = this.value; // value остается 'Позитивный', 'Негативный'
            const filteredCases = filterValue === 'all' ?
                allTestCases :
                allTestCases.filter(tc => (tc['Тип'] || (L.filter_option_undefined || 'Не определен')) === filterValue);
            displayTestCases(filteredCases);
        });
    }
    
    // ... (остальной JS: сортировка, экспорт - можно локализовать сообщения об ошибках)

    function getFilteredAndSortedCases() {
        // ... (без изменений в логике, но значения для фильтрации используются как есть)
        const filterValue = typeFilter ? typeFilter.value : 'all';
        let casesToExport = filterValue === 'all' ?
            [...allTestCases] :
            allTestCases.filter(tc => (tc['Тип'] || (L.filter_option_undefined || 'Не определен')) === filterValue);

        if (currentSortColumn) {
             casesToExport.sort((a, b) => {
                let valA = a[currentSortColumn] != null ? String(a[currentSortColumn]).toUpperCase() : '';
                let valB = b[currentSortColumn] != null ? String(b[currentSortColumn]).toUpperCase() : '';
                if (valA < valB) return currentSortOrder === 'asc' ? -1 : 1;
                if (valA > valB) return currentSortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return casesToExport;
    }

    async function exportData(url, fileType, cases) {
        if (!cases || cases.length === 0) {
            showError(L.error_export_no_data || "Нет данных для экспорта.");
            return;
        }
        try {
            // ... (fetch без изменений)
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ test_cases: cases }) // Данные уже на языке генерации
            });
            if (!response.ok) {
                const errorText = await response.text().catch(() => `Unknown export error ${fileType}`);
                throw new Error(`Server error (${response.status}): ${errorText}`);
            }
            // ... (скачивание файла без изменений)
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = downloadUrl;
            a.download = `test_cases.${fileType}`; // Имя файла не локализуем
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            a.remove();
        } catch (error) {
            const exportErrorText = (fileType === 'csv' ? L.error_export_csv : L.error_export_excel) || "Ошибка экспорта {fileType}: {error_message}";
            showError(
                exportErrorText
                .replace('{fileType}', fileType.toUpperCase())
                .replace('{error_message}', error.message)
            );
        }
    }
    
    const exportCsvBtn = document.getElementById('exportCsvButton');
    const exportExcelBtn = document.getElementById('exportExcelButton');

    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', () => exportData('/export_csv', 'csv', getFilteredAndSortedCases()));
    }
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', () => exportData('/export_excel', 'xlsx', getFilteredAndSortedCases()));
    }


    function showError(message) {
        if (errorMessages) {
            errorMessages.textContent = message;
            errorMessages.style.display = 'block';
        }
    }
    function clearErrors() {
        if (errorMessages) {
            errorMessages.textContent = '';
            errorMessages.style.display = 'none';
        }
    }

    // Initial UI state
    switchToTextInputMode(); // Это также вызовет обновление текстов кнопок на основе L
    console.log("Initial UI setup complete.");
});