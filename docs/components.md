# Uniweb Components

A Uniweb Component is a React JS component whose props are 4 objets: `profile`, `block`, `page` , and `website`. The `profile` object represents the source data of a website. The `block` object contains the settings for the component, which represents a building block of a webpage. The `page` object provides information about the current webpage being rendered. Finally, the `website` object provides information about the website itself. 

Most components need to work with only the `profile` and `block` objects. 

## Theming a web component

A component should try to use the dynamic [web theme](webtheme.md) provided by a webiste so that it honors the preferences of the website owner and the underlying website template.

The rendering engine auto generates a **theme class name** for each page block, and passes it to the component in charge of rendering the block. The auto-generated theme class can be found at `props.block.theme`. 

The component creator is expected to take the given class name and set it to the HTML root element of the component so that it cascades to all descendant elements. 

Example:

```Javascript
export default function ({ block }) {
    return (
        <div className={`py-20 sm:py-32 ${theme}`}>
            /* child elements */
        </div>
    );
}
```

### Using predefined and custom variables in a web component

The Uniweb rendering engine creates CSS variables for every predefined and custom variable defined in the web theme's palettes. That means that there will be up to 9 sets of variables, one for each possible palette. A component must have the **theme class name** in its root element in order to activate the correct set of variables.

Both predefined and custom variables can be used as shown below.

```javascript
<div
    className={`py-20 sm:py-32 text-[var(--primary)] bg-[var(--customVar)]`}
></div>
```

The parser of [CSS variables in Tailwind](https://tailwindcss.com/docs/adding-custom-styles#using-arbitrary-values) also accepts variables without the `var()` syntax, so the example above can also be writter as:

```javascript
<div
    className={`py-20 sm:py-32 text-[--primary] bg-[--customVar]`}
></div>
```

It is worth learning more about [CSS variables in Tailwind](https://tailwindcss.com/docs/adding-custom-styles#using-arbitrary-values) to know what else is supported by their parser. For instance, setting a default value for a CSS variable is  supported.

```javascript
<div
    className={`text-[var(--primary, #ff0000)]`}
></div>
```

### Standard web components

The list of component names that are reserved for the **standard building blocks** that are commonly needed accross different types of websites.

The standardization of building blocks goes beyond their name by also providing the expected behaviour for each of them. When developing a standard-named web components **a developer must ensure** that the component accepts the set of standard parameters and produces the rendering output that are defined in the guidelines for that component category. 

The following is the complete list of standard component categories together with the links to the guidelines for them.

- [Article](category/Article.md)
- [Card](category/Card.md)
- [Header](category/Header.md)
- [List](category/List.md)
- [Quote](category/Quote.md)
- [Map](category/Map.md)
- [Spotlight](category/Spotlight.md)
- [PageHeader](category/PageHeader.md)
- [PageFooter](category/PageFooter.md)

> **Note** <br>
> While the category names above are in singular form, their implementation often requires rendering one or more instances of that category. For example, a section of category `Card` might render several cards.

### How to create a compliant website module

A website module is required to export implementations for all the standard components. In addition, the module might implement as many custom components as desired.

If a module does not want to implement some standard components, it can import them from some library (e.g. the [Express library](https://github.com/uniwebcms/express)) and then re-export them. What's important is that every standard component category is defined so that swapping remote modules does not break the rendering of a website.

### Web Accessibility

### Multilingualism

### Responsive design

## Next step

- [Web themes](webthemes.md)
