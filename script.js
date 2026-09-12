// script.js — Nova Terminal OS (Complete Working Version)
(function(){
    const homePage       = document.getElementById('homePage');
    const terminalOS     = document.getElementById('terminalOS');
    const launchBtn      = document.getElementById('launchBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const commandInput   = document.getElementById('commandInput');
    const outputArea     = document.getElementById('outputArea');
    const liveClockSpan  = document.getElementById('liveClock');
    const exitHomeBtn    = document.getElementById('exitToHome');
    const promptDir      = document.getElementById('promptDir');

    let currentDirectory = '/home/nova';
    let commandHistory   = [];
    let historyIndex     = -1;
    let fileSystem       = {};
    
    // ---- Fake Process System ----
    let fakeProcesses = [
        { pid: 101, name: 'nova-shell', status: 'running', cpu: '1.2%', mem: '8.4MB' },
        { pid: 102, name: 'systemd', status: 'running', cpu: '0.3%', mem: '12.1MB' },
        { pid: 103, name: 'window-manager', status: 'running', cpu: '2.1%', mem: '45.6MB' },
        { pid: 104, name: 'network-manager', status: 'sleeping', cpu: '0.1%', mem: '5.2MB' },
        { pid: 105, name: 'audio-server', status: 'running', cpu: '0.5%', mem: '18.3MB' },
        { pid: 106, name: 'nova-explorer', status: 'running', cpu: '1.8%', mem: '23.7MB' },
        { pid: 107, name: 'terminal-daemon', status: 'running', cpu: '0.9%', mem: '6.2MB' },
        { pid: 108, name: 'backup-scheduler', status: 'sleeping', cpu: '0.0%', mem: '2.1MB' }
    ];
    let nextPid = 109;
    let sudoMode = false;

    // ---- Reset Terminal Session Function ----
    function resetTerminalSession() {
        // Reset session state only (preserve files)
        currentDirectory = '/home/nova';
        commandHistory = [];
        historyIndex = -1;
        sudoMode = false;
        
        // Reset fake processes to original state
        fakeProcesses = [
            { pid: 101, name: 'nova-shell', status: 'running', cpu: '1.2%', mem: '8.4MB' },
            { pid: 102, name: 'systemd', status: 'running', cpu: '0.3%', mem: '12.1MB' },
            { pid: 103, name: 'window-manager', status: 'running', cpu: '2.1%', mem: '45.6MB' },
            { pid: 104, name: 'network-manager', status: 'sleeping', cpu: '0.1%', mem: '5.2MB' },
            { pid: 105, name: 'audio-server', status: 'running', cpu: '0.5%', mem: '18.3MB' },
            { pid: 106, name: 'nova-explorer', status: 'running', cpu: '1.8%', mem: '23.7MB' },
            { pid: 107, name: 'terminal-daemon', status: 'running', cpu: '0.9%', mem: '6.2MB' },
            { pid: 108, name: 'backup-scheduler', status: 'sleeping', cpu: '0.0%', mem: '2.1MB' }
        ];
        nextPid = 109;
        
        // Clear output and show reset confirmation
        clearOutput();
        updatePromptDir();
        addOutput('🔄 Terminal session reset. Files preserved. Type "help" for commands.', 'success');
        addOutput(`<span style="color:#64748b">Session reset. Current directory: ${currentDirectory}</span>`, 'info');
        
        // Focus the input
        if (commandInput) commandInput.focus();
    }

    // ---- Initialize Filesystem (only once) ----
    function initFS() {
        if (Object.keys(fileSystem).length === 0) {
            fileSystem = {
                '/': { type: 'dir', children: ['home'] },
                '/home': { type: 'dir', children: ['nova', 'documents'] },
                '/home/nova': { type: 'dir', children: ['welcome.txt', 'config.json', 'projects'] },
                '/home/nova/welcome.txt': { type: 'file', content: 'Welcome to Nova OS — premium terminal experience.', size: '42B' },
                '/home/nova/config.json': { type: 'file', content: '{ "theme": "aurora", "version": "2.0" }', size: '38B' },
                '/home/nova/projects': { type: 'dir', children: [] },
                '/home/documents': { type: 'dir', children: ['notes.txt'] },
                '/home/documents/notes.txt': { type: 'file', content: 'Write your ideas here.', size: '20B' }
            };
        }
    }
    initFS(); // Call once at startup

    // ---- Virtual Filesystem Helper Functions ----
    function createFile(path, content = '') {
        const normalizedPath = normalizePath(path);
        if (fileSystem[normalizedPath]) {
            return { success: false, error: `File already exists: ${path}` };
        }
        fileSystem[normalizedPath] = { type: 'file', content: content, size: `${content.length}B` };
        const parent = getParent(normalizedPath);
        const name = getName(normalizedPath);
        if (fileSystem[parent] && fileSystem[parent].type === 'dir') {
            if (!fileSystem[parent].children.includes(name)) {
                fileSystem[parent].children.push(name);
            }
        }
        return { success: true };
    }

    function createDirectory(path) {
        const normalizedPath = normalizePath(path);
        if (fileSystem[normalizedPath]) {
            return { success: false, error: `Directory already exists: ${path}` };
        }
        fileSystem[normalizedPath] = { type: 'dir', children: [] };
        const parent = getParent(normalizedPath);
        const name = getName(normalizedPath);
        if (fileSystem[parent] && fileSystem[parent].type === 'dir') {
            if (!fileSystem[parent].children.includes(name)) {
                fileSystem[parent].children.push(name);
            }
        }
        return { success: true };
    }

    function removeEntry(path) {
        const normalizedPath = normalizePath(path);
        if (!fileSystem[normalizedPath]) {
            return { success: false, error: `Path does not exist: ${path}` };
        }
        const parent = getParent(normalizedPath);
        const name = getName(normalizedPath);
        if (fileSystem[parent] && fileSystem[parent].type === 'dir') {
            const index = fileSystem[parent].children.indexOf(name);
            if (index > -1) {
                fileSystem[parent].children.splice(index, 1);
            }
        }
        if (fileSystem[normalizedPath].type === 'dir') {
            Object.keys(fileSystem).forEach(key => {
                if (key.startsWith(normalizedPath + '/')) {
                    delete fileSystem[key];
                }
            });
        }
        delete fileSystem[normalizedPath];
        return { success: true };
    }

    function getParent(path) {
        const normalized = normalizePath(path);
        const parts = normalized.split('/').filter(p => p);
        parts.pop();
        return '/' + parts.join('/');
    }

    function getName(path) {
        const normalized = normalizePath(path);
        const parts = normalized.split('/').filter(p => p);
        return parts.pop() || '';
    }

    function normalizePath(path) {
        if (!path || path === '') return currentDirectory;
        let resolved;
        if (path.startsWith('/')) {
            resolved = path;
        } else {
            resolved = currentDirectory + (currentDirectory.endsWith('/') ? '' : '/') + path;
        }
        const parts = resolved.split('/').filter(p => p && p !== '.');
        const stack = [];
        for (const part of parts) {
            if (part === '..') {
                stack.pop();
            } else {
                stack.push(part);
            }
        }
        return '/' + stack.join('/');
    }

    function resolvePath(path) {
        if (!path) return currentDirectory;
        if (path.startsWith('/')) return path;
        if (path === '..') return currentDirectory.split('/').slice(0, -1).join('/') || '/';
        if (path === '.') return currentDirectory;
        return currentDirectory + (currentDirectory.endsWith('/') ? '' : '/') + path;
    }

    function updatePromptDir() {
        if (!promptDir) return;
        const d = currentDirectory.replace('/home/nova', '~');
        promptDir.textContent = sudoMode ? `${d} (sudo)` : (d || '/');
    }

    function addOutput(content, type = 'normal') {
        const div = document.createElement('div');
        div.className = 'glass-card';
        div.style.animation = 'fadeInUp 0.15s ease';
        if (type === 'error')   { div.style.borderLeftColor = '#f87171'; div.style.background = 'rgba(248,113,113,0.05)'; }
        else if (type === 'success') { div.style.borderLeftColor = '#4ade80'; div.style.background = 'rgba(74,222,128,0.05)'; }
        else if (type === 'info')    { div.style.borderLeftColor = '#22d3ee'; div.style.background = 'rgba(34,211,238,0.05)'; }
        if (typeof content === 'string') div.innerHTML = content;
        else div.appendChild(content);
        outputArea.appendChild(div);
        outputArea.scrollTop = outputArea.scrollHeight;
    }

    function addCommandEcho(cmd) {
        const div = document.createElement('div');
        div.style.cssText = 'font-family:var(--mono);font-size:14px;padding:4px 0;color:#94a3b8;';
        const sudoPrefix = sudoMode ? '<span style="color:#fbbf24">sudo </span>' : '';
        div.innerHTML = `<span style="color:#4ade80">nova@os</span><span style="color:#64748b">:</span><span style="color:#60a5fa">${currentDirectory.replace('/home/nova','~')}</span><span style="color:#94a3b8">$</span> ${sudoPrefix}<span style="color:#f0ecff;margin-left:6px">${cmd}</span>`;
        outputArea.appendChild(div);
    }

    function clearOutput() { outputArea.innerHTML = ''; }

    function listDirectory(path) {
        const node = fileSystem[path];
        if (!node || node.type !== 'dir') return addOutput(`ls: cannot access '${path}': No such directory`, 'error');
        if (node.children.length === 0) return addOutput('(empty directory)');
        const items = node.children.map(c => {
            const full = path === '/' ? `/${c}` : `${path}/${c}`;
            const stat = fileSystem[full];
            if (stat?.type === 'dir') {
                return `<span style="color:#60a5fa;font-weight:600">${c}/</span>`;
            } else if (stat?.type === 'file') {
                if (c.endsWith('.sh') || c.endsWith('.py')) return `<span style="color:#4ade80">${c}</span>`;
                if (c.endsWith('.json')) return `<span style="color:#fde68a">${c}</span>`;
                return `<span style="color:#c084fc">${c}</span>`;
            }
            return `<span style="color:#94a3b8">${c}</span>`;
        }).join('  ');
        addOutput(items);
    }

    function printTree(dir, prefix = '', isLast = true, output = []) {
        const node = fileSystem[dir];
        if (!node || node.type !== 'dir') return output;
        
        const children = node.children || [];
        children.forEach((child, index) => {
            const isLastChild = index === children.length - 1;
            const fullPath = dir === '/' ? `/${child}` : `${dir}/${child}`;
            const childNode = fileSystem[fullPath];
            const isDir = childNode?.type === 'dir';
            const connector = isLastChild ? '└── ' : '├── ';
            const line = `${prefix}${connector}<span style="color:${isDir ? '#60a5fa' : '#fde68a'}">${child}${isDir ? '/' : ''}</span>`;
            output.push(line);
            if (isDir) {
                const newPrefix = prefix + (isLastChild ? '    ' : '│   ');
                printTree(fullPath, newPrefix, isLastChild, output);
            }
        });
        return output;
    }

    function echoWithRedirection(args) {
        const cmdStr = args.join(' ');
        const redirectMatch = cmdStr.match(/^(.+?)\s*>\s*(.+)$/);
        if (redirectMatch) {
            const content = redirectMatch[1];
            const filename = redirectMatch[2].trim();
            const filePath = resolvePath(filename);
            const result = createFile(filePath, content);
            if (result.success) {
                addOutput(`Created/updated file: ${filename}`, 'success');
            } else {
                addOutput(result.error, 'error');
            }
        } else {
            addOutput(args.join(' '));
        }
    }

    // ---- Commands Object ----
    const commands = {
        help: () => {
            const categorized = {
                '📁 Filesystem': ['ls', 'cd', 'pwd', 'mkdir', 'touch', 'rm', 'cat', 'tree', 'cp', 'mv', 'find'],
                '⚙️ System': ['date', 'time', 'whoami', 'sysinfo', 'neofetch', 'uptime', 'ps', 'kill', 'sudo', 'exit', 'reset'],
                '🛠️ Utilities': ['echo', 'clear', 'history', 'man'],
                '🎮 Fun': ['hack'],
                '📱 Apps': ['calc', 'notes', 'files', 'settings', 'music']
            };
            let html = '<span style="color:#7c5cff;font-weight:600">📚 Available Commands</span><br><br>';
            for (const [category, cmds] of Object.entries(categorized)) {
                html += `<span style="color:#4ade80">${category}:</span><br>`;
                html += `<div style="margin-left:20px;margin-bottom:12px">${cmds.map(c => `<span style="color:#c084fc;display:inline-block;margin:2px 8px 2px 0">${c}</span>`).join('')}</div>`;
            }
            addOutput(html);
        },
        clear: () => clearOutput(),
        pwd: () => addOutput(currentDirectory),
        ls: (args) => {
            const target = args[0] ? resolvePath(args[0]) : currentDirectory;
            if (!fileSystem[target]) return addOutput(`ls: cannot access '${args[0]}': No such file or directory`, 'error');
            listDirectory(target);
        },
        cd: (args) => {
            if (!args[0]) { currentDirectory = '/home/nova'; updatePromptDir(); return; }
            const np = resolvePath(args[0]);
            if (fileSystem[np]?.type === 'dir') { currentDirectory = np; updatePromptDir(); }
            else addOutput(`bash: cd: ${args[0]}: No such file or directory`, 'error');
        },
        mkdir: (args) => {
            if (!args[0]) return addOutput('mkdir: missing operand', 'error');
            const result = createDirectory(args[0]);
            if (!result.success) addOutput(result.error, 'error');
            else addOutput(`Created directory: ${args[0]}`, 'success');
        },
        touch: (args) => {
            if (!args[0]) return addOutput('touch: missing file operand', 'error');
            const p = resolvePath(args[0]);
            if (!fileSystem[p]) {
                createFile(args[0], '');
                addOutput(`Created file: ${args[0]}`, 'success');
            } else {
                addOutput(`File touched: ${args[0]}`, 'info');
            }
        },
        rm: (args) => {
            if (!args[0]) return addOutput('rm: missing operand', 'error');
            const result = removeEntry(args[0]);
            if (!result.success) addOutput(result.error, 'error');
            else addOutput(`Removed: ${args[0]}`, 'success');
        },
        cat: (args) => {
            if (!args[0]) return addOutput('cat: missing operand', 'error');
            const p = resolvePath(args[0]);
            if (fileSystem[p]?.type === 'file') {
                addOutput(fileSystem[p].content || '(empty file)');
            } else if (fileSystem[p]?.type === 'dir') {
                addOutput(`cat: ${args[0]}: Is a directory`, 'error');
            } else {
                addOutput(`cat: ${args[0]}: No such file or directory`, 'error');
            }
        },
        echo: (args) => echoWithRedirection(args),
        cp: (args) => {
            if (args.length < 2) return addOutput('cp: missing file operand', 'error');
            const source = resolvePath(args[0]);
            const dest = resolvePath(args[1]);
            if (!fileSystem[source]) return addOutput(`cp: cannot stat '${args[0]}': No such file or directory`, 'error');
            if (fileSystem[dest]?.type === 'dir') {
                const fileName = getName(source);
                const targetPath = dest === '/' ? `/${fileName}` : `${dest}/${fileName}`;
                if (fileSystem[source].type === 'dir') {
                    createDirectory(targetPath);
                    const sourceChildren = fileSystem[source].children || [];
                    sourceChildren.forEach(child => {
                        const sourceChild = source === '/' ? `/${child}` : `${source}/${child}`;
                        const destChild = targetPath === '/' ? `/${child}` : `${targetPath}/${child}`;
                        commands.cp([sourceChild, destChild]);
                    });
                    addOutput(`Copied directory '${args[0]}' to '${args[1]}'`, 'success');
                } else {
                    createFile(targetPath, fileSystem[source].content);
                    addOutput(`Copied '${args[0]}' to '${args[1]}'`, 'success');
                }
            } else {
                if (fileSystem[source].type === 'dir') {
                    createDirectory(dest);
                } else {
                    createFile(dest, fileSystem[source].content);
                }
                addOutput(`Copied '${args[0]}' to '${args[1]}'`, 'success');
            }
        },
        mv: (args) => {
            if (args.length < 2) return addOutput('mv: missing file operand', 'error');
            const source = resolvePath(args[0]);
            const dest = resolvePath(args[1]);
            if (!fileSystem[source]) return addOutput(`mv: cannot stat '${args[0]}': No such file or directory`, 'error');
            const content = fileSystem[source];
            removeEntry(args[0]);
            if (content.type === 'dir') {
                createDirectory(dest);
                const sourceChildren = content.children || [];
                sourceChildren.forEach(child => {
                    const sourceChild = source === '/' ? `/${child}` : `${source}/${child}`;
                    const destChild = dest === '/' ? `/${child}` : `${dest}/${child}`;
                    if (fileSystem[sourceChild]) {
                        commands.mv([sourceChild, destChild]);
                    }
                });
            } else {
                createFile(dest, content.content);
            }
            addOutput(`Moved '${args[0]}' to '${args[1]}'`, 'success');
        },
        find: (args) => {
            const searchName = args[0] || '';
            if (!searchName) return addOutput('find: missing argument', 'error');
            const results = [];
            Object.keys(fileSystem).forEach(path => {
                if (getName(path).includes(searchName)) {
                    const isDir = fileSystem[path].type === 'dir';
                    results.push(`<span style="color:${isDir ? '#60a5fa' : '#fde68a'}">${path}${isDir ? '/' : ''}</span>`);
                }
            });
            if (results.length === 0) addOutput(`No files found matching '${searchName}'`, 'info');
            else addOutput(`Found ${results.length} result(s):<br>${results.join('<br>')}`);
        },
        man: (args) => {
            const cmdName = args[0];
            const manPages = {
                ls: 'List directory contents. Usage: ls [path]',
                cd: 'Change directory. Usage: cd [directory]',
                pwd: 'Print working directory. Usage: pwd',
                cp: 'Copy files or directories. Usage: cp <source> <destination>',
                mv: 'Move or rename files. Usage: mv <source> <destination>',
                rm: 'Remove files or directories. Usage: rm <path>',
                find: 'Search for files. Usage: find <pattern>',
                ps: 'List running processes. Usage: ps',
                kill: 'Kill a process. Usage: kill <PID>',
                sudo: 'Execute command with privileges. Usage: sudo <command>',
                hack: 'Launch hacking sequence. Usage: hack',
                exit: 'Exit to home screen. Usage: exit',
                reset: 'Reset terminal session (preserves files). Usage: reset'
            };
            if (cmdName && manPages[cmdName]) {
                addOutput(`<span style="color:#4ade80">${cmdName}</span> - ${manPages[cmdName]}`);
            } else if (!cmdName) {
                addOutput('What manual page do you want? Usage: man <command>');
            } else {
                addOutput(`No manual entry for ${cmdName}`, 'error');
            }
        },
        ps: () => {
            let output = '<span style="color:#60a5fa">PID  NAME              STATUS   CPU    MEM</span><br>';
            fakeProcesses.forEach(p => {
                const statusColor = p.status === 'running' ? '#4ade80' : (p.status === 'sleeping' ? '#fde68a' : '#f87171');
                output += `<span style="color:#c084fc">${String(p.pid).padEnd(4)}</span> <span style="color:#94a3b8">${p.name.padEnd(16)}</span> <span style="color:${statusColor}">${p.status.padEnd(7)}</span> ${p.cpu.padEnd(5)} ${p.mem}<br>`;
            });
            addOutput(output);
        },
        kill: (args) => {
            if (!args[0]) return addOutput('kill: missing PID', 'error');
            const pid = parseInt(args[0]);
            const index = fakeProcesses.findIndex(p => p.pid === pid);
            if (index === -1) return addOutput(`kill: (${pid}) - No such process`, 'error');
            const killed = fakeProcesses.splice(index, 1)[0];
            addOutput(`Terminated process: ${killed.name} (${killed.pid})`, 'success');
        },
        sudo: async (args) => {
            if (!args.length) {
                sudoMode = !sudoMode;
                updatePromptDir();
                addOutput(sudoMode ? '🔒 Sudo mode enabled. Use with caution!' : 'Sudo mode disabled', 'info');
                return;
            }
            addOutput('[sudo] password for nova: ********', 'info');
            setTimeout(() => {
                addOutput(`Access granted. Executing: ${args.join(' ')}`, 'success');
                const cmd = args[0];
                const cmdArgs = args.slice(1);
                if (commands[cmd]) {
                    commands[cmd](cmdArgs);
                } else {
                    addOutput(`sudo: ${cmd}: command not found`, 'error');
                }
            }, 800);
        },
        hack: async () => {
            const hackMessages = [
                'Initializing hacking sequence...',
                'Bypassing firewalls... ███░░░░░░░░ 25%',
                'Cracking encryption... ██████░░░░ 50%',
                'Accessing mainframe... ██████████ 75%',
                'Downloading sensitive data...',
                '⚠️ ACCESS GRANTED ⚠️',
                '',
                '🎉 Congratulations! You\'ve hacked the Nova mainframe! 🎉',
                'This is a simulated hacking sequence for educational purposes.',
                'Remember: Real hacking without permission is illegal!'
            ];
            for (let i = 0; i < hackMessages.length; i++) {
                await new Promise(resolve => setTimeout(() => {
                    addOutput(hackMessages[i], i === hackMessages.length - 2 ? 'success' : 'info');
                    resolve();
                }, 400));
            }
        },
        exit: () => {
            addOutput('Logging out of Nova Terminal...', 'info');
            setTimeout(() => {
                terminalOS.classList.add('hidden');
                homePage.classList.remove('hidden');
                sudoMode = false;
                updatePromptDir();
            }, 500);
        },
        reset: () => {
            resetTerminalSession();
        },
        date: () => addOutput(new Date().toDateString()),
        time: () => addOutput(new Date().toLocaleTimeString()),
        uptime: () => addOutput('up 4 hours, 21 minutes, load average: 0.12, 0.08, 0.05'),
        whoami: () => addOutput(sudoMode ? 'root' : 'nova'),
        history: () => {
            if (commandHistory.length === 0) return addOutput('No command history yet.');
            const historyHtml = commandHistory.map((c, i) => 
                `<span style="color:#5a5580">${String(i+1).padStart(4)}</span>  ${c}`
            ).join('<br>');
            addOutput(historyHtml);
        },
        sysinfo: () => addOutput(
            `<span style="color:#7c5cff">System Information</span><br>` +
            `OS:        Nova Terminal 2.0 (Enhanced)<br>` +
            `Kernel:    Linux 6.1.0-x86_64<br>` +
            `Shell:     zsh 5.9<br>` +
            `CPU:       ${Math.floor(Math.random()*20+5)}% utilization<br>` +
            `Memory:    3.2GB / 16.0GB`
        ),
        neofetch: () => addOutput(
            `<pre style="font-family:var(--mono);font-size:12px;color:#4a3f8a;line-height:1.5">` +
            `   .---.      <span style="color:#7c5cff">nova</span><span style="color:#5a5580">@</span><span style="color:#60a5fa">terminal</span>\n` +
            `  /     \\     OS:     Nova Terminal 2.0\n` +
            ` | () () |    Kernel: 6.1.0-x86_64\n` +
            `  \\  ^  /     Shell:  zsh 5.9\n` +
            `   |||||      CPU:    x86_64 (8 cores)\n` +
            `   |||||      Memory: 3.2GB/16GB</pre>`
        ),
        tree: () => {
            const treeOutput = printTree(currentDirectory);
            if (treeOutput.length === 0) {
                addOutput(`<span style="color:#60a5fa">${currentDirectory}</span><br>(empty directory)`);
            } else {
                addOutput(`<span style="color:#60a5fa">${currentDirectory}</span><br>${treeOutput.join('<br>')}`);
            }
        },
        calc: () => document.getElementById('widgetCalculator').classList.remove('hidden'),
        notes: () => document.getElementById('widgetNotes').classList.remove('hidden'),
        files: () => { renderExplorer(); document.getElementById('widgetExplorer').classList.remove('hidden'); },
        settings: () => document.getElementById('widgetSettings').classList.remove('hidden'),
        music: () => document.getElementById('widgetMusic').classList.remove('hidden'),
    };

    function renderExplorer() {
        const el = document.getElementById('explorerContent');
        if (el) {
            el.innerHTML = Object.keys(fileSystem).sort().map(f => {
                const isDir = fileSystem[f].type === 'dir';
                return `<div style="padding:5px 0;font-family:var(--mono);font-size:13px;color:${isDir ? '#60a5fa' : '#fde68a'}">${isDir ? '📁' : '📄'} ${f}</div>`;
            }).join('');
        }
    }

    let aliases = {};
    
    function processCommand(line) {
        if (!line.trim()) return;
        commandHistory.push(line);
        historyIndex = commandHistory.length;
        
        const aliasMatch = line.match(/^alias\s+(\w+)=['"]?(.+)['"]?$/);
        if (aliasMatch) {
            const aliasName = aliasMatch[1];
            const aliasCommand = aliasMatch[2];
            aliases[aliasName] = aliasCommand;
            addOutput(`Alias created: ${aliasName} -> ${aliasCommand}`, 'success');
            return;
        }
        
        let finalLine = line;
        const firstWord = line.split(/\s+/)[0];
        if (aliases[firstWord]) {
            finalLine = line.replace(firstWord, aliases[firstWord]);
        }
        
        const parts = finalLine.trim().split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);
        addCommandEcho(line);
        
        if (commands[cmd]) {
            commands[cmd](args);
        } else {
            addOutput(`bash: ${cmd}: command not found. Type 'help' for available commands.`, 'error');
        }
    }

    function autocomplete(input) {
        const availableCommands = Object.keys(commands);
        const matches = availableCommands.filter(cmd => cmd.startsWith(input.toLowerCase()));
        
        if (matches.length === 1) {
            commandInput.value = matches[0];
        } else if (matches.length > 1) {
            addOutput(`Possible completions: ${matches.join('  ')}`, 'info');
        }
    }

    commandInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const val = commandInput.value;
            processCommand(val);
            commandInput.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) historyIndex--;
            commandInput.value = commandHistory[historyIndex] || '';
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                commandInput.value = commandHistory[historyIndex] || '';
            } else {
                historyIndex = commandHistory.length;
                commandInput.value = '';
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            if (commandInput.value) {
                autocomplete(commandInput.value);
            }
        }
    });

    const bootMessages = [
        'Loading kernel modules...',
        'Mounting virtual filesystem...',
        'Starting shell environment...',
        'Initializing user session...',
        'Loading enhanced command system...',
        'Starting process manager...',
        'Applying system configuration...',
        'Boot complete. Type "help" for commands.'
    ];

    function startCinematic() {
        loadingOverlay.classList.remove('hidden');
        const linesEl   = document.getElementById('bootLines');
        const barFill   = document.getElementById('loaderBarFill');
        let i = 0;
        linesEl.innerHTML = '';
        barFill.style.width = '0%';

        function addBootLine() {
            if (i >= bootMessages.length) {
                setTimeout(() => {
                    loadingOverlay.classList.add('hidden');
                    homePage.classList.add('hidden');
                    terminalOS.classList.remove('hidden');
                    updatePromptDir();
                    startWidgetUpdater();
                    addOutput('✨ Welcome to Nova Terminal OS 2.0! Type "help" to get started.', 'success');
                    if (commandInput) commandInput.focus();
                }, 400);
                return;
            }
            const line = document.createElement('div');
            line.className = 'boot-line';
            line.innerHTML = `<span class="ok">[  OK  ]</span>${bootMessages[i]}`;
            line.style.animationDelay = '0s';
            linesEl.appendChild(line);
            barFill.style.width = `${Math.round(((i+1) / bootMessages.length) * 100)}%`;
            i++;
            setTimeout(addBootLine, 260);
        }
        addBootLine();
    }

    launchBtn.addEventListener('click', startCinematic);

    if (exitHomeBtn) exitHomeBtn.addEventListener('click', () => {
        terminalOS.classList.add('hidden');
        homePage.classList.remove('hidden');
        sudoMode = false;
        updatePromptDir();
    });

    const closeTermBtn = document.getElementById('closeTermBtn');
    if (closeTermBtn) {
        closeTermBtn.addEventListener('click', () => {
            document.getElementById('mainTerminal').classList.add('hidden');
        });
    }

    // Reset button handlers
    const resetTermBtn = document.getElementById('resetTermBtn');
    if (resetTermBtn) {
        resetTermBtn.addEventListener('click', () => resetTerminalSession());
    }

    const resetSessionBtn = document.getElementById('resetSessionBtn');
    if (resetSessionBtn) {
        resetSessionBtn.addEventListener('click', () => resetTerminalSession());
    }

    // Keyboard shortcut Ctrl+R for reset
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'r' && !terminalOS.classList.contains('hidden')) {
            e.preventDefault();
            resetTerminalSession();
        }
    });

    function startWidgetUpdater() {
        setInterval(() => {
            if (terminalOS.classList.contains('hidden')) return;
            if (liveClockSpan) liveClockSpan.textContent = new Date().toLocaleTimeString();
            const cpuStat = document.getElementById('cpuStat');
            const ramStat = document.getElementById('ramStat');
            if (cpuStat) cpuStat.textContent = `CPU: ${Math.floor(Math.random()*20+5)}%`;
            if (ramStat) ramStat.textContent = `RAM: ${(Math.random()*3+1.2).toFixed(1)}GB`;
        }, 2000);
    }

    document.querySelectorAll('.close-popup').forEach(btn => {
        btn.addEventListener('click', (e) => e.target.closest('.glass-popup').classList.add('hidden'));
    });

    const calcGrid = document.querySelector('#widgetCalculator .calc-grid');
    const calcDisplay = document.getElementById('calcDisplay');
    if (calcGrid && calcDisplay) {
        const btns = ['7','8','9','/','4','5','6','*','1','2','3','-','0','C','=','+'];
        let expr = '';
        btns.forEach(b => {
            const btn = document.createElement('button');
            btn.textContent = b;
            btn.onclick = () => {
                if (b === 'C')       { expr = ''; calcDisplay.textContent = '0'; }
                else if (b === '=')  { try { expr = String(eval(expr)); calcDisplay.textContent = expr; } catch { calcDisplay.textContent = 'Error'; expr = ''; } }
                else                 { expr += b; calcDisplay.textContent = expr; }
            };
            calcGrid.appendChild(btn);
        });
    }

    const notesArea = document.getElementById('notesArea');
    if (notesArea) {
        notesArea.value = localStorage.getItem('nova_notes') || '';
        notesArea.addEventListener('input', () => localStorage.setItem('nova_notes', notesArea.value));
    }

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.addEventListener('change', () => alert('Theme switching coming soon!'));

    document.querySelectorAll('.dock-icon[data-window]').forEach(icon => {
        icon.addEventListener('click', () => {
            const w = icon.getAttribute('data-window');
            if (w === 'terminal') document.getElementById('mainTerminal').classList.remove('hidden');
            else if (w === 'explorer') { renderExplorer(); document.getElementById('widgetExplorer').classList.remove('hidden'); }
            else if (w === 'calculator') document.getElementById('widgetCalculator').classList.remove('hidden');
            else if (w === 'notes')    document.getElementById('widgetNotes').classList.remove('hidden');
            else if (w === 'music')    document.getElementById('widgetMusic').classList.remove('hidden');
            else if (w === 'settings') document.getElementById('widgetSettings').classList.remove('hidden');
        });
    });

    const dragHandle = document.getElementById('dragHandle');
    const mainTerm   = document.getElementById('mainTerminal');
    let isDrag = false, offX = 0, offY = 0;
    if (dragHandle && mainTerm) {
        dragHandle.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-controls')) return;
            isDrag = true;
            offX = e.clientX - mainTerm.offsetLeft;
            offY = e.clientY - mainTerm.offsetTop;
        });
    }
    window.addEventListener('mousemove', (e) => {
        if (!isDrag || !mainTerm) return;
        mainTerm.style.position = 'absolute';
        mainTerm.style.left = (e.clientX - offX) + 'px';
        mainTerm.style.top  = (e.clientY - offY) + 'px';
    });
    window.addEventListener('mouseup', () => isDrag = false);

    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
        window.addEventListener('resize', resize); resize();
        for (let i = 0; i < 60; i++) particles.push({
            x: Math.random() * canvas.width, y: Math.random() * canvas.height,
            r: Math.random() * 1.5 + 0.5, a: Math.random() * 0.4 + 0.1,
            vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.2
        });
        (function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
                ctx.fillStyle = `rgba(124,92,255,${p.a})`; ctx.fill();
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;
            });
            requestAnimationFrame(draw);
        })();
    }
})();