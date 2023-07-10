## Content and template editing with the Docufolio app

The [Docufolio](https://uniwebcms.com/apps/docufolio) app in [Uniweb](https://uniwebcms.com) is a **content and template editor** for websites and reports. The app helps user geneare and collaborate on docufolio profiles. A **docufolio profile** packages folders, pages, settings, and assets as a single data file. The profile does not include any source code for rendering a website. The code of web components is expectd to be provided by a selected **remote module**. 

> By convention, "docufolio" (in lower case) means "docufolio profile", and "Docufolio" (in upper case) refers to the app.

A docufolio containts topics and subtopics, and each topic contains sections and subsection. In the context of a website, a **topic** can represent a folder or webpage while a **section** represents a block of content in a webpage.

The settings of a docufolio offer the option to link a website with a remote module by providing a URL to it. In addition, each section of a docufolio can be linked to a web component exported by the remote module. The linking is done by setting the `Category` of the section. For example, if the category of a section is set to "Header", then, when the website is create, the contents of that section will be rendered with the "Header" component exported by the selected remote module.

The choice of category for a Docufolio section is based on a list of standard names plus a "Custom" category that allows for providing an arbitrary name. The goal of standardizing the list of categories is to make it easy to swap one remote module for another and get predictable results. The list of available categories represents the [set of standard building blocks](components.md#standard-web-components) commonly needed accross different types of websites.

## Modules and web components

A website module is a collection of web components. In Uniweb, a web component is a function that renders a block of content within a webpage. [Learn more about Uniweb components](components.md)

## The Module SDK

The [Uniweb Module SDK](https://github.com/uniwebcms/uniweb-module-sdk) package is a thin wrapper for the underlying Uniweb JavaScript engine. When developing modules, one normally imports utility components, functions, and React hooks from the SDK. 

The SDK provides a tailored and consistent API layer for the underlying web engine with the goal of making it useful as a dependency of different types of component libraries.

## The Express Library

The [Uniweb Express library](https://github.com/uniwebcms/express) implements React-based components that provide basic and complex tasks. The components exported by the libary are called "blocks".

A module can use blocks from the Express library within its own componens. The module can also re-export some of the blocks as if there were its own.

## Next step

- [Types of websites](websites.md)
