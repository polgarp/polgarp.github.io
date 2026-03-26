---
title: "Tilecraft"
excerpt: ""
header:
  image: /assets/images/playground/tilecraft-1.png
  teaser: /assets/images/playground/tilecraft-1.png
---

[Tilecraft](https://polgarp.com/tilecraft/) is a little tool I made based on the examples from Paul Jackson's excellent book [*How to Make Repeat Patterns*](https://www.laurenceking.com/products/how-to-make-repeat-patterns). I picked the book up when visiting the Escher Museum in the Hague, and wanted to try out and play with the ideas presented. It was also an experiment in building a non-trivial interactive tool with Claude, directing an agentic tool through complex geometry and interaction design.

{% include figure alt="Tilecraft tool" caption="[Tilecraft tool](https://polgarp.com/tilecraft/#motif=text&font=Lobster&size=127&letter=f&view=tile&zoom=1.0533461185798056&px=-41.04315008392163&py=-16.625798923138348&rot=0&guides=false&tx=5&ty=5&padx=10&pady=10&roff=0&coff=0&skew=0&chain=%5B%7B%22methodId%22%3A%22translation%22%2C%22config%22%3A%7B%22copies%22%3A4%2C%22dx%22%3A9.58%2C%22dy%22%3A1.52%2C%22elementRotation%22%3A0%7D%2C%22enabled%22%3Atrue%7D%2C%7B%22methodId%22%3A%22rotation%22%2C%22config%22%3A%7B%22order%22%3A16%2C%22angle%22%3A21.176470588235293%2C%22distance%22%3A9.08%2C%22pointAngle%22%3A12%2C%22startAngle%22%3A44%7D%2C%22enabled%22%3Atrue%7D%2C%7B%22methodId%22%3A%22reflection%22%2C%22config%22%3A%7B%22axisAngle%22%3A0%2C%22distance%22%3A0%2C%22elementRotation%22%3A0%7D%2C%22enabled%22%3Atrue%7D%5D)" image_path="/assets/images/playground/tilecraft-2.png" %}

On the surface it's straightforward: chain together geometric operations to create patterns, show the results on a tiled canvas. But getting something working is very different from getting something right. 

Some things came together surprisingly fast:  export with embedded fonts, the operation pipeline UI, SVG rendering. Others took real effort and iteration: getting pan/zoom/rotate to feel natural, or making operation guides track correctly through chained transforms. 

I expected math to be easy for the coding tool (symmetry operations are textbook material) but I found myself at one point writing out equations to explain how reflection should work. These AI tools seem to be great at structuring and scaffolding, but struggle when it comes to hierarchy and spatial interactions.  

{% include figure alt="Tilecraft pattern" image_path="/assets/images/playground/tilecraft-3.png" %}

To make things lightweight, I built with Svelte 5, plain JS, no backend, with tile parameters saved in the URL. These make future maintenance cheap. 

The tool covers most examples from the book, except some parts of tiling that would probably need a different tool to explore. If I ever get to v2, I'll start with reworking the controls for direct manipulation, plus add more concrete pattern options besides text and SVG upload, to get to more production ready patterns.