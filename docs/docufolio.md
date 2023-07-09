## Content and template editing with the Docufolio app

The [Docufolio](https://uniwebcms.com/apps/docufolio) app in [Uniweb](https://uniwebcms.com) is a **content and template editor** for websites and reports. The app helps user geneare and collaborate on docufolio profiles. A **docufolio profile** packages folders, pages, settings, and assets as a single data file. The profile does not include any source code for rendering a website. The code of web components is expectd to be provided by a selected **remote module**. 

> By convention, "docufolio" (in lowercase) means "docufolio profile", and "Docufolio" (in uppercase) is the name of the app.

A docufolio containts topics and subtopics, and each topic contains sections and subsection. In the context of a website, a **topic** can represent a folder or webpage while a **section** represents a block of content in a webpage.

The settings of a docufolio offer the option to link a website with a remote module by providing a URL to it. In addition, each section of a docufolio can be linked to a web component exported by the remote module. The linking is done by setting the `Category` of the section. For example, if the category of a section is set to "Header", then, when the website is create, the contents of that section will be rendered with the "Header" component exported by the selected remote module.

The choice of category for a Docufolio section is based on a list of standard names plus a "Custom" category that allows for providing an arbitrary name. The goal of standardizing the list of categories is to make it easy to swap one remote module for another and get predictable results. The list of available categories represent the set of **standard building blocks** commonly needed accross different types of websites. Of course, the standard list cannot include all possible types of blocks, which is why the "Custom" category is provided to request non-standard component names.

The standardization of **building blocks** goes beyond their name by also providing the expected behavioir for them. When developing a web components that is exported with a standard name, **a developer must ensure** that the component accepts the set of standard parameters and produces the rendering output that are defined in the guidelines for that component category. The following is the complete list of standard component categories together with the links to the guidelines for them.

### Standard web components

- [Article](docs/category/Article.md)
- [Card](docs/category/Card.md)
- [Header](docs/category/Header.md)
- [List](docs/category/List.md)
- [Quote](docs/category/Quote.md)
- [Map](docs/category/Map.md)
- [Spotlight](docs/category/Spotlight.md)
- [PageHeader](docs/category/PageHeader.md)
- [PageFooter](docs/category/PageFooter.md)

> **Note** <br>
> While the category names above are in singular form, their implementation often requires rendering one or more instances of that category. For example, a section of category `Card` might render several cards.

## Modules and web components

A website module is a collection of web components. In Uniweb, a web component is a function that renders a block of content within a webpage. [Learn more about Uniweb components](components.md)

## The Module SDK

The [Uniweb Module SDK](https://github.com/uniwebcms/uniweb-module-sdk) package is a thin wrapper for the underlying Uniweb JavaScript engine. When developing modules, one normally imports utility components, functions, and React hooks from the SDK. 

The SDK provides a tailored and consistent API layer for the underlying web engine with the goal of making it useful as a dependency of different types of component libraries.

## The Express Library

The [Uniweb Express library](https://github.com/uniwebcms/express) implements React-based components that provide basic and complex tasks. The components exported by the libary are called "blocks".

A module can use blocks from the Express library within its own componens. The module can also re-export some of the blocks as if there were its own.

## How to create a compliant website module

### Standard components

A website module is required to export implementations for all the standard components. In addition, the module might implement as many custom components as desired.

If a module does not want to implement some standard components, it can import them from some library (e.g. the [Express library](https://github.com/uniwebcms/express)) and then re-export them. What's important is that every standard component category is defined so that swapping remote modules does not break the rendering of a website.

### Web Accessibility

### Multilingualism

### Responsive design

## Next steps

- [Web components](docs/components.md)

- [Web themes](docs/themes.md)

- [Web fonts](docs/fonts.md)