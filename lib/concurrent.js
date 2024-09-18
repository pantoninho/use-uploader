/**
 * Executes jobs concurrently with a limit on the number of concurrent "threads".
 *
 * @param {object} params params
 * @param {number} params.threads number of concurrent threads
 * @param {Array<Job>} params.jobs array of functions to be executed
 * @returns {Promise<Array>} job returns
 */
export async function concurrent({ threads = 5, jobs = [] }) {
    const queue = jobs.map((fn, i) => ({ fn, index: i }));
    const results = [];

    const createThread = async () => {
        while (queue.length) {
            const next = queue.shift();
            results[next.index] = await next.fn();
        }
    };

    await Promise.all(new Array(threads).fill().map(createThread));

    return results;
}

/**
 * @callback Job
 * @returns {Promise}
 */
