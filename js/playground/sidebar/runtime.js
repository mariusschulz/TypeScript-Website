define(["require", "exports", "../createUI", "../localizeWithFallback"], function (require, exports, createUI_1, localizeWithFallback_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.runWithCustomLogs = exports.clearLogs = exports.runPlugin = void 0;
    const allLogs = [];
    let offset = 0;
    let curLog = 0;
    let addedClearAction = false;
    const runPlugin = (i, utils) => {
        const plugin = {
            id: "logs",
            displayName: i("play_sidebar_logs"),
            willMount: (sandbox, container) => {
                if (!addedClearAction) {
                    const ui = createUI_1.createUI();
                    addClearAction(sandbox, ui, i);
                    addedClearAction = true;
                }
                if (allLogs.length === 0) {
                    const noErrorsMessage = document.createElement("div");
                    noErrorsMessage.id = "empty-message-container";
                    container.appendChild(noErrorsMessage);
                    const message = document.createElement("div");
                    message.textContent = localizeWithFallback_1.localize("play_sidebar_logs_no_logs", "No logs");
                    message.classList.add("empty-plugin-message");
                    noErrorsMessage.appendChild(message);
                }
                const errorUL = document.createElement("div");
                errorUL.id = "log-container";
                container.appendChild(errorUL);
                const logs = document.createElement("div");
                logs.id = "log";
                logs.innerHTML = allLogs.join('<hr />');
                errorUL.appendChild(logs);
            },
        };
        return plugin;
    };
    exports.runPlugin = runPlugin;
    const clearLogs = () => {
        offset += allLogs.length;
        allLogs.length = 0;
        const logs = document.getElementById("log");
        if (logs) {
            logs.textContent = "";
        }
    };
    exports.clearLogs = clearLogs;
    const runWithCustomLogs = (closure, i) => {
        const noLogs = document.getElementById("empty-message-container");
        if (noLogs) {
            noLogs.style.display = "none";
        }
        rewireLoggingToElement(() => document.getElementById("log"), () => document.getElementById("log-container"), closure, true, i);
    };
    exports.runWithCustomLogs = runWithCustomLogs;
    // Thanks SO: https://stackoverflow.com/questions/20256760/javascript-console-log-to-html/35449256#35449256
    function rewireLoggingToElement(eleLocator, eleOverflowLocator, closure, autoScroll, i) {
        const rawConsole = console;
        closure.then(js => {
            try {
                const replace = {};
                bindLoggingFunc(replace, rawConsole, 'log', 'LOG', curLog);
                bindLoggingFunc(replace, rawConsole, 'debug', 'DBG', curLog);
                bindLoggingFunc(replace, rawConsole, 'warn', 'WRN', curLog);
                bindLoggingFunc(replace, rawConsole, 'error', 'ERR', curLog);
                replace['clear'] = exports.clearLogs;
                const console = Object.assign({}, rawConsole, replace);
                eval(js);
            }
            catch (error) {
                console.error(i("play_run_js_fail"));
                console.error(error);
            }
            curLog++;
        });
        function bindLoggingFunc(obj, raw, name, id, cur) {
            obj[name] = function (...objs) {
                var _a;
                const output = produceOutput(objs);
                const eleLog = eleLocator();
                const prefix = `[<span class="log-${name}">${id}</span>]: `;
                const eleContainerLog = eleOverflowLocator();
                const index = cur - offset;
                if (index >= 0) {
                    allLogs[index] = ((_a = allLogs[index]) !== null && _a !== void 0 ? _a : '') + prefix + output + "<br>";
                }
                eleLog.innerHTML = allLogs.join("<hr />");
                const scrollElement = eleContainerLog.parentElement;
                if (autoScroll && scrollElement) {
                    scrollToBottom(scrollElement);
                }
                raw[name](...objs);
            };
        }
        function scrollToBottom(element) {
            const overflowHeight = element.scrollHeight - element.clientHeight;
            const atBottom = element.scrollTop >= overflowHeight;
            if (!atBottom) {
                element.scrollTop = overflowHeight;
            }
        }
        const objectToText = (arg) => {
            const isObj = typeof arg === "object";
            let textRep = "";
            if (arg && arg.stack && arg.message) {
                // special case for err
                textRep = arg.message;
            }
            else if (arg === null) {
                textRep = "<span class='literal'>null</span>";
            }
            else if (arg === undefined) {
                textRep = "<span class='literal'>undefined</span>";
            }
            else if (Array.isArray(arg)) {
                textRep = "[" + arg.map(objectToText).join("<span class='comma'>, </span>") + "]";
            }
            else if (typeof arg === "string") {
                textRep = '"' + arg + '"';
            }
            else if (isObj) {
                const name = arg.constructor && arg.constructor.name;
                // No one needs to know an obj is an obj
                const nameWithoutObject = name && name === "Object" ? "" : name;
                const prefix = nameWithoutObject ? `${nameWithoutObject}: ` : "";
                textRep = prefix + JSON.stringify(arg, null, 2);
            }
            else {
                textRep = arg;
            }
            return textRep;
        };
        function produceOutput(args) {
            return args.reduce((output, arg, index) => {
                const textRep = objectToText(arg);
                const showComma = index !== args.length - 1;
                const comma = showComma ? "<span class='comma'>, </span>" : "";
                return output + textRep + comma + "&nbsp;";
            }, "");
        }
    }
    const addClearAction = (sandbox, ui, i) => {
        const clearLogsAction = {
            id: "clear-logs-play",
            label: "Clear Playground Logs",
            keybindings: [sandbox.monaco.KeyMod.CtrlCmd | sandbox.monaco.KeyCode.KEY_K],
            contextMenuGroupId: "run",
            contextMenuOrder: 1.5,
            run: function () {
                exports.clearLogs();
                ui.flashInfo(i("play_clear_logs"));
            },
        };
        sandbox.editor.addAction(clearLogsAction);
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BsYXlncm91bmQvc3JjL3NpZGViYXIvcnVudGltZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBS0EsTUFBTSxPQUFPLEdBQWEsRUFBRSxDQUFBO0lBQzVCLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQTtJQUNkLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQTtJQUNkLElBQUksZ0JBQWdCLEdBQUcsS0FBSyxDQUFBO0lBRXJCLE1BQU0sU0FBUyxHQUFrQixDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRTtRQUNuRCxNQUFNLE1BQU0sR0FBcUI7WUFDL0IsRUFBRSxFQUFFLE1BQU07WUFDVixXQUFXLEVBQUUsQ0FBQyxDQUFDLG1CQUFtQixDQUFDO1lBQ25DLFNBQVMsRUFBRSxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsRUFBRTtnQkFDaEMsSUFBSSxDQUFDLGdCQUFnQixFQUFFO29CQUNyQixNQUFNLEVBQUUsR0FBRyxtQkFBUSxFQUFFLENBQUE7b0JBQ3JCLGNBQWMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO29CQUM5QixnQkFBZ0IsR0FBRyxJQUFJLENBQUE7aUJBQ3hCO2dCQUVELElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQ3hCLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7b0JBQ3JELGVBQWUsQ0FBQyxFQUFFLEdBQUcseUJBQXlCLENBQUE7b0JBQzlDLFNBQVMsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUE7b0JBRXRDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7b0JBQzdDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsK0JBQVEsQ0FBQywyQkFBMkIsRUFBRSxTQUFTLENBQUMsQ0FBQTtvQkFDdEUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtvQkFDN0MsZUFBZSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQTtpQkFDckM7Z0JBRUQsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtnQkFDN0MsT0FBTyxDQUFDLEVBQUUsR0FBRyxlQUFlLENBQUE7Z0JBQzVCLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUE7Z0JBRTlCLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7Z0JBQzFDLElBQUksQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFBO2dCQUNmLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtnQkFDdkMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUMzQixDQUFDO1NBQ0YsQ0FBQTtRQUVELE9BQU8sTUFBTSxDQUFBO0lBQ2YsQ0FBQyxDQUFBO0lBbENZLFFBQUEsU0FBUyxhQWtDckI7SUFFTSxNQUFNLFNBQVMsR0FBRyxHQUFHLEVBQUU7UUFDNUIsTUFBTSxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUE7UUFDeEIsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUE7UUFDbEIsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUMzQyxJQUFJLElBQUksRUFBRTtZQUNSLElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFBO1NBQ3RCO0lBQ0gsQ0FBQyxDQUFBO0lBUFksUUFBQSxTQUFTLGFBT3JCO0lBRU0sTUFBTSxpQkFBaUIsR0FBRyxDQUFDLE9BQXdCLEVBQUUsQ0FBVyxFQUFFLEVBQUU7UUFDekUsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFBO1FBQ2pFLElBQUksTUFBTSxFQUFFO1lBQ1YsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFBO1NBQzlCO1FBRUQsc0JBQXNCLENBQ3BCLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFFLEVBQ3JDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFFLEVBQy9DLE9BQU8sRUFDUCxJQUFJLEVBQ0osQ0FBQyxDQUNGLENBQUE7SUFDSCxDQUFDLENBQUE7SUFiWSxRQUFBLGlCQUFpQixxQkFhN0I7SUFFRCwyR0FBMkc7SUFFM0csU0FBUyxzQkFBc0IsQ0FDN0IsVUFBeUIsRUFDekIsa0JBQWlDLEVBQ2pDLE9BQXdCLEVBQ3hCLFVBQW1CLEVBQ25CLENBQVc7UUFHWCxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUE7UUFFMUIsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUNoQixJQUFJO2dCQUNGLE1BQU0sT0FBTyxHQUFHLEVBQVMsQ0FBQTtnQkFDekIsZUFBZSxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQTtnQkFDMUQsZUFBZSxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQTtnQkFDNUQsZUFBZSxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQTtnQkFDM0QsZUFBZSxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQTtnQkFDNUQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLGlCQUFTLENBQUE7Z0JBQzVCLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQTtnQkFDdEQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO2FBQ1Q7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDZCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUE7Z0JBQ3BDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7YUFDckI7WUFDRCxNQUFNLEVBQUUsQ0FBQTtRQUNWLENBQUMsQ0FBQyxDQUFBO1FBRUYsU0FBUyxlQUFlLENBQUMsR0FBUSxFQUFFLEdBQVEsRUFBRSxJQUFZLEVBQUUsRUFBVSxFQUFFLEdBQVc7WUFDaEYsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLFVBQVUsR0FBRyxJQUFXOztnQkFDbEMsTUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUNsQyxNQUFNLE1BQU0sR0FBRyxVQUFVLEVBQUUsQ0FBQTtnQkFDM0IsTUFBTSxNQUFNLEdBQUcscUJBQXFCLElBQUksS0FBSyxFQUFFLFlBQVksQ0FBQTtnQkFDM0QsTUFBTSxlQUFlLEdBQUcsa0JBQWtCLEVBQUUsQ0FBQTtnQkFDNUMsTUFBTSxLQUFLLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQTtnQkFDMUIsSUFBSSxLQUFLLElBQUksQ0FBQyxFQUFFO29CQUNkLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsbUNBQUksRUFBRSxDQUFDLEdBQUcsTUFBTSxHQUFHLE1BQU0sR0FBRyxNQUFNLENBQUE7aUJBQ25FO2dCQUNELE1BQU0sQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtnQkFDekMsTUFBTSxhQUFhLEdBQUcsZUFBZSxDQUFDLGFBQWEsQ0FBQTtnQkFDbkQsSUFBSSxVQUFVLElBQUksYUFBYSxFQUFFO29CQUMvQixjQUFjLENBQUMsYUFBYSxDQUFDLENBQUE7aUJBQzlCO2dCQUNELEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFBO1lBQ3BCLENBQUMsQ0FBQTtRQUNILENBQUM7UUFFRCxTQUFTLGNBQWMsQ0FBQyxPQUFnQjtZQUN0QyxNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUE7WUFDbEUsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFNBQVMsSUFBSSxjQUFjLENBQUE7WUFDcEQsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDYixPQUFPLENBQUMsU0FBUyxHQUFHLGNBQWMsQ0FBQTthQUNuQztRQUNILENBQUM7UUFFRCxNQUFNLFlBQVksR0FBRyxDQUFDLEdBQVEsRUFBVSxFQUFFO1lBQ3hDLE1BQU0sS0FBSyxHQUFHLE9BQU8sR0FBRyxLQUFLLFFBQVEsQ0FBQTtZQUNyQyxJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUE7WUFDaEIsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUMsT0FBTyxFQUFFO2dCQUNuQyx1QkFBdUI7Z0JBQ3ZCLE9BQU8sR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFBO2FBQ3RCO2lCQUFNLElBQUksR0FBRyxLQUFLLElBQUksRUFBRTtnQkFDdkIsT0FBTyxHQUFHLG1DQUFtQyxDQUFBO2FBQzlDO2lCQUFNLElBQUksR0FBRyxLQUFLLFNBQVMsRUFBRTtnQkFDNUIsT0FBTyxHQUFHLHdDQUF3QyxDQUFBO2FBQ25EO2lCQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDN0IsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxHQUFHLEdBQUcsQ0FBQTthQUNsRjtpQkFBTSxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsRUFBRTtnQkFDbEMsT0FBTyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFBO2FBQzFCO2lCQUFNLElBQUksS0FBSyxFQUFFO2dCQUNoQixNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsV0FBVyxJQUFJLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFBO2dCQUNwRCx3Q0FBd0M7Z0JBQ3hDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxJQUFJLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFBO2dCQUMvRCxNQUFNLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsR0FBRyxpQkFBaUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUE7Z0JBQ2hFLE9BQU8sR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFBO2FBQ2hEO2lCQUFNO2dCQUNMLE9BQU8sR0FBRyxHQUFVLENBQUE7YUFDckI7WUFDRCxPQUFPLE9BQU8sQ0FBQTtRQUNoQixDQUFDLENBQUE7UUFFRCxTQUFTLGFBQWEsQ0FBQyxJQUFXO1lBQ2hDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQVcsRUFBRSxHQUFRLEVBQUUsS0FBSyxFQUFFLEVBQUU7Z0JBQ2xELE1BQU0sT0FBTyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQTtnQkFDakMsTUFBTSxTQUFTLEdBQUcsS0FBSyxLQUFLLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFBO2dCQUMzQyxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLCtCQUErQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUE7Z0JBQzlELE9BQU8sTUFBTSxHQUFHLE9BQU8sR0FBRyxLQUFLLEdBQUcsUUFBUSxDQUFBO1lBQzVDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUNSLENBQUM7SUFDSCxDQUFDO0lBRUQsTUFBTSxjQUFjLEdBQUcsQ0FBQyxPQUFnQixFQUFFLEVBQU0sRUFBRSxDQUFNLEVBQUUsRUFBRTtRQUMxRCxNQUFNLGVBQWUsR0FBRztZQUN0QixFQUFFLEVBQUUsaUJBQWlCO1lBQ3JCLEtBQUssRUFBRSx1QkFBdUI7WUFDOUIsV0FBVyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztZQUUzRSxrQkFBa0IsRUFBRSxLQUFLO1lBQ3pCLGdCQUFnQixFQUFFLEdBQUc7WUFFckIsR0FBRyxFQUFFO2dCQUNILGlCQUFTLEVBQUUsQ0FBQTtnQkFDWCxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUE7WUFDcEMsQ0FBQztTQUNGLENBQUE7UUFFRCxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQTtJQUMzQyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTYW5kYm94IH0gZnJvbSBcInR5cGVzY3JpcHRsYW5nLW9yZy9zdGF0aWMvanMvc2FuZGJveFwiXG5pbXBvcnQgeyBQbGF5Z3JvdW5kUGx1Z2luLCBQbHVnaW5GYWN0b3J5IH0gZnJvbSBcIi4uXCJcbmltcG9ydCB7IGNyZWF0ZVVJLCBVSSB9IGZyb20gXCIuLi9jcmVhdGVVSVwiXG5pbXBvcnQgeyBsb2NhbGl6ZSB9IGZyb20gXCIuLi9sb2NhbGl6ZVdpdGhGYWxsYmFja1wiXG5cbmNvbnN0IGFsbExvZ3M6IHN0cmluZ1tdID0gW11cbmxldCBvZmZzZXQgPSAwXG5sZXQgY3VyTG9nID0gMFxubGV0IGFkZGVkQ2xlYXJBY3Rpb24gPSBmYWxzZVxuXG5leHBvcnQgY29uc3QgcnVuUGx1Z2luOiBQbHVnaW5GYWN0b3J5ID0gKGksIHV0aWxzKSA9PiB7XG4gIGNvbnN0IHBsdWdpbjogUGxheWdyb3VuZFBsdWdpbiA9IHtcbiAgICBpZDogXCJsb2dzXCIsXG4gICAgZGlzcGxheU5hbWU6IGkoXCJwbGF5X3NpZGViYXJfbG9nc1wiKSxcbiAgICB3aWxsTW91bnQ6IChzYW5kYm94LCBjb250YWluZXIpID0+IHtcbiAgICAgIGlmICghYWRkZWRDbGVhckFjdGlvbikge1xuICAgICAgICBjb25zdCB1aSA9IGNyZWF0ZVVJKClcbiAgICAgICAgYWRkQ2xlYXJBY3Rpb24oc2FuZGJveCwgdWksIGkpXG4gICAgICAgIGFkZGVkQ2xlYXJBY3Rpb24gPSB0cnVlXG4gICAgICB9XG5cbiAgICAgIGlmIChhbGxMb2dzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBjb25zdCBub0Vycm9yc01lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXG4gICAgICAgIG5vRXJyb3JzTWVzc2FnZS5pZCA9IFwiZW1wdHktbWVzc2FnZS1jb250YWluZXJcIlxuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQobm9FcnJvcnNNZXNzYWdlKVxuXG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXG4gICAgICAgIG1lc3NhZ2UudGV4dENvbnRlbnQgPSBsb2NhbGl6ZShcInBsYXlfc2lkZWJhcl9sb2dzX25vX2xvZ3NcIiwgXCJObyBsb2dzXCIpXG4gICAgICAgIG1lc3NhZ2UuY2xhc3NMaXN0LmFkZChcImVtcHR5LXBsdWdpbi1tZXNzYWdlXCIpXG4gICAgICAgIG5vRXJyb3JzTWVzc2FnZS5hcHBlbmRDaGlsZChtZXNzYWdlKVxuICAgICAgfVxuXG4gICAgICBjb25zdCBlcnJvclVMID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuICAgICAgZXJyb3JVTC5pZCA9IFwibG9nLWNvbnRhaW5lclwiXG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZXJyb3JVTClcblxuICAgICAgY29uc3QgbG9ncyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcbiAgICAgIGxvZ3MuaWQgPSBcImxvZ1wiXG4gICAgICBsb2dzLmlubmVySFRNTCA9IGFsbExvZ3Muam9pbignPGhyIC8+JylcbiAgICAgIGVycm9yVUwuYXBwZW5kQ2hpbGQobG9ncylcbiAgICB9LFxuICB9XG5cbiAgcmV0dXJuIHBsdWdpblxufVxuXG5leHBvcnQgY29uc3QgY2xlYXJMb2dzID0gKCkgPT4ge1xuICBvZmZzZXQgKz0gYWxsTG9ncy5sZW5ndGhcbiAgYWxsTG9ncy5sZW5ndGggPSAwXG4gIGNvbnN0IGxvZ3MgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvZ1wiKVxuICBpZiAobG9ncykge1xuICAgIGxvZ3MudGV4dENvbnRlbnQgPSBcIlwiXG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IHJ1bldpdGhDdXN0b21Mb2dzID0gKGNsb3N1cmU6IFByb21pc2U8c3RyaW5nPiwgaTogRnVuY3Rpb24pID0+IHtcbiAgY29uc3Qgbm9Mb2dzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbXB0eS1tZXNzYWdlLWNvbnRhaW5lclwiKVxuICBpZiAobm9Mb2dzKSB7XG4gICAgbm9Mb2dzLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxuICB9XG5cbiAgcmV3aXJlTG9nZ2luZ1RvRWxlbWVudChcbiAgICAoKSA9PiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvZ1wiKSEsXG4gICAgKCkgPT4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2ctY29udGFpbmVyXCIpISxcbiAgICBjbG9zdXJlLFxuICAgIHRydWUsXG4gICAgaVxuICApXG59XG5cbi8vIFRoYW5rcyBTTzogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjAyNTY3NjAvamF2YXNjcmlwdC1jb25zb2xlLWxvZy10by1odG1sLzM1NDQ5MjU2IzM1NDQ5MjU2XG5cbmZ1bmN0aW9uIHJld2lyZUxvZ2dpbmdUb0VsZW1lbnQoXG4gIGVsZUxvY2F0b3I6ICgpID0+IEVsZW1lbnQsXG4gIGVsZU92ZXJmbG93TG9jYXRvcjogKCkgPT4gRWxlbWVudCxcbiAgY2xvc3VyZTogUHJvbWlzZTxzdHJpbmc+LFxuICBhdXRvU2Nyb2xsOiBib29sZWFuLFxuICBpOiBGdW5jdGlvblxuKSB7XG5cbiAgY29uc3QgcmF3Q29uc29sZSA9IGNvbnNvbGVcblxuICBjbG9zdXJlLnRoZW4oanMgPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXBsYWNlID0ge30gYXMgYW55XG4gICAgICBiaW5kTG9nZ2luZ0Z1bmMocmVwbGFjZSwgcmF3Q29uc29sZSwgJ2xvZycsICdMT0cnLCBjdXJMb2cpXG4gICAgICBiaW5kTG9nZ2luZ0Z1bmMocmVwbGFjZSwgcmF3Q29uc29sZSwgJ2RlYnVnJywgJ0RCRycsIGN1ckxvZylcbiAgICAgIGJpbmRMb2dnaW5nRnVuYyhyZXBsYWNlLCByYXdDb25zb2xlLCAnd2FybicsICdXUk4nLCBjdXJMb2cpXG4gICAgICBiaW5kTG9nZ2luZ0Z1bmMocmVwbGFjZSwgcmF3Q29uc29sZSwgJ2Vycm9yJywgJ0VSUicsIGN1ckxvZylcbiAgICAgIHJlcGxhY2VbJ2NsZWFyJ10gPSBjbGVhckxvZ3NcbiAgICAgIGNvbnN0IGNvbnNvbGUgPSBPYmplY3QuYXNzaWduKHt9LCByYXdDb25zb2xlLCByZXBsYWNlKVxuICAgICAgZXZhbChqcylcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihpKFwicGxheV9ydW5fanNfZmFpbFwiKSlcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpXG4gICAgfVxuICAgIGN1ckxvZysrXG4gIH0pXG5cbiAgZnVuY3Rpb24gYmluZExvZ2dpbmdGdW5jKG9iajogYW55LCByYXc6IGFueSwgbmFtZTogc3RyaW5nLCBpZDogc3RyaW5nLCBjdXI6IG51bWJlcikge1xuICAgIG9ialtuYW1lXSA9IGZ1bmN0aW9uICguLi5vYmpzOiBhbnlbXSkge1xuICAgICAgY29uc3Qgb3V0cHV0ID0gcHJvZHVjZU91dHB1dChvYmpzKVxuICAgICAgY29uc3QgZWxlTG9nID0gZWxlTG9jYXRvcigpXG4gICAgICBjb25zdCBwcmVmaXggPSBgWzxzcGFuIGNsYXNzPVwibG9nLSR7bmFtZX1cIj4ke2lkfTwvc3Bhbj5dOiBgXG4gICAgICBjb25zdCBlbGVDb250YWluZXJMb2cgPSBlbGVPdmVyZmxvd0xvY2F0b3IoKVxuICAgICAgY29uc3QgaW5kZXggPSBjdXIgLSBvZmZzZXRcbiAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgIGFsbExvZ3NbaW5kZXhdID0gKGFsbExvZ3NbaW5kZXhdID8/ICcnKSArIHByZWZpeCArIG91dHB1dCArIFwiPGJyPlwiXG4gICAgICB9XG4gICAgICBlbGVMb2cuaW5uZXJIVE1MID0gYWxsTG9ncy5qb2luKFwiPGhyIC8+XCIpXG4gICAgICBjb25zdCBzY3JvbGxFbGVtZW50ID0gZWxlQ29udGFpbmVyTG9nLnBhcmVudEVsZW1lbnRcbiAgICAgIGlmIChhdXRvU2Nyb2xsICYmIHNjcm9sbEVsZW1lbnQpIHtcbiAgICAgICAgc2Nyb2xsVG9Cb3R0b20oc2Nyb2xsRWxlbWVudClcbiAgICAgIH1cbiAgICAgIHJhd1tuYW1lXSguLi5vYmpzKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNjcm9sbFRvQm90dG9tKGVsZW1lbnQ6IEVsZW1lbnQpIHtcbiAgICBjb25zdCBvdmVyZmxvd0hlaWdodCA9IGVsZW1lbnQuc2Nyb2xsSGVpZ2h0IC0gZWxlbWVudC5jbGllbnRIZWlnaHRcbiAgICBjb25zdCBhdEJvdHRvbSA9IGVsZW1lbnQuc2Nyb2xsVG9wID49IG92ZXJmbG93SGVpZ2h0XG4gICAgaWYgKCFhdEJvdHRvbSkge1xuICAgICAgZWxlbWVudC5zY3JvbGxUb3AgPSBvdmVyZmxvd0hlaWdodFxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG9iamVjdFRvVGV4dCA9IChhcmc6IGFueSk6IHN0cmluZyA9PiB7XG4gICAgY29uc3QgaXNPYmogPSB0eXBlb2YgYXJnID09PSBcIm9iamVjdFwiXG4gICAgbGV0IHRleHRSZXAgPSBcIlwiXG4gICAgaWYgKGFyZyAmJiBhcmcuc3RhY2sgJiYgYXJnLm1lc3NhZ2UpIHtcbiAgICAgIC8vIHNwZWNpYWwgY2FzZSBmb3IgZXJyXG4gICAgICB0ZXh0UmVwID0gYXJnLm1lc3NhZ2VcbiAgICB9IGVsc2UgaWYgKGFyZyA9PT0gbnVsbCkge1xuICAgICAgdGV4dFJlcCA9IFwiPHNwYW4gY2xhc3M9J2xpdGVyYWwnPm51bGw8L3NwYW4+XCJcbiAgICB9IGVsc2UgaWYgKGFyZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0ZXh0UmVwID0gXCI8c3BhbiBjbGFzcz0nbGl0ZXJhbCc+dW5kZWZpbmVkPC9zcGFuPlwiXG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGFyZykpIHtcbiAgICAgIHRleHRSZXAgPSBcIltcIiArIGFyZy5tYXAob2JqZWN0VG9UZXh0KS5qb2luKFwiPHNwYW4gY2xhc3M9J2NvbW1hJz4sIDwvc3Bhbj5cIikgKyBcIl1cIlxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyZyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgdGV4dFJlcCA9ICdcIicgKyBhcmcgKyAnXCInXG4gICAgfSBlbHNlIGlmIChpc09iaikge1xuICAgICAgY29uc3QgbmFtZSA9IGFyZy5jb25zdHJ1Y3RvciAmJiBhcmcuY29uc3RydWN0b3IubmFtZVxuICAgICAgLy8gTm8gb25lIG5lZWRzIHRvIGtub3cgYW4gb2JqIGlzIGFuIG9ialxuICAgICAgY29uc3QgbmFtZVdpdGhvdXRPYmplY3QgPSBuYW1lICYmIG5hbWUgPT09IFwiT2JqZWN0XCIgPyBcIlwiIDogbmFtZVxuICAgICAgY29uc3QgcHJlZml4ID0gbmFtZVdpdGhvdXRPYmplY3QgPyBgJHtuYW1lV2l0aG91dE9iamVjdH06IGAgOiBcIlwiXG4gICAgICB0ZXh0UmVwID0gcHJlZml4ICsgSlNPTi5zdHJpbmdpZnkoYXJnLCBudWxsLCAyKVxuICAgIH0gZWxzZSB7XG4gICAgICB0ZXh0UmVwID0gYXJnIGFzIGFueVxuICAgIH1cbiAgICByZXR1cm4gdGV4dFJlcFxuICB9XG5cbiAgZnVuY3Rpb24gcHJvZHVjZU91dHB1dChhcmdzOiBhbnlbXSkge1xuICAgIHJldHVybiBhcmdzLnJlZHVjZSgob3V0cHV0OiBhbnksIGFyZzogYW55LCBpbmRleCkgPT4ge1xuICAgICAgY29uc3QgdGV4dFJlcCA9IG9iamVjdFRvVGV4dChhcmcpXG4gICAgICBjb25zdCBzaG93Q29tbWEgPSBpbmRleCAhPT0gYXJncy5sZW5ndGggLSAxXG4gICAgICBjb25zdCBjb21tYSA9IHNob3dDb21tYSA/IFwiPHNwYW4gY2xhc3M9J2NvbW1hJz4sIDwvc3Bhbj5cIiA6IFwiXCJcbiAgICAgIHJldHVybiBvdXRwdXQgKyB0ZXh0UmVwICsgY29tbWEgKyBcIiZuYnNwO1wiXG4gICAgfSwgXCJcIilcbiAgfVxufVxuXG5jb25zdCBhZGRDbGVhckFjdGlvbiA9IChzYW5kYm94OiBTYW5kYm94LCB1aTogVUksIGk6IGFueSkgPT4ge1xuICBjb25zdCBjbGVhckxvZ3NBY3Rpb24gPSB7XG4gICAgaWQ6IFwiY2xlYXItbG9ncy1wbGF5XCIsXG4gICAgbGFiZWw6IFwiQ2xlYXIgUGxheWdyb3VuZCBMb2dzXCIsXG4gICAga2V5YmluZGluZ3M6IFtzYW5kYm94Lm1vbmFjby5LZXlNb2QuQ3RybENtZCB8IHNhbmRib3gubW9uYWNvLktleUNvZGUuS0VZX0tdLFxuXG4gICAgY29udGV4dE1lbnVHcm91cElkOiBcInJ1blwiLFxuICAgIGNvbnRleHRNZW51T3JkZXI6IDEuNSxcblxuICAgIHJ1bjogZnVuY3Rpb24gKCkge1xuICAgICAgY2xlYXJMb2dzKClcbiAgICAgIHVpLmZsYXNoSW5mbyhpKFwicGxheV9jbGVhcl9sb2dzXCIpKVxuICAgIH0sXG4gIH1cblxuICBzYW5kYm94LmVkaXRvci5hZGRBY3Rpb24oY2xlYXJMb2dzQWN0aW9uKVxufVxuIl19