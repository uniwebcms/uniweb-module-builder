# Tailwind CSS Themes

## Introduction

Tailwind CSS Themes allow you to configure and switch between multiple themes for a single collection, providing different visual styles for your website. This documentation covers two major approaches: using `tailwindcss-themer` and employing different Tailwind CSS configurations for each theme. For each approach, the collection needs to declare what themes are available.

### Approach 1: `tailwindcss-themer`

#### Overview

[`tailwindcss-themer`](https://github.com/RyanClementsHax/tailwindcss-themer) is a Tailwind CSS plugin that simplifies the process of defining and switching between themes. Themes are defined in `tailwind.config.js`. Each theme specifies customizations such as font size, font weight, padding, and more.

#### Sample Configuration

```javascript
// tailwind.config.js
module.exports = {
    content: [],
    theme: {},
    plugins: [
        require('tailwindcss-themer')({
            themes: [
                {
                    name: 'formal',
                    extend: {
                        // Customizations for the 'formal' theme
                        fontSize: {
                            lg: '0.75rem'
                        },
                        // ...
                    }
                },
                {
                    name: 'casual',
                    extend: {
                        // Customizations for the 'casual' theme
                        fontSize: {
                            lg: '1.875rem'
                        },
                        // ...
                    }
                }
            ]
        })
    ]
};
```

#### Usage

To apply a theme, add the corresponding theme name as a class to the parent HTML element. All child elements will then inherit the styles defined in tailwind.config for that theme.

```html
<!-- this example uses pure html for demonstration purposes -->
<!doctype html>
<html lang="en">
  <head>
    <!-- ... -->
  </head>
  <!-- everything within this tag now has the "formal" config applied to it -->
  <body class="formal">
    <!-- this has "font-size: '0.75rem'" assigned to it because that's what was specified in the "formal" config -->
    <h1 class="text-lg">Hello world!</h1>
  </body>
</html>
```

#### Expose theme variants
Define the available theme variants in the `docs/_self/schema.yml` file under the collection.

```yaml
# ...
themes:
  formal:
    label:
      en: Formal
      fr: Formel
    value: formal
  casual:
    label:
      en: Casual
      fr: Décontracté
    value: casual
```

### Approach 2: Multiple Tailwind Configurations

#### Overview

This approach involves creating separate Tailwind CSS configuration files for each theme. The configuration files are named in a specific format, such as `tailwind.formal.config.js`, where `formal` is the theme variant. The build process generates separate build for each theme.

#### Sample Configuration
```javascript
// tailwind.formal.config.js
module.exports = {
    content: [],
    theme: {
        extend: {
            fontSize: {
                lg: '0.75rem'
            },
            // ...
        }
    },
    plugins: []
};

```

#### Build Process

The build process, handled by `website-component-builder`, detects the number of Tailwind CSS configuration files in the collection. It then builds each configuration separately, appending a version number and theme variant to the output file name.

```text
dist
└── CollectionName
    ├── [version_number]_formal
    │   ├── remoteEntry.js
    │   └── other_files
    └── [version_number]_casual
        ├── remoteEntry.js
        └── other_files
```

#### Expose theme variants
Define the available theme variants in the `docs/_self/schema.yml` file under the collection.

```yaml
# ...
variants:
  formal:
    label:
      en: Formal
      fr: Formel
    value: formal
  casual:
    label:
      en: Casual
      fr: Décontracté
    value: casual
```

#### Theme Switching

Themes are switched by requesting the appropriate remote URL that corresponds to the desired theme. Each theme's outcome maintains a consistent size, but this approach may increase build time.

### Conclusion

Choose the approach that best suits your project requirements. If you prioritize build time efficiency and don't mind an increase in outcome size, using `tailwindcss-themer` might be preferable. On the other hand, if you prefer maintaining separate configurations for each theme with a consistent outcome size, the multiple Tailwind CSS configurations approach may be more suitable.
