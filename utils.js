/**
 * Generates a random string of a desired length, containing any of the desired characters.
 * @param {number} length The resulting string's length
 * @param {string|string[]} chars A list of possible characters to use
 * @returns {string} The resulting random string
 */
function randomString(length, chars = '0123456789abcdefghijklmnopqrstuvwxyz') {
    let str = '';
    for (let i = 0; i < length; i++) {
        str += chars[randomInt(0, chars.length - 1)];
    }
    return str;
}

/**
 * Generates a lowercase hexadecimal string of a desired length.
 * @param {number} length The length of the random
 * @returns {String} The resulting string
 */
function randomHex(length = 8) {
    return randomString(length, '0123456789abcdef');
}

/**
 * Generates a pseudorandom integer between a minimum and maximum.
 * @param {number} min The minimum
 * @param {number} max The maximum
 * @returns {number} The resulting integer
 */
function randomInt(min, max) {
    return Math.round(min + Math.random() * (max - min));
}

/**
 * Generates a pseudorandom float between a minimum and maximum.
 * @param {number} min The minimum
 * @param {number} max The maximum
 * @returns {number} The resulting float
 */
function randomFloat(min, max) {
    return min + Math.random() * (max - min);
}

/**
 * Selects a random element from an array.
 * @param {array} arr The input array
 * @returns {*} A randomly selected array element
 */
const getRandomElement = arr => arr[Math.ceil(Math.random() * arr.length) - 1];

/**
 * @typedef itemWithWeight
 * @property {*} value The return value for this item
 * @property {number} weight The weight of this item
 */
/**
 * Selects a random item from a provided list, where each item has a specific weight.
 * @param {itemWithWeight[]} args An array of items and their weights
 * @returns A randomly selected value
 */
const getRandomWeighted = args => {
    // Get the total weight
    let total = 0;
    args.forEach(arg => {
        total += arg.weight;
    });
    // Sort options from lightest to heaviest
    args.sort((a, b) => {
        return a.weight - b.weight;
    });
    // Get our random number
    const rand = randomFloat(0, total);
    // Iterate through options until the current weight (num)
    // is greater than our number (rand)
    let num = 0;
    for (const arg of args) {
        num += arg.weight;
        if (rand < num) return arg.value;
    }
};

/**
 * Keeps a number within a range by preventing it from going above/below its maximum/minimum.
 * @param {number} num The input number
 * @param {number} min The minimum number
 * @param {number} max The maximum number
 * @returns {number} The resulting number
 */
function clamp(num, min, max) {
    if (num < min) return min;
    if (num > max) return max;
    return num;
}

/**
 * Keeps a number within a range by underflowing/overflowing.
 * @param {number} num The input number
 * @param {number} min The minimum number
 * @param {number} max The maximum number
 * @returns {number} The resulting number
 */
function overflow(num, min, max) {
    if (num < min) return max;
    if (num > max) return min;
    return num;
}

/**
 * Rounds a float to the desired amount of decimal places, clipping any trailing zeros.
 * @param {number} number The input number
 * @param {number} decimalPlaces The maximum number of decimal places
 * @returns {number} The resulting number
 */
function roundSmart(number, decimalPlaces = 0) {
    const factorOfTen = Math.pow(10, decimalPlaces);
    return Math.round(number * factorOfTen) / factorOfTen;
}

/**
 * Separates a string into its words and returns an array of those words.
 * @param {string} s The input string
 * @returns {String[]} An array of words
 */
function getWords(s) {
    s = s.replace(/(^\s*)|(\s*$)/gi, '');
    s = s.replace(/[ ]{2,}/gi, ' ');
    s = s.replace(/\n/g, ' ');
    return s.split(' ').filter(String);
}
/**
 * Returns the number of words in a string.
 * @param {string} s The input string
 * @returns {number} The number of words
 */
function countWords(s) {
    return getWords(s).length;
}

/**
 * Pause execution for a desired amount of time. Use this in `async` functions with `await sleep(ms)`.
 * @param {Number} ms The number of milliseconds to sleep for
 * @returns {Promise<undefined>}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Shuffles an array using `Math.random()` to swap elements and returns the result.
 * @param {array} arr The input array
 * @returns {array} The shuffled array
 */
function shuffle(arr) {
    let i = 0;
    while (i < arr.length) {
        let tmp = arr[i];
        let num = Math.round(Math.random() * (arr.length - 1));
        arr[i] = arr[num];
        arr[num] = tmp;
        i++;
    }
    return arr;
}

/**
 * Converts a number of seconds into `[hh]:[m]m:ss` format.
 * @param {number} s The number of seconds to format
 * @returns {String}
 */
