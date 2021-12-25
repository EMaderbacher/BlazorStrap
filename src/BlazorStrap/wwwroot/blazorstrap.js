﻿// noinspection JSUnusedGlobalSymbols

window.blazorStrap = {
    EventHandlers: [],
    AddEvent: async function (id, name, type, isDocument = false, ignoreChildren = false, filter = "") {
        return new Promise(function (resolve) {
            let element;
            if (isDocument)
                element = document;
            else
                element = document.querySelector("[data-blazorstrap='" + id + "']");
            if (blazorStrap.EventHandlers[id] === undefined) {
                blazorStrap.EventHandlers[id] = {};
            }
            blazorStrap.EventHandlers[id][name] = {
                [type]: {
                    Callback: function (event) {
                        if (name === "documentDropdown") {
                            let parent = document.querySelector("[data-blazorstrap='" + id + "']");
                            if (parent !== null) {
                                if (parent.contains(event.target)) {
                                    if (event.target.classList.contains("dropdown-toggle")) {
                                        return;
                                    }
                                }
                            }
                        }
                        if (ignoreChildren) {
                            let parent = document.querySelector("[data-blazorstrap='" + id + "']");
                            if (parent !== null) {
                                if (parent.contains(event.target))
                                    return;
                            }
                        }
                        if (filter === "") {
                            // noinspection JSUnresolvedVariable,JSUnresolvedFunction
                            DotNet.invokeMethodAsync("BlazorStrap", "EventCallback", id, name, type, element.classList, blazorStrap.GetEvents(event));
                        } else if (element.getElementsByClassName(filter)) {
                            // noinspection JSUnresolvedVariable,JSUnresolvedFunction
                            DotNet.invokeMethodAsync("BlazorStrap", "EventCallback", id, name, type, element.classList, blazorStrap.GetEvents(event));
                        }
                    }
                }
            }

            element.addEventListener(type, blazorStrap.EventHandlers[id][name][type].Callback, false);
            resolve();
        });
    },
    RemoveEvent: async function (id, name, type, isDocument = false) {
        return new Promise(function (resolve) {

            let element;
            if (isDocument)
                element = document;
            else
                element = document.querySelector("[data-blazorstrap='" + id + "']");
            if (blazorStrap.EventHandlers[id] === undefined) return resolve();
            if (name !== "null" && type !== "null") {

                if (blazorStrap.EventHandlers[id][name] === undefined) return resolve();
                if (blazorStrap.EventHandlers[id][name][type] === undefined) return resolve();
                if (blazorStrap.EventHandlers[id][name][type] !== undefined && blazorStrap.EventHandlers[id][name][type] !== null) {
                    if (element !== undefined && element !== null) {
                        element.removeEventListener(type, blazorStrap.EventHandlers[id][name][type].Callback, false);
                    }
                    delete blazorStrap.EventHandlers[id][name][type];
                }
                if (Object.keys(blazorStrap.EventHandlers[id][name]).length === 0) {
                    delete blazorStrap.EventHandlers[id][name];
                }
            }
            if (Object.keys(blazorStrap.EventHandlers[id]).length === 0) {
                delete blazorStrap.EventHandlers[id];
            }

            resolve();
        });
    },
    TransitionDidNotStart: async function (element) {
        return new Promise(function (resolve) {
            const timeout = setTimeout(function () {
                resolve(true);
            }, 200);
            element.ontransitionstart = function () {
                resolve(false);
                clearTimeout(timeout);
            }
        }).then((data) => data);
    },
    RemovePopover: async function (element, id) {
        return new Promise(function (resolve) {
            if (blazorStrap.EventHandlers[id] === undefined) return resolve();
            if (blazorStrap.EventHandlers[id]["Popover"] !== undefined) {
                blazorStrap.EventHandlers[id].Popover.destroy();
                delete blazorStrap.EventHandlers[id].Popover;
                resolve();
            }
            if (Object.keys(blazorStrap.EventHandlers[id]).length === 0) {
                delete blazorStrap.EventHandlers[id];
            }
        });
    },
    AddPopover: async function (element, dotNetObjectReference, position, target, offset = "none") {
        return new Promise(function (resolve) {
            const id = element.getAttribute("data-blazorstrap");
            target = document.querySelector("[data-blazorstrap='" + target + "']");
            if (blazorStrap.EventHandlers[id] === undefined) {
                blazorStrap.EventHandlers[id] = {};
            }
            if (offset !== "none") {
                offset = offset.split(",");
                blazorStrap.EventHandlers[id]["Popover"] =
                    Popper.createPopper(target, element, {
                        placement: position,
                        modifiers: [{
                            name: 'offset',
                            options: {
                                offset: [parseInt(offset[0]), parseInt(offset[1])],
                            },
                        }]
                    });

            } else {
                blazorStrap.EventHandlers[id]["Popover"] =
                    Popper.createPopper(target, element, {
                        placement: position,
                    });
            }
            resolve();
        });
    },
    UpdatePopover: async function (element) {
        const id = element.getAttribute("data-blazorstrap");
        return new Promise(function (resolve) {
            setTimeout(async function () {
                await blazorStrap.EventHandlers[id].Popover.update();
                return resolve(element.style.cssText);
            }, 10)
        });
    },
    UpdatePopoverArrow: async function (element, dotNetObjectReference, position, tooltip) {
        const id = element.getAttribute("data-blazorstrap");
        let arrow;
        return new Promise(function (resolve) {
            if (tooltip === false)
                arrow = element.querySelector('.popover-arrow');
            else
                arrow = element.querySelector('.tooltip-arrow');
            position = position.replace("start", "");
            position = position.replace("end", "");
            switch (position) {
                case "top":
                    arrow.style.transform = "translate(" + (element.offsetWidth / 2 - (arrow.offsetWidth / 2)) + "px, 0px)";
                    if (!tooltip)
                        blazorStrap.EventHandlers[id].Popover.setOptions({
                            modifiers: [{
                                name: 'offset',
                                options: { offset: [0, arrow.offsetHeight], },
                            }]
                        });
                    break;
                case "bottom":
                    arrow.style.transform = "translate(" + (element.offsetWidth / 2 - (arrow.offsetWidth / 2)) + "px, 0px)";
                    if (!tooltip)
                        blazorStrap.EventHandlers[id].Popover.setOptions({
                            modifiers: [{
                                name: 'offset',
                                options: { offset: [0, arrow.offsetHeight], },
                            }]
                        });
                    break;
                case "left":
                    arrow.style.transform = "translate(0px, " + (element.offsetHeight / 2 - (arrow.offsetHeight / 2)) + "px)";
                    if (!tooltip)
                        blazorStrap.EventHandlers[id].Popover.setOptions({
                            modifiers: [{
                                name: 'offset',
                                options: { offset: [0, arrow.offsetWidth], },
                            }]
                        });
                    break;
                case "right":
                    arrow.style.transform = "translate(0px, " + (element.offsetHeight / 2 - (arrow.offsetHeight / 2)) + "px)";
                    if (!tooltip)
                        blazorStrap.EventHandlers[id].Popover.setOptions({
                            modifiers: [{
                                name: 'offset',
                                options: { offset: [0, arrow.offsetWidth], },
                            }]
                        });
                    break;
            }
            resolve();
        });
    },
    PeakHeight: async function (element) {
        return new Promise(function (resolve) {
            element.style.visibility = "hidden";
            element.style.position = "absolute";
            element.style.display = "block";
            setTimeout(function () {
                element.style.display = "";
                element.style.visibility = "";
                element.style.position = ""
            }, 1);
            resolve(element.offsetHeight);
        });
    },
    GetHeight: async function (element) {
        return new Promise(function (resolve) {
            resolve(element.offsetHeight);
        });
    },
    SetBodyStyle: async function (style, value) {
        return new Promise(function (resolve) {
            document.body.style[style] = value;
            resolve();
        });
    },
    GetScrollBarWidth: async function () {
        return new Promise(function (resolve) {
            resolve(window.innerWidth - document.documentElement.clientWidth);
        });
    },
    AddBodyClass: async function (className) {
        return new Promise(function (resolve) {
            document.body.classList.add(className);
            resolve();
        });
    },
    RemoveBodyClass: async function (className) {
        return new Promise(function (resolve) {
            document.body.classList.remove(className);
            resolve();
        });
    },
    SetStyle: async function (element, style, value, delay = 0) {
        element.style[style] = value;
        return new Promise(function (resolve) {
            if (delay !== 0)
                setTimeout(() => resolve(), delay);
            else
                resolve();
        });
    },
    GetStyle: async function (element) {
        return element.style.cssText;
    },
    AddAttribute: async function (element, name, value) {
        return new Promise(function (resolve) {
            element.setAttribute(name, value);
            resolve();
        });
    },
    RemoveAttribute: async function (element, name) {
        return new Promise(function (resolve) {
            element.removeAttribute(name);
            resolve();
        });
    },
    AddClass: async function (element, className, delay = 0) {
        element.classList.add(className);
        return new Promise(function (resolve) {
            if (delay !== 0)
                setTimeout(() => resolve(), delay);
            else
                resolve();
        });

    },
    AnimateCarousel: async function (showEl, hideEl, back) {
        return new Promise(function (resolve) {
            if (back) {
                showEl.classList.add("carousel-item-prev");
                setTimeout(function () {
                    showEl.classList.add("carousel-item-end");
                    hideEl.classList.add("carousel-item-end");
                    resolve();
                }, 10);
            } else {
                showEl.classList.add("carousel-item-next");
                setTimeout(function () {
                    showEl.classList.add("carousel-item-start");
                    hideEl.classList.add("carousel-item-start");
                    resolve();
                }, 10);
            }
        })
    },
    RemoveClass: async function (element, className, delay = 0) {
        element.classList.remove(className);
        return new Promise(function (resolve) {
            if (delay !== 0)
                setTimeout(() => resolve(), delay);
            else
                resolve();
        });
    },
    GetEvents: function (event) {
        return {
            key: event.key,
            target: {
                classList: event.target.classList,
                targetId: event.target.getAttribute("data-blazorstrap-target"),
                childrenId: blazorStrap.GetChildrenIds(event.target),
                dataId: event.target.getAttribute("data-blazorstrap")
            }
        };
    },
    GetChildrenIds: function (target) {
        const children = target.querySelectorAll("[data-blazorstrap]");
        let result = [];
        for (i = 0; i < children; ++i) {
            result.push(children[i].getAttribute("data-blazorstrap"))
        }
        return result;
    }
}

let ResizeFunc;
window.addEventListener("resize", function () {
    clearTimeout(ResizeFunc);
    ResizeFunc = setTimeout(function () {
        // noinspection JSUnresolvedVariable,JSUnresolvedFunction
        DotNet.invokeMethodAsync("BlazorStrap", "ResizeComplete", document.documentElement.clientWidth);
    }, 500);
});