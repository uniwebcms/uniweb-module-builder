# Customizing the default theme for your websites and templates.

Uniweb CMS includes a type of profile named `web theme` that is designed to collect information about colors, fonts, spacing, and variables. Web themes can be resused accross multiple websites, providing an effective strategy for managing branding preferences consistently.

A **web theme** profile is similar to the [Tailwind theme](https://tailwindcss.com/docs/theme) of a project but fulfills a different roles. In particular, a web theme is managed by the rendering engine and is not available at compilation time. In contrast, a Tailwind theme is defined within a website module project and compiled together with the rest of the JavaScript code. The result is that a website module can define its own Tailwind theme and also benefit from the web theme managed by the engine, which includes run time preferences set by the website project.

## Creating a web theme

The option to create a web theme is under the **Web building** submenu of the **New content** menu.

![webtheme](./assets/webtheme.png)

The main information of a web theme is:

1. **Theme Name**: The name of the website theme profile.
1. **Theme Description**: The description of the website theme profile.

A web theme profiles has to additinal sections that collect information about a theme: `Themes`, `Palettes`, and `Fonts`.

### Themes

1. Header Font: The css value of font family which will be applied to heading elements. e.g. "Gill Sans Extrabold", sans-serif
1. Body Font: The css value of font family which will be applied to all other elements in the page.

### Palettes

1. **Palette name**: The name of the palette. `Light` | `Medium` | `Dark`.
1. **Target Element**: The target element type which palette styles will be applied to. `Section` | `Page Header` | `Page Footer`.
1. **Colors**: Colors that will be applied to specific html tags.
1. **Paddings**: CSS value of paddings.
1. **Predefined Variables**: Predefined CSS variables. 

The predefined variables become CSS variables with the following names:

```json
{
    "Primary color": "--primary",
    "On Primary color": "--on_primary",
    "Secondary color": "--secondary",
    "On Secondary color": "--on_secondary",
    "Accent color": "--accent",
    "On Accent color": "--on_accent",
    "Highlight color": "--highlight"
}
```

6. **Custom Variables**: Define CSS variables with custom names.

### Fonts

1. **Font**: Select a Font profile. The font profile can define a Google font or provide the needed files for a custom font family.


## Linking a web theme to a website

1. **Option 1**: Select the web theme profile to the template (docufolio profile) as the default theme
   ![img.png](./assets/default_theme.png)

2. **Option 2**: Set the web theme in a website profile.
    1. Click the **Edit colors and fonts** menu
       ![img.png](./assets/edit_theme.png)
    2. Select the theme by selecting it from the **Theme** option. Select the default palette in the **Color Context** option. Override the font family of header and body by changing last two fields.
       ![img.png](./assets/select_theme.png)

## Choosing a color context in a docufolio

The color context are set for each section of a docufolio. 

![img.png](./assets/select_color_context.png)

## Using the active theme class name in a web component

The rendering engine auto generates a CSS class name property and passes it to the block components of a webpage.
The auto-generated theme class can be found at `props.block.theme`. 

The component creator is expected to take the given class name and set it to the HTML root element of the component so that it cascades to all descendant elements, so that the correct styles declared in the related palette are be applied. 

Example:

```Javascript
export default function ({ block }) {
    return (
        <div className={`py-20 sm:py-32 ${theme}`}>
            /* child elements*/
        </div>
    );
}
```

## Using predefined and custom variables in a web component

The Uniweb rendering engine creates CSS variables for every predefined and custom variable defined in a web theme. Such variables can be used as shown below.

```javascript
<div
    className={`py-20 sm:py-32 text-[var(--primary)] bg-[var(--customVar)]`}
></div>
```

The parser of [CSS variables in Tailwind](https://tailwindcss.com/docs/adding-custom-styles#using-arbitrary-values) also accepts variables without the `var()` syntax, so the exaple above can be writter as:

```javascript
<div
    className={`py-20 sm:py-32 text-[--primary] bg-[--customVar]`}
></div>
```

It is worth learning more about [CSS variables in Tailwind](https://tailwindcss.com/docs/adding-custom-styles#using-arbitrary-values) to know what else may be supported by their parser.

Setting a default value for a CSS variable is also supported.

```javascript
<div
    className={`text-[var(--primary, #ff0000)]`}
></div>