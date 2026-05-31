const $ = (selector, ancestor = document) => ancestor.querySelector(selector);
const $$ = (selector, ancestor = document) => ancestor.querySelectorAll(selector);

const escapeHTML = string => {
    const div = document.createElement('div');
    div.textContent = string;
    return div.innerHTML;
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const copyText = async text => {
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        console.error('Error copying to clipboard:', err);
    }
};

// Thanks Gemini
function createElement(selector) {
    // Regex to match the tag, id (#), and classes (.)
    const regex = /([.#])?([^.#\s]+)/g;
    let match;
    let tagName = 'div'; // Default to div if no tag is specified
    let id = '';
    const classes = [];

    // Initial check: if the selector starts with an ID or Class,
    // the first match won't be the tag name.
    const firstMatch = /^[a-zA-Z0-9-]+/.exec(selector);
    if (firstMatch) {
        tagName = firstMatch[0];
    }

    while ((match = regex.exec(selector)) !== null) {
        const [, type, value] = match;

        if (type === '#') {
            id = value;
        } else if (type === '.') {
            classes.push(value);
        }
    }

    const element = document.createElement(tagName);

    if (id) {
        element.id = id;
    }

    if (classes.length > 0) {
        element.classList.add(...classes);
    }

    return element;
}

const activePopoverHiders = [];

/**
 * Create a versatile popover element that can be positioned relative to another element or the mouse cursor and contain any content.
 * @param {Function} onHide A callback function to be invoked when the popover is hidden.
 * @returns {Object}
 */
const createPopover = (onHide = () => {}) => {
    const el = createElement('div.popover');
    let currentTriggerElement;
    let currentRefocusElement;

    /**
     * Hide the popover.
     * @param {boolean} remove Whether or not to remove the popover from the DOM.
     *
     * Defaults to `true`.
     */
    const hide = (remove = true) => {
        // Remove from global array
        const index = activePopoverHiders.indexOf(hide);
        if (index > -1) {
            activePopoverHiders.splice(index, 1);
        }
        // Run provided onHide function
        try {
            onHide();
        } catch (error) {}

        // Refocus and update attributes on triggering elements
        try {
            if (currentRefocusElement) currentRefocusElement.focus();
            if (currentTriggerElement) {
                currentTriggerElement.setAttribute('aria-expanded', 'false');
                currentTriggerElement.setAttribute('aria-haspopup', 'false');
            }
        } catch (error) {}

        // Hide and remove
        el.classList.remove('visible');
        if (remove)
            setTimeout(() => {
                el.remove();
            }, 300);
    };

    /**
     * Show the popover.
     * @param {HTMLElement} [triggerElement] The element that triggered this popover.
     *
     * The popover will be positioned relatively to this element. If a falsy value is supplied, the popover will attempt to position itself relative to the mouse cursor.
     *
     * Focus will also be returned to this element when the popover closes.
     * @param {Object} options Additional options.
     * @param {'bottom'|'top'|'left'|'right'} [options.position] Where to position the popup relative to the trigger element/cursor.
     *
     * Defaults to `bottom`.
     * @param {boolean} [options.centered] Whether or not the popover should be centered relative to the trigger.
     * @param {boolean} [options.setMinWidth] Whether or not the popover should be made at least as wide as the trigger element.
     * @param {boolean} [options.padding] The amount of padding in pixels to place between the popover, the edge of the trigger element, and the edges of the screen.
     * @param {HTMLElement} [options.refocusElement] An element to return focus to when the popover closes, if different than `triggerElement`.
     */
    const show = (triggerElement, options = {}) => {
        const opts = {
            position: 'bottom',
            centered: false,
            setMinWidth: true,
            padding: 4,
            refocusElement: triggerElement,
            ...options
        };

        currentTriggerElement = triggerElement;
        currentRefocusElement = opts.refocusElement;

        if (triggerElement) {
            triggerElement.setAttribute('aria-expanded', 'true');
            triggerElement.setAttribute('aria-haspopup', 'true');
        }

        // Append popover to document BEFORE doing any positioning
        document.body.appendChild(el);

        // Size and position the menu relative to the triggering element if provided
        // Otherwise, position relative to the mouse cursor using the globally updated coords
        // We do this inside requestAnimationFrame to make sure the popover's layout
        // has been fully calculated so we can get accurate sizing
        requestAnimationFrame(() => {
            const rect = el.getBoundingClientRect();

            let trigger = {
                left: mouse.x,
                right: mouse.x,
                bottom: mouse.y,
                top: mouse.y,
                width: 0,
                height: 0
            };

            if (triggerElement) trigger = triggerElement.getBoundingClientRect();

            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            const spaceBelow = windowHeight - trigger.bottom;
            const spaceAbove = trigger.top;
            const spaceToRight = windowWidth - trigger.right;
            const spaceToLeft = trigger.left;

            const TRIGGER_OFFSET = 4;

            let top = 0;
            let left = 0;

            // Default max bounds to the entire screen minus padding
            let maxHeight = windowHeight - opts.padding * 2;
            let maxWidth = windowWidth - opts.padding * 2;

            // 1. Calculate base positions, handle flipping, and determine available space
            switch (opts.position) {
                case 'top':
                    if (trigger.top - rect.height - TRIGGER_OFFSET < opts.padding && spaceBelow > spaceAbove) {
                        // Flip to bottom
                        top = trigger.bottom + TRIGGER_OFFSET;
                        maxHeight = spaceBelow - TRIGGER_OFFSET - opts.padding;
                    } else {
                        // Stay top
                        top = trigger.top - rect.height - TRIGGER_OFFSET;
                        maxHeight = spaceAbove - TRIGGER_OFFSET - opts.padding;
                    }
                    left = opts.centered ? trigger.left + trigger.width / 2 - rect.width / 2 : trigger.left;
                    break;

                case 'bottom':
                    if (
                        trigger.bottom + TRIGGER_OFFSET + rect.height > windowHeight - opts.padding &&
                        spaceAbove > spaceBelow
                    ) {
                        // Flip to top
                        top = trigger.top - rect.height - TRIGGER_OFFSET;
                        maxHeight = spaceAbove - TRIGGER_OFFSET - opts.padding;
                    } else {
                        // Stay bottom
                        top = trigger.bottom + TRIGGER_OFFSET;
                        maxHeight = spaceBelow - TRIGGER_OFFSET - opts.padding;
                    }
                    left = opts.centered ? trigger.left + trigger.width / 2 - rect.width / 2 : trigger.left;
                    break;

                case 'left':
                    if (trigger.left - rect.width - TRIGGER_OFFSET < opts.padding && spaceToRight > spaceToLeft) {
                        // Flip to right
                        left = trigger.right + TRIGGER_OFFSET;
                        maxWidth = spaceToRight - TRIGGER_OFFSET - opts.padding;
                    } else {
                        // Stay left
                        left = trigger.left - rect.width - TRIGGER_OFFSET;
                        maxWidth = spaceToLeft - TRIGGER_OFFSET - opts.padding;
                    }
                    top = opts.centered ? trigger.top + trigger.height / 2 - rect.height / 2 : trigger.top;
                    break;

                case 'right':
                    if (
                        trigger.right + TRIGGER_OFFSET + rect.width > windowWidth - opts.padding &&
                        spaceToLeft > spaceToRight
                    ) {
                        // Flip to left
                        left = trigger.left - rect.width - TRIGGER_OFFSET;
                        maxWidth = spaceToLeft - TRIGGER_OFFSET - opts.padding;
                    } else {
                        // Stay right
                        left = trigger.right + TRIGGER_OFFSET;
                        maxWidth = spaceToRight - TRIGGER_OFFSET - opts.padding;
                    }
                    top = opts.centered ? trigger.top + trigger.height / 2 - rect.height / 2 : trigger.top;
                    break;
            }

            // 2. Secondary Axis Clamping
            // We use the bounded dimensions so clamping doesn't break if the popover is squished
            const boundedHeight = Math.min(rect.height, maxHeight);
            const boundedWidth = Math.min(rect.width, maxWidth);

            left = Math.max(opts.padding, Math.min(left, windowWidth - boundedWidth - opts.padding));
            top = Math.max(opts.padding, Math.min(top, windowHeight - boundedHeight - opts.padding));

            // Apply styles
            el.style.top = `${top}px`;
            el.style.left = `${left}px`;

            // Apply the max dimensions we calculated
            el.style.maxHeight = `${maxHeight}px`;
            el.style.maxWidth = `${maxWidth}px`;

            if (opts.setMinWidth) el.style.minWidth = `${trigger.width}px`;

            // Add animate and visible classes after another animation frame
            // to ensure the popover has moved to its final location
            requestAnimationFrame(() => {
                el.classList.add('animate');
                el.classList.add('visible');
                activePopoverHiders.push(hide);
            });
        });
    };

    return {
        el,
        hide,
        show
    };
};

/**
 * Show a dropdown menu popover with a list of choosable items.
 * @param {HTMLElement} [triggerElement] The HTML element that triggered showing the dropdown. Will attempt to default to the mouse cursor position if not provided.
 * @param {Object[]} items A list of dropdown item objects.
 * @param {boolean} [items[].separator] If `true`, this item will represent a separator in the list.
 *
 * All other properties will be ignored.
 * @param {string} items[].label The label for this item.
 *
 * This value is returned by the promise if `value` and `onClick` aren't set.
 * @param {any} [items[].value] The value of this item to be returned when selected.
 *
 * Defaults to the value of `label`.
 * @param {Function} [items[].onClick] A callback function to be invoked when this item is selected.
 *
 * The value returned by this callback will be returned from the promise instead of the item's `value` or `label`.
 * @param {boolean} [items[].disabled] Whether or not this item should be disabled.
 * @param {boolean} [items[].success] Whether or not this item should be implied as successful/positive (colored green).
 *
 * Defaults to `false`.
 * @param {boolean} [items[].danger] Whether or not this item should be implied as dangerous (colored red).
 *
 * Defaults to `false`.
 * @param {boolean} [items[].selected] Whether or not this item should be highlighted as selected.
 *
 * Setting this to `true` on any item will enable `options.selectable`.
 *
 * Defaults to `false`.
 * @param {string} [items[].symbol] The ID of a Material Symbol to use as the icon for this item.
 * @param {boolean} [items[].symbolOutlined] Whether or not the Material Symbol supplied by `symbol` should be outlined instead of filled.
 *
 * Defaults to `false`.
 * @param {string} [items[].icon] The URL of an image to use as the icon for this item.
 * @param {boolean} [items[].maskIcon] Whether or not the image supplied by `icon` should be used as a mask, its opaque regions drawn with the text color.
 *
 * Defaults to `false`.
 * @param {Object} [options] Additional options
 * @param {boolean} [options.selectable] Whether or not options should be navigable with common `<select>` menu keypresses and display a selection highlight.
 *
 * Defaults to `false`.
 * @param {HTMLElement} [options.refocusElement] An HTML element to pass focus to when the dropdown closes, if different than `triggerElement`.
 *
 * Defaults to the value of `triggerElement`.
 * @returns
 */
const showDropdown = (triggerElement, items = [], options = {}) =>
    new Promise(resolve => {
        const opts = {
            selectable: false,
            refocusElement: triggerElement,
            ...options
        };

        const onHide = () => {
            try {
                resolve(null);
            } catch (error) {}
        };

        const popover = createPopover(onHide);
        const dropdown = popover.el;
        dropdown.role = 'menu';
        dropdown.tabIndex = -1;
        dropdown.classList.add('dropdown', 'flex', 'col');

        const hasIcons = items.find(i => i.symbol || i.icon);
        for (const item of items) {
            if (item.separator) {
                const el = createElement('div.separator');
                el.role = 'separator';
                dropdown.appendChild(el);
                continue;
            }

            const btn = createElement('button.btn.text.secondary.justify-start');
            btn.role = 'menuitem';

            // Change item color and state
            if (item.selected) {
                if (!item.disabled) btn.classList.remove('text');
                opts.selectable = true;
            }
            if (item.danger) {
                btn.classList.add('danger');
            }
            if (item.success) {
                btn.classList.add('success');
            }
            if (item.disabled) {
                btn.disabled = true;
            }

            // Add symbol/icon
            if (item.symbol) {
                const symbol = createElement('span.symbol.filled');
                if (item.symbolOutlined) symbol.classList.remove('filled');
                symbol.innerText = item.symbol;
                btn.appendChild(symbol);
            } else if (item.icon || hasIcons) {
                const icon = createElement('img.icon');
                if (item.maskIcon) icon.classList.add('img-mask');
                icon.src = item.icon ?? '';
                if (!item.icon) icon.classList.add('invisible');
                btn.appendChild(icon);
            }

            // Add label
            const label = createElement('span.label.flex-grow.text-left');
            label.innerText = item.label;
            btn.appendChild(label);

            // Handle selection
            btn.addEventListener('click', async () => {
                let res = null;
                if (item.onClick) res = await item.onClick();
                resolve(res ?? item.value ?? item.label);
                popover.hide();
            });

            dropdown.appendChild(btn);
        }

        popover.show(triggerElement, {
            refocusElement: opts.refocusElement
        });
        dropdown.focus();

        if (opts.selectable) {
            const list = dropdown.querySelectorAll('.btn:not(:disabled)');
            let index = 0;

            list.forEach((item, i) => {
                if (!item.classList.contains('text')) index = i;
            });

            const select = idx => {
                const el = list[idx];
                if (!el) return;
                list.forEach(btn => {
                    btn.classList.add('text');
                    btn.setAttribute('aria-selected', 'false');
                });
                el.classList.remove('text');
                el.setAttribute('aria-selected', 'true');
                el.focus();
                index = idx;
            };
            select(index);

            requestAnimationFrame(() => {
                list[index].scrollIntoView({ block: 'center' });
            });

            dropdown.addEventListener('keydown', e => {
                const selected = dropdown.querySelector('.btn:not(.text)');
                const key = [e.shiftKey ? 'Shift' : '', e.key].filter(Boolean).join('-');
                switch (key) {
                    // Previous item
                    case 'ArrowUp':
                    case 'ArrowLeft':
                    case 'Shift-Tab':
                        e.preventDefault();
                        select(index - 1);
                        break;
                    // Next item
                    case 'ArrowDown':
                    case 'ArrowRight':
                    case 'Tab':
                        e.preventDefault();
                        select(index + 1);
                        break;
                    // First item
                    case 'Home':
                        e.preventDefault();
                        select(0);
                        break;
                    // Last item
                    case 'End':
                        e.preventDefault();
                        select(list.length - 1);
                        break;
                    // Confirm selection
                    case ' ':
                    case 'Enter':
                        e.preventDefault();
                        selected.click();
                        break;
                }
            });
        }
    });

/**
 * Hijack the OS-native dropdown menu created by `<select>` elements and replace it with a custom one.
 * @param {HTMLSelectElement} selectElement A native HTML form `<select>` element.
 */
const hijackNativeDropdown = async selectElement => {
    const textbox = selectElement.closest('.textbox');
    const options = selectElement.querySelectorAll('option');
    const items = [];
    options.forEach(opt => {
        items.push({
            label: opt.innerText,
            value: opt.value || opt.innerText,
            selected: opt.selected,
            disabled: opt.disabled
        });
    });
    const selection = await showDropdown(textbox, items, {
        refocusElement: selectElement
    });
    if (selection) {
        selectElement.value = selection;
        selectElement.dispatchEvent(new Event('change'));
    }
};

/**
 * Hide all visible popover elements.
 */
const hideAllPopovers = () => {
    while (activePopoverHiders.length > 0) {
        activePopoverHiders.shift()();
    }
};

/**
 * Show a popup modal.
 * @param {string} title Text to use for the title of the modal.
 * @param {string|HTMLElement} [body] An HTML string or HTML element to use as the body of the modal.
 * @param {Object[]} actions An array of action objects representing the row of buttons at the bottom of the modal.
 * @param {string} [actions[].href] A URL to open when this action is clicked.
 * @param {boolean} [actions[].newTab] Whether or not to open the URL supplied by `href` in a new tab.
 * @param {string} actions[].label The label to display on the action button.
 * @param {boolean} [actions[].noClose] Whether or not the modal should stay open after this action is clicked.
 * @param {Function} [actions[].onClick] A callback function to be invoked when this action is clicked.
 * @param {string} [actions[].class] Additional space-separated classes to apply to the action button.
 *
 * By default, buttons use the primary filled accent color style. Non-primary options should pass `text`, `outline`, or `secondary` here.
 * @param {Object} [options] Additional options for the modal.
 * @param {string} [options.width] A number of pixels to override the modal's max width to.
 * @param {string} [options.expandWidth] Whether or not the modal should expand to the set width regardless of content.
 *
 * Defaults to false.
 * @param {string} [options.height] A number of pixels to override the modal's max height to.
 * @param {string} [options.expandHeight] Whether or not the modal should expand to the set height regardless of content.
 *
 * Defaults to false.
 * @param {string} [options.fullscreenable] Whether or not the modal should expand to fill the entire screen on smaller screened devices.
 *
 * Defaults to false.
 * @param {Function} [options.onClose] A callback function to be invoked when the modal is closed, regardless of cause.
 * @param {Function} [options.onCancel] A callback function to be invoked when the modal is closed without an action button being clicked.
 * @param {Function} [options.onBeforeShow] A callback function to be invoked after the modal has been added to the DOM but before it is made visible.
 *
 * This callback receives the dialog `HTMLDialogElement` as an argument.
 * @param {string} [options.closedby] What should be allowed to close this modal?
 *
 * - `any`: Clicking an action, hitting `Esc`, clicking outside the modal, or using the device back button will close the modal.
 * - `closerequest`: Clicking an action or using the device back button will close the modal.
 * - `none`: Clicking an action is the only way to close the modal.
 *
 * Defaults to `any`.
 * @returns {HTMLDialogElement}
 */
const showModal = (title, body, actions = [], options = {}) => {
    const {
        closedby = 'any',
        width = '',
        height = '',
        expandWidth = false,
        expandHeight = false,
        onBeforeShow = () => {},
        onClose = () => {},
        onCancel = () => {},
        fullscreenable = false
    } = options;

    // Build base dialog element
    const dialog = document.createElement('dialog');

    dialog.innerHTML = /*html*/ `
        <h2 class="title"></h2>
        ${body ? `<section class="body"></section>` : ''}
        <section class="actions"></section>
    `;

    dialog.classList.add('modal');
    dialog.setAttribute('closedby', closedby);
    if (width) dialog.style.setProperty(`--width`, `${width}px`);
    if (expandWidth) dialog.style.width = `${width}px`;
    if (height) dialog.style.setProperty(`--height`, `${height}px`);
    if (expandHeight) dialog.style.height = `${height}px`;
    if (fullscreenable) dialog.classList.add('fullscreenable');

    // Function to close with animation
    const close = async (viaAction = false) => {
        try {
            if (!viaAction) await onCancel();
            await onClose();
        } catch (error) {
            console.error(error);
        }
        dialog.classList.remove('visible');
        setTimeout(() => {
            dialog.close();
            document.body.removeChild(dialog);
        }, 200);
        window.removeEventListener('resize', handleScroll);
    };
    dialog.closeWithAnimation = close;

    // Populate dialog
    dialog.querySelector('.title').innerText = title;

    // Function to add borders to body based on scroll
    const handleScroll = () => {
        const elBody = dialog.querySelector('.body');
        const height = elBody.clientHeight;
        const scrollTop = elBody.scrollTop;
        const scrollHeight = elBody.scrollHeight;

        const isTopVisible = scrollTop < 8;
        const isBottomVisible = Math.ceil(scrollTop + height) >= scrollHeight - 8;

        elBody.classList.toggle('scrolledTop', !isTopVisible);
        elBody.classList.toggle('scrolledBottom', !isBottomVisible);
    };

    // Populate body
    if (body) {
        const elBody = dialog.querySelector('.body');
        if (typeof body === 'string') {
            dialog.querySelector('.body').innerHTML = body;
        } else {
            dialog.querySelector('.body').appendChild(body);
        }
        elBody.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll);
    }

    // Populate actions
    if (actions?.length) {
        const actionsContainer = dialog.querySelector('.actions');
        for (const action of actions) {
            const btn = document.createElement(action.href ? 'a' : 'button');
            btn.classList = `btn medium ${action.class || ''}`;
            if (!action.class) btn.autofocus = true;
            btn.innerText = action.label;
            if (action.href) {
                btn.href = action.href;
                if (action.newTab) {
                    btn.target = '_blank';
                }
            }
            btn.addEventListener('click', event => {
                if (action.onClick) action.onClick(dialog);
                if (action.noClose) return;
                close();
            });
            actionsContainer.appendChild(btn);
        }
    }

    // Show dialog
    document.body.appendChild(dialog);
    dialog.showModal();
    dialog.addEventListener('toggle', async e => {
        if (!dialog.open) return; // return if closed
        if (onBeforeShow) {
            try {
                const success = await onBeforeShow(dialog);
                if (success === false) throw new Error(`Dialog's onBeforeShow function returned false, aborting`);
            } catch (error) {
                console.error(error);
                dialog.remove();
                return;
            }
        }
        setTimeout(() => {
            dialog.classList.add('visible');
            handleScroll();
        }, 10);
    });

    // Handle cancelling
    dialog.addEventListener('cancel', e => {
        e.preventDefault();
        close();
    });

    return dialog;
};

/**
 * Prompt the user with a yes/no dialog modal.
 * @param {string} [title] The title of the modal.
 * @param {Object} [opts] Additional options.
 * @param {string} [opts.body] The modal body HTML string or element.
 * @param {string} [opts.yesLabel] The label for the confirm option.
 * @param {string} [opts.noLabel] The label for the deny option.
 * @returns {boolean|null}
 */
const showConfirmationDialog = (title = 'Are you sure?', opts = {}) =>
    new Promise(resolve => {
        const { body = '', yesLabel = 'Yes', noLabel = 'No' } = opts;
        showModal(
            title,
            body,
            [
                {
                    label: noLabel,
                    class: 'text',
                    onClick: () => resolve(false)
                },
                {
                    label: yesLabel,
                    onClick: () => resolve(true)
                }
            ],
            { onCancel: () => resolve(null) }
        );
    });

const initSvgIconMasks = () => {
    document.querySelectorAll('img.icon.mask, .img-mask').forEach(img => {
        const src = img.getAttribute('src');
        img.style.webkitMaskImage = `url(${src})`;
        img.style.maskImage = `url(${src})`;
    });
};

const initImageLoadStates = (parent = document) => {
    const images = parent.querySelectorAll('img');
    images.forEach(img => {
        if (!img.complete) {
            img.classList.add('loading');
            const onLoad = () => {
                img.classList.add('loaded');
                img.removeEventListener('click', onLoad);
            };
            img.addEventListener('load', onLoad);
        }
    });
};

const initExpandableTextareas = () => {
    $$('textarea[data-expandable]:not([data-expandable-init])').forEach(el => {
        const resize = () => {
            el.style.height = `auto`;
            requestAnimationFrame(() => {
                el.style.height = `${el.scrollHeight + 1}px`;
            });
        };
        el.addEventListener('input', resize);
        resize();
        el.dataset.expandableInit = true;
    });
};

const initLoadAnimations = () => {
    document.querySelectorAll('[data-load-animate]').forEach(el => {
        const ms = el.dataset.loadAnimate;
        el.style.setProperty('--delay', `${ms}ms`);
        el.classList.remove('invisible');
        el.classList.add('slide-fade-up');
        el.removeAttribute('data-load-animate');
    });
};

const init = isInitial => {
    initSvgIconMasks();
    initLoadAnimations();
    initImageLoadStates();
    initExpandableTextareas();
};

const mouse = { x: 0, y: 0 };

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    init(true);

    // Re-initialize on page update
    document.body.addEventListener('htmx:afterSettle', e => init());

    // Listen for clicks that bubble down to body
    document.addEventListener('click', e => {
        const textbox = e.target.closest('.textbox');
        const popover = e.target.closest('.popover');
        const clickedInteractive = e.target.closest('button, a');

        // If the click happened inside a textbox but not on a clickable element,
        // focus the adjacent text input
        if (textbox && !clickedInteractive) {
            const input = textbox.querySelector('input, select, textarea');
            if (input && document.activeElement !== input) {
                e.preventDefault();
                const length = input.value.length;
                input.focus();

                if (
                    ['text', 'password', 'number', 'search', 'tel', 'email'].includes(input.type) ||
                    input.tagName.toLowerCase() === 'textarea'
                ) {
                    input.setSelectionRange(length, length);
                } else if (input.tagName.toLowerCase() == 'select') {
                    hijackNativeDropdown(input);
                }
            }
        }

        // If the click was on a select input, hijack it
        if (e.target.tagName.toLowerCase() == 'select') {
            e.preventDefault();
            hijackNativeDropdown(e.target);
        }

        // If clicked outside a popover, hide all popovers
        if (!popover) {
            hideAllPopovers();
        }
    });

    // Update global mouse coordinates on movement
    document.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Do stuff on scroll
    document.addEventListener('scroll', e => {
        hideAllPopovers();
    });

    // Do things on global keypresses
    document.addEventListener('keydown', e => {
        switch (e.key) {
            case 'Escape': {
                hideAllPopovers();
                break;
            }
            case ' ':
            case 'Enter': {
                if (e.target.tagName.toLowerCase() == 'select') {
                    e.preventDefault();
                    hijackNativeDropdown(e.target);
                }
                break;
            }
        }
    });

    // Do stuff on window resize
    window.addEventListener('resize', e => {
        hideAllPopovers();
    });
});
