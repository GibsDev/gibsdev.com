# The latest iteration of this website 

This website uses an express webserver to serve clients with markdown files that have been converted to HTML web pages. Markdown has very little boilerplate so content creation has low overhead. It strikes a good balance between style and functionality. This was the motivating factor for creating this website, as I want a simpler way to share my ideas with others (and for my own future reference).

You can also write html directly into the markdown source files for when you need more control!

``` html
<button onclick="alert('clicked!')">Click me!</button>
```

<button onclick="alert('clicked!')">Click me!</button>

You can get view the source markdown of (almost) any page by appending `.md` to the url. Currently the `/posts` page is the only one that does not have a markdown source file as it is dynamically generated on the server.

But you CAN view the source of the whole website [here on github](https://github.com/GibsDev/gibsdev.com)!
