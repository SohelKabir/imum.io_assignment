### Ideas for error catching/solving, retry strategies?

For error catching, we can use try-catch blocks around the functions that may throw errors, and handle them appropriately (e.g. logging the error, retrying the function, etc.).
For retry strategies, you we implement a retry loop that attempts to run the function again after a certain period of time (e.g. 5 seconds) if it fails, we can also limit the number of retries to prevent infinite loops.


### Accessing more ads from this link than the limit allows (max 50 pages)?

One way to overcome the limit of 50 pages is to use multiple initial URLs with different search parameters, such as different date ranges or keywords.
Another option is to use a proxy service to switch IP addresses and avoid getting blocked by the website.


### Experience with CI/CD tools?

CI/CD  tools can be useful for automating the deployment process and ensuring that  code is working as expected.  We can use Tekton CI/CD for automating the system which creates pods on given tasks and remove them when job is done. Also we can use other CI/CD like Jenkins, CircleCI, and TravisCI for same task.



### Other considerations?
For not getting blocked we can use rotating IP for scraping data. Or we can use third party services like Zyte to avoid ban. 