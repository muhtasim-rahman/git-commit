# GitCommit Pro v2

**GitCommit Pro v2** is a high-performance web utility designed to streamline the process of creating detailed, multiline Git commit messages. It bridges the gap between descriptive version control and the technical limitations of various terminal environments like Windows CMD, PowerShell, and Unix-based shells (Bash/Zsh/Termux).

---

## 📖 Introduction

In modern development workflows, meaningful commit messages are essential for maintainability. However, writing multiline messages directly in the terminal often leads to escaping errors, broken strings, or "pathspec" mismatches—especially on Windows systems.

GitCommit Pro v2 provides a clean, visual interface where developers can draft their release notes. It then intelligently compiles the input into a single-line command using the multiple `-m` flag strategy, ensuring 100% compatibility across all major shells.

## ✨ Key Features

### 1. Multi-Shell Optimization
The core engine detects and applies specific escaping rules for:
- **Bash / Zsh**: Standard Unix escaping for special characters.
- **PowerShell**: Backtick (`) escaping for internal quotes and variables.
- **Windows CMD**: Caret (^) escaping for symbols like `|`, `<`, and `>` to prevent command interruption.

### 2. Intelligent Line Preservation
Unlike simple text joiners, this tool preserves your formatting:
- Paragraph gaps are converted into empty `-m " "` flags.
- Bullet points and indented lists are kept intact within their respective flags.

### 3. Real-Time Logic
- **Live Preview**: See a simulated Git log output as you type.
- **Validation**: Automatically escapes double quotes within the message to prevent shell string termination.

### 4. Premium Interface
- **Responsive Design**: Fully optimized for Desktop, Tablet, and Mobile (Termux).
- **Dynamic Theming**: Native Dark and Light mode support with persistent user preference.
- **Minimalist Aesthetic**: Built with Tailwind CSS and Phosphor Icons for a clutter-free experience.

## 🛠 Technical Architecture

The application is built as a zero-dependency, client-side utility to ensure maximum speed and privacy.

| Component | Technology |
| :--- | :--- |
| **Styling** | Tailwind CSS (JIT) |
| **Logic** | Vanilla JavaScript (ES6+) |
| **Icons** | Phosphor Icons |
| **Font** | Inter (Sans) & Fira Code (Mono) |

## 🚀 How It Works

### The Multi-Flag Strategy
Instead of using `\n` or `$'\n'`, which behave inconsistently across operating systems, GitCommit Pro utilizes the official Git method of repeating the `-m` flag.

**Example Input:**
```text
v1.0.0 Initial Release
- Feature A
- Feature B
