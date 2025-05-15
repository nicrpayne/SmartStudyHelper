/**
 * RequestQueue - A simple queue for managing sequential API requests
 * This helps prevent rate limit errors by ensuring:
 * 1. Only one request is processed at a time
 * 2. There's a configurable delay between requests
 * 3. Requests are processed in the order they're received
 */
export class RequestQueue {
  private queue: Array<{
    requestFn: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
    retryCount: number;
  }>;
  private processing: boolean;
  private lastRequestTime: number;
  private minTimeBetweenRequests: number;
  private retryCount: number;
  private retryDelay: number;

  constructor(options: {
    minTimeBetweenRequests?: number;
    retryCount?: number;
    retryDelay?: number;
  } = {}) {
    this.queue = [];
    this.processing = false;
    this.lastRequestTime = 0;
    this.minTimeBetweenRequests = options.minTimeBetweenRequests || 1000; // Default: 1 second between requests
    this.retryCount = options.retryCount || 3; // Default: retry failed requests 3 times
    this.retryDelay = options.retryDelay || 2000; // Default: wait 2 seconds before retrying
  }

  /**
   * Add a request to the queue
   * @param requestFn - Function that returns a Promise (your API call)
   * @returns Promise - Resolves with the API response or rejects with an error
   */
  addRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        requestFn,
        resolve,
        reject,
        retryCount: 0
      });
      this.processQueue();
    });
  }

  /**
   * Process the next request in the queue
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    // Ensure minimum time between requests
    const now = Date.now();
    const timeToWait = Math.max(0, this.lastRequestTime + this.minTimeBetweenRequests - now);
    
    if (timeToWait > 0) {
      await new Promise(resolve => setTimeout(resolve, timeToWait));
    }
    
    const request = this.queue.shift();
    
    if (!request) {
      this.processing = false;
      return;
    }

    try {
      const result = await request.requestFn();
      this.lastRequestTime = Date.now();
      request.resolve(result);
    } catch (error: any) {
      // If it's a rate limit error and we haven't exceeded retry count, retry the request
      if (
        ((error.status === 429 || error.statusCode === 429) || 
         (error.error && error.error.type === 'insufficient_quota')) && 
        request.retryCount < this.retryCount
      ) {
        console.log(`Rate limit hit. Retrying after ${this.retryDelay}ms (Attempt ${request.retryCount + 1}/${this.retryCount})`);
        request.retryCount++;
        
        // Put the request back at the front of the queue after a delay
        setTimeout(() => {
          this.queue.unshift(request);
          this.processing = false;
          this.processQueue();
        }, this.retryDelay);
        return;
      }
      
      request.reject(error);
    } finally {
      if (this.processing) {
        this.processing = false;
        this.processQueue(); // Process next request
      }
    }
  }
}

// Create a singleton instance for OpenAI requests
export const openaiQueue = new RequestQueue({
  minTimeBetweenRequests: 1000, // 1 second between requests
  retryCount: 3,                // Retry up to 3 times on rate limit
  retryDelay: 2000              // Wait 2 seconds before retrying
});