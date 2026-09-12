<div align="center">

# ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

# 🚀 NOVA TERMINAL OS

### *A Fully-Featured Linux Terminal Emulator Running in Your Browser*

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

![Version](https://img.shields.io/badge/version-2.0.4-7c5cff?style=for-the-badge&logo=git)
![License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&logo=opensourceinitiative)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-f7df1e?style=for-the-badge&logo=javascript)
![HTML5](https://img.shields.io/badge/HTML5-FF6B6B?style=for-the-badge&logo=html5)
![CSS3](https://img.shields.io/badge/CSS3-2965F1?style=for-the-badge&logo=css3)

**No installation • No setup • Pure shell experience**

</div>

---

## 📖 **What is Nova Terminal OS?**

Nova Terminal OS is a **complete, browser-based Linux terminal simulation** that brings the power of command-line interfaces to your web browser. Built with pure HTML, CSS, and JavaScript, it provides a realistic terminal environment with a full virtual filesystem, extensive command set, and beautiful futuristic UI.

### 🎯 **Core Purpose**

This project aims to:
- **Educate users** about Linux commands and terminal workflows
- **Provide a safe environment** to practice Linux commands without any risk
- **Demonstrate** how terminal emulators work under the hood
- **Showcase** modern web technologies creating desktop-like experiences

### 💡 **Why Nova Terminal OS?**

Unlike other terminal simulators, Nova Terminal OS offers:
- ⚡ **Zero installation** - Works instantly in any modern browser
- 🎨 **Beautiful design** - Glass morphism, animations, particle effects
- 🔧 **Full command set** - 30+ Linux commands with realistic behavior
- 💾 **Persistent storage** - Files and notes survive browser refresh
- 🎮 **Interactive widgets** - Calculator, notes, file explorer, music player

---

## 📸 **Visual Showcase**

### 🏠 **The Launch Interface**
*Futuristic home screen with particle animations and system stats*

![Home Screen](screenshots/Screenshot%202026-05-20%20214708.png)

*The entry point - featuring animated background, system statistics preview, and cinematic boot sequence*

---

### 💻 **Terminal in Action**
*Full-featured terminal with categorized help system*

![Terminal Interface](screenshots/Screenshot%202026-05-20%20214942.png)

*Clean, readable output with color-coded commands and organized help menu*

---

### 📂 **File Operations Example**
*Creating, reading, and managing files like a real Linux system*

![File Operations](screenshots/Screenshot%202026-05-20%20215008.png)

---

### 🎮 **Hacking Simulation**
*Educational fun sequence demonstrating command animations*

![Hacking Simulation](screenshots/Screenshot%202026-05-20%20215023.png)

*Animated hacking sequence with progress bars and simulated access - for educational purposes only!*

---

### 📜 **Command History Tracking**
*Keep track of your terminal session activities*

![Command History](screenshots/Screenshot%202026-05-20%20215059.png)

*Every command is saved with numbered history - accessible with up/down arrows*

---

## 🔬 **Project Scope**

### **Technical Scope**

| Component | Implementation |
|-----------|---------------|
| **Frontend** | Pure HTML5, CSS3, JavaScript ES6 |
| **Architecture** | IIFE pattern, Command pattern, Event-driven |
| **Filesystem** | In-memory virtual filesystem with nested directories |
| **Storage** | localStorage for notes and persistent data |
| **Styling** | Glass morphism, CSS Grid, Flexbox, Keyframe animations |
| **Icons** | Font Awesome 6.0 |
| **Fonts** | JetBrains Mono, Space Grotesk |

### **Command Scope**

#### 📁 **Filesystem Commands** (11 commands)
- Navigation: `ls`, `cd`, `pwd`
- Directory management: `mkdir`, `rmdir` (via rm)
- File operations: `touch`, `rm`, `cat`, `tree`
- Advanced: `cp`, `mv`, `find`

#### ⚙️ **System Commands** (11 commands)
- Information: `date`, `time`, `whoami`, `uptime`
- System details: `sysinfo`, `neofetch`
- Process management: `ps`, `kill`
- Privileges: `sudo`
- Session: `exit`, `reset`

#### 🛠️ **Utility Commands** (4 commands)
- `echo` (with file redirection >)
- `clear`
- `history` (numbered with timestamps)
- `man` (built-in manual pages)

#### 🎮 **Fun Commands** (1 command)
- `hack` (animated 10-step sequence)

#### 📱 **Application Launchers** (5 apps)
- `calc` - Calculator widget
- `notes` - Persistent notes app
- `files` - GUI file explorer
- `music` - Music player widget
- `settings` - Theme preferences

### **Filesystem Structure**


---

## 💻 **Live Examples**

### **Example 1: Basic File Operations**
```bash
nova@os:~$ ls
welcome.txt  config.json  projects/

nova@os:~$ echo "My first file" > myfile.txt
Created/updated file: myfile.txt

nova@os:~$ cat myfile.txt
My first file

nova@os:~$ rm myfile.txt
Removed: myfile.txt

nova@os:~$ mkdir myfolder
Created directory: myfolder

nova@os:~$ cd myfolder
nova@os:~/myfolder$ pwd
/home/nova/myfolder

nova@os:~/myfolder$ touch file1.txt file2.txt
Created file: file1.txt
Created file: file2.txt

nova@os:~/myfolder$ ls
file1.txt  file2.txt

nova@os:~/myfolder$ cd ..
nova@os:~$ rm myfolder
Removed: myfolder

nova@os:~$ echo "Content" > source.txt
Created/updated file: source.txt

nova@os:~$ cp source.txt destination.txt
Copied 'source.txt' to 'destination.txt'

nova@os:~$ mv destination.txt moved.txt
Moved 'destination.txt' to 'moved.txt'

nova@os:~$ ls
source.txt  moved.txt

nova@os:~$ find txt
Found 2 result(s):
/home/nova/welcome.txt
/home/nova/source.txt

nova@os:~$ ps
PID  NAME              STATUS   CPU    MEM
101  nova-shell        running  1.2%   8.4MB
102  systemd           running  0.3%   12.1MB
103  window-manager    running  2.1%   45.6MB

nova@os:~$ kill 103
Terminated process: window-manager (103)

nova@os:~$ hack
Initializing hacking sequence...
Bypassing firewalls... ███░░░░░░░░ 25%
Cracking encryption... ██████░░░░ 50%
Accessing mainframe... ██████████ 75%
Downloading sensitive data...
⚠️ ACCESS GRANTED ⚠️

🎉 Congratulations! You've hacked the Nova mainframe! 🎉
This is a simulated hacking sequence for educational purposes.
Remember: Real hacking without permission is illegal!

---

🚀 Ready to explore the terminal?**

© 2026 Nova Terminal OS
