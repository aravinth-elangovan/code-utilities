document.addEventListener('DOMContentLoaded', function() {
    // Initialize CodeMirror editors
    const inputEditor = CodeMirror.fromTextArea(document.getElementById('code-input'), {
        lineNumbers: true,
        mode: 'javascript',
        theme: 'monokai',
        indentUnit: 4,
        smartIndent: true,
        tabSize: 4,
        indentWithTabs: false,
        lineWrapping: true
    });

    const outputEditor = CodeMirror.fromTextArea(document.getElementById('code-output'), {
        lineNumbers: true,
        mode: 'javascript',
        theme: 'monokai',
        readOnly: true,
        lineWrapping: true
    });

    // Current tool state
    let currentTool = 'lint';
    
    // DOM elements
    const languageSelect = document.getElementById('language-select');
    const processBtn = document.getElementById('process-btn');
    const copyBtn = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');
    const currentToolTitle = document.getElementById('current-tool');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Instruction panels
    const lintInstructions = document.getElementById('lint-instructions');
    const minifyInstructions = document.getElementById('minify-instructions');
    const beautifyInstructions = document.getElementById('beautify-instructions');

    // Update editor mode when language changes
    languageSelect.addEventListener('change', function() {
        updateEditorMode(this.value);
    });

    // Tool navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Update current tool
            currentTool = this.getAttribute('data-tool');
            currentToolTitle.textContent = capitalizeFirstLetter(currentTool) + ' Code';
            
            // Show appropriate instructions
            lintInstructions.style.display = currentTool === 'lint' ? 'block' : 'none';
            minifyInstructions.style.display = currentTool === 'minify' ? 'block' : 'none';
            beautifyInstructions.style.display = currentTool === 'beautify' ? 'block' : 'none';
        });
    });

    // Process button click
    processBtn.addEventListener('click', function() {
        const code = inputEditor.getValue();
        const language = languageSelect.value;
        
        if (!code.trim()) {
            alert('Please enter some code to process.');
            return;
        }
        
        try {
            let result;
            
            // Check if JSON minification is being attempted
            if (language === 'json' && currentTool === 'minify') {
                showNotification('Minification for JSON is not fully supported yet. Basic whitespace removal applied.', 'warning');
            } else {
                // Hide notification if it's showing
                document.getElementById('notification-area').style.display = 'none';
            }
            
            switch(currentTool) {
                case 'lint':
                    result = lintCode(code, language);
                    break;
                case 'minify':
                    result = minifyCode(code, language);
                    break;
                case 'beautify':
                    result = beautifyCode(code, language);
                    break;
            }
            
            outputEditor.setValue(result);
        } catch (error) {
            outputEditor.setValue('Error: ' + error.message);
        }
    });

    // Copy button click
    copyBtn.addEventListener('click', function() {
        const output = outputEditor.getValue();
        if (!output) {
            alert('No output to copy.');
            return;
        }
        
        navigator.clipboard.writeText(output)
            .then(() => {
                // Change button text temporarily
                const originalText = this.textContent;
                this.textContent = 'Copied!';
                setTimeout(() => {
                    this.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                alert('Failed to copy: ' + err);
            });
    });

    // Clear button click
    clearBtn.addEventListener('click', function() {
        inputEditor.setValue('');
        outputEditor.setValue('');
    });

    // Helper function to update editor mode
    function updateEditorMode(language) {
        let mode;
        
        switch(language) {
            case 'javascript':
                mode = 'javascript';
                break;
            case 'html':
                mode = 'htmlmixed';
                break;
            case 'css':
                mode = 'css';
                break;
            case 'python':
                mode = 'python';
                break;
            case 'java':
                mode = 'text/x-java';
                break;
            case 'go':
                mode = 'go';
                break;
            case 'json':
                mode = 'application/json';
                break;
            case 'xml':
                mode = 'xml';
                break;
            case 'ruby':
                mode = 'ruby';
                break;
            case 'rust':
                mode = 'rust';
                break;
            case 'php':
                mode = 'php';
                break;
            case 'solidity':
                mode = 'solidity';
                break;
            default:
                mode = 'javascript';
        }
        
        inputEditor.setOption('mode', mode);
        outputEditor.setOption('mode', mode);
    }

    // Lint code function
    function lintCode(code, language) {
        let result = '';
        
        switch(language) {
            case 'javascript':
                // Use JSHint for JavaScript linting
                if (typeof JSHINT === 'undefined') {
                    return 'JSHint library not loaded. Cannot lint JavaScript.';
                }
                
                JSHINT(code);
                if (JSHINT.errors.length === 0) {
                    return 'No errors found!';
                }
                
                result = 'Linting Results:\n\n';
                JSHINT.errors.forEach((error, index) => {
                    if (error) {
                        result += `${index + 1}. Line ${error.line}, Col ${error.character}: ${error.reason}\n`;
                    }
                });
                break;
                
            case 'json':
                try {
                    // Use JSONLint for JSON validation
                    if (typeof jsonlint === 'undefined') {
                        // Fallback to JSON.parse
                        JSON.parse(code);
                        return 'JSON is valid!';
                    }
                    
                    jsonlint.parse(code);
                    return 'JSON is valid!';
                } catch (e) {
                    return 'JSON Error: ' + e.message;
                }
            
            case 'python':
                // Basic Python syntax check
                try {
                    // Check for common Python syntax errors
                    const errors = checkPythonSyntax(code);
                    if (errors.length === 0) {
                        return 'No obvious syntax errors found. For complete linting, use a dedicated Python linter.';
                    }
                    
                    result = 'Potential Python Issues:\n\n';
                    errors.forEach((error, index) => {
                        result += `${index + 1}. ${error}\n`;
                    });
                } catch (e) {
                    return 'Error checking Python syntax: ' + e.message;
                }
                break;
                
            case 'go':
                // Basic Go syntax check
                try {
                    const errors = checkGoSyntax(code);
                    if (errors.length === 0) {
                        return 'No obvious syntax errors found. For complete linting, use a dedicated Go linter.';
                    }
                    
                    result = 'Potential Go Issues:\n\n';
                    errors.forEach((error, index) => {
                        result += `${index + 1}. ${error}\n`;
                    });
                } catch (e) {
                    return 'Error checking Go syntax: ' + e.message;
                }
                break;
                
            case 'ruby':
            case 'rust':
            case 'php':
            case 'solidity':
                return `Basic ${language} syntax check: For complete linting, please use a dedicated ${language} linter.`;
                
            default:
                result = 'Linting for ' + language + ' is not supported yet.';
        }
        
        return result;
    }

    // Minify code function
    function minifyCode(code, language) {
        switch(language) {
            case 'javascript':
                // Basic JS minification (remove comments, whitespace)
                return code
                    .replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '') // Remove comments
                    .replace(/^\s*\n/gm, '') // Remove empty lines
                    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                    .replace(/\s*([{}:;,=+\-*\/])\s*/g, '$1') // Remove spaces around operators
                    .trim();
                
            case 'html':
                // Basic HTML minification
                return code
                    .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
                    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                    .replace(/>\s+</g, '><') // Remove spaces between tags
                    .replace(/\s+>/g, '>') // Remove spaces before closing bracket
                    .replace(/<\s+/g, '<') // Remove spaces after opening bracket
                    .trim();
                
            case 'css':
                // Basic CSS minification
                return code
                    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove CSS comments
                    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                    .replace(/\s*([{}:;,])\s*/g, '$1') // Remove spaces around special chars
                    .replace(/;\}/g, '}') // Remove unnecessary semicolons
                    .trim();
                
            case 'python':
                // Python minification
                return code
                    .replace(/\s*#.*$/gm, '') // Remove comments
                    .replace(/^\s*\n/gm, '') // Remove empty lines
                    .replace(/[\t ]+/g, ' ') // Replace multiple spaces/tabs with single space
                    .replace(/\s*:\s*/g, ':') // Remove spaces around colons
                    .replace(/\s*,\s*/g, ',') // Remove spaces around commas
                    .replace(/\s*=\s*/g, '=') // Remove spaces around equals
                    .trim();
                
            case 'go':
                // Go minification
                return code
                    .replace(/\/\/.*$/gm, '') // Remove single-line comments
                    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
                    .replace(/^\s*\n/gm, '') // Remove empty lines
                    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                    .replace(/\s*([{}():;,=+\-*\/])\s*/g, '$1') // Remove spaces around operators and punctuation
                    .trim();
                
            case 'ruby':
                // Ruby minification
                return code
                    .replace(/\s*#.*$/gm, '') // Remove comments
                    .replace(/^\s*\n/gm, '') // Remove empty lines
                    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                    .replace(/\s*([{}():;,=+\-*\/|&])\s*/g, '$1') // Remove spaces around operators
                    .trim();
                
            case 'rust':
                // Rust minification
                return code
                    .replace(/\/\/.*$/gm, '') // Remove single-line comments
                    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
                    .replace(/^\s*\n/gm, '') // Remove empty lines
                    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                    .replace(/\s*([{}():;,=+\-*\/|&<>!])\s*/g, '$1') // Remove spaces around operators
                    .trim();
                
            case 'php':
                // PHP minification
                return code
                    .replace(/\/\/.*$/gm, '') // Remove single-line comments
                    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
                    .replace(/^\s*\n/gm, '') // Remove empty lines
                    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                    .replace(/\s*([{}():;,=+\-*\/|&<>!])\s*/g, '$1') // Remove spaces around operators
                    .trim();
                
            case 'solidity':
                // Solidity minification
                return code
                    .replace(/\/\/.*$/gm, '') // Remove single-line comments
                    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
                    .replace(/^\s*\n/gm, '') // Remove empty lines
                    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                    .replace(/\s*([{}():;,=+\-*\/|&<>!])\s*/g, '$1') // Remove spaces around operators
                    .trim();
                
            default:
                return code.replace(/\s+/g, '').trim();
        }
    }

    // Beautify code function
    function beautifyCode(code, language) {
        const options = {
            indent_size: 2,
            indent_char: ' ',
            max_preserve_newlines: 2,
            preserve_newlines: true,
            keep_array_indentation: false,
            break_chained_methods: false,
            indent_scripts: 'normal',
            brace_style: 'collapse',
            space_before_conditional: true,
            unescape_strings: false,
            jslint_happy: false,
            end_with_newline: false,
            wrap_line_length: 0,
            indent_inner_html: false,
            comma_first: false,
            e4x: false,
            indent_empty_lines: false
        };
        
        switch(language) {
            case 'javascript':
                if (typeof js_beautify === 'undefined') {
                    return 'JavaScript beautifier library not loaded.';
                }
                return js_beautify(code, options);
                
            case 'html':
                if (typeof html_beautify === 'undefined') {
                    return 'HTML beautifier library not loaded.';
                }
                return html_beautify(code, options);
                
            case 'css':
                if (typeof css_beautify === 'undefined') {
                    return 'CSS beautifier library not loaded.';
                }
                return css_beautify(code, options);
                
            case 'json':
                try {
                    // Parse and stringify with indentation
                    const obj = JSON.parse(code);
                    return JSON.stringify(obj, null, 2);
                } catch (e) {
                    return 'Error parsing JSON: ' + e.message;
                }
                
            case 'python':
                return formatPythonCode(code);
                
            case 'go':
                return formatGoCode(code);
                
            case 'ruby':
                return formatRubyCode(code);
                
            case 'rust':
                return formatRustCode(code);
                
            case 'php':
                return formatPhpCode(code);
                
            case 'solidity':
                return formatSolidityCode(code);
                
            default:
                return 'Beautification for ' + language + ' is not supported yet.';
        }
    }

    // Helper function to capitalize first letter
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Python syntax checker
    function checkPythonSyntax(code) {
        const errors = [];
        
        // Check for mismatched parentheses
        const openParens = (code.match(/\(/g) || []).length;
        const closeParens = (code.match(/\)/g) || []).length;
        if (openParens !== closeParens) {
            errors.push(`Mismatched parentheses: ${openParens} opening vs ${closeParens} closing`);
        }
        
        // Check for mismatched brackets
        const openBrackets = (code.match(/\[/g) || []).length;
        const closeBrackets = (code.match(/\]/g) || []).length;
        if (openBrackets !== closeBrackets) {
            errors.push(`Mismatched brackets: ${openBrackets} opening vs ${closeBrackets} closing`);
        }
        
        // Check for mismatched braces
        const openBraces = (code.match(/\{/g) || []).length;
        const closeBraces = (code.match(/\}/g) || []).length;
        if (openBraces !== closeBraces) {
            errors.push(`Mismatched braces: ${openBraces} opening vs ${closeBraces} closing`);
        }
        
        // Check for common Python syntax errors
        const lines = code.split('\n');
        lines.forEach((line, index) => {
            // Check for missing colons in control structures
            if (/^\s*(if|for|while|def|class|with|try|except|finally)\s+.*[^:]\s*$/.test(line)) {
                errors.push(`Line ${index + 1}: Missing colon after control statement`);
            }
            
            // Check for invalid indentation
            if (/^\s*\t+\s*/.test(line)) {
                errors.push(`Line ${index + 1}: Mixed tabs and spaces in indentation`);
            }
        });
        
        return errors;
    }

    // Go syntax checker
    function checkGoSyntax(code) {
        const errors = [];
        
        // Check for mismatched parentheses
        const openParens = (code.match(/\(/g) || []).length;
        const closeParens = (code.match(/\)/g) || []).length;
        if (openParens !== closeParens) {
            errors.push(`Mismatched parentheses: ${openParens} opening vs ${closeParens} closing`);
        }
        
        // Check for mismatched brackets
        const openBrackets = (code.match(/\[/g) || []).length;
        const closeBrackets = (code.match(/\]/g) || []).length;
        if (openBrackets !== closeBrackets) {
            errors.push(`Mismatched brackets: ${openBrackets} opening vs ${closeBrackets} closing`);
        }
        
        // Check for mismatched braces
        const openBraces = (code.match(/\{/g) || []).length;
        const closeBraces = (code.match(/\}/g) || []).length;
        if (openBraces !== closeBraces) {
            errors.push(`Mismatched braces: ${openBraces} opening vs ${closeBraces} closing`);
        }
        
        // Check for common Go syntax errors
        const lines = code.split('\n');
        lines.forEach((line, index) => {
            // Check for missing semicolons in var declarations
            if (/^\s*var\s+\w+\s+\w+[^=;]\s*$/.test(line)) {
                errors.push(`Line ${index + 1}: Missing semicolon or initialization in var declaration`);
            }
            
            // Check for incorrect function declarations
            if (/^\s*func\s+\w+[^(]/.test(line)) {
                errors.push(`Line ${index + 1}: Incorrect function declaration syntax`);
            }
        });
        
        return errors;
    }

    // Python code formatter
    function formatPythonCode(code) {
        // Basic Python formatting
        const lines = code.split('\n');
        let formattedCode = '';
        let indentLevel = 0;
        
        lines.forEach(line => {
            // Trim trailing whitespace
            const trimmedLine = line.trimRight();
            
            // Skip empty lines
            if (trimmedLine === '') {
                formattedCode += '\n';
                return;
            }
            
            // Decrease indent for lines that end a block
            if (/^\s*(else|elif|except|finally)\b/.test(trimmedLine)) {
                indentLevel = Math.max(0, indentLevel - 1);
            }
            
            // Add proper indentation
            const indent = '    '.repeat(indentLevel);
            formattedCode += indent + trimmedLine.trim() + '\n';
            
            // Increase indent for lines that start a new block
            if (/:$/.test(trimmedLine)) {
                indentLevel++;
            }
        });
        
        return formattedCode.trim();
    }

    // Go code formatter
    function formatGoCode(code) {
        // Split the code into lines
        const lines = code.split('\n');
        let formattedCode = '';
        let indentLevel = 0;
        let inImportBlock = false;
        let inStructBlock = false;
        
        // Process each line
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trimRight();
            
            // Skip empty lines but preserve them
            if (line === '') {
                formattedCode += '\n';
                continue;
            }
            
            // Handle import blocks
            if (line.trim() === 'import (') {
                formattedCode += 'import (\n';
                inImportBlock = true;
                indentLevel++;
                continue;
            }
            
            if (inImportBlock && line.trim() === ')') {
                inImportBlock = false;
                indentLevel--;
                formattedCode += ')\n';
                continue;
            }
            
            if (inImportBlock) {
                formattedCode += '\t' + line.trim() + '\n';
                continue;
            }
            
            // Handle struct declarations
            if (line.trim().match(/^type\s+\w+\s+struct\s+{/)) {
                formattedCode += line.trim() + '\n';
                inStructBlock = true;
                indentLevel++;
                continue;
            }
            
            // Handle struct fields with tags
            if (inStructBlock && line.trim().match(/\w+\s+\w+(\.\w+)?\s+`.*`/)) {
                formattedCode += '\t' + line.trim() + '\n';
                continue;
            }
            
            // Handle struct fields without tags
            if (inStructBlock && line.trim().match(/\w+\s+\w+(\.\w+)?(\s+\/\/.*)?$/)) {
                formattedCode += '\t' + line.trim() + '\n';
                continue;
            }
            
            // End of struct block
            if (inStructBlock && line.trim() === '}') {
                inStructBlock = false;
                indentLevel--;
                formattedCode += '}\n';
                continue;
            }
            
            // Handle variable declarations with struct initialization
            if (line.trim().match(/^var\s+\w+\s+=\s+struct\s+{/)) {
                const parts = line.trim().split('=');
                formattedCode += parts[0].trim() + ' = struct {\n';
                indentLevel++;
                continue;
            }
            
            // Handle function declarations
            if (line.trim().match(/^func\s+\(/)) {
                // Method declaration
                if (line.includes('{')) {
                    formattedCode += line.trim() + '\n';
                    indentLevel++;
                } else {
                    formattedCode += line.trim() + '\n';
                }
                continue;
            }
            
            if (line.trim().match(/^func\s+\w+\(/)) {
                // Function declaration
                if (line.includes('{')) {
                    formattedCode += line.trim() + '\n';
                    indentLevel++;
                } else {
                    formattedCode += line.trim() + '\n';
                }
                continue;
            }
            
            // Decrease indent for closing braces
            if (line.trim() === '}') {
                indentLevel = Math.max(0, indentLevel - 1);
                formattedCode += '\t'.repeat(indentLevel) + '}\n';
                continue;
            }
            
            // Handle opening braces at the end of a line
            if (line.trim().endsWith('{')) {
                formattedCode += '\t'.repeat(indentLevel) + line.trim() + '\n';
                indentLevel++;
                continue;
            }
            
            // Add proper indentation for all other lines
            formattedCode += '\t'.repeat(indentLevel) + line.trim() + '\n';
        }
        
        return formattedCode.trim();
    }

    // Ruby code formatter
    function formatRubyCode(code) {
        // Basic Ruby formatting
        const lines = code.split('\n');
        let formattedCode = '';
        let indentLevel = 0;
        
        lines.forEach(line => {
            // Trim trailing whitespace
            const trimmedLine = line.trimRight();
            
            // Skip empty lines
            if (trimmedLine === '') {
                formattedCode += '\n';
                return;
            }
            
            // Decrease indent for ending blocks
            if (/^\s*(end|else|elsif|rescue|ensure)\b/.test(trimmedLine)) {
                indentLevel = Math.max(0, indentLevel - 1);
            }
            
            // Add proper indentation
            const indent = '  '.repeat(indentLevel);
            formattedCode += indent + trimmedLine.trim() + '\n';
            
            // Increase indent for starting blocks
            if (/\b(do|if|else|elsif|unless|case|while|until|for|begin|rescue|ensure|class|module|def)\b.*$/.test(trimmedLine) && 
                !/\bend\b/.test(trimmedLine) && 
                !/.*[;{]$/.test(trimmedLine)) {
                indentLevel++;
            }
        });
        
        return formattedCode.trim();
    }

    // Rust code formatter
    function formatRustCode(code) {
        // Basic Rust formatting
        const lines = code.split('\n');
        let formattedCode = '';
        let indentLevel = 0;
        
        lines.forEach(line => {
            // Trim trailing whitespace
            const trimmedLine = line.trimRight();
            
            // Skip empty lines
            if (trimmedLine === '') {
                formattedCode += '\n';
                return;
            }
            
            // Decrease indent for closing braces
            if (/^\s*}/.test(trimmedLine)) {
                indentLevel = Math.max(0, indentLevel - 1);
            }
            
            // Add proper indentation
            const indent = '    '.repeat(indentLevel);
            formattedCode += indent + trimmedLine.trim() + '\n';
            
            // Increase indent for opening braces
            if (/{$/.test(trimmedLine) && !/^(use|extern|mod)\s+/.test(trimmedLine)) {
                indentLevel++;
            }
        });
        
        return formattedCode.trim();
    }

    // PHP code formatter
    function formatPhpCode(code) {
        // Basic PHP formatting
        const lines = code.split('\n');
        let formattedCode = '';
        let indentLevel = 0;
        
        lines.forEach(line => {
            // Trim trailing whitespace
            const trimmedLine = line.trimRight();
            
            // Skip empty lines
            if (trimmedLine === '') {
                formattedCode += '\n';
                return;
            }
            
            // Decrease indent for closing braces
            if (/^\s*}/.test(trimmedLine)) {
                indentLevel = Math.max(0, indentLevel - 1);
            }
            
            // Add proper indentation
            const indent = '    '.repeat(indentLevel);
            formattedCode += indent + trimmedLine.trim() + '\n';
            
            // Increase indent for opening braces
            if (/{$/.test(trimmedLine)) {
                indentLevel++;
            }
        });
        
        return formattedCode.trim();
    }

    // Solidity code formatter
    function formatSolidityCode(code) {
        // Basic Solidity formatting
        const lines = code.split('\n');
        let formattedCode = '';
        let indentLevel = 0;
        
        lines.forEach(line => {
            // Trim trailing whitespace
            const trimmedLine = line.trimRight();
            
            // Skip empty lines
            if (trimmedLine === '') {
                formattedCode += '\n';
                return;
            }
            
            // Decrease indent for closing braces
            if (/^\s*}/.test(trimmedLine)) {
                indentLevel = Math.max(0, indentLevel - 1);
            }
            
            // Add proper indentation
            const indent = '    '.repeat(indentLevel);
            formattedCode += indent + trimmedLine.trim() + '\n';
            
            // Increase indent for opening braces
            if (/{$/.test(trimmedLine)) {
                indentLevel++;
            }
        });
        
        return formattedCode.trim();
    }

    // Initialize with JavaScript selected
    updateEditorMode('javascript');
});

// Function to minify JSON
function minifyJSON(jsonString) {
    try {
        // Parse the JSON to ensure it's valid
        const parsedJSON = JSON.parse(jsonString);
        // Stringify without whitespace
        return JSON.stringify(parsedJSON);
    } catch (error) {
        showNotification('Invalid JSON: ' + error.message, 'danger');
        return '';
    }
}

// In your process function or event handler, add this case for JSON minification
function processCode() {
    const language = document.getElementById('language-select').value;
    const inputCode = codeInputEditor.getValue();
    const currentTool = document.querySelector('.nav-link.active').getAttribute('data-tool');
    
    try {
        let result = '';
        
        if (currentTool === 'minify') {
            if (language === 'json') {
                result = minifyJSON(inputCode);
            }
            // ... other language minification cases ...
        }
        // ... other tool cases (lint, beautify) ...
        
        codeOutputEditor.setValue(result);
        showNotification('Code processed successfully!', 'success');
    } catch (error) {
        showNotification('Error processing code: ' + error.message, 'danger');
    }
}

// Helper function to show notifications
function showNotification(message, type) {
    const notificationArea = document.getElementById('notification-area');
    notificationArea.textContent = message;
    notificationArea.className = `alert alert-${type}`;
    notificationArea.style.display = 'block';
    
    // Hide notification after 10 seconds
    setTimeout(() => {
        notificationArea.style.display = 'none';
    }, 10000);
}

// Add this to your existing event listeners where you handle tool changes
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
        // Your existing code for changing tools
        
        // Check if JSON is selected and minify tool is active
        const currentLanguage = document.getElementById('language-select').value;
        const currentTool = this.getAttribute('data-tool');
        
        if (currentLanguage === 'json' && currentTool === 'minify') {
            showNotification('Minification for JSON is not fully supported yet. Basic whitespace removal applied.', 'warning');
        } else {
            // Hide notification if it's showing
            document.getElementById('notification-area').style.display = 'none';
        }
    });
});

// Also check when language changes
document.getElementById('language-select').addEventListener('change', function() {
    const currentTool = document.querySelector('.nav-link.active').getAttribute('data-tool');
    
    if (this.value === 'json' && currentTool === 'minify') {
        showNotification('Minification for JSON is not fully supported yet. Basic whitespace removal applied.', 'warning');
    } else {
        // Hide notification if it's showing
        document.getElementById('notification-area').style.display = 'none';
    }
});