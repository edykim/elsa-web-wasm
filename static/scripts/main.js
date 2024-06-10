// requires @wasmer/sdk
const { init, runWasix, Directory } = WasmerSDK;

async function initialize() {
    await init();
    const moduleBytes = fetch("/assets/elsa.wasm");
    return await WebAssembly.compileStreaming(moduleBytes);
}

async function runElsa(module, file) {
    const dir = new Directory();
    const encoder = new TextEncoder();
    await dir.writeFile("workspace.lc", encoder.encode(file));

    const instance = await runWasix(module, {
        program: "elsa",
        args: ["--wasm", "/app/workspace.lc"],
        mount: {
            "/app": dir,
        },
    });

    const result = await instance.wait();
    return result.ok ? result.stdout : result.stderr;
}

function debounce(func, delay) {
    let timer;

    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
    }
}

function setupWorker() {
    const _Worker = window.Worker;

    window.Worker = function (file) {
        const w = new _Worker(file);

        // worker lives approx 3 sec
        setTimeout(() => {
            w.terminate();
        }, 3000);
        return w;
    }
}

function setupExamples() {
    if (examples) {
        window.addEventListener("DOMContentLoaded", () => {
            const select = document.querySelector("#demo-select");
            const f = (file, el) => {
                if (file.filename) {
                    const item = document.createElement("option");
                    item.setAttribute("value", file.filename);
                    item.textContent = file.name;
                    el.appendChild(item);
                    return;
                }
                if (file.files) {
                    const group = document.createElement("optgroup");
                    group.setAttribute("label", file.name);
                    file.files.forEach(x => f(x, group));
                    el.appendChild(group);
                    return;
                }
            }
            examples.forEach(example => f(example, select));
            select.addEventListener("change", async (event) => {
                if (event.target.value == "") return;
                const res = await fetch(`/${event.target.value}`);
                const text = await res.text(); 
                window.editor.setValue(text);
            });
        });
    }
}

function message(text) {
    if (text.includes("**** OK ****")) {
        return "**** OK ****";
    }
    return text;
}

function updateEditorWithResult(data) {
    if (data.startsWith("Errors found!")) {
        const rows = data.split("/app/workspace.lc");
        rows.shift(); // error line
        const markers = rows.map(item => {
            const [_, line, col, ...rest] = item.split(":");
            const [start, end] = col.split('-');
            return {
                startLineNumber: parseInt(line),
                endLineNumber: parseInt(line),
                startColumn: parseInt(start),
                endColumn: parseInt(end),
                message: rest.join("").trim(),
                severity: monaco.MarkerSeverity.Error,
            }
        });
        window.monaco.editor.setModelMarkers(
            window.editor.getModel(),
            "elsa-eval",
            markers)
    } else {
        window.monaco.editor.setModelMarkers(
            window.editor.getModel(),
            "elsa-eval",
            [])
    }
}


async function main() {
    setupWorker();
    setupExamples();
    const module = await initialize();

    const _runElsa = debounce(async (value) => {
        const result = await runElsa(module, value);
        document.querySelector(".checker").textContent = message(result);
        updateEditorWithResult(result);
    }, 400);

    const registerElsa = () => {
        try {
            window.editor.getModel().onDidChangeContent(async (event) => {
                _runElsa(window.editor.getValue());
            });
        } catch (e) {
            setTimeout(() => registerElsa(), 100);
        }
    };
    registerElsa();
}

main();