function formatSeconds(s) {
    s = Math.floor(s || 0);
    let hours = 0;
    let minutes = 0;
    let seconds = s;
    if (s >= 3600) {
        hours = Math.floor(s / 3600);
        s = s % 3600;
    }
    if (s >= 60) {
        minutes = Math.floor(s / 60);
        s = s % 60;
    }
    seconds = s;
    let timeString = '';
    timeString += hours > 0 ? hours.toString() + ':' : '';
    timeString += minutes.toString().padStart(hours > 0 ? 2 : 1, '0') + ':';
    timeString += seconds.toString().padStart(2, '0');
    return timeString;
}

/**
 * Get age as an integer from a Date object.
 * @param {Date} date The target date
 * @returns {number}
 */
function getAgeFromDate(date) {
    const now = new Date();
    let age = now.getFullYear() - date.getFullYear();
    if (now.getMonth() < date.getMonth() || (now.getMonth() == date.getMonth() && now.getDate() < date.getDate())) {
        age--;
    }
    return age;
}

/**
 * Returns a string describing the relative time between two dates, like "3 days ago" or "2 months from now".
 * @param {number} target A millisecond-timestamp of the target date.
 * @param {number} [anchor] A millisecond-timestamp of the date to look from. Defaults to `Date.now()`.
 * @returns {string} The resulting relative description.
 */
function getRelativeDate(target, anchor = Date.now()) {
    const isFuture = anchor - target < 0 ? true : false;
    let diff = Math.abs(anchor - target);
    diff = Math.round(diff / 1000);
    if (diff < 120)
        // Less than 120 seconds
        return isFuture ? `In a moment` : `Moments ago`;
    diff = Math.round(diff / 60);
    if (diff < 120)
        // Less than 120 minutes
        return isFuture ? `${diff} mins from now` : `${diff} mins ago`;
    diff = Math.round(diff / 60);
    if (diff < 72)
        // Less than 72 hours
        return isFuture ? `${diff} hours from now` : `${diff} hours ago`;
    diff = Math.round(diff / 24);
    const days = diff;
    if (diff < 90)
        // Less than 90 days
        return isFuture ? `${diff} days from now` : `${diff} days ago`;
    diff = Math.round(diff / 30.43685);
    if (diff < 36)
        // Less than 36 months
        return isFuture ? `${diff} months from now` : `${diff} months ago`;
    diff = Math.round(days / 365.2422);
    return isFuture ? `${diff} years from now` : `${diff} years ago`;
}

/**
 * Converts a number of bytes to a human-readable size, like "230.2 MB" or "7.27 GB".
 * @param {number} bytes A number of bytes to convert
 * @returns {string} The human-readable size string
 */
function formatSize(bytes) {
    if (bytes < 1000) return `${bytes} B`;
    bytes /= 1024;
    if (bytes < 1000) return `${roundSmart(bytes, 0)} KB`;
    bytes /= 1024;
    if (bytes < 1000) return `${roundSmart(bytes, 1)} MB`;
    bytes /= 1024;
    if (bytes < 1000) return `${roundSmart(bytes, 2)} GB`;
    bytes /= 1024;
    if (bytes < 1000) return `${roundSmart(bytes, 2)} TB`;
    return '-';
}

/**
 * Determines of an input string is a valid URL.
 * @param {string} string The input string
 * @returns {Boolean}
 */
function isValidUrl(string) {
    let url;
    try {
        url = new URL(string);
    } catch (error) {
        return false;
    }
    return url.protocol === 'http:' || url.protocol === 'https:';
}

/**
 * Determines if a string is a valid hostname.
 * @param {string} string The input string
 * @returns {Boolean}
 */
function isValidHostname(string) {
    return (
        string.match(
            /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/
        ) && !string.match(/^localhost$/)
    );
}

/**
 * Determines if a string is a valid IPv4 or IPv6 address.
 * @param {string} string The input string
 * @returns {Boolean}
 */
function isValidIp(string) {
    return (
        string.match(
            /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/
        ) &&
        !string.match(/(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/) &&
        !string.match(/^::1$/)
    );
}

/**
 * Escapes HTML entities present in the input string and returns the result.
 * @param {string} text The input string
 * @returns {string} The escaped string
 */
function escapeHTML(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

try {
    module.exports = {
        randomHex,
        randomInt,
        randomFloat,
        getRandomElement,
        getRandomWeighted,
        clamp,
        overflow,
        roundSmart,
        getWords,
        countWords,
        sleep,
        shuffle,
        formatSeconds,
        getAgeFromDate,
        getRelativeDate,
        formatSize,
        isValidUrl,
        isValidHostname,
        isValidIp,
        escapeHTML
    };
} catch (error) {}
